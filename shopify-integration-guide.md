# Shopify Delivery Scheduler - Integration Guide

## 🚀 Quick Setup

### Step 1: Deploy Customer Widget
The customer widget needs to be deployed to a CDN. You have two options:

**Option A: Deploy to Netlify (Recommended)**
1. Create a new Netlify site from your GitHub repository
2. Set the build settings:
   - Build command: `cd apps/customer-widget && npm install && npm run build`
   - Publish directory: `apps/customer-widget/dist`
3. Deploy and get your widget URL (e.g., `https://your-widget-name.netlify.app`)

**Option B: Use the built files directly**
- Copy the files from `apps/customer-widget/dist/` to your Shopify theme's assets folder
- Reference them as `/assets/delivery-scheduler.iife.js`

### Step 2: Add to Your Shopify Theme

#### Add this to your `theme.liquid` file in the `<head>` section:

```html
<!-- Delivery Scheduler Widget -->
<script src="https://your-widget-url.netlify.app/delivery-scheduler.iife.js"></script>
```

#### Add this to your cart page (`cart.liquid`) or product page:

```html
<!-- Delivery Scheduler Widget Container -->
<div id="delivery-scheduler-widget"></div>

<script>
  // Initialize the delivery scheduler widget
  window.DeliveryScheduler.init({
    // Required: Your deployed API URL
    apiUrl: 'https://your-railway-api.up.railway.app',
    
    // Required: Your shop domain (Shopify will replace this)
    shopDomain: '{{ shop.permanent_domain }}',
    
    // Optional: Theme configuration
    theme: 'light', // 'light', 'dark', or 'auto'
    language: 'en',
    currency: '{{ shop.currency }}',
    timezone: '{{ shop.timezone }}',
    
    // Optional: Feature toggles
    showProductAvailability: true,
    allowExpressDelivery: true,
    maxFutureDays: 30,
    
    // Optional: Postal code validation settings
    enablePostalCodeValidation: true,
    enablePostalCodeAutoComplete: true,
    postalCodeAutoCompleteDelay: 500,
    showPostalCodeSuggestions: true,
    maxPostalCodeSuggestions: 5
  });
</script>

<!-- Optional: Custom CSS for styling -->
<style>
  #delivery-scheduler-widget {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background-color: #fff;
  }
  
  /* Custom styling for the widget */
  .delivery-scheduler {
    font-family: inherit;
  }
  
  .delivery-scheduler h3 {
    color: {{ settings.color_primary }};
  }
  
  .delivery-scheduler button {
    transition: all 0.2s ease;
  }
  
  .delivery-scheduler button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
</style>
```

### Step 3: Event Handling (Optional)

Add this script to handle delivery selection events:

```html
<script>
  // Listen for delivery selection events
  document.addEventListener('deliverySchedulerEvent', function(event) {
    const { type, payload } = event.detail;
    
    switch(type) {
      case 'DELIVERY_TYPE_SELECTED':
        console.log('Delivery type selected:', payload.deliveryType);
        // Update cart attributes or session storage
        break;
        
      case 'POSTAL_CODE_VALIDATED':
        console.log('Postal code validated:', payload);
        // Update shipping methods or cart
        break;
        
      case 'DELIVERY_DATE_SELECTED':
        console.log('Delivery scheduled:', payload);
        // Add delivery info to cart or order
        // payload includes: date, timeslotId, deliveryType, location, expressFee, deliveryNotes
        break;
    }
  });
</script>
```

## 🔧 Configuration

### Required URLs to Update:

1. **Widget URL**: Replace `https://your-widget-url.netlify.app` with your actual widget URL
2. **API URL**: Replace `https://your-railway-api.up.railway.app` with your actual Railway API URL

### Environment Variables Needed:

Make sure your Railway API has these environment variables set:
- `SHOPIFY_SHOP_DOMAIN`
- `SHOPIFY_ACCESS_TOKEN`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_WEBHOOK_SECRET`

## 🧪 Testing

### Test the Integration:

1. **Load your Shopify store**
2. **Go to a product page or cart page**
3. **Check browser console** for any errors
4. **Test the widget functionality**:
   - Select delivery type
   - Enter postal code
   - Select delivery date and time
   - Verify data is saved

### Debug Common Issues:

1. **Widget not loading**: Check the script URL is correct
2. **API errors**: Verify your Railway API URL and environment variables
3. **CORS errors**: Ensure your API allows requests from your Shopify domain
4. **Styling issues**: Check CSS conflicts with your theme

## 📱 Mobile Responsiveness

The widget is designed to be mobile-responsive. If you need custom mobile styling, add:

```css
@media (max-width: 768px) {
  #delivery-scheduler-widget {
    padding: 15px;
    margin: 15px 0;
  }
  
  .delivery-scheduler {
    font-size: 14px;
  }
}
```

## 🔒 Security Considerations

1. **HTTPS Only**: Ensure all URLs use HTTPS
2. **CORS Configuration**: Configure your API to only allow requests from your Shopify domain
3. **API Rate Limiting**: Implement rate limiting on your API endpoints
4. **Input Validation**: Always validate user inputs on both client and server side

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all URLs are correct
3. Test the API endpoints directly
4. Check your Railway deployment logs

## 🚀 Next Steps

After successful integration:
1. **Test thoroughly** on your Shopify store
2. **Configure delivery settings** in your admin dashboard
3. **Set up timeslots** and delivery types
4. **Test the complete flow** from selection to order completion 