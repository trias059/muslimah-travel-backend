const pool = require('../config/db');

const ForumModel = {
    findAll: (filters) => {
        const { search, sort, limit, offset } = filters;
        
        let query = `
            SELECT 
                f.id, f.title, f.content, f.rating, f.created_at,
                json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'avatar_url', u.avatar_url
                ) as author,
                (SELECT COUNT(*) FROM forum_comments WHERE topic_id = f.id) as comment_count
            FROM forum_topics f
            JOIN users u ON f.user_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (f.title ILIKE $${paramIndex} OR f.content ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (sort === 'latest') {
            query += ' ORDER BY f.created_at DESC';
        } else if (sort === 'popular') {
            query += ' ORDER BY comment_count DESC';
        } else if (sort === 'rating') {
            query += ' ORDER BY f.rating DESC NULLS LAST';
        }

        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        return pool.query(query, params);
    },

    findById: (id) => {
        return pool.query(
            `SELECT 
                f.id, f.title, f.content, f.rating, f.created_at, f.user_id,
                json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'avatar_url', u.avatar_url
                ) as author
            FROM forum_topics f
            JOIN users u ON f.user_id = u.id
            WHERE f.id = $1`,
            [id]
        );
    },

    create: (data) => {
        const { userId, title, content, rating } = data;
        return pool.query(
            `INSERT INTO forum_topics (user_id, title, content, rating)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, rating, created_at`,
            [userId, title, content, rating]
        );
    },

    update: (id, data) => {
        const { title, content, rating } = data;
        let query = 'UPDATE forum_topics SET updated_at = CURRENT_TIMESTAMP';
        const params = [];
        let paramIndex = 1;

        if (title) {
            query += `, title = $${paramIndex}`;
            params.push(title);
            paramIndex++;
        }

        if (content) {
            query += `, content = $${paramIndex}`;
            params.push(content);
            paramIndex++;
        }

        if (rating !== undefined) {
            query += `, rating = $${paramIndex}`;
            params.push(rating);
            paramIndex++;
        }

        query += ` WHERE id = $${paramIndex} RETURNING *`;
        params.push(id);

        return pool.query(query, params);
    },

    remove: (id) => {
        return pool.query(
            'DELETE FROM forum_topics WHERE id = $1 RETURNING id',
            [id]
        );
    },

    getComments: (topicId) => {
        return pool.query(
            `SELECT 
                c.id, c.content, c.created_at,
                json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'avatar_url', u.avatar_url
                ) as author
            FROM forum_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.topic_id = $1
            ORDER BY c.created_at DESC`,
            [topicId]
        );
    },

    addComment: (topicId, userId, content) => {
        return pool.query(
            `INSERT INTO forum_comments (topic_id, user_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, content, created_at`,
            [topicId, userId, content]
        );
    },

    removeComment: (commentId) => {
        return pool.query(
            'DELETE FROM forum_comments WHERE id = $1 RETURNING id',
            [commentId]
        );
    },

    getStats: () => {
        return pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'user') as total_members,
                (SELECT COUNT(*) FROM forum_topics) as total_topics,
                (SELECT ROUND(AVG(rating)::numeric, 1) FROM forum_topics WHERE rating IS NOT NULL) as avg_rating,
                (SELECT ROUND((COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100)::numeric, 0) 
                 FROM forum_comments) as response_rate
        `);
    }
};

module.exports = ForumModel;