const pool = require('../config/db.js')

const getByUserId = (userId) => {
    return pool.query(
        `SELECT 
            w.id,
            json_build_object(
                'name', d.name,
                'location', d.location,
                'image_url', d.image_url,
                'rating', d.rating
            ) as destination
        FROM wishlists w
        JOIN packages p ON w.package_id = p.id
        JOIN destinations d ON p.destination_id = d.id
        WHERE w.user_id = $1
        ORDER BY w.created_at DESC`,
        [userId]
    )
}

module.exports = { getByUserId }