const path = require('path')
const fs = require('fs/promises')

module.exports = class OCRService {

  async executeOCR(url, filePath) {
    const { mimetype } = await this.validFileExtension(filePath)
    const buffer = await fs.readFile(filePath)  
    const form = new FormData()
  
    form.append(
      'file',
      new Blob([buffer], { type: mimetype }),
      path.basename(filePath)
    )
  
    form.append('dpi', '200')
    form.append('crop_mode', 'true')
    form.append('tokens_per_page', '4000')
      
    const response = await fetch(`${url}/ocr`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OCR_API_KEY}`
      },
      body: form,
      signal: AbortSignal.timeout(900000)
    })
  
    if (!response.ok) {
      throw new Error(
        `OCR HTTP ${response.status}: ${await response.text()}`
      )
    }
  
    const result = await response.json()
    return result.text
  }

  async validFileExtension(filePath){
   const types = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    }
  
    const extension = path.extname(filePath).toLowerCase()
    const mimetype = types[extension]
  
    return { valid: Boolean(mimetype), extension, mimetype }
  }

  parseSourceUnits(rawText) {
    const markerPattern = /<PAGE>|<BLOCK>([^\[]+)\[[^\]]*\]<FORK>/g
    const markers = [...rawText.matchAll(markerPattern)]

    if (!markers.some(marker => marker[0].startsWith('<BLOCK>'))) {
      throw new Error('El documento no contiene bloques de Unlimited OCR')
    }

    const units = []
    let currentPage = 0
    let blockCounter = 0

    for (let index = 0; index < markers.length; index++) {
      const marker = markers[index]

      if (marker[0] === '<PAGE>') {
        currentPage++
        continue
      }

      blockCounter++

      const blockEnd = marker.index + marker[0].length
      const nextStart = markers[index + 1]?.index ?? rawText.length
      const text = rawText.slice(blockEnd, nextStart).trim()

      if (!text) continue

      const rawType = marker[1] || 'text'
      const sourceType = rawType.replace(/<LEVEL\d+>/g, '').trim()
      const sourceLevel = rawType.match(/<LEVEL(\d+)>/)?.[1]

      units.push({
        id: `U${String(units.length + 1).padStart(7, '0')}`,
        page: currentPage || 1,
        source_type: sourceType,
        source_level: sourceLevel ? Number(sourceLevel) : null,
        source_block_id: `B${blockCounter}`,
        text
      })
    }

    return units
  }

  buildBatches({units, maxBatchCharacters}) {

    const batches = []
    let startIndex = 0

    while (startIndex < units.length) {
      let endIndex = startIndex
      let totalCharacters = 0

      while (endIndex < units.length) {

        const nextLength = units[endIndex].text.length + 100

        if (endIndex > startIndex && totalCharacters + nextLength > maxBatchCharacters) {
          break
        }

        totalCharacters += nextLength
        endIndex++
      }

      batches.push({
        startIndex,
        endIndex
      });

      startIndex = endIndex;
    }

    return batches;
  }

  buildDocumentOrientation(units) {

    const indexes = new Set()
    const frontCount = Math.min(12, units.length)

    for (let index = 0; index < frontCount; index ++) {
      indexes.add(index);
    }

    const sampleCount = Math.min(18, units.length);

    for (let sample = 0; sample < sampleCount; sample ++) {
      const index = Math.floor(sample * (units.length - 1) / Math.max(1, sampleCount - 1))
      indexes.add(index)
    }

    for (let index = Math.max(0, units.length - 5); index < units.length; index ++) {
      indexes.add(index);
    }

    return [...indexes]
      .sort((left, right) => left - right)
      .map((index) => this.printUnit(units[index]))
      .join('\n\n')
      .slice(0, 9000);
  }

  getContext({units, startIndex, endIndex, direction, contextCharacters}) {

    const selected = [];

    let used = 0;
    let cursor = direction === 'before' ? startIndex - 1 : endIndex;

    while (cursor >= 0 && cursor < units.length) {
      const unit = units[cursor];

      if (used + unit.text.length > contextCharacters) {
        break;
      }

      selected.push(unit);
      used += unit.text.length;

      cursor += direction === 'before' ? -1 : 1;
    }

    if (direction === 'before') {
      selected.reverse();
    }

    return selected.map(this.printUnit).join('\n\n');
  }

  printUnit(unit) {
    const page = unit.page ?? '?'

    return (`[${unit.id} | page=${page} | type=${unit.source_type}]\n` + unit.text)
  }

  assembleText(units, startIndex, endIndex) {
    return units
      .slice(startIndex, endIndex + 1)
      .map((unit) => unit.text)
      .join('\n');
  }

  validateCoverage(segments, batch, units, indexById) {

    let expectedIndex = batch.startIndex;

    for (const segment of segments) {

      const startIndex = indexById.get(segment.start_id)
      const endIndex = indexById.get(segment.end_id)

      if (startIndex === undefined || endIndex === undefined) {
        throw new Error('The model referenced an unknown source unit ID.')
      }

      if (startIndex !== expectedIndex || endIndex < startIndex || endIndex >= batch.endIndex) {
        throw new Error(`Non-contiguous range: ${segment.start_id}–${segment.end_id}.`)
      }

      expectedIndex = endIndex + 1;
    }

    if (expectedIndex !== batch.endIndex) {
      throw new Error(`Incomplete batch coverage at source unit ${units[expectedIndex]?.id}.`)
    }
  }

  makeSegment(segmentData, units, indexById) {

    const startIndex = indexById.get(segmentData.start_id)
    const endIndex = indexById.get(segmentData.end_id)
    const segmentUnits = units.slice(startIndex, endIndex + 1)

    return {
      id: '',
      start_id: segmentData.start_id,
      end_id: segmentData.end_id,
      title: segmentData.title,
      category: segmentData.category,
      keywords: segmentData.keywords,
      pages: [
        ...new Set(
          segmentUnits
            .map((unit) => unit.page)
            .filter((page) => page != null)
        )
      ],
      source_block_ids: [
        ...new Set(
          segmentUnits.map(
            (unit) => unit.source_block_id
          )
        )
      ],
      text: this.assembleText(units, startIndex, endIndex)
    }
  }
}
