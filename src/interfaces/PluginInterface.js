/**
 * Base Plugin Interface for Dashboard Plugins
 *
 * Provides common functionality for all plugins loaded by the dashboard
 */
class PluginInterface {
  constructor() {
    this.name = '';
    this.version = '';
    this.description = '';
    this.isInitialized = false;
    this._isRunning = false;
    this.startTime = null;
    this.context = null;
    this.config = null;
  }

  /**
   * Initialize plugin
   */
  async initialize(context) {
    try {
      this.context = context;
      this.config = context.config || this.getDefaultConfig();

      // Initialize job queue access if available
      this.jobQueue = context.jobQueue || null;
      this.taskRunner = context.taskRunner || null;

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize plugin:', error);
      return false;
    }
  }

  /**
   * Start plugin
   */
  async start() {
    try {
      if (!this.isInitialized) {
        throw new Error('Plugin must be initialized before starting');
      }
      this._isRunning = true;
      this.startTime = Date.now();
      return true;
    } catch (error) {
      console.error('Failed to start plugin:', error);
      return false;
    }
  }

  /**
   * Stop plugin
   */
  async stop() {
    try {
      this._isRunning = false;
      this.startTime = null;
      return true;
    } catch (error) {
      console.error('Failed to stop plugin:', error);
      return false;
    }
  }

  /**
   * Execute command
   */
  async executeCommand(commandName, args = {}) {
    try {
      return { success: false, error: `Command ${commandName} not implemented` };
    } catch (error) {
      console.error(`Failed to execute command ${commandName}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if plugin is running
   */
  isRunning() {
    return this._isRunning || false;
  }

  /**
   * Get plugin uptime
   */
  getUptime() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  /**
   * Schedule a job using the job queue system
   */
  async scheduleJob(jobConfig) {
    try {
      if (!this.jobQueue) {
        console.warn('Job queue not available for plugin:', this.name);
        return false;
      }

      return await this.jobQueue.scheduleJob(jobConfig);
    } catch (error) {
      console.error('Failed to schedule job:', error);
      return false;
    }
  }

  /**
   * Get plugin health status
   */
  health_status() {
    return {
      name: this.name,
      version: this.version,
      status: this._isRunning ? 'running' : 'stopped',
      uptime: this.getUptime(),
      initialized: this.isInitialized,
      lastError: null
    };
  }

  /**
   * Get plugin info
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      status: this._isRunning ? 'running' : 'stopped',
      uptime: this.getUptime(),
      initialized: this.isInitialized
    };
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {};
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    return { valid: true, error: null };
  }

  /**
   * Setup event listeners
   */
  async setupEventListeners() {
    // Override in subclasses
  }

  /**
   * Setup job queue tasks
   */
  async setupJobQueueTasks() {
    // Override in subclasses
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      await this.stop();
      this.isInitialized = false;
      this.context = null;
      this.config = null;
      return true;
    } catch (error) {
      console.error('Failed to cleanup plugin:', error);
      return false;
    }
  }
}

module.exports = PluginInterface;
