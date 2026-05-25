const nodemailer = require('nodemailer')

let transporter
let verifyPromise

function getEmailTransporter() {
    if (transporter) return transporter

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error('Faltan GMAIL_USER o GMAIL_APP_PASSWORD en variables de entorno')
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = Number(process.env.SMTP_PORT || 465)
    const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true'

    transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        pool: true,
        maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 5),
        maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 200),
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 8000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 8000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 12000),
        dnsTimeout: Number(process.env.SMTP_DNS_TIMEOUT || 5000),
        family: 4,
        auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
        },
        tls: {
        servername: host,
        rejectUnauthorized: true,
        },
    })

  return transporter
}

function warmupEmailTransporter() {
    const smtp = getEmailTransporter()
    if (!verifyPromise) {
        verifyPromise = smtp.verify()
        //Opcional en caso de errores
        //   .then(() => {
        //     console.log('SMTP listo para enviar correos')
        //   })
        //   .catch((error) => {
        //     console.error('Error verificando SMTP:', error.message || error)
        //   })
    }
    return verifyPromise
}

async function sendEmail(mailOptions) {
    const smtp = getEmailTransporter()
    const startedAt = Date.now()
    const info = await smtp.sendMail(mailOptions)
    const durationMs = Date.now() - startedAt
    //Opcional en caso de errores
    //console.log(`[EMAIL] to=${mailOptions.to} status=accepted time=${durationMs}ms messageId=${info.messageId}`)
    return info
}

module.exports = { getEmailTransporter, warmupEmailTransporter, sendEmail }