# Shopify Delivery Scheduler - Deployment Guide

This guide will help you deploy the delivery scheduler for testing on a Shopify store.

## Overview

The delivery scheduler consists of three main components:
1. **API Server** - Backend services for delivery management
2. **Admin Dashboard** - Management interface for store owners
3. **Customer Widget** - Frontend widget for customers to select delivery options

## Quick Deployment (Recommended for Testing)

### Step 1: Deploy the API Server

#### Option A: Deploy to Railway (Recommended)

1. **Sign up for Railway** (https://railway.app)
2. **Connect your GitHub repository**
3. **Create a new project** and select your repository
4. **Set the root directory** to `apps/api`
5. **Add environment variables**:
   ```
   NODE_ENV=production
   PORT=3001
   ALLOWED_ORIGINS=https://your-shopify-store.myshopify.com,https://admin.shopify.com
   ```
6. **Deploy** - Railway will automatically detect the Dockerfile and deploy

#### Option B: Deploy to Render

1. **Sign up for Render** (https://render.com)
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install -g pnpm && pnpm install && pnpm run build`
   - **Start Command**: `pnpm start`
   - **Environment Variables**: Same as Railway above

### Step 2: Deploy the Customer Widget

The customer widget is a static JavaScript file that can be hosted on any CDN.

#### Option A: Use GitHub Pages

1. **Create a new branch** called `gh-pages`
2. **Copy the built widget** to the root:
   ```bash
   cp apps/customer-widget/dist/delivery-scheduler.iife.js .
   ```
3. **Enable GitHub Pages** in your repository settings
4. **Your widget URL** will be: `https://yourusername.github.io/your-repo/delivery-scheduler.iife.js`

#### Option B: Use Netlify

1. **Sign up for Netlify** (https://netlify.com)
2. **Deploy from Git** and select your repository
3. **Set build settings**:
   - **Build command**: `cd apps/customer-widget && npm run build`
   - **Publish directory**: `apps/customer-widget/dist`
4. **Your widget URL** will be: `https://your-site.netlify.app/delivery-scheduler.iife.js`

### Step 3: Add Widget to Shopify Theme

1. **Go to your Shopify admin** → Online Store → Themes
2. **Edit your theme** (or create a duplicate for testing)
3. **Add the widget script** to your theme's `theme.liquid` file:

```html
<!-- Add this in the <head> section -->
<script src="https://your-widget-url.com/delivery-scheduler.iife.js"></script>
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

### Step 4: Deploy Admin Dashboard (Optional for Testing)

For testing, you can run the admin dashboard locally:

1. **Navigate to the admin dashboard**:
   ```bash
   cd apps/admin-dashboard
   npm run dev
   ```

2. **Update the API URL** in the admin dashboard to point to your deployed API

3. **Access the dashboard** at `http://localhost:5173`

## Production Deployment

For production, consider creating a proper Shopify app with:

1. **Shopify App Bridge** integration
2. **Theme app extensions** for the customer widget
3. **Embedded admin dashboard** in Shopify admin
4. **Proper authentication** and security

## Testing Checklist

- [ ] API server is deployed and accessible
- [ ] Widget script is hosted and accessible
- [ ] Widget is added to your Shopify theme
- [ ] Admin dashboard can connect to the API
- [ ] Delivery type selection works
- [ ] Postal code validation works
- [ ] Date and time slot selection works
- [ ] Collection locations work
- [ ] Express delivery with fees works
- [ ] Delivery notes are captured

## Troubleshooting

### API Issues
- Check the API logs in your deployment platform
- Verify environment variables are set correctly
- Test the health endpoint: `https://your-api-url.com/health`

### Widget Issues
- Check browser console for JavaScript errors
- Verify the widget script URL is accessible
- Ensure CORS is configured correctly in the API

### Shopify Integration Issues
- Make sure the widget is added to the correct page
- Check that the shop domain is correct
- Verify the theme changes are saved and published

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Port for the API server | No (default: 3001) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins | Yes |

## Support

If you encounter issues during deployment, check:
1. The API logs in your deployment platform
2. Browser console for JavaScript errors
3. Network tab for failed requests
4. Shopify theme editor for syntax errors 