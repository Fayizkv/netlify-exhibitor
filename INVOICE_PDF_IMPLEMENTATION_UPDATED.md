# Invoice PDF Download Implementation - UPDATED

## Overview
Added a "Download Invoice" action button to the Orders/Payment History sections in the event management page. This allows users to download PDF invoices for orders using the centralized `getBlobData` API method.

## Files Modified

### 1. `src/components/project/pages/event/attributes/paymentHistory/index.jsx`

**Added Import:**
```javascript
import { getBlobData } from "../../../../../backend/api";
```

**Added Functions:**

#### `fetchInvoicePdf(orderId)`
- **Purpose:** Fetches the invoice PDF from the API endpoint using centralized API method
- **API Endpoint:** `localhost:8072/api/v1/orders/{id}/invoice`
- **Implementation:** Uses `getBlobData` instead of native fetch
- **Parameters:**
  - `orderId`: The ID of the order/registration
- **Returns:** A blob URL that can be used to display the PDF
- **Error Handling:** 
  - Validates orderId
  - Checks response status and data
  - Catches and logs errors
  - Throws on failure

```javascript
export const fetchInvoicePdf = async (orderId) => {
  const response = await getBlobData({}, `orders/${orderId}/invoice`);
  if (response.status !== 200 || !response.data) {
    throw new Error(response.error || "Failed to fetch invoice");
  }
  const url = URL.createObjectURL(response.data);
  return url;
}
```

#### `createPaymentHistoryActions(setShowPDFPreview, setPdfData, setMessage)`
- **Purpose:** Factory function that creates action buttons for the payment history list
- **Parameters:**
  - `setShowPDFPreview`: State setter to show/hide PDF modal
  - `setPdfData`: State setter for PDF data (URL and title)
  - `setMessage`: Function to show toast notifications
- **Returns:** Array of action objects compatible with ListTable
- **Action Details:**
  - Icon: "download"
  - Title: "Download Invoice"
  - Type: callback
  - Shows PDF preview on success, error message on failure

### 2. `src/components/project/pages/event/index.jsx`

**Added Imports:**
```javascript
import { paymentHistoryAttributes, createPaymentHistoryActions } from "./attributes/paymentHistory/index.jsx";
import PDFPreview from "../../../core/pdfpreview";
```

**Added State:**
```javascript
const [showPDFPreview, setShowPDFPreview] = useState(false);
const [pdfData, setPdfData] = useState({
  url: "",
  title: "Invoice Preview",
});
```

**Updated Orders Section:**
- Added `actions` property to the Orders section params
- Calls `createPaymentHistoryActions(setShowPDFPreview, setPdfData, props.setMessage)`

**Updated Cancelled Orders Section:**
- Added same `actions` property
- Enables invoice download for failed orders too

**Added PDF Preview Modal:**
```javascript
{showPDFPreview && (
  <PDFPreview
    closeModal={() => setShowPDFPreview(false)}
    title={pdfData.title}
    isUrl={true}
    url={pdfData.url}
  />
)}
```

## API Integration - Using Centralized getBlobData

The implementation now uses the existing `getBlobData` method from `src/backend/api/index.js`:

**Method Signature:**
```javascript
getBlobData(fields, url) => Promise<{ status, data: Blob, headers }>
```

**Advantages of using getBlobData:**
- ✅ Centralized API method (follows codebase pattern)
- ✅ Built-in token management
- ✅ Automatic 401 handling
- ✅ Consistent error handling
- ✅ Token update support
- ✅ Response type: arraybuffer (perfect for PDF)
- ✅ Blob creation already handled

**Method Details:**
- Sets `responseType: "arraybuffer"` for PDF data
- Converts arraybuffer to Blob with type "application/pdf"
- Returns blob for direct object URL creation
- Handles authorization headers automatically

## User Flow

1. User navigates to Event → Orders or Cancelled Orders section
2. List of orders is displayed with order details
3. Each order row shows a "Download Invoice" button
4. Clicking the button:
   - Calls `fetchInvoicePdf(orderId)` 
   - Uses `getBlobData` to fetch PDF
   - Converts arraybuffer response to Blob
   - Creates object URL for preview
   - Displays PDF in modal
   - Shows error if fetch fails
5. User can view, scroll, and close the PDF preview

## API Request Flow

```
1. User clicks "Download Invoice"
2. fetchInvoicePdf(orderId) called
3. getBlobData({}, `orders/{orderId}/invoice`)
4. Method:
   - Retrieves auth token from storage
   - Makes GET request with:
     - Accept: application/pdf
     - Authorization: Bearer {token}
     - responseType: arraybuffer
5. Response:
   - Status 200 with arraybuffer
   - Converted to Blob(PDF)
   - Object URL created
6. URL passed to PDFPreview modal
```

## Error Handling

- Validates orderId before API call
- Checks response status (must be 200)
- Validates response.data exists
- Uses response.error for error messages
- Console errors logged for debugging
- User sees friendly error message as toast notification
- 401 responses handled by getBlobData (auto logout)

## Components & Dependencies

- **getBlobData:** API method from `src/backend/api/index.js`
  - Returns arraybuffer converted to PDF Blob
  - Handles authentication automatically
- **PDFPreview:** Component from `src/components/core/pdfpreview/index.jsx`
  - Displays PDF in iframe within a modal
  - Handles PDF loading state
  - Provides close button
- **ListTable:** Existing component that renders the orders list
- **Toast/Message:** Existing notification system for error handling

## Benefits of This Implementation

1. **Follows Codebase Patterns:** Uses existing API methods
2. **Better Error Handling:** Centralized error handling for all API calls
3. **Consistent Authentication:** Token management handled by getBlobData
4. **PDF Optimization:** Uses arraybuffer + Blob for efficient PDF handling
5. **Maintainability:** Single point of change if API endpoint changes
6. **No Duplication:** Reuses existing utility methods

## Testing Checklist

- [ ] Orders section loads correctly
- [ ] "Download Invoice" button appears for each order
- [ ] Clicking button shows PDF preview modal
- [ ] PDF displays correctly in preview
- [ ] Can scroll and view full PDF
- [ ] Close button closes the modal
- [ ] Error message shows if API fails
- [ ] Works for both Orders and Cancelled Orders sections
- [ ] Token updates handled correctly
- [ ] 401 responses trigger logout
