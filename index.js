const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./docs/swagger')

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const trainingRoutes = require('./routes/training.routes')
const attendanceRoutes = require('./routes/attendance.routes')
const mediaRoutes = require('./routes/media.routes')
const weekRoutes = require('./routes/week.routes')
const passwordResetRoutes = require('./routes/passwordResetRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
	res.json({
		status: 'Success',
		mensaje: 'API activa'
	})
})

app.get('/api-docs.json', (req, res) => {
	res.json(swaggerSpec)
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/trainings', trainingRoutes)
app.use('/api/attendances', attendanceRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/weeks', weekRoutes)
app.use('/api/password-reset', passwordResetRoutes)

const port = process.env.PORT || 3000

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})

module.exports = app
