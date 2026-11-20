const { PDFDocument } = require('pdf-lib')
const { readFile, writeFile } = require('node:fs/promises')
const path = require('path')

module.exports = class PDFService {

  async splitPDF({ filePath, pagesPerFile, outputDir = path.join(__dirname, '..', 'output', 'tmp') }) {
    const originalName = path.parse(filePath).name
    const original = await PDFDocument.load(await readFile(filePath))
    const totalPages = original.getPageCount()

    for (let start = 0; start < totalPages; start += pagesPerFile) {

      const end = Math.min(start + pagesPerFile, totalPages)
      const newPDF = await PDFDocument.create()

      const index = Array.from(
        { length: end - start },
        (_, i) => start + i
      );

      const pages = await newPDF.copyPages(original, index);
      pages.forEach((page) => newPDF.addPage(page))
      const number = String(start / pagesPerFile + 1).padStart(2, '0')
      
      await writeFile(
        path.join(outputDir, `${originalName}-${number}.pdf`),
        await newPDF.save()
      )
    }
  }

  async getPageCount(filePath){
    const original = await PDFDocument.load(await readFile(filePath))
    const totalPages = original.getPageCount()

    return totalPages
  }
}
