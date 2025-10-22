#!/usr/bin/env node

/**
 * Plugin Migration Script
 * 
 * This script helps migrate plugins from relative path imports
 * to the new @mybitcoinfuture/plugin-sdk package
 */

const fs = require('fs');
const path = require('path');

class PluginMigrator {
  constructor(pluginPath) {
    this.pluginPath = pluginPath;
    this.changes = [];
  }

  /**
   * Migrate a plugin to use the SDK
   */
  async migrate() {
    console.log(`Migrating plugin at: ${this.pluginPath}`);
    
    // Update package.json
    await this.updatePackageJson();
    
    // Update main plugin file
    await this.updatePluginFile();
    
    // Update test files
    await this.updateTestFiles();
    
    // Report changes
    this.reportChanges();
  }

  /**
   * Update package.json to include SDK dependency
   */
  async updatePackageJson() {
    const packagePath = path.join(this.pluginPath, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      console.log('No package.json found, creating one...');
      const packageJson = {
        name: path.basename(this.pluginPath),
        version: '1.0.0',
        dependencies: {
          '@mybitcoinfuture/plugin-sdk': '^1.0.0'
        }
      };
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      this.changes.push('Created package.json with SDK dependency');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    if (!packageJson.dependencies['@mybitcoinfuture/plugin-sdk']) {
      packageJson.dependencies['@mybitcoinfuture/plugin-sdk'] = '^1.0.0';
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      this.changes.push('Added SDK dependency to package.json');
    }
  }

  /**
   * Update main plugin file
   */
  async updatePluginFile() {
    const srcPath = path.join(this.pluginPath, 'src');
    if (!fs.existsSync(srcPath)) {
      console.log('No src directory found');
      return;
    }

    const indexFile = path.join(srcPath, 'index.js');
    if (!fs.existsSync(indexFile)) {
      console.log('No index.js found in src directory');
      return;
    }

    let content = fs.readFileSync(indexFile, 'utf8');
    let modified = false;

    // Replace relative path imports
    const replacements = [
      {
        from: /const\s+PrivatePluginInterface\s*=\s*require\(['"][^'"]*PluginInterface['"]\);?/g,
        to: 'const { PrivatePluginInterface } = require(\'@mybitcoinfuture/plugin-sdk\');'
      },
      {
        from: /const\s+PluginInterface\s*=\s*require\(['"][^'"]*PluginInterface['"]\);?/g,
        to: 'const { PluginInterface } = require(\'@mybitcoinfuture/plugin-sdk\');'
      },
      {
        from: /const\s+\{\s*ApiResponse[^}]*\}\s*=\s*require\(['"][^'"]*utils['"]\);?/g,
        to: 'const { ApiResponse, PluginError, asyncErrorHandler } = require(\'@mybitcoinfuture/plugin-sdk\');'
      }
    ];

    for (const replacement of replacements) {
      if (replacement.from.test(content)) {
        content = content.replace(replacement.from, replacement.to);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(indexFile, content);
      this.changes.push('Updated imports in src/index.js');
    }
  }

  /**
   * Update test files
   */
  async updateTestFiles() {
    const testPath = path.join(this.pluginPath, 'tests');
    if (!fs.existsSync(testPath)) {
      console.log('No tests directory found');
      return;
    }

    const testFiles = fs.readdirSync(testPath).filter(file => file.endsWith('.test.js'));
    
    for (const testFile of testFiles) {
      const filePath = path.join(testPath, testFile);
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Replace relative path imports in tests
      const replacements = [
        {
          from: /const\s+\{\s*PluginError[^}]*\}\s*=\s*require\(['"][^'"]*utils['"]\);?/g,
          to: 'const { PluginError } = require(\'@mybitcoinfuture/plugin-sdk\');'
        }
      ];

      for (const replacement of replacements) {
        if (replacement.from.test(content)) {
          content = content.replace(replacement.from, replacement.to);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        this.changes.push(`Updated imports in tests/${testFile}`);
      }
    }
  }

  /**
   * Report changes made
   */
  reportChanges() {
    console.log('\n=== Migration Report ===');
    
    if (this.changes.length === 0) {
      console.log('No changes needed - plugin already uses SDK');
    } else {
      console.log('Changes made:');
      this.changes.forEach(change => {
        console.log(`  ✓ ${change}`);
      });
    }
    
    console.log('\nNext steps:');
    console.log('1. Run npm install to install SDK dependency');
    console.log('2. Test the plugin to ensure it works correctly');
    console.log('3. Update any remaining relative path imports manually');
    console.log('4. Commit the changes');
  }
}

// CLI usage
if (require.main === module) {
  const pluginPath = process.argv[2];
  
  if (!pluginPath) {
    console.log('Usage: node migrate-plugin.js <plugin-path>');
    console.log('Example: node migrate-plugin.js ../plugins/my-plugin');
    process.exit(1);
  }

  if (!fs.existsSync(pluginPath)) {
    console.error(`Plugin path does not exist: ${pluginPath}`);
    process.exit(1);
  }

  const migrator = new PluginMigrator(pluginPath);
  migrator.migrate().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = PluginMigrator;
