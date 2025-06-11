import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { ShopifyApiService } from './services/shopifyApi.js';
import { CustomerSegmentService } from './services/customerSegmentService.js';
import { ConfigService } from './services/configService.js';
import { ApiResponse, TagSyncResult, CustomerSegmentRule } from './types/index.js';

// Load environment variables
dotenv.config();

// Initialize services
const configService = new ConfigService();
configService.loadFromEnvironment();

const config = configService.getConfig();
const shopifyApi = new ShopifyApiService(config.shopify.shopDomain, config.shopify.accessToken);
const segmentService = new CustomerSegmentService(shopifyApi);

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    config: configService.getConfigSummary()
  });
});

// Configuration endpoints
app.get('/api/config', (req, res) => {
  try {
    const configSummary = configService.getConfigSummary();
    res.json({
      success: true,
      data: configSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/config', async (req, res) => {
  try {
    const updates = req.body;
    await configService.updateConfig(updates);
    res.json({
      success: true,
      data: configService.getConfigSummary()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Segment rules endpoints
app.get('/api/segment-rules', (req, res) => {
  try {
    const rules = configService.getSegmentRules();
    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/segment-rules', async (req, res) => {
  try {
    const { ruleName, rule } = req.body;
    
    if (!ruleName || !rule) {
      return res.status(400).json({
        success: false,
        error: 'Rule name and rule data are required'
      });
    }

    const validation = segmentService.validateSegmentRule(rule);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid segment rule',
        details: validation.errors
      });
    }

    await configService.updateSegmentRule(ruleName, rule);
    res.json({
      success: true,
      data: { ruleName, rule }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/segment-rules/:ruleName', async (req, res) => {
  try {
    const { ruleName } = req.params;
    await configService.removeSegmentRule(ruleName);
    res.json({
      success: true,
      message: `Rule "${ruleName}" deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Customer management endpoints
app.get('/api/customers', async (req, res) => {
  try {
    const { limit = 50, page = 1, tag } = req.query;
    
    let response;
    if (tag) {
      response = await shopifyApi.getCustomersByTag(String(tag), Number(limit));
    } else {
      response = await shopifyApi.getCustomers(Number(limit), Number(page));
    }

    res.json({
      success: true,
      data: response.customers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: response.customers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const response = await shopifyApi.getCustomer(Number(customerId));
    
    res.json({
      success: true,
      data: response.customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/customers/:customerId/tags', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { tags } = req.body;

    if (!tags) {
      return res.status(400).json({
        success: false,
        error: 'Tags are required'
      });
    }

    const response = await shopifyApi.updateCustomerTags(Number(customerId), tags);
    
    res.json({
      success: true,
      data: response.customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Tag management endpoints
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await shopifyApi.getAllCustomerTags();
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Segment processing endpoints
app.post('/api/segments/process', async (req, res) => {
  try {
    const { ruleName, customerId } = req.body;
    
    if (customerId) {
      // Process single customer
      const customerResponse = await shopifyApi.getCustomer(Number(customerId));
      const customer = customerResponse.customer;
      
      let rules: CustomerSegmentRule[];
      if (ruleName) {
        const allRules = configService.getSegmentRules();
        const rule = allRules[ruleName];
        if (!rule) {
          return res.status(404).json({
            success: false,
            error: `Rule "${ruleName}" not found`
          });
        }
        rules = [rule];
      } else {
        rules = configService.getEnabledSegmentRules();
      }

      const operations = await segmentService.generateTagOperations(customer, rules);
      const result = await segmentService.applyTagOperations(customer, operations);
      
      res.json({
        success: true,
        data: result
      });
    } else {
      // Process all customers
      const rules = ruleName ? [configService.getSegmentRules()[ruleName]] : configService.getEnabledSegmentRules();
      
      if (ruleName && !rules[0]) {
        return res.status(404).json({
          success: false,
          error: `Rule "${ruleName}" not found`
        });
      }

      const results = await segmentService.processAllCustomers(rules);
      
      res.json({
        success: true,
        data: {
          processed: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/segments/:ruleName/customers', async (req, res) => {
  try {
    const { ruleName } = req.params;
    const { limit = 50 } = req.query;
    
    const rules = configService.getSegmentRules();
    const rule = rules[ruleName];
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: `Rule "${ruleName}" not found`
      });
    }

    const customers = await segmentService.getCustomersForSegment(rule, Number(limit));
    
    res.json({
      success: true,
      data: customers,
      pagination: {
        limit: Number(limit),
        total: customers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook endpoints
app.post('/webhooks/customers/update', async (req, res) => {
  try {
    const customer = req.body;
    console.log('Received customer update webhook:', customer.id);

    if (config.tagManagement.autoTagEnabled) {
      const rules = configService.getEnabledSegmentRules();
      const operations = await segmentService.generateTagOperations(customer, rules);
      
      if (operations.length > 0) {
        const result = await segmentService.applyTagOperations(customer, operations);
        console.log('Auto-tagged customer:', customer.id, result);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing customer webhook:', error);
    res.status(500).json({ success: false });
  }
});

app.post('/webhooks/orders/create', async (req, res) => {
  try {
    const order = req.body;
    console.log('Received order creation webhook:', order.id);

    // When an order is created, we might want to re-evaluate the customer's tags
    if (config.tagManagement.autoTagEnabled && order.customer) {
      const customerResponse = await shopifyApi.getCustomer(order.customer.id);
      const customer = customerResponse.customer;
      
      const rules = configService.getEnabledSegmentRules();
      const operations = await segmentService.generateTagOperations(customer, rules);
      
      if (operations.length > 0) {
        const result = await segmentService.applyTagOperations(customer, operations);
        console.log('Auto-tagged customer after order:', customer.id, result);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing order webhook:', error);
    res.status(500).json({ success: false });
  }
});

// Scheduled tag sync
if (config.tagManagement.autoTagEnabled) {
  const syncIntervalMinutes = config.tagManagement.tagSyncInterval / 1000 / 60;
  
  cron.schedule(`*/${syncIntervalMinutes} * * * *`, async () => {
    try {
      console.log('Starting scheduled tag sync...');
      const rules = configService.getEnabledSegmentRules();
      const results = await segmentService.processAllCustomers(rules);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`Tag sync completed: ${successful} successful, ${failed} failed`);
    } catch (error) {
      console.error('Error during scheduled tag sync:', error);
    }
  });
  
  console.log(`Scheduled tag sync enabled (every ${syncIntervalMinutes} minutes)`);
}

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = config.app.port;

if (config.app.nodeEnv === 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Shopify Tag Manager running on port ${PORT}`);
    console.log(`📊 Shop: ${config.shopify.shopDomain}`);
    console.log(`🏷️  Auto-tagging: ${config.tagManagement.autoTagEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`⏰ Sync interval: ${config.tagManagement.tagSyncInterval / 1000 / 60} minutes`);
  });
}

export default app; 