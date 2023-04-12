const express = require('express')
const UserRouter = express.Router()

const {signup,login,addMoney} = require('../controllers/user.controller')
const {validateAuthentication} = require('../middlewares/auth.middleware')

UserRouter.post('/signup',signup)
UserRouter.post('/login',login)
UserRouter.post('/addmoney',validateAuthentication,addMoney)

module.exports = UserRouter