const https = require('https')

function parseSender(from) {
    const match = String(from).match(/^"?([^"<]+)"?\s*<([^>]+)>$/)
    return match
        ? { name: match[1].trim(), email: match[2].trim() }
        : { email: String(from).trim() }
}

async function sendEmail({ from, to, subject, text, html }) {
    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) throw new Error('Falta BREVO_API_KEY en variables de entorno')

    const payload = JSON.stringify({
        sender: parseSender(from),
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
    })

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.brevo.com',
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        }, (res) => {
            let data = ''
            res.on('data', chunk => { data += chunk })
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data)
                    if (res.statusCode >= 400) {
                        reject(new Error(parsed.message || `Brevo error ${res.statusCode}`))
                    } else {
                        resolve(parsed)
                    }
                } catch {
                    reject(new Error(`Brevo respuesta invalida: ${data}`))
                }
            })
        })
        req.on('error', reject)
        req.write(payload)
        req.end()
    })
}

module.exports = { sendEmail }
