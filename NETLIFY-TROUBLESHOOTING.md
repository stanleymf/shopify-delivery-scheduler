# Netlify Deployment Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue 1: "Missing script: build"

**Symptoms:**
- Build fails with "npm error Missing script: build"
- Netlify can't find the build script

**Solutions:**

#### Solution A: Use pnpm (Recommended)
```toml
[build]
  publish = "dist"
  command = "npm install -g pnpm && pnpm install && pnpm run build"
```

#### Solution B: Use npx pnpm
```toml
[build]
  publish = "dist"
  command = "npx pnpm install && npx pnpm run build"
```

#### Solution C: Use npm with package-lock.json
```toml
[build]
  publish = "dist"
  command = "npm install && npm run build"
```

### Issue 2: Wrong Working Directory

**Symptoms:**
- Build runs from wrong directory
- Can't find package.json

**Solution:**
Add `base` directive to netlify.toml:
```toml
[build]
  base = "apps/admin-dashboard"
  publish = "dist"
  command = "npm install -g pnpm && pnpm install && pnpm run build"
```

### Issue 3: Node Version Issues

**Symptoms:**
- Build fails with Node.js version errors
- Incompatible dependencies

**Solution:**
Add Node.js version specification:
```toml
[build.environment]
  NODE_VERSION = "18"
```

### Issue 4: SPA Routing Issues

**Symptoms:**
- 404 errors on page refresh
- Routes not working

**Solution:**
Add redirects to netlify.toml:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Or create `public/_redirects` file:
```
/*    /index.html   200
```

## 🔧 Current Configuration

### Admin Dashboard netlify.toml
```toml
[build]
  publish = "dist"
  command = "npm install -g pnpm && pnpm install && pnpm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Root netlify.toml
```toml
[build]
  base = "apps/admin-dashboard"
  publish = "dist"
  command = "pnpm install && pnpm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🧪 Testing Locally

### Test Build Command
```bash
cd apps/admin-dashboard
npm install -g pnpm
pnpm install
pnpm run build
```

### Test with npx
```bash
cd apps/admin-dashboard
npx pnpm install
npx pnpm run build
```

## 📋 Deployment Checklist

- [ ] Build works locally
- [ ] netlify.toml is in correct location
- [ ] Environment variables are set
- [ ] Node.js version is specified
- [ ] SPA redirects are configured
- [ ] Security headers are set

## 🚀 Manual Deployment

If automatic deployment fails:

1. **Build locally:**
   ```bash
   cd apps/admin-dashboard
   npm install -g pnpm
   pnpm install
   pnpm run build
   ```

2. **Upload dist folder to Netlify:**
   - Go to Netlify dashboard
   - Drag and drop the `dist` folder
   - Set environment variables

## 🔍 Debugging

### Check Build Logs
- Look for specific error messages
- Check Node.js version
- Verify package manager commands

### Common Error Messages
- `Missing script: build` → Add build script to package.json
- `Cannot find module` → Install dependencies
- `Permission denied` → Check file permissions
- `Node version` → Set NODE_VERSION in environment

## 📞 Support

If issues persist:
1. Check Netlify build logs
2. Test build locally
3. Verify all configuration files
4. Check environment variables 