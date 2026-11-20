const fs = require('fs/promises')
const path = require('path')
const OCRService = require(`../../services/ocr-service`)
const OpenAIService = require(`../../services/openai-service`)
const VectorService = require(`../../services/vector-service`)
const PDFService = require(`../../services/pdf-service`)
const { segmentationSchema, pdfReadingSchema } = require(`../../ia/schemas`)
const { segmentationInstructions, pdfReadingInstructions } = require(`../../ia/instructions`)

async function main() {

  try {
    const ocrService = new OCRService()
    const openAIService = new OpenAIService()
    const pdfService = new PDFService()

    const folderPath = path.join(__dirname, 'input')
    const results = []

    for await (const filePath of extractFilesFromFolder(folderPath)) {
      const relativePath = path.relative(folderPath, filePath)
      const outputFile = path.join(__dirname, 'output', 'keywords', `${relativePath}.json`)
      const result = await processFile(filePath, { ocrService, pdfService, openAIService, outputFile })

      if (!result) continue

      const elements = Array.isArray(result) ? result : [result]

      results.push(...elements.map(element => ({
        ...element,
        reference: relativePath.split(path.sep).join('/'),
        filepath: filePath,
        filename: path.basename(filePath),
        filetype: path.extname(filePath).toLowerCase()
      })))
    }

    if (results.length === 0) return

    const data = results.reduce((acc, element) => {
      const keywords = Array.isArray(element.keywords)
        ? element.keywords.join(',')
        : String(element.keywords ?? '')

      if (!keywords.trim()) return acc

      acc.ids.push(`${element.reference}#${element.id ?? 'document'}`)
      acc.documents.push(keywords)

      acc.metadatas.push({
        filepath: element.filepath,
        filename: element.filename,
        filetype: element.filetype,
        page: element.pages?.[0] ?? 1,
        text: element.text ?? ''
      })

      return acc
    }, {
      ids: [],
      documents: [],
      metadatas: []
    })

    if (data.ids.length === 0) return

    const vectorService = new VectorService({
      clientOptions: {
        host: process.env.CHROMA_HOST || '127.0.0.1',
        port: Number(process.env.CHROMA_PORT || 8000),
        ssl: process.env.CHROMA_SSL === 'true'
      }
    })

    await vectorService.getCollection('publications')
    await vectorService.addDocuments(data)

  } catch (error) {
    console.error('Error:', error.message)
  }
}

async function* extractFilesFromFolder(folderPath) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(folderPath, entry.name)

    if (entry.isDirectory()) {
      yield* extractFilesFromFolder(entryPath)
    } else if (entry.isFile()) {
      yield entryPath
    }
  }
}

async function processFile(filePath, { ocrService, pdfService, openAIService, outputFile }) {
  const { valid, extension, mimetype } = await ocrService.validFileExtension(filePath)

  if (!valid) return

  let text

  if (extension === '.pdf') {
    const tmpRoot = path.join(__dirname, 'output', 'tmp')
    await fs.mkdir(tmpRoot, { recursive: true })
    const tmpDir = await fs.mkdtemp(path.join(tmpRoot, 'pdf-'))

    try {
      const pdfPages = await pdfService.getPageCount(filePath)
      const pagesPerFile = 3

      if (pdfPages > pagesPerFile) {
        await pdfService.splitPDF({ filePath, pagesPerFile, outputDir: tmpDir })
      } else {
        await fs.copyFile(filePath, path.join(tmpDir, path.basename(filePath)))
      }

      const files = await fs.readdir(tmpDir)
      files.sort((first, second) => first.localeCompare(second, 'en', { numeric: true }))

      console.time('ocr')

      const concurrency = 10
      const blocksByPart = []

      for (let start = 0; start < files.length; start += concurrency) {
        const group = files.slice(start, start + concurrency)

        const results = await Promise.allSettled(
          group.map((filename, index) => {
            const partIndex = start + index
            const pageOffset = partIndex * pagesPerFile

            return readPdfPart({
              filePath: path.join(tmpDir, filename),
              pageOffset,
              pageCount: Math.min(
                pagesPerFile,
                pdfPages - pageOffset
              ),
              openAIService: new OpenAIService()
            })
          })
        )

        const failed = results.find(result => result.status === 'rejected')

        if (failed) {
          throw failed.reason
        }

        blocksByPart.push(...results.map(result => result.value))
      }

      const units = blocksByPart.flat().map((block, index) => ({
        ...block,
        id: `U${String(index + 1).padStart(7, '0')}`,
        source_block_id: `B${index + 1}`
      }))

      console.timeEnd('ocr')

      if (!units.length) {
        throw new Error('No OCR content was found.')
      }

      const relativePath = path.relative(path.join(__dirname, 'input'), filePath)
      const ocrOutputPath = path.join(__dirname, 'output', 'ocr', `${relativePath}.txt`)
      await fs.mkdir(path.dirname(ocrOutputPath), { recursive: true })

      await fs.writeFile(ocrOutputPath,
        units.map(unit =>
          `[${unit.id} | página ${unit.page}]\n${unit.text}`
        ).join('\n\n'),
        'utf8'
      )

      const batches = ocrService.buildBatches({ units, maxBatchCharacters: 40000 })

      const indexById = new Map(
        units.map((unit, index) => [unit.id, index])
      )

      const finalSegments = []
      const documentOrientation = ocrService.buildDocumentOrientation(units)

      console.time('openAI')
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {

        const batch = batches[batchIndex];
        const ownedUnits = units.slice(batch.startIndex, batch.endIndex)
        const previousSegment = finalSegments.at(-1)
        const previousExcerpt = previousSegment ? previousSegment.text.slice(-3500) : ''

        const input = [
          'DOCUMENT ORIENTATION:',
          documentOrientation,

          '\nPREVIOUS FINAL SEGMENT:',
          previousSegment
            ? JSON.stringify({
              title: previousSegment.title,
              keywords: previousSegment.keywords,
              last_source_id: previousSegment.end_id,
              text_end: previousExcerpt
            })
            : '(none)',

          '\nCONTEXT BEFORE TARGET:',
          ocrService.getContext({ units, startIndex: batch.startIndex, endIndex: batch.endIndex, direction: 'before', contextCharacters: 3000 }) || '(none)',

          '\nTARGET UNITS — ALL MUST BE COVERED EXACTLY ONCE:',
          ownedUnits.map(unit => ocrService.printUnit(unit)).join('\n\n'),

          '\nCONTEXT AFTER TARGET:',
          ocrService.getContext({ units, startIndex: batch.startIndex, endIndex: batch.endIndex, direction: 'after', contextCharacters: 3000 }) || '(none)'

        ].join('\n')

        let data

        for (let attempt = 1; attempt <= 3; attempt++) {

          try {
            openAIService.resetConversation()

            const response = await openAIService.createResponse({
              input,
              model: 'gpt-6-luna',
              options: {
                reasoning: {
                  effort: 'low'
                },
                max_output_tokens: 16000,
                store: false,
                instructions: segmentationInstructions,
                prompt_cache_key: 'ocr-semantic-segmentation-v1',
                text: {
                  format: {
                    type: 'json_schema',
                    name: 'semantic_document_fragments',
                    strict: true,
                    schema: segmentationSchema
                  }
                }
              }
            })

            data = JSON.parse(response.output_text)

            break

          } catch (error) {
            if (attempt === 3) {
              throw error
            }

            console.warn(`Batch ${batchIndex + 1}: retrying after ${error.message}`)
          }
        }

        const newSegments = data.segments.map(
          (segment) => ocrService.makeSegment(segment, units, indexById)
        )

        if (data.join_previous) {
          const firstSegment = newSegments.shift()
          const previous = finalSegments[finalSegments.length - 1]
          const joinedStart = indexById.get(previous.start_id)
          const joinedEnd = indexById.get(firstSegment.end_id)
          const joinedUnits = units.slice(joinedStart, joinedEnd + 1)

          previous.end_id = firstSegment.end_id
          previous.title = data.joined_title || previous.title;
          previous.keywords = data.joined_keywords;
          previous.pages = [
            ...new Set(
              joinedUnits
                .map((unit) => unit.page)
                .filter((page) => page != null)
            )
          ];

          previous.source_block_ids = [
            ...new Set(
              joinedUnits.map(
                (unit) => unit.source_block_id
              )
            )
          ];

          previous.text = ocrService.assembleText(units, joinedStart, joinedEnd)
        }

        finalSegments.push(...newSegments)
      }
      console.timeEnd('openAI')

      for (let index = 0; index < finalSegments.length; index++) {
        finalSegments[index].id = `S${String(index + 1).padStart(6, '0')}`;
      }

      await fs.mkdir(path.dirname(outputFile), { recursive: true })
      await fs.writeFile(
        outputFile,
        `${JSON.stringify(finalSegments, null, 2)}\n`,
        'utf8'
      )

      return finalSegments

    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true })
    }

  } else {

    text = await ocrService.executeOCR(vastInstanceUrl, filePath)

    if (extension !== '.pdf' && !text?.trim()) {
      const buffer = await fs.readFile(filePath)
      const response = await openAIService.analyzeImageBuffer([{ buffer, mimetype }], 'gpt-6.1-terra')
      text = response.output_text
    }

    const { output_text: keywords } = await openAIService.createResponse({
      input: `Extrae las palabras clave del siguiente texto y devuélvelas separadas por comas.\n\n${text}`,
      model: 'gpt-6-luna'
    })

    const embedding = await openAIService.generateEmbedding({ text: keywords })

    return {
      filepath: filePath,
      filename: path.basename(filePath),
      filetype: extension,
      text,
      keywords,
      modelo: 'text-embedding-3-large',
      dimensiones: embedding.length,
      embedding
    }
  }

  async function readPdfPart({ filePath, pageOffset, pageCount, openAIService }) {

    const buffer = await fs.readFile(filePath)
    openAIService.resetConversation()

    const response = await openAIService.createResponse({
      model: 'gpt-6-luna',

      input: [{
        role: 'user',
        content: [
          {
            type: 'input_file',
            filename: path.basename(filePath),
            file_data: `data:application/pdf;base64,${buffer.toString('base64')}`
          },
          {
            type: 'input_text',
            text: 'Transcribe all readable content from the PDF into ordered blocks.'
          }
        ]
      }],
      options: {
        store: false,
        max_output_tokens: 16000,
        prompt_cache_key: 'pdf-reading-v1',
        instructions: pdfReadingInstructions,
        text: {
          format: {
            type: 'json_schema',
            name: 'pdf_reading',
            strict: true,
            schema: pdfReadingSchema
          }
        }
      }
    })

    const { blocks } = JSON.parse(response.output_text)
    let previousPage = 1

    for (const block of blocks) {
      if (
        !Number.isInteger(block.page) ||
        block.page < previousPage ||
        block.page > pageCount ||
        !block.text.trim()
      ) {
        throw new Error(`Bloque PDF inválido en ${filePath}`)
      }

      previousPage = block.page
    }

    return blocks.map(block => ({
      page: pageOffset + block.page,
      source_type: block.type,
      source_level: null,
      text: block.text
    }))
  }
}

main();
