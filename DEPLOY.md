# 🚀 Deployment Guide

## Quick Deploy (5 minutes)

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Deploy Frontend (Netlify)
- Go to [netlify.com](https://netlify.com)
- Drag `frontend/build` folder to deploy area
- Get live URL instantly

### 3. Deploy Backend (Render)
- Go to [render.com](https://render.com)
- Connect GitHub repository
- Configure:
  ```
  Build Command: cd backend && npm install
  Start Command: cd backend && npm start
  ```
- Add environment variables:
  ```
  NODE_ENV=production
  MONGODB_URI=<render-provides-this>
  FRONTEND_URL=<your-netlify-url>
  ```

### 4. Update Frontend API URL
In Netlify, add environment variable:
```
REACT_APP_API_URL=<your-render-backend-url>
```

## Result
- **Frontend**: https://your-app.netlify.app
- **Backend**: https://your-backend.onrender.com
- **Full working application** with live database

## Test Features
- ✅ View events
- ✅ Use Demo Login
- ✅ Access dashboard
- ✅ Import events
- ✅ Email collection