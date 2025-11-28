import React from "react";
import { COMPARE_TYPES } from "../../../../../core/functions/conditions";
import moment from "moment";
import { GetIcon } from "../../../../../../icons";
import QRCode from "react-qr-code";
import ReactDOM from "react-dom/client";
import Ticket from "./ticket";
import CustomTooltip from "../../../../../core/tooltip";

export const ticketAttributes = [
  {
    type: "hidden",
    apiType: "CSV",
    placeholder: "Type",
    name: "type",
    selectApi: "Form,Ticket",
    validation: "",
    default: "Ticket",
    label: "Type",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
    group: "Basic Ticket Information",
  },
  {
    type: "text",
    placeholder: "Early Bird,VIP Access..",
    name: "title",
    validation: "",
    default: "",
    label: "Ticket Name",
    required: true,
    view: true,
    add: true,
    update: true,
    tag: true,
    icon: "ticket",
    group: "Basic Ticket Information",
    description: { type: "text", field: "slug", collection: "" },
    compact: true,
    render: (value, rowData, attribute, props) => {
      const ticketSlug =
        rowData.slug ||
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

      // State to store the full URL for display
      const [fullUrl, setFullUrl] = React.useState(`/register/${ticketSlug}`);
      const [isLoading, setIsLoading] = React.useState(true);

      // Helper function to get cached domain from localStorage
      const getCachedEventDomain = (eventId) => {
        try {
          const key = `eventhex:domain:${eventId}`;
          return localStorage.getItem(key);
        } catch (e) {
          return null;
        }
      };

      // Function to get the full URL from localStorage
      const getFullUrl = () => {
        try {
          // Extract event ID from event object
          const eventId = typeof rowData.event === "object" ? rowData.event._id : rowData.event;
          const cachedDomain = getCachedEventDomain(eventId);

          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            const url = `${websiteUrl}/register/${ticketSlug}`;
            setFullUrl(url);
          } else {
            // Fallback to example.com if no cached domain
            setFullUrl(`https://example.com/register/${ticketSlug}`);
          }
          setIsLoading(false);
        } catch (error) {
          setFullUrl(`https://example.com/register/${ticketSlug}`);
          setIsLoading(false);
        }
      };

      // Load the full URL on component mount
      React.useEffect(() => {
        getFullUrl();
      }, []);

      const handleCopyUrl = (clickedButton) => {
        try {
          // Extract event ID from event object
          const eventId = typeof rowData.event === "object" ? rowData.event._id : rowData.event;
          const setMessage = props?.setMessage || window.setMessage || (() => {});
          const cachedDomain = getCachedEventDomain(eventId);

          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            const fullUrl = `${websiteUrl}/register/${ticketSlug}`;
            copyToClipboard(fullUrl, setMessage, clickedButton);
          } else {
            // Fallback to example.com if no cached domain
            copyToClipboard(`https://example.com/register/${ticketSlug}`, setMessage, clickedButton);
          }
        } catch (error) {
          const setMessage = props?.setMessage || window.setMessage || (() => {});
          copyToClipboard(`https://example.com/register/${ticketSlug}`, setMessage, clickedButton);
        }
      };

      const handleNavigateUrl = () => {
        try {
          // Extract event ID from event object
          const eventId = typeof rowData.event === "object" ? rowData.event._id : rowData.event;
          const cachedDomain = getCachedEventDomain(eventId);

          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            const fullUrl = `${websiteUrl}/register/${ticketSlug}`;
            window.open(fullUrl, "_blank");
          } else {
            // Fallback to example.com if no cached domain
            window.open(`https://example.com/register/${ticketSlug}`, "_blank");
          }
        } catch (error) {
          window.open(`https://example.com/register/${ticketSlug}`, "_blank");
        }
      };

      const copyToClipboard = (url, setMessage, clickedButton) => {
        navigator.clipboard
          .writeText(url)
          .then(() => {
            setMessage && setMessage({ type: 1, content: "URL copied to clipboard!", proceed: "Okay", icon: "success" });

            if (clickedButton) {
              const originalContent = clickedButton.innerHTML;
              const checkSvg =
                '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"/></svg>';
              clickedButton.innerHTML = checkSvg;
              clickedButton.style.color = "#16A34A";

              setTimeout(() => {
                clickedButton.innerHTML = originalContent;
                clickedButton.style.color = "";
              }, 2000);
            }
          })
          .catch((err) => {
            setMessage && setMessage({ type: 1, content: "Failed to copy URL to clipboard", proceed: "Okay", icon: "error" });
          });
      };

      return React.createElement(
        "div",
        null,
        // Main container with icon centered between title and URL
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "12px" } },
          // Image avatar component - centered between title and URL
          React.createElement(
            "div",
            {
              style: {
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#deebff", // Light blue background
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
                alignSelf: "center", // Center between the two lines
              },
            },
            // Always show ticket icon inside the circle
            React.createElement(
              "div",
              {
                style: {
                  color: "#4876b6", // Blue icon color
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                },
              },
              React.createElement(GetIcon, { icon: "ticket" })
            )
          ),
          // Content area with title and URL stacked
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 } },
            // Line 1: Ticket title
            React.createElement("div", { className: "font-medium text-gray-900", style: { fontWeight: "600" } }, value),
            // Line 2: URL + Action buttons on same horizontal line
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" } },
              // URL badge
              React.createElement(
                "span",
                {
                  style: {
                    fontSize: "0.75rem",
                    color: "#9CA3AF",
                    fontFamily: "monospace",
                    backgroundColor: "#F9FAFB",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    border: "1px solid #E5E7EB",
                    display: "inline-block",
                    maxWidth: "300px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: "1",
                    minWidth: "200px",
                  },
                },
                fullUrl
              ),
              // Action buttons container
              React.createElement(
                "div",
                { style: { position: "relative", display: "inline-flex", alignItems: "center", gap: "4px", flexShrink: 0 } },
                React.createElement(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleCopyUrl(e.currentTarget);
                    },
                    style: {
                      padding: "6px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    className: "text-gray-400 hover:text-blue-600 hover:bg-blue-50",
                    title: "Copy URL",
                  },
                  React.createElement(
                    "svg",
                    { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "2",
                      d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
                    })
                  )
                ),
                React.createElement(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleNavigateUrl();
                    },
                    style: {
                      padding: "6px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    className: "text-gray-400 hover:text-blue-600 hover:bg-blue-50",
                    title: "Navigate to URL",
                  },
                  React.createElement(
                    "svg",
                    { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" })
                  )
                )
              )
            )
          )
        )
      );
    },
  },
  {
    type: "textarea",
    placeholder: "Tell attendees what's included with this ticket",
    name: "description",
    validation: "",
    default: "",
    label: "Description",
    sublabel: "Optional",
    required: false,
    view: true,
    add: true,
    group: "Basic Ticket Information",
    update: true,
  },
  {
    type: "select",
    apiType: "API",
    selectApi: "ticket-category/master/select",
    placeholder: "Select a ticket category",
    name: "ticketCategory",
    validation: "",
    showItem: "value",
    default: "",
    addNew: {
      attributes: [
        {
          type: "text",
          placeholder: "Ticket Category",
          name: "title",
          validation: "",
          default: "",
          label: "Ticket category",
          required: true,
          view: true,
          add: true,
          update: true,
        },
      ],
      api: "ticket-category",
      submitButtonText: "Create",
    },
    highlight: true,
    label: "Ticket Category",
    required: false,
    view: true,
    add: true,
    update: true,
    filter: true,
    group: "Basic Ticket Information",
  },
  {
    type: "image",
    placeholder: "Thumbnail Image",
    name: "thumbnail",
    validation: "",
    default: "",
    tag: false,
    label: "Ticket Thumbnail",
    required: true,
    view: true,
    add: true,
    group: "Basic Ticket Information",
    update: true,
  },
  {
    type: "toggle",
    placeholder: "Enable RSVP",
    name: "enableRSVP",
    validation: "",
    default: false,
    label: "Enable RSVP",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
    footnote: "Enable RSVP functionality for this ticket",
    group: "Basic Ticket Information",
  },
  {
    type: "select",
    placeholder: "Ticket Status",
    name: "status",
    validation: "",
    tag: false,
    label: "Ticket Status",
    group: "Availability",
    default: "Open",
    required: false,
    view: true,
    filter: true,
    add: true,
    update: true,
    apiType: "CSV",
    selectApi: "Open,Closed,Sold Out",
    footnote: "Control whether attendees can purchase this ticket",
    icon: "ticket",
  },
  {
    type: "toggle",
    placeholder: "",
    name: "enableNumberOfTickets",
    validation: "",
    default: "",
    label: "Limit Number of Tickets",
    group: "Availability",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
    footnote: "Enable to limit the number of tickets available. By default, it's unlimited.",
  },
  {
    type: "number",
    placeholder: "Maximum number of tickets available",
    name: "numberOfTicketsToBeSold",
    compact: true,
    condition: {
      item: "enableNumberOfTickets",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    validation: "",
    default: "",
    label: "No of Tickets",
    group: "Availability",
    tag: false,
    view: true,
    required: true,
    add: true,
    update: true,
    icon: "ticket",
  },
  {
    type: "number",
    placeholder: "Maximum Buying",
    name: "maximumBuying",
    validation: "",
    default: "",
    label: "Maximum Buying",
    group: "Availability",
    tag: false,
    view: true,
    required: true,
    add: true,
    update: true,
    icon: "ticket",
  },
  {
    type: "toggle",
    placeholder: "Enable Coupon Code",
    name: "enableCoupenCode",
    default: false,
    label: "Enable Coupon Code",
    group: "Availability",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "toggle",
    placeholder: "Show limit in ticket",
    name: "showLimit",
    condition: {
      item: "enableNumberOfTickets",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    validation: "",
    default: 0,
    label: "Show limit in ticket",
    group: "Availability",
    tag: false,
    view: true,
    add: true,
    update: true,
    icon: "ticket",
  },
  {
    type: "datetime",
    split: true,
    placeholder: "Sales Start On",
    name: "saleStartDate",
    group: "Timing",
    validation: "",
    default: moment().set({ hour: 9, minute: 0, second: 0 }).toDate(), // Tomorrow 9 AM,
    minDate: moment().add(-1, "month").startOf("day").toDate(), // Cannot select before tomorrow 12 AM
    tag: false,
    label: "Sales Start On",
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "date",
    customClass: "full",
  },
  {
    type: "datetime",
    split: true,
    placeholder: "Live until",
    name: "saleEndDate",
    group: "Timing",
    statusLabel: {
      nextLine: true,
      size: "small",
      conditions: [
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "Closed",
          type: "string",
          label: "Sale Closed",
          icon: "close",
          color: "beige",
        },
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "Sold Out",
          type: "string",
          label: "Sold Out",
          icon: "close",
          color: "beige",
        },
        {
          when: "bookingCount",
          condition: COMPARE_TYPES.GREATER_EQUAL,
          compare: "numberOfTicketsToBeSold",
          type: "string",
          label: "Sold Out",
          icon: "close",
          color: "red",
        },
        {
          when: "currentDate",
          condition: COMPARE_TYPES.BEFORE_DATE,
          compare: "saleStartDate",
          type: "date",
          label: "Starts on {{saleStartDate}}",
          icon: "time",
          color: "gray",
        },
        {
          when: "currentDate",
          condition: COMPARE_TYPES.DATE_BETWEEN,
          type: "date",
          compare: {
            start: "saleStartDate",
            end: "saleEndDate",
          },
          label: "Sale Started",
          icon: "tick",
          color: "mint",
        },
        {
          when: "currentDate",
          condition: COMPARE_TYPES.AFTER_DATE,
          compare: "saleEndDate",
          type: "date",
          label: "Sale Closed",
          icon: "close",
          color: "beige",
        },
      ],
    },
    render: (value, rowData, attribute, props) => {
      if (!value || !moment(value).isValid()) {
        return "--";
      }
      // Format date as "MMM DD, hh:mm A" (e.g., "Sep 05, 10:00 PM") without year/timezone
      return moment(value).format("MMM DD, hh:mmA");
    },
    validation: "",
    tag: true,
    default: { source: "parent", type: "apply", field: "endDate", fallback: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate() },
    minDate: moment().add(-1, "month").startOf("day").toDate(),
    label: "Live until",
    required: false,
    view: true,
    add: true,
    update: true,
    sort: true,
    icon: "date",
    customClass: "full",
  },
  {
    type: "toggle",
    placeholder: "",
    name: "needsApproval",
    validation: "",
    default: "",
    label: "Require Approval?",
    group: "Availability",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
    footnote: "Review and approve each registration before confirming",
  },
  {
    type: "toggle",
    placeholder: "",
    name: "requireRSVPResponse",
    validation: "",
    default: true,
    label: "Require RSVP Response",
    condition: {
      item: "enableRSVP",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    group: "RSVP",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
    footnote: "Guests must respond Yes/No/Maybe before registering",
  },
  {
    type: "date",
    placeholder: "RSVP Expiry",
    name: "rsvpExpiry",
    validation: "",
    default: null,
    label: "RSVP Expiry",
    condition: {
      item: "enableRSVP",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    group: "RSVP",
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "date",
  },
  {
    type: "textarea",
    placeholder: "Email template HTML with placeholders",
    name: "rsvpEmailTemplate",
    validation: "",
    default: `
        <p>Hi {recipientName},</p>
        <p>You're invited to <strong>{eventTitle}</strong>!</p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li><strong>Ticket:</strong> {ticketTitle}</li>
          <li><strong>Date:</strong> {eventDate}</li>
          <li><strong>Location:</strong> {eventLocation}</li>
        </ul>
        <p>{personalMessage}</p>
        <p><a href="{invitationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
        <p>Best regards,<br>Team {eventTitle}</p>
      `,
    label: "RSVP Email Template",
    sublabel: "HTML supported. Use placeholders like {recipientName}",
    group: "RSVP",
    required: false,
    view: true,
    add: true,
    update: true,
    customClass: "full",
    condition: {
      item: "enableRSVP",
      if: true,
      then: "enabled",
      else: "disabled",
    },
  },
  {
    type: "toggle",
    placeholder: "",
    name: "allowGuestInvitations",
    default: false,
    label: "Allow Guest Invitations",
    condition: {
      item: "enableRSVP",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    group: "RSVP",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "number",
    placeholder: "Max Guests Per Invitation",
    name: "maxGuestsPerInvitation",
    validation: "",
    default: 0,
    // label: "Max Guests Per Invitation",
    // condition: {
    //   item: "enableRSVP",
    //   if: true,
    //   then: "enabled",
    //   else: "disabled",
    // },
    group: "RSVP",
    required: false,
    view: true,
    add: true,
    update: true,
    condition: {
      item: "allowGuestInvitations",
      if: true,
      then: "enabled",
      else: "disabled",
    },
  },
  {
    type: "hidden",
    apiType: "JSON",
    placeholder: "Free/Paid",
    name: "enablePricing",
    selectApi: "Free,Paid",
    validation: "",
    default: "Free",
    label: "Free/Paid",
    group: "Pricing",
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    tag: true,
    required: false,
    view: true,
    add: true,
    update: false,
    hide: true,
    statusLabel: {
      nextLine: true,
      size: "small",
      conditions: [
        {
          when: "enablePricing",
          condition: COMPARE_TYPES.IS_FALSE,
          compare: false,
          type: "boolean",
          label: "Free",
          icon: "ticket",
          color: "mint",
        },
        {
          when: "enablePricing",
          condition: COMPARE_TYPES.IS_TRUE,
          compare: true,
          type: "boolean",
          label: "Paid",
          icon: "ticket",
          color: "red",
        },
      ],
    },
  },
  {
    type: "select",
    placeholder: "Ticket Price",
    name: "enablePricing",
    editable: true,
    group: "Pricing",
    compact: true,
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    label: "Ticket Price",
    required: false,
    customClass: "full",
    default: {
      source: "parent",
      type: "match",
      field: "ticketType",
      dataset: [
        { match: "free", value: false },
        { match: "paid", value: true },
      ],
      fallback: false,
    },
    filter: false,
    tag: false,
    view: true,
    add: true,
    update: true,
    apiType: "JSON",
    selectType: "card",
    selectApi: [
      { value: "Free", id: false },
      { value: "Paid", id: true },
    ],
  },
  {
    type: "number",
    placeholder: "Price",
    name: "paymentAmount",
    condition: {
      item: "enablePricing",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    displayFormat: "price",
    validation: "",
    tag: true,
    group: "Pricing",
    label: "Price",
    decimalPlaces: 2,
    showItem: "",
    required: true,
    view: true,
    filter: false,
    add: true,
    update: true,
  },
  {
    type: "toggle",
    placeholder: "Enable discount pricing for this ticket",
    name: "enableDiscount",
    condition: {
      item: "enablePricing",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    default: false,
    group: "Pricing",
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    label: "Enable Discount Pricing",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "number",
    placeholder: "Enter discounted price",
    name: "discountValue",
    condition: {
      item: "enableDiscount",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    validation: "",
    default: 0,
    decimalPlaces: 2,
    group: "Pricing",
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    label: "Discount Price",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "text",
    placeholder: "e.g., Early Bird, Limited Offer",
    name: "discountTag",
    validation: "",
    default: "",
    group: "Pricing",
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    label: "Discount Label",
    required: true,
    view: true,
    add: true,
    update: true,
    condition: {
      item: "enableDiscount",
      if: true,
      then: "enabled",
      else: "disabled",
    },
  },
  {
    type: "select",
    placeholder: "Validity Type",
    name: "discountValidityType",
    validation: "",
    apiType: "JSON",
    icon: "date",
    selectApi: [
      { id: "endDate", value: "End Date" },
      { id: "tickets", value: "No of Tickets" },
      { id: "both", value: "End Date or Tickets" },
    ],
    default: "both",
    group: "Pricing",
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    label: "Validity Type",
    required: true,
    view: true,
    add: true,
    update: true,
    condition: {
      item: "enableDiscount",
      if: true,
      then: "enabled",
      else: "disabled",
    },
  },
  {
    type: "number",
    placeholder: "Enter maximum number of discounted tickets",
    sublabel: "No. of Tickets",
    name: "discountLimit",
    validation: "",
    default: 0,
    group: "Pricing",
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    label: "Discount Ticket Quantity",
    required: false,
    view: true,
    add: true,
    update: true,
    condition: {
      item: "enableDiscount",
      if: true,
      then: "enabled",
      else: "disabled",
    },
  },
  {
    type: "date",
    placeholder: "Select when discount expires",
    name: "discountEndDate",
    validation: "",
    default: { source: "parent", type: "apply", field: "startDate" },
    group: "Pricing",
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    label: "Discount End Date",
    required: true,
    view: true,
    add: true,
    update: true,
    icon: "date",
    condition: {
      item: "enableDiscount",
      if: true,
      then: "enabled",
      else: "disabled",
    },
  },
  {
    type: "toggle",
    placeholder: "Enable Tax",
    name: "enableTax",
    validation: "",
    condition: {
      item: "enablePricing",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    default: "",
    group: "Pricing",
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    label: "Enable Tax",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "number",
    placeholder: "Tax Percentage",
    name: "taxPercentage",
    validation: "",
    condition: {
      item: "enableTax",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    default: true,
    tag: false,
    group: "Pricing",
    parentCondition: {
      item: "ticketType",
      if: "paid",
      then: "enabled",
      else: "disabled",
    },
    label: "Tax Percentage",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "toggle",
    placeholder: "Enable Custom Styling for Ticket Badge",
    name: "enableCustomBadgeStyling",
    validation: "",
    default: true,
    label: "Enable Custom Styling for Ticket Badge",
    group: "Advanced Settings",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "multiSelect",
    placeholder: "Fields to show in ticket",
    name: "ticketBadgeFields",
    validation: "",
    group: "Advanced Settings",
    label: "Fields to show in ticket",
    sublabel: "Select fields to display on the ticket badge.",
    showItem: "value",
    editable: true,
    tag: false,
    required: false,
    minimum: 1,
    maximum: 6,
    add: true,
    update: true,
    view: true,
    filter: false,
    condition: { item: "enableCustomBadgeStyling", if: true, then: "enabled", else: "disabled" },
    customClass: "full",
    apiType: "JSON",
    selectType: "card",
    selectApi: [
      { id: "eventTitle", value: "Event Title" },
      { id: "ticketTitle", value: "Ticket Title" },
      { id: "name", value: "Name" },
      { id: "eventDate", value: "Event Date" },
      { id: "eventTime", value: "Event Time" },
      { id: "ticketDate", value: "Ticket Date" },
      { id: "ticketTime", value: "Ticket Time" },
      { id: "location", value: "Location" },
      { id: "custom", value: "Custom" },
    ],
  },
  {
    type: "element",
    name: "renderTicketBadge",
    label: "Ticket Badge Preview",
    group: "Advanced Settings",
    required: false,
    showError: false,
    view: true,
    add: true,
    update: true,
    element: (data, onChange) => {
      const { formValues, parentData } = data;
      const ticketBadgeFields = formValues?.ticketBadgeFields || [];
      // Use parentData (event data) if available, otherwise fallback to formValues.event
      const eventData = parentData || formValues?.event || {};

      const [showPreview, setShowPreview] = React.useState(false);

      return (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-base hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>

          {showPreview && (
            <div className="fixed left-0 bottom-0 top-0 w-[450px] bg-white shadow-2xl z-40 overflow-auto border-r border-stroke-soft overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-stroke-soft p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-text-main">Ticket Badge Preview</h3>
                <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-bg-weak rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <Ticket rowData={formValues} ticketBadgeFields={ticketBadgeFields} eventData={eventData} />
              </div>
            </div>
          )}
        </div>
      );
    },
  },
  {
    type: "color",
    placeholder: "Primary Theme Color",
    name: "customPrimaryColour",
    validation: "",
    default: "#007bff",
    label: "Primary Theme Color",
    sublabel: "Primary color for ticket design elements",
    group: "Advanced Settings",
    required: true,
    view: true,
    add: true,
    update: true,
    condition: { item: "enableCustomBadgeStyling", if: true, then: "enabled", else: "disabled" },
  },
  {
    type: "color",
    placeholder: "Secondary Custom Theme Color",
    name: "secondaryCustomThemeColor",
    validation: "",
    default: "#007bff",
    label: "Secondary Custom Theme Color",
    sublabel: "Secondary color for ticket design elements",
    group: "Advanced Settings",
    required: false,
    view: true,
    add: true,
    update: true,
    condition: { item: "enableCustomBadgeStyling", if: true, then: "enabled", else: "disabled" },
  },
  {
    type: "text",
    placeholder: "Series Prefix",
    name: "seriesPrefix",
    validation: "",
    default: "MNT",
    label: "Series Prefix",
    group: "Advanced Settings",
    required: false,
    view: true,
    add: true,
    update: true,
    condition: { item: "enableCustomBadgeStyling", if: true, then: "enabled", else: "disabled" },
  },
  {
    type: "number",
    placeholder: "Starting Number",
    name: "startingNumber",
    validation: "",
    default: 1,
    label: "Starting Number",
    group: "Advanced Settings",
    required: false,
    view: true,
    add: true,
    update: true,
    condition: { item: "enableCustomBadgeStyling", if: true, then: "enabled", else: "disabled" },
    render: (value, rowData) => {
      const color = rowData.customThemeColor || "#6366f1";
      const prefix = rowData.seriesPrefix || "MNT";
      const start = String(rowData.startingNumber || 1).padStart(5, "0");
      return React.createElement(
        "div",
        { style: { marginTop: "8px" } },
        React.createElement("div", { style: { color: "#6b7280", marginBottom: 4 } }, "Preview:"),
        React.createElement(
          "span",
          {
            style: {
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: 6,
              backgroundColor: color,
              color: "#fff",
              fontWeight: 700,
              letterSpacing: 0.5,
              fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial",
            },
          },
          `${prefix}${start}`
        )
      );
    },
  },
  {
    type: "title",
    title: "Ticket Buying Limit",
    name: "ticketBuyingLimit",
    icon: "configuration",
    group: "Availability",
    add: true,
    update: true,
    footnote: "The most tickets a customer can purchase",
  },
  {
    type: "toggle",
    placeholder: "Allow Multiple Entry",
    name: "isMultipleEntry",
    default: false,
    group: "Availability",
    label: "Allow Multiple Entry",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "number",
    placeholder: "Maximum Entry Limit",
    name: "multipleEntriLimit",
    validation: "",
    condition: {
      item: "isMultipleEntry",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    default: 0,
    tag: false,
    group: "Availability",
    label: "Maximum Entry Limit",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "number",
    placeholder: "Sales",
    name: "bookingCount",
    validation: "",
    default: 0,
    group: "Analytics",
    label: "Sales",
    required: true,
    view: true,
    add: false,
    update: false,
    tag: true,
    sort: true,
  },
  {
    type: "text",
    placeholder: "Slug",
    name: "slug",
    validation: "",
    default: "",
    label: "Slug",
    group: "Basic Ticket Information",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
  },
];

// Helper function to get the correct domain for QR code generation
const getDomainForQR = (ticketData, getCachedEventDomain) => {
  // Get event ID - try multiple ways to find it
  let eventId = null;
  if (ticketData.event) {
    eventId = typeof ticketData.event === "object" ? ticketData.event._id : ticketData.event;
  }

  console.log("QR Debug - Ticket Data:", ticketData);
  console.log("QR Debug - Event ID:", eventId);

  // Get cached domain or use fallback
  let cachedDomain = getCachedEventDomain(eventId);
  console.log("QR Debug - Cached Domain for eventId:", cachedDomain);

  // If no cached domain for this event, try to get from current URL or any cached domain
  if (!cachedDomain) {
    // Try to get from current page URL (if we're on an event page)
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split("/");
    const possibleEventId = pathParts[pathParts.length - 1];

    if (possibleEventId) {
      cachedDomain = getCachedEventDomain(possibleEventId);
      console.log("QR Debug - Tried current path eventId:", possibleEventId, "Domain:", cachedDomain);
    }
  }

  // Try to get domain from localStorage with multiple keys
  let websiteUrl = "https://example.com";
  if (cachedDomain) {
    websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
  } else {
    // Fallback: try to find any cached domain
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("eventhex:domain:")) {
          const value = localStorage.getItem(key);
          if (value && value !== "example.com") {
            websiteUrl = value.includes("http") ? value : `https://${value}`;
            console.log("QR Debug - Found fallback domain:", websiteUrl);
            break;
          }
        }
      }
    } catch (e) {
      console.log("QR Debug - Error searching localStorage:", e);
    }
  }

  return websiteUrl;
};

// Function to handle QR code download for tickets
export const handleDownloadTicketQR = (item, data, getCachedEventDomain, toast) => {
  try {
    // Extract ticket data - 'data' contains the actual ticket object
    const ticketData = data || item;
    const ticketTitle = ticketData?.title || "ticket";
    const ticketSlug =
      ticketData?.slug ||
      ticketTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    console.log("QR Debug - Ticket Title:", ticketTitle);
    console.log("QR Debug - Ticket Slug:", ticketSlug);

    // Get the correct domain for this ticket
    const websiteUrl = getDomainForQR(ticketData, getCachedEventDomain);
    const ticketUrl = `${websiteUrl}/register/${ticketSlug}`;
    console.log("QR Debug - Final URL:", ticketUrl);

    // Create a temporary container for QR code
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    document.body.appendChild(tempContainer);

    // Create QR code component
    const qrElement = React.createElement(QRCode, {
      value: ticketUrl,
      size: 200,
      level: "H",
    });

    // Render QR code
    const root = ReactDOM.createRoot(tempContainer);
    root.render(qrElement);

    // Wait for QR code to render, then download
    setTimeout(() => {
      const svg = tempContainer.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          const padding = 40;
          const width = img.width + padding * 2;
          const height = img.height + padding * 2;

          canvas.width = width;
          canvas.height = height;
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, padding, padding);

          const pngFile = canvas.toDataURL("image/png", 1.0);
          const downloadLink = document.createElement("a");
          downloadLink.download = `qr-code-${ticketSlug}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();

          // Clean up
          document.body.removeChild(tempContainer);
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      } else {
        // Fallback if QR code doesn't render
        console.error("Failed to generate QR code");
        document.body.removeChild(tempContainer);
      }
    }, 100);
  } catch (error) {
    console.error("Error downloading QR code:", error);
    if (toast) {
      toast.error("Failed to download QR code");
    }
  }
};

export const ticketCoupenAttributes = [
  {
    type: "text",
    placeholder: "eg: EARLY2025 or SPRING25",
    name: "code",
    validation: "",
    default: "",
    label: "Coupon Code",
    tag: true,
    required: true,
    view: true,
    add: true,
    update: true,
    icon: "coupon",
    statusLabel: {
      nextLine: false,
      size: "small",
      conditions: [
        {
          when: "isActive",
          condition: COMPARE_TYPES.IS_TRUE,
          compare: "true",
          type: "boolean",
          label: "Live",
          icon: "tick",
          color: "mint",
        },
        {
          when: "currentDate",
          condition: COMPARE_TYPES.IS_FALSE,
          compare: "false",
          type: "boolean",
          label: "Paused  ",
          icon: "time",
          color: "gray",
        },
      ],
    },
    // Transform function to remove spaces from coupon code in real-time
    onChange: (fieldName, formValues, formType) => {
      if (formValues[fieldName] && typeof formValues[fieldName] === "string") {
        // Remove all spaces from the coupon code
        formValues[fieldName] = formValues[fieldName].replace(/\s+/g, "");
      }
      return formValues;
    },
    footnote: "Enter a unique code that attendees will use during checkout. Spaces will be automatically removed.",
  },
  {
    type: "select",
    apiType: "CSV",
    selectApi: "Percentage,Fixed Amount",
    placeholder: "Discount Type",
    name: "type",
    validation: "",
    tag: true,
    label: "Discount Type",
    default: "Percentage",
    required: true,
    view: true,
    filter: false,
    add: true,
    update: true,
    icon: "percentage",
  },
  {
    type: "number",
    placeholder: "Discount Value",
    name: "value",
    validation: "",
    default: "",
    label: "Discount Value",
    tag: true,
    required: true,
    view: true,
    add: true,
    update: true,
    icon: "discount",
  },
  {
    type: "number",
    placeholder: "Max Usage",
    name: "usageLimit",
    validation: "",
    default: "",
    label: "Max Usage",
    tag: true,
    view: true,
    add: true,
    update: true,
    footnote: "Limit how many times this code can be used (leave empty for unlimited)",
    icon: "maximum",
  },
  {
    type: "date",
    placeholder: "Valid From",
    name: "startDate",
    validation: "",
    default: { source: "parent", type: "apply", field: "startDate" },
    label: "Valid From",
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "date",
    customClass: "half",
  },
  {
    type: "time",
    placeholder: "Time",
    name: "startDate",
    validation: "",
    default: { source: "parent", type: "apply", field: "startDate" },
    label: "Time",
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "date",
    customClass: "half",
  },
  {
    type: "date",
    placeholder: "Valid Until",
    name: "endDate",
    validation: "",
    default: "",
    label: "Valid Until",
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "date",
    customClass: "half",
  },
  {
    type: "datetime",
    placeholder: "Valid Until",
    name: "endDate",
    validation: "",
    default: "",
    label: "Valid Until",
    tag: true,
    required: false,
    view: true,
    add: false,
    update: false,
    icon: "date",
    customClass: "half",
  },
  {
    type: "time",
    placeholder: "Time",
    name: "endDate",
    validation: "",
    default: "",
    label: "Time",
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "date",
    customClass: "half",
  },
  {
    type: "select",
    placeholder: "Applicable Tickets",
    name: "availability",
    validation: "",
    tag: true,
    editable: true,
    label: "Applicable Tickets",
    sublabel: "",
    showItem: "",
    required: true,
    customClass: "full",
    filter: false,
    view: true,
    add: true,
    update: true,
    apiType: "JSON",
    selectType: "card",
    selectApi: [
      { value: "All Tickets", id: "All" },
      { value: "Selected Tickets", id: "Selected" },
    ],
    render: (value, data, attribute) => {
      // Get availability value - can be "All", "Selected", "All Tickets", or "Selected Tickets"
      const availability = data?.availability || value || "";
      const tickets = data?.tickets || [];

      // Determine display value for the field
      const displayValue = availability === "All" || availability === "All Tickets" ? "All Tickets" : "Selected Tickets";

      // Create tooltip content with ticket list
      const tooltipContent = (
        <div className="space-y-2">
          <div className="font-semibold text-sm border-b border-gray-200 pb-2">Tickets</div>
          {availability === "All" || availability === "All Tickets" ? (
            <div className="text-xs text-gray-600 py-1">All Tickets</div>
          ) : (
            <div className="space-y-1.5">
              {tickets.length > 0 ? (
                tickets.map((ticket, index) => {
                  // Handle populated ticket objects (with title field) and reference IDs
                  let ticketTitle = "Ticket";
                  if (ticket) {
                    if (typeof ticket === "object") {
                      ticketTitle = ticket.title || ticket.name || ticket.value || "Ticket";
                    } else if (typeof ticket === "string") {
                      // If it's just an ID string, we can't get the title without a lookup
                      ticketTitle = "Ticket";
                    }
                  }

                  return (
                    <div key={index} className="text-xs space-y-1">
                      <div className="font-medium">{ticketTitle}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-gray-400 italic py-1">No tickets selected</div>
              )}
            </div>
          )}
        </div>
      );

      // Return wrapped content with tooltip - similar to Price field in paymentHistoryAttributes
      return (
        <CustomTooltip content={tooltipContent} variant="default" size="large" place="left">
          <div className="text-sm cursor-help hover:text-primary-base transition-colors">{displayValue}</div>
        </CustomTooltip>
      );
    },
  },
  {
    type: "multiSelect",
    apiType: "API",
    selectApi: "ticket/event-ticket",
    updateOn: "event",
    placeholder: "Tickets",
    name: "tickets",
    condition: {
      item: "availability",
      if: "Selected",
      then: "enabled",
      else: "disabled",
    },
    showItem: "title",
    validation: "",
    default: "",
    tag: false,
    label: "Tickets",
    required: true,
    view: true,
    add: true,
    update: true,
    filter: false,
  },
];

export const ticketAdminAttributes = [
  {
    type: "multiSelect",
    apiType: "API",
    selectApi: "ticket/event-ticket",
    updateOn: "event",
    placeholder: "Tickets",
    name: "ticket",
    showItem: "title",
    validation: "",
    default: "",
    tag: true,
    label: "Tickets",
    required: true,
    view: true,
    add: true,
    update: true,
    filter: false,
  },
  {
    type: "text",
    placeholder: "Name",
    name: "name",
    validation: "",
    default: "",
    tag: false,
    label: "Name",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "email",
    placeholder: "E-Mail",
    name: "email",
    validation: "",
    default: "",
    tag: true,
    label: "E-Mail",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "password",
    placeholder: "Password",
    name: "password",
    validation: "password ",
    info: "At least one uppercase letter (A-Z) \n At least one lowercase letter (a-z) \n At least one digit (0-9) \n At least one special character (@, $, !, %, *, ?, &) \n Minimum length of 8 characters",
    minimum: 0,
    maximum: 16,
    default: "",
    label: "Password",
    required: true,
    view: true,
    add: true,
    update: false,
  },
];

export const ticketCategoryAttributes = [
  {
    type: "text",
    placeholder: "Title",
    name: "title",
    validation: "",
    default: "",
    label: "Title",
    tag: true,
    required: true,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "number",
    placeholder: "Priority Order",
    name: "priorityOrder",
    validation: "",
    default: 0,
    label: "Priority Order",
    tag: true,
    required: true,
    view: true,
    add: true,
    update: true,
  },
];
