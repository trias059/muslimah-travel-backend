const express = require('express');
const ArticleController = require('../controllers/ArticleController');

const router = express.Router()

router.get('/latest', ArticleController.getLatest)

module.exports = router;