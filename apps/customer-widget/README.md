# Delivery Scheduler Widget

A React-based delivery scheduling widget that can be embedded into Shopify cart pages to provide real-time delivery availability and postal code validation.

## Features

- **Postal Code Validation**: Real-time validation with auto-complete suggestions
- **Delivery Date Selection**: Interactive calendar with availability checking
- **Time Slot Selection**: Available delivery time slots with capacity tracking
- **Shopify Integration**: Seamless integration with Shopify cart and checkout
- **Responsive Design**: Works on desktop and mobile devices
- **Customizable**: Configurable themes, languages, and features

## Installation

### 1. Build the Widget

```bash
cd apps/customer-widget
npm install
npm run build
```

This will create a distributable widget in the `dist` folder.

### 2. Shopify Integration

#### Option A: Shopify App (Recommended)

1. Create a Shopify app in your Shopify Partner account
2. Add the widget files to your app's assets
3. Inject the widget into cart pages using Shopify's App Bridge

#### Option B: Theme Integration

1. Upload the widget files to your theme's assets
2. Add the following code to your cart template:

```liquid
<!-- In your cart.liquid template -->
<div id="delivery-scheduler-widget"></div>

<script>
  // Widget configuration
  const widgetConfig = {
    apiUrl: 'https://your-api-domain.com',
    shopDomain: '{{ shop.permanent_domain }}',
    theme: 'light',
    language: '{{ shop.locale }}',
    currency: '{{ shop.currency }}',
    timezone: '{{ shop.timezone }}',
    showProductAvailability: true,
    allowExpressDelivery: true,
    maxFutureDays: 120,
    enablePostalCodeValidation: true,
    enablePostalCodeAutoComplete: true,
    postalCodeAutoCompleteDelay: 500,
    showPostalCodeSuggestions: true,
    maxPostalCodeSuggestions: 5
  };

  // Load the widget
  const script = document.createElement('script');
  script.src = '{{ "delivery-scheduler.js" | asset_url }}';
  script.setAttribute('data-container', 'delivery-scheduler-widget');
  script.setAttribute('data-config', JSON.stringify(widgetConfig));
  document.head.appendChild(script);
</script>
```

### 3. API Backend Setup

1. Deploy the API backend (see `apps/api/README.md`)
2. Update the `apiUrl` in your widget configuration
3. Ensure CORS is properly configured for your Shopify domain

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | string | - | URL of your delivery scheduler API |
| `shopDomain` | string | - | Your Shopify store domain |
| `theme` | 'light' \| 'dark' \| 'auto' | 'light' | Widget theme |
| `language` | string | 'en' | Widget language |
| `currency` | string | 'CAD' | Currency for display |
| `timezone` | string | 'America/Toronto' | Timezone for date calculations |
| `showProductAvailability` | boolean | true | Show product availability warnings |
| `allowExpressDelivery` | boolean | true | Enable express delivery options |
| `maxFutureDays` | number | 120 | Maximum days in advance for delivery |
| `enablePostalCodeValidation` | boolean | true | Enable postal code validation |
| `enablePostalCodeAutoComplete` | boolean | true | Enable postal code auto-complete |
| `postalCodeAutoCompleteDelay` | number | 500 | Delay before auto-complete search (ms) |
| `showPostalCodeSuggestions` | boolean | true | Show postal code suggestions |
| `maxPostalCodeSuggestions` | number | 5 | Maximum number of suggestions to show |

## Events

The widget emits events that you can listen to:

```javascript
// Listen for widget events
window.addEventListener('delivery-scheduler-event', (event) => {
  const { type, payload } = event.detail;
  
  switch (type) {
    case 'POSTAL_CODE_VALIDATED':
      console.log('Postal code validated:', payload);
      break;
    case 'DELIVERY_DATE_SELECTED':
      console.log('Delivery date selected:', payload);
      break;
    case 'DELIVERY_AREA_SELECTED':
      console.log('Delivery area selected:', payload);
      break;
    case 'AVAILABILITY_CHECKED':
      console.log('Availability checked:', payload);
      break;
    case 'ERROR':
      console.error('Widget error:', payload);
      break;
  }
});
```

## Postal Code Validation

The widget includes comprehensive postal code validation:

- **Format Validation**: Validates Canadian postal code format (A1A 1A1)
- **Delivery Area Check**: Verifies if delivery is available in the area
- **Auto-complete**: Suggests postal codes as the customer types
- **Real-time Feedback**: Immediate validation results with delivery area info

### Supported Postal Code Areas

The widget currently supports delivery areas in:
- Downtown Toronto (M5V, M5H, M5J, M5K, M5L)
- Greater Toronto Area (M5M, M5N, M5P, M5R, M5S, M5T, M5W, M5X, M5Y, M5Z)
- Ontario (Outside GTA) (L4K, L4L, L4M, L4N, L4P, L4R, L4S, L4T, L4V, L4W, L4X, L4Y, L4Z)

## Customization

### Styling

The widget uses inline styles for consistency. To customize the appearance:

1. Override styles using CSS custom properties
2. Modify the component styles in the source code
3. Use CSS-in-JS for dynamic theming

### Localization

The widget supports multiple languages. Add translations by modifying the component text or using a localization library.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## API Endpoints

The widget communicates with the following API endpoints:

- `POST /postal-code/validate` - Validate postal codes
- `POST /postal-code/autocomplete` - Get postal code suggestions
- `POST /availability` - Check delivery availability

See the API documentation for detailed endpoint specifications.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Private - All rights reserved 