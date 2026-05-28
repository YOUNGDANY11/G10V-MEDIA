const path = require('path')

const mediaModel = require('../models/mediaModel')
const userModel  = require('../models/userModel')
const weekModel  = require('../models/weekModel')
const { createPresignedUploadUrl, createPresignedGetUrl, buildPublicUrl } = require('../config/storage')

// ─── Helper: enriquecer registros con presigned GET URL ───────────────────────

/**
 * Agrega `documentUrl` a cada registro de media.
 * `documentUrl` es una presigned GET URL válida por 24 h.
 * Si el documento está vacío o falla, se omite sin romper la respuesta.
 */
const withPresignedUrl = async (item) => {
    if (!item?.document) return item
    try {
        const documentUrl = await createPresignedGetUrl(item.document)
        return { ...item, documentUrl }
    } catch {
        return item
    }
}

const enrichAll = (items) => Promise.all(items.map(withPresignedUrl))

// ─── Helpers ventana de entrega ───────────────────────────────────────────────

const buildWeekWindow = (week) => {
    if (!week?.delivery_date || !week?.start_time || !week?.end_time) return null

    const deliveryDate = week.delivery_date instanceof Date
        ? week.delivery_date.toISOString().slice(0, 10)
        : String(week.delivery_date).slice(0, 10)

    const normalizeTime = (value) => {
        const raw = String(value ?? '').trim()
        if (!/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) return null
        return raw.length === 5 ? `${raw}:00` : raw
    }

    const startTime = normalizeTime(week.start_time)
    const endTime   = normalizeTime(week.end_time)
    if (!deliveryDate || !startTime || !endTime) return null
    if (endTime <= startTime) return null

    return { deliveryDate, startTime, endTime }
}

const getBogotaDateParts = (referenceDate = new Date()) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    })
    const parts  = formatter.formatToParts(referenceDate)
    const values = Object.fromEntries(parts.map((p) => [p.type, p.value]))
    return {
        date: `${values.year}-${values.month}-${values.day}`,
        time: `${values.hour}:${values.minute}:${values.second}`,
    }
}

const isWithinWindow = (window, now = new Date()) => {
    if (!window) return false
    const current = getBogotaDateParts(now)
    if (current.date !== window.deliveryDate) return false
    return current.time >= window.startTime && current.time <= window.endTime
}

// ─── Controladores ────────────────────────────────────────────────────────────

const getAll = async (req, res) => {
    try {
        const rows = await mediaModel.getAll()
        if (rows.length === 0) return res.status(404).json({ status: 'Error', mensaje: 'No hay entregas registradas' })
        const media = await enrichAll(rows)
        return res.status(200).json({ status: 'Success', mensaje: 'Consulta exitosa', media })
    } catch {
        return res.status(500).json({ status: 'Error', mensaje: 'No se pudo obtener la informacion de media' })
    }
}

const getById = async (req, res) => {
    try {
        const row = await mediaModel.getById(req.params.id)
        if (!row) return res.status(404).json({ status: 'Error', mensaje: 'Esta entrega no existe' })
        const media = await withPresignedUrl(row)
        return res.status(200).json({ status: 'Success', mensaje: 'Consulta exitosa', media })
    } catch {
        return res.status(500).json({ status: 'Error', mensaje: 'No se pudo obtener la entrega' })
    }
}

const getMyMedia = async (req, res) => {
    try {
        const rows = await mediaModel.getByUser(req.user.id)
        if (rows.length === 0) return res.status(404).json({ status: 'Error', mensaje: 'No tienes entregas registradas' })
        const media = await enrichAll(rows)
        return res.status(200).json({ status: 'Success', mensaje: 'Consulta exitosa', media })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: 'Error', mensaje: 'No se pudo obtener tus entregas' })
    }
}

const getByWeek = async (req, res) => {
    try {
        const rows = await mediaModel.getByWeek(req.params.id)
        if (rows.length === 0) return res.status(404).json({ status: 'Error', mensaje: 'No hay entregas para esta semana' })
        const media = await enrichAll(rows)
        return res.status(200).json({ status: 'Success', mensaje: 'Consulta exitosa', media })
    } catch {
        return res.status(500).json({ status: 'Error', mensaje: 'No se pudo obtener la informacion por semana' })
    }
}

// ─── Subida en dos pasos ──────────────────────────────────────────────────────

/**
 * PASO 1 — Validar + generar presigned PUT URL.
 * El video NO pasa por el servidor.
 * Body: { id_week, filename, contentType }
 */
const presignUpload = async (req, res) => {
    try {
        const { id } = req.user

        const user = await userModel.getById(id)
        if (!user) return res.status(404).json({ status: 'Error', mensaje: 'Usuario no existente' })

        const { id_week, filename, contentType } = req.body
        if (!id_week || !filename || !contentType) {
            return res.status(400).json({ status: 'Error', mensaje: 'Se requiere id_week, filename y contentType' })
        }
        if (!String(contentType).startsWith('video/')) {
            return res.status(400).json({ status: 'Error', mensaje: 'El archivo debe ser un video' })
        }

        const week = await weekModel.getById(id_week)
        if (!week) return res.status(404).json({ status: 'Error', mensaje: 'Esta semana no existe' })

        const window = buildWeekWindow(week)
        if (!window) return res.status(400).json({ status: 'Error', mensaje: 'El rango de tiempo no es valido' })
        if (!isWithinWindow(window)) {
            return res.status(400).json({ status: 'Error', mensaje: 'La ventana de entrega ya finalizo o aun no ha iniciado' })
        }

        const ext  = path.extname(filename).toLowerCase() || '.mp4'
        const base = path.basename(filename, path.extname(filename))
            .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60)
        const key  = `videos/${Date.now()}-u${id}-${base}${ext}`

        const uploadUrl = await createPresignedUploadUrl(key, contentType)
        const publicUrl = buildPublicUrl(key)

        return res.status(200).json({ status: 'Success', uploadUrl, key, publicUrl })
    } catch (err) {
        console.error('presignUpload error:', err)
        return res.status(500).json({ status: 'Error', mensaje: 'No se pudo generar la URL de subida' })
    }
}

/**
 * PASO 2 — Confirmar subida exitosa y guardar en BD.
 * Body: { id_week, key, publicUrl }
 */
const confirmUpload = async (req, res) => {
    try {
        const { id } = req.user

        const user = await userModel.getById(id)
        if (!user) return res.status(404).json({ status: 'Error', mensaje: 'Usuario no existente' })

        const { id_week, key, publicUrl } = req.body
        if (!id_week || !key || !publicUrl) {
            return res.status(400).json({ status: 'Error', mensaje: 'Se requiere id_week, key y publicUrl' })
        }
        if (!key.includes(`-u${id}-`)) {
            return res.status(403).json({ status: 'Error', mensaje: 'No autorizado para confirmar esta subida' })
        }

        const week = await weekModel.getById(id_week)
        if (!week) return res.status(404).json({ status: 'Error', mensaje: 'Esta semana no existe' })

        const row   = await mediaModel.create(user.id_user, id_week, week.name, '', publicUrl)
        const media = await withPresignedUrl(row)

        return res.status(200).json({ status: 'Success', mensaje: 'Video registrado con exito', media })
    } catch (err) {
        console.error('confirmUpload error:', err)
        return res.status(500).json({ status: 'Error', mensaje: 'No se pudo registrar la entrega' })
    }
}

module.exports = { getAll, getById, getMyMedia, getByWeek, presignUpload, confirmUpload }
