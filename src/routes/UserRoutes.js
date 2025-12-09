const express = require('express');
const UserController = require('../controllers/UserController');
const { protect } = require('../middlewares/auth');
const uploadUserAvatar = require('../middlewares/uploadAvatar');  

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', protect, UserController.logout);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

router.get('/profile', protect, UserController.getProfile);
router.put('/profile', protect, UserController.updateProfile);
router.post('/profile/avatar',
    protect,
    uploadUserAvatar,  
    UserController.uploadAvatar
);

router.delete('/profile/avatar', protect, UserController.deleteAvatar);
router.put('/profile/password', protect, UserController.changePassword);

module.exports = router;