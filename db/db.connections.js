const admin = require('firebase-admin')
const credentials = require('../key.json')
const mysql = require('mysql')

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

module.exports = {admin,db,sqlConnection}