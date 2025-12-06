const AdminModel = require('../models/AdminModel');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const commonHelper = require('../helper/common');
const createError = require('http-errors');

const AdminController = {
    getDashboardStats: async (req, res, next) => {
        try {
            const { rows: [stats] } = await AdminModel.getDashboardStats();
            const { rows: salesPerformance } = await AdminModel.getSalesPerformance();
            const { rows: agentPerformance } = await AdminModel.getAgentPerformance();
            const { rows: upcomingTrips } = await AdminModel.getUpcomingTrips();

            const response = {
                total_booking: stats.total_booking || 0,
                profit: stats.total_profit || 0,
                active_customer: stats.active_customer || 0,
                confirmed_booking: stats.confirmed_booking || 0,
                pending_booking: stats.pending_booking || 0,
                cancelled: stats.cancelled || 0,
                sales_performance: salesPerformance,
                agent_performance: agentPerformance,
                upcoming_trips: upcomingTrips
            };

            commonHelper.response(res, response, 200, 'Get dashboard stats success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    getAllUsers: async (req, res, next) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { rows } = await AdminModel.getAllUsers(limit, offset);
            const { rows: [{ count }] } = await AdminModel.countAllUsers();

            const response = {
                users: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_items: parseInt(count),
                    total_pages: Math.ceil(count / limit)
                }
            };

            commonHelper.response(res, response, 200, 'Get all users success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    searchUsers: async (req, res, next) => {
        try {
            const { q } = req.query;

            if (!q) {
                return commonHelper.response(res, null, 400, 'Search query required');
            }

            const { rows } = await AdminModel.searchUsers(q);

            commonHelper.response(res, rows, 200, 'Search users success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    createUser: async (req, res, next) => {
        try {
            const { fullname, email, phone_number, password, role = 'user' } = req.body;

            const passwordHash = bcrypt.hashSync(password, 10);
            const userData = {
                id: crypto.randomUUID(),
                fullname,
                email,
                phone_number,
                password: passwordHash,
                role
            };

            const { rows: [user] } = await AdminModel.createUser(userData);

            commonHelper.response(res, user, 201, 'User created successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    updateUser: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { fullname, email, phone_number, role } = req.body;

            const userData = { fullname, email, phone_number, role };

            const { rows: [user] } = await AdminModel.updateUser(id, userData);

            if (!user) {
                return commonHelper.response(res, null, 404, 'User not found');
            }

            commonHelper.response(res, user, 200, 'User updated successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    deleteUser: async (req, res, next) => {
        try {
            const { id } = req.params;

            const { rows: [user] } = await AdminModel.deleteUser(id);

            if (!user) {
                return commonHelper.response(res, null, 404, 'User not found');
            }

            commonHelper.response(res, null, 200, 'User deleted successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    getAllPackages: async (req, res, next) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { rows } = await AdminModel.getAllPackages(limit, offset);
            const { rows: [{ count }] } = await AdminModel.countAllPackages();

            const response = {
                packages: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_items: parseInt(count),
                    total_pages: Math.ceil(count / limit)
                }
            };

            commonHelper.response(res, response, 200, 'Get all packages success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    searchPackages: async (req, res, next) => {
        try {
            const { q } = req.query;

            if (!q) {
                return commonHelper.response(res, null, 400, 'Search query required');
            }

            const { rows } = await AdminModel.searchPackages(q);

            commonHelper.response(res, rows, 200, 'Search packages success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    getPackageDetail: async (req, res, next) => {
        try {
            const { id } = req.params;

            const { rows: [packageData] } = await AdminModel.getPackageById(id);

            if (!packageData) {
                return commonHelper.response(res, null, 404, 'Package not found');
            }

            commonHelper.response(res, packageData, 200, 'Get package detail success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    createPackage: async (req, res, next) => {
        try {
            const {
                name,
                destination_id,
                image_url,
                start_date,
                price,
                duration_days,
                itinerary,
                quota,
                facilities,
                max_participants
            } = req.body;

            const packageData = {
                id: crypto.randomUUID(),
                name,
                destination_id,
                image_url,
                start_date,
                price,
                duration_days,
                itinerary,
                quota,
                facilities,
                max_participants
            };

            const { rows: [newPackage] } = await AdminModel.createPackage(packageData);

            commonHelper.response(res, newPackage, 201, 'Package created successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    updatePackage: async (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                name,
                destination_id,
                image_url,
                start_date,
                price,
                duration_days,
                itinerary,
                quota,
                facilities,
                max_participants
            } = req.body;

            const packageData = {
                name,
                destination_id,
                image_url,
                start_date,
                price,
                duration_days,
                itinerary,
                quota,
                facilities,
                max_participants
            };

            const { rows: [updatedPackage] } = await AdminModel.updatePackage(id, packageData);

            if (!updatedPackage) {
                return commonHelper.response(res, null, 404, 'Package not found');
            }

            commonHelper.response(res, updatedPackage, 200, 'Package updated successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    deletePackage: async (req, res, next) => {
        try {
            const { id } = req.params;

            const { rows: [deletedPackage] } = await AdminModel.deletePackage(id);

            if (!deletedPackage) {
                return commonHelper.response(res, null, 404, 'Package not found');
            }

            commonHelper.response(res, null, 200, 'Package deleted successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    getAllArticles: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const offset = (page - 1) * limit;

            const { rows } = await AdminModel.getAllArticles(limit, offset, status);
            const { rows: [{ count }] } = await AdminModel.countAllArticles(status);

            const response = {
                articles: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_items: parseInt(count),
                    total_pages: Math.ceil(count / limit)
                }
            };

            commonHelper.response(res, response, 200, 'Get all articles success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    getArticleDetail: async (req, res, next) => {
        try {
            const { id } = req.params;

            const { rows: [article] } = await AdminModel.getArticleById(id);

            if (!article) {
                return commonHelper.response(res, null, 404, 'Article not found');
            }

            commonHelper.response(res, article, 200, 'Get article detail success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    createArticle: async (req, res, next) => {
        try {
            const {
                title,
                slug,
                category,
                cover_image_url,
                content,
                excerpt,
                is_published = false
            } = req.body;

            const articleData = {
                id: crypto.randomUUID(),
                title,
                slug,
                category,
                cover_image_url,
                content,
                excerpt,
                author_id: req.user.id,
                is_published
            };

            const { rows: [article] } = await AdminModel.createArticle(articleData);

            commonHelper.response(res, article, 201, 'Article created successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    updateArticle: async (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                title,
                slug,
                category,
                cover_image_url,
                content,
                excerpt,
                is_published
            } = req.body;

            const articleData = {
                title,
                slug,
                category,
                cover_image_url,
                content,
                excerpt,
                is_published
            };

            const { rows: [article] } = await AdminModel.updateArticle(id, articleData);

            if (!article) {
                return commonHelper.response(res, null, 404, 'Article not found');
            }

            commonHelper.response(res, article, 200, 'Article updated successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    deleteArticle: async (req, res, next) => {
        try {
            const { id } = req.params;

            const { rows: [article] } = await AdminModel.deleteArticle(id);

            if (!article) {
                return commonHelper.response(res, null, 404, 'Article not found');
            }

            commonHelper.response(res, null, 200, 'Article deleted successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    togglePublish: async (req, res, next) => {
        try {
            const { id } = req.params;

            const { rows: [article] } = await AdminModel.togglePublishArticle(id);

            if (!article) {
                return commonHelper.response(res, null, 404, 'Article not found');
            }

            const message = article.is_published ? 'Article published successfully' : 'Article unpublished successfully';

            commonHelper.response(res, article, 200, message);

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    getAllOrders: async (req, res, next) => {
        try {
            const { status, search, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { rows } = await AdminModel.getAllOrders({ status, search, limit, offset });
            const { rows: [stats] } = await AdminModel.getOrderStats();
            const { rows: [{ count }] } = await AdminModel.countAllOrders({ status, search });

            const response = {
                stats: {
                    total_booking: parseInt(stats.total_booking) || 0,
                    confirmed_booking: parseInt(stats.confirmed) || 0,
                    pending_booking: parseInt(stats.pending) || 0,
                    cancelled: parseInt(stats.cancelled) || 0
                },
                orders: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_items: parseInt(count),
                    total_pages: Math.ceil(count / limit)
                }
            };

            commonHelper.response(res, response, 200, 'Get all orders success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    getOrderDetail: async (req, res, next) => {
        try {
            const { booking_id } = req.params;

            const { rows: [order] } = await AdminModel.getOrderById(booking_id);

            if (!order) {
                return commonHelper.response(res, null, 404, 'Order not found');
            }

            commonHelper.response(res, order, 200, 'Get order detail success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    updateOrderStatus: async (req, res, next) => {
        try {
            const { booking_id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return commonHelper.response(res, null, 400, 'Invalid status. Must be: pending, confirmed, completed, or cancelled');
            }

            const { rows: [order] } = await AdminModel.updateOrderStatus(booking_id, status);

            if (!order) {
                return commonHelper.response(res, null, 404, 'Order not found');
            }

            commonHelper.response(res, order, 200, 'Order status updated successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    updatePaymentStatus: async (req, res, next) => {
        try {
            const { booking_id } = req.params;
            const { payment_status } = req.body;

            const validPaymentStatuses = ['unpaid', 'paid', 'refunded'];
            if (!validPaymentStatuses.includes(payment_status)) {
                return commonHelper.response(res, null, 400, 'Invalid payment status. Must be: unpaid, paid, or refunded');
            }

            const { rows: [order] } = await AdminModel.updatePaymentStatus(booking_id, payment_status);

            if (!order) {
                return commonHelper.response(res, null, 404, 'Order not found');
            }

            commonHelper.response(res, order, 200, 'Payment status updated successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    getAllCommunityPosts: async (req, res, next) => {
        try {
            const { month, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { rows } = await AdminModel.getAllCommunityPosts({ month, limit, offset });
            const { rows: [{ count }] } = await AdminModel.countAllCommunityPosts(month);

            const response = {
                posts: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_items: parseInt(count),
                    total_pages: Math.ceil(count / limit)
                }
            };

            commonHelper.response(res, response, 200, 'Get all community posts success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    getCommunityPostDetail: async (req, res, next) => {
        try {
            const { id } = req.params;

            const { rows: [post] } = await AdminModel.getCommunityPostById(id);

            if (!post) {
                return commonHelper.response(res, null, 404, 'Post not found');
            }

            commonHelper.response(res, post, 200, 'Get post detail success');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    deleteCommunityPost: async (req, res, next) => {
        try {
            const { id } = req.params;

            const { rows: [post] } = await AdminModel.deleteCommunityPost(id);

            if (!post) {
                return commonHelper.response(res, null, 404, 'Post not found');
            }

            commonHelper.response(res, null, 200, 'Post deleted successfully');

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    },

    moderateCommunityPost: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['approved', 'rejected', 'pending'];
            if (!validStatuses.includes(status)) {
                return commonHelper.response(res, null, 400, 'Invalid status. Must be: approved, rejected, or pending');
            }

            const { rows: [post] } = await AdminModel.moderateCommunityPost(id, status);

            if (!post) {
                return commonHelper.response(res, null, 404, 'Post not found');
            }

            commonHelper.response(res, post, 200, `Post ${status} successfully`);

        } catch (error) {
            console.log(error);
            next(createError(500, "Server error"));
        }
    }
};

module.exports = AdminController;