const express = require('express');
const TestimonialController = require('../controllers/TestimonialController');

const router = express.Router()

router.get('/', TestimonialController.getFeatured)

module.exports = router;