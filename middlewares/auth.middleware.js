const jwt = require('jsonwebtoken')

const auth = (req,res,next)=>{
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(403).json({
            status:'Error',
            mensaje:'Token requerido'
        })
    }

    const token = authHeader.split(' ')[1]
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }catch(error){
        return res.status(403).json({
            status:'Error',
            mensaje:'Token invalido o expiro'
        })
    }
}

module.exports = auth