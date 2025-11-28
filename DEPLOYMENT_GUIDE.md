# Deployment Guide - /exhibitor Subpath

This guide explains how to deploy the application to run at a subpath like `testing.eventhex.ai/exhibitor`.

## Configuration Summary

### 1. Vite Configuration (`vite.config.js`)
- **Development**: `base: "/"` - Works locally at `localhost:3000/exhibitor`
- **Production**: `base: "/exhibitor/"` - Assets will be referenced with `/exhibitor/` prefix

### 2. React Router Configuration
- Already configured with `basename="/exhibitor"` in `src/components/router/index.jsx`
- This handles client-side routing at `/exhibitor/*`

### 3. Server Configuration (`staticwebapp.config.json`)
- Configured to rewrite all routes to `/exhibitor/index.html` for SPA routing
- Static assets are excluded from rewriting

## Deployment Steps

### For Azure Static Web Apps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the build folder:**
   - The `build/` folder contains all the files
   - Deploy the **contents** of the `build/` folder to the `/exhibitor/` subdirectory on your server
   - Structure should be:
     ```
     server-root/
       exhibitor/
         index.html
         assets/
         static/
         ...
     ```

3. **Verify the deployment:**
   - Root path `/` should be blank or show nothing (as intended)
   - App should work at `testing.eventhex.ai/exhibitor`
   - All routes under `/exhibitor/*` should work correctly

### For Other Hosting Services

If you're using a different hosting service (Nginx, Apache, etc.), you'll need additional server configuration:

#### Nginx Example:
```nginx
location /exhibitor {
    alias /path/to/build;
    try_files $uri $uri/ /exhibitor/index.html;
}

location / {
    # Serve blank page or redirect
    return 200 "";
    add_header Content-Type text/html;
}
```

#### Apache Example (.htaccess):
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /exhibitor/
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /exhibitor/index.html [L]
</IfModule>
```

## Important Notes

1. **Build Output**: The build creates files in `build/` directory, but they should be deployed to `/exhibitor/` subdirectory on the server.

2. **Asset Paths**: With `base: "/exhibitor/"`, all assets (JS, CSS, images) will be referenced as `/exhibitor/assets/...`, so make sure the files are actually at that path on the server.

3. **Root Path**: The root `/` path will be blank (as intended). If you need a specific page at root, you can add it separately.

4. **Local Development**: 
   - Run `npm run dev` 
   - Access at `http://localhost:3000/exhibitor`
   - The base path is `/` in development for easier local testing

## Troubleshooting

### Issue: 404 errors on routes
- **Solution**: Ensure `staticwebapp.config.json` is in the root of your deployment
- Verify `navigationFallback.rewrite` points to `/exhibitor/index.html`

### Issue: Assets not loading (404 on JS/CSS files)
- **Solution**: Verify files are deployed to `/exhibitor/` subdirectory
- Check that `base: "/exhibitor/"` is set in production build

### Issue: Root path shows 404 instead of blank
- **Solution**: This is expected if no root index.html exists. The `public/index.html` file can serve as a blank page for root if needed.

