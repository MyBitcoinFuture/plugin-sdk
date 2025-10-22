/**
 * Base Plugin Interface for Public Plugins
 * 
 * Extends the core dashboard PluginInterface with public plugin capabilities
 * for community plugins with basic functionality access.
 */

const PluginInterface = require('./PluginInterface');

class PublicPluginInterface extends PluginInterface {
  constructor() {
    super();
    
    // Public plugin specific properties
    this.author = '';
    this.license = 'MIT';
    this.price = 0; // Free plugins
    this.tier = 'community';
    this.dependencies = [];
    this.events = [];
    this.hooks = [];
    this.communityFeatures = true;
    this.requiresApproval = false;
  }

  /**
   * Initialize the public plugin
   * @param {Object} context - Plugin context
   * @returns {Promise<boolean>} Success status
   */
  async initialize(context) {
    try {
      this.context = context;
      
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
   * Get plugin health status with public plugin info
   */
  health_status() {
    const baseStatus = super.health_status();
    return {
      ...baseStatus,
      communityFeatures: this.communityFeatures,
      requiresApproval: this.requiresApproval
    };
  }

  /**
   * Get plugin info with public plugin details
   */
  getInfo() {
    const baseInfo = super.getInfo();
    return {
      ...baseInfo,
      author: this.author,
      license: this.license,
      price: this.price,
      tier: this.tier,
      communityFeatures: this.communityFeatures,
      requiresApproval: this.requiresApproval
    };
  }
}

module.exports = PublicPluginInterface;
