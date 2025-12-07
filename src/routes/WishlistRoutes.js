const express = require('express');
const WishlistController = require('../controllers/WishlistController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, WishlistController.getByUser);
router.post('/', protect, WishlistController.addToWishlist);
router.delete('/:id', protect, WishlistController.removeFromWishlist);

module.exports = router;