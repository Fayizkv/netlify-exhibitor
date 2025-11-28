# Event Website Data Synchronization Fix

## Problem

When updating either the Layout Contents or Menu Settings pages, the changes from the other page were being overwritten because each page was only sending its own specific data fields to the API, causing data loss.

## Solution

Implemented a comprehensive data synchronization system that ensures both pages preserve each other's data when updating.

### Key Changes

#### 1. Created Event Website Utilities (`src/utils/eventWebsiteUtils.js`)

- `mergeLayoutContentData()`: Merges layout content with existing menu data
- `mergeMenuSettingsData()`: Merges menu settings with existing layout data
- `validateEventWebsiteData()`: Validates data structure
- `logEventWebsiteOperation()`: Provides consistent logging

#### 2. Updated LayoutContents Component (`src/components/project/pages/layoutContents/index.jsx`)

- **Import**: Added utility functions and GetAccessToken import
- **Data Merging**: Uses `mergeLayoutContentData()` to preserve existing menu data
- **API Call**: Fixed to use direct `fetch` with JSON instead of FormData for complex objects
- **Logging**: Added comprehensive logging for debugging
- **Event System**: Dispatches `layoutUpdated` events when saving
- **Event Listening**: Listens for `menuUpdated` events to refresh data

#### 3. Updated MenuSettings Component (`src/components/project/pages/menuSettings/index.jsx`)

- **Import**: Added utility functions import
- **Data Merging**: Uses `mergeMenuSettingsData()` to preserve existing layout data
- **Logging**: Enhanced existing logging system
- **Event System**: Dispatches `menuUpdated` events when saving
- **Event Listening**: Listens for `layoutUpdated` events to refresh data

### Data Flow

#### Before (Problematic)

```
LayoutContents Save: { title, subtitle, button, modules, event }
MenuSettings Save: { menus, modules }
```

**Result**: Each save overwrites the other's data

#### After (Fixed)

```
LayoutContents Save: { title, subtitle, button, modules, event, menus (preserved) }
MenuSettings Save: { title (preserved), subtitle (preserved), button (preserved), menus, modules, event (preserved) }
```

**Result**: Both pages preserve each other's data

### API Call Fix

**Critical Issue Resolved**: The original `putData` function was converting complex nested objects to FormData, which doesn't work properly with arrays and nested objects.

**Solution**:

- LayoutContents now uses direct `fetch` with `JSON.stringify()` for UPDATE operations
- MenuSettings already used this approach correctly
- Both components now send properly formatted JSON data

### Event System

- **`layoutUpdated`**: Dispatched when LayoutContents saves successfully
- **`menuUpdated`**: Dispatched when MenuSettings saves successfully
- Both components listen for the other's events and refresh their data accordingly

### Logging

All operations are logged with consistent prefixes:

- `[LayoutContents]`: Layout content operations
- `[MenuSettings]`: Menu settings operations
- `[EventWebsiteUtils]`: Utility function operations

### Testing Instructions

To verify the fix works:

1. **Test Layout Contents First**:
   - Go to Layout Contents page
   - Enable/disable some modules (e.g., enable "Overview", disable "Speakers")
   - Save changes
   - Check browser console for success logs

2. **Test Menu Settings**:
   - Switch to Menu Settings page
   - Add/remove menu items or change their order
   - Save changes
   - Check browser console for success logs

3. **Verify Data Preservation**:
   - Switch back to Layout Contents page
   - Verify that your module changes are still there
   - Check that menu items reflect your Menu Settings changes

4. **Test Reverse Flow**:
   - Make changes in Menu Settings
   - Save
   - Make changes in Layout Contents
   - Save
   - Verify both sets of changes are preserved

### Expected Console Output

```
[LayoutContents] Starting save process for event: [eventId]
[EventWebsiteUtils] Merging layout content data
[EventWebsiteUtils] Parsed modules from string: 13 modules
[EventWebsiteUtils] Merged payload: {...}
[LayoutContents] API response received: 200
[LayoutContents] Updated eventWebsite data: {...}
```

### Benefits

- ✅ No data loss between page updates
- ✅ Consistent data structure
- ✅ Comprehensive logging for debugging
- ✅ Real-time data synchronization
- ✅ Maintains existing functionality
- ✅ Backward compatible
- ✅ Proper JSON API calls for complex data

### Files Modified

- `src/utils/eventWebsiteUtils.js` (new)
- `src/components/project/pages/layoutContents/index.jsx`
- `src/components/project/pages/menuSettings/index.jsx`

### Troubleshooting

If you encounter issues:

1. Check browser console for detailed logs
2. Verify that both components are using the same eventWebsite ID
3. Ensure the API endpoint is accessible
4. Check that the access token is valid
