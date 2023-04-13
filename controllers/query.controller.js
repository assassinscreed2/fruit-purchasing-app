const {admin,db,sqlConnection} = require('../db/db.connections')



module.exports = {
    getTotalBuyer,
    getTotalSellers,
    getTotalUsers,
    userFruitSellers,
    notLoggedAferSignup,
    mostSoldFruit
}