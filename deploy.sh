#!/bin/bash

# Shopify Delivery Scheduler - Deployment Script
# This script helps build and prepare the application for deployment

echo "🚀 Shopify Delivery Scheduler - Deployment Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the API
echo "📦 Building API..."
cd apps/api
pnpm run build
if [ $? -ne 0 ]; then
    echo "❌ API build failed"
    exit 1
fi
echo "✅ API built successfully"

# Build the customer widget
echo "📦 Building Customer Widget..."
cd ../customer-widget
pnpm run build
if [ $? -ne 0 ]; then
    echo "❌ Customer widget build failed"
    exit 1
fi
echo "✅ Customer widget built successfully"

# Build the admin dashboard
echo "📦 Building Admin Dashboard..."
cd ../admin-dashboard
pnpm run build
if [ $? -ne 0 ]; then
    echo "❌ Admin dashboard build failed"
    exit 1
fi
echo "✅ Admin dashboard built successfully"

# Go back to root
cd ../..

echo ""
echo "🎉 All builds completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy the API to Railway or Render (see DEPLOYMENT.md)"
echo "2. Host the customer widget on GitHub Pages or Netlify"
echo "3. Add the widget to your Shopify theme"
echo "4. Test the integration"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md" 