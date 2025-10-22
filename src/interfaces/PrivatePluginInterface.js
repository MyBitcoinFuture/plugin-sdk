/**
 * Base Plugin Interface for Private Plugins
 * 
 * Extends the core dashboard PluginInterface with private plugin capabilities
 * including license validation, payment integration, and premium features.
 */

const PluginInterface = require('./PluginInterface');

class PrivatePluginInterface extends PluginInterface {
  constructor() {
    super();
    
    // Private plugin specific properties
    this.author = 'MyBitcoinFuture';
    this.license = 'PROPRIETARY';
    this.price = 0; // Monthly price in USD
    this.tier = 'basic'; // basic, professional, enterprise
    this.dependencies = [];
    this.events = [];
    this.hooks = [];
    this.licenseStatus = 'unlicensed';
    this.paymentStatus = 'unpaid';
  }

  /**
   * Initialize the private plugin with license validation
   * @param {Object} context - Plugin context with license info
   * @returns {Promise<boolean>} Success status
   */
  async initialize(context) {
    try {
      // Validate license before initialization
      const licenseValid = await this.validateLicense(context.licenseKey);
      if (!licenseValid && this.price > 0) {
        throw new Error(`Invalid license for ${this.name}`);
      }

      this.context = context;
      this.licenseStatus = licenseValid ? 'licensed' : 'unlicensed';
      
      // Call parent dashboard initialization
      const dashboardInit = await super.initialize(context);
      if (!dashboardInit) {
        throw new Error('Dashboard initialization failed');
      }
      
      // Call plugin-specific initialization
      await this.initializePlugin(context);
      
      return true;
    } catch (error) {
      console.error(`Failed to initialize ${this.name}:`, error);
      return false;
    }
  }

  /**
   * Start the plugin
   * @returns {Promise<boolean>} Success status
   */
  async start() {
    try {
      if (this.price > 0 && this.licenseStatus !== 'licensed') {
        throw new Error(`License required for ${this.name}`);
      }

      // Call parent dashboard start
      const dashboardStart = await super.start();
      if (!dashboardStart) {
        throw new Error('Dashboard start failed');
      }

      await this.startPlugin();
      return true;
    } catch (error) {
      console.error(`Failed to start ${this.name}:`, error);
      return false;
    }
  }

  /**
   * Stop the plugin
   * @returns {Promise<boolean>} Success status
   */
  async stop() {
    try {
      await this.stopPlugin();
      
      // Call parent dashboard stop
      return await super.stop();
    } catch (error) {
      console.error(`Failed to stop ${this.name}:`, error);
      return false;
    }
  }

  /**
   * Validate plugin license
   * @param {string} licenseKey - License key to validate
   * @returns {Promise<boolean>} License validity
   */
  async validateLicense(licenseKey) {
    // Allow development mode
    if (process.env.NODE_ENV === 'development' || process.env.PLUGIN_DEV_MODE === 'true') {
      console.log(`Development mode: Skipping license validation for ${this.name}`);
      return true;
    }

    if (!licenseKey && this.price === 0) {
      return true; // Free plugins don't need license
    }

    if (!licenseKey) {
      return false;
    }

    try {
      // Check local license cache first
      const cachedLicense = await this.checkLocalLicenseCache(licenseKey);
      if (cachedLicense && cachedLicense.validUntil > Date.now()) {
        return cachedLicense.valid;
      }

      // Validate with license server
      const validation = await this.validateWithLicenseServer(licenseKey);
      
      // Cache the result
      await this.cacheLicenseValidation(licenseKey, validation);
      
      return validation.valid;
    } catch (error) {
      console.error('License validation failed:', error);
      return false;
    }
  }

  /**
   * Check local license cache
   * @param {string} licenseKey - License key to check
   * @returns {Promise<Object|null>} Cached license info
   */
  async checkLocalLicenseCache(licenseKey) {
    try {
      // Implementation would check local cache
      return null; // No cache for now
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate license with server
   * @param {string} licenseKey - License key to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateWithLicenseServer(licenseKey) {
    try {
      // Implementation would validate with license server
      return { valid: true, validUntil: Date.now() + 86400000 }; // 24 hours
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Cache license validation result
   * @param {string} licenseKey - License key
   * @param {Object} validation - Validation result
   */
  async cacheLicenseValidation(licenseKey, validation) {
    try {
      // Implementation would cache validation result
    } catch (error) {
      console.error('Failed to cache license validation:', error);
    }
  }

  /**
   * Plugin-specific initialization (override in subclasses)
   * @param {Object} context - Plugin context
   */
  async initializePlugin(context) {
    // Override in subclasses
  }

  /**
   * Plugin-specific start (override in subclasses)
   */
  async startPlugin() {
    // Override in subclasses
  }

  /**
   * Plugin-specific stop (override in subclasses)
   */
  async stopPlugin() {
    // Override in subclasses
  }

  /**
   * Get plugin health status with private plugin info
   */
  health_status() {
    const baseStatus = super.health_status();
    return {
      ...baseStatus,
      licenseStatus: this.licenseStatus,
      paymentStatus: this.paymentStatus,
      price: this.price,
      tier: this.tier
    };
  }

  /**
   * Get plugin info with private plugin details
   */
  getInfo() {
    const baseInfo = super.getInfo();
    return {
      ...baseInfo,
      author: this.author,
      license: this.license,
      price: this.price,
      tier: this.tier,
      licenseStatus: this.licenseStatus,
      paymentStatus: this.paymentStatus
    };
  }
}

module.exports = PrivatePluginInterface;
