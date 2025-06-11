#!/bin/bash

# Delivery Scheduler Setup Script
echo "🚀 Setting up Delivery Scheduler Environment Variables..."

# Create .env file from example
if [ ! -f "apps/api/.env" ]; then
    echo "📝 Creating .env file..."
    cp delivery-scheduler.env.example apps/api/.env
    echo "✅ .env file created!"
else
    echo "⚠️  .env file already exists. Updating with new credentials..."
fi

echo "✅ Environment file setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit apps/api/.env and update with your actual credentials"
echo "2. Update SHOPIFY_SHOP_DOMAIN with your actual shop domain"
echo "3. Generate a webhook secret and update SHOPIFY_WEBHOOK_SECRET"
echo "4. Update ALLOWED_ORIGINS with your actual domains"
echo ""
echo "🔧 To update your shop domain, edit apps/api/.env and change:"
echo "   SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com"
echo "   to your actual shop domain" 