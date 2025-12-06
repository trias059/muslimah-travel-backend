const pool = require('../config/db');

const PackageModel = {
    findAll: ({ featured, destination, min_price, max_price, search, limit, offset }) => {
        let query = 'SELECT * FROM packages WHERE is_active = true';
        const params = [];
        let paramIndex = 1;

        if (featured === 'true') {
            query += ` AND is_featured = true`;
        }

        if (destination) {
            query += ` AND destination_id = $${paramIndex}`;
            params.push(destination);
            paramIndex++;
        }

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (min_price) {
            query += ` AND price >= $${paramIndex}`;
            params.push(min_price);
            paramIndex++;
        }

        if (max_price) {
            query += ` AND price <= $${paramIndex}`;
            params.push(max_price);
            paramIndex++;
        }

        query += ' ORDER BY created_at DESC';

        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        return pool.query(query, params);
    },

    countAll: ({ featured, destination, min_price, max_price, search }) => {
        let query = 'SELECT COUNT(*) FROM packages WHERE is_active = true';
        const params = [];
        let paramIndex = 1;

        if (featured === 'true') {
            query += ` AND is_featured = true`;
        }

        if (destination) {
            query += ` AND destination_id = $${paramIndex}`;
            params.push(destination);
            paramIndex++;
        }

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (min_price) {
            query += ` AND price >= $${paramIndex}`;
            params.push(min_price);
            paramIndex++;
        }

        if (max_price) {
            query += ` AND price <= $${paramIndex}`;
            params.push(max_price);
        }

        return pool.query(query, params);
    },

    findById: (id) => {
        return pool.query(
            'SELECT * FROM packages WHERE id = $1 AND is_active = true',
            [id]
        );
    }
};

module.exports = PackageModel;