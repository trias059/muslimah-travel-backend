const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { FILE_LIMITS, CLOUDINARY_FOLDERS } = require('../config/constants');

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: CLOUDINARY_FOLDERS.USER_AVATARS,
        allowed_formats: FILE_LIMITS.ALLOWED_IMAGE_FORMATS,
        public_id: () => `avatar-${Date.now()}`,
        transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
        ]
    }
});

const uploadUserAvatar = multer({
    storage: avatarStorage,
    limits: { 
        fileSize: FILE_LIMITS.IMAGE_MAX_SIZE,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP'), false);
        }
    }
}).single('avatar');

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Ukuran file terlalu besar. Maksimal 3MB',
                error: 'FILE_TOO_LARGE'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Hanya bisa upload 1 file',
                error: 'TOO_MANY_FILES'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Field name tidak sesuai. Gunakan "avatar"',
                error: 'UNEXPECTED_FIELD'
            });
        }
    }

    if (err && err.message.includes('Format file tidak didukung')) {
        return res.status(400).json({
            success: false,
            message: err.message,
            error: 'INVALID_FILE_FORMAT'
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'Error uploading file'
        });
    }

    next();
};

module.exports = uploadUserAvatar;
module.exports.handleMulterError = handleMulterError;