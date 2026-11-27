const { MongoClient, ObjectId } = require('mongodb')
const OpenAIService = require('../../services/openai-service')

exports.findAll = async (req, res, next) => {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    const conversaciones = await client
      .db(process.env.MONGODB_DB)
      .collection('conversations')
      .find({}, { projection: { _id: 1, titulo: 1 } })
      .sort({ updatedAt: -1 })
      .toArray()

    res.json(conversaciones.map(chat => ({
      id: chat._id.toString(),
      titulo: chat.titulo || 'Nueva conversación'
    })))
  } finally {
    await client.close()
  }
}

exports.findById = async (req, res) => {
  const { id } = req.params
  if (!ObjectId.isValid(id)) return res.sendStatus(400)

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    const chat = await client
      .db(process.env.MONGODB_DB)
      .collection('conversations')
      .findOne({ _id: new ObjectId(id) })

    if (!chat) return res.sendStatus(404)

    const turnos = chat.messages ?? []
    const mensajes = turnos.flatMap(turno => {
      const texto = turno.output_text || (turno.output ?? [])
        .flatMap(item => item.content ?? [])
        .filter(item => item.type === 'output_text')
        .map(item => item.text)
        .join('\n')

      let respuesta = texto
      try {
        respuesta = JSON.parse(texto)?.answer ?? texto
      } catch {
        // Si la respuesta estaba guardada como texto, usamos ese texto.
      }

      return [
        { rol: 'usuario', texto: turno.userQuery },
        { rol: 'asistente', texto: respuesta }
      ]
    }).filter(mensaje => typeof mensaje.texto === 'string' && mensaje.texto)

    res.json({
      id: chat._id.toString(),
      titulo: chat.titulo || 'Nueva conversación',
      responseId: turnos.at(-1)?.id ?? null,
      mensajes
    })
  } finally {
    await client.close()
  }
}

exports.generateTitle = async (req, res, next) => {
  const userQuery = req.body?.userQuery
  if (typeof userQuery !== 'string' || !userQuery.trim()) {
    return res.status(400).json({ error: 'Escribe un mensaje.' })
  }

  try {
    const service = new OpenAIService()
    const response = await service.createResponse({
      model: 'gpt-6-luna',
      input: userQuery.trim(),
      options: {
        instructions: 'Resume el tema del primer mensaje en un título de hasta 6 palabras. Devuelve únicamente el título, en el mismo idioma del mensaje.',
        store: false
      }
    })

    res.json({ titulo: response.output_text.trim() || 'Nueva conversación' })
  } catch (error) {
    next(error)
  }
}

async function modificarConversacion(req, res, operacion) {
  const { id } = req.params
  if (!ObjectId.isValid(id)) return res.sendStatus(400)

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    const coleccion = client
      .db(process.env.MONGODB_DB)
      .collection('conversations')

    const encontrada = await operacion(coleccion, new ObjectId(id))
    return res.status(encontrada ? 204 : 404).end()
  } finally {
    await client.close()
  }
}

exports.rename = (req, res) => {
  const titulo = req.body?.titulo

  if (typeof titulo !== 'string' || !titulo.trim()) {
    return res.status(400).json({ error: 'Escribe un título.' })
  }

  return modificarConversacion(req, res, async (coleccion, id) => {
    const result = await coleccion.updateOne(
      { _id: id },
      { $set: { titulo: titulo.trim() } }
    )

    return result.matchedCount > 0
  })
}

exports.remove = (req, res) => {
  return modificarConversacion(req, res, async (coleccion, id) => {
    const result = await coleccion.deleteOne({ _id: id })
    return result.deletedCount > 0
  })
}