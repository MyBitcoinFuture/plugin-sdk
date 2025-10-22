# MyBitcoinFuture Plugin SDK

Shared interfaces and utilities for MyBitcoinFuture plugin development.

## Installation

```bash
npm install @mybitcoinfuture/plugin-sdk
```

## Usage

### Basic Plugin Interface

```javascript
const { PluginInterface } = require('@mybitcoinfuture/plugin-sdk');

class MyPlugin extends PluginInterface {
  constructor() {
    super();
    this.name = 'my-plugin';
    this.version = '1.0.0';
    this.description = 'My awesome plugin';
  }

  async initializePlugin(context) {
    // Plugin-specific initialization
  }

  async startPlugin() {
    // Plugin-specific start logic
  }

  async stopPlugin() {
    // Plugin-specific stop logic
  }
}

module.exports = MyPlugin;
```

### Private Plugin Interface

```javascript
const { PrivatePluginInterface } = require('@mybitcoinfuture/plugin-sdk');

class MyPrivatePlugin extends PrivatePluginInterface {
  constructor() {
    super();
    this.name = 'my-private-plugin';
    this.version = '1.0.0';
    this.price = 49; // Monthly price in USD
    this.tier = 'professional';
  }

  async initializePlugin(context) {
    // Private plugin initialization
  }
}

module.exports = MyPrivatePlugin;
```

### Public Plugin Interface

```javascript
const { PublicPluginInterface } = require('@mybitcoinfuture/plugin-sdk');

class MyPublicPlugin extends PublicPluginInterface {
  constructor() {
    super();
    this.name = 'my-public-plugin';
    this.version = '1.0.0';
    this.author = 'Community Developer';
  }

  async initializePlugin(context) {
    // Public plugin initialization
  }
}

module.exports = MyPublicPlugin;
```

## Utilities

### API Response Helpers

```javascript
const { ApiResponse } = require('@mybitcoinfuture/plugin-sdk');

// Success response
ApiResponse.success(res, data, 'Operation completed');

// Error response
ApiResponse.error(res, 'Something went wrong', 500);
```

### Validation

```javascript
const { 
  validateBitcoinAddress, 
  validateXPUB, 
  validateEmail 
} = require('@mybitcoinfuture/plugin-sdk');

// Validate Bitcoin address
const addressResult = validateBitcoinAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');

// Validate XPUB
const xpubResult = validateXPUB('xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE3Nbx2MNA');

// Validate email
const emailResult = validateEmail('user@example.com');
```

### HTTP Client

```javascript
const { createHttpClient } = require('@mybitcoinfuture/plugin-sdk');

const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 5000
});

const response = await client.get('/data');
```

### Rate Limiting

```javascript
const { RateLimiter } = require('@mybitcoinfuture/plugin-sdk');

const limiter = new RateLimiter(100, 60000); // 100 requests per minute

if (limiter.isAllowed('user123')) {
  // Process request
} else {
  // Rate limited
}
```

### Caching

```javascript
const { SimpleCache } = require('@mybitcoinfuture/plugin-sdk');

const cache = new SimpleCache(300000); // 5 minutes TTL

cache.set('key', 'value');
const value = cache.get('key');
```

## Security Features

- Bitcoin address validation
- XPUB validation
- Input sanitization
- Rate limiting
- Secure token generation
- Hash utilities

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## License

MIT
