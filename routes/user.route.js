const express = require('express')
const UserRouter = express.Router()

const {signup,login,addMoney,getData} = require('../controllers/user.controller')
const {validateAuthentication} = require('../middlewares/auth.middleware')

UserRouter.post('/signup',signup)
UserRouter.post('/login',login)
UserRouter.post('/addmoney',validateAuthentication,addMoney)
UserRouter.get('/data',validateAuthentication,getData)

module.exports = UserRouter