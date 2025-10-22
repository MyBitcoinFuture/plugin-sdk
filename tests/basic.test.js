/**
 * Basic tests for Plugin SDK
 */

const { 
  PluginInterface, 
  PrivatePluginInterface, 
  PublicPluginInterface,
  validateBitcoinAddress,
  validateXPUB,
  validateEmail,
  ApiResponse,
  RateLimiter,
  SimpleCache
} = require('../src/index');

describe('Plugin SDK', () => {
  describe('PluginInterface', () => {
    test('should create plugin instance', () => {
      const plugin = new PluginInterface();
      expect(plugin.name).toBe('');
      expect(plugin.version).toBe('');
      expect(plugin.isInitialized).toBe(false);
    });

    test('should initialize plugin', async () => {
      const plugin = new PluginInterface();
      const result = await plugin.initialize({ config: {} });
      expect(result).toBe(true);
      expect(plugin.isInitialized).toBe(true);
    });
  });

  describe('PrivatePluginInterface', () => {
    test('should create private plugin instance', () => {
      const plugin = new PrivatePluginInterface();
      expect(plugin.author).toBe('MyBitcoinFuture');
      expect(plugin.license).toBe('PROPRIETARY');
      expect(plugin.price).toBe(0);
      expect(plugin.tier).toBe('basic');
    });
  });

  describe('PublicPluginInterface', () => {
    test('should create public plugin instance', () => {
      const plugin = new PublicPluginInterface();
      expect(plugin.license).toBe('MIT');
      expect(plugin.price).toBe(0);
      expect(plugin.tier).toBe('community');
      expect(plugin.communityFeatures).toBe(true);
    });
  });

  describe('Validation', () => {
    test('should validate Bitcoin address', () => {
      const validAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      const result = validateBitcoinAddress(validAddress);
      expect(result).toBe(true);
    });

    test('should validate XPUB', () => {
      const validXpub = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE3Nbx2MNA';
      const result = validateXPUB(validXpub);
      expect(result.valid).toBe(true);
    });

    test('should validate email', () => {
      const validEmail = 'test@example.com';
      const result = validateEmail(validEmail);
      expect(result).toBe(true);
    });
  });

  describe('RateLimiter', () => {
    test('should allow requests within limit', () => {
      const limiter = new RateLimiter(5, 60000);
      expect(limiter.isAllowed('test')).toBe(true);
    });

    test('should block requests over limit', () => {
      const limiter = new RateLimiter(1, 60000);
      expect(limiter.isAllowed('test')).toBe(true);
      expect(limiter.isAllowed('test')).toBe(false);
    });
  });

  describe('SimpleCache', () => {
    test('should store and retrieve values', () => {
      const cache = new SimpleCache();
      cache.set('key', 'value');
      expect(cache.get('key')).toBe('value');
    });

    test('should handle TTL expiration', (done) => {
      const cache = new SimpleCache(100); // 100ms TTL
      cache.set('key', 'value');
      
      setTimeout(() => {
        expect(cache.get('key')).toBeUndefined();
        done();
      }, 150);
    });
  });
});
