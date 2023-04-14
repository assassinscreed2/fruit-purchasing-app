const {admin,db,sqlConnection} = require('../db/db.connections')
const jwt = require('jsonwebtoken')
const {hashSync,compareSync} = require('bcrypt')
const axios = require('axios')
const {
    getTotalUsers,
    getTotalSellers,
    getTotalBuyer,
    notLoggedAferSignup,
    mostSoldFruit,
    unsoldFruit,
    userFruitSellers,
    soldOnBetweenDate,
    signedLastWeek,
    loggedInLastWeek,
    uploadImage,
    getFruitImageUrl} = require('../controllers/utilfunctions')

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
        return res.json({message:'enter all required fields ["name", "address", "email","profileImage" , "phoneNumber", "category", "username", "password"]'})
    }

    if(!allPresent(["buffer"],req.file)){
        return res.json({message:"upload correct image"})
    }

    sqlConnection.query(`select count(*) as count from userdata where username = ?`,[username],async (err,row,field)=>{
        if(!err){
            let count = row[0].count
            if(count !== 0){
                return res.json({message: "user with this username already exist"})
            }else{
                uploadImage(req.file.buffer).then((imageData)=>{
                    const newpassword = hashSync(req.body.password,10)
                    const currentTimestamp = new Date(Date.now())
                    console.log(currentTimestamp)
                    sqlConnection.query(`insert into userdata set ?`, {...req.body,password:newpassword,created:currentTimestamp,profileImage:imageData.url}, (err,row,field)=>{
                        if(!err){
                            return res.json({row:row})
                        }else{
                            console.log(err)
                            return res.send(err)
                        }
                    })
                }).catch(e => {
                    console.log(e)
                    return res.json({error:e})
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
                    const currentTimestamp = new Date(Date.now())
                    sqlConnection.query('insert into logindata set ?',{username,logindate:currentTimestamp},(err,row,field)=>{

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
    const username = req.user.username;

    if(!allPresent(["wallet"],req.body)){
        return res.json({message:'enter all required fields ["wallet"]'})
    }

    const wallet = req.body.wallet;

    sqlConnection.query('select category,wallet from userdata where username = ?',[username],(err,row,field)=>{
        if(!err){
            const category = row[0].category
            if(category === "both" || category === "buyer"){
                sqlConnection.query('update userdata set wallet = wallet+? where username = ?',[wallet,username],async (err,row,field)=>{
                    if(!err){
                        const transaction = {
                            timestamp: new Date(Date.now()),
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

async function getFruitImage(req,res){

    if(!allPresent(["name","seller"],req.body)){
        return res.json({message:'enter all required fields ["name","seller"]'})
    }

    getFruitImageUrl(req.body.name,req.body.seller).then((result)=>{
        if(result.message === "not found"){
            return res.json(result)
        }else{
            const url = result.imageUrl
            axios.get(url,{responseType:'arraybuffer'}).then(response => {
                res.setHeader('Content-Type', 'image/jpeg');
                res.send(response.data);
            })
        }
    }).catch(e => res.json({error: e}))
}

async function getData(req,res){
    try{
        const totalusers = await getTotalUsers()
        const totalsellers = await getTotalSellers()
        const totalbuyer = await getTotalBuyer()
        const notLafterS = await notLoggedAferSignup()
        const mostsold = await mostSoldFruit()
        const unsold = await unsoldFruit()
        const sellersFruit = await userFruitSellers(req.user.username)
        const signedlastweek = await signedLastWeek()
        const loggedlastweek = await loggedInLastWeek()
        const soldOnBetween = await soldOnBetweenDate(req.body.startTime,req.body.endTime?req.body.endTime:undefined)
        res.json({totalusers,totalbuyer,totalsellers,notLafterS,mostsold,unsold,
            sellersFruit,soldOnBetween,loggedlastweek,signedlastweek})
    }catch(e){
        res.json({error:e})
    }
}


module.exports = {signup,login,addMoney, getData,getFruitImage}