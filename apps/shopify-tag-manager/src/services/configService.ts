import { AppConfig, CustomerSegmentRule } from '../types/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class ConfigService {
  private configPath: string;
  private config: AppConfig;

  constructor(configPath: string = './config.json') {
    this.configPath = configPath;
    this.config = this.getDefaultConfig();
  }

  // Load configuration from file
  async loadConfig(): Promise<AppConfig> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      this.config = { ...this.getDefaultConfig(), ...JSON.parse(configData) };
      return this.config;
    } catch (error) {
      console.warn('Could not load config file, using default configuration');
      return this.config;
    }
  }

  // Save configuration to file
  async saveConfig(): Promise<void> {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  }

  // Get current configuration
  getConfig(): AppConfig {
    return this.config;
  }

  // Update configuration
  async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.saveConfig();
  }

  // Get segment rules
  getSegmentRules(): Record<string, CustomerSegmentRule> {
    return this.config.tagManagement.customerSegmentRules;
  }

  // Update segment rules
  async updateSegmentRules(rules: Record<string, CustomerSegmentRule>): Promise<void> {
    this.config.tagManagement.customerSegmentRules = rules;
    await this.saveConfig();
  }

  // Add or update a single segment rule
  async updateSegmentRule(ruleName: string, rule: CustomerSegmentRule): Promise<void> {
    this.config.tagManagement.customerSegmentRules[ruleName] = rule;
    await this.saveConfig();
  }

  // Remove a segment rule
  async removeSegmentRule(ruleName: string): Promise<void> {
    delete this.config.tagManagement.customerSegmentRules[ruleName];
    await this.saveConfig();
  }

  // Get enabled segment rules
  getEnabledSegmentRules(): CustomerSegmentRule[] {
    return Object.values(this.config.tagManagement.customerSegmentRules)
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  // Validate segment rules
  validateSegmentRules(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = this.config.tagManagement.customerSegmentRules;

    for (const [ruleName, rule] of Object.entries(rules)) {
      if (!rule.name || rule.name.trim().length === 0) {
        errors.push(`Rule "${ruleName}": Name is required`);
      }

      if (!rule.conditions || rule.conditions.length === 0) {
        errors.push(`Rule "${ruleName}": At least one condition is required`);
      }

      if (!rule.tags || rule.tags.length === 0) {
        errors.push(`Rule "${ruleName}": At least one tag to add is required`);
      }

      if (rule.conditions) {
        rule.conditions.forEach((condition, index) => {
          if (!condition.field) {
            errors.push(`Rule "${ruleName}" Condition ${index + 1}: Field is required`);
          }
          if (!condition.operator) {
            errors.push(`Rule "${ruleName}" Condition ${index + 1}: Operator is required`);
          }
          if (condition.value === undefined || condition.value === null) {
            errors.push(`Rule "${ruleName}" Condition ${index + 1}: Value is required`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Load configuration from environment variables
  loadFromEnvironment(): void {
    this.config.shopify.shopDomain = process.env.SHOPIFY_SHOP_DOMAIN || this.config.shopify.shopDomain;
    this.config.shopify.apiKey = process.env.SHOPIFY_API_KEY || this.config.shopify.apiKey;
    this.config.shopify.apiSecret = process.env.SHOPIFY_API_SECRET || this.config.shopify.apiSecret;
    this.config.shopify.accessToken = process.env.SHOPIFY_ACCESS_TOKEN || this.config.shopify.accessToken;

    this.config.app.port = parseInt(process.env.PORT || '3002');
    this.config.app.nodeEnv = process.env.NODE_ENV || 'development';
    this.config.app.logLevel = process.env.LOG_LEVEL || 'info';

    this.config.tagManagement.autoTagEnabled = process.env.AUTO_TAG_ENABLED === 'true';
    this.config.tagManagement.tagSyncInterval = parseInt(process.env.TAG_SYNC_INTERVAL || '3600000');

    // Load segment rules from environment
    if (process.env.CUSTOMER_SEGMENT_RULES) {
      try {
        const envRules = JSON.parse(process.env.CUSTOMER_SEGMENT_RULES);
        this.config.tagManagement.customerSegmentRules = {
          ...this.config.tagManagement.customerSegmentRules,
          ...envRules
        };
      } catch (error) {
        console.warn('Failed to parse CUSTOMER_SEGMENT_RULES from environment:', error);
      }
    }
  }

  // Get default configuration
  private getDefaultConfig(): AppConfig {
    return {
      shopify: {
        shopDomain: '',
        apiKey: '',
        apiSecret: '',
        accessToken: ''
      },
      app: {
        port: 3002,
        nodeEnv: 'development',
        logLevel: 'info'
      },
      tagManagement: {
        autoTagEnabled: true,
        tagSyncInterval: 3600000, // 1 hour in milliseconds
        customerSegmentRules: {
          vip_customers: {
            name: 'VIP Customers',
            conditions: [
              {
                field: 'total_spent',
                operator: 'greater_than',
                value: 1000
              }
            ],
            tags: ['VIP', 'High-Value'],
            remove_tags: ['New-Customer'],
            enabled: true,
            priority: 100
          },
          new_customers: {
            name: 'New Customers',
            conditions: [
              {
                field: 'orders_count',
                operator: 'less_than_or_equal',
                value: 1
              }
            ],
            tags: ['New-Customer'],
            remove_tags: ['VIP', 'High-Value'],
            enabled: true,
            priority: 50
          },
          inactive_customers: {
            name: 'Inactive Customers',
            conditions: [
              {
                field: 'last_order_date',
                operator: 'older_than_days',
                value: 90
              }
            ],
            tags: ['Inactive'],
            remove_tags: ['Active', 'VIP'],
            enabled: true,
            priority: 25
          },
          active_customers: {
            name: 'Active Customers',
            conditions: [
              {
                field: 'last_order_date',
                operator: 'newer_than_days',
                value: 30
              },
              {
                field: 'orders_count',
                operator: 'greater_than',
                value: 1
              }
            ],
            tags: ['Active'],
            remove_tags: ['Inactive'],
            enabled: true,
            priority: 75
          }
        }
      }
    };
  }

  // Check if configuration is valid
  isConfigValid(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.shopify.shopDomain) {
      errors.push('Shopify shop domain is required');
    }

    if (!this.config.shopify.accessToken) {
      errors.push('Shopify access token is required');
    }

    if (!this.config.shopify.apiKey) {
      errors.push('Shopify API key is required');
    }

    if (!this.config.shopify.apiSecret) {
      errors.push('Shopify API secret is required');
    }

    const segmentValidation = this.validateSegmentRules();
    errors.push(...segmentValidation.errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get configuration summary
  getConfigSummary(): {
    shopDomain: string;
    autoTagEnabled: boolean;
    segmentRulesCount: number;
    enabledRulesCount: number;
    syncInterval: string;
  } {
    const enabledRules = this.getEnabledSegmentRules();
    
    return {
      shopDomain: this.config.shopify.shopDomain,
      autoTagEnabled: this.config.tagManagement.autoTagEnabled,
      segmentRulesCount: Object.keys(this.config.tagManagement.customerSegmentRules).length,
      enabledRulesCount: enabledRules.length,
      syncInterval: `${this.config.tagManagement.tagSyncInterval / 1000 / 60} minutes`
    };
  }
} 