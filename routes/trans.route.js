const express = require('express')
const TransRouter = express.Router()

const {sellFruits,buyFruit} = require('../controllers/trans.controller')
const {validateAuthentication} = require('../middlewares/auth.middleware')

TransRouter.post('/sell',validateAuthentication,sellFruits)
TransRouter.post('/buy',validateAuthentication,buyFruit)

module.exports = TransRouter