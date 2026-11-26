const OpenAIService = require('../../services/openai-service')

exports.findAll = async (req, res, next) => {
  try {
    const result = {
      response: "hola"
    }

    res.status(200).send(result)
  } catch (err) {
    next(err)
  }
}

exports.findById = async (req, res, next) => {
  try {
    const result = {
      response: "hola"
    }

    res.status(200).send(result)
  } catch (err) {
    next(err)
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