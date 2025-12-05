const express = require('express');
const WishlistController = require('../controllers/WishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router()

router.get('/', protect, WishlistController.getByUser)

module.exports = router;