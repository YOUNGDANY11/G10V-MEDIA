const bcrypt = require('bcryptjs')
const path = require('path')
const { sendEmail } = require('../config/email.config')
const { generateNumericCode } = require('../utils/generateCodeResetPassword')
const { renderTemplateFile } = require('../utils/renderEmailTemplate')
const userModel = require('../models/userModel')
const passwordModel = require('../models/passwordResetModel')
const TTL_MINUTES = Number(process.env.RESET_CODE_TTL_MINUTES || 3)

const forgotPassword = async(req,res)=>{
    try{    
        const { document } = req.body
        if(!document) {
            return res.status(400).json({
                status: 'Error',
                mensaje: 'documento es obligatorio'
            })
        }
        const user = await userModel.getByDocument(document)
        if(!user){
            return res.status(200).json({
                status: 'Success',
                mensaje:'Este documento no esta asociado a ningun usuario'
            })
        }

        if(user.email === null){
            return res.status(200).json({
                status: 'Success',
                mensaje:'El usuario no tiene un correo electrónico asociado, no se puede enviar el código de verificación'
            })
        }
        const code = generateNumericCode(6)
        const code_hash = await bcrypt.hash(code, 10)
        const expires_at = new Date(Date.now() + TTL_MINUTES * 60 * 1000)
        await passwordModel.createReset(user.id_user, code_hash, expires_at)

        const templatePath = path.join(__dirname, '..', 'templates', 'password-reset.email.html')
        const supportEmail = process.env.SUPPORT_EMAIL || process.env.GMAIL_USER || ''
        const html = await renderTemplateFile(templatePath, {
            APP_NAME: process.env.APP_NAME || 'G10V - LANCELOT',
            CODE: code,
            TTL_MINUTES: TTL_MINUTES,
            SUPPORT_EMAIL: supportEmail,
            YEAR: new Date().getFullYear(),
        })

        await sendEmail({
            from: `"G11V" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: 'Código para restablecer tu contraseña',
            text: `Tu código de verificación es: ${code}\n\nEste código expira en ${TTL_MINUTES} minutos.\nSi no solicitaste este cambio, ignora este correo.`,
            html,
        })
        return res.status(200).json({
            status: 'Success',
            mensaje:'Si el usuario existe, se ha enviado un código de verificación al correo para restablecer la contraseña.',
            minutos: TTL_MINUTES
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            status:'Error',
            mensaje:'Error al procesar la solicitud'
        })
    }
}

const resetPassword = async(req,res)=>{
    try{
        const { email, code, newPassword } = req.body
        if(!email || !code || !newPassword){
            return res.status(400).json({
                status:'Error',
                mensaje:'Es requerida toda la informacion'
            })
        }
        if(newPassword.length < 8){
            return res.status(400).json({
                status:'Error',
                mensaje:'La nueva contraseña debe tener al menos 8 caracteres'
            })
        }
        const user = await userModel.getByEmail(email)
        if(!user){
            return res.status(400).json({
                status:'Error',
                mensaje:'Correo incorrecto o no asociado a ningún usuario'
            })
        }
        const reset = await passwordModel.getLatestValidReset(user.id_user)
        if(!reset){
            return res.status(400).json({
                status:'Error',
                mensaje:'Código inválido o expirado'
            })
        }
        const isValid = await bcrypt.compare(code, reset.code_hash)
        if(!isValid){
            return res.status(400).json({
                status:'Error',
                mensaje:'Código inválido o expirado'
            })
        }
        const passwordHash = await bcrypt.hash(newPassword, 10)
        await userModel.updatePassword(passwordHash, user.id_user)
        await passwordModel.invalidateAllForUser(user.id_user)
        return res.status(200).json({
            status:'Success',
            nombre_usuario: user.name,
            mensaje:'Contraseña restablecida'
        })
    }catch(error){
        console.error('Error en resetPassword:', error)
        return res.status(500).json({
            status:'Error', 
            mensaje:'Error al procesar la solicitud'
        })
    }
}

module.exports = {
    forgotPassword,
    resetPassword
}