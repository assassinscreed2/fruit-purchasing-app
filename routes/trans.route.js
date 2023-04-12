const express = require('express')
const TransRouter = express.Router()

const {sellFruits} = require('../controllers/trans.controller')
const {validateAuthentication} = require('../middlewares/auth.middleware')

TransRouter.post('/sell',validateAuthentication,sellFruits)

module.exports = TransRouter