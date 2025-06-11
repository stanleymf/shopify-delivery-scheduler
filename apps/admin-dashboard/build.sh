#!/bin/bash

# Build script for admin dashboard
echo "🚀 Building Admin Dashboard..."

# Try pnpm first, then npm, then yarn
if command -v pnpm &> /dev/null; then
    echo "📦 Using pnpm..."
    pnpm install
    pnpm run build
elif command -v npm &> /dev/null; then
    echo "📦 Using npm..."
    npm install
    npm run build
elif command -v yarn &> /dev/null; then
    echo "📦 Using yarn..."
    yarn install
    yarn build
else
    echo "❌ No package manager found!"
    exit 1
fi

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output in: dist/"
else
    echo "❌ Build failed!"
    exit 1
fi 