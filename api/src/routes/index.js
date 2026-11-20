const express = require('express')
const router = express.Router()

router.use('/worker/conversations', require('./worker/conversations'))
router.use('/worker/messages', require('./worker/messages'))
router.use('/worker/users', require('./worker/users'))

module.exports = router