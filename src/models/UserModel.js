const pool = require('../config/db.js');

const UserModel = {
    findEmail: (email) => {
        return pool.query('SELECT * FROM users WHERE email = $1', [email]);
    },

    create: (data) => {
        const { id, email, passwordHash, name, phoneNumber, role } = data;
        return pool.query(
            `INSERT INTO users (id, email, password, name, phone_number, role) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, name, email, phone_number, role, created_at`,
            [id, email, passwordHash, name, phoneNumber, role]
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
            `SELECT 
                id, 
                name, 
                email, 
                phone_number, 
                avatar_url, 
                birth_date,
                nationality,
                role, 
                created_at,
                updated_at
             FROM users 
             WHERE id = $1`,
            [id]
        );
    },

    updateProfile: (id, data) => {
        const { name, email, phoneNumber } = data;

        let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
        const params = [];
        let paramIndex = 1;

        if (name) {
            query += `, name = $${paramIndex}`;
            params.push(name);
            paramIndex++;
        }

        if (email) {
            query += `, email = $${paramIndex}`;
            params.push(email);
            paramIndex++;
        }

        if (phoneNumber) {
            query += `, phone_number = $${paramIndex}`;
            params.push(phoneNumber);
            paramIndex++;
        }

        query += ` WHERE id = $${paramIndex} 
                   RETURNING id, name, email, phone_number, avatar_url, role, updated_at`;
        params.push(id);

        return pool.query(query, params);
    },

    updateAvatar: (id, avatarUrl) => {
        return pool.query(
            `UPDATE users 
             SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, avatar_url, updated_at`,
            [avatarUrl, id]
        );
    },

    deleteAvatar: (id) => {
        return pool.query(
            `UPDATE users 
             SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING id, avatar_url, updated_at`,
            [id]
        );
    },

    updatePasswordById: (id, passwordHash) => {
        return pool.query(
            `UPDATE users 
             SET password = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, updated_at`,
            [passwordHash, id]
        );
    }
};

module.exports = UserModel;