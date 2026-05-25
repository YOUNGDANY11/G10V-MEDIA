const trainingModel = require('../models/trainingModel')
const getAll = async(req,res)=>{
    try{
        const trainings = await trainingModel.getAll()
        if(trainings.length === 0){
            return res.status(404).json({
                status:'Error',
                mensaje:'No hay entrenamientos registrados'
            })
        }

        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            entrenamientos:trainings
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible obtener los entrenamientos'
        })
    }
}

const getById = async(req,res)=>{
    try{
        const {id} = req.params

        const id_training = id
        const training = await trainingModel.getById(id_training)
        if(!training){
            return res.status(404).json({
                status:'Error',
                mensaje:'Este entrenamiento no esta registrado'
            })
        }

        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            entrenamiento:training
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible obtener los entrenamientos'
        })
    }
}


const getByLocation = async(req,res)=>{
    try{
        const location = (req.query?.location ?? req.body?.location)

        if(!location){
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida la locasion'
            })
        }
        const trainings = await trainingModel.getByLocation(location)
        if(trainings.length === 0){
            return res.status(404).json({
                status:'Error',
                mensaje:'No hay entrenamientos registrados'
            })
        }

        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            entrenamientos:trainings
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible obtener los entrenamientos'
        })
    }
}

const create = async(req,res)=>{
    try{
        const {name,description,date,time,location} = req.body
        if(!name || !description || !date || !time || !location){
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida toda la informacion'
            })
        }

        const traininig = await trainingModel.create(name,description,date,time,location)
        return res.status(200).json({
            status:'Success',
            mensaje:'Entrenamiento creado con exito',
            entrenamiento:traininig
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible crear un entrenamiento'
        })
    }
}

const update = async(req,res)=>{
    try{
        const {id} = req.params
        const id_training = id
        const {name,description,date,time,location} = req.body
        if(!name || !description || !date || !time || !location){
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida toda la informacion'
            })
        }

        const existsTraining = await trainingModel.getById(id_training)
        if(!existsTraining){
            return res.status(404).json({
                status:'Error',
                mensaje:'No existe este entrenamiento'
            })
        }

        const trainingsInTimeAndDate = await trainingModel.getTrainingInTimeAnDate(time,date)
        const hasConflict = trainingsInTimeAndDate.some(t => String(t.id_training) !== String(existsTraining.id_training))
        if(hasConflict){
            return res.status(400).json({
                status:'Error',
                mensaje:'Ya existe este entrenamiento'
            })
        }


        const traininig = await trainingModel.update(name,description,date,time,location,id_training)
        return res.status(200).json({
            status:'Success',
            mensaje:'Entrenamiento actualizado con exito',
            entrenamiento:traininig
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible actualizar el entrenamiento'
        })
    }
}

const deleteTraining = async(req,res)=>{
    try{
        const {id} = req.params
        const id_training = id

        const existsTraining = await trainingModel.getById(id_training)
        if(!existsTraining){
            return res.status(404).json({
                status:'Error',
                mensaje:'No existe este entrenamiento'
            })
        }

        const traininig = await trainingModel.deleteTraining(id_training)
        return res.status(200).json({
            status:'Success',
            mensaje:'Entrenamiento eliminado con exito',
            entrenamiento:traininig
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible eliminar el entrenamiento'
        })
    }
}


module.exports = {
    getAll,
    getById,
    getByLocation,
    create,
    update,
    deleteTraining
}