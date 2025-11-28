import React from "react";
import { COMPARE_TYPES } from "../../../../../core/functions/conditions";
import { GetIcon } from "../../../../../../icons";

export const participantTypeAttributes = [
  {
    type: "text",
    placeholder: "Name",
    name: "name",
    validation: "",
    default: "",
    tag: true,
    label: "Name",
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "name",
    description: { type: "text", field: "slug", collection: "" },
    render: (value, rowData, attribute, props) => {
      const participantSlug =
        rowData.slug ||
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

      // State to store the full URL for display
      const [fullUrl, setFullUrl] = React.useState(`/register/${participantSlug}`);
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
            const url = `${websiteUrl}/register/${participantSlug}`;
            setFullUrl(url);
          } else {
            // Fallback to example.com if no cached domain
            setFullUrl(`https://example.com/register/${participantSlug}`);
          }
          setIsLoading(false);
        } catch (error) {
          setFullUrl(`https://example.com/register/${participantSlug}`);
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
            const fullUrl = `${websiteUrl}/register/${participantSlug}`;
            copyToClipboard(fullUrl, setMessage, clickedButton);
          } else {
            // Fallback to example.com if no cached domain
            copyToClipboard(`https://example.com/register/${participantSlug}`, setMessage, clickedButton);
          }
        } catch (error) {
          const setMessage = props?.setMessage || window.setMessage || (() => {});
          copyToClipboard(`https://example.com/register/${participantSlug}`, setMessage, clickedButton);
        }
      };

      const handleNavigateUrl = () => {
        try {
          // Extract event ID from event object
          const eventId = typeof rowData.event === "object" ? rowData.event._id : rowData.event;
          const cachedDomain = getCachedEventDomain(eventId);

          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            const fullUrl = `${websiteUrl}/register/${participantSlug}`;
            window.open(fullUrl, "_blank");
          } else {
            // Fallback to example.com if no cached domain
            window.open(`https://example.com/register/${participantSlug}`, "_blank");
          }
        } catch (error) {
          window.open(`https://example.com/register/${participantSlug}`, "_blank");
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
            // Always show participant type icon inside the circle
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
              React.createElement(GetIcon, { icon: "participant-type" })
            )
          ),
          // Content area with title and URL stacked
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 } },
            // Line 1: Participant type title
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
    apiType: "JSON",
    placeholder: "Type",
    name: "type",
    selectApi: "Default,User-Created",
    validation: "",
    default: "User-Created",
    label: "Type",
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
          when: "type",
          condition: COMPARE_TYPES.EQUALS,
          compare: "Default",
          type: "string",
          label: "Default",
          icon: "participant-type",
          color: "mint",
        },
        {
          when: "type",
          condition: COMPARE_TYPES.EQUALS,
          compare: "User-Created",
          type: "string",
          label: "User-Created",
          icon: "participant-type",
          color: "red",
        },
      ],
    },
  },
  {
    type: "hidden",
    apiType: "API",
    selectApi: "event/select",
    placeholder: "Event",
    name: "event",
    validation: "",
    showItem: "title",
    default: "",
    tag: false,
    label: "Event",
    required: false,
    view: false,
    add: false,
    update: false,
    filter: false,
  },
  {
    type: "number",
    placeholder: "Booking Count",
    name: "bookingCount",
    validation: "",
    default: 0,
    label: "Booking Count",
    tag: true,
    required: false,
    view: true,
    add: false,
    update: false,
    icon: "count",
  },
  {
    type: "toggle",
    placeholder: "",
    name: "status",
    validation: "",
    default: true,
    label: "Status",
    group: "Availability",
    tag: true,
    required: false,
    view: true,
    add: false,
    update: true,
    footnote: "Enable or disable this participant type",
    hide: true,
    statusLabel: {
      nextLine: false,
      size: "small",
      conditions: [
        {
          when: "status",
          condition: COMPARE_TYPES.IS_TRUE,
          compare: true,
          type: "boolean",
          label: "Open",
          icon: "checked",
          color: "mint",
        },
        {
          when: "status",
          condition: COMPARE_TYPES.IS_FALSE,
          compare: false,
          type: "boolean",
          label: "Closed",
          icon: "close",
          color: "red",
        },
      ],
    },
  },
  {
    type: "image",
    placeholder: "Thumbnail Image",
    name: "thumbnail",
    validation: "",
    default: "",
    tag: false,
    label: "ParticipantType Thumbnail",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "text",
    placeholder: "Slug",
    name: "slug",
    validation: "",
    default: "",
    label: "Slug",
    validate: "slug",
    required: false,
    add: true,
    update: true,
    customClass: "full",
    view: false,
    tag: false,
  },
  {
    type: "select",
    placeholder: "Status",
    name: "status",
    validation: "",
    tag: false,
    label: "Status",
    group: "Availability",
    default: "Open",
    required: false,
    view: true,
    filter: true,
    add: true,
    update: false,
    apiType: "CSV",
    selectApi: "Open,Closed,Sold Out",
    footnote: "Control whether attendees can purchase this participant type",
    icon: "ticket",
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
];
