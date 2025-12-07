const {
    findByBookingId,
    updatePaymentProof,
    updatePaymentStatus
} = require('../models/PaymentModel');
const { findById: findBookingById } = require('../models/BookingModel');
const cloudinary = require('../config/cloudinary');
const commonHelper = require('../helper/common');

const PaymentController = {
    getPaymentDetail: async (req, res) => {
        try {
            const { booking_id } = req.params;
            const userId = req.user.id;

            const booking = await findBookingById(booking_id);
            if (!booking) {
                return commonHelper.notFound(res, 'Booking not found');
            }
            if (booking.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this payment');
            }

            const { rows: [payment] } = await findByBookingId(booking_id);
            if (!payment) {
                return commonHelper.notFound(res, 'Payment not found');
            }

            commonHelper.success(res, payment, 'Get payment detail successful');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    uploadPaymentProof: async (req, res) => {
        try {
            const { booking_id } = req.params;
            const { payment_method } = req.body;
            const userId = req.user.id;

            if (!req.file) {
                return commonHelper.badRequest(res, 'Payment proof file is required');
            }

            const booking = await findBookingById(booking_id);
            if (!booking) {
                return commonHelper.notFound(res, 'Booking not found');
            }
            if (booking.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this payment');
            }

            const { rows: [payment] } = await findByBookingId(booking_id);
            if (!payment) {
                return commonHelper.notFound(res, 'Payment not found');
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'muslimah-travel/payment-proofs',
                public_id: `proof_${booking_id}_${Date.now()}`
            });

            const { rows: [updatedPayment] } = await updatePaymentProof(
                payment.id,
                result.secure_url,
                payment_method || 'bank_transfer'
            );

            commonHelper.success(res, {
                payment_status: updatedPayment.payment_status,
                payment_proof_url: updatedPayment.payment_proof_url
            }, 'Payment proof uploaded successfully');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    }
};

module.exports = PaymentController;