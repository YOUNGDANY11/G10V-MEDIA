const attendanceModel = require('../models/attendanceModel')
const userModel = require('../models/userModel')
const trainingModel = require('../models/trainingModel')

const TIME_ZONE = process.env.DB_TIMEZONE || 'America/Bogota'

const getZonedDateParts = (referenceDate = new Date()) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    })

    const parts = formatter.formatToParts(referenceDate)
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

    return {
        date: `${values.year}-${values.month}-${values.day}`,
        time: `${values.hour}:${values.minute}:${values.second}`,
    }
}

const parseTrainingStart = (training) => {
    const rawDate = training?.date
    const rawTime = training?.time

    let date = ''
    if (rawDate instanceof Date) {
        date = rawDate.toISOString().slice(0, 10)
    } else {
        date = String(rawDate ?? '').slice(0, 10)
    }

    let time = String(rawTime ?? '00:00:00')
    if (time.includes('.')) time = time.split('.')[0]
    if (time.length === 5) time = `${time}:00`

    if (!date) return null

    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute, second] = time.split(':').map(Number)

    if ([year, month, day, hour, minute, second].some(Number.isNaN)) return null

    const dt = new Date(Date.UTC(year, month - 1, day, hour + 5, minute, second))
    if (Number.isNaN(dt.getTime())) return null
    return dt
}

const getAll = async(req,res)=>{
    try{
        const attendances = await attendanceModel.getAll()
        if(attendances.length === 0){
            return res.status(404).json({
                status:'Error',
                mensaje:'No hay asistencias registradas'
            })
        }

        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            asistencias:attendances
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible obtener las asistencias'
        })
    }
}

const getById = async(req,res)=>{
    try{
        const {id} = req.params
        const id_attendance = id
        const attendance = await attendanceModel.getById(id_attendance)
        if(!attendance){
            return res.status(404).json({
                status:'Error',
                mensaje:'Esta asistencia no esta registrada'
            })
        }
        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            asistencia:attendance
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible obtener las asistencias'
        })
    }
}

const getByIdTraining = async(req,res)=>{
    try{
        const {id} = req.params
        const id_training = id
        const attendances = await attendanceModel.getByIdTraining(id_training)
        if(attendances.length === 0){
            return res.status(404).json({
                status:'Error',
                mensaje:'No hay asistencias registradas para este entrenamiento'
            })
        }
        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            asistencias:attendances
        })
    }
    catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible obtener las asistencias'
        })
    }
}

const getMine = async(req,res)=>{
    try{
        const { id } = req.user
        const attendances = await attendanceModel.getByUser(id)
        if(attendances.length === 0){
            return res.status(404).json({
                status:'Error',
                mensaje:'No tienes asistencias registradas'
            })
        }
        return res.status(200).json({
            status:'Success',
            mensaje:'Consulta exitosa',
            asistencias:attendances
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible obtener tus asistencias'
        })
    }
}

const create = async(req,res)=>{
    try{
        const { id } = req.user
        const authenticatedUserId = id

        const user = await userModel.getById(authenticatedUserId)
        if(!user){
            return res.status(404).json({
                status:'Error',
                mensaje:'No existe este usuario'
            })
        }

        const { id_user: requestedUserId, id_training, status } = req.body
        if(!id_training || !status){
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida toda la informacion'
            })
        }

        if(requestedUserId && String(requestedUserId) !== String(user.id_user)){
            return res.status(403).json({
                status:'Error',
                mensaje:'No puedes registrar asistencia para otro deportista'
            })
        }

        const training = await trainingModel.getById(id_training)
        if(!training){
            return res.status(404).json({
                status:'Error',
                mensaje:'Este entrenamiento no esta registrado'
            })
        }

        // Default window aligns with the UI (40 minutes).
        const windowMinutes = Number(process.env.ATTENDANCE_WINDOW_MINUTES || 40)
        const start = parseTrainingStart(training)
        if(!start){
            return res.status(400).json({
                status:'Error',
                mensaje:'No es posible validar la fecha/hora del entrenamiento'
            })
        }
        const end = new Date(start.getTime() + (windowMinutes * 60 * 1000))
        const current = getZonedDateParts()
        const currentDate = current.date
        const currentTime = current.time
        const startDate = start.toLocaleDateString('en-CA', { timeZone: TIME_ZONE })
        const startTime = start.toLocaleTimeString('en-CA', {
            timeZone: TIME_ZONE,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
        const endDate = end.toLocaleDateString('en-CA', { timeZone: TIME_ZONE })
        const endTime = end.toLocaleTimeString('en-CA', {
            timeZone: TIME_ZONE,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })

        if (currentDate < startDate || currentDate > endDate || (currentDate === startDate && currentTime < startTime) || (currentDate === endDate && currentTime > endTime)) {
            return res.status(400).json({
                status:'Error',
                mensaje:'El registro de asistencia solo está disponible dentro de la ventana de tiempo del entrenamiento'
            })
        }

        const safeUserId = user.id_user
        const existsAttendance = await attendanceModel.getByAthleteAndTraining(safeUserId,id_training)
        if(existsAttendance){
            return res.status(400).json({
                status:'Error',
                mensaje:'Ya realizaste el registro de asistencia'
            })
        }

        const attendance = await attendanceModel.create(safeUserId,id_training,status)
        return res.status(200).json({
            status:'Success',
            mensaje:'Asistencia creada con exito',
            asistencia:attendance
        })
    }catch(error){
        return res.status(500).json({
            status:'Error',
            mensaje:'No es posible crear la asistencia'
        })
    }
}



module.exports = {
    getAll,
    getById,
    getByIdTraining,
    getMine,
    create,
}