/**
 * Validation utilities for MyBitcoinFuture Plugin SDK
 */

/**
 * Validates that a value is a non-empty string
 * @param {any} value - The value to validate
 * @param {string} name - The name of the field for error messages
 * @returns {string} The validated string
 * @throws {Error} If validation fails
 */
function validateString(value, name = 'value') {
    if (typeof value !== 'string') {
        throw new Error(`${name} must be a string, got ${typeof value}`);
    }

    if (value.trim().length === 0) {
        throw new Error(`${name} cannot be empty`);
    }

    return value.trim();
}

/**
 * Validates that a value is a valid number
 * @param {any} value - The value to validate
 * @param {string} name - The name of the field for error messages
 * @returns {number} The validated number
 * @throws {Error} If validation fails
 */
function validateNumber(value, name = 'value') {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`${name} must be a valid number, got ${typeof value}`);
    }

    return value;
}

/**
 * Validates that a value is a valid boolean
 * @param {any} value - The value to validate
 * @param {string} name - The name of the field for error messages
 * @returns {boolean} The validated boolean
 * @throws {Error} If validation fails
 */
function validateBoolean(value, name = 'value') {
    if (typeof value !== 'boolean') {
        throw new Error(`${name} must be a boolean, got ${typeof value}`);
    }

    return value;
}

/**
 * Validates that a value is not null or undefined
 * @param {any} value - The value to validate
 * @param {string} name - The name of the field for error messages
 * @returns {any} The validated value
 * @throws {Error} If validation fails
 */
function validateRequired(value, name = 'value') {
    if (value === null || value === undefined) {
        throw new Error(`${name} is required`);
    }

    return value;
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 * @param {string} input - The string to sanitize
 * @returns {string} The sanitized string
 */
function sanitizeString(input) {
    if (typeof input !== 'string') {
        return '';
    }

    // Remove null bytes and other control characters
    return input.replace(/[\x00-\x1F\x7F]/g, '')
                .replace(/[<>]/g, '') // Remove angle brackets
                .trim();
}

module.exports = {
    validateString,
    validateNumber,
    validateBoolean,
    validateRequired,
    sanitizeString
};
