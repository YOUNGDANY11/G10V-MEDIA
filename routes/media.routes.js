const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const mediaController = require('../controllers/mediaController')

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })
const videoUpload = upload.single('video')

router.get('/mine', auth, role(2), mediaController.getMyMedia)
router.get('/week/:id', auth, role(1), mediaController.getByWeek)
router.get('/', auth, role(1), mediaController.getAll)
router.get('/:id', auth, role(1), mediaController.getById)
router.post('/submit', auth, role(2), videoUpload, mediaController.submitMedia)

module.exports = router