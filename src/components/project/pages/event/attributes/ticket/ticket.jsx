import React from "react";
import QRCode from "react-qr-code";
import moment from "moment";
import { User, Calendar, Clock, MapPin, Sparkles, PartyPopper, Ticket as TicketIcon } from "lucide-react";
import EventHexLogo from "../../../../brand/eventHex.svg";
/**
 * Ticket Badge Component
 * Renders a professional ticket badge matching the exact design specification
 *
 * LAYOUT STRUCTURE:
 * 1. Banner (fixed at top)
 * 2. Index 0 - Large, bold, centered text (e.g., Event Title)
 * 3. Index 1 - Large, bold text (e.g., Ticket Type)
 * 4. Index 2 - Field with icon and label (e.g., Name)
 * 5. Index 3 - Field with icon and label (e.g., Date)
 * 6. Index 4 - Field with icon and label (e.g., Time)
 * 7. Dashed separator line
 * 8. QR Code (centered)
 * 9. Ticket Number
 * 10. Footer (Developed By EventHex)
 *
 * @param {Object} props
 * @param {Object} props.rowData - The ticket data object
 * @param {Array} props.ticketBadgeFields - Array of field configurations to display (max 5 fields)
 *   Format: [{ id: "fieldName", value: "Field Label" }, ...]
 *   Fields are rendered in the exact order provided:
 *   - Index 0: Large, bold, centered (22px, uppercase, blue)
 *   - Index 1: Large, bold (20px, black)
 *   - Index 2-4: With icon and label (15px value, 11px label)
 *
 *   Available fields: eventTitle, ticketTitle, name, eventDate, eventTime,
 *                     ticketDate, ticketTime, location, custom
 * @param {Object} props.eventData - Event data object (optional)
 *
 * @example
 * <Ticket
 *   rowData={ticketData}
 *   ticketBadgeFields={[
 *     { id: "eventTitle", value: "Event Title" },    // Index 0 - Large centered title
 *     { id: "ticketTitle", value: "Ticket Title" },  // Index 1 - Large bold text
 *     { id: "name", value: "Name" },                 // Index 2 - With icon & label
 *     { id: "eventDate", value: "Event Date" },      // Index 3 - With icon & label
 *     { id: "eventTime", value: "Event Time" }       // Index 4 - With icon & label
 *   ]}
 *   eventData={eventData}
 * />
 */
export const Ticket = ({ rowData, ticketBadgeFields = [], eventData = {} }) => {
  // Extract colors with fallback - matching backend service
  // If enableCustomBadgeStyling is true, use rowData colors, otherwise use eventData.appSetting colors
  const primaryColor = rowData?.enableCustomBadgeStyling 
    ? (rowData?.customPrimaryColour || "#375DFB")
    : (eventData?.appSetting?.primaryBase || "#375DFB");
  
  const secondaryColor = rowData?.enableCustomBadgeStyling
    ? (rowData?.secondaryCustomThemeColor || primaryColor)
    : (eventData?.appSetting?.primaryDarker || primaryColor);

  // Calculate contrast color for better readability
  const getContrastColor = (hexColor) => {
    if (!hexColor || !hexColor.startsWith("#")) return "#FFFFFF";
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  // Create gradient style matching backend (horizontal gradient)
  const gradientStyle = {
    background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
  };

  const headerTextColor = getContrastColor(primaryColor);

  // Get event logo and banner
  const eventLogo = eventData?.logo || rowData?.event?.logo;
  const eventBanner = eventData?.banner || rowData?.event?.banner;
  const cdnUrl = import.meta.env.VITE_CDN || "";

  // Helper function to get field value based on field ID
  const getFieldValue = (fieldId) => {
    switch (fieldId) {
      case "eventTitle":
        return eventData?.title || rowData?.event?.title || "Event Title";

      case "ticketTitle":
        return rowData?.title || "Ticket Title";

      case "name":
        return rowData?.name || "Participant Name";

      case "eventDate":
        if (eventData?.startDate || rowData?.event?.startDate) {
          const date = eventData?.startDate || rowData?.event?.startDate;
          return moment(date).format("MMM D, YYYY");
        }
        return "Event Date";

      case "eventTime":
        if (eventData?.startDate || rowData?.event?.startDate) {
          const date = eventData?.startDate || rowData?.event?.startDate;
          return moment(date).format("h:mm A");
        }
        return "Event Time";

      case "ticketDate":
        if (rowData?.startDate) {
          return moment(rowData.startDate).format("MMM D, YYYY");
        }
        return "Ticket Date";

      case "ticketTime":
        if (rowData?.saleStartDate) {
          return moment(rowData.saleStartDate).format("h:mm A");
        }
        return "Ticket Time";

      case "location":
        return eventData?.venue || rowData?.event?.venue || rowData?.location || "Location";

      case "custom":
        return rowData?.customText || "Custom Field";

      default:
        return "N/A";
    }
  };

  // Helper function to get field label
  const getFieldLabel = (fieldId) => {
    switch (fieldId) {
      case "eventTitle":
        return "Event";
      case "ticketTitle":
        return "Ticket Type";
      case "name":
        return "Name";
      case "eventDate":
        return "Date";
      case "eventTime":
        return "Time";
      case "ticketDate":
        return "Ticket Date";
      case "ticketTime":
        return "Ticket Time";
      case "location":
        return "Location";
      case "custom":
        return "Custom";
      default:
        return fieldId;
    }
  };

  // Helper function to get field icon (Lucide React)
  const getFieldIcon = (fieldId) => {
    const iconProps = { size: 14, strokeWidth: 2 };

    switch (fieldId) {
      case "eventTitle":
        return <PartyPopper {...iconProps} />;
      case "ticketTitle":
        return <TicketIcon {...iconProps} />;
      case "name":
        return <User {...iconProps} />;
      case "eventDate":
      case "ticketDate":
        return <Calendar {...iconProps} />;
      case "eventTime":
      case "ticketTime":
        return <Clock {...iconProps} />;
      case "location":
        return <MapPin {...iconProps} />;
      case "custom":
        return <Sparkles {...iconProps} />;
      default:
        return null;
    }
  };

  // Get ordered fields based on ticketBadgeFields
  // ticketBadgeFields is an array of field name strings: ["eventTitle", "ticketTitle", "name", ...]
  // Maximum 5 fields, rendered in exact order (index 0, 1, 2, 3, 4)
  const orderedFields = React.useMemo(() => {
    if (!ticketBadgeFields || ticketBadgeFields.length === 0) {
      return [];
    }

    return ticketBadgeFields.slice(0, 6); // Maximum 5 fields
  }, [ticketBadgeFields]);

  // Generate QR code value
  const qrValue = rowData?._id || rowData?.id || "TICKET-ID";

  // Format ticket number with custom prefix if enabled
  const formatTicketNumber = () => {
    // Use the starting number directly from rowData (backend already calculated this)
    if (rowData?.startingNumber) {
      const prefix = (rowData?.seriesPrefix || "TKT").toUpperCase();
      const paddedNumber = rowData.startingNumber.toString().padStart(5, "0");
      return `${prefix}${paddedNumber}`;
    }

    // Fallback to formatted ticket number or ticket ID
    return rowData?.formattedTicketNumber || (rowData?.ticketNumber ? `#${rowData.ticketNumber}` : qrValue.slice(-7));
  };

  return (
    <div className="w-full max-w-[350px] mx-auto my-5 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]" style={gradientStyle}>
      {/* Gradient background with white inner card */}
      <div className="p-[12px] pb-0">
        {/* White inner card with rounded corners and notch cutouts */}
        <div
          className="bg-white rounded-[20px] relative"
          style={{
            WebkitMaskImage: `
              radial-gradient(circle 12.5px at 0 310px, transparent 12.5px, white 12.5px),
              radial-gradient(circle 12.5px at 100% 310px, transparent 12.5px, white 12.5px)
            `,
            maskImage: `
              radial-gradient(circle 12.5px at 0 310px, transparent 12.5px, white 12.5px),
              radial-gradient(circle 12.5px at 100% 310px, transparent 12.5px, white 12.5px)
            `,
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
          >
           {/* Event Banner - 15px margin, rounded corners, aspect ratio 1:2.43 */}
           {eventBanner && (
            <div className="mx-[15px] mt-[0px] mb-2 rounded-[12.5px] overflow-hidden" style={{ height: "calc((100% - 30px) / 2.43)", maxHeight: "122px" }}>
              <img src={eventBanner.startsWith("http") ? eventBanner : `${cdnUrl}${eventBanner}`} alt="Event Banner" className="w-full h-full object-cover mt-[15px] rounded-[10px]" />
            </div>
          )}

          {/* Content Section - 20px horizontal padding */}
          <div className="px-[20px] pb-[10px]">
            {rowData?.enableCustomBadgeStyling ? (
              // Custom layout based on ticketBadgeFields selection
              <>
                {/* eventTitle and ticketTitle render as title/description in their selected order */}
                {/* Other fields render in grid: 2 rows × 2 columns (4 slots total) */}
                {/* Name & Location take 2 columns (full row), others take 1 column */}
                <div className="space-y-[8px] h-[170px]">
                  {orderedFields.map((fieldId, index) => {
                    const fieldValue = getFieldValue(fieldId);
                    const fieldLabel = getFieldLabel(fieldId);
                    const fieldIcon = getFieldIcon(fieldId);

                    // eventTitle: Always renders as title (16px bold, primary color)
                    if (fieldId === "eventTitle") {
                      return (
                        <div key={`${fieldId}-${index}`} className="mb-[8px]">
                          <h1
                            className="text-[16px] font-bold leading-[20px] text-left"
                            style={{
                              color: primaryColor,
                            }}
                          >
                            {fieldValue}
                          </h1>
                        </div>
                      );
                    }

                    // ticketTitle: Always renders as description (13px bold, black)
                    if (fieldId === "ticketTitle") {
                      return (
                        <div key={`${fieldId}-${index}`} className="mb-[10px]">
                          <div className="text-[13px] font-bold text-[#000000]">{fieldValue}</div>
                        </div>
                      );
                    }

                    // Other fields will be rendered in grid below
                    return null;
                  })}

                  {/* Grid layout for non-title fields with flexible column allocation */}
                  {(() => {
                    const detailFields = orderedFields.filter((fieldId) => fieldId !== "eventTitle" && fieldId !== "ticketTitle");

                    if (detailFields.length === 0) return null;

                    let columnsFilled = 0;

                    return (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 h-[170px] content-baseline">
                        {detailFields.map((fieldId, idx) => {
                          // Stop if we've filled 4 columns (2 rows × 2 columns)
                          if (columnsFilled >= 4) return null;

                          const fieldValue = getFieldValue(fieldId);
                          const fieldLabel = getFieldLabel(fieldId);
                          const fieldIcon = getFieldIcon(fieldId);

                          // Name and Location take 2 columns (full row)
                          const isFullWidth = fieldId === "name" || fieldId === "location";
                          const colSpan = isFullWidth ? 2 : 1;

                          columnsFilled += colSpan;

                          return (
                            <div key={`${fieldId}-${idx}`} className="flex items-start gap-[4px]" style={{ gridColumn: isFullWidth ? "span 2" : "span 1" }}>
                              <span className="flex-shrink-0 mt-[0px]">{fieldIcon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-light uppercase tracking-wide text-text-sub">{fieldLabel}</div>
                                <div className="text-[12px] font-medium text-text-main mt-[1px]">{fieldValue}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              // Default layout when custom styling is not enabled
              <div className="space-y-[8px] h-[170px]">
                {/* Event Title - Full width */}
                <div className="mb-[8px]">
                  <h1
                    className="text-[16px] font-bold leading-[20px] text-left"
                    style={{
                      color: primaryColor,
                    }}
                  >
                    {eventData?.title || rowData?.event?.title || "Event Title"}
                  </h1>
                </div>

                {/* Ticket Title - Full width */}
                <div className="mb-[10px]">
                  <div className="text-[13px] font-bold text-[#000000]">{rowData?.title || "Ticket Type"}</div>
                </div>

                {/* Name - Full width */}
                <div className="flex items-start gap-[4px] mb-[8px]">
                  <span className="flex-shrink-0 mt-[2px]">
                    <User size={14} strokeWidth={2} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-light uppercase tracking-wide text-text-sub">NAME</div>
                    <div className="text-[12px] font-medium text-text-main mt-[1px]">{rowData?.name || "Participant Name"}</div>
                  </div>
                </div>

                {/* Date & Time - Half width each */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {/* Event Date */}
                  <div className="flex items-start gap-[4px]">
                    <span className="flex-shrink-0 mt-[2px]">
                      <Calendar size={14} strokeWidth={2} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-light uppercase tracking-wide text-text-sub">DATE</div>
                      <div className="text-[12px] font-medium text-text-main mt-[1px]">{eventData?.startDate ? moment(eventData.startDate).format("DD MMM YYYY") : "Event Date"}</div>
                    </div>
                  </div>

                  {/* Event Time */}
                  <div className="flex items-start gap-[4px]">
                    <span className="flex-shrink-0 mt-[2px]">
                      <Clock size={14} strokeWidth={2} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-light uppercase tracking-wide text-text-sub">TIME</div>
                      <div className="text-[12px] font-medium text-text-main mt-[0px]">{eventData?.startDate ? moment(eventData.startDate).format("hh:mm A") : "Event Time"}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dashed separator line - 1px stroke, 5px dash, accent color */}
          <div
            className="border-t border-dashed my-[8px]"
            style={{
              borderColor: primaryColor,
              borderWidth: "1px",
              borderStyle: "dashed",
            }}
          />

          {/* QR Code Section - 20px padding below notch line */}
          <div className="flex flex-col items-center gap-[0px] p-[10px]">
            {/* QR Code - 70px for 1 line title, 90px for 2+ lines */}
            <div className="bg-white">
              <QRCode value={qrValue} size={90} level="M" className="bg-white" />
            </div>

            {/* Ticket ID - 12px medium font, 8px below QR */}
            <div className="text-center font-mono text-[12px] font-medium uppercase tracking-wider text-text-main">{formatTicketNumber()}</div>
          </div>
        </div>

        {/* Footer Branding - Outside white card, part of gradient background */}
        <div className="flex items-center justify-center gap-[8px] text-[12px] text-white font-normal py-3 rounded-b-[20px]">
          <span>Developed By</span>
          <img src={EventHexLogo} alt="EventHex" className="h-[20px] w-auto" style={{ filter: "brightness(0) invert(1)" }} />
        </div>
      </div>
    </div>
  );
};

export default Ticket;
