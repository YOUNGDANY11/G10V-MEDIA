const { Router } = require('express')

const auth  = require('../middlewares/auth.middleware')
const role  = require('../middlewares/role.middleware')
const media = require('../controllers/mediaController')

const router = Router()

// ── Lectura ──────────────────────────────────────────────────────────────────
router.get('/mine',      auth, role(1, 2), media.getMyMedia)
router.get('/week/:id',  auth, role(1),    media.getByWeek)
router.get('/',          auth, role(1),    media.getAll)
router.get('/:id',       auth, role(1),    media.getById)

// ── Subida en dos pasos (video va directo al bucket, nunca pasa por el server)
// Paso 1: validar + obtener URL firmada para subir desde el navegador
router.post('/presign',  auth, role(2),    media.presignUpload)
// Paso 2: confirmar que la subida terminó y guardar en BD
router.post('/confirm',  auth, role(2),    media.confirmUpload)

module.exports = router
