const express = require('express')
const UserRouter = require('./routes/user.route')
const TransRouter = require('./routes/trans.route')
const app = express()

app.use(express.json())

app.use('/user',UserRouter)
app.use('/trans',TransRouter)


app.listen(3000,()=>{
    console.log("server listening on port 3000")
})