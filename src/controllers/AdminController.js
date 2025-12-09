const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const AdminModel = require('../models/AdminModel');
const commonHelper = require('../helpers/common');
const cloudinary = require('../config/cloudinary');
const TransactionHelper = require('../helpers/transactionHelper');
const { ValidationHelper, ValidationError } = require('../helpers/validation');
const { 
    CONSTANTS, 
    SUCCESS_MESSAGES, 
    ERROR_MESSAGES, 
    HTTP_STATUS, 
    PG_ERROR_CODES,
    PAGINATION,
    CLOUDINARY_FOLDERS
} = require('../config/constants');


const AdminController = {
    
    getDashboardStats: async (req, res) => {
        try {
            const result = await AdminModel.getDashboardStats();
            const stats = result.rows[0];

            return commonHelper.success(res, {
                totalBooking: parseInt(stats.total_booking) || 0,
                totalProfit: parseFloat(stats.total_profit) || 0,
                pembeliAktif: parseInt(stats.pembeli_aktif) || 0
            });
        } catch (error) {
            console.error('getDashboardStats error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getTopPackages: async (req, res) => {
        try {
            const result = await AdminModel.getTopPackages();
            
            const data = result.rows.map(row => ({
                id: row.id,
                name: row.name,
                imageUrl: row.image_url,
                percentage: parseInt(row.percentage) || 0
            }));

            return commonHelper.success(res, data);
        } catch (error) {
            console.error('getTopPackages error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getTopBuyers: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || PAGINATION.TOP_BUYERS_LIMIT;
            const result = await AdminModel.getTopBuyers(limit);
            
            const data = result.rows.map(row => ({
                id: row.id,
                name: row.name,
                avatarUrl: row.avatar_url,
                totalBooking: parseInt(row.total_booking) || 0,
                totalUlasan: parseInt(row.total_ulasan) || 0
            }));

            return commonHelper.success(res, data);
        } catch (error) {
            console.error('getTopBuyers error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getBookingStatus: async (req, res) => {
        try {
            const result = await AdminModel.getBookingStatus();
            const row = result.rows[0];

            return commonHelper.success(res, {
                total: parseInt(row.total) || 0,
                breakdown: row.breakdown || []
            });
        } catch (error) {
            console.error('getBookingStatus error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getRecentBookings: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || PAGINATION.RECENT_BOOKINGS_LIMIT;
            const result = await AdminModel.getRecentBookings(limit);
            
            const data = result.rows.map(row => ({
                id: row.id,
                pembeli: row.pembeli,
                paketTour: row.paket_tour,
                harga: parseFloat(row.harga),
                createdAt: row.created_at
            }));

            return commonHelper.success(res, data);
        } catch (error) {
            console.error('getRecentBookings error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },
    
    
    getAllUsers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
            const limit = parseInt(req.query.limit) || PAGINATION.USER_LIST_LIMIT;
            const offset = (page - 1) * limit;

            const users = await AdminModel.getAllUsers(limit, offset);
            const countResult = await AdminModel.countAllUsers();
            const total = parseInt(countResult.rows[0].count);

            const data = users.rows.map(user => ({
                displayId: user.display_id,
                id: user.id,
                namaLengkap: user.full_name,
                email: user.email,
                telepon: user.phone_number,
                password: user.password,
                tanggalDaftar: user.created_at
            }));

            return commonHelper.success(res, data, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            console.error('getAllUsers error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    searchUsers: async (req, res) => {
        try {
            const { search } = req.query;

            if (!search || search.trim() === '') {
                return commonHelper.badRequest(res, ERROR_MESSAGES.SEARCH_QUERY_REQUIRED);
            }

            const result = await AdminModel.searchUsers(search.trim());

            const data = result.rows.map(user => ({
                displayId: user.display_id,
                id: user.id,
                namaLengkap: user.full_name,
                email: user.email,
                telepon: user.phone_number,
                password: user.password,
                tanggalDaftar: user.created_at
            }));

            return commonHelper.success(res, data);
        } catch (error) {
            console.error('searchUsers error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getUserDetail: async (req, res) => {
        try {
            const { id } = req.params;

            try {
                ValidationHelper.validateUUID(id, 'User ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await AdminModel.getUserById(id);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            const user = result.rows[0];
            return commonHelper.success(res, {
                id: user.id,
                namaLengkap: user.full_name,
                email: user.email,
                telepon: user.phone_number,
                role: user.role,
                tanggalDaftar: user.created_at
            });
        } catch (error) {
            console.error('getUserDetail error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    createUser: async (req, res) => {
        try {
            const { fullname, email, phone_number, password, role } = req.body;

            let validatedData = {};

            try {
                validatedData.fullname = ValidationHelper.validateString(fullname, 'Nama lengkap', 2, 100);
                validatedData.email = ValidationHelper.validateEmail(email);
                validatedData.phone_number = ValidationHelper.validatePhoneNumber(phone_number, false);
                validatedData.password = ValidationHelper.validatePassword(password);
                
                if (role) {
                    validatedData.role = ValidationHelper.validateEnum(
                        role, 
                        [CONSTANTS.ROLES.USER, CONSTANTS.ROLES.ADMIN], 
                        'Role'
                    );
                }
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const hashedPassword = await bcrypt.hash(validatedData.password, 10);
            
            const userData = {
                id: uuidv4(),
                fullname: validatedData.fullname,
                email: validatedData.email,
                phone_number: validatedData.phone_number,
                password: hashedPassword,
                role: validatedData.role || CONSTANTS.ROLES.USER
            };

            const result = await AdminModel.createUser(userData);
            const user = result.rows[0];

            return commonHelper.created(res, {
                id: user.id,
                namaLengkap: user.full_name,
                email: user.email,
                telepon: user.phone_number,
                role: user.role,
                tanggalDaftar: user.created_at
            }, SUCCESS_MESSAGES.USER_CREATED);
        } catch (error) {
            console.error('createUser error:', error);
            
            if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
                return commonHelper.badRequest(res, ERROR_MESSAGES.USER_ALREADY_EXISTS);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { fullname, email, phone_number, password } = req.body;

            try {
                ValidationHelper.validateUUID(id, 'User ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            let userData = {};

            try {
                if (fullname) {
                    userData.fullname = ValidationHelper.validateString(fullname, 'Nama lengkap', 2, 100, false);
                }
                if (email) {
                    userData.email = ValidationHelper.validateEmail(email);
                }
                if (phone_number) {
                    userData.phone_number = ValidationHelper.validatePhoneNumber(phone_number, false);
                }
                if (password) {
                    const validatedPassword = ValidationHelper.validatePassword(password, 'Password', false);
                    if (validatedPassword) {
                        userData.password = await bcrypt.hash(validatedPassword, 10);
                    }
                }
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            if (Object.keys(userData).length === 0) {
                return commonHelper.badRequest(res, 'Tidak ada data yang diupdate');
            }

            const result = await AdminModel.updateUser(id, userData);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            const user = result.rows[0];
            return commonHelper.success(res, {
                id: user.id,
                namaLengkap: user.full_name,
                email: user.email,
                telepon: user.phone_number,
                role: user.role
            }, SUCCESS_MESSAGES.USER_UPDATED);
        } catch (error) {
            console.error('updateUser error:', error);
            
            if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
                return commonHelper.badRequest(res, ERROR_MESSAGES.USER_ALREADY_EXISTS);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            try {
                ValidationHelper.validateUUID(id, 'User ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await TransactionHelper.safeDelete('users', id, [
                {
                    table: 'bookings',
                    foreignKey: 'user_id',
                    errorMessage: 'Tidak dapat menghapus user yang memiliki booking aktif. Hapus booking terlebih dahulu.'
                },
                {
                    table: 'reviews',
                    foreignKey: 'user_id',
                    errorMessage: 'Tidak dapat menghapus user yang memiliki review. Hapus review terlebih dahulu.'
                }
            ]);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            return commonHelper.success(res, null, SUCCESS_MESSAGES.USER_DELETED);
        } catch (error) {
            console.error('deleteUser error:', error);
            
            if (error.message.includes('Tidak dapat menghapus')) {
                return commonHelper.badRequest(res, error.message);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    
    getAllPackages: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
            const limit = parseInt(req.query.limit) || PAGINATION.PACKAGE_LIST_LIMIT;
            const offset = (page - 1) * limit;

            const packages = await AdminModel.getAllPackages(limit, offset);
            const countResult = await AdminModel.countAllPackages();
            const total = parseInt(countResult.rows[0].count);

            const data = packages.rows.map(pkg => ({
                displayId: pkg.display_id,
                id: pkg.id,
                namaPaket: pkg.name,
                lokasi: pkg.location,
                keberangkatan: pkg.departure_date,
                maskapai: pkg.airline,
                harga: parseFloat(pkg.price)
            }));

            return commonHelper.success(res, data, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            console.error('getAllPackages error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    searchPackages: async (req, res) => {
        try {
            const { search } = req.query;

            if (!search || search.trim() === '') {
                return commonHelper.badRequest(res, ERROR_MESSAGES.SEARCH_QUERY_REQUIRED);
            }

            const result = await AdminModel.searchPackages(search.trim());

            const data = result.rows.map(pkg => ({
                displayId: pkg.display_id,
                id: pkg.id,
                namaPaket: pkg.name,
                lokasi: pkg.location,
                keberangkatan: pkg.departure_date,
                maskapai: pkg.airline,
                harga: parseFloat(pkg.price)
            }));

            return commonHelper.success(res, data);
        } catch (error) {
            console.error('searchPackages error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getPackageDetail: async (req, res) => {
        try {
            const { id } = req.params;

            try {
                ValidationHelper.validateUUID(id, 'Package ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await AdminModel.getPackageById(id);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.PACKAGE_NOT_FOUND);
            }

            const pkg = result.rows[0];
            return commonHelper.success(res, {
                id: pkg.id,
                namaPaket: pkg.name,
                lokasi: pkg.location,
                maskapai: pkg.airline,
                bandara: pkg.departure_airport,
                periodeKeberangkatan: pkg.start_date,
                harga: parseFloat(pkg.price),
                gambarArtikel: pkg.image_url,
                itinerary: pkg.itinerary
            });
        } catch (error) {
            console.error('getPackageDetail error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    createPackage: async (req, res) => {
        try {
            const { 
                name, 
                location, 
                price, 
                airline, 
                departure_airport, 
                start_date, 
                duration_days, 
                itinerary, 
                quota, 
                description, 
                facilities 
            } = req.body;

            let validatedData = {};

            try {
                validatedData.name = ValidationHelper.validateString(name, 'Nama paket', 3, 255);
                validatedData.price = ValidationHelper.validatePrice(price);
                
                if (location) {
                    validatedData.location = ValidationHelper.validateString(location, 'Lokasi', 2, 255, false);
                }
                
                if (start_date) {
                    validatedData.start_date = ValidationHelper.validateDate(start_date, 'Tanggal keberangkatan', false);
                }
                
                if (duration_days) {
                    validatedData.duration_days = ValidationHelper.validatePositiveInteger(
                        duration_days, 
                        'Durasi', 
                        CONSTANTS.PACKAGE.MIN_DURATION, 
                        CONSTANTS.PACKAGE.MAX_DURATION
                    );
                }
                
                if (quota) {
                    validatedData.quota = ValidationHelper.validatePositiveInteger(quota, 'Kuota', 1, 1000);
                }
                
                if (itinerary) {
                    validatedData.itinerary = ValidationHelper.validateItinerary(itinerary);
                }

                if (airline) {
                    validatedData.airline = ValidationHelper.validateString(airline, 'Maskapai', 2, 100, false);
                }

                if (departure_airport) {
                    validatedData.departure_airport = ValidationHelper.validateString(departure_airport, 'Bandara', 3, 100, false);
                }
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const imageUrl = req.file ? req.file.path : null;

            const result = await TransactionHelper.executeTransaction(async (client) => {
                let destination_id = null;

                if (validatedData.location) {
                    const destResult = await AdminModel.findOrCreateDestination(validatedData.location, imageUrl);
                    destination_id = destResult.rows[0].id;
                }
                
                const packageData = {
                    id: uuidv4(),
                    name: validatedData.name,
                    destination_id,
                    image_url: imageUrl,
                    start_date: validatedData.start_date || null,
                    price: validatedData.price,
                    duration_days: validatedData.duration_days || CONSTANTS.PACKAGE.DEFAULT_DURATION_DAYS,
                    itinerary: validatedData.itinerary ? JSON.stringify(validatedData.itinerary) : null,
                    quota: validatedData.quota || CONSTANTS.PACKAGE.DEFAULT_QUOTA,
                    airline: validatedData.airline || null,
                    departure_airport: validatedData.departure_airport || null
                };

                const pkgResult = await client.query(
                    `INSERT INTO packages (id, name, destination_id, image_url, start_date, price, duration_days, itinerary, quota, airline, departure_airport) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                     RETURNING *`,
                    [
                        packageData.id,
                        packageData.name,
                        packageData.destination_id,
                        packageData.image_url,
                        packageData.start_date,
                        packageData.price,
                        packageData.duration_days,
                        packageData.itinerary,
                        packageData.quota,
                        packageData.airline,
                        packageData.departure_airport
                    ]
                );

                return pkgResult;
            });

            return commonHelper.created(res, result.rows[0], SUCCESS_MESSAGES.PACKAGE_CREATED);
        } catch (error) {
            console.error('createPackage error:', error);
            
            if (error instanceof ValidationError) {
                return commonHelper.badRequest(res, error.message);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    updatePackage: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                name, 
                location, 
                price, 
                airline, 
                departure_airport, 
                start_date, 
                duration_days, 
                itinerary, 
                quota 
            } = req.body;

            try {
                ValidationHelper.validateUUID(id, 'Package ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            let validatedData = {};

            try {
                if (name) {
                    validatedData.name = ValidationHelper.validateString(name, 'Nama paket', 3, 255, false);
                }
                if (price !== undefined && price !== null) {
                    validatedData.price = ValidationHelper.validatePrice(price);
                }
                if (location) {
                    validatedData.location = ValidationHelper.validateString(location, 'Lokasi', 2, 255, false);
                }
                if (start_date) {
                    validatedData.start_date = ValidationHelper.validateDate(start_date, 'Tanggal keberangkatan', false);
                }
                if (duration_days) {
                    validatedData.duration_days = ValidationHelper.validatePositiveInteger(
                        duration_days, 
                        'Durasi', 
                        CONSTANTS.PACKAGE.MIN_DURATION, 
                        CONSTANTS.PACKAGE.MAX_DURATION
                    );
                }
                if (quota) {
                    validatedData.quota = ValidationHelper.validatePositiveInteger(quota, 'Kuota', 1, 1000);
                }
                if (itinerary) {
                    validatedData.itinerary = ValidationHelper.validateItinerary(itinerary);
                }
                if (airline) {
                    validatedData.airline = ValidationHelper.validateString(airline, 'Maskapai', 2, 100, false);
                }
                if (departure_airport) {
                    validatedData.departure_airport = ValidationHelper.validateString(departure_airport, 'Bandara', 3, 100, false);
                }
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            if (req.file) {
                validatedData.image_url = req.file.path;
            }

            if (Object.keys(validatedData).length === 0) {
                return commonHelper.badRequest(res, 'Tidak ada data yang diupdate');
            }

            const result = await TransactionHelper.executeTransaction(async (client) => {
                const checkResult = await client.query('SELECT * FROM packages WHERE id = $1', [id]);
                
                if (checkResult.rows.length === 0) {
                    throw new Error('PACKAGE_NOT_FOUND');
                }

                const oldPackage = checkResult.rows[0];

                if (validatedData.image_url && oldPackage.image_url) {
                    try {
                        const urlParts = oldPackage.image_url.split('/');
                        const filename = urlParts[urlParts.length - 1];
                        const publicId = `${CLOUDINARY_FOLDERS.PACKAGE_IMAGES}/${filename.split('.')[0]}`;
                        await cloudinary.uploader.destroy(publicId);
                    } catch (cloudinaryError) {
                        console.error('Cloudinary delete error:', cloudinaryError);
                    }
                }

                if (validatedData.location) {
                    const destResult = await AdminModel.findOrCreateDestination(
                        validatedData.location, 
                        validatedData.image_url || oldPackage.image_url
                    );
                    validatedData.destination_id = destResult.rows[0].id;
                }

                let updateQuery = 'UPDATE packages SET updated_at = CURRENT_TIMESTAMP';
                const params = [];
                let paramIndex = 1;

                const fieldsToUpdate = {
                    name: validatedData.name,
                    destination_id: validatedData.destination_id,
                    image_url: validatedData.image_url,
                    start_date: validatedData.start_date,
                    price: validatedData.price,
                    duration_days: validatedData.duration_days,
                    itinerary: validatedData.itinerary ? JSON.stringify(validatedData.itinerary) : undefined,
                    quota: validatedData.quota,
                    airline: validatedData.airline,
                    departure_airport: validatedData.departure_airport
                };

                Object.keys(fieldsToUpdate).forEach(key => {
                    if (fieldsToUpdate[key] !== undefined) {
                        updateQuery += `, ${key} = $${paramIndex}`;
                        params.push(fieldsToUpdate[key]);
                        paramIndex++;
                    }
                });

                updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
                params.push(id);

                const updateResult = await client.query(updateQuery, params);
                return updateResult;
            });

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.PACKAGE_NOT_FOUND);
            }

            return commonHelper.success(res, result.rows[0], SUCCESS_MESSAGES.PACKAGE_UPDATED);
        } catch (error) {
            console.error('updatePackage error:', error);
            
            if (error.message === 'PACKAGE_NOT_FOUND') {
                return commonHelper.notFound(res, ERROR_MESSAGES.PACKAGE_NOT_FOUND);
            }
            
            if (error instanceof ValidationError) {
                return commonHelper.badRequest(res, error.message);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    deletePackage: async (req, res) => {
        try {
            const { id } = req.params;

            try {
                ValidationHelper.validateUUID(id, 'Package ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await TransactionHelper.safeDelete('packages', id, [
                {
                    table: 'bookings',
                    foreignKey: 'package_id',
                    errorMessage: 'Tidak dapat menghapus paket yang memiliki booking aktif. Batalkan booking terlebih dahulu.'
                }
            ]);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.PACKAGE_NOT_FOUND);
            }

            const deletedPackage = result.rows[0];
            if (deletedPackage.image_url) {
                try {
                    const urlParts = deletedPackage.image_url.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    const publicId = `${CLOUDINARY_FOLDERS.PACKAGE_IMAGES}/${filename.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Cloudinary delete error:', cloudinaryError);
                }
            }

            return commonHelper.success(res, null, SUCCESS_MESSAGES.PACKAGE_DELETED);
        } catch (error) {
            console.error('deletePackage error:', error);
            
            if (error.message.includes('Tidak dapat menghapus')) {
                return commonHelper.badRequest(res, error.message);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    
    getAllArticles: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
            const limit = parseInt(req.query.limit) || PAGINATION.ARTICLE_LIST_LIMIT;
            const offset = (page - 1) * limit;

            const articles = await AdminModel.getAllArticles(limit, offset);
            const countResult = await AdminModel.countAllArticles();
            const total = parseInt(countResult.rows[0].count);

            const data = articles.rows.map(article => ({
                displayId: article.display_id,
                id: article.id,
                judulArtikel: article.title,
                tanggalTerbit: article.created_at,
                status: article.status
            }));

            return commonHelper.success(res, data, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            console.error('getAllArticles error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    searchArticles: async (req, res) => {
        try {
            const { search } = req.query;

            if (!search || search.trim() === '') {
                return commonHelper.badRequest(res, ERROR_MESSAGES.SEARCH_QUERY_REQUIRED);
            }

            const result = await AdminModel.searchArticles(search.trim());

            const data = result.rows.map(article => ({
                displayId: article.display_id,
                id: article.id,
                judulArtikel: article.title,
                tanggalTerbit: article.created_at,
                status: article.status
            }));

            return commonHelper.success(res, data);
        } catch (error) {
            console.error('searchArticles error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getArticleDetail: async (req, res) => {
        try {
            const { id } = req.params;

            try {
                ValidationHelper.validateUUID(id, 'Article ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await AdminModel.getArticleById(id);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.ARTICLE_NOT_FOUND);
            }

            const article = result.rows[0];
            return commonHelper.success(res, {
                id: article.id,
                judulArtikel: article.title,
                tanggal: article.created_at,
                isiArtikel: article.content
            });
        } catch (error) {
            console.error('getArticleDetail error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    createArticle: async (req, res) => {
        try {
            const { title, category, cover_image_url, content, excerpt, tags, is_published } = req.body;

            let validatedData = {};

            try {
                validatedData.title = ValidationHelper.validateString(title, 'Judul artikel', 3, 255);
                
                if (content) {
                    validatedData.content = ValidationHelper.validateString(
                        content, 
                        'Isi artikel', 
                        10, 
                        CONSTANTS.VALIDATION.CONTENT_MAX_LENGTH, 
                        false
                    );
                }

                if (category) {
                    validatedData.category = ValidationHelper.validateString(category, 'Kategori', 2, 100, false);
                }

                if (excerpt) {
                    validatedData.excerpt = ValidationHelper.validateString(
                        excerpt, 
                        'Excerpt', 
                        10, 
                        CONSTANTS.VALIDATION.DESCRIPTION_MAX_LENGTH, 
                        false
                    );
                }
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const articleData = {
                id: uuidv4(),
                author_id: req.user.id,
                title: validatedData.title,
                slug: validatedData.title.toLowerCase().replace(/\s+/g, '-'),
                category: validatedData.category || null,
                cover_image_url: cover_image_url || null,
                content: validatedData.content || null,
                excerpt: validatedData.excerpt || null,
                tags: tags || null,
                is_published: is_published || false
            };

            const result = await AdminModel.createArticle(articleData);
            return commonHelper.created(res, result.rows[0], SUCCESS_MESSAGES.ARTICLE_CREATED);
        } catch (error) {
            console.error('createArticle error:', error);
            
            if (error instanceof ValidationError) {
                return commonHelper.badRequest(res, error.message);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    updateArticle: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, category, cover_image_url, content, excerpt, tags, is_published } = req.body;

            try {
                ValidationHelper.validateUUID(id, 'Article ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            let validatedData = {};

            try {
                if (title) {
                    validatedData.title = ValidationHelper.validateString(title, 'Judul artikel', 3, 255, false);
                    validatedData.slug = validatedData.title.toLowerCase().replace(/\s+/g, '-');
                }
                if (content) {
                    validatedData.content = ValidationHelper.validateString(
                        content, 
                        'Isi artikel', 
                        10, 
                        CONSTANTS.VALIDATION.CONTENT_MAX_LENGTH, 
                        false
                    );
                }
                if (category) {
                    validatedData.category = ValidationHelper.validateString(category, 'Kategori', 2, 100, false);
                }
                if (excerpt) {
                    validatedData.excerpt = ValidationHelper.validateString(
                        excerpt, 
                        'Excerpt', 
                        10, 
                        CONSTANTS.VALIDATION.DESCRIPTION_MAX_LENGTH, 
                        false
                    );
                }
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const articleData = {
                ...validatedData,
                cover_image_url,
                tags,
                is_published
            };

            const result = await AdminModel.updateArticle(id, articleData);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.ARTICLE_NOT_FOUND);
            }

            return commonHelper.success(res, result.rows[0], SUCCESS_MESSAGES.ARTICLE_UPDATED);
        } catch (error) {
            console.error('updateArticle error:', error);
            
            if (error instanceof ValidationError) {
                return commonHelper.badRequest(res, error.message);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    deleteArticle: async (req, res) => {
        try {
            const { id } = req.params;

            try {
                ValidationHelper.validateUUID(id, 'Article ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await TransactionHelper.executeTransaction(async (client) => {
                const deleteResult = await client.query(
                    'DELETE FROM articles WHERE id = $1 RETURNING *',
                    [id]
                );
                return deleteResult;
            });

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.ARTICLE_NOT_FOUND);
            }

            return commonHelper.success(res, null, SUCCESS_MESSAGES.ARTICLE_DELETED);
        } catch (error) {
            console.error('deleteArticle error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    togglePublish: async (req, res) => {
        try {
            const { id } = req.params;

            try {
                ValidationHelper.validateUUID(id, 'Article ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await AdminModel.togglePublishArticle(id);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.ARTICLE_NOT_FOUND);
            }

            const message = result.rows[0].is_published 
                ? SUCCESS_MESSAGES.ARTICLE_PUBLISHED
                : SUCCESS_MESSAGES.ARTICLE_UNPUBLISHED;

            return commonHelper.success(res, {
                id: result.rows[0].id,
                isPublished: result.rows[0].is_published
            }, message);
        } catch (error) {
            console.error('togglePublish error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    
    getAllOrders: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
            const limit = parseInt(req.query.limit) || PAGINATION.ORDER_LIST_LIMIT;
            const offset = (page - 1) * limit;
            const { status, search } = req.query;

            let validatedStatus = null;
            if (status) {
                try {
                    validatedStatus = ValidationHelper.validateEnum(
                        status, 
                        ['selesai', 'pending', 'cancelled'], 
                        'Status'
                    );
                } catch (validationError) {
                    return commonHelper.badRequest(res, validationError.message);
                }
            }

            const orders = await AdminModel.getAllOrders({ status: validatedStatus, search, limit, offset });
            const countResult = await AdminModel.countAllOrders({ status: validatedStatus, search });
            const total = parseInt(countResult.rows[0].count);

            const data = orders.rows.map(order => ({
                tourId: order.tour_id,
                namaLengkap: order.nama_lengkap,
                namaPaket: order.nama_paket,
                tanggal: order.tanggal,
                status: order.status,
                pembayaran: parseFloat(order.pembayaran)
            }));

            return commonHelper.success(res, data, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            console.error('getAllOrders error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getOrderDetail: async (req, res) => {
        try {
            const { tour_id } = req.params;

            if (!tour_id || tour_id.trim() === '') {
                return commonHelper.badRequest(res, 'Tour ID wajib diisi');
            }

            const result = await AdminModel.getOrderByTourId(tour_id);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.ORDER_NOT_FOUND);
            }

            const order = result.rows[0];
            return commonHelper.success(res, {
                tourId: order.tour_id,
                namaLengkap: order.nama_lengkap,
                email: order.email,
                phoneNumber: order.phone_number,
                namaPaket: order.nama_paket,
                tanggal: order.tanggal,
                status: order.status,
                pembayaran: parseFloat(order.pembayaran)
            });
        } catch (error) {
            console.error('getOrderDetail error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const { booking_id } = req.params;
            const { status } = req.body;

            try {
                ValidationHelper.validateUUID(booking_id, 'Booking ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            let validatedStatus;
            try {
                validatedStatus = ValidationHelper.validateEnum(
                    status, 
                    [CONSTANTS.BOOKING_STATUS.PENDING, CONSTANTS.BOOKING_STATUS.CONFIRMED, CONSTANTS.BOOKING_STATUS.CANCELLED, CONSTANTS.BOOKING_STATUS.COMPLETED],
                    'Status'
                );
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await TransactionHelper.executeTransaction(async (client) => {
                const updateResult = await client.query(
                    `UPDATE bookings 
                     SET status = $1, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $2 
                     RETURNING *`,
                    [validatedStatus, booking_id]
                );
                return updateResult;
            });

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.ORDER_NOT_FOUND);
            }

            return commonHelper.success(res, {
                id: result.rows[0].id,
                status: result.rows[0].status
            }, SUCCESS_MESSAGES.ORDER_UPDATED);
        } catch (error) {
            console.error('updateOrderStatus error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    updatePaymentStatus: async (req, res) => {
        try {
            const { booking_id } = req.params;
            const { paymentStatus } = req.body;

            try {
                ValidationHelper.validateUUID(booking_id, 'Booking ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            let validatedStatus;
            try {
                validatedStatus = ValidationHelper.validateEnum(
                    paymentStatus, 
                    [CONSTANTS.PAYMENT_STATUS.UNPAID, CONSTANTS.PAYMENT_STATUS.PAID, CONSTANTS.PAYMENT_STATUS.REFUNDED, CONSTANTS.PAYMENT_STATUS.FAILED],
                    'Payment Status'
                );
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await TransactionHelper.executeTransaction(async (client) => {
                const updateResult = await client.query(
                    `UPDATE bookings 
                     SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $2 
                     RETURNING *`,
                    [validatedStatus, booking_id]
                );
                return updateResult;
            });

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.ORDER_NOT_FOUND);
            }

            return commonHelper.success(res, {
                id: result.rows[0].id,
                paymentStatus: result.rows[0].payment_status
            }, SUCCESS_MESSAGES.PAYMENT_UPDATED);
        } catch (error) {
            console.error('updatePaymentStatus error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    
    getAdminProfile: async (req, res) => {
        try {
            const adminId = req.user.id;
            const result = await AdminModel.getAdminProfile(adminId);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.ADMIN_NOT_FOUND);
            }

            const admin = result.rows[0];
            return commonHelper.success(res, {
                id: admin.id,
                nama: admin.nama,
                email: admin.email,
                noTelepon: admin.no_telepon,
                avatarUrl: admin.avatar_url,
                role: admin.role
            });
        } catch (error) {
            console.error('getAdminProfile error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    updateAdminProfile: async (req, res) => {
        try {
            const adminId = req.user.id;
            const { nama, email, noTelepon, password } = req.body;

            let profileData = {};

            try {
                if (nama) {
                    profileData.nama = ValidationHelper.validateString(nama, 'Nama', 2, 100, false);
                }
                if (email) {
                    profileData.email = ValidationHelper.validateEmail(email);
                }
                if (noTelepon) {
                    profileData.noTelepon = ValidationHelper.validatePhoneNumber(noTelepon, false);
                }
                if (password) {
                    const validatedPassword = ValidationHelper.validatePassword(password, 'Password', false);
                    if (validatedPassword) {
                        profileData.password = await bcrypt.hash(validatedPassword, 10);
                    }
                }
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            if (Object.keys(profileData).length === 0) {
                return commonHelper.badRequest(res, 'Tidak ada data yang diupdate');
            }

            const result = await AdminModel.updateAdminProfile(adminId, profileData);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, ERROR_MESSAGES.ADMIN_NOT_FOUND);
            }

            const admin = result.rows[0];
            return commonHelper.success(res, {
                id: admin.id,
                nama: admin.nama,
                email: admin.email,
                noTelepon: admin.no_telepon
            }, SUCCESS_MESSAGES.PROFILE_UPDATED);
        } catch (error) {
            console.error('updateAdminProfile error:', error);
            
            if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
                return commonHelper.badRequest(res, ERROR_MESSAGES.USER_ALREADY_EXISTS);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    uploadAdminPhoto: async (req, res) => {
        try {
            const adminId = req.user.id;
            
            if (!req.file) {
                return commonHelper.badRequest(res, ERROR_MESSAGES.FILE_NOT_FOUND);
            }

            const avatarUrl = req.file.path;

            const currentAdmin = await AdminModel.getAdminProfile(adminId);
            if (currentAdmin.rows.length > 0 && currentAdmin.rows[0].avatar_url) {
                try {
                    const urlParts = currentAdmin.rows[0].avatar_url.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    const publicId = `${CLOUDINARY_FOLDERS.USER_AVATARS}/${filename.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Cloudinary delete error:', cloudinaryError);
                }
            }

            const result = await AdminModel.updateAdminAvatar(adminId, avatarUrl);

            return commonHelper.success(res, {
                avatarUrl: result.rows[0].avatar_url
            }, SUCCESS_MESSAGES.PHOTO_UPLOADED);
        } catch (error) {
            console.error('uploadAdminPhoto error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    deleteAdminPhoto: async (req, res) => {
        try {
            const adminId = req.user.id;
            
            const result = await TransactionHelper.executeTransaction(async (client) => {
                const currentAdmin = await client.query(
                    'SELECT avatar_url FROM users WHERE id = $1 AND role = $2',
                    [adminId, CONSTANTS.ROLES.ADMIN]
                );
                
                if (currentAdmin.rows.length === 0) {
                    throw new Error('ADMIN_NOT_FOUND');
                }

                const admin = currentAdmin.rows[0];

                if (admin.avatar_url) {
                    try {
                        const urlParts = admin.avatar_url.split('/');
                        const filename = urlParts[urlParts.length - 1];
                        const publicId = `${CLOUDINARY_FOLDERS.USER_AVATARS}/${filename.split('.')[0]}`;
                        await cloudinary.uploader.destroy(publicId);
                    } catch (cloudinaryError) {
                        console.error('Cloudinary delete error:', cloudinaryError);
                    }
                }

                const deleteResult = await client.query(
                    `UPDATE users 
                     SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $1 AND role = $2
                     RETURNING id, avatar_url`,
                    [adminId, CONSTANTS.ROLES.ADMIN]
                );

                return deleteResult;
            });

            return commonHelper.success(res, null, SUCCESS_MESSAGES.PHOTO_DELETED);
        } catch (error) {
            console.error('deleteAdminPhoto error:', error);
            
            if (error.message === 'ADMIN_NOT_FOUND') {
                return commonHelper.notFound(res, ERROR_MESSAGES.ADMIN_NOT_FOUND);
            }
            
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },


    getSalesPerformance: async (req, res) => {
        try {
            const result = await AdminModel.getSalesPerformance();
            return commonHelper.success(res, result.rows);
        } catch (error) {
            console.error('getSalesPerformance error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getAgentPerformance: async (req, res) => {
        try {
            const result = await AdminModel.getAgentPerformance();
            return commonHelper.success(res, result.rows);
        } catch (error) {
            console.error('getAgentPerformance error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getUpcomingTrips: async (req, res) => {
        try {
            const result = await AdminModel.getUpcomingTrips();
            return commonHelper.success(res, result.rows);
        } catch (error) {
            console.error('getUpcomingTrips error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getOrderStats: async (req, res) => {
        try {
            const result = await AdminModel.getOrderStats();
            return commonHelper.success(res, result.rows[0]);
        } catch (error) {
            console.error('getOrderStats error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },


    getAllCommunityPosts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
            const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
            const offset = (page - 1) * limit;
            const { month } = req.query;

            const posts = await AdminModel.getAllCommunityPosts({ month, limit, offset });
            const countResult = await AdminModel.countAllCommunityPosts(month);
            const total = parseInt(countResult.rows[0].count);

            return commonHelper.success(res, posts.rows, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            console.error('getAllCommunityPosts error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    getCommunityPostDetail: async (req, res) => {
        try {
            const { id } = req.params;

            try {
                ValidationHelper.validateUUID(id, 'Post ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await AdminModel.getCommunityPostById(id);

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, 'Postingan tidak ditemukan');
            }

            return commonHelper.success(res, result.rows[0]);
        } catch (error) {
            console.error('getCommunityPostDetail error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    deleteCommunityPost: async (req, res) => {
        try {
            const { id } = req.params;

            try {
                ValidationHelper.validateUUID(id, 'Post ID');
            } catch (validationError) {
                return commonHelper.badRequest(res, validationError.message);
            }

            const result = await TransactionHelper.executeTransaction(async (client) => {
                const deleteResult = await client.query(
                    'DELETE FROM community_posts WHERE id = $1 RETURNING *',
                    [id]
                );
                return deleteResult;
            });

            if (result.rows.length === 0) {
                return commonHelper.notFound(res, 'Postingan tidak ditemukan');
            }

            return commonHelper.success(res, null, SUCCESS_MESSAGES.POST_DELETED);
        } catch (error) {
            console.error('deleteCommunityPost error:', error);
            return commonHelper.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
};

module.exports = AdminController;