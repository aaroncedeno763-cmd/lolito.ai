const express = require('express')
const router = express.Router()
const controller = require('../../controllers/worker/conversation-controller.js')

router.get('/', controller.findAll)
router.get('/:id', controller.findById)
router.post('/title', controller.generateTitle)

module.exports = router