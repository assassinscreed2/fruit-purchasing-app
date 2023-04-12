const express = require('express')
const UserRouter = express.Router()
const {signup} = require('../controllers/user.controller')

UserRouter.post('',signup)

module.exports = UserRouter