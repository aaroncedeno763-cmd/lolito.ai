const fs = require('fs/promises')
const path = require('path')
const MongodbService = require(`${global.__basedir}/src/services/mongodb-service`)
const VectorService = require(`${global.__basedir}/src/services/vector-service`)
const OpenAIService = require(`${global.__basedir}/src/services/openai-service`)
const { answerGenerationSchema } = require(`${global.__basedir}/src/ia/schemas`)
const { answerGenerationWithPdfsInstructions } = require(`${global.__basedir}/src/ia/instructions`)

exports.create = async (req, res, next) => {
  try {

    const userQuery = req.body.userQuery
    const responseId = req.body.responseId
    const conversationId = req.body.conversationId

    const vectorService = new VectorService({
      clientOptions: {
        host: process.env.CHROMA_HOST || '127.0.0.1',
        port: Number(process.env.CHROMA_PORT || 8000),
        ssl: process.env.CHROMA_SSL === 'true'
      }
    })

    await vectorService.getCollection('publications')
    const result = await vectorService.query({ queryTexts: [userQuery], nResults: 10 })

    const candidatesByPath = new Map()

    for (const [queryIndex, metadatas] of (result.metadatas ?? []).entries()) {
      for (const [matchIndex, metadata] of (metadatas ?? []).entries()) {
        if (!metadata?.filepath) continue

        const filepath = path.resolve(metadata.filepath)

        if (path.extname(filepath).toLowerCase() !== '.pdf') continue

        if (!candidatesByPath.has(filepath)) {
          candidatesByPath.set(filepath, {
            id: `PDF${candidatesByPath.size + 1}`,
            filepath,
            filename: path.basename(filepath),
            matches: []
          })
        }

        candidatesByPath.get(filepath).matches.push({
          id: result.ids?.[queryIndex]?.[matchIndex] ?? null,
          page: metadata.page ?? null,
          keywords: result.documents?.[queryIndex]?.[matchIndex] ?? null,
          distance: result.distances?.[queryIndex]?.[matchIndex] ?? null
        })
      }
    }

    const candidates = [...candidatesByPath.values()]

    if (!candidates.length) {
      res.status(200).send('No se encontraron PDF candidatos.')
      return
    }

    const stats = await Promise.all(
      candidates.map(candidate => fs.stat(candidate.filepath))
    )

    const maxBytes = 50_000_000
    const totalBytes = stats.reduce((sum, stat) => sum + stat.size, 0)

    if (
      stats.some(stat => stat.size >= maxBytes) ||
      totalBytes >= maxBytes
    ) {
      throw new Error(
        'Los PDF candidatos superan el límite de archivos de una petición. ' +
        'Es necesario procesarlos en grupos.'
      )
    }

    const attachments = await Promise.all(
      candidates.map(async candidate => {
        const buffer = await fs.readFile(candidate.filepath)

        return {
          type: 'input_file',
          filename: `${candidate.id}-${candidate.filename}`,
          file_data: `data:application/pdf;base64,${buffer.toString('base64')}`
        }
      })
    )

    const input = [{
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: JSON.stringify({
            question: userQuery,
            candidates: candidates.map(candidate => ({
              id: candidate.id,
              filename: candidate.filename,
              attachment: `${candidate.id}-${candidate.filename}`,
              matches: candidate.matches
            }))
          })
        },
        ...attachments
      ]
    }]

    const openAIService = new OpenAIService()

    if (responseId) {
      openAIService.setResponseId(responseId)
    }

    const response = await openAIService.createResponse({
      input,
      model: 'gpt-6-luna',
      options: {
        reasoning: {
          effort: 'low'
        },
        store: true,
        instructions: answerGenerationWithPdfsInstructions,
        prompt_cache_key: 'answer-generation-v1',
        text: {
          format: {
            type: 'json_schema',
            name: 'answer-generation',
            strict: true,
            schema: answerGenerationSchema
          }
        }
      }
    })

    const usage = {
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0
    }


    const mongodbService = new MongodbService({
      uri: process.env.MONGODB_URI,
      dbName: process.env.MONGODB_DB
    })

    let currentConversationId = null

    if (conversationId) {

      currentConversationId = mongodbService.createId(conversationId)

      const result = await mongodbService.updateOne('conversations', {
        _id: currentConversationId
      }, {
        $push: { messages: { ...response, userQuery } },
        $set: { updatedAt: new Date() },
        $inc: {
          'usage.inputTokens': usage.inputTokens,
          'usage.outputTokens': usage.outputTokens,
          'usage.totalTokens': usage.totalTokens
        }
      })

      if (!result.matchedCount) {
        throw new Error('Conversation not found')
      }

    } else {

      const conversation = await mongodbService.insertOne('conversations', {
        messages: [{ ...response, userQuery }],
        createdAt: new Date(),
        updatedAt: new Date()
      })

      currentConversationId = conversation.insertedId
    }

    const data = {
      ...JSON.parse(response.output_text),
      responseId: response.id,
      conversationId: currentConversationId.toString(),
      usage
    }

    res.status(200).send(data)
  } catch (err) {
    next(err)
  }
}