const express = require('express');
const LocationController = require('../controllers/LocationController');

const router = express.Router()

router.get('/', LocationController.getAll)

module.exports = router;