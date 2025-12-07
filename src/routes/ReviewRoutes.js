const express = require('express');
const ReviewController = require('../controllers/ReviewController');
const { protect } = require('../middlewares/auth');
const { uploadReviewImages, handleMulterError } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', protect, ReviewController.getAll);
router.post('/', protect, ReviewController.createReview);
router.put('/:id', protect, ReviewController.updateReview);
router.delete('/:id', protect, ReviewController.deleteReview);
router.post(
    '/:id/media',
    protect,
    uploadReviewImages,
    handleMulterError,
    ReviewController.uploadMedia
);

module.exports = router;