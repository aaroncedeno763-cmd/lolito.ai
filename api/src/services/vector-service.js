const { AdminClient, ChromaClient } = require('chromadb')
const { OpenAIEmbeddingFunction } = require('@chroma-core/openai')

module.exports = class VectorService {
  constructor ({
    apiKey = process.env.OPENAI_API_KEY,
    modelName = 'text-embedding-3-large',
    clientOptions = {}
  }) {
    if (!apiKey) {
      throw new Error('VectorService: apiKey de OpenAI no definida')
    }

    this.collectionName = null
    this.collection = null
    
    this.clientOptions = clientOptions
    this.client = new ChromaClient(clientOptions)

    this.embeddingFunction = new OpenAIEmbeddingFunction({
      apiKey,
      modelName
    })

  }

  async getCollection (collectionName) {
    if (collectionName === undefined && this.collection) return this.collection

    this.collection = this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embeddingFunction,
    }).catch(error => {
      this.collection = null
      throw error
    })

    return this.collection
  }

  async ensureDatabase () {
    const { database: name, tenant = 'default_tenant', ...options } = this.clientOptions
    const admin = new AdminClient(options)
    try {
      await admin.getDatabase({ name, tenant })
    } catch (error) {
      if (error.name !== 'ChromaNotFoundError' && error.status !== 404) throw error
      await admin.createDatabase({ name, tenant })
    }
  }

  async getByIds (ids) {
    const collection = await this.getCollection()
    return collection.get({ ids, include: ['metadatas'] })
  }

  async addDocuments ({ ids, documents, metadatas = [], upsert = false }) {
    if (!Array.isArray(ids) || !Array.isArray(documents)) {
      throw new Error('VectorService.addDocuments: ids y documents deben ser arrays')
    }

    if (ids.length !== documents.length) {
      throw new Error('VectorService.addDocuments: ids y documents deben tener la misma longitud')
    }

    if (metadatas.length && metadatas.length !== ids.length) {
      throw new Error('VectorService.addDocuments: metadatas debe tener la misma longitud que ids/documents')
    }

    const collection = await this.getCollection()

    await collection[upsert ? 'upsert' : 'add']({
      ids,
      documents,
      metadatas: metadatas.length ? metadatas : undefined,
    })
  }

  async query ({ queryTexts, nResults = 5, where, whereDocument }) {
    if (!Array.isArray(queryTexts) || !queryTexts.length) {
      throw new Error('VectorService.query: queryTexts debe ser un array no vacío')
    }

    const collection = await this.getCollection()

    const result = await collection.query({
      queryTexts,
      nResults,
      where,
      whereDocument,
    })

    return result
  }

  async delete ({ ids, where, whereDocument } = {}) {
    const collection = await this.getCollection()
    await collection.delete({
      ids,
      where,
      whereDocument,
    })
  }

  async resetCollection () {
    await this.client.deleteCollection({ name: this.collectionName })

    this.collection = this.client.getOrCreateCollection({
      name: this.collectionName,
      embeddingFunction: this.embeddingFunction,
    })
  }
}
