const { Router } = require('express')

const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const attendanceController = require('../controllers/attendanceController')

const router = Router()

router.get('/training/:id', auth, role(1), attendanceController.getByIdTraining)
router.get('/:id', auth, role(1), attendanceController.getById)
router.get('/', auth, role(1), attendanceController.getAll)
router.post('/', auth, role(2), attendanceController.create)

module.exports = router