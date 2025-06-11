#!/bin/bash

# Admin Dashboard Deployment Script
echo "🚀 Deploying Admin Dashboard to Netlify..."

# Build the project
echo "📦 Building project..."
pnpm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output in: apps/admin-dashboard/dist/"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Commit and push your changes:"
    echo "   git add ."
    echo "   git commit -m 'Fix Netlify build configuration'"
    echo "   git push"
    echo ""
    echo "2. Netlify should auto-deploy from the git push"
    echo "3. Check your Netlify dashboard for deployment status"
    echo ""
    echo "4. Configure environment variables in Netlify:"
    echo "   VITE_API_URL=https://your-railway-api-url.up.railway.app"
    echo "   VITE_SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com"
else
    echo "❌ Build failed!"
    exit 1
fi 