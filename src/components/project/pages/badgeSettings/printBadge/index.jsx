import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronRight,
  ArrowLeft,
  QrCode,
  Image as ImageIcon,
  Type,
  User,
  UserCheck,
  Building,
  Ticket,
  GripVertical,
  Lock,
  Unlock,
  Trash2,
  Printer,
  Download,
  X,
  Users,
  CheckCircle2,
  Layers,
  FileText,
  Settings,
  File,
  LayoutGrid,
  Eye,
  Monitor,
} from "lucide-react";
import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import QRCode from "qrcode";
// import { getData, postData } from "../../../../../../backend/api";
import { getData, postData } from "../../../../../backend/api";

// Fast PDF Generation using direct jsPDF drawing instead of html2canvas
// This replaces the slow handleDownload and generatePdfPreview functions

import jsPDF from "jspdf";
import QRCode from "qrcode";
import { QRCodeSVG } from "qrcode.react";

// Helper: Generate QR code as base64 with caching
const generateQRCodeDataURL = async (text, options = {}, qrCache) => {
  if (!text) return null;

  const cacheKey = JSON.stringify({
    v: String(text),
    s: options.size || 150,
    bg: options.bgColor || "#FFFFFF",
    fg: options.fgColor || "#000000",
  });

  if (qrCache.has(cacheKey)) {
    return qrCache.get(cacheKey);
  }

  try {
      const qrDataURL = await QRCode.toDataURL(text, {
        width: options.size || 150,
        margin: 0,
        color: {
          dark: options.fgColor || "#000000",
          light: options.bgColor || "#FFFFFF",
        },
        errorCorrectionLevel: "L",
      });
    qrCache.set(cacheKey, qrDataURL);
    return qrDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
};

// --- Main Print Badge Component ---
const PrintBadge = ({ onClose, badge, badgeData, eventId }) => {
  console.log("badgeData", badgeData);
  console.log("badge", badge);
  // Support both prop names; prefer explicit badgeData if provided
  const activeBadge = badgeData || badge || {};
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 State
  const [attendeeSelection, setAttendeeSelection] = useState("all");
  const [badgeFormat, setBadgeFormat] = useState("both");

  // Step 2 State
  const [paperSize, setPaperSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [badgesPerPage, setBadgesPerPage] = useState("auto");
  const [includeTrimMarks, setIncludeTrimMarks] = useState(false);

  // Data State
  const [registrations, setRegistrations] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({ total: 0, new: 0 });
  const [unprintedCount, setUnprintedCount] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewRegistration, setPreviewRegistration] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [eventData, setEventData] = useState(null);

  // Caches and parsed builder data reuse
  const qrCacheRef = useRef(new Map());
  const parsedRef = useRef({ elements: [], background: null, contentElements: [] });

  // Helper to extract string ID from event or ticket
  const getId = (id) => {
    if (!id) return undefined;
    if (typeof id === "object" && id.$oid) return id.$oid;
    if (typeof id === "object" && id._id) return id._id;
    return id;
  };

  // Helper function to generate QR code as data URL (memoized by value and options)
  const generateQRCodeDataURL = async (text, options = {}) => {
    try {
      if (!text) return null;
      const cacheKey = JSON.stringify({
        v: String(text),
        s: Math.round(options.size || 150),
        bg: options.bgColor || "#FFFFFF",
        fg: options.fgColor || "#000000",
        lvl: options.level || "L",
        m: options.includeMargin !== false,
      });
      const existing = qrCacheRef.current.get(cacheKey);
      if (existing) return existing;
      const qrDataURL = await QRCode.toDataURL(text, {
        width: Math.round(options.size || 150),
        margin: 0,
        color: {
          dark: options.fgColor || "#000000",
          light: options.bgColor || "#FFFFFF",
        },
        errorCorrectionLevel: options.level || "L",
      });
      qrCacheRef.current.set(cacheKey, qrDataURL);
      return qrDataURL;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  // Helper function to safely parse badgeData
  const parseBadgeData = (badgeData) => {
    try {
      if (!badgeData?.builderData) {
        console.warn("No builderData found in badgeData");
        return { elements: [], background: null, backgroundLayerElements: [], contentElements: [] };
      }

      const elements = JSON.parse(badgeData.builderData);
      if (!Array.isArray(elements)) {
        console.warn("builderData is not an array");
        return { elements: [], background: null, backgroundLayerElements: [], contentElements: [] };
      }

      const background = elements.find((el) => el.type === "background");
      
      // Background layer elements: background image, event, ticket, location, start date, end date, description, banner
      const backgroundLayerElements = elements.filter((el) => {
        return (
          el.type === "background" ||
          el.preset === "event" ||
          el.preset === "ticket" ||
          el.preset === "location" ||
          el.preset === "startDate" ||
          el.preset === "endDate" ||
          el.preset === "description" ||
          el.preset === "banner"
        );
      });
      
      // Dynamic layer elements: all other elements except background layers
      const contentElements = elements.filter((el) => {
        return !(
          el.type === "background" ||
          el.preset === "event" ||
          el.preset === "ticket" ||
          el.preset === "location" ||
          el.preset === "startDate" ||
          el.preset === "endDate" ||
          el.preset === "description" ||
          el.preset === "banner"
        );
      });

      // Debug logging for print component
      console.log(
        "PrintBadge - All elements:",
        elements.map((el) => ({
          id: el.id,
          type: el.type,
          preset: el.preset,
          label: el.label,
          positionX: el.positionX,
          positionY: el.positionY,
          width: el.width,
          height: el.height,
        }))
      );
      
      console.log(
        "PrintBadge - Background layer elements:",
        backgroundLayerElements.map((el) => ({
          id: el.id,
          type: el.type,
          preset: el.preset,
          label: el.label,
        }))
      );
      
      console.log(
        "PrintBadge - Content elements:",
        contentElements.map((el) => ({
          id: el.id,
          type: el.type,
          preset: el.preset,
          label: el.label,
        }))
      );

      return { elements, background, backgroundLayerElements, contentElements };
    } catch (error) {
      console.error("Error parsing badgeData.builderData:", error);
      return { elements: [], background: null, backgroundLayerElements: [], contentElements: [] };
    }
  };

  // Keep parsed builder data cached for reuse
  useEffect(() => {
    parsedRef.current = parseBadgeData(activeBadge);
  }, [activeBadge?.builderData]);

  // Helper function to get background image URL
  const getBackgroundImageUrl = (badgeData, backgroundElement) => {
    const CDN_PREFIX = "https://event-manager.syd1.digitaloceanspaces.com/";

    // Prefer badgeData.backgroundImage
    if (badgeData?.backgroundImage) {
      if (badgeData.backgroundImage.startsWith("http")) {
        return badgeData.backgroundImage;
      }
      if (badgeData.backgroundImage.startsWith("blob:")) {
        return badgeData.backgroundImage;
      }
      return CDN_PREFIX + badgeData.backgroundImage;
    }

    // Fallback to background element from builderData
    if (backgroundElement?.src) {
      if (backgroundElement.src.startsWith("http")) {
        return backgroundElement.src;
      }
      if (backgroundElement.src.startsWith("blob:")) {
        return backgroundElement.src;
      }
      return CDN_PREFIX + backgroundElement.src;
    }

    return null;
  };

  // Helper function to get badge dimensions in CM
  const getBadgeDimensions = (badgeData) => {
    const defaultWidthCM = 8.5;
    const defaultHeightCM = 5.5;
    const width = badgeData?.layoutWidth;
    const height = badgeData?.layoutHeight;
    return {
      width: width && width > 0 ? width : defaultWidthCM,
      height: height && height > 0 ? height : defaultHeightCM,
    };
  };

  // Fetch registration counts and preview registration
  useEffect(() => {
    const fetchRegistrationCountsAndPreview = async () => {
      setIsLoadingRegistrations(true);
      try {
        console.log("🔄 Fetching registrations...");
        const eventId = getId(activeBadge?.event);
        const ticketId = getId(activeBadge?.ticket);

        // Fetch event data for banner and other event fields
        if (eventId) {
          try {
            const eventResponse = await getData({ id: eventId }, 'event');
            if (eventResponse?.data?.response) {
              setEventData(eventResponse.data.response);
              console.log("✅ Event data loaded:", eventResponse.data.response);
            }
          } catch (error) {
            console.error("❌ Failed to fetch event data:", error);
          }
        }

        // Fetch registrations: if badge tied to a ticket → only that ticket; else all for the event
        const query = { event: eventId, skip: 0, limit: 100000 };
        if (ticketId) {
          query.ticket = ticketId;
        }
        const registrationsResponse = await getData(query, "ticket-registration/form");
        const registrations = registrationsResponse?.data?.response || [];
        setRegistrations(registrations);
        const totalCount = registrations.length;

        // Fetch new registrations count (registered within 2 days before event)
        let newCount = 0;
        let eventStartDate = activeBadge?.event?.startDate ? new Date(activeBadge.event.startDate) : null;
        if (!eventStartDate && registrations.length > 0 && registrations[0].event?.startDate) {
          eventStartDate = new Date(registrations[0].event.startDate);
        }
        const twoDaysBeforeEvent = eventStartDate ? new Date(eventStartDate.getTime() - 2 * 24 * 60 * 60 * 1000) : null;
        if (eventStartDate && twoDaysBeforeEvent) {
          newCount = registrations.filter((reg) => {
            const regDate = new Date(reg.createdAt || reg.created_at || reg.date);
            return regDate >= twoDaysBeforeEvent && regDate <= eventStartDate;
          }).length;
        }

        setRegistrationCounts({ total: totalCount, new: newCount });

        // Set the first registration for preview
        setPreviewRegistration(registrations[0] || null);

        console.log("✅ Registrations loaded:", {
          total: totalCount,
          new: newCount,
          hasPreview: !!registrations[0],
        });
      } catch (error) {
        console.error("❌ Failed to fetch registrations:", error);
        setRegistrationCounts({ total: 0, new: 0 });
        setPreviewRegistration(null);
        setRegistrations([]);
      } finally {
        setIsLoadingRegistrations(false);
      }
    };

    if (activeBadge?.event) {
      fetchRegistrationCountsAndPreview();
    }
  }, [activeBadge?.event, activeBadge?.ticket]);

  // Update unprinted count when attendee selection changes
  useEffect(() => {
    const fetchUnprintedCount = async () => {
      // Only meaningful when the badge is tied to a specific ticket
      if (attendeeSelection === "new" && activeBadge?.event?._id && activeBadge?.ticket?._id) {
        try {
          const response = await getData(
            {
              eventId: activeBadge.event._id,
              ticketId: activeBadge.ticket._id,
              filterType: "new",
            },
            "badge-download/undownloaded-registrations"
          );
          const data = response?.data;
          if (data?.success) {
            setUnprintedCount(data.data.count);
          } else {
            setUnprintedCount(0);
          }
        } catch (error) {
          setUnprintedCount(0);
        }
      } else {
        setUnprintedCount(0);
      }
    };

    fetchUnprintedCount();
  }, [activeBadge?.event?._id, activeBadge?.ticket?._id, attendeeSelection]);

  // Get selected count based on attendee selection
  const getSelectedCount = () => {
    switch (attendeeSelection) {
      case "all":
        return registrationCounts.total || 0;
      case "new":
        return unprintedCount;
      default:
        return 0;
    }
  };

  // Helper: Get page size in mm based on settings
  function getPageSize() {
    let width = 210,
      height = 297; // Default A4 portrait
    if (paperSize === "A4") {
      width = 210;
      height = 297;
    } else if (paperSize === "A3") {
      width = 297;
      height = 420;
    }
    if (orientation === "landscape") {
      return { width: height, height: width };
    }
    return { width, height };
  }

  // Helper: Calculate optimal grid layout (uses badge dimensions in CM)
  function getGridLayout(badgeDataArg = activeBadge) {
    const { width: pageWidth, height: pageHeight } = getPageSize();
    const { width: badgeWidthCM, height: badgeHeightCM } = getBadgeDimensions(badgeDataArg);

    // Convert badge dimensions from cm to mm
    const badgeWidthMM = badgeWidthCM * 10;
    const badgeHeightMM = badgeHeightCM * 10;

    // Ensure minimum reasonable size in mm
    const minBadgeWidthMM = 30;
    const minBadgeHeightMM = 20;
    const finalBadgeWidthMM = Math.max(badgeWidthMM, minBadgeWidthMM);
    const finalBadgeHeightMM = Math.max(badgeHeightMM, minBadgeHeightMM);

    const paddingMM = 10; // page padding
    const minGapMM = 2; // minimum spacing between badges

    const usableWidth = pageWidth - paddingMM * 2;
    const usableHeight = pageHeight - paddingMM * 2;

    console.log("📏 Grid Layout Calculation:", {
      pageSize: `${pageWidth}×${pageHeight}mm`,
      badgeSize: `${finalBadgeWidthMM}×${finalBadgeHeightMM}mm`,
      usableArea: `${usableWidth}×${usableHeight}mm`,
    });

    // Check if even one badge fits
    if (finalBadgeWidthMM > usableWidth || finalBadgeHeightMM > usableHeight) {
      console.warn("⚠️ Badge too large for page!", {
        badgeSize: `${finalBadgeWidthMM}×${finalBadgeHeightMM}mm`,
        usableArea: `${usableWidth}×${usableHeight}mm`,
      });
      // Force 1x1 layout even if it doesn't fit properly
      return {
        cols: 1,
        rows: 1,
        badgesPerPage: 1,
        badgeWidthMM: usableWidth,
        badgeHeightMM: usableHeight,
        gapMM: 0,
      };
    }

    // Compute max columns/rows that actually fit with minimum gap
    let cols = Math.floor((usableWidth + minGapMM) / (finalBadgeWidthMM + minGapMM));
    let rows = Math.floor((usableHeight + minGapMM) / (finalBadgeHeightMM + minGapMM));

    // Ensure at least 1x1
    cols = Math.max(1, cols);
    rows = Math.max(1, rows);

    // Calculate actual gaps based on the layout
    const totalBadgeWidth = cols * finalBadgeWidthMM;
    const totalBadgeHeight = rows * finalBadgeHeightMM;
    const gapX = cols > 1 ? Math.max(0, (usableWidth - totalBadgeWidth) / (cols - 1)) : 0;
    const gapY = rows > 1 ? Math.max(0, (usableHeight - totalBadgeHeight) / (rows - 1)) : 0;

    const badgeWidthForGrid = finalBadgeWidthMM;
    const badgeHeightForGrid = finalBadgeHeightMM;

    const result = {
      cols,
      rows,
      badgesPerPage: cols * rows,
      badgeWidthMM: badgeWidthForGrid,
      badgeHeightMM: badgeHeightForGrid,
      gapMM: Math.min(gapX, gapY),
    };

    console.log("📊 Grid Layout Result:", result);
    return result;
  }

  // Helper: Wait for all images in a container to load
  function waitForImagesToLoad(container) {
    const images = container.querySelectorAll("img");
    return Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        });
      })
    );
  }

  // Render badge HTML for PDF generation
  function renderBadgeHTML(badgeData, registration, widthMM, heightMM, format = "both") {
    const { elements, background, backgroundLayerElements, contentElements } = parsedRef.current;
    const backgroundImageUrl = getBackgroundImageUrl(badgeData, background);
    const { width: originalWidth, height: originalHeight } = getBadgeDimensions(badgeData);

    // Convert mm to px for rendering
    const widthPx = widthMM * 3.7795275591; // 1mm = 3.78px
    const heightPx = heightMM * 3.7795275591;

    // Original dimensions from badgeData are in cm, convert to a consistent unit (e.g., px) for scaling
    // Assuming 1cm = 37.8px
    const originalWidthPx = originalWidth * 37.795275591;
    const originalHeightPx = originalHeight * 37.795275591;

    // Determine what to show
    const showBackground = format === "print" || format === "both";
    const showContent = format === "both";

    // Background handling
    let backgroundStyle = "";
    if (showBackground && backgroundImageUrl) {
      backgroundStyle = `background: url('${backgroundImageUrl}') center/cover no-repeat;`;
    } else if (showBackground) {
      backgroundStyle = "background: #ffffff;";
    } else {
      backgroundStyle = "background: transparent;";
    }

    // Enhanced getValue function
    // const getValue = (el) => {
    //     let value = null;

    //     if (el.preset === "name" || el.var === "name" || el.label === "Name") {
    //         value = registration?.fullName || registration?.name || (registration?.firstName && registration?.lastName ? `${registration.firstName} ${registration.lastName}` : null) || registration?.firstName || "Attendee Name";
    //         return value;
    //     }

    //     if (el.preset === "event" || el.var === "event" || el.label === "Event") {
    //         if (registration?.event && typeof registration.event === "object") {
    //             value = registration.event.title || registration.event.name || registration.event.value || "Event Name";
    //         } else {
    //             value = registration?.event || "Event Name";
    //         }
    //         return value;
    //     }

    //     if (el.preset === "ticket" || el.var === "ticket" || el.label === "Ticket") {
    //         if (registration?.ticket && typeof registration.ticket === "object") {
    //             value = registration.ticket.title || registration.ticket.name || registration.ticket.value || "Ticket Type";
    //         } else {
    //             value = registration?.ticketName || registration?.ticket || "Ticket Type";
    //         }
    //         return value;
    //     }

    //     if (el.type === "qr") {
    //         return registration?._id || registration?.registrationId || registration?.id || "QR_CODE_DATA";
    //     }

    //     // Handle user field types
    //     if (el.var && registration?.formData) {
    //         const fieldValue = registration.formData[el.var];
    //         if (fieldValue !== undefined && fieldValue !== null) {
    //             if (el.fieldType === "checkbox") {
    //                 return fieldValue ? "☑ Selected" : "☐ Not Selected";
    //             } else if (el.fieldType === "multiplechoice") {
    //                 return `○ ${fieldValue}`;
    //             } else if (el.fieldType === "select" || el.fieldType === "dropdown") {
    //                 return fieldValue;
    //             } else if (el.fieldType === "date") {
    //                 return new Date(fieldValue).toLocaleDateString();
    //             } else if (el.fieldType === "datetime") {
    //                 return new Date(fieldValue).toLocaleString();
    //             } else if (el.fieldType === "textarea" || el.fieldType === "paragraph") {
    //                 return fieldValue.length > 50 ? fieldValue.substring(0, 50) + "..." : fieldValue;
    //             }
    //             return fieldValue;
    //         }
    //     }

    //     // Generic handling
    //     if (el.preset && registration?.[el.preset] !== undefined) {
    //         value = registration[el.preset];
    //     } else if (el.var && registration?.[el.var] !== undefined) {
    //         value = registration[el.var];
    //     } else {
    //         value = el.content || el.label || "Sample Text";
    //     }

    //     if (typeof value === "object" && value !== null) {
    //         if (value.value) return value.value;
    //         if (value.label) return value.label;
    //         if (value.name) return value.name;
    //         if (value.title) return value.title;
    //         if (Array.isArray(value)) return value.join(", ");
    //         return JSON.stringify(value);
    //     }

    //     return String(value || el.content || el.label || "");
    // };

    // Generate QR codes as data URLs for proper PDF rendering
    const qrElements = contentElements.filter((el) => el.type === "qr");
    const qrPromises = qrElements.map(async (el) => {
      const qrValue = getValue(el, registration);
      // Convert CM to pixels for QR size calculation
      const qrSizePx = Math.min(el.width, el.height) * 37.795275591;
      const qrDataURL = await generateQRCodeDataURL(qrValue, {
        size: qrSizePx * 3, // Scale up for better quality
        bgColor: el.bgColor || "#FFFFFF",
        fgColor: el.fgColor || "#000000",
        level: el.level || "L",
        includeMargin: el.includeMargin !== false,
      });
      return { element: el, dataURL: qrDataURL };
    });

    // Return a promise that resolves to the HTML with embedded QR codes
    return Promise.all(qrPromises).then((qrResults) => {
      const qrMap = new Map(qrResults.map((result) => [result.element.id, result.dataURL]));

      return `
            <div class="badge-canvas" style="
                position: relative;
                width: ${widthPx}px;
                height: ${heightPx}px;
                ${backgroundStyle}
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid #ccc;
                margin: auto;
                display: block;
            ">
                ${
                  format === "print" || format === "both"
                    ? backgroundLayerElements
                        .map((el) => {
                          const scaleX = widthPx / originalWidthPx;
                          const scaleY = heightPx / originalHeightPx;

                          // Convert element dimensions from CM to pixels for positioning and sizing
                          const elPositionXPx = el.positionX * 37.795275591;
                          const elPositionYPx = el.positionY * 37.795275591;
                          const elWidthPx = el.width * 37.795275591;
                          const elHeightPx = el.height * 37.795275591;

                          if (
                            el.type === "text" ||
                            el.type === "textarea" ||
                            el.type === "paragraph" ||
                            el.type === "mobilenumber" ||
                            el.type === "number" ||
                            el.type === "date" ||
                            el.type === "datetime" ||
                            el.type === "email"
                          ) {
                            const textValue = getValue(el, registration);
                            return `
                                    <div style="
                                        position: absolute;
                                        left: ${elPositionXPx * scaleX}px;
                                        top: ${elPositionYPx * scaleY}px;
                                        width: ${elWidthPx * scaleX}px;
                                        height: ${elHeightPx * scaleY}px;
                                        color: ${el.color || "#000000"};
                                        font-size: ${(el.fontSize || 16) * scaleY}px;
                                        font-weight: ${el.fontWeight || "normal"};
                                        text-align: ${el.textAlign || "center"};
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-family: Arial, sans-serif;
                                        overflow: hidden;
                                    ">${textValue}</div>
                                `;
                          }

                          if (el.type === "select" || el.type === "dropdown" || el.type === "multiplechoice" || el.type === "checkbox") {
                            const selectValue = getValue(el, registration);
                            return `
                        <div style="
                            position: absolute;
                            left: ${elPositionXPx * scaleX}px;
                            top: ${elPositionYPx * scaleY}px;
                            width: ${elWidthPx * scaleX}px;
                            height: ${elHeightPx * scaleY}px;
                            color: ${el.color || "#000000"};
                            font-size: ${(el.fontSize || 14) * scaleY}px;
                            font-weight: ${el.fontWeight || "normal"};
                            text-align: ${el.textAlign || "left"};
                            display: flex;
                            align-items: center;
                            font-family: Arial, sans-serif;
                            overflow: hidden;
                        ">${selectValue}</div>
                    `;
                          }

                          if (el.type === "qr") {
                            const qrDataURL = qrMap.get(el.id);
                            if (qrDataURL) {
                              return `
                            <div style="
                                position: absolute;
                                left: ${elPositionXPx * scaleX}px;
                                top: ${elPositionYPx * scaleY}px;
                                width: ${elWidthPx * scaleX}px;
                                height: ${elHeightPx * scaleY}px;
                                background: ${el.bgColor || "#ffffff"};
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <img src="${qrDataURL}" style="width: 100%; height: 100%; object-fit: contain;" alt="QR Code" />
                            </div>
                        `;
                            } else {
                              return `
                            <div style="
                                position: absolute;
                                left: ${elPositionXPx * scaleX}px;
                                top: ${elPositionYPx * scaleY}px;
                                width: ${elWidthPx * scaleX}px;
                                height: ${elHeightPx * scaleY}px;
                                background: ${el.bgColor || "#ffffff"};
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border: 1px solid #000;
                                font-size: 8px;
                                color: #666;
                            ">QR Error</div>
                        `;
                            }
                          }

                          if (el.type === "image") {
                            return `
                        <div style="
                            position: absolute;
                            left: ${elPositionXPx * scaleX}px;
                            top: ${elPositionYPx * scaleY}px;
                            width: ${elWidthPx * scaleX}px;
                            height: ${elHeightPx * scaleY}px;
                            background: ${el.bgColor || "#f0f0f0"};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: 1px solid #ccc;
                            font-size: 8px;
                            color: #666;
                        ">Image</div>
                    `;
                          }

                          return "";
                        })
                        .join("")
                    : ""
                }
                ${
                  showContent
                    ? contentElements
                        .map((el) => {
                          const scaleX = widthPx / originalWidthPx;
                          const scaleY = heightPx / originalHeightPx;

                          // Convert element dimensions from CM to pixels for positioning and sizing
                          const elPositionXPx = el.positionX * 37.795275591;
                          const elPositionYPx = el.positionY * 37.795275591;
                          const elWidthPx = el.width * 37.795275591;
                          const elHeightPx = el.height * 37.795275591;

                          // Debug logging for element conversion
                          if (el.type === "qr") {
                            console.log("QR Element conversion:", {
                              original: { positionX: el.positionX, positionY: el.positionY, width: el.width, height: el.height },
                              converted: { positionX: elPositionXPx, positionY: elPositionYPx, width: elWidthPx, height: elHeightPx },
                              scale: { scaleX, scaleY },
                            });
                          }

                          if (
                            el.type === "text" ||
                            el.type === "textarea" ||
                            el.type === "paragraph" ||
                            el.type === "mobilenumber" ||
                            el.type === "number" ||
                            el.type === "date" ||
                            el.type === "datetime" ||
                            el.type === "email"
                          ) {
                            const textValue = getValue(el, registration);
                            return `
                                    <div style="
                                        position: absolute;
                                        left: ${elPositionXPx * scaleX}px;
                                        top: ${elPositionYPx * scaleY}px;
                                        width: ${elWidthPx * scaleX}px;
                                        height: ${elHeightPx * scaleY}px;
                                        color: ${el.color || "#000000"};
                                        font-size: ${(el.fontSize || 16) * scaleY}px;
                                        font-weight: ${el.fontWeight || "normal"};
                                        text-align: ${el.textAlign || "center"};
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-family: Arial, sans-serif;
                                        overflow: hidden;
                                    ">${textValue}</div>
                                `;
                          }

                          if (el.type === "select" || el.type === "dropdown" || el.type === "multiplechoice" || el.type === "checkbox") {
                            const selectValue = getValue(el, registration);
                            return `
                        <div style="
                            position: absolute;
                            left: ${elPositionXPx * scaleX}px;
                            top: ${elPositionYPx * scaleY}px;
                            width: ${elWidthPx * scaleX}px;
                            height: ${elHeightPx * scaleY}px;
                            color: ${el.color || "#000000"};
                            font-size: ${(el.fontSize || 14) * scaleY}px;
                            font-weight: ${el.fontWeight || "normal"};
                            text-align: ${el.textAlign || "left"};
                            display: flex;
                            align-items: center;
                            font-family: Arial, sans-serif;
                            overflow: hidden;
                        ">${selectValue}</div>
                    `;
                          }

                          if (el.type === "qr") {
                            const qrDataURL = qrMap.get(el.id);
                            if (qrDataURL) {
                              return `
                            <div style="
                                position: absolute;
                                left: ${elPositionXPx * scaleX}px;
                                top: ${elPositionYPx * scaleY}px;
                                width: ${elWidthPx * scaleX}px;
                                height: ${elHeightPx * scaleY}px;
                                background: ${el.bgColor || "#ffffff"};
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <img src="${qrDataURL}" style="width: 100%; height: 100%; object-fit: contain;" alt="QR Code" />
                            </div>
                        `;
                            } else {
                              return `
                            <div style="
                                position: absolute;
                                left: ${elPositionXPx * scaleX}px;
                                top: ${elPositionYPx * scaleY}px;
                                width: ${elWidthPx * scaleX}px;
                                height: ${elHeightPx * scaleY}px;
                                background: ${el.bgColor || "#ffffff"};
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border: 1px solid #000;
                                font-size: 8px;
                                color: #666;
                            ">QR Error</div>
                        `;
                            }
                          }

                          if (el.type === "image" || el.type === "file") {
                            const imageValue = getValue(el, registration);
                            if (imageValue && imageValue !== "Sample Text" && imageValue !== null) {
                              return `
                            <div style="
                                position: absolute;
                                left: ${elPositionXPx * scaleX}px;
                                top: ${elPositionYPx * scaleY}px;
                                width: ${elWidthPx * scaleX}px;
                                height: ${elHeightPx * scaleY}px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border-radius: ${(el.borderRadius || 0) * 37.795275591 * scaleX}px;
                                border: ${(el.borderWidth || 0) * 37.795275591 * scaleX}px solid ${el.borderColor || "#000000"};
                                overflow: hidden;
                            ">
                                <img src="${imageValue}" style="width: 100%; height: 100%; object-fit: cover;" alt="User Image" />
                            </div>
                        `;
                            } else {
                              // Show placeholder for missing images
                              return `
                            <div style="
                                position: absolute;
                                left: ${elPositionXPx * scaleX}px;
                                top: ${elPositionYPx * scaleY}px;
                                width: ${elWidthPx * scaleX}px;
                                height: ${elHeightPx * scaleY}px;
                                background: ${el.bgColor || "#f0f0f0"};
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border: 1px solid #ccc;
                                font-size: 8px;
                                color: #666;
                            ">No Image</div>
                        `;
                            }
                          }

                          const fallbackValue = getValue(el, registration);
                          return `
                    <div style="
                        position: absolute;
                        left: ${elPositionXPx * scaleX}px;
                        top: ${elPositionYPx * scaleY}px;
                        width: ${elWidthPx * scaleX}px;
                        height: ${elHeightPx * scaleY}px;
                        color: ${el.color || "#000000"};
                        font-size: ${(el.fontSize || 14) * scaleY}px;
                        font-weight: ${el.fontWeight || "normal"};
                        text-align: ${el.textAlign || "center"};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: Arial, sans-serif;
                        overflow: hidden;
                    ">${fallbackValue}</div>
                `;
                        })
                        .join("")
                    : ""
                }
            </div>
        `;
    });
  }

  const generatePdfPreview = async () => {
    console.log("🎯 Starting PDF preview generation...");
    setIsLoadingPreview(true);

    if (!activeBadge || !activeBadge.builderData) {
      console.error("❌ No badge data available for preview");
      setPdfPreviewUrl(null);
      setIsLoadingPreview(false);
      return;
    }

    const { elements } = parsedRef.current;
    if (elements.length === 0) {
      console.error("❌ No badge elements found for preview");
      setPdfPreviewUrl(null);
      setIsLoadingPreview(false);
      return;
    }

    if (registrations.length === 0) {
      console.warn("⚠️ No registrations available for preview");
      setPdfPreviewUrl(null);
      setIsLoadingPreview(false);
      return;
    }

    console.log("📊 Preview data:", {
      badge: activeBadge?.name || "Unnamed Badge",
      elementsCount: elements.length,
      registrationsCount: registrations.length,
      attendeeSelection,
      badgeFormat,
    });

    try {
      //   console.log("📥 Starting download process...");

      // Filter registrations based on selected filter
      let filteredRegistrations = [...registrations];

      if (attendeeSelection === "new") {
        try {
          const response = await getData(
            {
              eventId: activeBadge.event._id,
              ticketId: activeBadge.ticket._id,
            },
            "badge-download/undownloaded-registrations"
          );

          const data = response?.data;
          if (data?.success && Array.isArray(data.undownloadedIds)) {
            filteredRegistrations = registrations.filter((reg) => data.undownloadedIds.includes(reg._id));
            // console.log(
            //   `📊 Found ${filteredRegistrations.length} undownloaded registrations`
            // );
          } else {
            // console.warn("No undownloaded registrations found");
            filteredRegistrations = [];
          }
        } catch (error) {
          console.error("Error fetching undownloaded registrations:", error);
          filteredRegistrations = [];
        }
      }

      // Calculate layout
      const { width: pageWidth, height: pageHeight } = getPageSize();
      const layout = getGridLayout(activeBadge);
      const cols = layout.cols;
      const rows = layout.rows;
      const badgesPerPage = layout.badgesPerPage;
      const totalPages = Math.min(Math.ceil(filteredRegistrations.length / badgesPerPage), 1); // Limit preview to first page for performance

      const badgeCellWidthMM = layout.badgeWidthMM;
      const badgeCellHeightMM = layout.badgeHeightMM;

      const format = badgeFormat;

      // Create container
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      document.body.appendChild(container);

      // Generate HTML with proper async QR handling
      const pagePromises = [];

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const badgePromises = [];

        for (let i = 0; i < badgesPerPage; i++) {
          const reg = filteredRegistrations[pageIndex * badgesPerPage + i];
          if (reg) {
            badgePromises.push(renderBadgeHTML(activeBadge, reg, badgeCellWidthMM, badgeCellHeightMM, format));
          } else {
            badgePromises.push(
              Promise.resolve(
                `<div class="badge-canvas" style="width:${badgeCellWidthMM * 3.78}px;height:${
                  badgeCellHeightMM * 3.78
                }px;border:1px solid #ccc;border-radius:8px;background:#fff;display:block;margin:auto;"></div>`
              )
            );
          }
        }

        pagePromises.push(
          Promise.all(badgePromises).then(
            (badgeHTMLs) => `
                            <div class="page" style="width:${pageWidth}mm;height:${pageHeight}mm;page-break-after:always;display:block;">
                                <div class="badge-grid" style="
                                    display:grid;
                                    grid-template-columns:repeat(${cols}, 1fr);
                                    grid-template-rows:repeat(${rows}, 1fr);
                                    gap:${layout.gapMM}mm;
                                    width:100%;height:100%;padding:10mm;">
                                    ${badgeHTMLs.join("")}
                                </div>
                            </div>
                        `
          )
        );
      }

      const pageHTMLs = await Promise.all(pagePromises);
      container.innerHTML = pageHTMLs.join("");

      //   console.log("🧪 Generated HTML for PDF with QR codes");

      // Wait for all images (including QR codes) to load
      await waitForImagesToLoad(container);

      // Generate PDF
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: paperSize.toLowerCase(),
      });

      const pages = container.querySelectorAll(".page");
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      }

      //   pdf.save("Badges.pdf");
      const pdfDataUri = pdf.output("datauristring");
      setPdfPreviewUrl(pdfDataUri);
      document.body.removeChild(container);

      console.log("✅ PDF preview generated successfully");
    } catch (error) {
      console.error("❌ PDF preview generation error:", error);
      setPdfPreviewUrl(null);
      // Don't show alert for preview errors, just log them
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    generatePdfPreviewOptimized();
  }, [activeBadge, registrations, attendeeSelection, badgeFormat, paperSize, orientation, badgesPerPage]);

  // Handle PDF download
  const handleDownload = async () => {
    if (!activeBadge || !activeBadge.builderData) {
      alert("Invalid badge data. Please check badge configuration.");
      return;
    }

    const { elements } = parsedRef.current;
    if (elements.length === 0) {
      alert("No badge elements found. Please check badge configuration.");
      return;
    }

    setIsDownloading(true);

    try {
      console.log("📥 Starting download process...");

      // Filter registrations based on selected filter
      let filteredRegistrations = [...registrations];

      if (attendeeSelection === "new") {
        try {
          const response = await getData(
            {
              eventId: activeBadge.event._id,
              ticketId: activeBadge.ticket._id,
            },
            "badge-download/undownloaded-registrations"
          );

          const data = response?.data;
          if (data?.success && Array.isArray(data.undownloadedIds)) {
            filteredRegistrations = registrations.filter((reg) => data.undownloadedIds.includes(reg._id));
            console.log(`📊 Found ${filteredRegistrations.length} undownloaded registrations`);
          } else {
            console.warn("No undownloaded registrations found");
            filteredRegistrations = [];
          }
        } catch (error) {
          console.error("Error fetching undownloaded registrations:", error);
          filteredRegistrations = [];
        }
      }

      // Calculate layout
      const { width: pageWidth, height: pageHeight } = getPageSize();
      const layout = getGridLayout(activeBadge);
      const cols = layout.cols;
      const rows = layout.rows;
      const badgesPerPage = layout.badgesPerPage;
      const totalPages = Math.ceil(filteredRegistrations.length / badgesPerPage);

      const badgeCellWidthMM = layout.badgeWidthMM;
      const badgeCellHeightMM = layout.badgeHeightMM;

      const format = badgeFormat;

      // Stream pages sequentially to reduce memory and speed up generation
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.overflow = "hidden";
      document.body.appendChild(container);

      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: paperSize.toLowerCase(),
      });

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const badgePromises = [];
        for (let i = 0; i < badgesPerPage; i++) {
          const reg = filteredRegistrations[pageIndex * badgesPerPage + i];
          if (reg) {
            badgePromises.push(renderBadgeHTML(activeBadge, reg, badgeCellWidthMM, badgeCellHeightMM, format));
          } else {
            badgePromises.push(
              Promise.resolve(
                `<div class=\"badge-canvas\" style=\"width:${badgeCellWidthMM * 3.78}px;height:${badgeCellHeightMM * 3.78}px;border:1px solid #ccc;border-radius:8px;background:#fff;display:block;margin:auto;\"></div>`
              )
            );
          }
        }

        const badgeHTMLs = await Promise.all(badgePromises);
        const pageHTML = `
                    <div class=\"page\" style=\"width:${pageWidth}mm;height:${pageHeight}mm;page-break-after:always;display:block;\">\n
                        <div class=\"badge-grid\" style=\"\n
                            display:grid;\n
                            grid-template-columns:repeat(${cols}, 1fr);\n
                            grid-template-rows:repeat(${rows}, 1fr);\n
                            gap:${layout.gapMM}mm;\n
                            width:100%;height:100%;padding:10mm;\">\n
                            ${badgeHTMLs.join("")}\n
                        </div>\n
                    </div>`;

        container.innerHTML = pageHTML;
        const pageEl = container.querySelector(".page");
        await waitForImagesToLoad(pageEl);

        if (pageIndex > 0) pdf.addPage();
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
          timeout: 30000,
        });
        const imgData = canvas.toDataURL("image/png");
        const pW = pdf.internal.pageSize.getWidth();
        const pH = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "PNG", 0, 0, pW, pH);
        container.innerHTML = "";
      }

      pdf.save("Badges.pdf");
      document.body.removeChild(container);

      // Batch update download count
      try {
        const ok = await updateBadgeDownloadCount(filteredRegistrations);
        if (!ok) console.warn("⚠️ Failed to update badge download count");
      } catch (e) {
        console.warn("⚠️ Download count update error", e);
      }
    } catch (error) {
      console.error("❌ Download error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Convert points to millimeters (1 pt = 1/72 inch; 1 inch = 25.4 mm)
  const pointsToMM = (pt) => (pt * 25.4) / 72;

  // Draw wrapped text inside a bounding box (x,y,width,height in mm)
  const drawWrappedText = (pdf, {
    text,
    x,
    y,
    widthMM,
    heightMM,
    align = "center",
    verticalAlign = "middle",
    fontSizePt,
    lineHeightPx,
  }) => {
    // Derive line height in mm from px → pt → mm
    const effectiveLineHeightPx = lineHeightPx && lineHeightPx > 0 ? lineHeightPx : (fontSizePt / 0.75) * 1.2; // default 1.2
    const lineHeightPt = effectiveLineHeightPx * 0.75;
    const lineHeightMM = pointsToMM(lineHeightPt);

    // Split text to fit the width in mm
    const lines = pdf.splitTextToSize(String(text ?? ""), widthMM);

    // Compute how many lines can fit in the given height
    const maxLines = Math.max(1, Math.floor(heightMM / lineHeightMM));
    let visibleLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      // Add ellipsis to the last visible line
      const last = visibleLines[visibleLines.length - 1];
      const ellipsis = "…";
      // Binary trim to fit with ellipsis
      let low = 0, high = last.length;
      while (low < high) {
        const mid = Math.floor((low + high + 1) / 2);
        const trial = last.slice(0, mid) + ellipsis;
        // Measure width by splitting to size of a single line width
        const trialLines = pdf.splitTextToSize(trial, widthMM);
        if (trialLines.length <= 1) low = mid; else high = mid - 1;
      }
      visibleLines[visibleLines.length - 1] = last.slice(0, low) + ellipsis;
    }

    // Vertical starting Y based on vertical alignment
    let startY = y;
    if (verticalAlign === "top") {
      startY = y + lineHeightMM * 0.85; // top baseline adjustment
    } else if (verticalAlign === "middle") {
      const contentHeight = visibleLines.length * lineHeightMM;
      startY = y + (heightMM - contentHeight) / 2 + lineHeightMM * 0.85;
    } else if (verticalAlign === "bottom") {
      const contentHeight = visibleLines.length * lineHeightMM;
      startY = y + heightMM - contentHeight + lineHeightMM * 0.85;
    }

    // Draw each line
    let currentY = startY;
    for (const line of visibleLines) {
      let textX = x;
      if (align === "center") textX = x + widthMM / 2;
      else if (align === "right") textX = x + widthMM;
      pdf.text(line, textX, currentY, { align, baseline: "alphabetic" });
      currentY += lineHeightMM;
      if (currentY > y + heightMM + 0.01) break;
    }
  };

  // Helper function to draw trim marks around a badge (dotted line style)
  const drawTrimMarks = (pdf, x, y, widthMM, heightMM) => {
    const lineThickness = 0.2; // Reduced thickness for dotted lines
    const dashLength = 1; // Length of each dash
    const gapLength = 1; // Length of gap between dashes
    const offset = 2; // Distance from badge edge
    
    // Set trim mark color (black)
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(lineThickness);
    
    // Set dash pattern for dotted lines
    pdf.setLineDashPattern([dashLength, gapLength], 0);
    
    // Top edge dotted line (above the badge)
    pdf.line(x, y - offset, x + widthMM, y - offset);
    
    // Bottom edge dotted line (below the badge)
    pdf.line(x, y + heightMM + offset, x + widthMM, y + heightMM + offset);
    
    // Left edge dotted line (to the left of the badge)
    pdf.line(x - offset, y, x - offset, y + heightMM);
    
    // Right edge dotted line (to the right of the badge)
    pdf.line(x + widthMM + offset, y, x + widthMM + offset, y + heightMM);
    
    // Reset line dash pattern for other drawing operations
    pdf.setLineDashPattern([], 0);
  };

  // Helper function to draw corner bracket trimmer marks at badge corners
  const drawCrosshairTrimmerLines = (pdf, x, y, widthMM, heightMM) => {
    const lineThickness = 0.3;
    const bracketLength = 4; // Length of each bracket arm
    const offset = 0.1; // Distance from badge corner (minimal gap)
    
    // Set trimmer line color (black)
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(lineThickness);
    
    // Reset dash pattern for solid lines
    pdf.setLineDashPattern([], 0);
    
    // Top-left corner bracket (L-shape pointing toward corner)
    // Horizontal line (right arm)
    pdf.line(x - offset, y - offset, x - offset + bracketLength, y - offset);
    // Vertical line (bottom arm)
    pdf.line(x - offset, y - offset, x - offset, y - offset + bracketLength);
    
    // Top-right corner bracket (L-shape pointing toward corner)
    // Horizontal line (left arm)
    pdf.line(x + widthMM + offset - bracketLength, y - offset, x + widthMM + offset, y - offset);
    // Vertical line (bottom arm)
    pdf.line(x + widthMM + offset, y - offset, x + widthMM + offset, y - offset + bracketLength);
    
    // Bottom-left corner bracket (L-shape pointing toward corner)
    // Horizontal line (right arm)
    pdf.line(x - offset, y + heightMM + offset, x - offset + bracketLength, y + heightMM + offset);
    // Vertical line (top arm)
    pdf.line(x - offset, y + heightMM + offset - bracketLength, x - offset, y + heightMM + offset);
    
    // Bottom-right corner bracket (L-shape pointing toward corner)
    // Horizontal line (left arm)
    pdf.line(x + widthMM + offset - bracketLength, y + heightMM + offset, x + widthMM + offset, y + heightMM + offset);
    // Vertical line (top arm)
    pdf.line(x + widthMM + offset, y + heightMM + offset - bracketLength, x + widthMM + offset, y + heightMM + offset);
  };

  // Fast badge renderer using direct PDF drawing
  const renderBadgeToPDF = async (pdf, badge, registration, x, y, widthMM, heightMM, format, parsedData, qrCache, includeTrimMarks = false) => {
    const { background, backgroundLayerElements, contentElements } = parsedData;
    const showBackground = format === "print" || format === "both";
    const showContent = format === "both";

    // Get badge dimensions
    const { width: originalWidthCM, height: originalHeightCM } = getBadgeDimensions(badge);
    const scaleX = widthMM / (originalWidthCM * 10);
    const scaleY = heightMM / (originalHeightCM * 10);

    // Draw crosshair trimmer lines if enabled
    if (includeTrimMarks) {
      drawCrosshairTrimmerLines(pdf, x, y, widthMM, heightMM);
    }

    // Draw border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(x, y, widthMM, heightMM);

    // Draw background if needed
    if (showBackground) {
      const backgroundUrl = getBackgroundImageUrl(badge, background);
      if (backgroundUrl && !backgroundUrl.startsWith("blob:")) {
        try {
          // For production, you'd load this once and cache it
          pdf.addImage(backgroundUrl, "JPEG", x, y, widthMM, heightMM);
        } catch (e) {
          // Fallback to white background
          pdf.setFillColor(255, 255, 255);
          pdf.rect(x, y, widthMM, heightMM, "F");
        }
      } else {
        // White background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(x, y, widthMM, heightMM, "F");
      }
    }

    // Draw background layer elements (event, ticket, location, dates, description)
    if (showBackground) {
      for (const el of backgroundLayerElements) {
        // Skip the background image element as it's handled above
        if (el.type === "background") continue;
        
        const elX = x + el.positionX * 10 * scaleX;
        const elY = y + el.positionY * 10 * scaleY;
        const elWidth = el.width * 10 * scaleX;
        const elHeight = el.height * 10 * scaleY;

        if (
          el.type === "text" ||
          el.type === "textarea" ||
          el.type === "paragraph" ||
          el.type === "mobilenumber" ||
          el.type === "number" ||
          el.type === "date" ||
          el.type === "datetime" ||
          el.type === "email"
        ) {
          const value = getValue(el, registration);
          const fontSize = (el.fontSize || 16) * scaleY * 0.75; // Convert px to pt

          pdf.setFontSize(fontSize);

          // Set text color with error handling
          try {
            const [r, g, b] = hexToRgb(el.color || "#000000");
            pdf.setTextColor(r, g, b);
          } catch (error) {
            console.warn("Invalid color for background layer text element:", el.color, error);
            pdf.setTextColor(0, 0, 0); // Default to black
          }

          // Text alignment
          let textX = elX;
          if (el.textAlign === "center") {
            textX = elX + elWidth / 2;
          } else if (el.textAlign === "right") {
            textX = elX + elWidth;
          }

          // Wrapped text rendering within element box
          drawWrappedText(pdf, {
            text: value,
            x: elX,
            y: elY,
            widthMM: elWidth,
            heightMM: elHeight,
            align: el.textAlign || "center",
            verticalAlign: "middle",
            fontSizePt: fontSize,
            lineHeightPx: el.lineHeight || (el.fontSize || 16) * 1.2,
          });
        } else if (el.type === "qr") {
          const qrValue = getValue(el, registration);
          const qrSize = Math.min(elWidth, elHeight) * 3.78; // Convert mm to px

          const qrDataURL = await generateQRCodeDataURL(
            qrValue,
            {
              size: Math.round(qrSize * 2), // Higher res for quality
              bgColor: el.bgColor || "#FFFFFF",
              fgColor: el.fgColor || "#000000",
            },
            qrCache
          );

          if (qrDataURL) {
            pdf.addImage(qrDataURL, "PNG", elX, elY, elWidth, elHeight);
          }
        } else if (el.type === "image" || el.type === "file") {
          const imageValue = getValue(el, registration);
          if (imageValue && imageValue !== "Sample Text" && imageValue !== null && !imageValue.startsWith("blob:")) {
            try {
              pdf.addImage(imageValue, "JPEG", elX, elY, elWidth, elHeight);
            } catch (e) {
              console.warn("Failed to add background layer image:", e);
              // Draw placeholder rectangle
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(elX, elY, elWidth, elHeight);
            }
          }
        }
      }
    }

    // Draw content elements
    if (showContent) {
      for (const el of contentElements) {
        const elX = x + el.positionX * 10 * scaleX;
        const elY = y + el.positionY * 10 * scaleY;
        const elWidth = el.width * 10 * scaleX;
        const elHeight = el.height * 10 * scaleY;

        if (
          el.type === "text" ||
          el.type === "textarea" ||
          el.type === "paragraph" ||
          el.type === "mobilenumber" ||
          el.type === "number" ||
          el.type === "date" ||
          el.type === "datetime" ||
          el.type === "email"
        ) {
          const value = getValue(el, registration);
          const fontSize = (el.fontSize || 16) * scaleY * 0.75; // Convert px to pt

          pdf.setFontSize(fontSize);

          // Set text color with error handling
          try {
            const [r, g, b] = hexToRgb(el.color || "#000000");
            pdf.setTextColor(r, g, b);
          } catch (error) {
            console.warn("Invalid color for text element:", el.color, error);
            pdf.setTextColor(0, 0, 0); // Default to black
          }

          // Text alignment
          let textX = elX;
          if (el.textAlign === "center") {
            textX = elX + elWidth / 2;
          } else if (el.textAlign === "right") {
            textX = elX + elWidth;
          }

          // Wrapped text rendering within element box
          drawWrappedText(pdf, {
            text: value,
            x: elX,
            y: elY,
            widthMM: elWidth,
            heightMM: elHeight,
            align: el.textAlign || "center",
            verticalAlign: "middle",
            fontSizePt: fontSize,
            lineHeightPx: el.lineHeight || (el.fontSize || 16) * 1.2,
          });
        } else if (el.type === "qr") {
          const qrValue = getValue(el, registration);
          const qrSize = Math.min(elWidth, elHeight) * 3.78; // Convert mm to px

          const qrDataURL = await generateQRCodeDataURL(
            qrValue,
            {
              size: Math.round(qrSize * 2), // Higher res for quality
              bgColor: el.bgColor || "#FFFFFF",
              fgColor: el.fgColor || "#000000",
            },
            qrCache
          );

          if (qrDataURL) {
            pdf.addImage(qrDataURL, "PNG", elX, elY, elWidth, elHeight);
          }
        } else if (el.type === "image" || el.type === "file") {
          const imageValue = getValue(el, registration);
          if (imageValue && imageValue !== "Sample Text" && imageValue !== null && !imageValue.startsWith("blob:")) {
            try {
              pdf.addImage(imageValue, "JPEG", elX, elY, elWidth, elHeight);
            } catch (e) {
              // Draw placeholder
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(elX, elY, elWidth, elHeight);
            }
          }
        } else if (["select", "dropdown", "multiplechoice", "checkbox"].includes(el.type)) {
          const value = getValue(el, registration);
          const fontSize = (el.fontSize || 14) * scaleY * 0.75;

          pdf.setFontSize(fontSize);

          // Set text color with error handling
          try {
            const [r, g, b] = hexToRgb(el.color || "#000000");
            pdf.setTextColor(r, g, b);
          } catch (error) {
            console.warn("Invalid color for select element:", el.color, error);
            pdf.setTextColor(0, 0, 0); // Default to black
          }

          pdf.text(value, elX, elY + elHeight / 2, {
            align: el.textAlign || "left",
            baseline: "middle",
          });
        }
      }
    }
  };
  // --- Reusable Components ---
  const OptionCard = ({ value, title, subtitle, icon: Icon, selection, setSelection, color = "blue" }) => {
    const isSelected = selection === value;
    const selectedClasses = isSelected ? `border-blue-500 bg-blue-50 ring-2 ring-blue-200` : "border-gray-200 bg-white hover:border-gray-300";
    return (
      <div onClick={() => setSelection(value)} className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${selectedClasses}`}>
        <div className={`p-2 rounded-md bg-${color}-100`}>
          <Icon size={20} className={`text-${color}-600`} />
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {isSelected && <CheckCircle2 size={20} className={`text-blue-500`} />}
      </div>
    );
  };

  const handleDownloadOptimized = async () => {
    if (!activeBadge || !activeBadge.builderData) {
      alert("Invalid badge data.");
      return;
    }

    setIsDownloading(true);
    const qrCache = new Map();

    try {
      console.log("📥 Starting optimized download...");

      // Get filtered registrations
      let filteredRegistrations = [...registrations];
      if (attendeeSelection === "new") {
        // ... existing filtering logic ...
      }

      // Setup PDF
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: paperSize.toLowerCase(),
      });

      // Get layout
      const { width: pageWidth, height: pageHeight } = getPageSize();
      const layout = getGridLayout(activeBadge);
      const { cols, rows, badgesPerPage, badgeWidthMM, badgeHeightMM, gapMM } = layout;

      // Calculate positions for grid
      const paddingMM = 10;
      const usableWidth = pageWidth - paddingMM * 2;
      const usableHeight = pageHeight - paddingMM * 2;

      // Parse badge data once
      const parsedData = parseBadgeData(activeBadge);

      // Pre-generate all QR codes in parallel for better performance
      const qrElements = parsedData.contentElements.filter((el) => el.type === "qr");
      const uniqueQRValues = new Set();

      filteredRegistrations.forEach((reg) => {
        qrElements.forEach((el) => {
          const value = getValue(el, reg);
          if (value) uniqueQRValues.add(value);
        });
      });

      console.log(`Pre-generating ${uniqueQRValues.size} unique QR codes...`);

      // Batch generate QR codes
      const qrPromises = Array.from(uniqueQRValues).map((value) => generateQRCodeDataURL(value, { size: 300 }, qrCache));
      await Promise.all(qrPromises);

      console.log("QR codes pre-generated, rendering PDF...");

      // Render pages
      const totalPages = Math.ceil(filteredRegistrations.length / badgesPerPage);

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        if (pageIndex > 0) pdf.addPage();

        // Calculate badge positions for this page
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const regIndex = pageIndex * badgesPerPage + row * cols + col;
            const registration = filteredRegistrations[regIndex];

            if (registration) {
              // Calculate position
              const x = paddingMM + col * (badgeWidthMM + gapMM);
              const y = paddingMM + row * (badgeHeightMM + gapMM);

              // Render badge directly to PDF
              await renderBadgeToPDF(pdf, activeBadge, registration, x, y, badgeWidthMM, badgeHeightMM, badgeFormat, parsedData, qrCache, includeTrimMarks);
            }
          }
        }

        // Show progress
        console.log(`Rendered page ${pageIndex + 1} of ${totalPages}`);
      }

      // Save PDF
      pdf.save("Badges.pdf");
      console.log("✅ PDF generated successfully!");

      // Update download count
      await updateBadgeDownloadCount(filteredRegistrations);
    } catch (error) {
      console.error("❌ Download error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
      qrCache.clear(); // Free memory
    }
  };

  // Helper function to convert hex to RGB with validation for jsPDF
  const hexToRgb = (hex) => {
    // Ensure hex is a valid string
    if (!hex || typeof hex !== "string") {
      return [0, 0, 0];
    }

    // Clean the hex string
    hex = hex.trim();

    // Handle different hex formats
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);

      // Validate RGB values are in valid range (0-255)
      if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        return [0, 0, 0]; // Default to black
      }

      return [r, g, b];
    }

    // Try 3-digit hex format (#RGB -> #RRGGBB)
    const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (shortResult) {
      const r = parseInt(shortResult[1] + shortResult[1], 16);
      const g = parseInt(shortResult[2] + shortResult[2], 16);
      const b = parseInt(shortResult[3] + shortResult[3], 16);

      if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        return [0, 0, 0];
      }

      return [r, g, b];
    }

    // Default to black if parsing fails
    return [0, 0, 0];
  };

  // Helper to get value from registration
  const getValue = (el, registration) => {
    let value = null;

    if (el.preset === "name" || el.var === "name" || el.label === "Name") {
      value =
        registration?.fullName ||
        registration?.name ||
        (registration?.firstName && registration?.lastName ? `${registration.firstName} ${registration.lastName}` : null) ||
        registration?.firstName ||
        "Attendee Name";
      return value;
    }

    if (el.preset === "firstName" || el.var === "firstName" || el.label === "First Name") {
      value =
        registration?.firstName ||
        registration?.fullName ||
        registration?.name ||
        "First Name";
      return value;
    }

    if (el.preset === "event" || el.var === "event" || el.label === "Event") {
      if (registration?.event && typeof registration.event === "object") {
        value = registration.event.title || registration.event.name || registration.event.value || "Event Name";
      } else {
        value = registration?.event || "Event Name";
      }
      return value;
    }

    if (el.preset === "ticket" || el.var === "ticket" || el.label === "Ticket") {
      if (registration?.ticket && typeof registration.ticket === "object") {
        value = registration.ticket.title || registration.ticket.name || registration.ticket.value || "Ticket Type";
      } else {
        value = registration?.ticketName || registration?.ticket || "Ticket Type";
      }
      return value;
    }

    if (el.preset === "description" || el.var === "description" || el.label === "Description") {
      value = registration?.description || el.content || "Description";
      return value;
    }

    // Handle banner field - get from event data
    if (el.preset === "banner" || el.var === "banner" || el.label === "Banner") {
      if (eventData?.banner) {
        const CDN_PREFIX = "https://event-manager.syd1.digitaloceanspaces.com/";
        if (eventData.banner.startsWith("http")) {
          return eventData.banner;
        }
        if (eventData.banner.startsWith("blob:")) {
          return eventData.banner;
        }
        return CDN_PREFIX + eventData.banner;
      }
      return null; // Return null for banner if not found
    }

    // Handle ticket start date - get from ticket data
    if (el.preset === "ticketStartDate" || el.var === "ticketStartDate" || el.label === "Ticket Start Date") {
      if (registration?.ticket && typeof registration.ticket === "object") {
        if (registration.ticket.startDate) {
          return new Date(registration.ticket.startDate).toLocaleDateString();
        }
      }
      return el.content || "Ticket Start Date";
    }

    // Handle ticket end date - get from ticket data
    if (el.preset === "ticketEndDate" || el.var === "ticketEndDate" || el.label === "Ticket End Date") {
      if (registration?.ticket && typeof registration.ticket === "object") {
        if (registration.ticket.endDate) {
          return new Date(registration.ticket.endDate).toLocaleDateString();
        }
      }
      return el.content || "Ticket End Date";
    }

    // Handle ticket number - get from registration
    if (el.preset === "ticketNumber" || el.var === "ticketNumber" || el.label === "Ticket Number") {
      if (registration?.formattedTicketNumber) {
        return registration.formattedTicketNumber;
      }
      if (registration?.ticketNumber) {
        return registration.ticketNumber;
      }
      if (registration?.ticket && typeof registration.ticket === "object") {
        if (registration.ticket.ticketNumber) {
          return registration.ticket.ticketNumber;
        }
        if (registration.ticket.formattedTicketNumber) {
          return registration.ticket.formattedTicketNumber;
        }
      }
      return el.content || "Ticket Number";
    }

    if (el.type === "qr") {
      return registration?._id || registration?.registrationId || registration?.id || "QR_CODE_DATA";
    }

    // Handle user field types
    if (el.var && registration?.formData) {
      const fieldValue = registration.formData[el.var];
      if (fieldValue !== undefined && fieldValue !== null) {
        if (el.fieldType === "checkbox") {
          return fieldValue ? "☑ Selected" : "☐ Not Selected";
        } else if (el.fieldType === "multiplechoice") {
          return `○ ${fieldValue}`;
        } else if (el.fieldType === "select" || el.fieldType === "dropdown") {
          return fieldValue;
        } else if (el.fieldType === "date") {
          return new Date(fieldValue).toLocaleDateString();
        } else if (el.fieldType === "datetime") {
          return new Date(fieldValue).toLocaleString();
        } else if (el.fieldType === "textarea" || el.fieldType === "paragraph") {
          return fieldValue.length > 50 ? fieldValue.substring(0, 50) + "..." : fieldValue;
        }
        return fieldValue;
      }
    }

    // Generic handling
    if (el.preset && registration?.[el.preset] !== undefined) {
      value = registration[el.preset];
    } else if (el.var && registration?.[el.var] !== undefined) {
      value = registration[el.var];
    } else {
      value = el.content || el.label || "Sample Text";
    }

    if (typeof value === "object" && value !== null) {
      if (value.value) return value.value;
      if (value.label) return value.label;
      if (value.name) return value.name;
      if (value.title) return value.title;
      if (Array.isArray(value)) return value.join(", ");
      return JSON.stringify(value);
    }

    return String(value || el.content || el.label || "");
  };

  // For the preview, use a simpler approach
  const generatePdfPreviewOptimized = async () => {
    setIsLoadingPreview(true);

    try {
      // Only generate preview for first page to keep it fast
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: paperSize.toLowerCase(),
      });

      const layout = getGridLayout(activeBadge);
      const { cols, rows, badgeWidthMM, badgeHeightMM, gapMM } = layout;
      const paddingMM = 10;

      const parsedData = parseBadgeData(activeBadge);
      const qrCache = new Map();

      // Only render first page for preview
      const previewRegs = registrations.slice(0, cols * rows);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const regIndex = row * cols + col;
          const registration = previewRegs[regIndex];

          if (registration) {
            const x = paddingMM + col * (badgeWidthMM + gapMM);
            const y = paddingMM + row * (badgeHeightMM + gapMM);

            await renderBadgeToPDF(pdf, activeBadge, registration, x, y, badgeWidthMM, badgeHeightMM, badgeFormat, parsedData, qrCache, includeTrimMarks);
          }
        }
      }

      const pdfDataUri = pdf.output("datauristring");
      setPdfPreviewUrl(pdfDataUri);
    } catch (error) {
      console.error("Preview error:", error);
      setPdfPreviewUrl(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };
  // Batch update functions (reused from BadgeExport semantics)
  const updateBadgeDownloadCount = async (regs) => {
    try {
      if (!Array.isArray(regs) || regs.length === 0) return true;
      const grouped = regs.reduce((acc, reg) => {
        const ticketId = (reg?.ticket && (reg.ticket._id || reg.ticket.id)) || reg?.ticket || activeBadge?.ticket?._id;
        if (!ticketId) return acc;
        if (!acc[ticketId]) acc[ticketId] = [];
        acc[ticketId].push(reg);
        return acc;
      }, {});

      const promises = Object.entries(grouped).map(async ([ticketId, list]) => {
        const response = await postData(
          {
            eventId: activeBadge?.event?._id || activeBadge?.event?.id || activeBadge?.event,
            ticketId,
            downloadCount: list.length,
            registrationIds: list.map((r) => r._id),
            action: "batch-download",
            isNewOnly: attendeeSelection === "new",
          },
          "badge-download/batch-update"
        );
        return response?.data?.success;
      });

      const results = await Promise.all(promises);
      return results.every(Boolean);
    } catch (e) {
      console.error("Error updating badge download count:", e);
      return false;
    }
  };

  const updateBadgePrintCount = async (regs) => {
    try {
      if (!Array.isArray(regs) || regs.length === 0) return true;
      const grouped = regs.reduce((acc, reg) => {
        const ticketId = (reg?.ticket && (reg.ticket._id || reg.ticket.id)) || reg?.ticket || activeBadge?.ticket?._id;
        if (!ticketId) return acc;
        if (!acc[ticketId]) acc[ticketId] = [];
        acc[ticketId].push(reg);
        return acc;
      }, {});

      const promises = Object.entries(grouped).map(async ([ticketId, list]) => {
        const response = await postData(
          {
            eventId: activeBadge?.event?._id || activeBadge?.event?.id || activeBadge?.event,
            ticketId,
            printCount: list.length,
            registrationIds: list.map((r) => r._id),
            action: "batch-print",
            isNewOnly: attendeeSelection === "new",
          },
          "badge-download/batch-update"
        );
        return response?.data?.success;
      });

      const results = await Promise.all(promises);
      return results.every(Boolean);
    } catch (e) {
      console.error("Error updating badge print count:", e);
      return false;
    }
  };

  // Handle print
  const handlePrint = async () => {
    if (!activeBadge || !activeBadge.builderData) {
      alert("Invalid badge data. Please check badge configuration.");
      return;
    }

    const { elements } = parsedRef.current;
    if (elements.length === 0) {
      alert("No badge elements found. Please check badge configuration.");
      return;
    }

    setIsPrinting(true);

    try {
      console.log("🖨️ Starting print process...");

      // Filter registrations based on selected filter
      let filteredRegistrations = [...registrations];

      if (attendeeSelection === "new") {
        try {
          const response = await getData(
            {
              eventId: activeBadge.event._id,
              ticketId: activeBadge.ticket._id,
            },
            "badge-download/undownloaded-registrations"
          );

          const data = response?.data;
          if (data?.success && Array.isArray(data.undownloadedIds)) {
            filteredRegistrations = registrations.filter((reg) => data.undownloadedIds.includes(reg._id));
            console.log(`📊 Found ${filteredRegistrations.length} undownloaded registrations`);
          } else {
            console.warn("No undownloaded registrations found");
            filteredRegistrations = [];
          }
        } catch (error) {
          console.error("Error fetching undownloaded registrations:", error);
          filteredRegistrations = [];
        }
      }

      // Calculate layout
      const { width: pageWidth, height: pageHeight } = getPageSize();
      const layout = getGridLayout(activeBadge);
      const cols = layout.cols;
      const rows = layout.rows;
      const badgesPerPage = layout.badgesPerPage;
      const totalPages = Math.ceil(filteredRegistrations.length / badgesPerPage);

      const badgeCellWidthMM = layout.badgeWidthMM;
      const badgeCellHeightMM = layout.badgeHeightMM;

      const format = badgeFormat;

      // Generate HTML for printing
      const pagePromises = [];

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const badgePromises = [];

        for (let i = 0; i < badgesPerPage; i++) {
          const reg = filteredRegistrations[pageIndex * badgesPerPage + i];
          if (reg) {
            badgePromises.push(renderBadgeHTML(activeBadge, reg, badgeCellWidthMM, badgeCellHeightMM, format));
          } else {
            badgePromises.push(
              Promise.resolve(
                `<div class="badge-canvas" style="width:${badgeCellWidthMM * 3.78}px;height:${badgeCellHeightMM * 3.78}px;border:1px solid #ccc;border-radius:8px;background:#fff;display:block;margin:auto;"></div>`
              )
            );
          }
        }

        pagePromises.push(
          Promise.all(badgePromises).then(
            (badgeHTMLs) => `
                            <div class="page">
                                <div class="badge-grid">
                                    ${badgeHTMLs.join("")}
                                </div>
                            </div>
                        `
          )
        );
      }

      const pageHTMLs = await Promise.all(pagePromises);

      // Generate complete HTML
      const html = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Badge Print</title>
                        <style>
                            @page {
                                size: ${paperSize} ${orientation};
                                margin: 0;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                                font-family: Arial, sans-serif;
                            }
                            .page {
                                width: ${pageWidth}mm;
                                height: ${pageHeight}mm;
                                page-break-after: always;
                                position: relative;
                                padding: 10mm;
                                box-sizing: border-box;
                            }
                            .badge-grid {
                                display: grid;
                                grid-template-columns: repeat(${cols}, 1fr);
                                grid-template-rows: repeat(${rows}, 1fr);
                                gap: 5mm;
                                width: 100%;
                                height: 100%;
                            }
                        </style>
                    </head>
                    <body>
                        ${pageHTMLs.join("")}
                    </body>
                </html>
            `;

      // Print handling
      try {
        const printWindow = window.open("", "_blank", "width=800,height=600");

        if (!printWindow) {
          // Fallback if popup is blocked
          const blob = new Blob([html], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "badges.html";
          a.click();
          URL.revokeObjectURL(url);
          return;
        }

        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to load before printing
        printWindow.onload = () => {
          setTimeout(async () => {
            try {
              printWindow.focus();
              printWindow.print();
            } finally {
              try {
                const ok = await updateBadgePrintCount(filteredRegistrations);
                if (!ok) console.warn("⚠️ Failed to update badge print count");
              } catch (e) {
                console.warn("⚠️ Print count update error", e);
              }
            }
          }, 1000);
        };

        console.log("✅ Print window opened successfully");
      } catch (error) {
        console.error("❌ Print error:", error);
        // Fallback: download as HTML
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "badges.html";
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  // --- Preview Grid (true-to-print, like BadgeExport) ---
  const renderPreviewGrid = () => {
    // Show loading indicator only while fetching registrations
    if (isLoadingRegistrations) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 p-4">
          <div className="text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
            <p>Loading registrations...</p>
          </div>
        </div>
      );
    }

    if (!activeBadge || !activeBadge.builderData) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 p-4">
          <div className="text-center text-gray-500">
            <p>No badge data available</p>
          </div>
        </div>
      );
    }

    const { elements, background, backgroundLayerElements, contentElements } = parseBadgeData(activeBadge);
    if (elements.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 p-4">
          <div className="text-center text-gray-500">
            <p>No badge elements found</p>
          </div>
        </div>
      );
    }

    // Filter registrations based on selected filter
    let filteredRegistrations = [...registrations];
    if (attendeeSelection === "new") {
      // For preview, we'll use the unprinted count logic
      filteredRegistrations = registrations.slice(0, unprintedCount);
    }

    if (filteredRegistrations.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 p-4">
          <div className="text-center text-gray-500">
            <p>No registrations to preview</p>
          </div>
        </div>
      );
    }

    const backgroundImageUrl = getBackgroundImageUrl(activeBadge, background);
    const { width: badgeWidth, height: badgeHeight } = getBadgeDimensions(activeBadge);
    const { cols, rows, badgeWidthMM, badgeHeightMM, gapMM } = getGridLayout(activeBadge);
    const badgesPerPage = cols * rows;
    const totalPages = Math.ceil(filteredRegistrations.length / badgesPerPage);

    const showBackground = badgeFormat === "print" || badgeFormat === "both";
    const showContent = badgeFormat === "both";

    // Calculate badge display size for preview (smaller than actual print size)
    const previewScale = 0.3; // Scale down for preview
    const badgeDisplayWidth = badgeWidthMM * 3.78 * previewScale; // Convert mm to px and scale
    const badgeDisplayHeight = badgeHeightMM * 3.78 * previewScale;

    // Calculate page dimensions for preview
    const { width: pageWidthMM, height: pageHeightMM } = getPageSize();
    const pageDisplayWidth = pageWidthMM * 3.78 * previewScale; // Convert mm to px and scale
    const pageDisplayHeight = pageHeightMM * 3.78 * previewScale;

    // Helper to get field value for a registration
    const getValue = (el, registration) => {
      if (el.preset === "name" || el.var === "name" || el.label === "Name") {
        return (
          registration?.fullName ||
          registration?.name ||
          (registration?.firstName && registration?.lastName ? `${registration.firstName} ${registration.lastName}` : null) ||
          registration?.firstName ||
          "Attendee Name"
        );
      }

      if (el.preset === "firstName" || el.var === "firstName" || el.label === "First Name") {
        return (
          registration?.firstName ||
          registration?.fullName ||
          registration?.name ||
          "First Name"
        );
      }

      if (el.preset === "event" || el.var === "event" || el.label === "Event") {
        if (registration?.event && typeof registration.event === "object") {
          return registration.event.title || registration.event.name || registration.event.value || "Event Name";
        } else {
          return registration?.event || "Event Name";
        }
      }

      if (el.preset === "ticket" || el.var === "ticket" || el.label === "Ticket") {
        if (registration?.ticket && typeof registration.ticket === "object") {
          return registration.ticket.title || registration.ticket.name || registration.ticket.value || "Ticket Type";
        } else {
          return registration?.ticketName || registration?.ticket || "Ticket Type";
        }
      }

      if (el.preset === "description" || el.var === "description" || el.label === "Description") {
        return registration?.description || el.content || "Description";
      }

      // Handle ticket start date - get from ticket data
      if (el.preset === "ticketStartDate" || el.var === "ticketStartDate" || el.label === "Ticket Start Date") {
        if (registration?.ticket && typeof registration.ticket === "object") {
          if (registration.ticket.startDate) {
            return new Date(registration.ticket.startDate).toLocaleDateString();
          }
        }
        return el.content || "Ticket Start Date";
      }

      // Handle ticket end date - get from ticket data
      if (el.preset === "ticketEndDate" || el.var === "ticketEndDate" || el.label === "Ticket End Date") {
        if (registration?.ticket && typeof registration.ticket === "object") {
          if (registration.ticket.endDate) {
            return new Date(registration.ticket.endDate).toLocaleDateString();
          }
        }
        return el.content || "Ticket End Date";
      }

      // Handle ticket number - get from registration
      if (el.preset === "ticketNumber" || el.var === "ticketNumber" || el.label === "Ticket Number") {
        if (registration?.formattedTicketNumber) {
          return registration.formattedTicketNumber;
        }
        if (registration?.ticketNumber) {
          return registration.ticketNumber;
        }
        if (registration?.ticket && typeof registration.ticket === "object") {
          if (registration.ticket.ticketNumber) {
            return registration.ticket.ticketNumber;
          }
          if (registration.ticket.formattedTicketNumber) {
            return registration.ticket.formattedTicketNumber;
          }
        }
        return el.content || "Ticket Number";
      }

      if (el.type === "qr") {
        return registration?._id || registration?.registrationId || registration?.id || "QR_CODE_DATA";
      }

      // Handle user field types
      if (el.var && registration?.formData) {
        const fieldValue = registration.formData[el.var];
        if (fieldValue !== undefined && fieldValue !== null) {
          if (el.fieldType === "checkbox") {
            return fieldValue ? "☑ Selected" : "☐ Not Selected";
          } else if (el.fieldType === "multiplechoice") {
            return `○ ${fieldValue}`;
          } else if (el.fieldType === "select" || el.fieldType === "dropdown") {
            return fieldValue;
          } else if (el.fieldType === "date") {
            return new Date(fieldValue).toLocaleDateString();
          } else if (el.fieldType === "datetime") {
            return new Date(fieldValue).toLocaleString();
          } else if (el.fieldType === "textarea" || el.fieldType === "paragraph") {
            return fieldValue.length > 30 ? fieldValue.substring(0, 30) + "..." : fieldValue;
          }
          return fieldValue;
        }
      }

      // Generic handling
      if (el.preset && registration?.[el.preset] !== undefined) {
        const value = registration[el.preset];
        if (typeof value === "object" && value !== null) {
          if (value.value) return value.value;
          if (value.label) return value.label;
          if (value.name) return value.name;
          if (value.title) return value.title;
          if (Array.isArray(value)) return value.join(", ");
          return JSON.stringify(value);
        }
        return String(value);
      } else if (el.var && registration?.[el.var] !== undefined) {
        const value = registration[el.var];
        if (typeof value === "object" && value !== null) {
          if (value.value) return value.value;
          if (value.label) return value.label;
          if (value.name) return value.name;
          if (value.title) return value.title;
          if (Array.isArray(value)) return value.join(", ");
          return JSON.stringify(value);
        }
        return String(value);
      } else {
        return el.content || el.label || "Sample Text";
      }
    };

    // Render a single badge
    const renderBadge = (registration, index) => {
      return (
        <div
          key={registration?._id || index}
          style={{
            width: badgeDisplayWidth,
            height: badgeDisplayHeight,
            position: "relative",
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid #ccc",
            background: showBackground && backgroundImageUrl ? `url(${backgroundImageUrl}) center/cover no-repeat` : showBackground ? "#fff" : "transparent",
            margin: "auto",
            display: "block",
          }}
        >
          {/* Render background layer elements when badgeFormat is "print" or "both" */}
          {(badgeFormat === "print" || badgeFormat === "both") &&
            backgroundLayerElements.map((el) => {
              const scaleX = badgeDisplayWidth / (badgeWidth * 37.8);
              const scaleY = badgeDisplayHeight / (badgeHeight * 37.8);

              // Convert element dimensions from CM to pixels for positioning and sizing
              const elPositionXPx = el.positionX * 37.795275591;
              const elPositionYPx = el.positionY * 37.795275591;
              const elWidthPx = el.width * 37.795275591;
              const elHeightPx = el.height * 37.795275591;

              // Text elements
              if (["text", "textarea", "paragraph", "mobilenumber", "number", "date", "datetime", "email"].includes(el.type)) {
                const value = getValue(el, registration);
                const textAlign = el.textAlign || "center";
                const justifyContent = textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center";
                
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: elPositionXPx * scaleX,
                      top: elPositionYPx * scaleY,
                      width: elWidthPx * scaleX,
                      height: elHeightPx * scaleY,
                      color: el.color || "#000",
                      fontSize: Math.max((el.fontSize || 16) * scaleY, 8),
                      fontWeight: el.fontWeight || "normal",
                      textAlign: textAlign,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: justifyContent,
                      fontFamily: "Arial, sans-serif",
                      overflow: "hidden",
                      wordBreak: "break-word",
                    }}
                  >
                    {value}
                  </div>
                );
              }

              // Select/dropdown/choice elements
              if (["select", "dropdown", "multiplechoice", "checkbox"].includes(el.type)) {
                const value = getValue(el, registration);
                const textAlign = el.textAlign || "left";
                const justifyContent = textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center";
                
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: elPositionXPx * scaleX,
                      top: elPositionYPx * scaleY,
                      width: elWidthPx * scaleX,
                      height: elHeightPx * scaleY,
                      color: el.color || "#000",
                      fontSize: Math.max((el.fontSize || 14) * scaleY, 8),
                      fontWeight: el.fontWeight || "normal",
                      textAlign: textAlign,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: justifyContent,
                      fontFamily: "Arial, sans-serif",
                      overflow: "hidden",
                    }}
                  >
                    {value}
                  </div>
                );
              }

              // QR code (show actual QR code)
              if (el.type === "qr") {
                const qrValue = getValue(el, registration);
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: elPositionXPx * scaleX,
                      top: elPositionYPx * scaleY,
                      width: elWidthPx * scaleX,
                      height: elHeightPx * scaleY,
                      background: el.bgColor || "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #ccc",
                    }}
                  >
                    <QRCodeSVG
                      value={qrValue || "QR_CODE_DATA"}
                      size={Math.min(elWidthPx * scaleX, elHeightPx * scaleY) * 0.8}
                      bgColor={el.bgColor || "#FFFFFF"}
                      fgColor={el.fgColor || "#000000"}
                      level="L"
                      includeMargin={el.includeMargin !== false}
                    />
                  </div>
                );
              }

              // Image elements
              if (el.type === "image") {
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: elPositionXPx * scaleX,
                      top: elPositionYPx * scaleY,
                      width: elWidthPx * scaleX,
                      height: elHeightPx * scaleY,
                      background: el.bgColor || "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #ccc",
                      fontSize: Math.max((el.fontSize || 10) * scaleY, 6),
                      color: el.color || "#666",
                    }}
                  >
                    Image
                  </div>
                );
              }

              return null;
            })}

          {/* Render content elements */}
          {showContent &&
            contentElements.map((el) => {
              const scaleX = badgeDisplayWidth / (badgeWidth * 37.8);
              const scaleY = badgeDisplayHeight / (badgeHeight * 37.8);

              // Convert element dimensions from CM to pixels for positioning and sizing
              const elPositionXPx = el.positionX * 37.795275591;
              const elPositionYPx = el.positionY * 37.795275591;
              const elWidthPx = el.width * 37.795275591;
              const elHeightPx = el.height * 37.795275591;

              // Text elements
              if (["text", "textarea", "paragraph", "mobilenumber", "number", "date", "datetime", "email"].includes(el.type)) {
                const value = getValue(el, registration);
                const textAlign = el.textAlign || "center";
                const justifyContent = textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center";
                
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: elPositionXPx * scaleX,
                      top: elPositionYPx * scaleY,
                      width: elWidthPx * scaleX,
                      height: elHeightPx * scaleY,
                      color: el.color || "#000",
                      fontSize: Math.max((el.fontSize || 16) * scaleY, 8),
                      fontWeight: el.fontWeight || "normal",
                      textAlign: textAlign,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: justifyContent,
                      fontFamily: "Arial, sans-serif",
                      overflow: "hidden",
                      wordBreak: "break-word",
                    }}
                  >
                    {value}
                  </div>
                );
              }

              // Select/dropdown/choice elements
              if (["select", "dropdown", "multiplechoice", "checkbox"].includes(el.type)) {
                const value = getValue(el, registration);
                const textAlign = el.textAlign || "left";
                const justifyContent = textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center";
                
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: elPositionXPx * scaleX,
                      top: elPositionYPx * scaleY,
                      width: elWidthPx * scaleX,
                      height: elHeightPx * scaleY,
                      color: el.color || "#000",
                      fontSize: Math.max((el.fontSize || 14) * scaleY, 8),
                      fontWeight: el.fontWeight || "normal",
                      textAlign: textAlign,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: justifyContent,
                      fontFamily: "Arial, sans-serif",
                      overflow: "hidden",
                    }}
                  >
                    {value}
                  </div>
                );
              }

              // QR code (show actual QR code)
              if (el.type === "qr") {
                const qrValue = getValue(el, registration);
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: elPositionXPx * scaleX,
                      top: elPositionYPx * scaleY,
                      width: elWidthPx * scaleX,
                      height: elHeightPx * scaleY,
                      background: el.bgColor || "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #000",
                    }}
                  >
                    <QRCodeSVG
                      value={qrValue || "QR_CODE_DATA"}
                      size={Math.min(elWidthPx * scaleX, elHeightPx * scaleY) * 0.8}
                      bgColor={el.bgColor || "#FFFFFF"}
                      fgColor={el.fgColor || "#000000"}
                      level="L"
                      includeMargin={el.includeMargin !== false}
                    />
                  </div>
                );
              }

              // Image/file elements
              if (el.type === "image" || el.type === "file") {
                const imageValue = getValue(el, registration);
                if (imageValue && imageValue !== "Sample Text" && imageValue !== null) {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: "absolute",
                        left: elPositionXPx * scaleX,
                        top: elPositionYPx * scaleY,
                        width: elWidthPx * scaleX,
                        height: elHeightPx * scaleY,
                        borderRadius: (el.borderRadius || 0) * 37.795275591 * scaleX,
                        overflow: "hidden",
                        border: el.borderWidth ? `${el.borderWidth * 37.795275591 * scaleX}px solid ${el.borderColor}` : "none",
                      }}
                    >
                      <img src={imageValue} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="User Content" />
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: "absolute",
                        left: elPositionXPx * scaleX,
                        top: elPositionYPx * scaleY,
                        width: elWidthPx * scaleX,
                        height: elHeightPx * scaleY,
                        borderRadius: (el.borderRadius || 0) * 37.795275591 * scaleX,
                        overflow: "hidden",
                        border: el.borderWidth ? `${el.borderWidth * 37.795275591 * scaleX}px solid ${el.borderColor}` : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f0f0f0",
                      }}
                    >
                      <ImageIcon size={Math.min(elWidthPx * scaleX, elHeightPx * scaleY) * 0.6} color="#999" />
                    </div>
                  );
                }
              }

              return null;
            })}
        </div>
      );
    };

    // Render all pages
    const renderAllPages = () => {
      const pages = [];

      // Determine actual badges per page based on settings
      let actualBadgesPerPage = badgesPerPage;
      if (badgesPerPage === "one") {
        actualBadgesPerPage = 1;
      } else if (badgesPerPage === "auto") {
        // Use auto-calculated layout
        actualBadgesPerPage = cols * rows;
      } else {
        // Fallback for any numeric values or other strings
        actualBadgesPerPage = cols * rows;
      }

      const actualTotalPages = Math.ceil(filteredRegistrations.length / actualBadgesPerPage);

      for (let pageIndex = 0; pageIndex < actualTotalPages; pageIndex++) {
        const pageRegistrations = filteredRegistrations.slice(pageIndex * actualBadgesPerPage, (pageIndex + 1) * actualBadgesPerPage);

        pages.push(
          <div key={pageIndex} className="mb-8">
            <div className="text-center mb-4">
              <h4 className="font-semibold text-gray-700 text-sm">
                Page {pageIndex + 1} of {actualTotalPages}
              </h4>
              <p className="text-xs text-gray-500">
                {paperSize} • {orientation} • {pageRegistrations.length} badges
              </p>
            </div>

            <div
              className="bg-white border border-gray-300 rounded-lg mx-auto shadow-sm relative"
              style={{
                width: `${pageDisplayWidth}px`,
                height: `${pageDisplayHeight}px`,
                padding: `${5 * 3.78 * previewScale}px`, // 5mm padding scaled (reduced from 10mm)
                boxSizing: "border-box",
              }}
            >
              {badgesPerPage === "one" ? (
                // Single badge centered on page
                <div className="w-full h-full flex items-center justify-center">
                  {pageRegistrations[0] ? (
                    renderBadge(pageRegistrations[0], pageIndex)
                  ) : (
                    <div
                      style={{
                        width: badgeDisplayWidth,
                        height: badgeDisplayHeight,
                        border: "1px dashed #ccc",
                        borderRadius: 4,
                        background: "#f9f9f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        fontSize: "10px",
                      }}
                    >
                      Empty
                    </div>
                  )}
                </div>
              ) : (
                // Grid layout for multiple badges
                <div
                  className="w-full h-full grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gap: `${gapMM * 3.78 * previewScale}px`,
                    placeItems: "center", // Center badges in grid cells
                    boxSizing: "border-box", // Ensure padding/border are included in size
                  }}
                >
                  {Array.from({ length: actualBadgesPerPage }, (_, i) => {
                    const reg = pageRegistrations[i];
                    return reg ? (
                      renderBadge(reg, pageIndex * actualBadgesPerPage + i)
                    ) : (
                      <div
                        key={i}
                        style={{
                          width: badgeDisplayWidth,
                          height: badgeDisplayHeight,
                          border: "1px dashed #ccc",
                          borderRadius: 4,
                          background: "#f9f9f9",
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Paper size indicator */}
              <div className="absolute top-2 left-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                {paperSize} {orientation}
              </div>

              {/* Trim marks indicator (if enabled) */}
              {includeTrimMarks && (
                <>
                  {/* Corner bracket trim marks */}
                  <div className="absolute top-0 left-0 w-3 h-3">
                    <div className="absolute top-0 left-0 w-2 h-0.5 bg-gray-400"></div>
                    <div className="absolute top-0 left-0 w-0.5 h-2 bg-gray-400"></div>
                  </div>
                  <div className="absolute top-0 right-0 w-3 h-3">
                    <div className="absolute top-0 right-0 w-2 h-0.5 bg-gray-400"></div>
                    <div className="absolute top-0 right-0 w-0.5 h-2 bg-gray-400"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-3 h-3">
                    <div className="absolute bottom-0 left-0 w-2 h-0.5 bg-gray-400"></div>
                    <div className="absolute bottom-0 left-0 w-0.5 h-2 bg-gray-400"></div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3">
                    <div className="absolute bottom-0 right-0 w-2 h-0.5 bg-gray-400"></div>
                    <div className="absolute bottom-0 right-0 w-0.5 h-2 bg-gray-400"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }

      return pages;
    };

    return (
      <div className="w-full h-full bg-gray-100 p-4 overflow-y-auto">
        <div className="max-w-full mx-auto">{renderAllPages()}</div>
      </div>
    );
  };

  const Step1 = () => (
    <>
      <section>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Select Attendees</h3>
        <div className="space-y-3">
          <OptionCard value="all" title="All Attendees" subtitle={`${registrationCounts.total || 0} registrations`} icon={Users} selection={attendeeSelection} setSelection={setAttendeeSelection} />
          <OptionCard value="new" title="New Only" subtitle={`${unprintedCount} new`} icon={Users} selection={attendeeSelection} setSelection={setAttendeeSelection} />
        </div>
      </section>
      <section>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Badge Format</h3>
        <div className="space-y-3">
          <OptionCard value="print" title="Background Only" subtitle="Background layer elements only" icon={ImageIcon} selection={badgeFormat} setSelection={setBadgeFormat} color="blue" />
          <OptionCard value="both" title="Complete Badge" subtitle="Background + content elements" icon={Layers} selection={badgeFormat} setSelection={setBadgeFormat} color="purple" />
        </div>
      </section>
    </>
  );

  const Step2 = () => (
    <>
      <section>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Paper Size</h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <File size={16} className="text-gray-500" />
          </div>
          <select
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="w-full pl-10 p-3 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="A4">A4 (210 x 297 mm)</option>
            <option value="A3">A3 (297 x 420 mm)</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronRight size={16} className="text-gray-500" />
          </div>
        </div>
      </section>
      <section>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Orientation</h3>
        <div className="space-y-3">
          <OptionCard value="portrait" title="Portrait" subtitle="Taller than wide" icon={LayoutGrid} selection={orientation} setSelection={setOrientation} color="blue" />
          <OptionCard value="landscape" title="Landscape" subtitle="Wider than tall" icon={LayoutGrid} selection={orientation} setSelection={setOrientation} color="purple" />
        </div>
      </section>
      <section>
        <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-transparent has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 cursor-pointer">
          <div className="p-2 rounded-md bg-green-100">
            <Settings size={20} className="text-green-600" />
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-gray-800 text-sm">Include trim marks</h4>
          </div>
          <input type="checkbox" checked={includeTrimMarks} onChange={(e) => setIncludeTrimMarks(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        </label>
      </section>
    </>
  );

  const getPaperStyle = () => {
    if (paperSize === "A3") return { width: "842px", height: "1191px" };
    return { width: "595px", height: "842px" }; // A4 default
  };

  const layout = getGridLayout(activeBadge);
  const totalPages = Math.ceil(getSelectedCount() / layout.badgesPerPage);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <Download size={20} className="text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">Download Badge</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </header>
        <div className="flex flex-grow overflow-hidden">
          <main className="flex-1 bg-gray-200 p-8 overflow-y-auto">{renderPreviewGrid()}</main>
          <aside className="w-80 border-l bg-white flex flex-col">
            <div className="flex-grow p-6 space-y-6 overflow-y-auto">{currentStep === 1 ? <Step1 /> : <Step2 />}</div>
            <footer className="p-4 bg-gray-50 border-t flex-shrink-0 flex items-center gap-3">
              {currentStep === 2 && (
                <button onClick={() => setCurrentStep(1)} className="bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 flex items-center gap-2">
                  <ArrowLeft size={18} /> Back
                </button>
              )}
              {currentStep === 1 ? (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleDownloadOptimized}
                  disabled={isPrinting || isDownloading}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDownloading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Download size={18} />}
                  {isDownloading ? "Downloading..." : "Download PDF"}
                </button>
              )}
            </footer>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PrintBadge;
