const pool = require('../config/db');

const PaymentModel = {
    findByBookingId: (bookingId) => {
        return pool.query(
            `SELECT 
                id, booking_id, base_price, additional_fees, total_amount,
                payment_status, payment_method, payment_proof_url,
                payment_deadline, paid_at, created_at, updated_at
             FROM payments 
             WHERE booking_id = $1`,
            [bookingId]
        );
    },

    create: (data) => {
        const { bookingId, basePrice, additionalFees, totalAmount, paymentDeadline } = data;
        return pool.query(
            `INSERT INTO payments (
                booking_id, base_price, additional_fees, total_amount, 
                payment_status, payment_deadline
            ) VALUES ($1, $2, $3, $4, 'unpaid', $5)
            RETURNING *`,
            [bookingId, basePrice, additionalFees, totalAmount, paymentDeadline]
        );
    },

    updatePaymentProof: (paymentId, proofUrl, paymentMethod) => {
        return pool.query(
            `UPDATE payments 
             SET payment_proof_url = $1,
                 payment_method = $2,
                 payment_status = 'pending',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [proofUrl, paymentMethod, paymentId]
        );
    },

    updatePaymentStatus: (paymentId, status) => {
        return pool.query(
            `UPDATE payments 
             SET payment_status = $1,
                 paid_at = CASE WHEN $1 = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, paymentId]
        );
    }
};

module.exports = PaymentModel;