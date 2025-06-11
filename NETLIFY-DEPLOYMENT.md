# Shopify Delivery Scheduler - Netlify Deployment Guide

This guide will help you deploy the delivery scheduler components to Netlify for testing on your Shopify store.

## Overview

We'll deploy three components:
1. **Customer Widget** - Static JavaScript file for the frontend widget
2. **Admin Dashboard** - React application for store management
3. **API Server** - Backend services (deploy to Railway/Render separately)

## Prerequisites

- [Netlify Account](https://netlify.com) (free tier available)
- [GitHub Account](https://github.com) with your repository
- [Railway Account](https://railway.app) or [Render Account](https://render.com) for the API

## Step 1: Deploy the API Server

### Option A: Railway (Recommended)

1. **Sign up for Railway** and connect your GitHub repository
2. **Create a new project** and select your repository
3. **Set the root directory** to `apps/api`
4. **Add environment variables**:
   ```
   NODE_ENV=production
   PORT=3001
   ALLOWED_ORIGINS=https://your-shopify-store.myshopify.com,https://admin.shopify.com,https://your-netlify-site.netlify.app
   ```
5. **Deploy** - Railway will automatically detect the Dockerfile

### Option B: Render

1. **Sign up for Render** and create a new Web Service
2. **Connect your GitHub repository**
3. **Configure**:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install -g pnpm && pnpm install && pnpm run build`
   - **Start Command**: `pnpm start`
   - **Environment Variables**: Same as Railway above

## Step 2: Deploy Customer Widget to Netlify

### Method 1: Deploy from Git (Recommended)

1. **Go to Netlify Dashboard** → "New site from Git"
2. **Connect to GitHub** and select your repository
3. **Configure build settings**:
   - **Base directory**: `apps/customer-widget`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Deploy** - Netlify will automatically build and deploy

### Method 2: Manual Upload

1. **Build the widget locally**:
   ```bash
   cd apps/customer-widget
   npm run build
   ```
2. **Go to Netlify Dashboard** → "New site from Git" → "Deploy manually"
3. **Drag and drop** the `dist` folder
4. **Deploy**

### Method 3: Using Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```
2. **Login to Netlify**:
   ```bash
   netlify login
   ```
3. **Deploy**:
   ```bash
   cd apps/customer-widget
   npm run build
   netlify deploy --prod --dir=dist
   ```

## Step 3: Deploy Admin Dashboard to Netlify

### Deploy from Git

1. **Go to Netlify Dashboard** → "New site from Git"
2. **Connect to GitHub** and select your repository
3. **Configure build settings**:
   - **Base directory**: `apps/admin-dashboard`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Add environment variables**:
   ```
   VITE_API_URL=https://your-api-url.com
   ```
5. **Deploy**

## Step 4: Configure Environment Variables

### For Customer Widget

The widget will use the API URL you provide when initializing it in your Shopify theme.

### For Admin Dashboard

1. **Go to your Netlify site settings** → "Environment variables"
2. **Add**:
   ```
   VITE_API_URL=https://your-api-url.com
   ```
3. **Trigger a new deployment** to apply changes

## Step 5: Add Widget to Shopify Theme

1. **Go to your Shopify admin** → Online Store → Themes
2. **Edit your theme** (or create a duplicate for testing)
3. **Add the widget script** to your `theme.liquid` file:

```html
<!-- Add this in the <head> section -->
<script src="https://your-netlify-site.netlify.app/delivery-scheduler.iife.js"></script>
```

4. **Add the widget container** to your cart page or product page:

```html
<!-- Add this where you want the widget to appear -->
<div id="delivery-scheduler-widget"></div>

<script>
  // Initialize the widget
  window.DeliveryScheduler.init({
    apiUrl: 'https://your-api-url.com',
    shopDomain: '{{ shop.permanent_domain }}',
    theme: 'light',
    language: 'en',
    currency: '{{ shop.currency }}',
    timezone: '{{ shop.timezone }}',
    showProductAvailability: true,
    allowExpressDelivery: true,
    maxFutureDays: 30,
    enablePostalCodeValidation: true,
    enablePostalCodeAutoComplete: true,
    postalCodeAutoCompleteDelay: 500,
    showPostalCodeSuggestions: true,
    maxPostalCodeSuggestions: 5
  });
</script>
```

## Step 6: Test Your Deployment

### Test the API

1. **Visit your API health endpoint**: `https://your-api-url.com/health`
2. **Should return**: `{"success": true, "status": "healthy", ...}`

### Test the Widget

1. **Visit your Netlify widget URL**: `https://your-netlify-site.netlify.app/delivery-scheduler.iife.js`
2. **Should download** the JavaScript file

### Test the Admin Dashboard

1. **Visit your admin dashboard URL**: `https://your-admin-dashboard.netlify.app`
2. **Should load** the React application

### Test Shopify Integration

1. **Visit your Shopify store** with the widget added
2. **Test the delivery scheduler** functionality
3. **Check browser console** for any errors

## Troubleshooting

### Build Failures

- **Check build logs** in Netlify dashboard
- **Verify Node.js version** (should be 18+)
- **Check for TypeScript errors** in the build output

### CORS Issues

- **Verify ALLOWED_ORIGINS** in your API environment variables
- **Include your Netlify domain** in the allowed origins
- **Check browser console** for CORS error messages

### Widget Not Loading

- **Verify the script URL** is correct
- **Check network tab** for 404 errors
- **Ensure the widget file** was built successfully

### API Connection Issues

- **Test the API health endpoint** directly
- **Verify the API URL** in your widget configuration
- **Check API logs** in Railway/Render dashboard

## Custom Domain (Optional)

1. **Go to your Netlify site settings** → "Domain management"
2. **Add custom domain** (e.g., `widget.yourstore.com`)
3. **Update your Shopify theme** with the new URL
4. **Update API ALLOWED_ORIGINS** to include the custom domain

## Environment Variables Reference

### API Server
| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Port for the API server | No (default: 3001) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins | Yes |

### Admin Dashboard
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | URL of your deployed API server | Yes |

## Support

If you encounter issues:

1. **Check Netlify build logs** for detailed error messages
2. **Verify all environment variables** are set correctly
3. **Test API endpoints** directly in your browser
4. **Check browser console** for JavaScript errors
5. **Review the deployment checklist** below

## Deployment Checklist

- [ ] API server deployed and accessible
- [ ] API health endpoint returns success
- [ ] Customer widget deployed to Netlify
- [ ] Widget JavaScript file accessible
- [ ] Admin dashboard deployed to Netlify
- [ ] Admin dashboard loads without errors
- [ ] Widget added to Shopify theme
- [ ] Widget initializes without errors
- [ ] Delivery type selection works
- [ ] Postal code validation works
- [ ] Date and time slot selection works
- [ ] Collection locations work
- [ ] Express delivery with fees works
- [ ] Delivery notes are captured
- [ ] Admin dashboard can connect to API
- [ ] All features tested in production 