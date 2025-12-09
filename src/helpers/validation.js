const validator = require('validator');


class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.statusCode = 400;
    }
}

const ValidationHelper = {
    validateEmail: (email, fieldName = 'Email') => {
        if (!email) {
            throw new ValidationError(`${fieldName} wajib diisi`, 'email');
        }

        if (typeof email !== 'string') {
            throw new ValidationError(`${fieldName} harus berupa teks`, 'email');
        }

        const trimmedEmail = email.trim();
        
        if (!validator.isEmail(trimmedEmail)) {
            throw new ValidationError(`${fieldName} tidak valid. Format: user@example.com`, 'email');
        }

        if (trimmedEmail.length > 255) {
            throw new ValidationError(`${fieldName} terlalu panjang (maksimal 255 karakter)`, 'email');
        }

        return trimmedEmail.toLowerCase();
    },

    validatePhoneNumber: (phone, required = false, fieldName = 'Nomor telepon') => {
        if (!phone) {
            if (required) {
                throw new ValidationError(`${fieldName} wajib diisi`, 'phone_number');
            }
            return null;
        }

        if (typeof phone !== 'string') {
            throw new ValidationError(`${fieldName} harus berupa teks`, 'phone_number');
        }

        const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');

        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
        
        if (!phoneRegex.test(cleanedPhone)) {
            throw new ValidationError(
                `${fieldName} tidak valid. Format yang diterima: 08xxxxxxxxxx atau +628xxxxxxxxxx`, 
                'phone_number'
            );
        }

        let normalizedPhone = cleanedPhone;
        if (cleanedPhone.startsWith('+62')) {
            normalizedPhone = '0' + cleanedPhone.substring(3);
        } else if (cleanedPhone.startsWith('62')) {
            normalizedPhone = '0' + cleanedPhone.substring(2);
        } else if (!cleanedPhone.startsWith('0')) {
            normalizedPhone = '0' + cleanedPhone;
        }

        return normalizedPhone;
    },

    validatePrice: (price, fieldName = 'Harga') => {
        if (price === null || price === undefined) {
            throw new ValidationError(`${fieldName} wajib diisi`, 'price');
        }

        const numPrice = Number(price);

        if (isNaN(numPrice)) {
            throw new ValidationError(`${fieldName} harus berupa angka`, 'price');
        }

        if (numPrice < 0) {
            throw new ValidationError(`${fieldName} tidak boleh negatif`, 'price');
        }

        if (numPrice > 999999999.99) {
            throw new ValidationError(`${fieldName} terlalu besar (maksimal 999,999,999.99)`, 'price');
        }

        if (!Number.isInteger(numPrice * 100)) {
            throw new ValidationError(`${fieldName} maksimal 2 angka di belakang koma`, 'price');
        }

        return numPrice;
    },

    validateDate: (date, fieldName = 'Tanggal', allowPast = true) => {
        if (!date) {
            throw new ValidationError(`${fieldName} wajib diisi`, 'date');
        }

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            throw new ValidationError(`${fieldName} tidak valid. Format: YYYY-MM-DD`, 'date');
        }

        if (!allowPast) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (parsedDate < today) {
                throw new ValidationError(`${fieldName} tidak boleh di masa lalu`, 'date');
            }
        }

        const year = parsedDate.getFullYear();
        if (year < 1900 || year > 2100) {
            throw new ValidationError(`${fieldName} harus antara tahun 1900-2100`, 'date');
        }

        return parsedDate.toISOString().split('T')[0];
    },

    validatePositiveInteger: (value, fieldName = 'Nilai', min = 1, max = null) => {
        if (value === null || value === undefined) {
            throw new ValidationError(`${fieldName} wajib diisi`, fieldName.toLowerCase().replace(/\s/g, '_'));
        }

        const numValue = Number(value);

        if (isNaN(numValue) || !Number.isInteger(numValue)) {
            throw new ValidationError(`${fieldName} harus berupa bilangan bulat`, fieldName.toLowerCase().replace(/\s/g, '_'));
        }

        if (numValue < min) {
            throw new ValidationError(`${fieldName} minimal ${min}`, fieldName.toLowerCase().replace(/\s/g, '_'));
        }

        if (max !== null && numValue > max) {
            throw new ValidationError(`${fieldName} maksimal ${max}`, fieldName.toLowerCase().replace(/\s/g, '_'));
        }

        return numValue;
    },

    validateString: (value, fieldName = 'Field', minLength = 1, maxLength = 255, required = true) => {
        if (!value || value.trim() === '') {
            if (required) {
                throw new ValidationError(`${fieldName} wajib diisi`, fieldName.toLowerCase().replace(/\s/g, '_'));
            }
            return null;
        }

        if (typeof value !== 'string') {
            throw new ValidationError(`${fieldName} harus berupa teks`, fieldName.toLowerCase().replace(/\s/g, '_'));
        }

        const trimmedValue = value.trim();

        if (trimmedValue.length < minLength) {
            throw new ValidationError(`${fieldName} minimal ${minLength} karakter`, fieldName.toLowerCase().replace(/\s/g, '_'));
        }

        if (trimmedValue.length > maxLength) {
            throw new ValidationError(`${fieldName} maksimal ${maxLength} karakter`, fieldName.toLowerCase().replace(/\s/g, '_'));
        }

        return trimmedValue;
    },

    validateUUID: (id, fieldName = 'ID') => {
        if (!id) {
            throw new ValidationError(`${fieldName} wajib diisi`, 'id');
        }

        if (!validator.isUUID(id, 4)) {
            throw new ValidationError(`${fieldName} tidak valid`, 'id');
        }

        return id;
    },

    validateEnum: (value, allowedValues, fieldName = 'Status') => {
        if (!value) {
            throw new ValidationError(`${fieldName} wajib diisi`, fieldName.toLowerCase().replace(/\s/g, '_'));
        }

        const normalizedValue = value.toLowerCase();
        const normalizedAllowed = allowedValues.map(v => v.toLowerCase());

        if (!normalizedAllowed.includes(normalizedValue)) {
            throw new ValidationError(
                `${fieldName} tidak valid. Nilai yang diperbolehkan: ${allowedValues.join(', ')}`,
                fieldName.toLowerCase().replace(/\s/g, '_')
            );
        }

        return normalizedValue;
    },

    validateItinerary: (itinerary) => {
        if (!itinerary) {
            return null;
        }

        let parsedItinerary;
        
        try {
            if (typeof itinerary === 'object') {
                parsedItinerary = itinerary;
            } else if (typeof itinerary === 'string') {
                parsedItinerary = JSON.parse(itinerary);
            } else {
                throw new ValidationError('Itinerary harus berupa JSON array atau object', 'itinerary');
            }
        } catch (error) {
            throw new ValidationError('Format itinerary tidak valid (harus JSON)', 'itinerary');
        }

        if (!Array.isArray(parsedItinerary)) {
            throw new ValidationError('Itinerary harus berupa array', 'itinerary');
        }

        if (parsedItinerary.length === 0) {
            return [];
        }

        parsedItinerary.forEach((item, index) => {
            if (typeof item !== 'object' || item === null) {
                throw new ValidationError(`Item itinerary ke-${index + 1} harus berupa object`, 'itinerary');
            }

            if (!item.day || typeof item.day !== 'number' || item.day < 1) {
                throw new ValidationError(
                    `Item itinerary ke-${index + 1}: field 'day' wajib diisi dan harus angka positif`,
                    'itinerary'
                );
            }

            if (!item.title || typeof item.title !== 'string' || item.title.trim() === '') {
                throw new ValidationError(
                    `Item itinerary ke-${index + 1}: field 'title' wajib diisi`,
                    'itinerary'
                );
            }

            if (item.activities && !Array.isArray(item.activities)) {
                throw new ValidationError(
                    `Item itinerary ke-${index + 1}: field 'activities' harus berupa array`,
                    'itinerary'
                );
            }
        });

        parsedItinerary.sort((a, b) => a.day - b.day);

        return parsedItinerary;
    },

    validatePassword: (password, fieldName = 'Password', required = true) => {
        if (!password) {
            if (required) {
                throw new ValidationError(`${fieldName} wajib diisi`, 'password');
            }
            return null;
        }

        if (typeof password !== 'string') {
            throw new ValidationError(`${fieldName} harus berupa teks`, 'password');
        }

        if (password.length < 6) {
            throw new ValidationError(`${fieldName} minimal 6 karakter`, 'password');
        }

        if (password.length > 128) {
            throw new ValidationError(`${fieldName} maksimal 128 karakter`, 'password');
        }

        return password;
    }
};

module.exports = { ValidationHelper, ValidationError };