# Plugin SDK Migration Guide

This guide explains how to migrate existing plugins to use the new `@mybitcoinfuture/plugin-sdk` package.

## Before Migration

### Current Plugin Structure

```javascript
// Current fragile relative path import
const PrivatePluginInterface = require('../../../src/shared/PluginInterface');

class MyPlugin extends PrivatePluginInterface {
  constructor() {
    super();
    this.name = 'my-plugin';
    this.version = '1.0.0';
    this.price = 49;
  }
}
```

## After Migration

### Updated Plugin Structure

```javascript
// New stable npm package import
const { PrivatePluginInterface } = require('@mybitcoinfuture/plugin-sdk');

class MyPlugin extends PrivatePluginInterface {
  constructor() {
    super();
    this.name = 'my-plugin';
    this.version = '1.0.0';
    this.price = 49;
  }
}
```

## Step-by-Step Migration

### 1. Add SDK Dependency

Update your plugin's `package.json`:

```json
{
  "dependencies": {
    "@mybitcoinfuture/plugin-sdk": "^1.0.0"
  }
}
```

### 2. Update Import Statements

**Before:**
```javascript
const PrivatePluginInterface = require('../../../src/shared/PluginInterface');
```

**After:**
```javascript
const { PrivatePluginInterface } = require('@mybitcoinfuture/plugin-sdk');
```

### 3. Update Utility Imports

**Before:**
```javascript
const { ApiResponse, PluginError } = require('../../../src/shared/utils');
```

**After:**
```javascript
const { ApiResponse, PluginError } = require('@mybitcoinfuture/plugin-sdk');
```

### 4. Update Validation Imports

**Before:**
```javascript
const { validateBitcoinAddress, validateXPUB } = require('../../../../dashboard/core/utils/security');
```

**After:**
```javascript
const { validateBitcoinAddress, validateXPUB } = require('@mybitcoinfuture/plugin-sdk');
```

## Interface Changes

### PluginInterface

- No breaking changes
- All existing methods remain the same
- Additional utility methods available

### PrivatePluginInterface

- No breaking changes
- License validation remains the same
- Payment integration unchanged

### PublicPluginInterface

- New interface for public plugins
- Similar to PluginInterface but with community features

## Utility Changes

### New Utilities Available

```javascript
const {
  // Core interfaces
  PluginInterface,
  PrivatePluginInterface,
  PublicPluginInterface,
  
  // API helpers
  ApiResponse,
  PluginError,
  asyncErrorHandler,
  
  // Validation
  validateBitcoinAddress,
  validateXPUB,
  validateEmail,
  validateUsername,
  validatePassword,
  
  // HTTP client
  createHttpClient,
  
  // Rate limiting
  RateLimiter,
  
  // Caching
  SimpleCache,
  
  // Security
  sanitize,
  hashUtils,
  tokenUtils
} = require('@mybitcoinfuture/plugin-sdk');
```

### Removed Utilities

- Relative path imports
- Direct dashboard utility imports
- Fragile dependency chains

## Testing Migration

### 1. Update Test Imports

**Before:**
```javascript
const MyPlugin = require('../src/index');
const { PluginError } = require('../../../src/shared/utils');
```

**After:**
```javascript
const MyPlugin = require('../src/index');
const { PluginError } = require('@mybitcoinfuture/plugin-sdk');
```

### 2. Update Test Configuration

Add SDK to test dependencies:

```json
{
  "devDependencies": {
    "@mybitcoinfuture/plugin-sdk": "^1.0.0"
  }
}
```

## Benefits of Migration

1. **Stable Dependencies**: No more fragile relative paths
2. **Version Control**: Semantic versioning for breaking changes
3. **Better Testing**: Isolated SDK testing
4. **Documentation**: Centralized API documentation
5. **Security**: Controlled access to sensitive functionality
6. **Maintenance**: Easier to maintain and update

## Rollback Plan

If issues arise during migration:

1. Revert import statements to relative paths
2. Remove SDK dependency from package.json
3. Keep SDK repository for future use
4. Document lessons learned

## Support

For migration support:

1. Check the SDK documentation
2. Review example plugins
3. Test in development environment first
4. Report issues to the development team

## Next Steps

After successful migration:

1. Update plugin documentation
2. Test all plugin functionality
3. Update CI/CD pipelines
4. Consider using additional SDK utilities
5. Contribute improvements back to the SDK
