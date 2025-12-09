const express = require('express');
const AdminController = require('../controllers/AdminController');
const { protect, isAdmin } = require('../middlewares/auth');
const uploadPackageImage = require('../middlewares/uploadadmin');
const uploadUserAvatar = require('../middlewares/uploadAvatar');
const { 
    adminLimiter, 
    uploadLimiter, 
    searchLimiter 
} = require('../middlewares/rateLimiter');

const router = express.Router();

router.use(adminLimiter);

router.get('/dashboard/stats', protect, isAdmin, AdminController.getDashboardStats);
router.get('/dashboard/top-packages', protect, isAdmin, AdminController.getTopPackages);
router.get('/dashboard/top-buyers', protect, isAdmin, AdminController.getTopBuyers);
router.get('/dashboard/booking-status', protect, isAdmin, AdminController.getBookingStatus);
router.get('/dashboard/recent-bookings', protect, isAdmin, AdminController.getRecentBookings);

router.get('/users', protect, isAdmin, AdminController.getAllUsers);
router.get('/users/search', protect, isAdmin, searchLimiter, AdminController.searchUsers);
router.get('/users/:id', protect, isAdmin, AdminController.getUserDetail);
router.post('/users', protect, isAdmin, AdminController.createUser);
router.put('/users/:id', protect, isAdmin, AdminController.updateUser);
router.delete('/users/:id', protect, isAdmin, AdminController.deleteUser);

router.get('/packages', protect, isAdmin, AdminController.getAllPackages);
router.get('/packages/search', protect, isAdmin, searchLimiter, AdminController.searchPackages);
router.get('/packages/:id', protect, isAdmin, AdminController.getPackageDetail);

router.post(
    '/packages',
    protect,
    isAdmin,
    uploadLimiter,
    uploadPackageImage,
    AdminController.createPackage
);

router.put(
    '/packages/:id',
    protect,
    isAdmin,
    uploadLimiter,
    uploadPackageImage,
    AdminController.updatePackage
);

router.delete('/packages/:id', protect, isAdmin, AdminController.deletePackage);

router.get('/articles', protect, isAdmin, AdminController.getAllArticles);
router.get('/articles/search', protect, isAdmin, searchLimiter, AdminController.searchArticles);
router.get('/articles/:id', protect, isAdmin, AdminController.getArticleDetail);
router.post('/articles', protect, isAdmin, AdminController.createArticle);
router.put('/articles/:id', protect, isAdmin, AdminController.updateArticle);
router.delete('/articles/:id', protect, isAdmin, AdminController.deleteArticle);

router.get('/orders', protect, isAdmin, AdminController.getAllOrders);
router.get('/orders/:tour_id', protect, isAdmin, AdminController.getOrderDetail);
router.patch('/orders/:booking_id/status', protect, isAdmin, AdminController.updateOrderStatus);
router.patch('/orders/:booking_id/payment', protect, isAdmin, AdminController.updatePaymentStatus);

router.get('/profile', protect, isAdmin, AdminController.getAdminProfile);
router.put('/profile', protect, isAdmin, AdminController.updateAdminProfile);

router.post(
    '/profile/photo',
    protect,
    isAdmin,
    uploadLimiter,
    uploadUserAvatar,
    AdminController.uploadAdminPhoto
);

router.delete('/profile/photo', protect, isAdmin, AdminController.deleteAdminPhoto);

router.get('/community', protect, isAdmin, AdminController.getAllCommunityPosts);
router.get('/community/:id', protect, isAdmin, AdminController.getCommunityPostDetail);
router.delete('/community/:id', protect, isAdmin, AdminController.deleteCommunityPost);

module.exports = router;