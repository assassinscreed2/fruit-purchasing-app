const admin = require('firebase-admin')
const credentials = require('../key.json')
const mysql = require('mysql')

// database connections

admin.initializeApp({
    credential: admin.credential.cert(credentials)
})

const db = admin.firestore();

const sqlConnection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'password',
    database:'fruitshopdata'
})

sqlConnection.connect((err)=>{
    if(!err){
        console.log("connected successfuly")
    }else{
        console.log("connection failed")
    }
})


// controllers

async function signup(req,res){
    const username = req.body.username
    console.log(req.body)
    const requiredProperties = ["name", "address", "email", "phoneNumber", "category", "username", "password"]

    const allPresent = requiredProperties.every((property) => property in req.body)
    
    if(!allPresent){
        return res.json({message:'enter all required fields ["name", "address", "email", "phoneNumber", "category", "username", "password"]'})
    }

    sqlConnection.query(`select count(*) as count from userdata where username = ?`,[username],(err,row,field)=>{
        if(!err){
            let count = row[0].count
            if(count !== 0){
                return res.json({message: "user with this username already exist"})
            }
            }
        else{
            console.log(err)
        }
    })

    sqlConnection.query(`insert into userdata set ?`, req.body, (err,row,field)=>{
        if(!err){
            return res.json({row:row})
        }else{
            console.log(err)
            return res.send(err)
        }
    })
}

module.exports = {signup}