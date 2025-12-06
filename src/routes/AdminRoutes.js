const express = require('express');
const AdminController = require('../controllers/AdminController');
const { protect, isAdmin } = require('../middlewares/auth');

const router = express.Router();
router.use(protect, isAdmin);

router.get('/dashboard/stats', AdminController.getDashboardStats);

router.get('/users', AdminController.getAllUsers);
router.get('/users/search', AdminController.searchUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

router.get('/packages', AdminController.getAllPackages);
router.get('/packages/search', AdminController.searchPackages);
router.get('/packages/:id', AdminController.getPackageDetail);
router.post('/packages', AdminController.createPackage);
router.put('/packages/:id', AdminController.updatePackage);
router.delete('/packages/:id', AdminController.deletePackage);

router.get('/articles', AdminController.getAllArticles);
router.get('/articles/:id', AdminController.getArticleDetail);
router.post('/articles', AdminController.createArticle);
router.put('/articles/:id', AdminController.updateArticle);
router.delete('/articles/:id', AdminController.deleteArticle);
router.patch('/articles/:id/publish', AdminController.togglePublish);

router.get('/orders', AdminController.getAllOrders);
router.get('/orders/:booking_id', AdminController.getOrderDetail);
router.patch('/orders/:booking_id/status', AdminController.updateOrderStatus);
router.patch('/orders/:booking_id/payment', AdminController.updatePaymentStatus);

router.get('/community', AdminController.getAllCommunityPosts);
router.get('/community/:id', AdminController.getCommunityPostDetail);
router.delete('/community/:id', AdminController.deleteCommunityPost);

module.exports = router;