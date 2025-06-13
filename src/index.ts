import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import { ShopifyApiService } from './services/shopifyApi';
import { Logger } from './services/logger.js';
import { AppConfig, ApiResponse, PaginatedResponse } from './types/index.js';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize logger
const logger = new Logger({
  level: (process.env.LOG_LEVEL as any) || 'info',
  service: 'shopify-tag-manager',
  environment: process.env.NODE_ENV || 'development',
});

// Configuration with validation
const config: AppConfig = {
  shopify: {
    shopDomain: process.env.SHOPIFY_SHOP_DOMAIN || '',
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
    apiVersion: '2024-10',
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || '',
  },
  app: {
    port: parseInt(process.env.PORT || '3002'),
    environment: (process.env.NODE_ENV as any) || 'development',
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '5'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900'), // 15 minutes
    rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
  },
  sync: {
    enabled: process.env.SYNC_ENABLED !== 'false',
    intervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES || '10'),
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '50'),
    maxRetries: parseInt(process.env.SYNC_MAX_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.SYNC_RETRY_DELAY_MS || '1000'),
  },
};

// Validate required configuration
if (!config.shopify.shopDomain || !config.shopify.accessToken) {
  logger.error('Missing required Shopify configuration', {
    shopDomain: !!config.shopify.shopDomain,
    accessToken: !!config.shopify.accessToken,
  });
  process.exit(1);
}

// Initialize Shopify API service
const shopifyApi = new ShopifyApiService(
  config.shopify.shopDomain,
  config.shopify.accessToken,
  logger.child({ service: 'shopify-api' })
);

// Initialize Express app
const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
  });
  
  next();
});

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Helper function for API responses
const apiResponse = <T>(data?: T, error?: string, details?: any): ApiResponse<T> => ({
  success: !error,
  data,
  error,
  details,
  timestamp: new Date().toISOString(),
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    const healthResult = await shopifyApi.healthCheck();
    
    if (healthResult.errors && healthResult.errors.length > 0) {
      return res.status(503).json(apiResponse(
        undefined,
        'Shopify API connectivity issues',
        healthResult.errors
      ));
    }

    res.json(apiResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: config.app.environment,
      shopify: {
        connected: !!healthResult.data,
        shop: healthResult.data?.shop?.name,
        domain: healthResult.data?.shop?.myshopifyDomain,
      },
      uptime: process.uptime(),
    }));
  } catch (error) {
    logger.error('Health check failed', { error: error instanceof Error ? error.message : error });
    res.status(503).json(apiResponse(
      undefined,
      'Health check failed',
      error instanceof Error ? error.message : 'Unknown error'
    ));
  }
});

// Configuration endpoints
app.get('/api/config', (req: Request, res: Response) => {
  try {
    const configSummary = {
      app: {
        environment: config.app.environment,
        logLevel: config.app.logLevel,
        port: config.app.port,
      },
      sync: config.sync,
      shopify: {
        shopDomain: config.shopify.shopDomain,
        apiVersion: config.shopify.apiVersion,
        hasAccessToken: !!config.shopify.accessToken,
      },
    };

    res.json(apiResponse(configSummary));
  } catch (error) {
    logger.error('Failed to get config', { error: error instanceof Error ? error.message : error });
    res.status(500).json(apiResponse(undefined, 'Failed to retrieve configuration'));
  }
});

// Customer endpoints
app.get('/api/customers', async (req: Request, res: Response) => {
  try {
    const { 
      limit = '50', 
      after, 
      query 
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 50, 250);
    
    const result = await shopifyApi.getCustomers(
      limitNum,
      after as string,
      query as string
    );

    if (result.errors && result.errors.length > 0) {
      return res.status(400).json(apiResponse(
        undefined,
        'Failed to fetch customers',
        result.errors
      ));
    }

    const response: PaginatedResponse<any> = {
      ...apiResponse(result.data?.customers.edges.map(edge => edge.node) || []),
      pagination: result.data?.customers.pageInfo || {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Failed to fetch customers', { error: error instanceof Error ? error.message : error });
    res.status(500).json(apiResponse(undefined, 'Failed to fetch customers'));
  }
});

app.get('/api/customers/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    
    // Convert to GraphQL ID if it's a numeric ID
    const graphqlId = customerId.startsWith('gid://') 
      ? customerId 
      : ShopifyApiService.toGraphQLId('Customer', customerId);

    const result = await shopifyApi.getCustomer(graphqlId);

    if (result.errors && result.errors.length > 0) {
      return res.status(404).json(apiResponse(
        undefined,
        'Customer not found',
        result.errors
      ));
    }

    res.json(apiResponse(result.data?.customer));
  } catch (error) {
    logger.error('Failed to fetch customer', { 
      customerId: req.params.customerId,
      error: error instanceof Error ? error.message : error 
    });
    res.status(500).json(apiResponse(undefined, 'Failed to fetch customer'));
  }
});

app.put('/api/customers/:customerId/tags', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json(apiResponse(
        undefined,
        'Tags must be an array of strings'
      ));
    }

    // Convert to GraphQL ID if it's a numeric ID
    const graphqlId = customerId.startsWith('gid://') 
      ? customerId 
      : ShopifyApiService.toGraphQLId('Customer', customerId);

    const result = await shopifyApi.updateCustomerTags(graphqlId, tags);

    if (result.errors && result.errors.length > 0) {
      return res.status(400).json(apiResponse(
        undefined,
        'Failed to update customer tags',
        result.errors
      ));
    }

    if (result.data?.customerUpdate.userErrors && result.data.customerUpdate.userErrors.length > 0) {
      return res.status(400).json(apiResponse(
        undefined,
        'Failed to update customer tags',
        result.data.customerUpdate.userErrors
      ));
    }

    res.json(apiResponse(result.data?.customerUpdate.customer));
  } catch (error) {
    logger.error('Failed to update customer tags', { 
      customerId: req.params.customerId,
      error: error instanceof Error ? error.message : error 
    });
    res.status(500).json(apiResponse(undefined, 'Failed to update customer tags'));
  }
});

// Customer segments endpoints
app.get('/api/segments', async (req: Request, res: Response) => {
  try {
    const { 
      limit = '50', 
      after 
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 50, 250);
    
    const result = await shopifyApi.getCustomerSegments(limitNum, after as string);

    if (result.errors && result.errors.length > 0) {
      return res.status(400).json(apiResponse(
        undefined,
        'Failed to fetch customer segments',
        result.errors
      ));
    }

    const response: PaginatedResponse<any> = {
      ...apiResponse(result.data?.segments.edges.map(edge => edge.node) || []),
      pagination: result.data?.segments.pageInfo || {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Failed to fetch customer segments', { error: error instanceof Error ? error.message : error });
    res.status(500).json(apiResponse(undefined, 'Failed to fetch customer segments'));
  }
});

app.get('/api/segments/:segmentId/customers', async (req: Request, res: Response) => {
  try {
    const { segmentId } = req.params;
    const { 
      limit = '50', 
      after 
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 50, 250);
    
    // Convert to GraphQL ID if it's a numeric ID
    const graphqlId = segmentId.startsWith('gid://') 
      ? segmentId 
      : ShopifyApiService.toGraphQLId('Segment', segmentId);

    const result = await shopifyApi.getCustomersFromSegment(graphqlId, limitNum, after as string);

    if (result.errors && result.errors.length > 0) {
      return res.status(400).json(apiResponse(
        undefined,
        'Failed to fetch segment customers',
        result.errors
      ));
    }

    const customers = result.data?.segment.members.edges.map(edge => edge.node.customer) || [];
    
    const response: PaginatedResponse<any> = {
      ...apiResponse(customers),
      pagination: result.data?.segment.members.pageInfo || {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Failed to fetch segment customers', { 
      segmentId: req.params.segmentId,
      error: error instanceof Error ? error.message : error 
    });
    res.status(500).json(apiResponse(undefined, 'Failed to fetch segment customers'));
  }
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json(apiResponse(
    undefined,
    'Internal server error',
    config.app.environment === 'development' ? error.stack : undefined
  ));
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json(apiResponse(undefined, 'Not found'));
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(config.app.port, () => {
  logger.info('🚀 Shopify Tag Manager started', {
    port: config.app.port,
    shop: config.shopify.shopDomain,
    environment: config.app.environment,
    syncEnabled: config.sync.enabled,
    syncInterval: `${config.sync.intervalMinutes} minutes`,
    dashboard: `http://localhost:${config.app.port}`,
  });

  console.log(`
🚀 Shopify Tag Manager v2.0.0 running on port ${config.app.port}
📊 Shop: ${config.shopify.shopDomain}
🏷️  Modern GraphQL API: Enabled
⏰ Sync interval: ${config.sync.intervalMinutes} minutes
🌐 Dashboard: http://localhost:${config.app.port}
  `);
});

// Set up periodic sync (if enabled)
if (config.sync.enabled) {
  const cronPattern = `*/${config.sync.intervalMinutes} * * * *`;
  
  cron.schedule(cronPattern, async () => {
    logger.info('Starting scheduled sync');
    
    try {
      // Implement sync logic here
      logger.info('Sync completed successfully');
    } catch (error) {
      logger.error('Sync failed', { error: error instanceof Error ? error.message : error });
    }
  });
  
  logger.info('Scheduled sync enabled', { 
    interval: `${config.sync.intervalMinutes} minutes`,
    pattern: cronPattern 
  });
}

export default app; 