const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const { protect } = require('../middlewares/auth');
const { uploadImage, handleMulterError } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/:booking_id', protect, PaymentController.getPaymentDetail);

router.put(
    '/:booking_id/proof',
    protect,
    uploadImage,
    handleMulterError,
    PaymentController.uploadPaymentProof
);

module.exports = router;