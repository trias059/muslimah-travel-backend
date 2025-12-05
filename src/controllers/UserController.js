const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const createError = require('http-errors')
const {
    findEmail,
    create,
    updateResetToken,
    findByResetToken,
    updatePassword,
    updateUser,
    deleteUser
} = require('../models/users.js')
const commonHelper = require('../helper/common')
const authHelper = require('../helper/auth.js')
const pool = require('../config/db.js')

const UserController = {
    register: async (req, res, next) => {
        try {
            const { email, password, fullname, phone_number } = req.body
            const { rowCount } = await findEmail(email)
            
            if (rowCount) {
                return next(createError(403, "Email is already used"))
            }

            const passwordHash = bcrypt.hashSync(password, 10)
            const data = {
                id: crypto.randomUUID(), 
                email,
                passwordHash,
                fullname,
                phoneNumber: phone_number,
                role: 'user'
            }

            create(data)
                .then(result => commonHelper.response(res, result.rows, 201, "Register success"))
                .catch(err => res.send(err))

        } catch (error) {
            console.log(error)
            next(createError(500, "Server error"))
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body
            const { rows: [user] } = await findEmail(email)

            if (!user) {
                return commonHelper.response(res, null, 403, 'Email is invalid')
            }

            const isValidPassword = bcrypt.compareSync(password, user.password)

            if (!isValidPassword) {
                return commonHelper.response(res, null, 403, 'Password is invalid')
            }

            delete user.password
            delete user.reset_password_token
            delete user.reset_password_expires

            const payload = {
                email: user.email,
                role: user.role
            }

            const responseData = { 
                id: user.id,
                fullname: user.full_name,
                email: user.email,
                phoneNumber: user.phone_number,
                role: user.role,
                avatar: user.avatar_url,
                token: authHelper.generateToken(payload),
                refreshToken: authHelper.generateRefreshToken(payload)
            }

            commonHelper.response(res, responseData, 200, 'Login success')
        } catch (error) {
            console.log(error)
            next(createError(500, "Server error"))
        }
    },

    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.body
            const { rows: [user] } = await findEmail(email)

            if (!user) {
                return commonHelper.response(res, null, 404, 'Email not found')
            }

            const resetToken = crypto.randomUUID() 
            const now = Date.now()
            const sixHours = 6 * 60 * 60 * 1000
            const resetExpires = new Date(now + sixHours)

            await updateResetToken(email, resetToken, resetExpires)

            commonHelper.response(res, { resetToken }, 200, 'Reset token generated')

        } catch (error) {
            console.log(error)
            next(createError(500, "Server error"))
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            const { token, newPassword } = req.body
            const { rows: [user] } = await findByResetToken(token)

            if (!user) {
                return commonHelper.response(res, null, 400, 'Invalid or expired token')
            }

            const expiresFixed = new Date(new Date(user.reset_password_expires).getTime() + 7 * 60 * 60 * 1000)
            
            if (new Date() > expiresFixed) {
                return commonHelper.response(res, null, 400, 'Token has expired')
            }

            const passwordHash = bcrypt.hashSync(newPassword, 10)
            await updatePassword(user.email, passwordHash)

            commonHelper.response(res, null, 200, 'Password reset success')

        } catch (error) {
            console.log(error)
            next(createError(500, "Server error"))
        }
    },

    getProfile: async (req, res, next) => {
        try {
            const { rows: [user] } = await findEmail(req.user.email)
            delete user.password
            commonHelper.response(res, user, 200, 'Get profile success')
        } catch (error) {
            console.log(error)
            next(createError(500, "Server error"))
        }
    },

    getAllUsers: async (req, res, next) => {
        try {
            const { rows } = await pool.query(
                'SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC'
            )
            commonHelper.response(res, rows, 200, 'Get all users success')
        } catch (error) {
            console.log(error)
            next(createError(500, "Server error"))
        }
    },

    updateUser: async (req, res, next) => {
        try {
            const { id } = req.params
            const { fullname, email } = req.body
            await updateUser(id, { fullname, email })
            commonHelper.response(res, null, 200, 'Update user success')
        } catch (error) {
            console.log(error)
            next(createError(500, "Server error"))
        }
    },

    deleteUser: async (req, res, next) => {
        try {
            const { id } = req.params
            await deleteUser(id)
            commonHelper.response(res, null, 200, 'Delete user success')
        } catch (error) {
            console.log(error)
            next(createError(500, "Server error"))
        }
    }
}

module.exports = UserController;
