const pool = require('../config/db');

const LocationModel = {
    findAll: (region) => {
        let query = 'SELECT * FROM locations';
        const params = [];

        if (region) {
            query += ' WHERE region = $1';
            params.push(region);
        }

        query += ' ORDER BY country ASC';

        return pool.query(query, params);
    }
};

module.exports = LocationModel;