const {admin,db,sqlConnection} = require('../db/db.connections')

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

async function signedLastWeek(){
    
}

async function loggedInLastWeek(){
    
}

async function soldOnPerticularDate(starttiming,endtiming){

    const startDate = new Date(starttiming);

    console.log(endtiming === undefined)

    let endDate = null;
    
    if(endtiming === undefined){
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 1)
    }else{
        endDate = new Date(endtiming)
    }

    console.log(endDate)

    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

    return db.collection('sellingdata').where('timestamp', '>=', startTimestamp).where('timestamp', '<', endTimestamp).get().then((querySnapshot) => {

        let fruitsSet = new Set()

        querySnapshot.forEach((doc) => {
            fruitsSet.add(doc.data().fruit);
        });

        let ar = [...fruitsSet]

        console.log(ar)

        return {fruits:ar}
    })
    .catch((error) => {
        console.error('Error getting documents: ', error);
    });

}

async function soldBetweenTime(){
    const startTime = "2023-04-13 11:06:02";
    const endTime = "2023-04-13 11:08:12";

const startDate = new Date(startTime);

const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

db.collection('sellingdata')
  .where('timestamp', '>=', startTimestamp)
  .where('timestamp', '<=', endTimestamp)
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      console.log(doc.data().fruit);
    });
  })
  .catch((error) => {
    console.error('Error getting documents: ', error);
  });
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

module.exports = {
    getTotalUsers,
    getTotalSellers,
    getTotalBuyer,
    notLoggedAferSignup,
    mostSoldFruit,
    soldOnPerticularDate,
    soldBetweenTime,
    unsoldFruit,
    userFruitSellers
}