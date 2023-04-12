const express = require('express')
const UserRouter = require('./routes/user.route')
const app = express()

app.use(express.json())

app.use('/signup',UserRouter)


app.listen(3000,()=>{
    console.log("server listening on port 3000")
})