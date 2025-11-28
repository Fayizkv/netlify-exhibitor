# Timezone System Setup Guide

## Issues Fixed

✅ **Redux Store Access**: Now uses proper React hooks instead of global window access  
✅ **Current Time Display**: Live updating current time in event timezone  
✅ **Generic Implementation**: Works with any item that has a `timezone` property  
✅ **UTC Issue**: Fixed timezone formatting to properly show selected timezone

## Step 1: Add Timezone Reducer to Redux

In your main Redux store file (typically `src/store/index.jsx`):

```javascript
import { combineReducers } from "redux";
import timezoneReducer from "./reducers/timezone";

const rootReducer = combineReducers({
  // ...your existing reducers
  timezone: timezoneReducer,
  // ...other reducers
});
```

## Step 2: Setup Global Store Access (Optional but Recommended)

In your main app file or store setup:

```javascript
import { setupGlobalStore } from "./utils/setupReduxStore";
import { store } from "./store";

// After creating your store
setupGlobalStore(store);
```

## Step 3: The ListItem Component is Already Updated

The `src/components/core/list/item.jsx` now automatically:

- Detects if `openData.data.timezone` exists
- Sets the timezone in Redux when item loads
- Clears timezone when leaving the page
- Works with ANY type of item (events, venues, etc.)

## Step 4: Use Enhanced Date Formatting

You now have multiple options for date formatting:

### Option A: Existing Functions (Auto-Enhanced)

```javascript
import { dateTimeFormat, dateFormat, timeFormat } from "../components/core/functions/date";

// These automatically use event timezone when active
dateTimeFormat("2024-12-15T09:00:00Z"); // Shows in event timezone
dateFormat("2024-12-15T09:00:00Z"); // Shows in event timezone
timeFormat("2024-12-15T09:00:00Z"); // Shows in event timezone
```

### Option B: Hook-Based Functions

```javascript
import { useCurrentTimezone, DateDisplay } from "../components/core/functions/date";

const MyComponent = () => {
  const { currentTimezone, isEventActive } = useCurrentTimezone();

  return (
    <div>
      {/* Component that automatically shows timezone-aware dates */}
      <DateDisplay date="2024-12-15T09:00:00Z" showTimezone={true} format="MMM DD, YYYY hh:mm A" />

      {/* Shows: Dec 15, 2024 02:30 PM (IST) [Event Time] if Asia/Kolkata is active */}
    </div>
  );
};
```

## Step 5: Timezone Indicators in Date Inputs

The date and time inputs automatically show timezone indicators - no additional components needed!

## Step 6: How It Works

Your date/time inputs automatically show timezone information:

```javascript
import { DateTimeInput, TimeInput } from '../components/core/input/date';

// These automatically show:
// - "Event Time" badge when event timezone is active
// - Current timezone name and offset
// - Blue text color when using event timezone
<DateTimeInput label="Meeting Time" />
<TimeInput label="Reminder Time" />
```

## Testing

1. **Load an item with timezone**: Create an item with `timezone: "Asia/Kolkata"`
2. **Check console**: Should see "openData?.data?.timezone Asia/Kolkata"
3. **Verify dates**: All dates should show in Kolkata time
4. **Check indicators**: Date inputs should show "Event Time" badge
5. **Test navigation**: Leave page, timezone should clear

## Troubleshooting

### Issue: UTC showing as Asia timezone

**Fixed**: Now properly uses the exact timezone from Redux state

### Issue: Current time not updating

**Fixed**: EventTimezoneIndicator now updates live every minute

### Issue: Redux state not accessible

**Fixed**: Using proper React hooks instead of global window access

### Issue: Generic implementation needed

**Fixed**: ListItem component works with any item type that has timezone property

## Example Item Data Structure

```javascript
// Event
{
  _id: "event123",
  title: "Mumbai Conference",
  timezone: "Asia/Kolkata",
  location: "Mumbai",
  startDate: "2024-12-15T09:00:00Z"
}

// Venue
{
  _id: "venue456",
  name: "NYC Convention Center",
  timezone: "America/New_York",
  city: "New York"
}

// Any item with timezone property will work!
```

Your timezone system is now robust, generic, and properly integrated! 🌍⏰
