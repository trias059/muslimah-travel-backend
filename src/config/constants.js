const CONSTANTS = {
    ROLES: {
        USER: 'user',
        ADMIN: 'admin',
        SUPER_ADMIN: 'super_admin'
    },

    BOOKING_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        CANCELLED: 'cancelled',
        COMPLETED: 'completed'
    },

    PAYMENT_STATUS: {
        UNPAID: 'unpaid',
        PAID: 'paid',
        REFUNDED: 'refunded',
        FAILED: 'failed'
    },

    READABLE_STATUS: {
        PAID: 'Selesai',
        PENDING: 'Pending',
        CANCELLED: 'Cancelled',
        CONFIRMED: 'Dikonfirmasi',
        COMPLETED: 'Selesai'
    },

    ARTICLE_STATUS: {
        DRAFT: 'Draft',
        PUBLISHED: 'Selesai',
        ARCHIVED: 'Archived'
    },

    COMMUNITY_POST_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected'
    },

    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
        USER_LIST_LIMIT: 10,
        PACKAGE_LIST_LIMIT: 10,
        ARTICLE_LIST_LIMIT: 10,
        ORDER_LIST_LIMIT: 10,
        TOP_BUYERS_LIMIT: 6,
        TOP_PACKAGES_LIMIT: 3,
        RECENT_BOOKINGS_LIMIT: 3
    },

    FILE_LIMITS: {
        IMAGE_MAX_SIZE: 3 * 1024 * 1024,
        DOCUMENT_MAX_SIZE: 10 * 1024 * 1024,
        ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
        ALLOWED_DOCUMENT_FORMATS: ['pdf', 'doc', 'docx']
    },

    CLOUDINARY_FOLDERS: {
        PACKAGE_IMAGES: 'muslimah-travel/package-images',
        USER_AVATARS: 'muslimah-travel/user-avatars',
        ARTICLE_COVERS: 'muslimah-travel/article-covers',
        COMMUNITY_POSTS: 'muslimah-travel/community-posts'
    },

    PACKAGE: {
        DEFAULT_DURATION_DAYS: 7,
        DEFAULT_QUOTA: 50,
        MIN_PRICE: 0,
        MAX_PRICE: 999999999.99,
        MIN_DURATION: 1,
        MAX_DURATION: 365
    },

    DESTINATION_CATEGORIES: {
        ASIA: 'Asia',
        EUROPE: 'Eropa',
        AUSTRALIA: 'Australia',
        AFRICA: 'Afrika',
        AMERICA: 'Amerika',
        INTERNATIONAL: 'International'
    },

    REGIONAL_CATEGORIES: {
        ASIA: 'Paket Halal Tour Asia',
        EUROPE: 'Paket Halal Tour Eropa',
        AUSTRALIA: 'Paket Halal Tour Australia',
        AFRICA: 'Paket Halal Tour Afrika',
        OTHER: 'Paket Halal Tour Lainnya'
    },

    REGIONAL_COLORS: {
        ASIA: '#00BCD4',
        EUROPE: '#FFA726',
        AUSTRALIA: '#5C6BC0',
        AFRICA: '#66BB6A',
        OTHER: '#9E9E9E'
    },

    VALIDATION: {
        EMAIL_MAX_LENGTH: 255,
        NAME_MIN_LENGTH: 2,
        NAME_MAX_LENGTH: 100,
        PHONE_MIN_LENGTH: 10,
        PHONE_MAX_LENGTH: 15,
        PASSWORD_MIN_LENGTH: 6,
        PASSWORD_MAX_LENGTH: 128,
        TITLE_MIN_LENGTH: 3,
        TITLE_MAX_LENGTH: 255,
        DESCRIPTION_MAX_LENGTH: 5000,
        CONTENT_MAX_LENGTH: 50000
    },

    JWT: {
        ACCESS_TOKEN_EXPIRY: '1h',
        REFRESH_TOKEN_EXPIRY: '1d',
        ISSUER: 'muslimah-travel'
    },

    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 100,
        SKIP_SUCCESSFUL_REQUESTS: false,
        SKIP_FAILED_REQUESTS: false,
        
        AUTH: {
            WINDOW_MS: 15 * 60 * 1000,
            MAX_REQUESTS: 5
        },
        ADMIN: {
            WINDOW_MS: 15 * 60 * 1000,
            MAX_REQUESTS: 200
        },
        PUBLIC: {
            WINDOW_MS: 15 * 60 * 1000,
            MAX_REQUESTS: 50
        }
    },

    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        UNPROCESSABLE_ENTITY: 422,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503
    },

    ERROR_MESSAGES: {
        INTERNAL_ERROR: 'Terjadi kesalahan pada server',
        INVALID_INPUT: 'Data input tidak valid',
        UNAUTHORIZED: 'Anda tidak memiliki akses',
        NOT_FOUND: 'Data tidak ditemukan',
        DUPLICATE_ENTRY: 'Data sudah ada',
        
        USER_NOT_FOUND: 'User tidak ditemukan',
        USER_ALREADY_EXISTS: 'Email sudah terdaftar',
        INVALID_CREDENTIALS: 'Email atau password salah',
        
        PACKAGE_NOT_FOUND: 'Paket tidak ditemukan',
        PACKAGE_REQUIRED_FIELDS: 'Nama paket dan harga wajib diisi',
        
        ARTICLE_NOT_FOUND: 'Artikel tidak ditemukan',
        
        ORDER_NOT_FOUND: 'Pesanan tidak ditemukan',
        
        FILE_NOT_FOUND: 'File tidak ditemukan',
        FILE_TOO_LARGE: 'Ukuran file terlalu besar',
        INVALID_FILE_FORMAT: 'Format file tidak didukung',
        
        SEARCH_QUERY_REQUIRED: 'Parameter pencarian wajib diisi',
        
        ADMIN_NOT_FOUND: 'Admin tidak ditemukan',
        ADMIN_ONLY: 'Akses hanya untuk admin',
        
        TRANSACTION_FAILED: 'Transaksi gagal'
    },

    SUCCESS_MESSAGES: {
        CREATED: 'Data berhasil ditambahkan',
        UPDATED: 'Data berhasil diupdate',
        DELETED: 'Data berhasil dihapus',
        UPLOAD_SUCCESS: 'File berhasil diupload',
        
        USER_CREATED: 'User berhasil ditambahkan',
        USER_UPDATED: 'User berhasil diupdate',
        USER_DELETED: 'User berhasil dihapus',
        
        PACKAGE_CREATED: 'Paket berhasil ditambahkan',
        PACKAGE_UPDATED: 'Paket berhasil diupdate',
        PACKAGE_DELETED: 'Paket berhasil dihapus',
        
        ARTICLE_CREATED: 'Artikel berhasil ditambahkan',
        ARTICLE_UPDATED: 'Artikel berhasil diupdate',
        ARTICLE_DELETED: 'Artikel berhasil dihapus',
        ARTICLE_PUBLISHED: 'Artikel berhasil dipublish',
        ARTICLE_UNPUBLISHED: 'Artikel berhasil di-unpublish',
        
        ORDER_UPDATED: 'Status order berhasil diupdate',
        PAYMENT_UPDATED: 'Status pembayaran berhasil diupdate',
        
        PROFILE_UPDATED: 'Profil berhasil diupdate',
        PHOTO_UPLOADED: 'Foto profil berhasil diupload',
        PHOTO_DELETED: 'Foto profil berhasil dihapus',
        
        POST_DELETED: 'Postingan berhasil dihapus'
    },

    PG_ERROR_CODES: {
        UNIQUE_VIOLATION: '23505',
        FOREIGN_KEY_VIOLATION: '23503',
        NOT_NULL_VIOLATION: '23502',
        CHECK_VIOLATION: '23514'
    },

    TRANSACTION_ISOLATION: {
        READ_UNCOMMITTED: 'READ UNCOMMITTED',
        READ_COMMITTED: 'READ COMMITTED',
        REPEATABLE_READ: 'REPEATABLE READ',
        SERIALIZABLE: 'SERIALIZABLE'
    }
};

module.exports = {
    CONSTANTS,
    ROLES: CONSTANTS.ROLES,
    BOOKING_STATUS: CONSTANTS.BOOKING_STATUS,
    PAYMENT_STATUS: CONSTANTS.PAYMENT_STATUS,
    PAGINATION: CONSTANTS.PAGINATION,
    FILE_LIMITS: CONSTANTS.FILE_LIMITS,
    HTTP_STATUS: CONSTANTS.HTTP_STATUS,
    ERROR_MESSAGES: CONSTANTS.ERROR_MESSAGES,
    SUCCESS_MESSAGES: CONSTANTS.SUCCESS_MESSAGES,
    PG_ERROR_CODES: CONSTANTS.PG_ERROR_CODES,
    CLOUDINARY_FOLDERS: CONSTANTS.CLOUDINARY_FOLDERS,
    TRANSACTION_ISOLATION: CONSTANTS.TRANSACTION_ISOLATION
};