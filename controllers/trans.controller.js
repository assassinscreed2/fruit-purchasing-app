const {admin,db,sqlConnection} = require('../db/db.connections')
// database connections

// util functions

function allPresent(requiredProperties,givenProperties){
    return requiredProperties.every((property) => property in givenProperties)
}

// controllers

async function sellFruits(req,res){
    console.log(req.body)
    if(!allPresent(["name","quantity","rate","expireDate"],req.body)){
        return res.json({message:'enter all required fields ["name","quantity","rate","expireDate"]'})
    }

    const username = req.user.username
    const name = req.body.name
    
    sqlConnection.query('select category from userdata where username = ?',[username],(err,row,field) =>{
        if(!err){
            const category = row[0].category
            if(category === "both" || category === "seller"){
                sqlConnection.query('select name from fruitdata where name = ?',[name],(err,row,field)=>{
                    if(!err){
                        if(row.length !== 0){
                            sqlConnection.query('update fruitdata set quantity = quantity+?,rate = ?,expireDate = ?',[req.body.quantity,req.body.rate,req.body.expireDate],(err,row,field)=>{
                                if(!err){
                                    return res.json({message:"fruits data updated"})
                                }
                            })
                        }else{
                            sqlConnection.query('insert into fruitdata set ?',{...req.body,username:username},(err,row,field)=>{
                                if(!err){
                                    return res.json({message:"fruits data inserted"})
                                }else{
                                    console.log(err)
                                    res.json({error:err})
                                }
                            })
                        }
                    }else{
                        console.log(err)
                        res.json({error:err})
                    }
                })
            }else{
                res.json({message:"You are not a seller"})
            }
        }
    })

    
}


async function buyFruit(req,res){

    const username = req.user.username;

    if(!allPresent(["name","quantity"],req.body)){
        return res.json({message:'enter all required fields ["name","quantity"]'})
    }

    sqlConnection.query('select category,wallet from userdata where username = ?',[username],(err,row,field)=>{
        if(!err){
            
            const category = row[0].category
            const wallet = row[0].wallet

            if(category === "both" || category === "buyer"){
                sqlConnection.query('select quantity,rate from fruitdata where name = ?',[req.body.name],(err,row,field)=>{
                    if(!err){
                        if(row.length !== 0){
                            const quantity = row[0].quantity
                            const rate = row[0].rate

                            if(quantity >= req.body.quantity){
                                if(wallet >= rate*req.body.quantity){
                                    // all condition are fullfilled 

                                    sqlConnection.query('update userdata set wallet = wallet - ?',[rate*req.body.quantity],(err,row,field)=>{
                                        if(!err){
                                            sqlConnection.query('update fruitdata set quantity = quantity - ?',[req.body.quantity],async (err,row,field)=>{
                                                if(!err){

                                                    const transaction = {
                                                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                                                        type: "withraw",
                                                        amount: rate*req.body.quantity
                                                    }
                                        
                                                    await db.collection("transactions").add(transaction)

                                                    const sellingData = {
                                                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                                                        fruit: req.body.name,
                                                    }

                                                    await db.collection("sellingdata").add(sellingData)

                                                    return res.json({message: "Purchase successfully completed"})
                                                }else{
                                                    console.log(err)
                                                    return res.json({error:err})
                                                }
                                            })
                                        }else{
                                            console.log(err)
                                            return res.json({error:err})
                                        }
                                    })
                                }else{
                                    return res.json({message:"Inssufficient wallet balance"})
                                }
                            }else{
                                return res.json({message:"Fruit quantity is less than required"})
                            }
                        }else{
                            return res.json({message:"Fruit not present for buying"})
                        }
                    }else{
                        console.log(err)
                        return res.json({error:err})
                    }
                })
            }else{
                return res.json({message:"You are not buyer"})
            }
        }else{
            console.log(err)
            return res.json({error:err})
        }
    })
}


module.exports = {sellFruits,buyFruit}