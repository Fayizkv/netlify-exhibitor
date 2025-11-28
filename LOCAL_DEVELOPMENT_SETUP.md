# Local Development Setup for Event Clone

## 🔧 Environment Configuration

For local development, you need to update the API URL to point to your local backend.

### Option 1: Temporary .env Modification (Recommended)

**Temporarily modify `.env` file:**

```bash
# Change this line in .env:
VITE_API=https://app-api.eventhex.ai/api/v1/

# To this for local development:
VITE_API=http://localhost:3001/api/v1/
```

**⚠️ Important:** Remember to revert this change before committing to git!

### Option 2: Create .env.local (Alternative)

Create a `.env.local` file (this file is gitignored):

```bash
# .env.local
VITE_API=http://localhost:3001/api/v1/
```

## 🚀 Running the Application

1. **Start Backend Server:**
   ```bash
   cd eventhex-saas-api
   npm start
   # Should show: "server running on port 3001"
   ```

2. **Start Frontend Server:**
   ```bash
   cd eventhex-saas-cms
   npm run dev
   # Make sure to restart after changing .env
   ```

3. **Test Clone Functionality:**
   - Go to Events page
   - Click the three-dot menu (⋮) on any event
   - Click "Clone Event"
   - Confirm the action
   - Should see success message

## 🧪 Verification

1. **Check Network Tab:**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Click Clone Event
   - Should see API call to `http://localhost:3001/api/v1/event/clone`

2. **Expected Responses:**
   - ✅ `201 Created` = Clone successful
   - ✅ `401 Unauthorized` = Backend running, needs auth
   - ❌ `404 Not Found` = Wrong URL or backend not running
   - ❌ `Connection refused` = Backend not running

## 🔄 Reverting Changes

Before committing, revert the .env change:

```bash
# Revert .env back to:
VITE_API=https://app-api.eventhex.ai/api/v1/
```

Or delete the `.env.local` file if you used that approach.

## 📋 Clone Implementation Details

The clone functionality is now properly integrated using the application's patterns:

- ✅ **Three-dot menu**: Clone appears in the dropdown menu
- ✅ **Message component**: Uses `setMessage` prop correctly
- ✅ **API calls**: Uses existing `postData` function
- ✅ **Loading states**: Uses `setLoaderBox` prop
- ✅ **Confirmation**: Uses application's confirmation dialog
- ✅ **Error handling**: Proper error messages and handling
- ✅ **Success handling**: Shows success message and refreshes list

The clone button will appear in the three-dot menu (⋮) alongside other actions like Edit and Delete.