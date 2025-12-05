const express = require('express');
const PackageController = require('../controllers/PackageController');

const router = express.Router()

router.get('/featured', PackageController.getFeatured)

module.exports = router;