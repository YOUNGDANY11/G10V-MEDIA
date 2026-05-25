const { Router } = require('express')

const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const weekController = require('../controllers/weekController')

const router = Router()

router.get('/', auth, role(1), weekController.getAll)
router.post('/', auth, role(1), weekController.create)
router.delete('/:id', auth, role(1), weekController.deleteWeek)

module.exports = router