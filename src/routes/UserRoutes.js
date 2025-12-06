const express = require('express');
const UserController = require('../controllers/UserController');
const { protect } = require('../middlewares/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'saleema-tour/avatars', 
        allowed_formats: ['jpg', 'jpeg', 'png'], 
        transformation: [
            { width: 500, height: 500, crop: 'limit' }, 
            { quality: 'auto' } 
        ],
        public_id: (req, file) => {
            return `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        }
    }
});

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 2 * 1024 * 1024 
    }
});

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

router.get('/profile', protect, UserController.getProfile);
router.put('/profile', protect, UserController.updateProfileUser);
router.post('/avatar', protect, upload.single('avatar'), UserController.uploadAvatar);
router.delete('/avatar', protect, UserController.deleteAvatarUser);

module.exports = router;