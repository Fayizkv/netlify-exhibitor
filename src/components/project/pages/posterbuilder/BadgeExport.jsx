import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Users,
  User,
  Eye,
  Printer,
  Monitor,
  Layers,
  FileText,
  CheckCircle2,
  Settings,
  RotateCcw,
  Maximize2,
  Layout,
  Play,
  Pause,
  Grid,
  Image,
  Type,
  Palette,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { getData, postData } from "../../../../backend/api";

const sortOrders = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

// UPDATED: Fixed prop name from 'registrations' to 'allBadges'
const BadgeExport = ({ open, onClose, badgeData, allBadges = [], tickets = [], userFields = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dropdownStates, setDropdownStates] = useState({
    paperSize: false,
    orientation: false,
    field: false,
    order: false,
    badgesPerPage: false,
  });
  const [exportSettings, setExportSettings] = useState({
    // Basic Settings
    attendeeSelection: "all",
    previewFormat: "both",

    // Print Settings
    paperSize: "A4",
    orientation: "portrait", // portrait, landscape
    printSides: "single", // single, double

    // Layout Settings
    badgesPerPage: 6,
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
    spacing: {
      horizontal: 5,
      vertical: 5,
    },

    // Advanced
    selectedTickets: [],
    customLayout: false,
  });

  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [previewRegistration, setPreviewRegistration] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [unprintedCount, setUnprintedCount] = useState(0);
  const [previewQrPngs, setPreviewQrPngs] = useState({});
  const [newOnlyRegistrationIds, setNewOnlyRegistrationIds] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);

  useEffect(() => {
    console.log(badgeData, "badgeData");

    // ADDED: Validate badgeData structure
    // if (badgeData) {
    //   const { elements, background, contentElements } = parseBadgeData(badgeData);
    //   console.log("Badge data validation:", {
    //     hasElements: elements.length > 0,
    //     hasBackground: !!background,
    //     contentElementsCount: contentElements.length,
    //     layoutWidth: badgeData.layoutWidth,
    //     layoutHeight: badgeData.layoutHeight,
    //     hasBackgroundImage: !!badgeData.backgroundImage,
    //   });

    //   if (elements.length === 0) {
    //     console.warn("No badge elements found in badgeData.builderData");
    //   }
    // }
  }, [badgeData]);
  // Helper to extract string ID from event or ticket
  const getId = (id) => {
    if (!id) return undefined;
    if (typeof id === "object" && id.$oid) return id.$oid;
    if (typeof id === "object" && id._id) return id._id;
    return id;
  };

  // ADDED: Helper function to generate QR code as data URL
  const generateQRCodeDataURL = async (text, options = {}) => {
    try {
      const qrDataURL = await QRCode.toDataURL(text, {
        width: options.size || 150,
        margin: options.includeMargin ? 2 : 0,
        color: {
          dark: options.fgColor || "#000000",
          light: options.bgColor || "#FFFFFF",
        },
        errorCorrectionLevel: options.level || "L",
      });
      return qrDataURL;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  // Fetch registration counts and preview registration
  useEffect(() => {
    const fetchRegistrationCountsAndPreview = async () => {
      try {
        const eventId = getId(badgeData.event);
        // Fetch all registrations for the event
        const registrationsResponse = await getData({ event: eventId, skip: 0, limit: 100000 }, "ticket-registration/form");
        const registrations = registrationsResponse?.data?.response || [];
        setRegistrations(registrations);
        const totalCount = registrations.length;

        // Fetch new registrations count (registered within 2 days before event)
        let newCount = 0;
        let eventStartDate = badgeData?.event?.startDate ? new Date(badgeData.event.startDate) : null;
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

        // Fetch counts for each ticket
        const ticketCounts = {};
        for (const ticket of tickets) {
          const ticketId = getId(ticket.id || ticket._id);
          const response = await getData({ event: eventId, ticket: ticketId, skip: 0, limit: 100000 }, "ticket-registration/form");
          ticketCounts[ticketId] = response?.data?.response?.length || 0;
        }

        setRegistrationCounts({ total: totalCount, new: newCount, tickets: ticketCounts });

        // Set the first registration for preview
        setPreviewRegistration(registrations[0] || null);
      } catch (error) {
        setRegistrationCounts({ total: 0, new: 0, tickets: {} });
        setPreviewRegistration(null);
        setRegistrations([]);
      }
    };

    if (open && badgeData?.event) {
      fetchRegistrationCountsAndPreview();
    }
  }, [open, badgeData?.event, tickets]);

  // In updateBadgeDownloadCount function:
  const updateBadgeDownloadCount = async (registrations) => {
    try {
      // Group registrations by ticket ID
      const registrationsByTicket = registrations.reduce((acc, reg) => {
        // const ticketId = reg.ticket?._id || reg.ticket?.id || reg.ticket;
        const ticketId = badgeData.ticket._id;
        if (!acc[ticketId]) {
          acc[ticketId] = [];
        }
        acc[ticketId].push(reg);
        return acc;
      }, {});

      // Make separate API calls for each ticket ID
      const updatePromises = Object.entries(registrationsByTicket).map(async ([ticketId, ticketRegistrations]) => {
        const response = await postData(
          {
            eventId: badgeData.event._id,
            ticketId: ticketId,
            downloadCount: ticketRegistrations.length,
            registrationIds: ticketRegistrations.map((reg) => reg._id),
            action: "batch-download",
            isNewOnly: exportSettings.attendeeSelection === "new", // FIXED: Use exportSettings.attendeeSelection
          },
          "badge-download/batch-update"
        );
        return response?.data?.success;
      });

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      return results.every(Boolean); // Return true only if all updates succeeded
    } catch (error) {
      console.error("Error updating badge download count:", error);
      return false;
    }
  };

  // In updateBadgePrintCount function:
  const updateBadgePrintCount = async (registrations) => {
    try {
      // Group registrations by ticket ID
      const registrationsByTicket = registrations.reduce((acc, reg) => {
        const ticketId = reg.ticket?._id || reg.ticket?.id || reg.ticket;
        if (!acc[ticketId]) {
          acc[ticketId] = [];
        }
        acc[ticketId].push(reg);
        return acc;
      }, {});
      // console.log(registrations, "registrationsByTicket");
      // Make separate API calls for each ticket ID
      const updatePromises = Object.entries(registrationsByTicket).map(async ([ticketId, ticketRegistrations]) => {
        const response = await postData(
          {
            eventId: badgeData.event._id,
            ticketId: ticketId,
            printCount: ticketRegistrations.length,
            registrationIds: ticketRegistrations.map((reg) => reg._id),
            action: "batch-print",
            isNewOnly: exportSettings.attendeeSelection === "new", // FIXED: Use exportSettings.attendeeSelection
          },
          "badge-download/batch-update"
        );
        return response?.data?.success;
      });

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      return results.every(Boolean); // Return true only if all updates succeeded
    } catch (error) {
      console.error("Error updating badge print count:", error);
      return false;
    }
  };

  // Fetch new only registrations
  const fetchNewOnlyRegistrations = async () => {
    if (badgeData?.event?._id && badgeData?.ticket?._id) {
      try {
        const response = await getData(
          {
            eventId: badgeData.event._id,
            ticketId: badgeData.ticket._id,
            filterType: "new",
          },
          "badge-download/undownloaded-registrations"
        );
        const data = response?.data;
        if (data?.success) {
          setUnprintedCount(data.data.count);
          setNewOnlyRegistrationIds(data.data.registrationIds);
        } else {
          setUnprintedCount(0);
          setNewOnlyRegistrationIds([]);
        }
      } catch (error) {
        setUnprintedCount(0);
        setNewOnlyRegistrationIds([]);
      }
    }
  };

  // Update fetchUnprintedCount to handle both modes
  const fetchUnprintedCount = async () => {
    if (exportSettings.attendeeSelection === "new") {
      await fetchNewOnlyRegistrations();
      return;
    }
    if (badgeData?.event?._id && badgeData?.ticket?._id) {
      try {
        const response = await getData(
          {
            eventId: badgeData.event._id,
            ticketId: badgeData.ticket._id,
          },
          "badge-download"
        );
        const data = response?.data;
        if (data?.success) {
          setUnprintedCount(data.data.unprintedCount);
        }
      } catch (error) {
        setUnprintedCount(0);
      }
    } else {
      setUnprintedCount(0);
    }
  };

  // When attendee selection changes, refetch counts
  useEffect(() => {
    fetchUnprintedCount();
    // eslint-disable-next-line
  }, [badgeData?.event?._id, badgeData?.ticket?._id, exportSettings.attendeeSelection]);

  // Update getSelectedCount to use registration counts
  const getSelectedCount = () => {
    switch (exportSettings.attendeeSelection) {
      case "all":
        return registrationCounts.total || 0;
      case "new":
        return unprintedCount;
      case "tickets":
        if (exportSettings.selectedTickets.length === 0) return 0;
        return exportSettings.selectedTickets.reduce((total, ticketId) => {
          return total + (registrationCounts.tickets?.[ticketId] || 0);
        }, 0);
      default:
        return 0;
    }
  };

  const previewFormats = [
    {
      id: "print",
      label: "Print Background Only",
      description: "Just the background design, no text/attributes",
      icon: Image,
      color: "blue",
    },
    {
      id: "both",
      label: "Complete Badge",
      description: "Background + all attendee information",
      icon: Layers,
      color: "purple",
    },
    {
      id: "kiosk",
      label: "No Background",
      description: "Content only, transparent background",
      icon: Type,
      color: "green",
    },
  ];

  const paperSizes = [
    { value: "A4", label: "A4 (210 × 297 mm)", width: 210, height: 297 },
    { value: "Letter", label: 'Letter (8.5" × 11")', width: 216, height: 279 },
    { value: "A3", label: "A3 (297 × 420 mm)", width: 297, height: 420 },
    { value: "Legal", label: 'Legal (8.5" × 14")', width: 216, height: 356 },
  ];

  const toggleDropdown = (dropdown) => {
    setDropdownStates((prev) => {
      const newState = { paperSize: false, orientation: false, field: false, order: false, badgesPerPage: false };
      newState[dropdown] = !prev[dropdown];
      return newState;
    });
  };

  const closeAllDropdowns = () => {
    setDropdownStates({ paperSize: false, orientation: false, field: false, order: false, badgesPerPage: false });
  };

  const CustomDropdown = ({ label, value, options, onChange, isOpen, onToggle, className = "", openUpward = false }) => {
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className={`relative ${className}`}>
        <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
        <button
          type="button"
          onClick={onToggle}
          className="w-full appearance-none border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all cursor-pointer hover:border-gray-400 text-left flex items-center justify-between"
        >
          <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>{selectedOption ? selectedOption.label : label}</span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className={`absolute z-30 w-full ${openUpward ? "bottom-full mb-1" : "mt-2"} bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-40 overflow-y-auto`}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  onToggle();
                }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  value === option.value ? "text-gray-900 font-medium bg-blue-50" : "text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Add dropdown options for badges per page
  const badgesPerPageOptions = [1, 2, 4, 6, 8, 9, 10, 12, 15, 16, 20, 24];

  // Helper to calculate optimal grid and badge size for selected badgesPerPage, keeping aspect ratio
  function getOptimalBadgeGridWithAspect(badgesPerPageValue) {
    // console.log("BadgeExport - getOptimalBadgeGridWithAspect called with badgesPerPage:", badgesPerPageValue);
    const { width: pageWidth, height: pageHeight } = getPageSize(); // Corrected variable names here, was badgePageWidthMM etc.
    // console.log("BadgeExport - getOptimalBadgeGridWithAspect - Page dimensions (mm):", { pageWidth, pageHeight });

    const padding = exportSettings.padding;
    const spacing = exportSettings.spacing;

    const ow = badgeData?.layoutWidth;
    const oh = badgeData?.layoutHeight;
    const originalWidth = ow && ow > 0 ? ow : 300; // Use default if layoutWidth is 0 or invalid
    const originalHeight = oh && oh > 0 ? oh : 200; // Use default if layoutHeight is 0 or invalid
    const aspectRatio = originalWidth / originalHeight;

    // Find all (cols, rows) pairs
    const pairs = [];
    for (let cols = 1; cols <= badgesPerPageValue; cols++) {
      if (badgesPerPageValue % cols === 0) {
        const rows = badgesPerPageValue / cols;
        pairs.push([cols, rows]);
      }
    }

    let best = null;
    for (const [cols, rows] of pairs) {
      const usableWidth = pageWidth - padding.left - padding.right - (cols - 1) * spacing.horizontal;
      const usableHeight = pageHeight - padding.top - padding.bottom - (rows - 1) * spacing.vertical;

      // Calculate the max badge size for this grid, keeping aspect ratio
      let badgeWidth = usableWidth / cols;
      let badgeHeight = badgeWidth / aspectRatio;
      if (badgeHeight * rows > usableHeight) {
        badgeHeight = usableHeight / rows;
        badgeWidth = badgeHeight * aspectRatio;
      }

      if (!best || badgeWidth * badgeHeight > best.badgeWidth * best.badgeHeight) {
        best = { cols, rows, badgeWidth, badgeHeight };
      }
    }
    return best;
  }

  // Update getGridLayout to use background image aspect ratio automatically
  function getGridLayout() {
    if (exportSettings.badgesPerPage) {
      const grid = getOptimalBadgeGridWithAspect(exportSettings.badgesPerPage);
      const result = { ...grid, badgesPerPage: exportSettings.badgesPerPage };
      return result;
    }

    // Automatically use background image dimensions for layout
    const { width: pageWidth, height: pageHeight } = getPageSize();
    const { width: badgeWidth, height: badgeHeight } = getBadgeDimensions(badgeData);

    // Automatic padding based on page size (5% of page dimensions)
    const autoPadding = {
      top: pageHeight * 0.05,
      right: pageWidth * 0.05,
      bottom: pageHeight * 0.05,
      left: pageWidth * 0.05,
    };

    // Automatic spacing (2mm between badges)
    const autoSpacing = {
      horizontal: 2,
      vertical: 2,
    };

    // Calculate badge size in mm (convert from px if needed)
    let badgeWidthMM = badgeWidth;
    let badgeHeightMM = badgeHeight;

    // If dimensions are in pixels, convert to mm (assuming 96 DPI)
    if (badgeWidthMM > 100 || badgeHeightMM > 100) {
      badgeWidthMM = badgeWidthMM * 0.264583; // Convert px to mm
      badgeHeightMM = badgeHeightMM * 0.264583;
    }

    // Ensure minimum reasonable size for badges
    badgeWidthMM = Math.max(badgeWidthMM, 50); // Min 50mm width
    badgeHeightMM = Math.max(badgeHeightMM, 30); // Min 30mm height

    const usableWidth = pageWidth - autoPadding.left - autoPadding.right;
    const usableHeight = pageHeight - autoPadding.top - autoPadding.bottom;

    const cols = Math.max(1, Math.floor(usableWidth / (badgeWidthMM + autoSpacing.horizontal)));
    const rows = Math.max(1, Math.floor(usableHeight / (badgeHeightMM + autoSpacing.vertical)));

    // Update exportSettings with calculated values for internal use
    // exportSettings.padding = autoPadding; // Avoid mutating exportSettings directly here
    // exportSettings.spacing = autoSpacing;

    const autoResult = { cols, rows, badgesPerPage: cols * rows, badgeWidthMM, badgeHeightMM, calculatedPadding: autoPadding, calculatedSpacing: autoSpacing };
    return autoResult;
  }

  const handleSettingChange = (key, value) => {
    setExportSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handlePaddingChange = (side, value) => {
    setExportSettings((prev) => ({
      ...prev,
      padding: { ...prev.padding, [side]: parseInt(value) || 0 },
    }));
  };

  const handleSpacingChange = (type, value) => {
    setExportSettings((prev) => ({
      ...prev,
      spacing: { ...prev.spacing, [type]: parseInt(value) || 0 },
    }));
  };

  // ADDED: Helper function to safely parse badgeData
  const parseBadgeData = (badgeData) => {
    try {
      if (!badgeData?.builderData) {
        console.warn("No builderData found in badgeData");
        return { elements: [], background: null, contentElements: [] };
      }

      const elements = JSON.parse(badgeData.builderData);
      if (!Array.isArray(elements)) {
        console.warn("builderData is not an array");
        return { elements: [], background: null, contentElements: [] };
      }

      const background = elements.find((el) => el.type === "background");
      const contentElements = elements.filter((el) => el.type !== "background");

      return { elements, background, contentElements };
    } catch (error) {
      console.error("Error parsing badgeData.builderData:", error);
      return { elements: [], background: null, contentElements: [] };
    }
  };

  // ADDED: Helper function to get background image URL
  const getBackgroundImageUrl = (badgeData, backgroundElement) => {
    const CDN_PREFIX = "https://event-manager.syd1.digitaloceanspaces.com/";

    // Prefer badgeData.backgroundImage
    if (badgeData?.backgroundImage) {
      // If it's already a full URL (http/https), use it directly
      if (badgeData.backgroundImage.startsWith("http")) {
        return badgeData.backgroundImage;
      }
      // If it's a blob URL, use it directly (for immediate preview)
      if (badgeData.backgroundImage.startsWith("blob:")) {
        return badgeData.backgroundImage;
      }
      // Otherwise, assume it's a relative path and add CDN prefix
      return CDN_PREFIX + badgeData.backgroundImage;
    }

    // Fallback to background element from builderData
    if (backgroundElement?.src) {
      // If it's already a full URL (http/https), use it directly
      if (backgroundElement.src.startsWith("http")) {
        return backgroundElement.src;
      }
      // If it's a blob URL, use it directly (for immediate preview)
      if (backgroundElement.src.startsWith("blob:")) {
        return backgroundElement.src;
      }
      // Otherwise, assume it's a relative path and add CDN prefix
      return CDN_PREFIX + backgroundElement.src;
    }

    return null;
  };

  // ADDED: Helper function to get badge dimensions
  const getBadgeDimensions = (badgeData) => {
    const defaultWidth = 600;
    const defaultHeight = 800;
    const width = badgeData?.layoutWidth;
    const height = badgeData?.layoutHeight;
    return {
      width: width && width > 0 ? width : defaultWidth,
      height: height && height > 0 ? height : defaultHeight,
    };
  };

  // ADDED: Fallback UI for invalid badgeData
  const renderFallbackPreview = () => {
    return (
      <div className="space-y-3">
        {/* Page Layout Preview Only */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <div className="text-center mb-3">
            <h4 className="font-semibold text-gray-900 text-sm">Page Layout</h4>
            <p className="text-xs text-red-500">Unable to calculate layout</p>
          </div>
          <div className="flex justify-center">
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 w-20 h-28">
              <div className="w-full h-full bg-white border border-gray-200 rounded relative flex items-center justify-center">
                <div className="text-gray-400 text-xs text-center">No data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced renderBadgePreview function with real badge design
  const renderBadgePreview = () => {
    // ADDED: Check if badgeData is valid
    if (!badgeData || !badgeData.builderData) {
      return renderFallbackPreview();
    }

    const format = exportSettings.previewFormat;
    const showBackground = format === "print" || format === "both";
    const showContent = format === "both" || format === "kiosk";
    const isKioskMode = format === "kiosk";

    // Parse the badge elements from badgeData using helper function
    const { elements, background, contentElements } = parseBadgeData(badgeData);

    // ADDED: Check if parsing was successful
    if (elements.length === 0) {
      return renderFallbackPreview();
    }

    const backgroundImageUrl = getBackgroundImageUrl(badgeData, background);
    const { width: badgeWidth, height: badgeHeight } = getBadgeDimensions(badgeData);

    // Use previewRegistration for preview data
    const sampleData = previewRegistration || {};

    // Helper function to get element content with registration data
    const getElementContent = (element) => {
      if (element.type === "background") {
        return backgroundImageUrl;
      }
      let value = null;

      // Special handling for event field
      if (element.preset === "event" || element.var === "event") {
        if (sampleData.event && typeof sampleData.event === "object") {
          return sampleData.event.title || sampleData.event.name || sampleData.event.value || sampleData.event._id || "";
        }
        return sampleData.event || "";
      }

      // Handle user field types
      if (element.var && sampleData?.formData) {
        const fieldValue = sampleData.formData[element.var];
        if (fieldValue !== undefined && fieldValue !== null) {
          // Handle different field types
          if (element.fieldType === "checkbox") {
            return fieldValue ? "☑ Selected" : "☐ Not Selected";
          } else if (element.fieldType === "multiplechoice") {
            return `○ ${fieldValue}`;
          } else if (element.fieldType === "select" || element.fieldType === "dropdown") {
            return fieldValue; // Removed arrow, just show the selected value
          } else if (element.fieldType === "date") {
            return new Date(fieldValue).toLocaleDateString();
          } else if (element.fieldType === "datetime") {
            return new Date(fieldValue).toLocaleString();
          } else if (element.fieldType === "textarea" || element.fieldType === "paragraph") {
            return fieldValue.length > 50 ? fieldValue.substring(0, 50) + "..." : fieldValue;
          }
          return fieldValue;
        }
      }

      if (element.preset && sampleData[element.preset]) value = sampleData[element.preset];
      else if (element.var && sampleData[element.var]) value = sampleData[element.var];
      else value = element.content || element.label || "Sample Text";

      if (typeof value === "object" && value !== null) {
        if (value.value) return value.value;
        if (value.label) return value.label;
        if (value.name) return value.name;
        if (value.title) return value.title;
        if (Array.isArray(value)) return value.join(", ");
        return JSON.stringify(value);
      }
      return value;
    };

    // --- NEW: Calculate grid layout for preview ---
    const { cols, rows } = getGridLayout();
    const badgesPerPage = cols * rows;

    // Ensure badgeARPercentage is defined here with robust calculation
    const { width: badgeDesignWidth, height: badgeDesignHeight } = getBadgeDimensions(badgeData);

    const calculatedBadgeARPercentage =
      badgeDesignWidth && badgeDesignWidth > 0 && badgeDesignHeight && badgeDesignHeight > 0 && isFinite(badgeDesignWidth) && isFinite(badgeDesignHeight)
        ? (badgeDesignHeight / badgeDesignWidth) * 100
        : (4 / 3) * 100; // Default to 4:3 aspect ratio

    const badgeARPercentage = calculatedBadgeARPercentage;

    return (
      <div className="space-y-3">
        {/* Page Layout Preview Only */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 overflow-auto">
          <div className="text-center mb-3">
            <h4 className="font-semibold text-gray-900 text-sm">Page Layout</h4>
            <p className="text-xs text-gray-500">
              {exportSettings.paperSize} • {exportSettings.orientation} • {badgesPerPage} badges/page
            </p>
          </div>

          <div className="flex justify-center">
            <div className={`bg-gray-100 border border-gray-300 rounded-lg p-2 ${exportSettings.orientation === "landscape" ? "w-28 h-20" : "w-20 h-28"}`}>
              <div className="w-full h-full bg-white border border-gray-200 rounded relative" style={{ padding: "2px" }}>
                <div className="grid gap-0.5 w-full" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {Array.from({ length: badgesPerPage }, (_, i) => {
                    const cellContentStyle = {
                      position: "relative",
                      width: "100%",
                    };
                    const spacerStyle = {
                      paddingTop: `${badgeARPercentage}%`,
                    };

                    return (
                      <div key={i} className={`rounded-sm border relative overflow-hidden ${showBackground ? "border-blue-300" : "border-gray-400 border-dashed"}`}>
                        <div style={cellContentStyle}>
                          <div style={spacerStyle} /> {/* Aspect ratio spacer */}
                          <div className="absolute inset-0">
                            {" "}
                            {/* Content overlay */}
                            {/* Mini background */}
                            {showBackground && backgroundImageUrl && (
                              <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImageUrl})`, opacity: 0.8 }} />
                            )}
                            {showBackground && !backgroundImageUrl && <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100" />}
                            {/* Mini content indicator */}
                            {showContent && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <User size={8} className="text-blue-600" />
                              </div>
                            )}
                            {!showContent && !showBackground && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-2 text-xs text-gray-500">{Math.ceil(getSelectedCount() / badgesPerPage)} pages needed</div>
        </div>
      </div>
    );
  };

  // Helper: Get value for sorting from registration
  function getSortValue(reg, field) {
    let value = reg[field];
    // Special handling for name sorting
    if (field === "name") {
      value = reg.name || reg.fullName || (reg.firstName && reg.lastName ? `${reg.firstName} ${reg.lastName}` : reg.firstName) || "";
    }
    if (typeof value === "object" && value !== null) {
      if (value.value) return value.value;
      if (value.label) return value.label;
      if (value.name) return value.name;
      if (value.title) return value.title;
      if (Array.isArray(value)) return value.join(", ");
      return JSON.stringify(value);
    }
    if (value === undefined || value === null) return "";
    return value;
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

  // Helper: Get page size in mm based on exportSettings
  function getPageSize() {
    let width = 210,
      height = 297; // Default A4 portrait
    if (exportSettings.paperSize === "A4") {
      width = 210;
      height = 297;
    } else if (exportSettings.paperSize === "Letter") {
      width = 216;
      height = 279;
    } else if (exportSettings.paperSize === "A3") {
      width = 297;
      height = 420;
    } else if (exportSettings.paperSize === "Legal") {
      width = 216;
      height = 356;
    }
    if (exportSettings.orientation === "landscape") {
      return { width: height, height: width };
    }
    return { width, height };
  }

  // FIXED: Updated renderBadgeHTML function with proper QR code generation
  function renderBadgeHTML(badgeData, registration, widthMM, heightMM, format = "both") {
    // Use helper functions for consistent parsing
    const { elements, background, contentElements } = parseBadgeData(badgeData);
    const backgroundImageUrl = getBackgroundImageUrl(badgeData, background);
    const { width: originalWidth, height: originalHeight } = getBadgeDimensions(badgeData);

    // Convert mm to px
    const widthPx = widthMM * 3.78;
    const heightPx = heightMM * 3.78;

    // Determine what to show
    const showBackground = format === "print" || format === "both";
    const showContent = format === "both" || format === "kiosk";

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
    const getValue = (el) => {
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

      if (el.type === "qr") {
        // Generate QR data with registration information
        const qrData = {
          id: registration?.registrationId || registration?._id || registration?.id,
          name:
            registration?.fullName ||
            registration?.name ||
            (registration?.firstName && registration?.lastName ? `${registration.firstName} ${registration.lastName}` : null) ||
            registration?.firstName,
          event: registration?.event?.title || registration?.event?.name || registration?.event,
          ticket: registration?.ticket?.title || registration?.ticket?.name || registration?.ticketName,
          timestamp: new Date().toISOString(),
        };

        // You can customize the QR code content format here
        // Option 1: Just the registration ID
        value = registration?.registrationId || registration?._id || registration?.id || "QR_CODE_DATA";

        // Option 2: JSON data (uncomment if you want more data in QR)
        // value = JSON.stringify(qrData);

        // Option 3: Custom URL format (uncomment and customize if needed)
        // value = `https://yourdomain.com/verify/${registration?.registrationId || registration?._id}`;

        return value;
      }

      // Handle user field types
      if (el.var && registration?.formData) {
        const fieldValue = registration.formData[el.var];
        if (fieldValue !== undefined && fieldValue !== null) {
          // Handle different field types
          if (el.fieldType === "checkbox") {
            return fieldValue ? "☑ Selected" : "☐ Not Selected";
          } else if (el.fieldType === "multiplechoice") {
            return `○ ${fieldValue}`;
          } else if (el.fieldType === "select" || el.fieldType === "dropdown") {
            return fieldValue; // Removed arrow, just show the selected value
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

    // FIXED: Generate QR codes as data URLs for proper PDF rendering
    const qrElements = contentElements.filter((el) => el.type === "qr");
    const qrPromises = qrElements.map(async (el) => {
      const qrValue = getValue(el);
      const qrDataURL = await generateQRCodeDataURL(qrValue, {
        size: Math.min(el.width, el.height) * 3, // Higher resolution for PDF
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
          showContent
            ? contentElements
                .map((el) => {
                  const scaleX = widthPx / originalWidth;
                  const scaleY = heightPx / originalHeight;

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
                    const textValue = getValue(el);
                    return `
                    <div style="
                      position: absolute;
                      left: ${el.positionX * scaleX}px;
                      top: ${el.positionY * scaleY}px;
                      width: ${el.width * scaleX}px;
                      height: ${el.height * scaleY}px;
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

                  // Handle select-based elements
                  if (el.type === "select" || el.type === "dropdown" || el.type === "multiplechoice" || el.type === "checkbox") {
                    const selectValue = getValue(el);
                    return `
          <div style="
            position: absolute;
            left: ${el.positionX * scaleX}px;
            top: ${el.positionY * scaleY}px;
            width: ${el.width * scaleX}px;
            height: ${el.height * scaleY}px;
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
              left: ${el.positionX * scaleX}px;
              top: ${el.positionY * scaleY}px;
              width: ${el.width * scaleX}px;
              height: ${el.height * scaleY}px;
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
              left: ${el.positionX * scaleX}px;
              top: ${el.positionY * scaleY}px;
              width: ${el.width * scaleX}px;
              height: ${el.height * scaleY}px;
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

                  // Handle image elements
                  if (el.type === "image" || el.type === "file") {
                    const imageValue = getValue(el);
                    if (imageValue && imageValue !== "Sample Text") {
                      return `
            <div style="
              position: absolute;
              left: ${el.positionX * scaleX}px;
              top: ${el.positionY * scaleY}px;
              width: ${el.width * scaleX}px;
              height: ${el.height * scaleY}px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: ${el.borderRadius || 0}px;
              border: ${el.borderWidth || 0}px solid ${el.borderColor || "#000000"};
              overflow: hidden;
            ">
              <img src="${imageValue}" style="width: 100%; height: 100%; object-fit: cover;" alt="User Image" />
            </div>
          `;
                    }
                  }

                  // Fallback for unknown element types
                  const fallbackValue = getValue(el);
                  return `
        <div style="
          position: absolute;
          left: ${el.positionX * scaleX}px;
          top: ${el.positionY * scaleY}px;
          width: ${el.width * scaleX}px;
          height: ${el.height * scaleY}px;
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

  // UPDATED: Modified handlePrint function to handle async QR generation
  const handlePrint = async (withPreview = false) => {
    // ADDED: Validate badgeData before proceeding
    if (!badgeData || !badgeData.builderData) {
      alert("Invalid badge data. Please check badge configuration.");
      return;
    }

    const { elements } = parseBadgeData(badgeData);
    if (elements.length === 0) {
      alert("No badge elements found. Please check badge configuration.");
      return;
    }

    if (withPreview) {
      setShowPreviewModal(true);
      return;
    }

    setIsPrinting(true);

    try {
      console.log("🖨️ Starting print process...");

      // Filter registrations based on selected filter
      let filteredRegistrations = [...registrations];

      if (exportSettings.attendeeSelection === "new") {
        // Get undownloaded registrations from the API
        try {
          const response = await getData(
            {
              eventId: badgeData.event._id,
              ticketId: badgeData.ticket._id,
              badgeId: badgeData._id,
            },
            "badge-download/undownloaded-registrations"
          );

          const data = response?.data;
          if (data?.success && Array.isArray(data.undownloadedIds)) {
            // Filter to only include registrations that haven't been downloaded
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
      } else if (exportSettings.attendeeSelection === "approved") {
        filteredRegistrations = registrations.filter((reg) => reg.approve);
      } else if (exportSettings.attendeeSelection === "rejected") {
        filteredRegistrations = registrations.filter((reg) => reg.reject);
      } else if (exportSettings.attendeeSelection === "tickets") {
        if (exportSettings.selectedTickets.length > 0) {
          filteredRegistrations = registrations.filter((reg) => {
            const ticketId = reg.ticket?._id || reg.ticket?.id || reg.ticket;
            return exportSettings.selectedTickets.includes(ticketId);
          });
        } else {
          filteredRegistrations = [];
        }
      }
      // For "all", we keep all registrations as is

      // console.log("📊 Filtered registrations:", filteredRegistrations.length);

      // Sort registrations
      const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
        const aValue = getSortValue(a, sortBy);
        const bValue = getSortValue(b, sortBy);
        return sortOrder === "asc"
          ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: "base" })
          : String(bValue).localeCompare(String(aValue), undefined, { numeric: true, sensitivity: "base" });
      });

      // Calculate grid layout and badges per page
      const { width: pageWidth, height: pageHeight } = getPageSize();
      const layout = getGridLayout();
      const cols = layout.cols;
      const rows = layout.rows;
      const badgesPerPage = layout.badgesPerPage; // This is exportSettings.badgesPerPage or calculated
      const totalPages = Math.ceil(sortedRegistrations.length / badgesPerPage);

      // Use badgeWidth and badgeHeight directly from getGridLayout result (they are in MM)
      const badgeCellWidthMM = layout.badgeWidth !== undefined ? layout.badgeWidth : layout.badgeWidthMM;
      const badgeCellHeightMM = layout.badgeHeight !== undefined ? layout.badgeHeight : layout.badgeHeightMM;

      // console.log("BadgeExport - Print process using cell dimensions (MM):", {
      //   badgeCellWidthMM,
      //   badgeCellHeightMM,
      //   cols,
      //   rows,
      //   badgesPerPage,
      // });

      if (!(badgeCellWidthMM > 0 && badgeCellHeightMM > 0 && isFinite(badgeCellWidthMM) && isFinite(badgeCellHeightMM))) {
        console.error("BadgeExport - Invalid badge cell dimensions for printing:", { badgeCellWidthMM, badgeCellHeightMM });
        alert("Error: Calculated badge dimensions for printing are invalid. Please check badge configuration and page settings.");
        setIsPrinting(false);
        return;
      }

      const format = exportSettings.previewFormat;

      // console.log("🎯 Print settings:", {
      //   totalRegistrations: sortedRegistrations.length,
      //   totalPages,
      //   badgesPerPage,
      //   format,
      // });

      // Generate HTML for printing with REAL user data and async QR handling
      const generateBadgeHTML = async (registration, cellWidth, cellHeight) => {
        const elements = badgeData?.builderData ? JSON.parse(badgeData.builderData) : [];
        const background = elements.find((el) => el.type === "background");
        const contentElements = elements.filter((el) => el.type !== "background");

        // Convert mm to px
        const widthPx = cellWidth * 3.78;
        const heightPx = cellHeight * 3.78;

        // Determine what to show
        const showBackground = format === "print" || format === "both";
        const showContent = format === "both" || format === "kiosk";

        // Background handling
        let backgroundStyle = "";
        if (showBackground && background?.src) {
          backgroundStyle = `background: url('${background.src}') center/cover no-repeat;`;
        } else if (showBackground) {
          backgroundStyle = `background: #ffffff;`;
        } else {
          backgroundStyle = `background: transparent;`;
        }

        // Helper function to get real user data
        const getUserValue = (element) => {
          if (element.preset === "name" || element.var === "name") {
            return (
              registration?.fullName ||
              registration?.name ||
              (registration?.firstName && registration?.lastName ? `${registration.firstName} ${registration.lastName}` : null) ||
              registration?.firstName ||
              "Attendee Name"
            );
          }

          if (element.preset === "event" || element.var === "event") {
            if (registration?.event && typeof registration.event === "object") {
              return registration.event.title || registration.event.name || "Event Name";
            }
            return registration?.event || "Event Name";
          }

          if (element.preset === "ticket" || element.var === "ticket") {
            if (registration?.ticket && typeof registration.ticket === "object") {
              return registration.ticket.title || registration.ticket.name || "Ticket Type";
            }
            return registration?.ticketName || registration?.ticket || "Ticket Type";
          }

          if (element.type === "qr") {
            return registration?._id || registration?.registrationId || "QR_CODE";
          }

          // Handle user field types
          if (element.var && registration?.formData) {
            const fieldValue = registration.formData[element.var];
            if (fieldValue !== undefined && fieldValue !== null) {
              // Handle different field types
              if (element.fieldType === "checkbox") {
                return fieldValue ? "☑ Selected" : "☐ Not Selected";
              } else if (element.fieldType === "multiplechoice") {
                return `○ ${fieldValue}`;
              } else if (element.fieldType === "select" || element.fieldType === "dropdown") {
                return fieldValue; // Removed arrow, just show the selected value
              } else if (element.fieldType === "date") {
                return new Date(fieldValue).toLocaleDateString();
              } else if (element.fieldType === "datetime") {
                return new Date(fieldValue).toLocaleString();
              } else if (element.fieldType === "textarea" || element.fieldType === "paragraph") {
                return fieldValue.length > 50 ? fieldValue.substring(0, 50) + "..." : fieldValue;
              }
              return fieldValue;
            }
          }

          // Fallback to element content or label
          return element.content || element.label || "Sample Text";
        };

        const originalWidth = badgeData.layoutWidth || 600;
        const originalHeight = badgeData.layoutHeight || 800;
        const scaleX = widthPx / originalWidth;
        const scaleY = heightPx / originalHeight;

        // Generate QR codes for this badge
        const qrElements = contentElements.filter((el) => el.type === "qr");
        const qrPromises = qrElements.map(async (el) => {
          const qrValue = getUserValue(el);
          const qrDataURL = await generateQRCodeDataURL(qrValue, {
            size: Math.min(el.width, el.height) * 3,
            bgColor: el.bgColor || "#FFFFFF",
            fgColor: el.fgColor || "#000000",
            level: el.level || "L",
            includeMargin: el.includeMargin !== false,
          });
          return { element: el, dataURL: qrDataURL };
        });

        const qrResults = await Promise.all(qrPromises);
        const qrMap = new Map(qrResults.map((result) => [result.element.id, result.dataURL]));

        const elementsHTML = showContent
          ? contentElements
              .map((el) => {
                // Handle all text-based elements
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
                  const textValue = getUserValue(el);
                  return `
              <div style="
                position: absolute;
                left: ${el.positionX * scaleX}px;
                top: ${el.positionY * scaleY}px;
                width: ${el.width * scaleX}px;
                height: ${el.height * scaleY}px;
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

                // Handle select-based elements
                if (el.type === "select" || el.type === "dropdown" || el.type === "multiplechoice" || el.type === "checkbox") {
                  const selectValue = getUserValue(el);
                  return `
              <div style="
                position: absolute;
                left: ${el.positionX * scaleX}px;
                top: ${el.positionY * scaleY}px;
                width: ${el.width * scaleX}px;
                height: ${el.height * scaleY}px;
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
                  left: ${el.positionX * scaleX}px;
                  top: ${el.positionY * scaleY}px;
                  width: ${el.width * scaleX}px;
                  height: ${el.height * scaleY}px;
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
                  left: ${el.positionX * scaleX}px;
                  top: ${el.positionY * scaleY}px;
                  width: ${el.width * scaleX}px;
                  height: ${el.height * scaleY}px;
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

                // Handle image elements
                if (el.type === "image" || el.type === "file") {
                  const imageValue = getUserValue(el);
                  if (imageValue && imageValue !== "Sample Text") {
                    return `
                <div style="
                  position: absolute;
                  left: ${el.positionX * scaleX}px;
                  top: ${el.positionY * scaleY}px;
                  width: ${el.width * scaleX}px;
                  height: ${el.height * scaleY}px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: ${el.borderRadius || 0}px;
                  border: ${el.borderWidth || 0}px solid ${el.borderColor || "#000000"};
                  overflow: hidden;
                ">
                  <img src="${imageValue}" style="width: 100%; height: 100%; object-fit: cover;" alt="User Image" />
                </div>
              `;
                  }
                }

                // Fallback for unknown element types
                const fallbackValue = getUserValue(el);
                return `
            <div style="
              position: absolute;
              left: ${el.positionX * scaleX}px;
              top: ${el.positionY * scaleY}px;
              width: ${el.width * scaleX}px;
              height: ${el.height * scaleY}px;
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
          : "";

        return `
          <div style="
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
            ${elementsHTML}
          </div>
        `;
      };

      // Generate all badges with QR codes
      const pagePromises = [];

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const badgePromises = [];

        for (let i = 0; i < badgesPerPage; i++) {
          const reg = sortedRegistrations[pageIndex * badgesPerPage + i];
          if (reg) {
            badgePromises.push(generateBadgeHTML(reg, badgeCellWidthMM, badgeCellHeightMM));
          } else {
            badgePromises.push(
              Promise.resolve(`<div style="width:${badgeCellWidthMM * 3.78}px;height:${badgeCellHeightMM * 3.78}px;border:1px solid #ccc;border-radius:8px;background:#fff;margin:auto;"></div>`)
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
                size: ${exportSettings.paperSize} ${exportSettings.orientation};
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
                padding: ${exportSettings.padding.top}mm ${exportSettings.padding.right}mm ${exportSettings.padding.bottom}mm ${exportSettings.padding.left}mm;
                box-sizing: border-box;
              }
              .badge-grid {
                display: grid;
                grid-template-columns: repeat(${cols}, 1fr);
                grid-template-rows: repeat(${rows}, 1fr);
                gap: ${exportSettings.spacing.horizontal}mm ${exportSettings.spacing.vertical}mm;
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
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 1000);
        };

        // UPDATED: Replace individual updates with batch update
        console.log(`🖨️ Updating print count for ${sortedRegistrations.length} registrations`);
        const updateSuccess = await updateBadgePrintCount(sortedRegistrations);

        if (updateSuccess) {
          console.log("✅ Badge print count updated successfully");
        } else {
          console.warn("⚠️ Failed to update badge print count");
        }

        // Refresh unprinted count after print
        await fetchUnprintedCount();

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

  // UPDATED: Modified handleDownload function to handle async QR generation
  const handleDownload = async () => {
    // ADDED: Validate badgeData before proceeding
    if (!badgeData || !badgeData.builderData) {
      alert("Invalid badge data. Please check badge configuration.");
      return;
    }

    const { elements } = parseBadgeData(badgeData);
    if (elements.length === 0) {
      alert("No badge elements found. Please check badge configuration.");
      return;
    }

    setIsDownloading(true);

    try {
      console.log("📥 Starting download process...");

      // Filter registrations based on selected filter
      let filteredRegistrations = [...registrations];

      if (exportSettings.attendeeSelection === "new") {
        // Get undownloaded registrations from the API
        try {
          const response = await getData(
            {
              eventId: badgeData.event._id,
              ticketId: badgeData.ticket._id,
              // REMOVED: badgeId since we're tracking by ticket only
            },
            "badge-download/undownloaded-registrations"
          );

          const data = response?.data;
          if (data?.success && Array.isArray(data.undownloadedIds)) {
            // Filter to only include registrations that haven't been downloaded
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
      } else if (exportSettings.attendeeSelection === "approved") {
        filteredRegistrations = registrations.filter((reg) => reg.approve);
      } else if (exportSettings.attendeeSelection === "rejected") {
        filteredRegistrations = registrations.filter((reg) => reg.reject);
      } else if (exportSettings.attendeeSelection === "tickets") {
        if (exportSettings.selectedTickets.length > 0) {
          filteredRegistrations = registrations.filter((reg) => {
            const ticketId = reg.ticket?._id || reg.ticket?.id || reg.ticket;
            return exportSettings.selectedTickets.includes(ticketId);
          });
        } else {
          filteredRegistrations = [];
        }
      }

      // Sort registrations
      const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
        const aValue = getSortValue(a, sortBy);
        const bValue = getSortValue(b, sortBy);
        return sortOrder === "asc"
          ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: "base" })
          : String(bValue).localeCompare(String(aValue), undefined, { numeric: true, sensitivity: "base" });
      });

      // Calculate layout
      const { width: pageWidth, height: pageHeight } = getPageSize();
      const layout = getGridLayout();
      const cols = layout.cols;
      const rows = layout.rows;
      const badgesPerPage = layout.badgesPerPage; // This is exportSettings.badgesPerPage or calculated
      const totalPages = Math.ceil(sortedRegistrations.length / badgesPerPage);

      const badgeCellWidthMM = layout.badgeWidth !== undefined ? layout.badgeWidth : layout.badgeWidthMM;
      const badgeCellHeightMM = layout.badgeHeight !== undefined ? layout.badgeHeight : layout.badgeHeightMM;

      const format = exportSettings.previewFormat;

      // console.log("🎯 Download settings:", {
      //   totalRegistrations: sortedRegistrations.length,
      //   totalPages,
      //   badgesPerPage,
      //   format,
      // });

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
          const reg = sortedRegistrations[pageIndex * badgesPerPage + i];
          if (reg) {
            // Each badge HTML generation now returns a promise
            badgePromises.push(renderBadgeHTML(badgeData, reg, badgeCellWidthMM, badgeCellHeightMM, format));
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

        // Wait for all badges on this page to be generated
        pagePromises.push(
          Promise.all(badgePromises).then(
            (badgeHTMLs) => `
              <div class="page" style="width:${pageWidth}mm;height:${pageHeight}mm;page-break-after:always;display:block;">
                <div class="badge-grid" style="
                  display:grid;
                  grid-template-columns:repeat(${cols}, 1fr);
                  grid-template-rows:repeat(${rows}, 1fr);
                  gap:${exportSettings.spacing.horizontal}mm ${exportSettings.spacing.vertical}mm;
                  width:100%;height:100%;">
                  ${badgeHTMLs.join("")}
                </div>
              </div>
            `
          )
        );
      }

      // Wait for all pages to be generated
      const pageHTMLs = await Promise.all(pagePromises);
      container.innerHTML = pageHTMLs.join("");

      console.log("🧪 Generated HTML for PDF with QR codes");

      // Wait for all images (including QR codes) to load
      await waitForImagesToLoad(container);

      if (!(badgeCellWidthMM > 0 && badgeCellHeightMM > 0 && isFinite(badgeCellWidthMM) && isFinite(badgeCellHeightMM))) {
        console.error("BadgeExport - Invalid badge cell dimensions for PDF download:", { badgeCellWidthMM, badgeCellHeightMM });
        alert("Error: Calculated badge dimensions for PDF download are invalid. Please check badge configuration and page settings.");
        setIsDownloading(false);
        if (container && container.parentElement) {
          document.body.removeChild(container);
        }
        return;
      }

      // Generate PDF
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: exportSettings.orientation,
        unit: "mm",
        format: exportSettings.paperSize.toLowerCase(),
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

      // UPDATED: Replace individual updates with batch update
      console.log(`📊 Updating download count for ${sortedRegistrations.length} registrations`);
      const updateSuccess = await updateBadgeDownloadCount(sortedRegistrations);

      if (updateSuccess) {
        console.log("✅ Badge download count updated successfully");
      } else {
        console.warn("⚠️ Failed to update badge download count");
      }

      pdf.save("Badges.pdf");
      document.body.removeChild(container);

      // Refresh unprinted count after download
      await fetchUnprintedCount();

      console.log("✅ PDF download completed successfully with QR codes");
    } catch (error) {
      console.error("❌ Download error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const cardBase = "bg-white rounded-lg border border-gray-200 p-3 shadow-sm";
  const sectionTitle = "text-sm font-semibold text-gray-900 mb-2";
  const buttonBase = "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
  const buttonPrimary = "bg-blue-600 text-white hover:bg-blue-700";
  const buttonSecondary = "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50";
  const buttonOutline = "border border-blue-300 text-blue-700 bg-white hover:bg-blue-50";

  const renderStep1 = () => {
    const attendeeOptions = [
      {
        id: "all",
        label: "All Attendees",
        count: registrationCounts.total || 0,
        icon: Layers,
      },
      {
        id: "new",
        label: "New Only",
        count: unprintedCount,
        icon: Layers,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
        {/* Left: Attendee Selection and Badge Format */}
        <div className="flex flex-col gap-2 h-full">
          {/* Attendee Selection Card - Fixed height */}
          <div className={cardBase + " flex-shrink-0"} style={{ height: exportSettings.attendeeSelection === "tickets" ? "380px" : "248px" }}>
            <div className={sectionTitle}>Select Attendees</div>
            <div className="space-y-2">
              {attendeeOptions.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = exportSettings.attendeeSelection === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex items-center border-2 rounded-lg cursor-pointer transition-all px-3 py-2 min-h-[60px] ${
                      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input type="radio" value={option.id} checked={isSelected} onChange={(e) => handleSettingChange("attendeeSelection", e.target.value)} className="sr-only" />
                    <span className={`flex items-center justify-center w-8 h-8 rounded-md mr-3 flex-shrink-0 ${isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                      <OptionIcon size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm leading-tight">{option.label}</div>
                      {option.id === "tickets" ? (
                        <div className="text-sm text-blue-600 leading-tight font-semibold">
                          {option.count} registrations selected / {option.total} total
                        </div>
                      ) : (
                        <div className="text-sm text-blue-600 leading-tight font-semibold">{option.count} registrations</div>
                      )}
                      <div className="text-xs text-gray-500 leading-tight">{option.description}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-blue-600 ml-2 flex-shrink-0" />}
                  </label>
                );
              })}
            </div>

            {/* Fixed height container for tickets to prevent layout shift */}
            {exportSettings.attendeeSelection === "tickets" && (
              <div className="mt-3 h-32">
                <div className="p-3 bg-gray-50 rounded-md h-full overflow-y-auto">
                  <div className="font-medium text-gray-900 mb-2 text-sm">Select Ticket Types</div>
                  {tickets && tickets.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {tickets.map((ticket) => {
                        const ticketId = getId(ticket.id || ticket._id || ticket.value);
                        const registrationCount = registrationCounts.tickets?.[ticketId] || 0;
                        return (
                          <label key={ticketId} className="flex items-center p-2 border-2 border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 cursor-pointer transition-all min-h-[40px]">
                            <input
                              type="checkbox"
                              checked={exportSettings.selectedTickets.includes(ticketId)}
                              onChange={(e) => {
                                const newSelected = e.target.checked ? [...exportSettings.selectedTickets, ticketId] : exportSettings.selectedTickets.filter((id) => id !== ticketId);
                                handleSettingChange("selectedTickets", newSelected);
                              }}
                              className="w-4 h-4 text-blue-600 rounded mr-2 flex-shrink-0 focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm leading-tight truncate">{ticket.name || ticket.title || ticket.value || ticket.label || "Unnamed Ticket"}</div>
                              <div className="text-xs text-blue-600">{registrationCount} registrations</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">{tickets.length === 0 ? "Loading tickets..." : "No tickets available"}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Badge Format below attendee selection - Fixed position */}
          <div className={cardBase + " flex-shrink-0"}>
            <div className={sectionTitle}>Badge Format</div>
            <div className="space-y-2">
              {previewFormats.map((format) => {
                const FormatIcon = format.icon;
                const isSelected = exportSettings.previewFormat === format.id;
                const colorClass =
                  format.color === "blue"
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : format.color === "purple"
                      ? "border-purple-500 bg-purple-50 text-purple-600"
                      : "border-green-500 bg-green-50 text-green-600";
                return (
                  <label
                    key={format.id}
                    className={`flex items-center border-2 rounded-lg cursor-pointer transition-all px-3 py-2 min-h-[50px] ${
                      isSelected ? colorClass : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input type="radio" value={format.id} checked={isSelected} onChange={(e) => handleSettingChange("previewFormat", e.target.value)} className="sr-only" />
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-md mr-3 ${
                        format.color === "blue" ? "bg-blue-100 text-blue-600" : format.color === "purple" ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"
                      }`}
                    >
                      <FormatIcon size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm leading-tight">{format.label}</div>
                      <div className="text-xs text-gray-500 leading-tight">{format.description}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className={`ml-2 ${format.color === "blue" ? "text-blue-600" : format.color === "purple" ? "text-purple-600" : "text-green-600"}`} />}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Preview & Summary */}
        <div className={cardBase + " flex flex-col gap-2 justify-between"}>
          <div className="flex-1 flex flex-col items-center justify-center">{renderBadgePreview()}</div>
          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="flex flex-wrap gap-4 text-xs justify-between">
              <div>
                <span className="text-gray-600">Registrations:</span> <span className="font-medium text-blue-600">{getSelectedCount()}</span>
              </div>
              <div>
                <span className="text-gray-600">Format:</span> <span className="font-medium capitalize">{exportSettings.previewFormat}</span>
              </div>
              <div>
                <span className="text-gray-600">Paper:</span>{" "}
                <span className="font-medium">
                  {exportSettings.paperSize} {exportSettings.orientation}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Pages:</span> <span className="font-medium">{Math.ceil(getSelectedCount() / calculateBadgesPerPage())}</span>
              </div>
              <div>
                <span className="text-gray-600">Print sides:</span> <span className="font-medium capitalize">{exportSettings.printSides}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative pb-4">
      {/* Print & Layout Settings */}
      <div className={cardBase + " flex flex-col gap-3"}>
        <div className={sectionTitle}>Print Settings</div>
        <div className="grid grid-cols-2 gap-2">
          <CustomDropdown
            label="Paper Size"
            value={exportSettings.paperSize}
            options={paperSizes}
            onChange={(value) => handleSettingChange("paperSize", value)}
            isOpen={dropdownStates.paperSize}
            onToggle={() => toggleDropdown("paperSize")}
          />
          <CustomDropdown
            label="Orientation"
            value={exportSettings.orientation}
            options={[
              { value: "portrait", label: "Portrait" },
              { value: "landscape", label: "Landscape" },
            ]}
            onChange={(value) => handleSettingChange("orientation", value)}
            isOpen={dropdownStates.orientation}
            onToggle={() => toggleDropdown("orientation")}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label
            className={`p-2 border rounded-lg cursor-pointer transition-colors flex flex-col items-center text-xs font-medium ${
              exportSettings.printSides === "single" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input type="radio" value="single" checked={exportSettings.printSides === "single"} onChange={(e) => handleSettingChange("printSides", e.target.value)} className="sr-only" />
            <Printer size={12} className="mb-1" />
            Single Side
            <span className="text-gray-400 text-xs">Front only</span>
          </label>
          <label
            className={`p-2 border rounded-lg cursor-pointer transition-colors flex flex-col items-center text-xs font-medium ${
              exportSettings.printSides === "double" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input type="radio" value="double" checked={exportSettings.printSides === "double"} onChange={(e) => handleSettingChange("printSides", e.target.value)} className="sr-only" />
            <Layers size={12} className="mb-1" />
            Double Side
            <span className="text-gray-400 text-xs">Front & back</span>
          </label>
        </div>
        <div className={sectionTitle + " mt-1"}>Layout Settings</div>
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(exportSettings.padding).map(([side, value]) => (
            <div key={side}>
              <label className="block text-xs text-gray-600 capitalize mb-1">{side}</label>
              <input
                type="number"
                min="0"
                max="50"
                value={value}
                onChange={(e) => handlePaddingChange(side, e.target.value)}
                className="w-full px-2 py-1.5 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Horizontal</label>
            <input
              type="number"
              min="0"
              max="20"
              value={exportSettings.spacing.horizontal}
              onChange={(e) => handleSpacingChange("horizontal", e.target.value)}
              className="w-full px-2 py-1.5 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Vertical</label>
            <input
              type="number"
              min="0"
              max="20"
              value={exportSettings.spacing.vertical}
              onChange={(e) => handleSpacingChange("vertical", e.target.value)}
              className="w-full px-2 py-1.5 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-1 flex items-center gap-2">
          <Grid size={12} className="text-blue-600" />
          <div className="text-xs">
            <span className="font-medium text-blue-900 mr-2">{calculateBadgesPerPage()} per page</span>
            <span className="text-blue-700">
              Auto-calculated based on badge dimensions • {Math.ceil(getSelectedCount() / calculateBadgesPerPage())} pages for {getSelectedCount()} registrations
            </span>
          </div>
        </div>
        <div className={sectionTitle + " mt-1"}>Sort By</div>
        <div className="flex gap-2">
          <CustomDropdown
            label="Field"
            value={sortBy}
            options={userFields && userFields.length > 0 ? userFields.map((f) => ({ value: f.var, label: f.label })) : [{ value: "name", label: "Name" }]}
            onChange={(value) => setSortBy(value)}
            isOpen={dropdownStates.field}
            onToggle={() => toggleDropdown("field")}
            className="flex-1"
            openUpward={true}
          />
          <CustomDropdown
            label="Order"
            value={sortOrder}
            options={sortOrders}
            onChange={(value) => setSortOrder(value)}
            isOpen={dropdownStates.order}
            onToggle={() => toggleDropdown("order")}
            className="w-36"
            openUpward={true}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CustomDropdown
            label="Badges per page"
            value={exportSettings.badgesPerPage}
            options={badgesPerPageOptions.map((n) => ({ value: n, label: `${n}` }))}
            onChange={(value) => handleSettingChange("badgesPerPage", Number(value))}
            isOpen={dropdownStates.badgesPerPage}
            onToggle={() => toggleDropdown("badgesPerPage")}
          />
        </div>
      </div>
      {/* Preview & Summary */}
      <div className={cardBase + " flex flex-col gap-2 justify-between"}>
        <div className="flex-1 flex flex-col items-center justify-center">{renderBadgePreview()}</div>
        <div className="border-t border-gray-100 pt-2 mt-2">
          <div className="flex flex-wrap gap-4 text-xs justify-between">
            <div>
              <span className="text-gray-600">Registrations:</span> <span className="font-medium text-blue-600">{getSelectedCount()}</span>
            </div>
            <div>
              <span className="text-gray-600">Format:</span> <span className="font-medium capitalize">{exportSettings.previewFormat}</span>
            </div>
            <div>
              <span className="text-gray-600">Paper:</span>{" "}
              <span className="font-medium">
                {exportSettings.paperSize} {exportSettings.orientation}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Pages:</span> <span className="font-medium">{Math.ceil(getSelectedCount() / calculateBadgesPerPage())}</span>
            </div>
            <div>
              <span className="text-gray-600">Print sides:</span> <span className="font-medium capitalize">{exportSettings.printSides}</span>
            </div>
          </div>
        </div>
        {/* Step 2: Action buttons */}
        <div className="flex flex-row gap-2 mt-2 justify-end">
          <button
            onClick={() => handlePrint(false)}
            disabled={isPrinting || isDownloading}
            className={`${buttonBase} ${buttonSecondary} ${isPrinting || isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isPrinting ? <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full" /> : <Printer size={14} />}
            <span>{isPrinting ? "Printing..." : "Print"}</span>
          </button>
          <button
            onClick={() => handlePrint(true)}
            disabled={isPrinting || isDownloading}
            className={`${buttonBase} ${buttonOutline} ${isPrinting || isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
          <button onClick={handleDownload} disabled={isPrinting || isDownloading} className={`${buttonBase} ${buttonPrimary} ${isPrinting || isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isDownloading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Download size={14} />}
            <span>{isDownloading ? "Downloading..." : "Download"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        closeAllDropdowns();
      }
    };
    if (Object.values(dropdownStates).some(Boolean)) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownStates]);

  // Generate QR PNGs for previewRegistration
  useEffect(() => {
    const generatePreviewQRCodes = async () => {
      if (!badgeData?.builderData || !previewRegistration) {
        setPreviewQrPngs({});
        return;
      }

      try {
        const { contentElements } = parseBadgeData(badgeData);
        const qrElements = contentElements.filter((el) => el.type === "qr");
        const qrPngs = {};

        for (const el of qrElements) {
          // Use the same logic as in renderBadgeHTML/getValue
          const qrValue = previewRegistration?.registrationId || previewRegistration?._id || previewRegistration?.id || "QR_CODE_DATA";
          qrPngs[el.id] = await generateQRCodeDataURL(qrValue, {
            size: Math.min(el.width, el.height) * 2,
            bgColor: el.bgColor || "#FFFFFF",
            fgColor: el.fgColor || "#000000",
            level: el.level || "L",
            includeMargin: el.includeMargin !== false,
          });
        }
        setPreviewQrPngs(qrPngs);
      } catch (error) {
        console.error("Error generating preview QR codes:", error);
        setPreviewQrPngs({});
      }
    };
    generatePreviewQRCodes();
  }, [badgeData, previewRegistration]);

  // Add keyboard support for full screen preview
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showFullScreenPreview) {
        setShowFullScreenPreview(false);
      }
    };

    if (showFullScreenPreview) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFullScreenPreview]);

  // Helper to get badges per page for use in JSX
  const calculateBadgesPerPage = () => getGridLayout().badgesPerPage;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-5xl h-[95vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <Download size={22} className="text-blue-600" />
            <h3 className="text-base font-bold text-gray-900">Badge Export & Print</h3>
          </div>
          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <button onClick={() => setCurrentStep(1)} className="mr-2 text-gray-500 hover:text-blue-600">
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 14 4 9l5-5" />
                  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H13" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-red-500">
              <X size={22} />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${currentStep === 2 ? "pr-2" : ""}`}>
          {currentStep === 1 ? (
            <div className={"h-full" + (currentStep === 1 && exportSettings.attendeeSelection === "tickets" && tickets.length > 2 ? " overflow-y-auto" : "")}>{renderStep1()}</div>
          ) : (
            <div className="h-full">{renderStep2()}</div>
          )}
        </div>
        {/* Step 1: Next button at bottom right */}
        {currentStep === 1 && (
          <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
            <button onClick={() => setCurrentStep(2)} className={buttonBase + " " + buttonPrimary + " text-base px-6 py-2"}>
              <span>Next</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
        {/* Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg">Badge Preview</h4>
                <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-red-500">
                  <X size={22} />
                </button>
              </div>
              {renderBadgePreview()}
            </div>
          </div>
        )}

        {/* Full Screen Preview Modal */}
        {showFullScreenPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setShowFullScreenPreview(false)}>
            <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
              <div className="flex justify-between items-center mb-4 text-white w-full">
                <h4 className="font-semibold text-lg">Full Size Badge Preview</h4>
                <button onClick={() => setShowFullScreenPreview(false)} className="text-white hover:text-red-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="relative overflow-auto bg-white rounded-lg shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
                {badgeData &&
                  badgeData.builderData &&
                  (() => {
                    const format = exportSettings.previewFormat;
                    const showBackground = format === "print" || format === "both";
                    const showContent = format === "both" || format === "kiosk";
                    const { elements, background, contentElements } = parseBadgeData(badgeData);
                    const backgroundImageUrl = getBackgroundImageUrl(badgeData, background);
                    const { width: badgeWidth, height: badgeHeight } = getBadgeDimensions(badgeData);
                    const sampleData = previewRegistration || {};

                    // Scale factor for display (0.5 = 50% of actual size for better screen viewing)
                    const displayScale = Math.min(0.8, Math.min((window.innerWidth * 0.7) / badgeWidth, (window.innerHeight * 0.7) / badgeHeight));
                    const displayWidth = badgeWidth * displayScale;
                    const displayHeight = badgeHeight * displayScale;

                    return (
                      <div className="relative flex flex-col items-center">
                        <div className="mb-2 text-sm text-gray-600 text-center">
                          Actual Size: {badgeWidth}×{badgeHeight}px | Display: {Math.round(displayScale * 100)}% scale
                        </div>
                        <div
                          className="relative border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
                          style={{
                            width: `${displayWidth}px`,
                            height: `${displayHeight}px`,
                          }}
                        >
                          {/* Background Layer */}
                          {showBackground && backgroundImageUrl && (
                            <div
                              className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                              style={{
                                backgroundImage: `url(${backgroundImageUrl})`,
                              }}
                            />
                          )}
                          {/* Default background for print mode when no background image */}
                          {format === "print" && !backgroundImageUrl && <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100" />}

                          {/* Content Elements */}
                          {showContent && contentElements.length > 0 && (
                            <div className="relative z-10 w-full h-full">
                              {contentElements.map((element) => {
                                const scaleX = displayScale;
                                const scaleY = displayScale;

                                const getElementContent = (element) => {
                                  if (element.type === "background") return backgroundImageUrl;
                                  let value = null;

                                  // Special handling for event field
                                  if (element.preset === "event" || element.var === "event") {
                                    if (sampleData.event && typeof sampleData.event === "object") {
                                      return sampleData.event.title || sampleData.event.name || sampleData.event.value || sampleData.event._id || "";
                                    }
                                    return sampleData.event || "";
                                  }

                                  // Handle user field types
                                  if (element.var && sampleData?.formData) {
                                    const fieldValue = sampleData.formData[element.var];
                                    if (fieldValue !== undefined && fieldValue !== null) {
                                      if (element.fieldType === "checkbox") {
                                        return fieldValue ? "☑ Selected" : "☐ Not Selected";
                                      } else if (element.fieldType === "multiplechoice") {
                                        return `○ ${fieldValue}`;
                                      } else if (element.fieldType === "select" || element.fieldType === "dropdown") {
                                        return fieldValue;
                                      } else if (element.fieldType === "date") {
                                        return new Date(fieldValue).toLocaleDateString();
                                      } else if (element.fieldType === "datetime") {
                                        return new Date(fieldValue).toLocaleString();
                                      } else if (element.fieldType === "textarea" || element.fieldType === "paragraph") {
                                        return fieldValue.length > 100 ? fieldValue.substring(0, 100) + "..." : fieldValue;
                                      }
                                      return fieldValue;
                                    }
                                  }

                                  if (element.preset && sampleData[element.preset]) value = sampleData[element.preset];
                                  else if (element.var && sampleData[element.var]) value = sampleData[element.var];
                                  else value = element.content || element.label || "Sample Text";

                                  if (typeof value === "object" && value !== null) {
                                    if (value.value) return value.value;
                                    if (value.label) return value.label;
                                    if (value.name) return value.name;
                                    if (value.title) return value.title;
                                    if (Array.isArray(value)) return value.join(", ");
                                    return JSON.stringify(value);
                                  }
                                  return value;
                                };

                                return (
                                  <div
                                    key={element.id}
                                    className="absolute"
                                    style={{
                                      left: `${element.positionX * scaleX}px`,
                                      top: `${element.positionY * scaleY}px`,
                                      width: `${element.width * scaleX}px`,
                                      height: `${element.height * scaleY}px`,
                                    }}
                                  >
                                    {(element.type === "text" ||
                                      element.type === "textarea" ||
                                      element.type === "paragraph" ||
                                      element.type === "mobilenumber" ||
                                      element.type === "number" ||
                                      element.type === "date" ||
                                      element.type === "datetime" ||
                                      element.type === "email") && (
                                      <div
                                        style={{
                                          color: element.color || "#000000",
                                          fontSize: `${(element.fontSize || 16) * scaleY}px`,
                                          fontWeight: element.fontWeight || "normal",
                                          fontStyle: element.fontStyle || "normal",
                                          textAlign: element.textAlign || "left",
                                          lineHeight: `${(element.lineHeight || element.fontSize * 1.2) * scaleY}px`,
                                          width: "100%",
                                          height: "100%",
                                          display: "flex",
                                          alignItems: element.alignContent === "center" ? "center" : element.alignContent === "end" ? "flex-end" : "flex-start",
                                          overflow: "hidden",
                                        }}
                                      >
                                        {getElementContent(element)}
                                      </div>
                                    )}
                                    {(element.type === "select" || element.type === "dropdown" || element.type === "multiplechoice" || element.type === "checkbox") && (
                                      <div
                                        style={{
                                          color: element.color || "#000000",
                                          fontSize: `${(element.fontSize || 14) * scaleY}px`,
                                          fontWeight: element.fontWeight || "normal",
                                          fontStyle: element.fontStyle || "normal",
                                          textAlign: element.textAlign || "left",
                                          lineHeight: `${(element.lineHeight || element.fontSize * 1.2) * scaleY}px`,
                                          width: "100%",
                                          height: "100%",
                                          display: "flex",
                                          alignItems: element.alignContent === "center" ? "center" : element.alignContent === "end" ? "flex-end" : "flex-start",
                                          overflow: "hidden",
                                        }}
                                      >
                                        {getElementContent(element)}
                                      </div>
                                    )}
                                    {(element.type === "image" || element.type === "file") && (
                                      <div
                                        className="w-full h-full flex items-center justify-center overflow-hidden"
                                        style={{
                                          borderRadius: `${(element.borderRadius || 0) * scaleX}px`,
                                          border: element.borderWidth ? `${element.borderWidth * scaleX}px solid ${element.borderColor}` : "none",
                                        }}
                                      >
                                        <img src={element.src || "/api/placeholder/40/40"} alt="Preview" className="w-full h-full object-cover" />
                                      </div>
                                    )}
                                    {element.type === "qr" && (
                                      <div className="w-full h-full flex items-center justify-center">
                                        {previewQrPngs[element.id] ? (
                                          <img
                                            src={previewQrPngs[element.id]}
                                            alt="QR Code"
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "contain",
                                            }}
                                          />
                                        ) : (
                                          <div
                                            className="bg-black"
                                            style={{
                                              width: `${Math.min(element.width, element.height) * scaleX}px`,
                                              height: `${Math.min(element.width, element.height) * scaleY}px`,
                                              backgroundColor: element.fgColor || "#000000",
                                            }}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Format indicator overlay */}
                          {format === "print" && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">Background Only</span>
                            </div>
                          )}
                          {format === "kiosk" && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">Content Only</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 text-center">Click outside to close • ESC to close</div>
                      </div>
                    );
                  })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeExport;
