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

}


module.exports = {sellFruits,buyFruit}