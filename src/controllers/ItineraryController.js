const { findByPackageId } = require('../models/ItineraryModel');
const { findById: findPackageById } = require('../models/PackageModel');
const commonHelper = require('../helper/common');

const ItineraryController = {
    getByPackageId: async (req, res) => {
        try {
            const { package_id } = req.params;
            const { day } = req.query;

            const { rows: [pkg] } = await findPackageById(package_id);
            if (!pkg) {
                return commonHelper.notFound(res, 'Tour package not found');
            }

            const { rows } = await findByPackageId(package_id, day);

            const grouped = rows.reduce((acc, row) => {
                const dayIndex = acc.findIndex(d => d.day_number === row.day_number);
                
                if (dayIndex === -1) {
                    acc.push({
                        day_number: row.day_number,
                        activities: row.activity_id ? [{
                            id: row.activity_id,
                            category: row.category,
                            title: row.title,
                            description: row.description,
                            order: row.activity_order
                        }] : []
                    });
                } else {
                    if (row.activity_id) {
                        acc[dayIndex].activities.push({
                            id: row.activity_id,
                            category: row.category,
                            title: row.title,
                            description: row.description,
                            order: row.activity_order
                        });
                    }
                }
                return acc;
            }, []);

            commonHelper.success(res, grouped, 'Get itinerary successful');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    }
};

module.exports = ItineraryController;