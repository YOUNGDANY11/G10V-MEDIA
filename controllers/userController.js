const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs')

const getAll = async(req,res)=>{
    try{
        const users = await userModel.getAll()
        if(users.length === 0){
            return res.status(404).json({
                status:'Error',
                mensaje:'No hay usuarios registrados'
            })
        }

        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            usuarios:users
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No se pudo obtener los usuarios'
        })
    }
}

const getById = async(req,res)=>{
    try{
        const {id} = req.params
        const id_user = id
        const user = await userModel.getById(id_user)
        if(!user){
            return res.status(404).json({
                status:'Error',
                mensaje:'Este usuario no esta registrado'
            })
        }
        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            usuario:user
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No se pudo obtener el usuario'
        })
    }
}

const getByLastName = async(req,res)=>{
    try{
        const {lastname} = req.body
        if(!lastname){
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida toda la informacion'
            })
        }

        const user = await userModel.getByLastName(lastname)
        if(user.length === 0){
            return res.status(404).json({
                status:'Error',
                mensaje:'No existe este usuario'
            })
        }
        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            usuario:user
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No se pudo obtener el usuario'
        })
    }
}

const getByUserActive = async(req,res)=>{
    try{
        const {id} = req.user
        const id_user = id
        const user = await userModel.getById(id_user)
        if(!user){
            return res.status(404).json({
                status:'Error',
                mensaje:'Usuario no existente'
            })
        }
        const { document, password, created_at, updated_at, ...safeUser } = user

        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            usuario:safeUser
        })
    }catch(error){ 
        return res.status(500).json({
            status:'Error',
            mensaje:'No se pudo obtener la informacion de este usuario'
        })
    }
}

const create = async(req,res) =>{
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
        return res.status(500).json({
            status:'Error',
            mensaje:'No se pudo crear el usuario'
        })
    }
}

const update = async(req,res)=>{
    try{
        const {id} = req.params
        const id_user = id
        const {name,lastname,document,email,id_role} = req.body
        if(!name || !lastname || !document || !email || !id_role){
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida toda la informacion'
            })
        }

        const existsUser = await userModel.getById(id_user)
        if(!existsUser){
            return res.status(404).json({
                status:'Error',
                mensaje:'Este usuario no existe'
            })
        }

        const existsDocument = await userModel.getByDocument(document)

        // Validar que el documento sea el mismo del usuario o que no esté asociado a otro usuario
        if(existsDocument && existsDocument.id_user !== existsUser.id_user){
            return res.status(400).json({
                status:'Error',
                mensaje:'Documento asociado a otro usuario'
            })
        }


        const updatedUser = await userModel.update(name,lastname,document,email,id_role,id_user)
        return res.status(200).json({
            status:'Success',
            mensaje:'Usuario actualizado exitosamente',
            usuario:updatedUser
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No se pudo actualizar el usuario'
        })
    }
}


const deleteUser = async(req,res)=>{
    try{
        const {id} = req.params
        const id_user = id
        const existsUser = await userModel.getById(id_user)
        if(!existsUser){
            return res.status(400).json({
                status:'Error',
                mensaje:'No existe este usuario'
            })
        }

        const user = await userModel.deleteUser(id_user)
        return res.status(200).json({
            status:'Success',
            mensaje:'Usuario eliminado con exito',
            usuario:user
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No se pudo eliminar el usuario'
        })
    }
}

module.exports = {
    getAll,
    getById,
    getByLastName,
    getByUserActive,
    create,
    update,
    deleteUser
}