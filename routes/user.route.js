const express = require('express')
const multer = require('multer')
const UserRouter = express.Router()
const upload = multer()

const {signup,login,addMoney,getData,getFruitImage} = require('../controllers/user.controller')
const {validateAuthentication} = require('../middlewares/auth.middleware')

UserRouter.post('/signup',upload.single('profileImage'),signup)
UserRouter.post('/login',login)
UserRouter.post('/addmoney',validateAuthentication,addMoney)
UserRouter.post('/data',validateAuthentication,getData)
UserRouter.post('/fruitimage',validateAuthentication,getFruitImage)

module.exports = UserRouter