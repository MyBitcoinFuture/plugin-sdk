/**
 * Example Plugin using MyBitcoinFuture Plugin SDK
 * 
 * This demonstrates how to create a plugin using the SDK
 */

const { PrivatePluginInterface } = require('@mybitcoinfuture/plugin-sdk');

class ExamplePlugin extends PrivatePluginInterface {
  constructor() {
    super();
    
    // Plugin metadata
    this.name = 'example-plugin';
    this.displayName = 'Example Plugin';
    this.version = '1.0.0';
    this.description = 'An example plugin demonstrating SDK usage';
    this.price = 49; // Monthly price in USD
    this.tier = 'professional';
    
    // Plugin state
    this.isRunning = false;
    this.data = [];
  }

  /**
   * Plugin-specific initialization
   */
  async initializePlugin(context) {
    console.log('Initializing Example Plugin...');
    
    // Validate configuration
    const config = context.config || {};
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://api.example.com';
    
    console.log('Example Plugin initialized successfully');
  }

  /**
   * Plugin-specific start logic
   */
  async startPlugin() {
    console.log('Starting Example Plugin...');
    
    // Start background tasks
    this.startBackgroundTask();
    
    this.isRunning = true;
    console.log('Example Plugin started');
  }

  /**
   * Plugin-specific stop logic
   */
  async stopPlugin() {
    console.log('Stopping Example Plugin...');
    
    // Stop background tasks
    this.stopBackgroundTask();
    
    this.isRunning = false;
    console.log('Example Plugin stopped');
  }

  /**
   * Start background task
   */
  startBackgroundTask() {
    this.taskInterval = setInterval(() => {
      this.processData();
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop background task
   */
  stopBackgroundTask() {
    if (this.taskInterval) {
      clearInterval(this.taskInterval);
      this.taskInterval = null;
    }
  }

  /**
   * Process data
   */
  async processData() {
    try {
      console.log('Processing data...');
      
      // Simulate data processing
      const newData = {
        timestamp: new Date().toISOString(),
        value: Math.random() * 100
      };
      
      this.data.push(newData);
      
      // Keep only last 100 items
      if (this.data.length > 100) {
        this.data = this.data.slice(-100);
      }
      
      console.log(`Processed data: ${newData.value}`);
    } catch (error) {
      console.error('Error processing data:', error);
    }
  }

  /**
   * Get plugin data
   */
  getData() {
    return {
      isRunning: this.isRunning,
      dataCount: this.data.length,
      lastData: this.data[this.data.length - 1] || null
    };
  }

  /**
   * Execute custom command
   */
  async executeCommand(commandName, args = {}) {
    switch (commandName) {
      case 'getData':
        return { success: true, data: this.getData() };
      
      case 'clearData':
        this.data = [];
        return { success: true, message: 'Data cleared' };
      
      case 'getStatus':
        return { 
          success: true, 
          data: {
            isRunning: this.isRunning,
            uptime: this.getUptime(),
            dataCount: this.data.length
          }
        };
      
      default:
        return { success: false, error: `Unknown command: ${commandName}` };
    }
  }
}

module.exports = ExamplePlugin;
