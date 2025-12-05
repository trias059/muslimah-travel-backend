const express = require('express');
const DestinationController = require('../controllers/DestinationController');

const router = express.Router()

router.get('/search', DestinationController.search)

module.exports = router;