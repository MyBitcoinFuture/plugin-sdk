/**
 * Shared utilities for MyBitcoinFuture plugins
 * 
 * Common functions and patterns used across multiple plugins
 */

const axios = require('axios');
const crypto = require('crypto');

/**
 * API Response utility following dashboard patterns
 */
const ApiResponse = {
  success: (res, data, message = 'Success') => {
    return res.json({
      success: true,
      data,
      message,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  },

  error: (res, message, code = 500, details = null) => {
    return res.status(code).json({
      success: false,
      error: {
        code: code === 500 ? 'INTERNAL_ERROR' : 'CLIENT_ERROR',
        message,
        details
      },
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Enhanced error handling for plugins
 */
class PluginError extends Error {
  constructor(message, code = 'PLUGIN_ERROR', details = null) {
    super(message);
    this.name = 'PluginError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Async error wrapper for plugin methods
 */
const asyncErrorHandler = (fn) => {
  return async function(...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      console.error('Plugin operation failed:', error);
      
      if (error instanceof PluginError) {
        throw error;
      }
      
      throw new PluginError(
        `Operation failed: ${error.message}`,
        'OPERATION_FAILED',
        { originalError: error.message }
      );
    }
  };
};

/**
 * Configuration validation utilities
 */
const validateConfig = (config, schema) => {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: 'Configuration must be an object' };
  }

  // Basic schema validation
  for (const [key, rules] of Object.entries(schema.properties || {})) {
    const value = config[key];
    
    if (rules.required && (value === undefined || value === null)) {
      return { valid: false, error: `Required field '${key}' is missing` };
    }
    
    if (value !== undefined && rules.type && typeof value !== rules.type) {
      return { valid: false, error: `Field '${key}' must be of type ${rules.type}` };
    }
    
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return { valid: false, error: `Field '${key}' does not match required pattern` };
    }
  }

  return { valid: true };
};

/**
 * License validation utilities
 */
const LicenseValidator = {
  /**
   * Validate license key format
   */
  validateFormat(licenseKey) {
    if (!licenseKey || typeof licenseKey !== 'string') {
      return { valid: false, error: 'License key must be a string' };
    }

    // Expected format: PLUGIN-XXXX-XXXX-XXXX-XXXX
    const pattern = /^[A-Z]+-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!pattern.test(licenseKey)) {
      return { valid: false, error: 'Invalid license key format' };
    }

    return { valid: true };
  },

  /**
   * Generate license checksum
   */
  generateChecksum(licenseKey, pluginName) {
    const data = `${licenseKey}:${pluginName}:${process.env.LICENSE_SECRET || 'default-secret'}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
  },

  /**
   * Validate license checksum
   */
  validateChecksum(licenseKey, pluginName, expectedChecksum) {
    const actualChecksum = this.generateChecksum(licenseKey, pluginName);
    return actualChecksum === expectedChecksum;
  }
};

/**
 * HTTP client with retry logic
 */
const createHttpClient = (baseConfig = {}) => {
  const client = axios.create({
    timeout: 10000,
    ...baseConfig
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      config.headers['User-Agent'] = 'MyBitcoinFuture-Plugin/1.0.0';
      config.headers['X-Plugin-Version'] = '1.0.0';
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor with retry logic
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;
      
      // Retry logic for network errors
      if (!config.retryCount) {
        config.retryCount = 0;
      }
      
      const shouldRetry = (
        config.retryCount < 3 &&
        (!error.response || error.response.status >= 500)
      );
      
      if (shouldRetry) {
        config.retryCount++;
        const delay = Math.pow(2, config.retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return client(config);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Data sanitization utilities
 */
const sanitize = {
  /**
   * Sanitize string input
   */
  string(input, maxLength = 1000) {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/[<>]/g, '') // Remove angle brackets
      .substring(0, maxLength)
      .trim();
  },

  /**
   * Sanitize number input
   */
  number(input, min = -Infinity, max = Infinity) {
    const num = parseFloat(input);
    if (isNaN(num)) {
      return 0;
    }
    return Math.max(min, Math.min(max, num));
  },

  /**
   * Sanitize boolean input
   */
  boolean(input) {
    if (typeof input === 'boolean') {
      return input;
    }
    if (typeof input === 'string') {
      return input.toLowerCase() === 'true';
    }
    return Boolean(input);
  },

  /**
   * Sanitize email
   */
  email(input) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = this.string(input, 255);
    return emailPattern.test(sanitized) ? sanitized : '';
  }
};

/**
 * Rate limiting utilities
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requestTimes = this.requests.get(key);
    
    // Remove old requests outside the window
    while (requestTimes.length > 0 && requestTimes[0] < windowStart) {
      requestTimes.shift();
    }
    
    // Check if under limit
    if (requestTimes.length < this.maxRequests) {
      requestTimes.push(now);
      return true;
    }
    
    return false;
  }

  getRemainingRequests(key) {
    if (!this.requests.has(key)) {
      return this.maxRequests;
    }
    
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requestTimes = this.requests.get(key);
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

/**
 * Cache utilities
 */
class SimpleCache {
  constructor(defaultTtl = 300000) { // 5 minutes default
    this.cache = new Map();
    this.ttls = new Map();
    this.defaultTtl = defaultTtl;
  }

  set(key, value, ttl = this.defaultTtl) {
    this.cache.set(key, value);
    this.ttls.set(key, Date.now() + ttl);
  }

  get(key) {
    const ttl = this.ttls.get(key);
    if (!ttl || Date.now() > ttl) {
      this.cache.delete(key);
      this.ttls.delete(key);
      return undefined;
    }
    return this.cache.get(key);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  size() {
    // Clean expired entries first
    const now = Date.now();
    for (const [key, ttl] of this.ttls.entries()) {
      if (now > ttl) {
        this.cache.delete(key);
        this.ttls.delete(key);
      }
    }
    return this.cache.size;
  }
}

module.exports = {
  ApiResponse,
  PluginError,
  asyncErrorHandler,
  validateConfig,
  LicenseValidator,
  createHttpClient,
  sanitize,
  RateLimiter,
  SimpleCache
};
