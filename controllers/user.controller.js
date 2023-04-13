const {admin,db,sqlConnection} = require('../db/db.connections')
const jwt = require('jsonwebtoken')
const {hashSync,compareSync} = require('bcrypt')

// database connections

// util functions

function allPresent(requiredProperties,givenProperties){
    return requiredProperties.every((property) => property in givenProperties)
}

function getTotalUsers(){
    return new Promise((resolve,reject)=>{
        sqlConnection.query('select count(*) as count from userdata',(err,row,field)=>{
            if(!err){
                const count = row[0].count
                resolve({totalusers:count})
            }else{
                console.log(err)
                reject(err)
            }
        })
    })
}

function getTotalSellers(){
    return new Promise((resolve,reject)=>{
        sqlConnection.query('select count(*) as count from userdata where category = "seller" or category = "both"',(err,row,field)=>{
            if(!err){
                const count = row[0].count
                resolve({totalsellers:count})
            }else{
                console.log(err)
                reject({error:err})
            }
        })
    })
}

function getTotalBuyer(req,res){
    return new Promise((resolve,reject)=>{
        sqlConnection.query('select count(*) as count from userdata where category = "buyer"',(err,row,field)=>{
            if(!err){
                const count = row[0].count
                resolve({totalbuyers:count})
            }else{
                console.log(err)
                reject({error:err})
            }
        })
    })
}

function notLoggedAferSignup(req,res){
    return new Promise((resolve,reject)=>{
        sqlConnection.query('select count(*) as count from userdata where username not in (select username from logindata)',(err,row,field)=>{
            if(!err){
                const count = row[0].count
                resolve({notloggedaftersignup:count})
            }else{
                console.log(err)
                reject({error:err})
            }
        })
    })
}

async function mostSoldFruit(){
        return db.collection('sellingdata').get().then((querySnapshot) => {
            if (!querySnapshot.empty) {
    
              const allFruitsData = []
    
              querySnapshot.forEach((doc) => {
                const data = doc.data(); 
                allFruitsData.push(data)
              });
    
              let fruit_totals = {}
    
                for(let fruit of allFruitsData){
                    const fruitName = fruit.fruit
                    const quantity = fruit.quantity
    
                    console.log(fruitName+" "+quantity)
                    if(fruitName in fruit_totals){
                        fruit_totals[fruitName] = fruit_totals[fruitName]+quantity
                    }else{
                        fruit_totals[fruitName] = quantity
                    }
                }
    
                let maxFruit = "";
                let maxQuantity = 0;
    
                for (const fruit in fruit_totals) {
                    if (fruit_totals[fruit] > maxQuantity) {
                        maxQuantity = fruit_totals[fruit];
                        maxFruit = fruit;
                    }
                }
    
                return {fruit: maxFruit};
                } else {
                    return {message:'No data found'}
                }
            }).catch(e => {
                console.log(e)
                return {error:e}
            })
    
}

async function getAllFruitData(){
    return 
}

async function unsoldFruit(){
        return db.collection('sellingdata').get().then(async (querySnapshot) => {
            if (!querySnapshot.empty) {

            const allFruitsData = []

            querySnapshot.forEach((doc) => {
                const data = doc.data(); 
                allFruitsData.push(data)
            });

            let fruits = new Set()

            for(let fruit of allFruitsData){
                const fruitName = fruit.fruit

                if(!fruits.has(fruitName)){
                    fruits.add(fruitName)
                }
            }

            const unsold = await new Promise((resolve,reject)=>{
                sqlConnection.query('select name from fruitdata',(err,row,field)=>{
                    if(!err){
                        let fruitdata = [...row]
                        let unsoldArray = []
                        for(let fruit of fruitdata){
                            if(!fruits.has(fruit.name)){
                                unsoldArray.push(fruit.name)
                            }
                        }
        
                        resolve({unsold: unsoldArray})
                    }else{
                        reject({error:err})
                    }
                })
            })

            return unsold
            
            } else {
                return {message:'No data found'}
            }
        }).catch(e => {
            console.log(e)
            return {error:e}
        })

}

function userFruitSellers(username){
    return (new Promise((resolve,reject)=>{
        sqlConnection.query('select * from fruitdata where username = ?',[username],(err,row,field)=>{
            if(!err){
                if(row.length !== 0){
                    resolve(row)
                }else{
                    reject({message:"no fruits"})
                }
            }else{
                console.log(err)
                reject({error:err})
            }
        })
    })).then((res)=>{
        const arr = [...res]
        let fruitnames = []
        for(let fruit of arr){
            fruitnames.push(fruit.name)
        }
        return {fruits: fruitnames}
    }).catch(e=>{return {error:e}})
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

async function getData(req,res){

    // Number of total users
    //const result = await mostSoldFruit()
    // const result1 = await userFruitSellers("basanti")
    const result1 = await unsoldFruit()
    res.json(result1)
}


module.exports = {signup,login,addMoney, getData}