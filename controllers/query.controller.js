const {admin,db,sqlConnection} = require('../db/db.connections')

async function getTotalUsers(req,res){
    sqlConnection.query('select count(*) as count from userdata',(err,row,field)=>{
        if(!err){
            const count = row[0].count
            return res.json({totalusers:count})
        }else{
            console.log(err)
            return res.json({error:err})
        }
    })
}

async function getTotalSellers(req,res){
    sqlConnection.query('select count(*) as count from userdata where category = "seller" or category = "both"',(err,row,field)=>{
        if(!err){
            const count = row[0].count
            return res.json({totalsellers:count})
        }else{
            console.log(err)
            return res.json({error:err})
        }
    })
}

async function getTotalBuyer(req,res){
    sqlConnection.query('select count(*) as count from userdata where category = "buyer"',(err,row,field)=>{
        if(!err){
            const count = row[0].count
            return res.json({totalbuyers:count})
        }else{
            console.log(err)
            return res.json({error:err})
        }
    })
}

async function notLoggedAferSignup(req,res){
    sqlConnection.query('select count(*) as count from userdata where username not in (select username from logindata)',(err,row,field)=>{
        if(!err){
            const count = row[0].count
            return res.json({totalbuyers:count})
        }else{
            console.log(err)
            return res.json({error:err})
        }
    })
}

async function mostSoldFruit(req,res){
    const fruit = await db.collection('sellingdata').groupBy('fruit').select('fruit', 'quantity').sum('quantity').orderBy('quantity', 'desc').limit(1).get()
    console.log(fruit)
}

async function userFruitSellers(req,res){
    const username = req.body.username
    sqlConnection.query('select * from fruitdata where username = ?',[username],(err,row,field)=>{
        if(!err){
            if(row.length !== 0){
                return res.json(row[0])
            }else{
                return res.json({message:"no fruits"})
            }
        }else{
            console.log(err)
            return res.json({error:err})
        }
    })
}