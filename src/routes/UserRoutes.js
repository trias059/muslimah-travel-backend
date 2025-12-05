const express = require('express');
const AuthController = require('../controllers/AuthController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router()

router.get('/profile', protect, AuthController.getProfile)
router.get('/users', protect, isAdmin, AuthController.getAllUsers)

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/forgot-password', AuthController.forgotPassword)
router.post('/reset-password', AuthController.resetPassword)

router.put('/users/:id', protect, isAdmin, AuthController.updateUser)

router.delete('/users/:id', protect, isAdmin, AuthController.deleteUser)

module.exports = router;