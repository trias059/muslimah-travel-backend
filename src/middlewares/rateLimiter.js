const rateLimit = require('express-rate-limit');
const { CONSTANTS } = require('../config/constants');


const generalLimiter = rateLimit({
    windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
    max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
    message: {
        success: false,
        message: 'Terlalu banyak request. Silakan coba lagi dalam beberapa menit.',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: CONSTANTS.RATE_LIMIT.SKIP_SUCCESSFUL_REQUESTS,
    skipFailedRequests: CONSTANTS.RATE_LIMIT.SKIP_FAILED_REQUESTS,
    handler: (req, res) => {
        res.status(CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Terlalu banyak request. Silakan coba lagi dalam beberapa menit.',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(CONSTANTS.RATE_LIMIT.WINDOW_MS / 1000 / 60) + ' menit'
        });
    }
});

const authLimiter = rateLimit({
    windowMs: CONSTANTS.RATE_LIMIT.AUTH.WINDOW_MS,
    max: CONSTANTS.RATE_LIMIT.AUTH.MAX_REQUESTS,
    message: {
        success: false,
        message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
        error: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    handler: (req, res) => {
        res.status(CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Terlalu banyak percobaan login. Akun Anda diblokir sementara untuk keamanan.',
            error: 'AUTH_RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(CONSTANTS.RATE_LIMIT.AUTH.WINDOW_MS / 1000 / 60) + ' menit'
        });
    }
});

const adminLimiter = rateLimit({
    windowMs: CONSTANTS.RATE_LIMIT.ADMIN.WINDOW_MS,
    max: CONSTANTS.RATE_LIMIT.ADMIN.MAX_REQUESTS,
    message: {
        success: false,
        message: 'Terlalu banyak request admin. Silakan coba lagi dalam beberapa menit.',
        error: 'ADMIN_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    handler: (req, res) => {
        res.status(CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Terlalu banyak request admin. Silakan coba lagi dalam beberapa menit.',
            error: 'ADMIN_RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(CONSTANTS.RATE_LIMIT.ADMIN.WINDOW_MS / 1000 / 60) + ' menit'
        });
    }
});

const publicLimiter = rateLimit({
    windowMs: CONSTANTS.RATE_LIMIT.PUBLIC.WINDOW_MS,
    max: CONSTANTS.RATE_LIMIT.PUBLIC.MAX_REQUESTS,
    message: {
        success: false,
        message: 'Terlalu banyak request. Silakan coba lagi dalam beberapa menit.',
        error: 'PUBLIC_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Terlalu banyak request. Silakan coba lagi dalam beberapa menit.',
            error: 'PUBLIC_RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(CONSTANTS.RATE_LIMIT.PUBLIC.WINDOW_MS / 1000 / 60) + ' menit'
        });
    }
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Terlalu banyak upload file. Silakan coba lagi dalam beberapa menit.',
        error: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Terlalu banyak upload file. Silakan coba lagi dalam beberapa menit.',
            error: 'UPLOAD_RATE_LIMIT_EXCEEDED',
            retryAfter: '15 menit'
        });
    }
});

const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Terlalu banyak pencarian. Silakan tunggu sebentar.',
        error: 'SEARCH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Terlalu banyak pencarian. Silakan tunggu sebentar.',
            error: 'SEARCH_RATE_LIMIT_EXCEEDED',
            retryAfter: '1 menit'
        });
    }
});

const createCustomLimiter = (options = {}) => {
    const defaultOptions = {
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message: options.message || 'Terlalu banyak request. Silakan coba lagi nanti.',
                error: 'RATE_LIMIT_EXCEEDED'
            });
        }
    };

    return rateLimit({ ...defaultOptions, ...options });
};

module.exports = {
    generalLimiter,
    authLimiter,
    adminLimiter,
    publicLimiter,
    uploadLimiter,
    searchLimiter,
    createCustomLimiter
};