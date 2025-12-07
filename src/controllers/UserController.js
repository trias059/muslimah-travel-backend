const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {
    findEmail,
    updateResetToken,
    findByResetToken,
    updatePassword,
    findById,
    updateProfile,
    updateAvatar,
    deleteAvatar,
    updatePasswordById,
    create
} = require('../models/UserModel.js');
const cloudinary = require('../config/cloudinary');
const commonHelper = require('../helper/common');
const authHelper = require('../helper/auth');

const UserController = {
    register: async (req, res, next) => {
        try {
            const { email, password, name, phone_number } = req.body;

            if (!email || !password || !name || !phone_number) {
                return commonHelper.badRequest(res, 'All fields are required');
            }
            const { rowCount } = await findEmail(email);
            if (rowCount) {
                return commonHelper.badRequest(res, "Email is already used");
            }

            const passwordHash = bcrypt.hashSync(password, 10);
            
            const data = {
                id: crypto.randomUUID(),
                email,
                passwordHash,
                name,
                phoneNumber: phone_number,
                role: "user",
            };

            const { rows: [user] } = await create(data);

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            const responseData = {
                id: user.id,
                name: user.name,
                email: user.email,
                token: authHelper.generateToken(payload)
            };

            commonHelper.created(res, responseData, 'Registration successful');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return commonHelper.badRequest(res, 'Email and password are required');
            }

            const { rows: [user] } = await findEmail(email);
            if (!user) {
                return commonHelper.notFound(res, 'Email not found');
            }

            const isValidPassword = bcrypt.compareSync(password, user.password);
            if (!isValidPassword) {
                return commonHelper.unauthorized(res, 'Invalid password');
            }

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            const responseData = {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token: authHelper.generateToken(payload)
            };

            commonHelper.success(res, responseData, 'Login successful');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    logout: async (req, res, next) => {
        try {
            commonHelper.success(res, null, 'Logout successful');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.body;

            if (!email) {
                return commonHelper.badRequest(res, 'Email is required');
            }

            const { rows: [user] } = await findEmail(email);
            if (!user) {
                return commonHelper.notFound(res, 'Email not found');
            }

            const resetToken = crypto.randomUUID();
            const now = Date.now();
            const sixHours = 6 * 60 * 60 * 1000;
            const resetExpires = new Date(now + sixHours);

            await updateResetToken(email, resetToken, resetExpires);
            commonHelper.success(res, { resetToken }, 'Password reset link sent to your email');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            const { token, password, confirm_password } = req.body;

            if (!token || !password || !confirm_password) {
                return commonHelper.badRequest(res, 'All fields are required');
            }

            if (password !== confirm_password) {
                return commonHelper.badRequest(res, 'Passwords do not match');
            }

            const { rows: [user] } = await findByResetToken(token);
            if (!user) {
                return commonHelper.badRequest(res, 'Invalid or expired token');
            }

            const expiresFixed = new Date(new Date(user.reset_password_expires).getTime() + 7 * 60 * 60 * 1000);
            if (new Date() > expiresFixed) {
                return commonHelper.badRequest(res, 'Token has expired');
            }

            const passwordHash = bcrypt.hashSync(password, 10);
            await updatePassword(user.email, passwordHash);

            commonHelper.success(res, null, 'Password reset successful');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    getProfile: async (req, res, next) => {
        try {
            const { rows: [user] } = await findById(req.user.id);
            
            if (!user) {
                return commonHelper.notFound(res, 'User not found');
            }
            
            commonHelper.success(res, user, 'Get profile successful');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { name, email, phone_number } = req.body;

            if (!name && !email && !phone_number) {
                return commonHelper.badRequest(res, 'At least one field is required to update');
            }

            if (email) {
                const { rows: [existingUser] } = await findEmail(email);
                if (existingUser && existingUser.id !== userId) {
                    return commonHelper.badRequest(res, 'Email is already used by another user');
                }
            }

            const data = {
                name,
                email,
                phoneNumber: phone_number
            };

            const { rows: [user] } = await updateProfile(userId, data);

            if (!user) {
                return commonHelper.notFound(res, 'User not found');
            }

            commonHelper.success(res, user, 'Profile updated successfully');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    uploadAvatar: async (req, res, next) => {
        try {
            const userId = req.user.id;

            if (!req.file) {
                return commonHelper.badRequest(res, 'Avatar file is required');
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'muslimah-travel/avatars',
                transformation: [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                    { quality: 'auto', fetch_format: 'auto' }
                ],
                public_id: `avatar_${userId}_${Date.now()}`
            });

            const { rows: [user] } = await updateAvatar(userId, result.secure_url);

            if (!user) {
                return commonHelper.notFound(res, 'User not found');
            }

            commonHelper.success(res, {
                avatar_url: user.avatar_url
            }, 'Avatar uploaded successfully');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    deleteAvatar: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const { rows: [currentUser] } = await findById(userId);
            
            if (!currentUser) {
                return commonHelper.notFound(res, 'User not found');
            }

            if (currentUser.avatar_url) {
                try {
                    const urlParts = currentUser.avatar_url.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    const publicId = `muslimah-travel/avatars/${filename.split('.')[0]}`;
                    
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.log('Cloudinary delete error:', cloudinaryError);
                }
            }

            await deleteAvatar(userId);

            commonHelper.success(res, null, 'Avatar deleted successfully');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    changePassword: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { current_password, new_password, confirm_password } = req.body;

            if (!current_password || !new_password || !confirm_password) {
                return commonHelper.badRequest(res, 'All fields are required');
            }

            if (new_password !== confirm_password) {
                return commonHelper.badRequest(res, 'New passwords do not match');
            }

            if (new_password.length < 8) {
                return commonHelper.badRequest(res, 'New password must be at least 8 characters');
            }

            const { rows: [user] } = await findById(userId);

            if (!user) {
                return commonHelper.notFound(res, 'User not found');
            }
            const { rows: [userWithPassword] } = await findEmail(user.email);

            const isValidPassword = bcrypt.compareSync(current_password, userWithPassword.password);
            if (!isValidPassword) {
                return commonHelper.unauthorized(res, 'Current password is incorrect');
            }

            const passwordHash = bcrypt.hashSync(new_password, 10);

            await updatePasswordById(userId, passwordHash);

            commonHelper.success(res, null, 'Password changed successfully');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    }
};

module.exports = UserController;