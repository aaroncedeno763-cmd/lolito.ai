const express = require('express')
const router = express.Router()
const controller = require('../../controllers/worker/user-controller.js')

router.post('/', controller.create)
router.get('/', controller.findOne)

module.exports = router