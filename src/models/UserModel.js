const pool = require('../config/db.js');

const UserModel = {
    findEmail: (email) => {
        return pool.query('SELECT * FROM users WHERE email = $1', [email]);
    },

    create: (data) => {
        const { id, email, passwordHash, fullname, phoneNumber, role } = data;
        return pool.query(
            `INSERT INTO users (id, email, password, full_name, phone_number, role) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, full_name, email, phone_number, role`,
            [id, email, passwordHash, fullname, phoneNumber, role]
        );
    },

    updateResetToken: (email, resetToken, resetExpires) => {
        return pool.query(
            `UPDATE users 
             SET reset_password_token = $1, reset_password_expires = $2 
             WHERE email = $3`,
            [resetToken, resetExpires, email]
        );
    },

    findByResetToken: (token) => {
        return pool.query(
            'SELECT * FROM users WHERE reset_password_token = $1',
            [token]
        );
    },

    updatePassword: (email, passwordHash) => {
        return pool.query(
            `UPDATE users 
             SET password = $1, reset_password_token = NULL, reset_password_expires = NULL 
             WHERE email = $2`,
            [passwordHash, email]
        );
    },

    findById: (id) => {
        return pool.query(
            'SELECT id, full_name, email, phone_number, avatar_url, role, created_at FROM users WHERE id = $1',
            [id]
        );
    },

    updateProfile: (id, data) => {
        const { fullname, phoneNumber } = data;
        return pool.query(
            `UPDATE users 
             SET full_name = $1, phone_number = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING id, full_name, email, phone_number, avatar_url, role`,
            [fullname, phoneNumber, id]
        );
    },

    updateAvatar: (id, avatarUrl) => {
        return pool.query(
            `UPDATE users 
             SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING avatar_url`,
            [avatarUrl, id]
        );
    },

    deleteAvatar: (id) => {
        return pool.query(
            `UPDATE users 
             SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING avatar_url`,
            [id]
        );
    },
    
    updatePasswordById: (id, passwordHash) => {
        return pool.query(
            `UPDATE users 
             SET password = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id`,
            [passwordHash, id]
        );
    }
};

module.exports = UserModel;