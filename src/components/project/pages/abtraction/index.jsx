import React from "react";
import moment from "moment";
import { GetIcon } from "../../../../icons";

export const abstractionAttributes = [
  {
    type: "hidden",
    name: "type",
    default: "Abstraction",
    view: true,
    add: true,
    update: true,
  },
  {
    type: "text",
    placeholder: "Early Bird, VIP Access...",
    name: "title",
    validation: "required",
    default: "",
    label: "Abstract Calling Title",
    required: true,
    view: true,
    add: true,
    update: true,
    tag: true,
    // Render name and a styled registration URL row beneath it using the exact participantType design
    render: (value, rowData, attribute, props) => {
      const abstractionSlug =
        rowData.slug ||
        (value || "")
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

      // Prefer ticket id, then abstraction id, finally slug
      const ticketId = rowData?.ticket?._id || rowData?.ticket || null;
      const pathSegment = ticketId || rowData?._id || abstractionSlug;

      // State to store the full URL for display
      const [fullUrl, setFullUrl] = React.useState(`/register/${pathSegment}`);
      const [isLoading, setIsLoading] = React.useState(true);

      // Helper to get cached domain
      const getCachedEventDomain = (eventId) => {
        try {
          const key = `eventhex:domain:${eventId}`;
          return localStorage.getItem(key);
        } catch (e) {
          return null;
        }
      };

      // Resolve and set full URL (same logic as participantType)
      React.useEffect(() => {
        try {
          const eventId = typeof rowData.event === "object" ? rowData.event?._id : rowData.event;
          const cachedDomain = getCachedEventDomain(eventId);
          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            const url = `${websiteUrl}/register/${pathSegment}`;
            setFullUrl(url);
          } else {
            setFullUrl(`https://example.com/register/${pathSegment}`);
          }
          setIsLoading(false);
        } catch (error) {
          setFullUrl(`https://example.com/register/${pathSegment}`);
          setIsLoading(false);
        }
      }, [rowData?.event, rowData?.slug, rowData?.ticket, rowData?._id, value]);

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
          .catch(() => {
            setMessage && setMessage({ type: 1, content: "Failed to copy URL to clipboard", proceed: "Okay", icon: "error" });
          });
      };

      const handleCopyUrl = (clickedButton) => {
        try {
          const eventId = typeof rowData.event === "object" ? rowData.event?._id : rowData.event;
          const setMessage = props?.setMessage || window.setMessage || (() => {});
          const cachedDomain = getCachedEventDomain(eventId);
          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            const url = `${websiteUrl}/register/${pathSegment}`;
            copyToClipboard(url, setMessage, clickedButton);
          } else {
            copyToClipboard(`https://example.com/register/${pathSegment}`, setMessage, clickedButton);
          }
        } catch (error) {
          const setMessage = props?.setMessage || window.setMessage || (() => {});
          copyToClipboard(`https://example.com/register/${pathSegment}`, setMessage, clickedButton);
        }
      };

      const handleNavigateUrl = () => {
        try {
          const eventId = typeof rowData.event === "object" ? rowData.event?._id : rowData.event;
          const cachedDomain = getCachedEventDomain(eventId);
          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            const url = `${websiteUrl}/register/${pathSegment}`;
            window.open(url, "_blank");
          } else {
            window.open(`https://example.com/register/${pathSegment}`, "_blank");
          }
        } catch (error) {
          window.open(`https://example.com/register/${pathSegment}`, "_blank");
        }
      };

      return React.createElement(
        "div",
        null,
        // Main container with icon centered between title and URL
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "12px" } },
          // Image avatar - same as participantType
          React.createElement(
            "div",
            {
              style: {
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#deebff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
                alignSelf: "center",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  color: "#4876b6",
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
            // Line 1: title
            React.createElement("div", { className: "font-medium text-gray-900", style: { fontWeight: "600" } }, value),
            // Line 2: URL + Action buttons
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
    placeholder: "Tell attendees what's included with this abstraction",
    name: "description",
    validation: "",
    default: "",
    label: "Description",
    sublabel: "Optional",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "image",
    placeholder: "Thumbnail Image",
    name: "thumbnail",
    validation: "",
    default: "",
    tag: false,
    label: "Thumbnail",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "text",
    placeholder: "abstraction-slug",
    name: "slug",
    validation: "",
    default: "",
    label: "Slug",
    tag: false,
    required: false,
    view: false,
    add: true,
    update: true,
    // Keep render for form context if needed but hidden in list view
    description: { type: "text", field: "slug", collection: "" },
    render: (value, rowData) => {
      const abstractionSlug =
        rowData.slug ||
        (value || "")
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      // Prefer the corresponding ticket id, then abstraction id, finally slug
      const ticketId = rowData?.ticket?._id || rowData?.ticket || null;
      const pathSegment = ticketId || rowData?._id || abstractionSlug;
      // Hold the resolved URL using cached domain if available
      const [fullUrl, setFullUrl] = React.useState(`/register/${pathSegment}`);

      // Fetch event-specific domain from localStorage cache
      const getCachedEventDomain = (eventId) => {
        try {
          const key = `eventhex:domain:${eventId}`;
          return localStorage.getItem(key);
        } catch (e) {
          return null;
        }
      };

      React.useEffect(() => {
        try {
          const eventId = typeof rowData.event === "object" ? rowData.event?._id : rowData.event;
          const cachedDomain = eventId ? getCachedEventDomain(eventId) : null;
          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            setFullUrl(`${websiteUrl}/register/${pathSegment}`);
          } else if (rowData?.slug) {
            // Fallback to subdomain if slug of event is known in context
            if (rowData?.eventSlug) {
              setFullUrl(`https://${rowData.eventSlug}.eventhex.ai/register/${pathSegment}`);
            } else {
              setFullUrl(`https://example.com/register/${pathSegment}`);
            }
          } else {
            setFullUrl(`https://example.com/register/${pathSegment}`);
          }
        } catch (err) {
          setFullUrl(`https://example.com/register/${pathSegment}`);
        }
      }, [rowData?.event, rowData?._id, rowData?.slug, ticketId]);

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
          .catch(() => {
            setMessage && setMessage({ type: 1, content: "Failed to copy URL to clipboard", proceed: "Okay", icon: "error" });
          });
      };

      const handleCopy = (btnEl) => {
        try {
          const eventId = typeof rowData.event === "object" ? rowData.event?._id : rowData.event;
          const setMessage = window.setMessage || (() => {});
          const cachedDomain = getCachedEventDomain(eventId);
          if (cachedDomain) {
            const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
            copyToClipboard(`${websiteUrl}/register/${pathSegment}`, setMessage, btnEl);
          } else {
            copyToClipboard(`https://example.com/register/${pathSegment}`, setMessage, btnEl);
          }
        } catch (error) {
          const setMessage = window.setMessage || (() => {});
          copyToClipboard(`https://example.com/register/${pathSegment}`, setMessage, btnEl);
        }
      };

      return null;
    },
  },
  {
    type: "select",
    placeholder: "Abstraction Status",
    name: "status",
    validation: "",
    tag: false,
    label: "Abstraction Status",
    default: "Open",
    required: false,
    view: true,
    filter: true,
    add: true,
    update: true,
    apiType: "CSV",
    selectApi: "Open,Closed,Sold Out",
    footnote: "Control whether attendees can purchase this abstraction",
  },
  {
    type: "text",
    placeholder: "Category",
    name: "category",
    validation: "",
    tag: false,
    label: "Category",
    required: false,
    view: true,
    filter: true,
    add: true,
    update: true,
  },
  {
    type: "number",
    placeholder: "Maximum Submissions per Author",
    name: "maximumBuying",
    validation: "",
    default: "",
    label: "Maximum Submissions per Author",
    tag: false,
    view: true,
    required: true,
    add: true,
    update: true,
  },
  {
    type: "datetime",
    split: true,
    placeholder: "Submission Start Date",
    name: "saleStartDate",
    validation: "",
    default: moment().set({ hour: 9, minute: 0, second: 0 }).toDate(),
    minDate: moment().add(-1, "month").startOf("day").toDate(),
    tag: false,
    label: "Submission Start Date",
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
    placeholder: "Submission Deadline",
    name: "saleEndDate",
    validation: "",
    tag: true,
    default: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate(),
    minDate: moment().add(-1, "month").startOf("day").toDate(),
    label: "Submission Deadline",
    required: false,
    view: true,
    add: true,
    update: true,
    sort: true,
    icon: "date",
    customClass: "full",
  },
  {
    type: "checkbox",
    placeholder: "Allow late submissions",
    name: "allowLateSubmissions",
    default: false,
    label: "Allow late submissions",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "datetime",
    split: true,
    placeholder: "Late Submission Deadline",
    name: "lateSubmissionEndDate",
    validation: "",
    tag: false,
    default: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate(),
    minDate: moment().add(-1, "month").startOf("day").toDate(),
    label: "Late Submission Deadline",
    condition: {
      item: "allowLateSubmissions",
      if: true,
      then: "enabled",
      else: "disabled",
    },
    view: true,
    add: true,
    update: false,
    sort: true,
    icon: "date",
  },
  {
    type: "title",
    title: "Review Timeline",
    add: true,
    update: true,
  },
  {
    type: "datetime",
    split: true,
    placeholder: "Review Start Date",
    name: "reviewStartDate",
    validation: "",
    default: moment().set({ hour: 9, minute: 0, second: 0 }).toDate(),
    minDate: moment().add(-1, "month").startOf("day").toDate(),
    tag: false,
    label: "Review Start Date",
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
    placeholder: "Review Deadline",
    name: "reviewDeadline",
    validation: "",
    tag: false,
    default: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate(),
    minDate: moment().add(-1, "month").startOf("day").toDate(),
    label: "Review Deadline",
    required: false,
    view: true,
    add: true,
    update: true,
    sort: true,
    icon: "date",
    customClass: "full",
  },
  {
    type: "datetime",
    split: true,
    placeholder: "Decision Deadline",
    name: "decisionDeadline",
    validation: "",
    tag: false,
    default: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate(),
    minDate: moment().add(-1, "month").startOf("day").toDate(),
    label: "Decision Deadline",
    view: true,
    add: true,
    update: false,
    sort: true,
    icon: "date",
  },
  {
    type: "datetime",
    split: true,
    placeholder: "Author Notification Date",
    name: "notificationDate",
    validation: "",
    tag: false,
    default: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate(),
    minDate: moment().add(-1, "month").startOf("day").toDate(),
    label: "Author Notification Date",
    view: true,
    add: true,
    update: false,
    sort: true,
    icon: "date",
  },
  {
    type: "toggle",
    placeholder: "Enable Multi Author",
    name: "multiAuthor",
    default: false,
    label: "Enable Multi Author",
    required: false,
    view: true,
    add: true,
    update: true,
  },
];
