const { S3Client, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
require('dotenv').config()

// ─── Cliente S3 (Railway Object Storage — Tigris / t3.storageapi.dev) ────────
// Railway usa virtual-hosted-style: https://<bucket>.t3.storageapi.dev/<key>
// Por eso forcePathStyle debe ser FALSE (valor por defecto).
const s3 = new S3Client({
    region:   process.env.AWS_REGION || 'auto',
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    // forcePathStyle: false  ← no se pone; es el default correcto para Tigris
})

const BUCKET = process.env.RAILWAY_BUCKET_NAME

/**
 * Construye la URL pública con virtual-hosted-style:
 * https://<bucket>.<host>/<key>
 *
 * Ejemplo: https://collected-wrap-thj4-f5ehv.t3.storageapi.dev/videos/abc.mp4
 */
const buildPublicUrl = (key) => {
    // Extraer el host del endpoint (quitar https://)
    const host = String(process.env.AWS_ENDPOINT_URL_S3 || '')
        .replace(/^https?:\/\//, '')
        .replace(/\/+$/, '')
    return `https://${BUCKET}.${host}/${key}`
}

/**
 * Genera una presigned PUT URL para que el cliente suba el video
 * DIRECTO al bucket — sin pasar por el servidor.
 * Expira en 1 hora.
 *
 * @param {string} key         - ruta dentro del bucket, ej: "videos/1234-nombre.mp4"
 * @param {string} contentType - MIME type del archivo
 * @returns {Promise<string>}  URL firmada para PUT
 */
const createPresignedUploadUrl = async (key, contentType) => {
    const command = new PutObjectCommand({
        Bucket:      BUCKET,
        Key:         key,
        ContentType: contentType,
    })
    return getSignedUrl(s3, command, { expiresIn: 3600 })
}

/**
 * Elimina un objeto del bucket a partir de su key o URL completa.
 * Silencioso en caso de error.
 *
 * @param {string} keyOrUrl
 */
const deleteObject = async (keyOrUrl) => {
    try {
        let key = keyOrUrl
        // Si es URL virtual-hosted, extraer el key
        const host    = String(process.env.AWS_ENDPOINT_URL_S3 || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')
        const prefix  = `https://${BUCKET}.${host}/`
        if (keyOrUrl.startsWith(prefix)) key = keyOrUrl.slice(prefix.length)

        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
    } catch (_) {}
}

module.exports = { s3, createPresignedUploadUrl, buildPublicUrl, deleteObject, BUCKET }
