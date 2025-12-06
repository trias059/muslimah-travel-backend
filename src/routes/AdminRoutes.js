const express = require('express');
const AdminController = require('../controllers/AdminController');
const { protect, isAdmin } = require('../middlewares/auth');

const router = express.Router();
router.use(protect, isAdmin);

router.get('/dashboard/stats', protect, isAdmin, AdminController.getDashboardStats);

router.get('/users', protect, isAdmin, AdminController.getAllUsers);
router.get('/users/search', protect, isAdmin, AdminController.searchUsers);
router.post('/users', protect, isAdmin, AdminController.createUser);
router.put('/users/:id', protect, isAdmin, AdminController.updateUser);
router.delete('/users/:id', protect, isAdmin, AdminController.deleteUser);

router.get('/packages', protect, isAdmin, AdminController.getAllPackages);
router.get('/packages/search', protect, isAdmin, AdminController.searchPackages);
router.get('/packages/:id', protect, isAdmin, AdminController.getPackageDetail);
router.post('/packages', protect, isAdmin, AdminController.createPackage);
router.put('/packages/:id', protect, isAdmin, AdminController.updatePackage);
router.delete('/packages/:id', protect, isAdmin, AdminController.deletePackage);

router.get('/articles', protect, isAdmin, AdminController.getAllArticles);
router.get('/articles/:id', protect, isAdmin, AdminController.getArticleDetail);
router.post('/articles', protect, isAdmin, AdminController.createArticle);
router.put('/articles/:id', protect, isAdmin, AdminController.updateArticle);
router.delete('/articles/:id', protect, isAdmin, AdminController.deleteArticle);
router.patch('/articles/:id/publish', protect, isAdmin, AdminController.togglePublish);

router.get('/orders', protect, isAdmin, AdminController.getAllOrders);
router.get('/orders/:booking_id', protect, isAdmin, AdminController.getOrderDetail);
router.patch('/orders/:booking_id/status', protect, isAdmin, AdminController.updateOrderStatus);
router.patch('/orders/:booking_id/payment', protect, isAdmin, AdminController.updatePaymentStatus);

router.get('/community', protect, isAdmin, AdminController.getAllCommunityPosts);
router.get('/community/:id', protect, isAdmin, AdminController.getCommunityPostDetail);
router.delete('/community/:id', protect, isAdmin, AdminController.deleteCommunityPost);
module.exports = router;