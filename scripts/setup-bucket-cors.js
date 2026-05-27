/**
 * Script de configuración única — ejecutar UNA vez:
 *   node scripts/setup-bucket-cors.js
 *
 * Configura la política CORS del bucket de Railway para permitir
 * que el frontend suba videos directamente (presigned PUT URL).
 */
require('dotenv').config()

const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3')

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

async function main() {
    console.log(`Configurando CORS en bucket: ${BUCKET}`)

    await s3.send(new PutBucketCorsCommand({
        Bucket: BUCKET,
        CORSConfiguration: {
            CORSRules: [
                {
                    // Permitir subidas desde cualquier origen (presigned PUT)
                    AllowedOrigins: ['*'],
                    AllowedMethods: ['GET', 'PUT', 'HEAD'],
                    AllowedHeaders: ['*'],
                    ExposeHeaders:  ['ETag', 'Content-Length'],
                    MaxAgeSeconds:  3600,
                },
            ],
        },
    }))

    console.log('✅ CORS configurado correctamente.')

    // Verificar que quedó bien
    const { CORSRules } = await s3.send(new GetBucketCorsCommand({ Bucket: BUCKET }))
    console.log('Reglas activas:', JSON.stringify(CORSRules, null, 2))
}

main().catch((err) => {
    console.error('❌ Error:', err.message)
    process.exit(1)
})
