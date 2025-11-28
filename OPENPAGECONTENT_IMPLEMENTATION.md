# OpenPageContent Implementation Guide

## Overview
The `openPageContent` prop allows you to render custom content within the "Details" tab of the popup view when an item is opened in the ListItems component.

---

## Complete Flow Diagram

```
ListItems.jsx (props.openPageContent)
    ↓
    └─→ Popup Component (editData.openPageContent)
         ↓
         └─→ tabHandler() function
              └─→ Adds to content object for "details" tab
                   ├─ openPageContent: editData?.openPageContent
                   └─ type: "details"
                      ↓
                      └─→ Tabs Component
                           └─→ renderPage(tab, editData)
                                └─→ case "details":
                                     └─→ Checks content.openPageContent
                                          └─→ Renders custom content
```

---

## Step-by-Step Implementation

### 1. **In ListItems.jsx** (Line 205 as prop)
The component receives `openPageContent` as a prop:
```jsx
ListItems = React.memo(({
  // ... other props
  openPageContent = null,  // Function that receives data and returns JSX
  // ... other props
})
```

### 2. **Passed to Popup Component** (Line 2607)
When rendering the Popup, `openPageContent` is passed in the `editData` object:
```jsx
<Popup
  editData={{
    // ... other editData props
    openPageContent: openPageContent,  // ← Passed here
  }}
  // ... other props
/>
```

### 3. **In Popup Component** (popup/index.jsx)
The Popup receives editData and passes `openPageContent` to the content object:

**Line 274 - tabHandler() function:**
```jsx
content: { 
  openTheme, 
  titleValue, 
  updatePrivilege, 
  isEditingHandler, 
  udpateView, 
  formMode, 
  parentData, 
  openPageContent: editData?.openPageContent  // ← Now available
}
```

### 4. **In Tabs Component** (tab/index.jsx)
The Tabs component renders based on the tab type. For "details" tab (Line 668-692):

```jsx
case "details":
  return (
    <TabContainer className="tab">
      {content.openPageContent ? (
        // Render custom content if provided
        content.openPageContent(openData?.data, content)
      ) : (
        // Render default DisplayInformations
        <DisplayInformations {...props} />
      )}
    </TabContainer>
  );
```

---

## Usage Example

### In event/index.jsx (Line 2351-2353)

**Before:**
```jsx
openPageContent: (data) => {
  return <div>Hello</div>;
},
```

**After - Using OrderView Component:**
```jsx
import OrderView from "./attributes/paymentHistory/OrderView";

// In the action definition:
{
  element: "custom",
  type: "subList",
  id: "orders",
  title: "Orders",
  attributes: paymentHistory,
  params: {
    api: `orders/status`,
    // ... other params
    openPageContent: (data) => {
      return <OrderView data={data} />;
    },
  }
}
```

---

## Function Signature

```typescript
openPageContent?: (data: OrderData, content: ContentObject) => React.ReactNode
```

### Parameters:
- **data**: The full order/item object being viewed
  - Contains all fields from attributes (userName, amount, status, cartSummary, etc.)
  
- **content**: The content object passed through the tab system
  - Contains: `openTheme`, `titleValue`, `updatePrivilege`, `isEditingHandler`, `udpateView`, `formMode`, `parentData`, `openPageContent`

### Returns:
- React JSX component to render in the details tab

---

## OrderView Component Features

The `OrderView.jsx` component displays:

### Sections:
1. **Header** - Order ID and Payment Status badge
2. **Left Column** - Customer information and timeline
3. **Middle Column** - Payment summary and coupon details
4. **Right Column** - Payment method and items breakdown
5. **Footer** - Order ID and security badge

### Key Features:
- ✅ Responsive 3-column grid layout
- ✅ Color-coded status badges (Paid, Pending, Failed, Refunded)
- ✅ Currency formatting with locale support
- ✅ Date/time formatting
- ✅ Cart items breakdown with quantity and pricing
- ✅ Discount and coupon information
- ✅ Payment gateway and method details
- ✅ Additional info section (notes, IP, user agent)
- ✅ Uses design system colors (Tailwind theme)

---

## Data Flow Details

### When Item is Clicked:
```
User clicks order item
  ↓
TableRowWithActions onClick handler
  ↓
setOpenData() - Sets current item data
  ↓
setIsOpen(true) - Opens popup
  ↓
<Popup openData={openData} ... />
  ↓
tabHandler() processes actions and creates tabs
  ↓
For "details" type tab, adds openPageContent to content object
  ↓
Tabs component renders and calls renderPage()
  ↓
renderPage() checks if content.openPageContent exists
  ↓
YES: Calls content.openPageContent(openData?.data, content)
  ↓
OrderView renders with the order data
```

---

## Integration Checklist

- [x] Create OrderView component (OrderView.jsx)
- [x] Import OrderView in event/index.jsx
- [x] Update Popup component to pass openPageContent (popup/index.jsx line 274)
- [x] Update Tabs component to render openPageContent (tab/index.jsx line 672)
- [x] Update event/index.jsx to use OrderView in openPageContent function
- [x] Design system colors used throughout
- [x] Responsive layout for all screen sizes

---

## Customization

### To use custom content for a different feature:

```jsx
// Define your custom component
const MyCustomView = ({ data }) => {
  return (
    <div className="p-6">
      {/* Your custom content */}
    </div>
  );
};

// Use in ListTable
<ListTable
  // ... props
  openPageContent={(data) => <MyCustomView data={data} />}
/>
```

### Or directly in the action definition:
```jsx
openPageContent: (data, content) => {
  return (
    <div className="space-y-6 p-6">
      <h1>Custom Content for {data.title}</h1>
      {/* Your JSX */}
    </div>
  );
}
```

---

## Files Modified

1. **src/components/core/list/popup/index.jsx** (Line 274)
   - Added: `openPageContent: editData?.openPageContent` to content object

2. **src/components/core/tab/index.jsx** (Line 668-691)
   - Updated: "details" case to check and render `content.openPageContent`

3. **src/components/project/pages/event/index.jsx** (Line 2351-2353)
   - Imported: OrderView component
   - Updated: openPageContent to use OrderView

4. **src/components/project/pages/event/attributes/paymentHistory/OrderView.jsx** (NEW)
   - Created: Beautiful order view component

---

## Troubleshooting

### openPageContent not rendering?
1. ✓ Check Popup component receives editData.openPageContent
2. ✓ Verify tabHandler adds it to content object
3. ✓ Check Tabs component case "details" uses content.openPageContent
4. ✓ Ensure function is being called with data parameter

### Data not passed correctly?
1. ✓ Verify openData?.data contains the correct order data
2. ✓ Check attribute field names match data structure
3. ✓ Use optional chaining for nested objects

### Styling issues?
1. ✓ All classes use design system (bg-bg-*, text-text-*, etc.)
2. ✓ No hardcoded colors - use Tailwind theme
3. ✓ Mobile-first responsive design implemented

