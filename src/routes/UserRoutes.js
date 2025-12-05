const express = require('express');
const UserController = require('../controllers/UserController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router()

router.get('/profile', protect, UserController.getProfile)
router.get('/users', protect, isAdmin, UserController.getAllUsers)

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/forgot-password', UserController.forgotPassword)
router.post('/reset-password', UserController.resetPassword)

router.put('/users/:id', protect, isAdmin, UserController.updateUser)

router.delete('/users/:id', protect, isAdmin, UserController.deleteUser)

module.exports = router;