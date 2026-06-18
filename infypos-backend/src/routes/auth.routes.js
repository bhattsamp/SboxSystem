const router = require('express').Router()
const ctrl   = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth')

router.post('/login',           ctrl.login)
router.post('/logout',          protect, ctrl.logout)
router.get('/me',               protect, ctrl.getMe)
router.put('/change-password',  protect, ctrl.changePassword)
router.post('/forgot-password',          ctrl.forgotPassword)

module.exports = router
