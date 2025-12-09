const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files allowed!'), false);
  }
  cb(null, true);
};

const storageAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars');
  },
  filename: function (req, file, cb) {
    cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadAvatar = multer({
  storage: storageAvatar,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter
});

const reviewImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'muslimah-travel/review-media',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const uploadReviewMedia = multer({
  storage: reviewImageStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: imageFilter
});

const paymentProofStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/payment-proofs');
  },
  filename: function (req, file, cb) {
    cb(null, `proof-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadImage = multer({
  storage: paymentProofStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
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

module.exports = {
  uploadAvatar,
  uploadReviewMedia,
  uploadImage,
  handleMulterError
};