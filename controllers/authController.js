const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const register = async(req,res)=>{
    try{
        const {name,lastname,document,password,email,id_role} = req.body
        if(!name || !lastname || !document || !password || !email) {
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida toda la informacion'
            })
        }

        const existsDocument = await userModel.getByDocument(document)
        if(existsDocument){
            return res.status(400).json({
                status:'Error',
                mensaje:'Documento asociado a otro usuario'
            })
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const user = await userModel.create(name,lastname,document,hashedPassword,email,id_role || 2)
        return res.status(200).json({
            status:'Success',
            mensaje:'Usuario creado exitosamente',
            usuario:user
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            status:'Error',
            mensaje:'No se pudo crear el usuario'
        })
    }
}

const login = async(req,res) => {
    try{
        const {document, password} = req.body
        if(!document || !password){
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida toda la informacion'
            })
        }

        const user = await userModel.getByDocument(document)
        if(!user) {
            return res.status(404).json({
                status:'Error',
                mensaje:'El usuario no existe'
            })
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({
                status:'Error',
                mensaje:'Contraseña incorrecta'
            })
        }

        const token = await jwt.sign({id:user.id_user,role:user.id_role,name:user.name}, process.env.JWT_SECRET, {
            expiresIn:'1y'
        })

        return res.status(200).json({
            status:'Success',
            mensaje:'Inicio de sesion exitoso',
            token:token
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            status:'Error',
            mensaje:'No se pudo iniciar sesion'
        })
    }
}

module.exports = {
    register,
    login
}