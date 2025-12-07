const pool = require('../config/db');

const ItineraryModel = {
    findByPackageId: (packageId, day = null) => {
        let query = `
            SELECT 
                i.id as itinerary_id,
                i.day_number,
                a.id as activity_id,
                a.category,
                a.title,
                a.description,
                a.order_number as activity_order
            FROM itineraries i
            LEFT JOIN itinerary_activities a ON i.id = a.itinerary_id
            WHERE i.package_id = $1
        `;
        
        const params = [packageId];

        if (day) {
            query += ' AND i.day_number = $2';
            params.push(day);
        }

        query += ' ORDER BY i.day_number, a.order_number';

        return pool.query(query, params);
    }
};

module.exports = ItineraryModel;