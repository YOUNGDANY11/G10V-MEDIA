const { v2: cloudinary } = require('cloudinary')
require('dotenv').config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
})

/**
 * Sube un buffer al folder indicado en Cloudinary como video.
 * Retorna la secure_url del recurso subido.
 *
 * @param {Buffer}  buffer
 * @param {string}  publicId   - nombre público sin extensión
 * @param {string}  [folder]   - carpeta en Cloudinary
 * @returns {Promise<string>}  secure_url
 */
const uploadVideoBuffer = (buffer, publicId, folder = 'g10v-media/videos') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                folder,
                public_id: publicId,
            },
            (error, result) => {
                if (error) return reject(error)
                resolve(result.secure_url)
            }
        )
        stream.end(buffer)
    })
}

/**
 * Elimina un recurso de Cloudinary a partir de su secure_url.
 * No lanza si el recurso no existe (fallo silencioso).
 *
 * @param {string} secureUrl
 */
const deleteByUrl = async (secureUrl) => {
    try {
        // Extraer public_id desde la URL de Cloudinary
        // Formato: https://res.cloudinary.com/<cloud>/video/upload/v<ver>/<folder>/<id>.<ext>
        const match = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
        if (!match) return
        const publicId = match[1]
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
    } catch (_) {
        // Ignorar errores de limpieza
    }
}

module.exports = { cloudinary, uploadVideoBuffer, deleteByUrl }
