const express = require('express')
const TransRouter = express.Router()
const multer = require('multer')
const upload = multer()

const {sellFruits,buyFruit} = require('../controllers/trans.controller')
const {validateAuthentication} = require('../middlewares/auth.middleware')

TransRouter.post('/sell',upload.single('fruitImage'),validateAuthentication,sellFruits)
TransRouter.post('/buy',validateAuthentication,buyFruit)

module.exports = TransRouter