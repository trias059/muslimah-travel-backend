const multer = require('multer');
const path = require('path');
const commonHelper = require('../helper/common');

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const imageFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPG, JPEG, and PNG files are allowed!'), false);
    }
    
    cb(null, true);
};

const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 
    },
    fileFilter: imageFilter
});

const uploadReviewMedia = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: imageFilter
});

const uploadImage = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 
    },
    fileFilter: imageFilter
});

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return commonHelper.badRequest(res, 'File too large. Maximum size is 2MB');
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return commonHelper.badRequest(res, 'Unexpected field in file upload');
        }
        return commonHelper.badRequest(res, `Upload error: ${err.message}`);
    } else if (err) {
        return commonHelper.badRequest(res, err.message);
    }
    next();
};

module.exports = {
    uploadAvatar: uploadAvatar.single('avatar'),
    uploadReviewMedia: uploadReviewMedia.array('media', 5), 
    uploadImage: uploadImage.single('image'),
    handleMulterError
};