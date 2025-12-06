const pool = require('../config/db');

const ArticleModel = {
    findAll: ({ search, category, sort, limit, offset }) => {
        let query = 'SELECT * FROM articles WHERE is_published = true';
        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (sort === 'latest') {
            query += ' ORDER BY created_at DESC';
        } else if (sort === 'popular') {
            query += ' ORDER BY views DESC';
        } else {
            query += ' ORDER BY created_at DESC';
        }

        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        return pool.query(query, params);
    },

    countAll: ({ search, category }) => {
        let query = 'SELECT COUNT(*) FROM articles WHERE is_published = true';
        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
        }

        return pool.query(query, params);
    },

    findCategories: () => {
        return pool.query('SELECT * FROM article_categories ORDER BY name ASC');
    },

    findByIdOrSlug: (idOrSlug) => {
        return pool.query(
            'SELECT * FROM articles WHERE (id = $1 OR slug = $1) AND is_published = true',
            [idOrSlug]
        );
    },

    incrementView: (id) => {
        return pool.query(
            'UPDATE articles SET views = views + 1 WHERE id = $1 RETURNING id, views',
            [id]
        );
    }
};

module.exports = ArticleModel;