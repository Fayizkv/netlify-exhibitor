# Invoice PDF Download Implementation

## Overview
Added a "Download Invoice" action button to the Orders/Payment History sections in the event management page. This allows users to download PDF invoices for orders.

## Files Modified

### 1. `src/components/project/pages/event/attributes/paymentHistory/index.jsx`

**Added Functions:**

#### `fetchInvoicePdf(orderId)`
- **Purpose:** Fetches the invoice PDF from the API endpoint
- **API Endpoint:** `localhost:8072/api/v1/orders/{id}/invoice`
- **Parameters:**
  - `orderId`: The ID of the order/registration
- **Returns:** A blob URL that can be used to display the PDF
- **Error Handling:** Catches and logs errors, throws on failure

```javascript
export const fetchInvoicePdf = async (orderId) => {
  // Fetches PDF buffer from API and converts to blob URL
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
// PDF Preview modal state for invoices
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

## User Flow

1. User navigates to Event → Orders or Cancelled Orders section
2. List of orders is displayed with order details
3. Each order row shows a "Download Invoice" button
4. Clicking the button:
   - Shows a loading state
   - Fetches the PDF from the API
   - Displays PDF in a modal preview window
   - Shows error message if fetch fails
5. User can view, scroll, and close the PDF preview

## API Integration

- **Endpoint:** `/api/v1/orders/{id}/invoice`
- **Method:** GET
- **Headers:**
  - `Authorization: Bearer {token}`
  - Token is automatically retrieved from localStorage
- **Response:** PDF buffer (blob)
- **Environment Variable:** `VITE_API` (defaults to `http://localhost:8072/api/v1`)

## Error Handling

- Token retrieval from localStorage (fallback to "AuthToken")
- HTTP error responses caught and displayed as toast notifications
- Console errors logged for debugging
- User sees friendly error message if invoice fetch fails

## Components Used

- **PDFPreview:** Core component from `src/components/core/pdfpreview/index.jsx`
  - Displays PDF in iframe within a modal
  - Handles PDF loading state
  - Provides close button
- **ListTable:** Existing component that renders the orders list
- **Toast/Message:** Existing notification system for error handling

## No Changes Required
- No changes to registrations/index.jsx
- All functionality isolated to event index and payment history attributes
- Follows existing architectural patterns in the codebase
