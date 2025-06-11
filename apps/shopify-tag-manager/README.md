# Shopify Tag Manager

A Shopify Private App that automatically manages customer tags based on configurable segment rules. This app helps you segment your customer base for better marketing, customer service, and business insights.

## 🚀 Features

- **Automatic Tag Management**: Automatically add/remove tags based on customer behavior
- **Flexible Segment Rules**: Create custom rules with multiple conditions
- **Real-time Processing**: Webhook integration for instant tag updates
- **Scheduled Sync**: Regular background processing of all customers
- **RESTful API**: Full API for manual operations and integrations
- **Rate Limiting**: Respects Shopify API limits
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Shopify store with admin access
- Node.js 18+ and pnpm
- Basic understanding of Shopify Private Apps

## 🔧 Setup Instructions

### 1. Create Shopify Private App

1. Go to your **Shopify Admin**
2. Navigate to **Settings** → **Apps and sales channels**
3. Click **"Develop apps"**
4. Click **"Create an app"**
5. Set app name: `Customer Tag Manager`

### 2. Configure API Permissions

Add these **Admin API access scopes**:

```
read_customers
write_customers
read_orders
write_orders
read_script_tags
write_script_tags
```

### 3. Get API Credentials

After creating the app, save these credentials:
- **API key** (Client ID)
- **API secret key** (Client Secret)
- **Admin API access token**

### 4. Configure Environment

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your Shopify credentials:
   ```bash
   SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
   SHOPIFY_API_KEY=your_api_key_here
   SHOPIFY_API_SECRET=your_api_secret_here
   SHOPIFY_ACCESS_TOKEN=your_access_token_here
   ```

### 5. Install Dependencies

```bash
pnpm install
```

### 6. Run the Application

**Development mode:**
```bash
pnpm dev
```

**Production mode:**
```bash
pnpm build
pnpm start
```

The app will be available at `http://localhost:3002`

## 📊 Default Segment Rules

The app comes with pre-configured segment rules:

### VIP Customers
- **Condition**: Total spent > $1000
- **Add Tags**: `VIP`, `High-Value`
- **Remove Tags**: `New-Customer`

### New Customers
- **Condition**: Orders count ≤ 1
- **Add Tags**: `New-Customer`
- **Remove Tags**: `VIP`, `High-Value`

### Inactive Customers
- **Condition**: Last order > 90 days ago
- **Add Tags**: `Inactive`
- **Remove Tags**: `Active`, `VIP`

### Active Customers
- **Condition**: Last order < 30 days ago AND Orders count > 1
- **Add Tags**: `Active`
- **Remove Tags**: `Inactive`

## 🔌 API Endpoints

### Health Check
```http
GET /health
```

### Configuration
```http
GET /api/config
PUT /api/config
```

### Segment Rules
```http
GET /api/segment-rules
POST /api/segment-rules
DELETE /api/segment-rules/:ruleName
```

### Customers
```http
GET /api/customers
GET /api/customers/:customerId
PUT /api/customers/:customerId/tags
```

### Tags
```http
GET /api/tags
```

### Segment Processing
```http
POST /api/segments/process
GET /api/segments/:ruleName/customers
```

### Webhooks
```http
POST /webhooks/customers/update
POST /webhooks/orders/create
```

## 🎯 Creating Custom Segment Rules

### Rule Structure
```json
{
  "rule_name": {
    "name": "Rule Display Name",
    "conditions": [
      {
        "field": "total_spent",
        "operator": "greater_than",
        "value": 500
      }
    ],
    "tags": ["Premium"],
    "remove_tags": ["Basic"],
    "enabled": true,
    "priority": 100
  }
}
```

### Available Fields
- `total_spent` - Customer's total spent amount
- `orders_count` - Number of orders
- `last_order_date` - Date of last order
- `created_at` - Customer creation date
- `tags` - Current customer tags
- `email` - Customer email
- `first_name` - Customer first name
- `last_name` - Customer last name
- `accepts_marketing` - Marketing consent
- `verified_email` - Email verification status

### Available Operators
- **Numeric**: `equals`, `not_equals`, `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal`
- **Text**: `contains`, `not_contains`, `starts_with`, `ends_with`
- **Date**: `older_than_days`, `newer_than_days`
- **Array**: `in`, `not_in`

## 🔄 Webhook Setup

To enable real-time tag updates, set up these webhooks in your Shopify app:

1. **Customer Update Webhook**:
   - Topic: `customers/update`
   - Address: `https://your-domain.com/webhooks/customers/update`

2. **Order Creation Webhook**:
   - Topic: `orders/create`
   - Address: `https://your-domain.com/webhooks/orders/create`

## ⚙️ Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SHOPIFY_SHOP_DOMAIN` | Your Shopify shop domain | Required |
| `SHOPIFY_API_KEY` | Shopify API key | Required |
| `SHOPIFY_API_SECRET` | Shopify API secret | Required |
| `SHOPIFY_ACCESS_TOKEN` | Shopify access token | Required |
| `PORT` | Application port | 3002 |
| `NODE_ENV` | Environment mode | development |
| `AUTO_TAG_ENABLED` | Enable automatic tagging | true |
| `TAG_SYNC_INTERVAL` | Sync interval (ms) | 3600000 |
| `LOG_LEVEL` | Logging level | info |

### Configuration File

The app also supports a `config.json` file for persistent configuration:

```json
{
  "shopify": {
    "shopDomain": "your-shop.myshopify.com",
    "apiKey": "your_api_key",
    "apiSecret": "your_api_secret",
    "accessToken": "your_access_token"
  },
  "app": {
    "port": 3002,
    "nodeEnv": "development",
    "logLevel": "info"
  },
  "tagManagement": {
    "autoTagEnabled": true,
    "tagSyncInterval": 3600000,
    "customerSegmentRules": {
      // Your segment rules here
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **API Rate Limits**
   - The app respects Shopify's 2 requests/second limit
   - Large customer bases may take time to process

2. **Webhook Failures**
   - Ensure your webhook URLs are publicly accessible
   - Check webhook signature verification

3. **Tag Conflicts**
   - Rules are processed in priority order (highest first)
   - Later rules can override earlier ones

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

### Health Check

Monitor app health:
```bash
curl http://localhost:3002/health
```

## 📈 Monitoring and Analytics

### Health Endpoint Response
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "config": {
    "shopDomain": "your-shop.myshopify.com",
    "autoTagEnabled": true,
    "segmentRulesCount": 4,
    "enabledRulesCount": 4,
    "syncInterval": "60 minutes"
  }
}
```

### Processing Results
```json
{
  "success": true,
  "data": {
    "processed": 1000,
    "successful": 950,
    "failed": 50,
    "results": [
      {
        "success": true,
        "customerId": 123,
        "operations": [...],
        "errors": [],
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 🔒 Security Considerations

- Store API credentials securely
- Use HTTPS in production
- Implement webhook signature verification
- Monitor API usage and rate limits
- Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Test with the health endpoint
4. Create an issue with detailed information 