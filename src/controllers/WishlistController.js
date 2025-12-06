const createError = require('http-errors')
const commonHelper = require('../helper/common')
const pool = require('../config/db.js')
const { getByUserId } = require('../models/WishlistModel.js')

const WishlistController = {
    getByUser: async (req, res, next) => {
        try {
            const userId = req.user.email 
                      
            const { rows: [user] } = await pool.query(
                'SELECT id FROM users WHERE email = $1', 
                [userId]
            )

            if (!user) {
                return commonHelper.response(res, null, 401, 'Unauthorized')
            }

            const { rows } = await getByUserId(user.id)

            commonHelper.response(res, rows, 200, 'Success')
        } catch (error) {
            console.log(error)
            next(createError(500, "Server error"))
        }
    }
}

module.exports = WishlistController;