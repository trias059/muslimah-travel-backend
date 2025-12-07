const express = require('express');
const ForumController = require('../controllers/ForumController');
const { protect } = require('../middlewares/auth');

const router = express.Router();
router.get('/stats', ForumController.getStatistics);
router.get('/', ForumController.getAll);
router.get('/:id', ForumController.getById);
router.post('/', protect, ForumController.createTopic);
router.put('/:id', protect, ForumController.updateTopic);
router.delete('/:id', protect, ForumController.deleteTopic);
router.post('/:id/comments', protect, ForumController.createComment);
router.delete('/comments/:comment_id', protect, ForumController.deleteComment);

module.exports = router;