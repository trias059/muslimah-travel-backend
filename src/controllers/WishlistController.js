const commonHelper = require('../helper/common');
const { getByUserId, add, remove, checkExists } = require('../models/WishlistModel');
const pool = require('../config/db');

const WishlistController = {
    getByUser: async (req, res) => {
        try {
            const { rows } = await getByUserId(req.user.id);

            if (rows.length === 0) {
                return commonHelper.success(res, [], 'Wishlist is empty');
            }

            commonHelper.success(res, rows, 'Get wishlist successful');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    addToWishlist: async (req, res) => {
        try {
            const { tour_package_id } = req.body;
            const userId = req.user.id;

            if (!tour_package_id) {
                return commonHelper.badRequest(res, 'tour_package_id is required');
            }

            const { rows: [existing] } = await checkExists(userId, tour_package_id);
            if (existing) {
                return commonHelper.badRequest(res, 'Package already in wishlist');
            }

            const { rows: [wishlist] } = await add(userId, tour_package_id);

            commonHelper.created(res, {
                id: wishlist.id,
                tour_package_id: wishlist.package_id
            }, 'Added to wishlist');

        } catch (error) {
            console.log(error);
            if (error.code === '23503') {
                return commonHelper.notFound(res, 'Tour package not found');
            }
            commonHelper.error(res, 'Server error', 500);
        }
    },

    removeFromWishlist: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const { rows: [wishlist] } = await pool.query(
                'SELECT * FROM wishlists WHERE id = $1',
                [id]
            );

            if (!wishlist) {
                return commonHelper.notFound(res, 'Wishlist item not found');
            }

            if (wishlist.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this wishlist item');
            }

            await remove(id);

            commonHelper.success(res, null, 'Removed from wishlist');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    }
};

module.exports = WishlistController;