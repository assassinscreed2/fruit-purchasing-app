const jwt = require('jsonwebtoken')

const validateAuthentication = (req,res,next) => {

    const token = req.header('Authorization');
    if(!token){
        return res.json({message:"Not Authorized"})
    }
    

    const secret = "@123%abcd123"

    jwt.verify(token,secret,(err,user)=>{
        if(err){
            return res.json({error: 'Invalid Token'})
        }

        req.user = user;
        next()
    })
}

module.exports = {validateAuthentication};