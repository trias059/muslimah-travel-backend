const pool = require('../config/db');

const AdminModel = {
    getDashboardStats: () => {
        return pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM bookings) as total_booking,
                (SELECT SUM(total_price) FROM bookings WHERE payment_status = 'paid') as total_profit,
                (SELECT COUNT(DISTINCT user_id) FROM bookings) as active_customer,
                (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_booking,
                (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_booking,
                (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled') as cancelled
        `);
    },

    getSalesPerformance: () => {
        return pool.query(`
            SELECT 
                TO_CHAR(created_at, 'Month') as month,
                COUNT(*) as total_bookings,
                SUM(total_price) as total_revenue
            FROM bookings
            WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
            GROUP BY TO_CHAR(created_at, 'Month'), EXTRACT(MONTH FROM created_at)
            ORDER BY EXTRACT(MONTH FROM created_at)
        `);
    },

    getAgentPerformance: () => {
        return pool.query(`
            SELECT 
                u.id,
                u.full_name,
                COUNT(b.id) as total_bookings,
                SUM(b.total_price) as total_profit
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id
            WHERE u.role = 'user'
            GROUP BY u.id, u.full_name
            ORDER BY total_profit DESC
            LIMIT 5
        `);
    },

    getUpcomingTrips: () => {
        return pool.query(`
            SELECT 
                b.id,
                b.departure_date,
                u.full_name as customer,
                p.name as package,
                b.status
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN packages p ON b.package_id = p.id
            WHERE b.departure_date > CURRENT_DATE
            ORDER BY b.departure_date ASC
            LIMIT 5
        `);
    },

    getAllUsers: (limit, offset) => {
        return pool.query(
            `SELECT id, full_name, email, phone_number, role, created_at 
             FROM users 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
    },

    countAllUsers: () => {
        return pool.query('SELECT COUNT(*) FROM users');
    },

    searchUsers: (query) => {
        return pool.query(
            `SELECT id, full_name, email, phone_number, role, created_at 
             FROM users 
             WHERE full_name ILIKE $1 OR email ILIKE $1 
             ORDER BY created_at DESC`,
            [`%${query}%`]
        );
    },

    createUser: (userData) => {
        const { id, fullname, email, phone_number, password, role } = userData;
        return pool.query(
            `INSERT INTO users (id, full_name, email, phone_number, password, role) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, full_name, email, phone_number, role, created_at`,
            [id, fullname, email, phone_number, password, role]
        );
    },

    updateUser: (id, userData) => {
        const { fullname, email, phone_number, role } = userData;
        return pool.query(
            `UPDATE users 
             SET full_name = $1, email = $2, phone_number = $3, role = $4, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5 
             RETURNING id, full_name, email, phone_number, role`,
            [fullname, email, phone_number, role, id]
        );
    },

    deleteUser: (id) => {
        return pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [id]
        );
    },

    getAllPackages: (limit, offset) => {
        return pool.query(
            `SELECT * FROM packages 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
    },

    countAllPackages: () => {
        return pool.query('SELECT COUNT(*) FROM packages');
    },

    searchPackages: (query) => {
        return pool.query(
            `SELECT * FROM packages 
             WHERE name ILIKE $1 
             ORDER BY created_at DESC`,
            [`%${query}%`]
        );
    },

    getPackageById: (id) => {
        return pool.query(
            'SELECT * FROM packages WHERE id = $1',
            [id]
        );
    },

    createPackage: (packageData) => {
        const { id, name, destination_id, image_url, start_date, price, duration_days, itinerary, quota } = packageData;
        return pool.query(
            `INSERT INTO packages (id, name, destination_id, image_url, start_date, price, duration_days, itinerary, quota) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [id, name, destination_id, image_url, start_date, price, duration_days, itinerary, quota]
        );
    },

    updatePackage: (id, packageData) => {
        const { name, destination_id, image_url, start_date, price, duration_days, itinerary, quota } = packageData;
        return pool.query(
            `UPDATE packages 
             SET name = $1, destination_id = $2, image_url = $3, start_date = $4, price = $5, 
                 duration_days = $6, itinerary = $7, quota = $8, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $9 
             RETURNING *`,
            [name, destination_id, image_url, start_date, price, duration_days, itinerary, quota, id]
        );
    },

    deletePackage: (id) => {
        return pool.query(
            'DELETE FROM packages WHERE id = $1 RETURNING id',
            [id]
        );
    },

    getAllArticles: (limit, offset) => {
        return pool.query(
            `SELECT * FROM articles 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
    },

    countAllArticles: () => {
        return pool.query('SELECT COUNT(*) FROM articles');
    },

    getArticleById: (id) => {
        return pool.query(
            'SELECT * FROM articles WHERE id = $1',
            [id]
        );
    },

    createArticle: (articleData) => {
        const { id, title, slug, category, cover_image_url, content, excerpt, tags, author_id, is_published } = articleData;
        return pool.query(
            `INSERT INTO articles (id, title, slug, category, cover_image_url, content, excerpt, tags, author_id, is_published) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [id, title, slug, category, cover_image_url, content, excerpt, tags, author_id, is_published]
        );
    },

    updateArticle: (id, articleData) => {
        const { title, slug, category, cover_image_url, content, excerpt, tags, is_published } = articleData;
        return pool.query(
            `UPDATE articles 
             SET title = $1, slug = $2, category = $3, cover_image_url = $4, content = $5, 
                 excerpt = $6, tags = $7, is_published = $8, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $9 
             RETURNING *`,
            [title, slug, category, cover_image_url, content, excerpt, tags, is_published, id]
        );
    },

    deleteArticle: (id) => {
        return pool.query(
            'DELETE FROM articles WHERE id = $1 RETURNING id',
            [id]
        );
    },

    togglePublishArticle: (id) => {
        return pool.query(
            `UPDATE articles 
             SET is_published = NOT is_published, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING *`,
            [id]
        );
    },

    getAllOrders: ({ status, search, limit, offset }) => {
        let query = `
            SELECT b.*, u.full_name as customer_name, p.name as package_name 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN packages p ON b.package_id = p.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (status) {
            query += ` AND b.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (search) {
            query += ` AND (u.full_name ILIKE $${paramIndex} OR b.booking_code ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        return pool.query(query, params);
    },

    getOrderStats: () => {
        return pool.query(`
            SELECT 
                COUNT(*) as total_booking,
                COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
            FROM bookings
        `);
    },

    getOrderById: (bookingId) => {
        return pool.query(
            `SELECT b.*, u.full_name as customer_name, u.email, u.phone_number, p.name as package_name 
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN packages p ON b.package_id = p.id
             WHERE b.id = $1`,
            [bookingId]
        );
    },

    updateOrderStatus: (bookingId, status) => {
        return pool.query(
            `UPDATE bookings 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [status, bookingId]
        );
    },

    countAllOrders: ({ status, search }) => {
        let query = `
            SELECT COUNT(*) 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (status) {
            query += ` AND b.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (search) {
            query += ` AND (u.full_name ILIKE $${paramIndex} OR b.booking_code ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        return pool.query(query, params);
    },

    updatePaymentStatus: (bookingId, paymentStatus) => {
        return pool.query(
            `UPDATE bookings 
             SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [paymentStatus, bookingId]
        );
    },

    getAllCommunityPosts: ({ month, limit, offset }) => {
        let query = 'SELECT * FROM community_posts WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (month) {
            query += ` AND TO_CHAR(created_at, 'Month') ILIKE $${paramIndex}`;
            params.push(`%${month}%`);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        return pool.query(query, params);
    },

    getCommunityPostById: (id) => {
        return pool.query(
            'SELECT * FROM community_posts WHERE id = $1',
            [id]
        );
    },

    deleteCommunityPost: (id) => {
        return pool.query(
            'DELETE FROM community_posts WHERE id = $1 RETURNING id',
            [id]
        );
    },

    countAllCommunityPosts: (month) => {
    let query = 'SELECT COUNT(*) FROM community_posts WHERE 1=1';
    const params = [];

    if (month) {
        query += ` AND TO_CHAR(created_at, 'Month') ILIKE $1`;
        params.push(`%${month}%`);
    }

        return pool.query(query, params);
    },

    moderateCommunityPost: (id, status) => {
        return pool.query(
            `UPDATE community_posts 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING *`,
            [status, id]
        );
    }
};

module.exports = AdminModel;