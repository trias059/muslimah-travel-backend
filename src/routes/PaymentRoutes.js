const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const { protect } = require('../middlewares/auth');
const { uploadAvatar } = require('../middlewares/upload'); 

const router = express.Router();

router.get('/:booking_id', protect, PaymentController.getPaymentDetail);

router.put(
    '/:booking_id/proof',
    protect,
    uploadAvatar.single('payment_proof'), 
    PaymentController.uploadPaymentProof
);

module.exports = router;