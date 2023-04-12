const express = require('express')
const UserRouter = express.Router()
const {signup} = require('../controllers/user.controller')

UserRouter.get('',signup)

module.exports = UserRouter