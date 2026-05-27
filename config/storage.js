const { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
require('dotenv').config()

// ─── Cliente S3 (Railway Object Storage — Tigris / t3.storageapi.dev) ────────
const s3 = new S3Client({
    region:   process.env.AWS_REGION || 'auto',
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
})

const BUCKET = process.env.RAILWAY_BUCKET_NAME

// ─── Helpers de URL ───────────────────────────────────────────────────────────

const _host = () =>
    String(process.env.AWS_ENDPOINT_URL_S3 || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')

/** URL pública base del objeto (puede no tener acceso si el bucket es privado) */
const buildPublicUrl = (key) => `https://${BUCKET}.${_host()}/${key}`

/**
 * Extrae el key S3 desde una URL almacenada en la BD.
 * Soporta tanto URLs virtuales como paths relativos.
 */
const extractKey = (urlOrKey) => {
    if (!urlOrKey) return null
    if (!urlOrKey.startsWith('http')) return urlOrKey          // ya es un key
    const prefix = `https://${BUCKET}.${_host()}/`
    if (urlOrKey.startsWith(prefix)) return urlOrKey.slice(prefix.length)
    // path-style como fallback
    const pathPrefix = `${process.env.AWS_ENDPOINT_URL_S3 || ''}/${BUCKET}/`
    if (urlOrKey.startsWith(pathPrefix)) return urlOrKey.slice(pathPrefix.length)
    return null
}

// ─── Presigned PUT (subida directa desde el navegador) ───────────────────────

/**
 * Genera una presigned PUT URL para que el cliente suba el video
 * directo al bucket sin pasar por el servidor. Expira en 1 hora.
 */
const createPresignedUploadUrl = async (key, contentType) => {
    const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType })
    return getSignedUrl(s3, command, { expiresIn: 3600 })
}

// ─── Presigned GET (lectura segura sin acceso público al bucket) ──────────────

/**
 * Genera una presigned GET URL para leer/reproducir un objeto.
 * Expira en 24 horas por defecto.
 *
 * @param {string} keyOrUrl  - key S3 o URL almacenada en la BD
 * @param {number} expiresIn - segundos de vigencia (default: 86400 = 24h)
 */
const createPresignedGetUrl = async (keyOrUrl, expiresIn = 86400) => {
    const key = extractKey(keyOrUrl)
    if (!key) throw new Error(`No se pudo extraer el key de: ${keyOrUrl}`)
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
    return getSignedUrl(s3, command, { expiresIn })
}

// ─── Eliminación ─────────────────────────────────────────────────────────────

/** Elimina un objeto del bucket. Silencioso en caso de error. */
const deleteObject = async (keyOrUrl) => {
    try {
        const key = extractKey(keyOrUrl) ?? keyOrUrl
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
    } catch (_) {}
}

module.exports = {
    s3,
    BUCKET,
    buildPublicUrl,
    extractKey,
    createPresignedUploadUrl,
    createPresignedGetUrl,
    deleteObject,
}
