exports.create = async (req, res, next) => {
  try {
    const result = {
      response: "que tal"
    }

    res.status(200).send(result)
  } catch (err) {
    next(err)
  }
}

exports.findOne = async (req, res, next) => {
  try {
    const result = {
      response: "hakuna matata"
    }

    res.status(200).send(result)
  } catch (err) {
    next(err)
  }
}