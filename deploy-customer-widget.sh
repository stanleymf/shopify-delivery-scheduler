#!/bin/bash

# Customer Widget Deployment Script
echo "🚀 Deploying Customer Widget to Netlify..."

# Build the customer widget
echo "📦 Building customer widget..."
cd apps/customer-widget && npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Customer widget built successfully!"
    echo "📁 Build output in: apps/customer-widget/dist/"
    echo ""
    echo "🔧 Next steps for Netlify deployment:"
    echo ""
    echo "1. Go to https://netlify.com and sign in"
    echo "2. Click 'Add new site' → 'Import an existing project'"
    echo "3. Connect your GitHub repository"
    echo "4. Set build settings:"
    echo "   - Build command: cd apps/customer-widget && npm install && npm run build"
    echo "   - Publish directory: apps/customer-widget/dist"
    echo "5. Click 'Deploy site'"
    echo ""
    echo "6. Once deployed, your widget URL will be:"
    echo "   https://your-site-name.netlify.app/delivery-scheduler.iife.js"
    echo ""
    echo "7. Update your Shopify integration with this URL"
else
    echo "❌ Build failed!"
    exit 1
fi 