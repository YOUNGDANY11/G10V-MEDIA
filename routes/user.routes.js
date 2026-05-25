const { Router } = require('express')

const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const userController = require('../controllers/userController')

const router = Router()

router.get('/me', auth, userController.getByUserActive)
router.get('/', auth, role(1), userController.getAll)
router.get('/:id', auth, role(1), userController.getById)
router.post('/lastname', auth, role(1), userController.getByLastName)
router.post('/', auth, role(1), userController.create)
router.put('/:id', auth, role(1), userController.update)
router.delete('/:id', auth, role(1), userController.deleteUser)

module.exports = router