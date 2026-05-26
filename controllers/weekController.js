const weekModel = require('../models/weekModel')

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value))

const normalizeTime = (value) => {
    const raw = String(value ?? '').trim()
    if(!/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) return null
    return raw.length === 5 ? `${raw}:00` : raw
}

const getAll = async(req, res) => {
    try {
        const weeks = await weekModel.getAll()
        if(weeks.length === 0) {
            return res.status(404).json({
                status: 'Error',
                mensaje: 'No hay semanas registradas'
            })
        }

        return res.status(200).json({
            status: 'Success',
            mensaje: 'Consulta exitosa',
            weeks
        })
    } catch(error) {
        return res.status(500).json({
            status: 'Error',
            mensaje: 'No se pudieron obtener las semanas'
        })
    }
}

const getActive = async(req, res) => {
    try {
        const weeks = await weekModel.getActive()

        return res.status(200).json({
            status: 'Success',
            mensaje: 'Consulta exitosa',
            weeks
        })
    } catch(error) {
        return res.status(500).json({
            status: 'Error',
            mensaje: 'No se pudieron obtener las semanas activas'
        })
    }
}

const create = async(req, res) => {
    try {
        const { name, delivery_date, start_time, end_time } = req.body
        if(!name || !delivery_date || !start_time || !end_time) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'Es requerida toda la informacion'
            })
        }

        if(!isValidDate(delivery_date)) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'La fecha debe tener el formato YYYY-MM-DD'
            })
        }

        const normalizedStartTime = normalizeTime(start_time)
        const normalizedEndTime = normalizeTime(end_time)
        if(!normalizedStartTime || !normalizedEndTime) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'La hora debe tener el formato HH:MM'
            })
        }

        const start = new Date(`${delivery_date}T${normalizedStartTime}`)
        const end = new Date(`${delivery_date}T${normalizedEndTime}`)
        if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'El rango de tiempo no es valido'
            })
        }

        const week = await weekModel.create(name, delivery_date, normalizedStartTime, normalizedEndTime)
        return res.status(200).json({
            status: 'Success',
            mensaje: 'Semana creada con exito',
            week
        })
    } catch(error) {
        console.log(error)
        return res.status(500).json({
            status: 'Error',
            mensaje: 'No se pudo crear la semana'
        })
    }
}

const deleteWeek = async(req, res) => {
    try {
        const { id } = req.params
        const existsWeek = await weekModel.getById(id)
        if(!existsWeek) {
            return res.status(404).json({
                status: 'Error',
                mensaje: 'Esta semana no existe'
            })
        }

        const week = await weekModel.deleteWeek(id)
        return res.status(200).json({
            status: 'Success',
            mensaje: 'Semana eliminada con exito',
            week
        })
    } catch(error) {
        return res.status(500).json({
            status: 'Error',
            mensaje: 'No se pudo eliminar la semana'
        })
    }
}

module.exports = {
    getAll,
    getActive,
    create,
    deleteWeek
}