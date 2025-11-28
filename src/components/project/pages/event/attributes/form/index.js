import React from "react";
import { COMPARE_TYPES } from "../../../../../core/functions/conditions";
import moment from "moment";
import { GetIcon } from "../../../../../../icons";

export const formAttributes = [
  {
    type: "select",
    name: "type",
    label: "Form Category",
    apiType: "JSON",
    filter: true,
    filterPosition: "left",
    filterType: "tabs",
    selectApi: [
      { value: "Ticket", id: "Ticket" },
      { value: "Participant Type", id: "Default" },
      { value: "Custom", id: "Form" },
    ],
  },
  {
    type: "text",
    placeholder: "Form Name",
    name: "title",
    validation: "",
    default: "",
    label: "Form Name",
    tag: true,
    required: true,
    view: true,
    add: true,
    update: true,
    description: { type: "text", field: "slug", collection: "" },
    render: (value, rowData, attribute, props) => {
      const formSlug =
        rowData.slug ||
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

      // State to store the full URL for display
      const [fullUrl, setFullUrl] = React.useState(`/register/${formSlug}`);
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
            const url = `${websiteUrl}/register/${formSlug}`;
            setFullUrl(url);
          } else {
            // Fallback to example.com if no cached domain
            setFullUrl(`https://example.com/register/${formSlug}`);
          }
          setIsLoading(false);
        } catch (error) {
          setFullUrl(`https://example.com/register/${formSlug}`);
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
            const fullUrl = `${websiteUrl}/register/${formSlug}`;
            copyToClipboard(fullUrl, setMessage, clickedButton);
          } else {
            // Fallback to example.com if no cached domain
            copyToClipboard(`https://example.com/register/${formSlug}`, setMessage, clickedButton);
          }
        } catch (error) {
          const setMessage = props?.setMessage || window.setMessage || (() => {});
          copyToClipboard(`https://example.com/register/${formSlug}`, setMessage, clickedButton);
        }
      };

      const handleNavigateUrl = () => {
        try {
          // Extract event ID from event object
          const eventId = typeof rowData.event === "object" ? rowData.event._id : rowData.event;
          const cachedDomain = getCachedEventDomain(eventId);

          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            const fullUrl = `${websiteUrl}/register/${formSlug}`;
            window.open(fullUrl, "_blank");
          } else {
            // Fallback to example.com if no cached domain
            window.open(`https://example.com/register/${formSlug}`, "_blank");
          }
        } catch (error) {
          window.open(`https://example.com/register/${formSlug}`, "_blank");
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
            // Always show form icon inside the circle
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
              React.createElement(GetIcon, { icon: "form-builder" })
            )
          ),
          // Content area with title and URL stacked
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 } },
            // Line 1: Form title
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
    type: "hidden",
    apiType: "CSV",
    placeholder: "Form Type",
    name: "type",
    selectApi: "Form,Ticket,",
    validation: "",
    default: "Form",
    label: "Form Type",
    tag: true,
    required: false,
    view: true,
    add: true,
    update: false,
    sort: true,
    hide: true,
    statusLabel: {
      nextLine: false,
      size: "small",
      conditions: [
        {
          when: "type",
          condition: COMPARE_TYPES.EQUALS,
          compare: "Form",
          type: "string",
          label: "Form",
          icon: "form-builder",
          color: "beige",
        },
        {
          when: "type",
          condition: COMPARE_TYPES.EQUALS,
          compare: "Ticket",
          type: "string",
          label: "Ticket",
          icon: "ticket",
          color: "red",
        },
        {
          when: "type",
          condition: COMPARE_TYPES.EQUALS,
          compare: "Default",
          type: "string",
          label: "Participant Type",
          icon: "participant-type",
          color: "mint",
        },
        {
          when: "type",
          condition: COMPARE_TYPES.EQUALS,
          compare: "User-Created",
          type: "string",
          label: "Participant Type",
          icon: "participant-type",
          color: "mint",
        },
        {
          when: "type",
          condition: COMPARE_TYPES.EQUALS,
          compare: "Abstraction",
          type: "string",
          label: "Abstract",
          icon: "abstract",
          color: "beige",
        },
      ],
    },
  },
  {
    type: "textarea",
    placeholder: "A brief description if this a standalone form",
    name: "description",
    validation: "",
    default: "",
    label: "Description",
    required: true,
    view: true,
    add: false,
    update: true,
  },
  {
    type: "line",
    add: false,
    update: true,
  },
  {
    type: "number",
    placeholder: "No of Tickets",
    name: "numberOfTicketsToBeSold",
    validation: "",
    default: "",
    label: "No of Tickets",
    required: true,
    view: true,
    add: false,
    update: true,
    icon: "ticket",
  },
  {
    type: "line",
    add: false,
    update: true,
  },
  {
    type: "title",
    title: "Buying Limit",
    name: "sm",
    add: false,
    update: true,
  },
  {
    type: "number",
    placeholder: "Minimum",
    name: "minimumBuying",
    validation: "",
    default: "",
    label: "Minimum",
    required: true,
    view: true,
    add: false,
    update: true,
    customClass: "half",
  },
  {
    type: "number",
    placeholder: "Maximum",
    name: "maximumBuying",
    validation: "",
    default: "",
    label: "Maximum",
    required: true,
    view: true,
    add: false,
    update: true,
    customClass: "half",
  },
  {
    type: "line",
    add: false,
    update: true,
  },
  {
    type: "select",
    placeholder: "Status",
    name: "status",
    validation: "",
    tag: false,
    label: "Status",
    showItem: "Open",
    required: false,
    view: true,
    filter: false,
    add: false,
    update: true,
    apiType: "CSV",
    selectApi: "Open,Closed,Sold Out",
  },
  {
    type: "number",
    placeholder: "Sales",
    name: "bookingCount",
    validation: "",
    default: 0,
    label: "Registration Count",
    required: true, // Required if enableDiscount is true
    view: true,
    add: false,
    update: false,
    tag: true,
    sort: true,
  },
  {
    type: "datetime",
    split: true,
    placeholder: "Sales Start On",
    name: "saleStartDate",
    validation: "",
    default: "",
    tag: false,
    label: "Sales Start On",
    required: false,
    view: true,
    add: false,
    update: true,
    icon: "date",
    customClass: "full",
  },
  {
    type: "datetime",
    split: true,
    placeholder: "Live until",
    name: "saleEndDate",
    render: (value, rowData, attribute, props) => {
      if (!value || !moment(value).isValid()) {
        return "--";
      }
      // Format date as "MMM DD, hh:mm A" (e.g., "Sep 05, 10:00 PM") without year/timezone
      return moment(value).format("MMM DD, hh:mmA");
    },
    default: { source: "parent", type: "apply", field: "endDate", fallback: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate() },
    validation: "",
    tag: true,
    label: "Live until",
    required: false,
    view: true,
    add: false,
    update: true,
    sort: true,
    icon: "date",
    customClass: "full",
  },
  {
    type: "text",
    placeholder: "Slug",
    name: "slug",
    validation: "",
    default: "",
    label: "Slug",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
  },
];
