# 🗄️ Data Persistence Guide - Shopify Delivery Scheduler

## Problem Solved

**Before**: All delivery settings, timeslots, blocked dates, and rules were lost on every deployment because they were stored in React state (memory).

**After**: Complete data persistence with automatic backup, restore, and sync capabilities.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │◄──►│   API Server    │◄──►│  JSON Database  │
│   (Frontend)    │    │   (Backend)     │    │   (Files)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
      ↑                         ↑                        ↑
   React State              Express API              File System
   Auto-sync with           RESTful endpoints        Persistent storage
   API on changes           CRUD operations          JSON files
```

---

## 🚀 Setup Instructions

### Step 1: Backend Setup (Already Complete)

✅ **Database Module**: `apps/api/src/database.ts` - Handles all data operations
✅ **API Endpoints**: Added to `apps/api/src/app.ts` - Full CRUD operations
✅ **File Storage**: Data persisted in `apps/api/data/` directory

### Step 2: Frontend Integration

#### Option A: Integrate with Existing App (Recommended)

Add this to your `apps/admin-dashboard/src/App.tsx`:

```typescript
import { useDataPersistence } from './hooks/useDataPersistence';

function App() {
  // ... existing state declarations ...

  // Add data persistence hook
  const { loadAllData, createBackup, restoreFromBackup, saveAll } = useDataPersistence({
    deliveryAreas, setDeliveryAreas,
    globalTimeslots, setGlobalTimeslots,
    expressTimeslots, setExpressTimeslots,
    expressTimeslotAssignments, setExpressTimeslotAssignments,
    dayAssignments, setDayAssignments,
    blockedDates, setBlockedDates,
    blockedTimeslots, setBlockedTimeslots,
    globalAdvanceOrderRules, setGlobalAdvanceOrderRules,
    productAdvanceOrderRules, setProductAdvanceOrderRules,
    locations, setLocations
  });

  // ... rest of your component ...
}
```

#### Option B: Environment Configuration

Create `apps/admin-dashboard/.env`:

```bash
# For local development
VITE_API_URL=http://localhost:3001

# For production (update with your deployed API URL)
# VITE_API_URL=https://your-api.up.railway.app
```

---

## 📊 Data Storage Structure

All configuration data is automatically saved to JSON files:

```
apps/api/data/
├── deliveryAreas.json          # Delivery zones and fees
├── globalTimeslots.json        # Standard delivery timeslots  
├── expressTimeslots.json       # Express delivery options
├── expressTimeslotAssignments.json  # Express day assignments
├── dayAssignments.json         # Global timeslot day assignments
├── blockedDates.json           # Blocked delivery dates
├── blockedTimeslots.json       # Blocked specific timeslots
├── globalAdvanceOrderRules.json     # Global advance booking rules
├── productAdvanceOrderRules.json    # Product-specific rules
├── locations.json              # Collection locations
├── textCustomizations.json     # UI text customizations
├── settings.json               # App settings and metadata
└── backups/                    # Automatic backups
    ├── backup-2024-12-12T22-30-00-000Z.json
    └── backup-2024-12-13T10-15-30-000Z.json
```

---

## 🔄 How It Works

### Automatic Sync
- **Load on Start**: Data loads automatically when admin panel opens
- **Auto-Save**: Changes save automatically when you modify settings
- **Real-time**: Every edit is immediately persisted to the backend

### Manual Operations
```typescript
// Force reload all data
await loadAllData();

// Create backup
const backupFile = await createBackup();

// Restore from backup
await restoreFromBackup(backupFile);

// Save all data manually
await saveAll();
```

---

## 🛡️ Backup & Recovery

### Automatic Backups
- Created before major operations
- Timestamped files in `data/backups/`
- Include complete configuration snapshot

### Manual Backup
```bash
# API endpoint
POST /api/backup/create

# Response
{
  "success": true,
  "message": "Backup created successfully",
  "backupFile": "/path/to/backup-2024-12-12T22-30-00-000Z.json"
}
```

### Restore Process
```bash
# API endpoint  
POST /api/backup/restore
{
  "backupFile": "/path/to/backup-file.json"
}
```

---

## 🚀 Deployment Persistence

### Option 1: File-Based (Current Setup)
**Pros**: Simple, no external dependencies
**Cons**: Data lost if container/server is destroyed

### Option 2: External Database (Upgrade Path)
For production, consider migrating to:
- **PostgreSQL** on Railway/Render
- **MongoDB Atlas** 
- **Supabase**
- **PlanetScale**

---

## 🔧 Environment Configuration

### Local Development
```bash
# apps/admin-dashboard/.env
VITE_API_URL=http://localhost:3001
```

### Production Deployment
```bash
# Update after deploying API server
VITE_API_URL=https://your-api.up.railway.app
```

### Railway/Render Environment Variables
```bash
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://your-admin.netlify.app,https://your-store.myshopify.com
```

---

## 📋 Deployment Checklist

### Before Deployment
- [ ] ✅ API server database module implemented
- [ ] ✅ API endpoints added and tested
- [ ] ✅ Frontend persistence hook created
- [ ] ⚠️ Admin dashboard integrated with persistence hook
- [ ] ⚠️ Environment variables configured

### After Deployment
- [ ] Update `VITE_API_URL` in admin dashboard env
- [ ] Verify data loads correctly
- [ ] Test save/load functionality
- [ ] Create initial backup
- [ ] Verify cross-deployment persistence

---

## 🧪 Testing Data Persistence

### Test Scenarios
1. **Configuration Survival**: Make changes → Deploy → Verify settings preserved
2. **Backup/Restore**: Create settings → Backup → Reset → Restore → Verify
3. **Auto-sync**: Change setting → Check API → Verify saved
4. **Load on Start**: Refresh admin panel → Verify data loads

### API Testing
```bash
# Test data load
curl https://your-api.up.railway.app/api/data/all

# Test specific endpoint
curl https://your-api.up.railway.app/api/delivery-areas

# Health check
curl https://your-api.up.railway.app/health
```

---

## 🚨 Troubleshooting

### Common Issues

**Data Not Loading**
- Check API URL in environment variables
- Verify API server is running
- Check browser console for CORS errors

**Changes Not Saving**
- Check network tab for API call failures
- Verify API endpoints are working
- Check server logs for errors

**CORS Issues**
- Add your admin dashboard domain to `ALLOWED_ORIGINS`
- Check API server CORS configuration

### Debug Commands
```bash
# Check API server
curl https://your-api.up.railway.app/health

# Check data endpoints
curl https://your-api.up.railway.app/api/data/all

# View server logs (Railway)
railway logs --follow

# View server logs (Render)
# Check logs in Render dashboard
```

---

## ✨ Features

### ✅ Implemented
- Complete data persistence for all configuration
- Automatic save on any change
- Backup and restore functionality
- Environment-based API configuration
- File-based JSON storage
- CRUD API endpoints for all data types

### 🔮 Future Enhancements
- Real-time collaboration between admin users
- Data versioning and change history
- Automated daily backups
- Database migration utilities
- Multi-environment configuration management

---

## 📞 Support

If data persistence isn't working:
1. Check API server health endpoint
2. Verify environment variables
3. Check browser network tab for API calls
4. Review server logs for errors
5. Test with backup/restore functionality

**Result**: Your delivery scheduler configuration will survive all deployments! 🎉 