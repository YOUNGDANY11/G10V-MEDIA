const path = require('path')
const fs = require('fs')

const mediaModel = require('../models/mediaModel')
const userModel = require('../models/userModel')
const weekModel = require('../models/weekModel')

const uploadVideosDir = path.join(__dirname, '..', 'uploads', 'videos')

fs.mkdirSync(uploadVideosDir, { recursive: true })

const resolveExistingMediaPath = (documentPath) => {
    if(!documentPath || typeof documentPath !== 'string') return null

    const normalized = documentPath.replace(/\\/g, '/').trim()
    if(!normalized.includes('uploads/videos/')) return null

    const filename = path.posix.basename(normalized)
    if(!filename || filename === '.' || filename === '..') return null

    return path.join(uploadVideosDir, filename)
}

const buildWeekWindow = (week) => {
    if(!week?.delivery_date || !week?.start_time || !week?.end_time) return null

    const deliveryDate = week.delivery_date instanceof Date
        ? week.delivery_date.toISOString().slice(0, 10)
        : String(week.delivery_date).slice(0, 10)

    const normalizeTime = (value) => {
        const raw = String(value ?? '').trim()
        if(!/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) return null
        return raw.length === 5 ? `${raw}:00` : raw
    }

    const startTime = normalizeTime(week.start_time)
    const endTime = normalizeTime(week.end_time)
    if(!deliveryDate || !startTime || !endTime) return null

    if(endTime <= startTime) return null

    return { deliveryDate, startTime, endTime }
}

const getBogotaDateParts = (referenceDate = new Date()) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })

    const parts = formatter.formatToParts(referenceDate)
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]))

    return {
        date: `${values.year}-${values.month}-${values.day}`,
        time: `${values.hour}:${values.minute}:${values.second}`
    }
}

const isWithinWindow = (window, now = new Date()) => {
    if(!window) return false

    const current = getBogotaDateParts(now)
    if(current.date !== window.deliveryDate) return false

    return current.time >= window.startTime && current.time <= window.endTime
}

const getAll = async(req, res) => {
    try {
        const media = await mediaModel.getAll()
        if(media.length === 0) {
            return res.status(404).json({
                status: 'Error',
                mensaje: 'No hay entregas registradas'
            })
        }

        return res.status(200).json({
            status: 'Success',
            mensaje: 'Consulta exitosa',
            media
        })
    } catch(error) {
        return res.status(500).json({
            status: 'Error',
            mensaje: 'No se pudo obtener la informacion de media'
        })
    }
}

const getById = async(req, res) => {
    try {
        const { id } = req.params
        const media = await mediaModel.getById(id)
        if(!media) {
            return res.status(404).json({
                status: 'Error',
                mensaje: 'Esta entrega no existe'
            })
        }

        return res.status(200).json({
            status: 'Success',
            mensaje: 'Consulta exitosa',
            media
        })
    } catch(error) {
        return res.status(500).json({
            status: 'Error',
            mensaje: 'No se pudo obtener la entrega'
        })
    }
}

const getMyMedia = async(req, res) => {
    try {
        const { id } = req.user
        const media = await mediaModel.getByUser(id)
        if(media.length === 0) {
            return res.status(404).json({
                status: 'Error',
                mensaje: 'No tienes entregas registradas'
            })
        }

        return res.status(200).json({
            status: 'Success',
            mensaje: 'Consulta exitosa',
            media
        })
    } catch(error) {
        console.log(error)
        return res.status(500).json({
            status: 'Error',
            mensaje: 'No se pudo obtener tus entregas'
        })
    }
}

const getByWeek = async(req, res) => {
    try {
        const { id } = req.params
        const media = await mediaModel.getByWeek(id)
        if(media.length === 0) {
            return res.status(404).json({
                status: 'Error',
                mensaje: 'No hay entregas para esta semana'
            })
        }

        return res.status(200).json({
            status: 'Success',
            mensaje: 'Consulta exitosa',
            media
        })
    } catch(error) {
        return res.status(500).json({
            status: 'Error',
            mensaje: 'No se pudo obtener la informacion por semana'
        })
    }
}

const submitMedia = async(req, res) => {
    try {
        const { id } = req.user
        const user = await userModel.getById(id)
        if(!user) {
            return res.status(404).json({
                status: 'Error',
                mensaje: 'Usuario no existente'
            })
        }

        const { id_week } = req.body
        if(!id_week) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'Es requerida toda la informacion'
            })
        }

        const week = await weekModel.getById(id_week)
        if(!week) {
            return res.status(404).json({
                status: 'Error',
                mensaje: 'Esta semana no existe'
            })
        }

        const window = buildWeekWindow(week)
        if(!window) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'El rango de tiempo no es valido'
            })
        }

        if(!isWithinWindow(window)) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'La ventana de entrega ya finalizo o aun no ha iniciado'
            })
        }

        const uploadedFile = req.file
        if(!uploadedFile) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'Debes enviar un video'
            })
        }

        if(!String(uploadedFile.mimetype || '').startsWith('video/')) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'El archivo debe ser un video'
            })
        }

        const fileExt = path.extname(uploadedFile.originalname || '').toLowerCase() || '.mp4'
        const safeBaseName = path.basename(uploadedFile.originalname || 'video', path.extname(uploadedFile.originalname || '')).replace(/\s+/g, '_')
        const fileName = `${Date.now()}-${safeBaseName}${fileExt}`
        const newVideoDiskPath = path.join(uploadVideosDir, fileName)
        const documentPath = path.posix.join('uploads', 'videos', fileName)
        const mediaName = week.name

        let media
        try {
            await fs.promises.writeFile(newVideoDiskPath, uploadedFile.buffer)
            media = await mediaModel.create(user.id_user, id_week, mediaName, '', documentPath)
        } catch(dbError) {
            try {
                await fs.promises.unlink(newVideoDiskPath)
            } catch(_cleanupError) {
                // Ignorar
            }
            throw dbError
        }

        return res.status(200).json({
            status: 'Success',
            mensaje: 'Video enviado con exito',
            media
        })
    } catch(error) {
        return res.status(500).json({
            status: 'Error',
            mensaje: 'No se pudo registrar la entrega'
        })
    }
}

module.exports = {
    getAll,
    getById,
    getMyMedia,
    getByWeek,
    submitMedia
}