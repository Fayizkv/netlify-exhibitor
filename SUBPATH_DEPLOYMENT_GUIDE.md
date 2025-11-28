# Subpath Deployment Guide for /exhibitor

## Overview
This project is configured to run at the `/exhibitor` subpath (e.g., `testing.eventhex.ai/exhibitor`).

## What Was Fixed

### Problem
The app was configured with:
- **Router basename**: `/exhibitor` ✓ (correct)
- **Vite base**: `/` ❌ (incorrect)

This mismatch caused asset files to be referenced from the root (`/assets/*`) instead of the subpath (`/exhibitor/assets/*`), resulting in 404 errors.

### Solution
Updated `vite.config.js` to use the correct base path:
```javascript
base: process.env.NODE_ENV === 'production' ? '/exhibitor/' : '/'
```

This ensures:
- **Production builds**: Assets referenced as `/exhibitor/assets/*`
- **Development**: Assets referenced as `/assets/*` (works on localhost)

## Deployment Steps

### 1. Build for Production
```bash
npm run build
```

This creates a `build/` directory with all assets properly prefixed with `/exhibitor/`.

### 2. AWS App Runner Configuration

#### Option A: Deploy to /exhibitor subdirectory
Upload the `build/` folder contents to your server under the `/exhibitor` path.

**Directory structure on server:**
```
/
├── exhibitor/
│   ├── index.html
│   ├── assets/
│   │   ├── index-xxx.js
│   │   ├── vendor-xxx.js
│   │   └── index-xxx.css
│   └── ...other files
```

#### Option B: Configure reverse proxy
If deploying the build folder at root, configure your reverse proxy (nginx/ALB) to serve it at `/exhibitor`:

**Nginx example:**
```nginx
location /exhibitor/ {
    alias /path/to/build/;
    try_files $uri $uri/ /exhibitor/index.html;
}
```

### 3. Verify Deployment

After deployment, check:
1. ✓ App loads at `https://your-domain/exhibitor`
2. ✓ Assets load from `https://your-domain/exhibitor/assets/*`
3. ✓ Routing works (navigate between pages)
4. ✓ Browser console shows no 404 errors

## Testing Locally

To test the production build locally with the `/exhibitor` path:

```bash
# Build the app
npm run build

# Serve with a static server
npx serve -s build -l 3000

# Access at: http://localhost:3000/exhibitor
```

## Configuration Files

### Key Files for Subpath Configuration:

1. **vite.config.js** - Build-time asset path configuration
   ```javascript
   base: process.env.NODE_ENV === 'production' ? '/exhibitor/' : '/'
   ```

2. **src/components/router/index.jsx** - Runtime router configuration
   ```javascript
   <BrowserRouter basename="/exhibitor">
   ```

3. **staticwebapp.config.json** - Server routing configuration
   - Ensures SPA routing works correctly
   - Redirects all routes to index.html

## Troubleshooting

### Assets still returning 404?
1. Verify build output - check `build/index.html` contains `/exhibitor/assets/*` references
2. Check server directory structure - files should be under `/exhibitor/`
3. Clear browser cache and hard reload (Cmd+Shift+R / Ctrl+Shift+R)

### Routing doesn't work (404 on page refresh)?
Configure your server to serve `index.html` for all routes under `/exhibitor/*`

### Works on direct URL but not as subpath?
Ensure both `vite.config.js` base and `BrowserRouter` basename match exactly: `/exhibitor/`

## Environment Variables

Make sure to set the correct environment variable before building:

```bash
NODE_ENV=production npm run build
```

Or in your CI/CD pipeline, ensure `NODE_ENV=production` is set.

## Notes

- **Trailing slash matters**: Use `/exhibitor/` consistently (with trailing slash)
- **Local development**: Uses base `/` for convenience (no subpath)
- **Router basename**: Must match Vite base path exactly
- **AWS App Runner**: May need additional configuration for static assets serving
