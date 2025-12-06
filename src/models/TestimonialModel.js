const pool = require('../config/db');

const TestimonialModel = {
    findAll: (featured, limit) => {
        let query = 'SELECT * FROM testimonials';
        const params = [];
        let paramIndex = 1;

        if (featured === 'true') {
            query += ' WHERE is_featured = true';
        }

        query += ' ORDER BY created_at DESC';

        if (limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(limit);
        }

        return pool.query(query, params);
    }
};

module.exports = TestimonialModel;