import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import createError from 'http-errors'
import { findEmail, create, updateResetToken, findByResetToken, updatePassword } from '../models/users.js'
import commonHelper from '../helper/common.js'
import authHelper from '../helper/auth.js'

const AuthController = {
    register: async (req, res, next) => {
        try {
            const { email, password, fullname } = req.body
            const { rowCount } = await findEmail(email)
            
            if (rowCount) {
                return next(createError(403, "Email is already used"))
            }

            const passwordHash = bcrypt.hashSync(password, 10)
            const data = {
                id: uuidv4(),
                email,
                passwordHash,
                fullname,
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
            const payload = {
                email: user.email,
                role: user.role
            }
            user.token = authHelper.generateToken(payload)
            user.refreshToken = authHelper.generateRefreshToken(payload)

            commonHelper.response(res, user, 200, 'Login success')

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

            const resetToken = uuidv4()
            const now = Date.now()
            const sixHours = 6 * 60 * 60 * 1000
            const resetExpires = new Date(now + sixHours)
          
            console.log('Now:', new Date(now))
            console.log('Expires akan disimpan:', resetExpires)

            await updateResetToken(email, resetToken, resetExpires)

            const { rows: [updated] } = await findEmail(email)
            console.log('Expires di database:', updated.reset_password_expires)

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
    }
}

export default AuthController