# Admin Dashboard - Netlify Deployment Guide

## 🚀 Quick Deploy

### Option 1: Deploy from Git (Recommended)

1. **Connect your GitHub repository to Netlify**
2. **Set build settings:**
   - **Base directory**: `apps/admin-dashboard`
   - **Build command**: `pnpm install && pnpm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### Option 2: Manual Deploy

1. **Build locally:**
   ```bash
   cd apps/admin-dashboard
   pnpm install
   pnpm run build
   ```

2. **Upload the `dist` folder to Netlify**

## 🔧 Environment Variables

Add these environment variables in your Netlify dashboard:

```
VITE_API_URL=https://your-railway-api-url.up.railway.app
VITE_SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
```

## 🐛 Troubleshooting

### Build Fails with "Missing script: build"
- Ensure you're using the correct base directory: `apps/admin-dashboard`
- Use `pnpm` instead of `npm` for package management
- Check that `package.json` has the build script

### Dependencies Not Found
- Make sure `pnpm install` runs before `pnpm run build`
- Check that all dependencies are in `package.json`

### TypeScript Errors
- Ensure Node.js version 18 is used
- Check that `tsconfig.json` and related files are present

## 📁 File Structure

```
apps/admin-dashboard/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── dist/           # Build output (created after build)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── netlify.toml    # Netlify configuration
└── .nvmrc         # Node.js version
```

## ✅ Success Indicators

After successful deployment:
- ✅ Build completes without errors
- ✅ `dist/` folder contains built files
- ✅ Admin dashboard loads at your Netlify URL
- ✅ API connection works (check browser console)
- ✅ Text customizations and locations load

## 🔗 Next Steps

1. **Test the admin dashboard** at your Netlify URL
2. **Configure environment variables** with your API URL
3. **Add collection locations** through the admin interface
4. **Customize text labels** for the customer widget
5. **Integrate with Shopify** using the integration guide 