# 🚚 Shopify Delivery Scheduler

A comprehensive delivery scheduling solution for Shopify stores, featuring a customer-facing widget and admin dashboard for managing delivery options, locations, and text customizations.

## ✨ Features

### Customer Widget
- **Multiple Delivery Types**: Standard delivery, Express delivery, and Collection pickup
- **Postal Code Validation**: Real-time validation with auto-complete suggestions
- **Dynamic Timeslots**: Available delivery times based on location and date
- **Express Delivery**: Premium delivery options with additional fees
- **Collection Locations**: Multiple pickup locations with full address details
- **Delivery Notes**: Optional notes for special delivery instructions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Dashboard
- **Text Customizations**: Customize all widget labels and messages
- **Collection Locations**: Full CRUD operations for pickup locations
- **Express Timeslots**: Manage express delivery times and fees
- **Real-time Updates**: Instant synchronization with the customer widget
- **Modern UI**: Clean, intuitive interface built with React

### API Server
- **RESTful Endpoints**: Complete API for all widget functionality
- **CORS Support**: Configured for cross-origin requests
- **Health Checks**: Built-in monitoring endpoints
- **Docker Ready**: Containerized for easy deployment

## 🏗️ Architecture

```
shopify-delivery-scheduler/
├── apps/
│   ├── api/                 # Backend API server (Node.js/Express)
│   ├── customer-widget/     # Customer-facing widget (React)
│   └── admin-dashboard/     # Admin management interface (React)
├── deploy.sh               # Build script for all components
├── NETLIFY-DEPLOYMENT.md   # Detailed deployment guide
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Git
- GitHub account
- Netlify account (for hosting)
- Railway/Render account (for API hosting)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd shopify-delivery-scheduler
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development servers**:
   ```bash
   # Start API server
   cd apps/api && npm run dev
   
   # Start customer widget (in new terminal)
   cd apps/customer-widget && npm run dev
   
   # Start admin dashboard (in new terminal)
   cd apps/admin-dashboard && npm run dev
   ```

4. **Build all components**:
   ```bash
   ./deploy.sh
   ```

## 📦 Deployment

### Option 1: Netlify (Recommended for Testing)

1. **Deploy API to Railway/Render**
2. **Deploy Customer Widget to Netlify**
3. **Deploy Admin Dashboard to Netlify**

See [NETLIFY-DEPLOYMENT.md](./NETLIFY-DEPLOYMENT.md) for detailed instructions.

### Option 2: Manual Deployment

1. **Build the components**:
   ```bash
   ./deploy.sh
   ```

2. **Deploy API server** to your preferred hosting platform
3. **Host widget files** on your web server or CDN
4. **Integrate with Shopify theme**

## 🔧 Configuration

### Environment Variables

#### API Server
```bash
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://your-shopify-store.myshopify.com,https://admin.shopify.com
```

#### Admin Dashboard
```bash
VITE_API_URL=https://your-api-url.com
```

### Widget Configuration

```javascript
window.DeliveryScheduler.init('widget-container', {
  apiUrl: 'https://your-api-url.com',
  shopDomain: 'your-store.myshopify.com',
  theme: 'light',
  allowExpressDelivery: true,
  enablePostalCodeValidation: true,
  maxFutureDays: 30
});
```

## 🛠️ Development

### Project Structure

- **API**: Express.js server with TypeScript
- **Customer Widget**: React component with Vite build
- **Admin Dashboard**: React application with Tailwind CSS

### Available Scripts

```bash
# Build all components
./deploy.sh

# Build individual components
cd apps/api && npm run build
cd apps/customer-widget && npm run build
cd apps/admin-dashboard && npm run build

# Development
cd apps/api && npm run dev
cd apps/customer-widget && npm run dev
cd apps/admin-dashboard && npm run dev
```

## 📱 Shopify Integration

### Add to Theme

1. **Include the widget script** in your theme's `theme.liquid`:
   ```html
   <script src="https://your-widget-url.com/delivery-scheduler.iife.js"></script>
   ```

2. **Add the widget container** where you want it to appear:
   ```html
   <div id="delivery-scheduler-widget"></div>
   ```

3. **Initialize the widget**:
   ```html
   <script>
     window.DeliveryScheduler.init('delivery-scheduler-widget', {
       apiUrl: 'https://your-api-url.com',
       shopDomain: '{{ shop.permanent_domain }}',
       theme: 'light',
       allowExpressDelivery: true,
       enablePostalCodeValidation: true
     });
   </script>
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [deployment guide](./NETLIFY-DEPLOYMENT.md)
2. Review the browser console for error messages
3. Verify your API endpoints are accessible
4. Ensure CORS is properly configured

## 🎯 Roadmap

- [ ] Shopify App Store integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Integration with shipping providers
- [ ] Advanced scheduling algorithms

---

**Built with ❤️ for Shopify merchants** 