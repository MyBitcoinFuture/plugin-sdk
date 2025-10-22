/**
 * Security utilities for MyBitcoinFuture Plugin SDK
 * 
 * Bitcoin-specific validation and security functions
 */

const crypto = require('crypto');

// Input validation patterns
const VALIDATION_PATTERNS = {
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  walletLabel: /^[a-zA-Z0-9\s_-]{1,50}$/,
  xpub: /^(xpub|ypub|zpub|tpub|upub|vpub)[a-zA-Z0-9]{100,120}$/,
  bitcoinAddress: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
  amount: /^\d+(\.\d{1,8})?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  filename: /^[a-zA-Z0-9._-]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  hex: /^[0-9a-fA-F]+$/,
  base64: /^[A-Za-z0-9+/]*={0,2}$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  phone: /^\+?[\d\s\-\(\)]{10,20}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}:\d{2}$/,
  datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/,
  color: /^#[0-9a-fA-F]{6}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  path: /^[a-zA-Z0-9/._-]+$/,
  json: /^\{.*\}$|^\[.*\]$/
};

/**
 * Validation functions for specific Bitcoin-related fields
 */
const validateBitcoinAddress = (address) => {
  if (!address || typeof address !== "string") {
    return "Bitcoin address is required";
  }

  const trimmedAddress = address.trim();

  // Check for basic format
  if (!VALIDATION_PATTERNS.bitcoinAddress.test(trimmedAddress)) {
    return "Invalid Bitcoin address format";
  }

  // Additional checks for specific address types
  if (trimmedAddress.startsWith("bc1")) {
    // Bech32 address (SegWit v0)
    if (trimmedAddress.length < 42 || trimmedAddress.length > 62) {
      return "Invalid Bech32 address length";
    }
  } else if (trimmedAddress.startsWith("1")) {
    // P2PKH address
    if (trimmedAddress.length < 26 || trimmedAddress.length > 35) {
      return "Invalid P2PKH address length";
    }
  } else if (trimmedAddress.startsWith("3")) {
    // P2SH address
    if (trimmedAddress.length < 26 || trimmedAddress.length > 35) {
      return "Invalid P2SH address length";
    }
  }

  return true;
};

const validateXPUB = (xpub) => {
  if (!xpub || typeof xpub !== "string") {
    return { valid: false, message: "XPUB is required" };
  }

  const trimmedXpub = xpub.trim();

  if (!VALIDATION_PATTERNS.xpub.test(trimmedXpub)) {
    return { valid: false, message: "Invalid XPUB format" };
  }

  return { valid: true, message: "XPUB is valid" };
};

/**
 * General validation functions
 */
const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return "Email is required";
  }

  if (!VALIDATION_PATTERNS.email.test(email.trim())) {
    return "Invalid email format";
  }

  return true;
};

const validateUsername = (username) => {
  if (!username || typeof username !== "string") {
    return "Username is required";
  }

  if (!VALIDATION_PATTERNS.username.test(username.trim())) {
    return "Username must be 3-20 characters, letters, numbers, underscores, and hyphens only";
  }

  return true;
};

const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return "Password is required";
  }

  if (!VALIDATION_PATTERNS.password.test(password)) {
    return "Password must be 8+ characters with uppercase, lowercase, number, and special character";
  }

  return true;
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

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean old requests
    if (this.requests.has(identifier)) {
      this.requests.set(identifier,
        this.requests.get(identifier).filter(timestamp => timestamp > windowStart)
      );
    } else {
      this.requests.set(identifier, []);
    }

    const requests = this.requests.get(identifier);

    if (requests.length >= this.maxRequests) {
      return false;
    }

    requests.push(now);
    return true;
  }

  reset(identifier) {
    this.requests.delete(identifier);
  }
}

/**
 * Data sanitization utilities
 */
const sanitize = {
  string: (input, maxLength = 1000) => {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .substring(0, maxLength)
      .trim();
  },

  number: (input, min = -Infinity, max = Infinity) => {
    const num = parseFloat(input);
    if (isNaN(num)) {
      return 0;
    }
    return Math.max(min, Math.min(max, num));
  },

  boolean: (input) => {
    if (typeof input === 'boolean') {
      return input;
    }
    if (typeof input === 'string') {
      return input.toLowerCase() === 'true';
    }
    return Boolean(input);
  },

  email: (input) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = this.string(input, 255);
    return emailPattern.test(sanitized) ? sanitized : '';
  }
};

/**
 * Hash utilities
 */
const hashUtils = {
  sha256: (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  sha512: (data) => {
    return crypto.createHash('sha512').update(data).digest('hex');
  },

  hmac: (data, secret) => {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }
};

/**
 * Token utilities
 */
const tokenUtils = {
  generateToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  generateSecureToken: (length = 64) => {
    return crypto.randomBytes(length).toString('base64url');
  },

  validateToken: (token, pattern = /^[a-zA-Z0-9_-]+$/) => {
    return typeof token === 'string' && pattern.test(token);
  }
};

module.exports = {
  VALIDATION_PATTERNS,
  validateBitcoinAddress,
  validateXPUB,
  validateEmail,
  validateUsername,
  validatePassword,
  RateLimiter,
  sanitize,
  hashUtils,
  tokenUtils
};
