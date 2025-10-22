/**
 * MyBitcoinFuture Plugin SDK
 * 
 * Main entry point for the plugin SDK
 * Exports all interfaces and utilities for plugin development
 */

// Core interfaces
const PluginInterface = require('./interfaces/PluginInterface');
const PrivatePluginInterface = require('./interfaces/PrivatePluginInterface');
const PublicPluginInterface = require('./interfaces/PublicPluginInterface');

// Utilities
const {
  ApiResponse,
  PluginError,
  asyncErrorHandler,
  validateConfig,
  LicenseValidator,
  createHttpClient,
  sanitize,
  RateLimiter,
  SimpleCache
} = require('./utils/helpers');

const {
  validateString,
  validateNumber,
  validateBoolean,
  validateRequired,
  sanitizeString
} = require('./utils/validation');

const {
  validateBitcoinAddress,
  validateXPUB,
  validateEmail,
  validateUsername,
  validatePassword,
  RateLimiter: SecurityRateLimiter,
  sanitize: securitySanitize,
  hashUtils,
  tokenUtils
} = require('./utils/security');

module.exports = {
  // Core interfaces
  PluginInterface,
  PrivatePluginInterface,
  PublicPluginInterface,
  
  // Utility classes and functions
  ApiResponse,
  PluginError,
  asyncErrorHandler,
  validateConfig,
  LicenseValidator,
  createHttpClient,
  sanitize,
  RateLimiter,
  SimpleCache,
  
  // Validation utilities
  validateString,
  validateNumber,
  validateBoolean,
  validateRequired,
  sanitizeString,
  
  // Security utilities
  validateBitcoinAddress,
  validateXPUB,
  validateEmail,
  validateUsername,
  validatePassword,
  SecurityRateLimiter,
  securitySanitize,
  hashUtils,
  tokenUtils
};
