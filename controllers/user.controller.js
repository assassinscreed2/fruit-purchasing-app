const {admin,db,sqlConnection} = require('../db/db.connections')
const jwt = require('jsonwebtoken')
const {hashSync,compareSync} = require('bcrypt')

// database connections

// util functions

function allPresent(requiredProperties,givenProperties){
    return requiredProperties.every((property) => property in givenProperties)
}


// controllers

async function signup(req,res){
    const username = req.body.username
    console.log(req.body)
    
    if(!allPresent(["name", "address", "email", "phoneNumber", "category", "username", "password"],req.body)){
        return res.json({message:'enter all required fields ["name", "address", "email", "phoneNumber", "category", "username", "password"]'})
    }

    sqlConnection.query(`select count(*) as count from userdata where username = ?`,[username],(err,row,field)=>{
        if(!err){
            let count = row[0].count
            if(count !== 0){
                return res.json({message: "user with this username already exist"})
            }else{
                const newpassword = hashSync(req.body.password,10)
                sqlConnection.query(`insert into userdata set ?`, {...req.body,password:newpassword}, (err,row,field)=>{
                    if(!err){
                        return res.json({row:row})
                    }else{
                        console.log(err)
                        return res.send(err)
                    }
                })
            }
            }
        else{
            console.log(err)
            return res.send(err)
        }
    })
}

async function login(req,res){

    if(!allPresent(["username", "password"],req.body)){
        return res.json({message:'enter all required fields ["username", "password"]'})
    }

    const username = req.body.username
    sqlConnection.query(`select username,password from userdata where username = ?`,[username],(err,row,field)=>{
        if(!err){
                console.log(row)
                if(row.length !== 0){
                    const password = row[0].password
                    sqlConnection.query('insert into logindata set ?',{username},(err,row,field)=>{

                        if(!compareSync(req.body.password,password)){
                            return res.json({message:"Incorrect Password"})
                        }
    
                        const secret = "@123%abcd123"
                        const token = jwt.sign({username:username},secret)
                        return res.json({message:"Logged In successfully",token:token})
                    })
                }else{
                    return res.json({message:"no user exists"})
                }
            }
        else{
            console.log(err)
            return res.send(err)
        }
    })
}

async function addMoney(req,res){
    const usernamme = req.user;

    if(!allPresent(["wallet"],req.body)){
        return res.json({message:'enter all required fields ["wallet"]'})
    }

    console.log(usernamme)
    const wallet = req.body.wallet;

    sqlConnection.query('select category,wallet from userdata where username = ?',[username],(err,row,field)=>{
        if(!err){
            const category = row[0].category
            if(category === "both" || category === "buyer"){
                sqlConnection.query('update userdata set wallet = wallet+? where username = ?',[wallet,usernamme.username],async (err,row,field)=>{
                    if(!err){
                        const transaction = {
                            timestamp: admin.firestore.FieldValue.serverTimestamp(),
                            type: "deposite",
                            amount: wallet
                        }
            
                        await db.collection("transactions").add(transaction)
            
                        res.json({message:"Money added successfully"})
                    }else{
                        console.log(err)
                        res.json({error:err})
                    }
                })
            }else{
                return res.json({message:"you are not a buyer"})
            }
        }else{
            console.log(err)
            res.json({error:err})
        }
    })

    
}

module.exports = {signup,login,addMoney}