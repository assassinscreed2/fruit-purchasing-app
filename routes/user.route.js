const express = require('express')
const UserRouter = express.Router()
const {signup,login} = require('../controllers/user.controller')

UserRouter.post('/signup',signup)
UserRouter.post('/login',login)

module.exports = UserRouter