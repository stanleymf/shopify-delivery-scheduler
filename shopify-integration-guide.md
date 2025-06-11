# Shopify Delivery Scheduler - Integration Guide

## 🚀 Quick Setup Overview

This guide will help you integrate the Delivery Scheduler into your Shopify store as a private app.

## 📋 Prerequisites

- ✅ Admin Dashboard deployed: `dashing-nougat-dc3499.netlify.app`
- ✅ Customer Widget deployed: `your-customer-widget-url.netlify.app`
- ✅ API deployed: `your-railway-api-url.up.railway.app`
- ✅ Shopify store with admin access

## 🔧 Step 1: Create Shopify Private App

### 1.1 Access App Development
1. Go to your **Shopify Admin**
2. Navigate to **Settings** → **Apps and sales channels**
3. Click **"Develop apps"**
4. Click **"Create an app"**

### 1.2 Configure App Settings
- **App name**: `Delivery Scheduler`
- **App URL**: `https://dashing-nougat-dc3499.netlify.app`
- **Allowed redirection URLs**: `https://dashing-nougat-dc3499.netlify.app`

### 1.3 Set API Permissions
Add these **Admin API access scopes**:

```
read_products
write_products
read_orders
write_orders
read_customers
write_customers
read_inventory
write_inventory
read_shipping
write_shipping
read_fulfillments
write_fulfillments
read_script_tags
write_script_tags
read_themes
write_themes
```

### 1.4 Get API Credentials
After creating the app, save these credentials:
- **API key** (Client ID)
- **API secret key** (Client Secret)
- **Admin API access token**

## 🔗 Step 2: Add Widget to Shopify Theme

### 2.1 Add Script Tag
Go to **Online Store** → **Themes** → **Actions** → **Edit code**

Add this script to your `theme.liquid` file in the `<head>` section:

```html
<!-- Delivery Scheduler Widget -->
<script>
  window.DeliverySchedulerConfig = {
    apiUrl: 'https://your-railway-api-url.up.railway.app',
    shopDomain: '{{ shop.permanent_domain }}',
    theme: 'light',
    language: '{{ shop.locale }}',
    currency: '{{ shop.currency }}',
    timezone: '{{ shop.timezone }}',
    showProductAvailability: true,
    allowExpressDelivery: true,
    maxFutureDays: 30,
    enablePostalCodeValidation: true,
    enablePostalCodeAutoComplete: true,
    postalCodeAutoCompleteDelay: 300,
    showPostalCodeSuggestions: true,
    maxPostalCodeSuggestions: 5
  };
</script>

<script src="https://your-customer-widget-url.netlify.app/widget.js" async></script>
```

### 2.2 Add Widget Container to Cart Page
In your `cart.liquid` template, add this where you want the widget to appear:

```html
<!-- Delivery Scheduler Widget Container -->
<div id="delivery-scheduler-widget" class="delivery-scheduler-container">
  <!-- Widget will be loaded here -->
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.DeliveryScheduler && window.DeliverySchedulerConfig) {
      window.DeliveryScheduler.init('delivery-scheduler-widget', window.DeliverySchedulerConfig, function(event) {
        console.log('Delivery Scheduler Event:', event);
        
        // Handle delivery selection
        if (event.type === 'delivery_selected') {
          // Add delivery data to cart attributes
          const deliveryData = {
            delivery_type: event.data.deliveryType,
            delivery_date: event.data.deliveryDate,
            delivery_timeslot: event.data.timeslot,
            postal_code: event.data.postalCode,
            collection_location: event.data.collectionLocation
          };
          
          // Update cart with delivery information
          updateCartWithDeliveryData(deliveryData);
        }
      });
    }
  });
  
  function updateCartWithDeliveryData(deliveryData) {
    // Add delivery data as cart note attributes
    const noteAttributes = Object.entries(deliveryData).map(([key, value]) => ({
      name: key,
      value: value
    }));
    
    // Update cart with delivery information
    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        note_attributes: noteAttributes
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Cart updated with delivery data:', data);
      // Optionally refresh the cart page or show confirmation
    })
    .catch(error => {
      console.error('Error updating cart:', error);
    });
  }
</script>
```

### 2.3 Add Widget Container to Product Pages (Optional)
In your `product.liquid` template, add this for product-specific delivery options:

```html
<!-- Product Delivery Scheduler Widget -->
<div id="product-delivery-scheduler" class="product-delivery-scheduler">
  <!-- Widget will be loaded here -->
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.DeliveryScheduler && window.DeliverySchedulerConfig) {
      // Modify config for product page
      const productConfig = {
        ...window.DeliverySchedulerConfig,
        showProductAvailability: true,
        allowExpressDelivery: true
      };
      
      window.DeliveryScheduler.init('product-delivery-scheduler', productConfig, function(event) {
        if (event.type === 'delivery_selected') {
          // Store delivery preference for this product
          localStorage.setItem('product_delivery_preference', JSON.stringify(event.data));
        }
      });
    }
  });
</script>
```

## 🎨 Step 3: Add CSS Styling

Add this CSS to your theme's `assets/theme.css` or create a new CSS file:

```css
/* Delivery Scheduler Widget Styles */
.delivery-scheduler-container {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.product-delivery-scheduler {
  margin: 15px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fafafa;
}

/* Widget Loading State */
.delivery-scheduler-container:empty::before {
  content: "Loading delivery options...";
  display: block;
  text-align: center;
  color: #666;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .delivery-scheduler-container,
  .product-delivery-scheduler {
    margin: 10px 0;
    padding: 15px;
  }
}
```

## 🔧 Step 4: Configure Environment Variables

### 4.1 Update Admin Dashboard Environment Variables
In your Netlify admin dashboard deployment, add these environment variables:

```
VITE_API_URL=https://your-railway-api-url.up.railway.app
VITE_SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
```

### 4.2 Update API Environment Variables
In your Railway API deployment, add these environment variables:

```
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_ACCESS_TOKEN=your_access_token
ALLOWED_ORIGINS=https://your-shop.myshopify.com,https://dashing-nougat-dc3499.netlify.app
```

## 🧪 Step 5: Test the Integration

### 5.1 Test Widget Loading
1. Visit your cart page
2. Check browser console for any errors
3. Verify the widget loads and displays correctly

### 5.2 Test Delivery Selection
1. Select a delivery type
2. Choose a date and timeslot
3. Verify cart attributes are updated
4. Check order confirmation

### 5.3 Test Admin Dashboard
1. Visit `https://dashing-nougat-dc3499.netlify.app`
2. Configure text customizations
3. Add collection locations
4. Verify changes reflect in the widget

## 🔍 Step 6: Monitor and Debug

### 6.1 Browser Console
Check for JavaScript errors and widget events:
```javascript
// In browser console
console.log('Delivery Scheduler Config:', window.DeliverySchedulerConfig);
console.log('Delivery Scheduler Object:', window.DeliveryScheduler);
```

### 6.2 API Health Check
Test your API endpoints:
```bash
curl https://your-railway-api-url.up.railway.app/health
curl https://your-railway-api-url.up.railway.app/locations
```

### 6.3 Shopify Order Data
Check that delivery data is being saved with orders:
1. Place a test order
2. Check order notes/attributes
3. Verify delivery information is preserved

## 🚨 Troubleshooting

### Common Issues:

1. **Widget not loading**
   - Check script URL is correct
   - Verify container ID exists
   - Check browser console for errors

2. **API calls failing**
   - Verify API URL is correct
   - Check CORS settings
   - Ensure environment variables are set

3. **Cart not updating**
   - Check Shopify API permissions
   - Verify cart update script
   - Check browser console for errors

4. **Admin dashboard not connecting**
   - Verify API URL in environment variables
   - Check API health endpoint
   - Ensure CORS allows admin dashboard domain

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all URLs are correct
3. Test API endpoints individually
4. Check environment variables are set correctly

## 🎉 Next Steps

Once integration is complete:
1. Test with real orders
2. Configure delivery areas and timeslots
3. Set up notifications
4. Monitor performance and usage 