const path = require('path')
const trainingModel = require('../models/trainingModel')
const userModel = require('../models/userModel')
const { sendEmail } = require('../config/email.config')
const { renderTemplateFile } = require('../utils/renderEmailTemplate')
const { normalizeCoordinate } = require('../utils/geo')

const TRAINING_TEMPLATE = path.join(__dirname, '..', 'templates', 'training-notification.email.html')

function formatDateES(raw) {
    const str = raw instanceof Date ? raw.toISOString() : String(raw)
    const [year, month, day] = str.slice(0, 10).split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
}

function formatTime12h(raw) {
    const [h, m] = String(raw).split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

async function notifyDeportistas(training, action) {
    try {
        const deportistas = await userModel.getByRole(2)
        const emails = deportistas.map(u => u.email).filter(Boolean)
        if (emails.length === 0) return

        const isNew    = action === 'create'
        const dateES   = formatDateES(training.date)
        const time12h  = formatTime12h(training.time)

        const html = await renderTemplateFile(TRAINING_TEMPLATE, {
            APP_NAME:      process.env.APP_NAME || 'G10V - LANCELOT',
            ACTION_LABEL:  isNew ? 'Nuevo' : 'Actualizado',
            ACTION_PAST:   isNew ? 'programado' : 'actualizado',
            NAME:          training.name,
            DESCRIPTION:   training.description,
            DATE:          dateES,
            TIME:          time12h,
            LOCATION:      training.location,
            SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || '',
            YEAR:          new Date().getFullYear(),
        })

        await sendEmail({
            from:    process.env.EMAIL_FROM,
            to:      emails,
            subject: isNew
                ? `Nuevo entrenamiento: ${training.name}`
                : `Entrenamiento actualizado: ${training.name}`,
            text: `Entrenamiento ${isNew ? 'programado' : 'actualizado'}: ${training.name}\nFecha: ${dateES} - Hora: ${time12h}\nLugar: ${training.location}\nDescripcion: ${training.description}`,
            html,
        })
    } catch (err) {
        console.error('[notifyDeportistas] Error enviando notificacion:', err.message)
    }
}
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
        console.log(error)
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
        const {name,description,date,time,location,lat,lng} = req.body
        const normalizedLat = normalizeCoordinate(lat, 'lat')
        const normalizedLng = normalizeCoordinate(lng, 'lng')

        if(!name || !description || !date || !time || !location || normalizedLat === null || normalizedLng === null){
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida toda la informacion'
            })
        }

        const traininig = await trainingModel.create(name,description,date,time,location,normalizedLat,normalizedLng)
        notifyDeportistas(traininig, 'create')
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
        const {name,description,date,time,location,lat,lng} = req.body
        const normalizedLat = normalizeCoordinate(lat, 'lat')
        const normalizedLng = normalizeCoordinate(lng, 'lng')

        if(!name || !description || !date || !time || !location || normalizedLat === null || normalizedLng === null){
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


        const traininig = await trainingModel.update(name,description,date,time,location,normalizedLat,normalizedLng,id_training)
        notifyDeportistas(traininig, 'update')
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