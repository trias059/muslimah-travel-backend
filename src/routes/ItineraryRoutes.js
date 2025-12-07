const express = require('express');
const ItineraryController = require('../controllers/ItineraryController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/tour-packages/:package_id/itineraries', protect, ItineraryController.getByPackageId);

module.exports = router;