const pool = require('../config/db');

const DestinationModel = {
    findAll: ({ search, category, halal, limit, offset }) => {
        let query = 'SELECT * FROM destinations WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR location ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (halal === 'true') {
            query += ` AND is_halal_friendly = true`;
        }

        query += ' ORDER BY rating DESC, created_at DESC';

        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        return pool.query(query, params);
    },

    countAll: ({ search, category, halal }) => {
        let query = 'SELECT COUNT(*) FROM destinations WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR location ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
        }

        if (halal === 'true') {
            query += ` AND is_halal_friendly = true`;
        }

        return pool.query(query, params);
    },

    findById: (id) => {
        return pool.query(
            'SELECT * FROM destinations WHERE id = $1',
            [id]
        );
    }
};

module.exports = DestinationModel;