const express = require('express')
const router = express.Router()
const controller = require('../../controllers/worker/chat-controller.js')

router.post('/', controller.create)
router.get('/', controller.findAll)

module.exports = router