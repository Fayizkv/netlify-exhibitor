import React from "react";
import { COMPARE_TYPES } from "../../../../../core/functions/conditions";
import CustomTooltip from "../../../../../core/tooltip";
import { getBlobData } from "../../../../../../backend/api";

export const paymentHistoryAttributes = [
  // ========================================
  // SECTION: User Information
  // Always visible - Core user identification
  // ========================================
  {
    type: "text",
    placeholder: "User",
    name: "userName",
    tag: true,
    label: "User",
    required: true,
    view: true,
    add: true,
    update: true,
    filter: true,
    export: true,
    icon: "user",
    sort: true,
    customClass: "half",
    image: { field: "keyImage", collection: "authentication", generateTextIcon: true },
    render: (value, data, attribute) => {
      const userName = data?.userName || data?.authentication?.fullName || "N/A";
      const authentication = data?.userDetails;
      // Get mobile number with country code
      let mobileNumber = "";
      if (authentication?.authenticationId) {
        const authId = authentication.authenticationId;
        if (typeof authId === "object" && authId.country && authId.number) {
          mobileNumber = `+${authId.country} ${authId.number}`;
        } else if (authentication) {
          const authId = `+${authentication.phoneCode} ${authentication.authenticationId}`;
          mobileNumber = authId;
        }
      }

      // Get email
      const email = authentication?.emailId || "";

      return (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-text-main">{userName}</div>
          {mobileNumber && <div className="text-sm text-text-sub">{mobileNumber}</div>}
          {email && <div className="text-sm text-text-soft">{email}</div>}
        </div>
      );
    },
  },
  // ========================================
  // SECTION: Ticket Information (Only for Multiple Registration Type)
  // Disabled when registrationType is NOT "Multiple"
  // ========================================
  {
    type: "select",
    apiType: "API",
    selectApi: "ticket/select/all/Ticket",
    placeholder: "Ticket",
    name: "ticket",
    showItem: "title",
    tag: true,
    label: "Ticket",
    required: true,
    view: true,
    add: true,
    update: true,
    filter: true,
    export: true,
    icon: "ticket",
    sort: true,
    customClass: "half",
    parentCondition: {
      item: "registrationType",
      if: "Single",
      then: "enabled",
      else: "disabled",
    },
    footnote: "Ticket purchased by the user",
  },

  // ========================================
  // SECTION: Form Information (Only for Non-Multiple Registration Type)
  // Disabled when registrationType is "Multiple"
  // ========================================
  {
    type: "text",
    apiType: "API",
    selectApi: "custom-form/select",
    placeholder: "Form",
    name: "customForm",
    showItem: "title",
    tag: false,
    label: "Registration Form",
    required: false,
    view: false,
    add: false,
    update: false,
    filter: true,
    export: true,
    icon: "form",
    sort: true,
    customClass: "half",
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "disabled",
      else: "enabled",
    },
    footnote: "Form used for registration",
  },

  // ========================================
  // SECTION: Event Information
  // Always visible - Hidden field for backend reference
  // ========================================
  {
    type: "hidden",
    placeholder: "Event",
    name: "event",
    collection: "event",
    showItem: "title",
    tag: false,
    label: "Event",
    required: true,
    view: false,
    add: true,
    update: true,
    filter: true,
    export: true,
    icon: "event",
  },

  // ========================================
  // SECTION: Payment Gateway Information (Only for Multiple Registration Type)
  // Hidden when registrationType is NOT "Multiple"
  // ========================================
  {
    type: "text",
    placeholder: "Razorpay Payment Id",
    name: "razorpayPaymentId",
    tag: false,
    label: "Razorpay Payment Id",
    required: false,
    view: false,
    add: false,
    update: true,
    filter: true,
    export: true,
    icon: "payment",
    sort: true,
    customClass: "half",
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "enabled",
      else: "disabled",
    },
    footnote: "Unique payment identifier from Razorpay",
  },
  {
    type: "text",
    placeholder: "Razorpay Order Id",
    name: "razorpayOrderId",
    tag: false,
    label: "Razorpay Order Id",
    required: false,
    view: false,
    add: false,
    update: false,
    filter: true,
    export: true,
    icon: "payment",
    sort: true,
    customClass: "half",
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "enabled",
      else: "disabled",
    },
    footnote: "Order reference from Razorpay",
  },

  // ========================================
  // SECTION: Currency & Pricing
  // Always visible - Core payment information
  // ========================================
  {
    type: "text",
    placeholder: "Currency",
    name: "currency",
    tag: false,
    label: "Currency",
    required: true,
    view: false,
    add: true,
    update: true,
    filter: true,
    export: true,
    icon: "currency",
    customClass: "quarter",
  },
  {
    type: "number",
    placeholder: "Unit Price",
    name: "cartSummary",
    collection: "cartSummary",
    showItem: "unitPrice",
    tag: false,
    label: "Unit Price",
    required: true,
    view: true,
    add: false,
    update: true,
    icon: "price",
    export: true,
    sort: true,
    customClass: "quarter",
    displayFormat: "price",
    decimalPlaces: 2,
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "enabled",
      else: "disabled",
    },
    render: (value, data, attribute) => {
      const cartSummary = data.cartSummary;
      if (Array.isArray(cartSummary) && cartSummary.length > 0) {
        return cartSummary[0].unitPrice?.toString() || "0";
      }
      return "0";
    },
    footnote: "Price per ticket",
  },
  {
    type: "text",
    placeholder: "Price",
    name: "price",
    tag: true,
    label: "Price",
    required: false,
    view: true,
    add: false,
    update: false,
    filter: true,
    icon: "price",
    export: true,
    sort: true,
    customClass: "quarter",
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "enabled",
      else: "disabled",
    },
    render: (value, data, attribute) => {
      const currency = data?.currency || "";
      const cartSummary = data?.cartSummary || [];

      // Get discount and total from data
      const discountAmount = data?.discountAmount || 0;
      const totalAmount = data?.amount || 0;
      const formattedDiscount = discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedTotal = totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Create tooltip content with detailed breakdown
      const tooltipContent = (
        <div className="space-y-2">
          <div className="font-semibold text-sm border-b border-gray-200 pb-2">Items Purchased</div>
          {cartSummary.map((item, index) => {
            const quantity = item.quantity || 0;
            const price = item.unitPrice || 0;
            const title = item.ticketTitle || "Item";
            const subtotal = quantity * price;
            const formattedPrice = price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const formattedSubtotal = subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            return (
              <div key={index} className="text-xs space-y-1">
                <div className="font-medium">{title}</div>
                <div className="flex justify-between gap-4 text-gray-600">
                  <span>
                    {quantity} × {currency.toUpperCase()} {formattedPrice}
                  </span>
                  <span className="font-medium">
                    {currency.toUpperCase()} {formattedSubtotal}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Discount Row */}
          {discountAmount > 0 && (
            <div className="text-xs border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between gap-4 text-gray-600">
                <span className="font-medium">Discount</span>
                <span className="font-medium text-green-600">
                  - {currency.toUpperCase()} {formattedDiscount}
                </span>
              </div>
            </div>
          )}

          {/* Total Row */}
          <div className="text-xs border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-semibold text-gray-900">
                {currency.toUpperCase()} {formattedTotal}
              </span>
            </div>
          </div>
        </div>
      );

      // Summary display - format as "100MYR x 1" or multiple lines
      return (
        <CustomTooltip content={tooltipContent} variant="default" size="medium" place="left">
          <div className="text-sm cursor-help hover:text-primary-base transition-colors">
            <div className="flex flex-col gap-1">
              {cartSummary.map((item, index) => {
                const quantity = item.quantity || 0;
                const price = item.unitPrice || 0;
                const formattedPrice = price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                return (
                  <div key={index}>
                    {formattedPrice} {currency.toUpperCase()} ({quantity})
                  </div>
                );
              })}
            </div>
          </div>
        </CustomTooltip>
      );
    },
    footnote: "Price breakdown for checkout purchases",
  },

  // ========================================
  // SECTION: Quantity & Cart Details (Only for Multiple Registration Type)
  // Hidden when registrationType is NOT "Multiple"
  // ========================================
  {
    type: "text",
    placeholder: "Quantity",
    name: "cartSummary",
    collection: "cartSummary",
    showItem: "quantity",
    tag: false,
    label: "Quantity",
    required: true,
    view: true,
    add: true,
    update: true,
    icon: "quantity",
    export: true,
    sort: true,
    customClass: "quarter",
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "enabled",
      else: "disabled",
    },
    render: (value, data, attribute) => {
      const cartSummary = data.cartSummary;
      if (Array.isArray(cartSummary) && cartSummary.length > 0) {
        const totalQuantity = cartSummary.reduce((sum, item) => sum + (item.quantity || 0), 0);
        return totalQuantity.toString();
      }
      return "0";
    },
    footnote: "Total number of tickets purchased",
  },

  // ========================================
  // SECTION: Discount & Coupon Information (Only for Multiple Registration Type)
  // Hidden when registrationType is NOT "Multiple"
  // ========================================
  {
    type: "number",
    placeholder: "Discount Amount",
    name: "discountAmount",
    tag: true,
    label: "Discount",
    required: false,
    view: true,
    add: true,
    update: true,
    export: true,
    icon: "discount",
    sort: true,
    displayFormat: "price",
    decimalPlaces: 2,
    customClass: "third",
    footnote: "Discount applied to the order",
  },
  {
    type: "text",
    placeholder: "Coupon Code",
    name: "couponCode",
    tag: false,
    label: "Coupon Code",
    required: false,
    view: true,
    add: true,
    update: true,
    export: true,
    icon: "coupon",
    sort: true,
    customClass: "third",
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "enabled",
      else: "disabled",
    },
    footnote: "Coupon code used for discount",
  },
  {
    type: "text",
    placeholder: "Discount Percentage",
    name: "discountPercentage",
    tag: false,
    label: "Discount %",
    required: false,
    view: true,
    add: false,
    update: false,
    export: true,
    icon: "discount",
    sort: true,
    customClass: "third",
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "enabled",
      else: "disabled",
    },
    render: (value, data, attribute) => {
      const discountAmount = data?.discountAmount || 0;
      const amount = data?.amount || 0;
      if (amount > 0 && discountAmount > 0) {
        const percentage = ((discountAmount / (amount + discountAmount)) * 100).toFixed(2);
        return `${percentage}%`;
      }
      return "0%";
    },
    footnote: "Calculated discount percentage",
  },

  // ========================================
  // SECTION: Total Amount & Payment Status
  // Total Amount visible for Multiple registration type
  // ========================================
  {
    type: "number",
    placeholder: "Total Amount",
    name: "amount",
    tag: true,
    label: "Total Amount",
    required: true,
    view: true,
    add: true,
    update: true,
    export: true,
    icon: "price",
    sort: true,
    displayFormat: "price",
    decimalPlaces: 2,
    customClass: "half",
    render: (value, data, attribute) => {
      const currency = data?.currency || "";
      const amount = data?.amount || 0;

      return (
        <div className="text-sm font-semibold">
          {currency.toUpperCase()} {amount}
        </div>
      );
    },
    footnote: "Final amount paid by the user",
  },
  {
    type: "text",
    placeholder: "Status",
    name: "status",
    tag: true,
    label: "Payment Status",
    required: true,
    view: true,
    add: true,
    update: true,
    filter: true,
    filterType: "tabs",
    filterPosition: "right",
    export: true,
    icon: "status",
    sort: true,
    customClass: "half",
    render: (value, data, attribute) => {
      const status = data?.status?.toLowerCase() || "";

      // Status configuration
      const statusConfig = {
        captured: {
          label: "Paid",
          color: "bg-green-100 text-green-800",
          icon: "✓",
        },
        paid: {
          label: "Paid",
          color: "bg-green-100 text-green-800",
          icon: "✓",
        },
        pending: {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-800",
          icon: "⏱",
        },
        failed: {
          label: "Failed",
          color: "bg-red-100 text-red-800",
          icon: "✕",
        },
        refunded: {
          label: "Refunded",
          color: "bg-blue-100 text-blue-800",
          icon: "↻",
        },
        authorized: {
          label: "Paid",
          color: "bg-green-100 text-green-800",
          icon: "✓",
        },
      };

      const config = statusConfig[status] || {
        label: status || "Unknown",
        color: "bg-gray-100 text-gray-800",
        icon: "?",
      };

      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </div>
      );
    },
  },

  // ========================================
  // SECTION: Payment Method & Gateway (Only for Multiple Registration Type)
  // Hidden when registrationType is NOT "Multiple"
  // ========================================
  {
    type: "text",
    placeholder: "Payment Method",
    name: "paymentMethod",
    tag: false,
    label: "Payment Method",
    required: false,
    view: true,
    add: false,
    update: false,
    filter: true,
    export: true,
    icon: "payment",
    sort: true,
    customClass: "half",
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "enabled",
      else: "disabled",
    },
    footnote: "Payment method used (UPI, Card, Net Banking, etc.)",
  },
  {
    type: "text",
    placeholder: "Payment Gateway",
    name: "paymentGateway",
    tag: false,
    label: "Payment Gateway",
    required: false,
    view: true,
    add: false,
    update: false,
    filter: true,
    export: true,
    icon: "payment",
    customClass: "half",
    parentCondition: {
      item: "registrationType",
      if: "Multiple",
      then: "enabled",
      else: "disabled",
    },
    footnote: "Payment gateway provider",
  },

  // ========================================
  // SECTION: Transaction Timestamps
  // Always visible - Audit trail
  // ========================================
  {
    type: "datetime",
    placeholder: "Transaction Date",
    name: "createdAt",
    tag: true,
    label: "Transaction Date",
    required: false,
    view: true,
    add: false,
    update: false,
    filter: true,
    export: true,
    icon: "date",
    sort: true,
    customClass: "third",
    split: true,
  },
  {
    type: "datetime",
    placeholder: "Created At",
    name: "createdAt",
    tag: false,
    label: "Created At",
    required: false,
    view: true,
    add: false,
    update: false,
    filter: true,
    export: true,
    icon: "date",
    sort: true,
    customClass: "third",
    split: true,
  },
  {
    type: "datetime",
    placeholder: "Updated At",
    name: "updatedAt",
    tag: false,
    label: "Updated At",
    required: false,
    view: true,
    add: false,
    update: false,
    export: true,
    icon: "date",
    sort: true,
    customClass: "third",
    split: true,
  },

  // ========================================
  // SECTION: Additional Information
  // Always visible - Extra metadata
  // ========================================
  {
    type: "textarea",
    placeholder: "Transaction Notes",
    name: "notes",
    tag: false,
    label: "Notes",
    required: false,
    view: true,
    add: false,
    update: true,
    export: true,
    icon: "note",
    rows: 3,
    customClass: "full",
    footnote: "Add any additional notes about this transaction",
  },
  {
    type: "text",
    placeholder: "IP Address",
    name: "ipAddress",
    tag: false,
    label: "IP Address",
    required: false,
    view: true,
    add: false,
    update: false,
    export: true,
    icon: "network",
    customClass: "half",
    footnote: "User's IP address during transaction",
  },
  {
    type: "text",
    placeholder: "User Agent",
    name: "userAgent",
    tag: false,
    label: "Device/Browser",
    required: false,
    view: true,
    add: false,
    update: false,
    export: true,
    icon: "device",
    customClass: "half",
    footnote: "Device or browser used for transaction",
  },
];

// ========================================
// HELPER FUNCTION: Fetch Invoice PDF
// ========================================
export const fetchInvoicePdf = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Use the centralized getBlobData API method
    const response = await getBlobData({}, `orders/${orderId}/invoice`);

    if (response.status !== 200 || !response.data) {
      throw new Error(response.error || "Failed to fetch invoice");
    }

    // Convert blob to object URL for PDF preview
    const url = URL.createObjectURL(response.data);
    return url;
  } catch (error) {
    console.error("Error fetching invoice PDF:", error);
    throw error;
  }
};

// ========================================
// HELPER FUNCTION: Create Actions for Payment History
// ========================================
export const createPaymentHistoryActions = (setShowPDFPreview, setPdfData, setMessage) => {
  return [
    {
      element: "button",
      type: "callback",
      callback: async (item, data) => {
        try {
          const pdfUrl = await fetchInvoicePdf(data._id);
          setPdfData({
            url: pdfUrl,
            title: `Invoice - ${data?.userName || "Order"}`,
          });
          setShowPDFPreview(true);
        } catch (error) {
          console.error("Error fetching invoice:", error);
          setMessage({
            type: 1,
            content: "Failed to fetch invoice. Please try again.",
            icon: "error",
            title: "Error",
          });
        }
      },
      icon: "download",
      title: "Download Invoice",
      condition: {
        item: "hasInvoice",
        if: true,
        then: true,
        else: false,
      },
      params: {
        itemTitle: { name: "userName", type: "text", collection: "" },
        shortName: "Download Invoice",
        addPrivilege: false,
        delPrivilege: false,
        updatePrivilege: false,
        customClass: "medium",
      },
    },
  ];
};
