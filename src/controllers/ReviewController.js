const { 
    findAll, 
    findById, 
    create, 
    update, 
    remove,
    checkBookingReview,
    addMedia
} = require('../models/ReviewModel');
const { findById: findBookingById } = require('../models/BookingModel');
const cloudinary = require('../config/cloudinary');
const commonHelper = require('../helper/common');

const ReviewController = {
    getAll: async (req, res) => {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { rows } = await findAll(userId, limit, offset);

            commonHelper.success(res, rows, 'Get reviews successful');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    createReview: async (req, res) => {
        try {
            const { booking_id, rating, comment } = req.body;
            const userId = req.user.id;

            if (!booking_id || !rating || !comment) {
                return commonHelper.badRequest(res, 'booking_id, rating, and comment are required');
            }

            if (rating < 1 || rating > 5) {
                return commonHelper.badRequest(res, 'Rating must be between 1.0 and 5.0');
            }

            const booking = await findBookingById(booking_id);
            if (!booking) {
                return commonHelper.notFound(res, 'Booking not found');
            }
            if (booking.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this booking');
            }
            if (booking.completion_status !== 'done') {
                return commonHelper.badRequest(res, 'Can only review completed bookings');
            }

            const { rows: [existing] } = await checkBookingReview(booking_id);
            if (existing) {
                return commonHelper.badRequest(res, 'You have already reviewed this booking');
            }

            const { rows: [review] } = await create({
                userId,
                bookingId: booking_id,
                packageId: booking.package_id,
                rating,
                comment
            });

            commonHelper.created(res, {
                id: review.id,
                rating: review.rating,
                is_published: review.is_published
            }, 'Review submitted for moderation');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    updateReview: async (req, res) => {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.id;

            if (!rating && !comment) {
                return commonHelper.badRequest(res, 'At least rating or comment is required');
            }

            if (rating && (rating < 1 || rating > 5)) {
                return commonHelper.badRequest(res, 'Rating must be between 1.0 and 5.0');
            }

            const { rows: [review] } = await findById(id);
            if (!review) {
                return commonHelper.notFound(res, 'Review not found');
            }
            if (review.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this review');
            }

            const { rows: [updated] } = await update(id, { rating, comment });

            commonHelper.success(res, updated, 'Review updated successfully');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    deleteReview: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const { rows: [review] } = await findById(id);
            if (!review) {
                return commonHelper.notFound(res, 'Review not found');
            }
            if (review.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this review');
            }

            await remove(id);

            commonHelper.success(res, null, 'Review deleted successfully');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    uploadMedia: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            if (!req.files || req.files.length === 0) {
                return commonHelper.badRequest(res, 'At least one media file is required');
            }

            const { rows: [review] } = await findById(id);
            if (!review) {
                return commonHelper.notFound(res, 'Review not found');
            }
            if (review.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this review');
            }

            const mediaUrls = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'muslimah-travel/review-media',
                    public_id: `review_${id}_${Date.now()}_${Math.random()}`
                });
                
                await addMedia(id, result.secure_url, 'image');
                mediaUrls.push(result.secure_url);
            }

            commonHelper.success(res, { media_urls: mediaUrls }, 'Media uploaded successfully');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    }
};

module.exports = ReviewController;