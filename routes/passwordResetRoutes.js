const express = require('express')
const router = express.Router()

const passwordResetController = require('../controllers/passwordResetController')

// Rutas para el proceso de restablecimiento de contraseña
router.post('/forgot', passwordResetController.forgotPassword)
router.post('/reset', passwordResetController.resetPassword)


module.exports = router