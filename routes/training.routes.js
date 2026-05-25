const { Router } = require('express')

const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const trainingController = require('../controllers/trainingController')

const router = Router()

router.get('/location', auth, trainingController.getByLocation)
router.get('/', auth, trainingController.getAll)
router.get('/:id', auth, trainingController.getById)
router.post('/', auth, role(1), trainingController.create)
router.put('/:id', auth, role(1), trainingController.update)
router.delete('/:id', auth, role(1), trainingController.deleteTraining)

module.exports = router