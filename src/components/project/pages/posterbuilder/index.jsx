import React, { useState, useEffect, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { avathar, noimage } from "../../../../images";
import { getData, putData } from "../../../../backend/api";
import {
  Type,
  Layers,
  Trash2,
  Image as ImageIcon,
  Layout,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Bold,
  Italic,
  UserCircle2,
  Building2,
  User,
  Briefcase,
  Building,
  Contact,
  QrCode,
  FileText,
  ImagePlus,
  X,
  Calendar,
  MapPin,
  Phone,
  Users,
  Video,
  CalendarDays,
  Clock,
  Info,
  Building2 as Organization,
  PhoneCall,
  Copy,
  Upload,
  Printer,
  Circle,
  ChevronUp,
  ChevronDown,
  RectangleHorizontal,
  Triangle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GetIcon } from "../../../../icons";
import BadgeExport from "./BadgeExport";
import BadgeImport from "./BadgeImport";

const ELEMENT_GROUPS = {
  basic: {
    title: "Basic Elements",
    elements: [
      { id: "text", label: "Text", icon: FileText, type: "text" },
      { id: "image", label: "Image", icon: ImagePlus, type: "image" },
      { id: "video", label: "Video", icon: Video, type: "video" },
      { id: "qr", label: "QR Code", icon: QrCode, type: "qr" },
    ],
  },
  quickFields: {
    title: "Quick Fields",
    elements: [
      { id: "profile-image", label: "Profile Photo", icon: UserCircle2, type: "image", preset: "profile" },
      { id: "company-logo", label: "Company Logo", icon: Building2, type: "image", preset: "logo" },
      { id: "name", label: "Name", icon: User, type: "text", preset: "name" },
      { id: "designation", label: "Designation", icon: Briefcase, type: "text", preset: "designation" },
      { id: "company", label: "Company Name", icon: Building, type: "text", preset: "company" },
      { id: "contact", label: "Contact Info", icon: Contact, type: "text", preset: "contact" },
    ],
  },
  eventFields: {
    title: "Event Fields",
    elements: [
      { id: "qr", label: "QR Code", icon: QrCode, type: "qr" },
      { id: "image", label: "Background Image", icon: ImagePlus, type: "image" },
      { id: "event", label: "Event", icon: Calendar, type: "text", preset: "event", var: "title" },
      { id: "ticket", label: "Ticket", icon: FileText, type: "text", preset: "ticket", var: "ticket" },
      { id: "location", label: "Location", icon: MapPin, type: "text", preset: "location", var: "venue" },
      { id: "startDate", label: "Start Date", icon: CalendarDays, type: "text", preset: "startDate", var: "startDate" },
      { id: "endDate", label: "End Date", icon: Clock, type: "text", preset: "endDate", var: "endDate" },
      { id: "description", label: "Description", icon: Info, type: "text", preset: "description", var: "description" },
      { id: "organizer", label: "Organizer", icon: Organization, type: "text", preset: "organizer", var: "franchise" },
      { id: "contact", label: "Contact", icon: PhoneCall, type: "text", preset: "contact", var: "contactNumber" },
    ],
  },
  ticketFields: {
    title: "Ticket Fields",
    elements: [],
  },
};

const PosterBuilder = ({ type = "advocacy", data, setLoaderBox, setMessage }) => {
  useEffect(() => {
    if (data.ticket && !data.builderData) {
      // showImportModal(true);
      setShowImportModal(true);
      console.log("No badge design found");
    }
  }, [data]);
  const [details] = useState(() => {
    switch (type) {
      case "advocacy":
        return {
          title: "Advocacy Poster",
          description: "Create a poster for your advocacy campaign",
        };
      case "badge":
        return {
          title: "Badge",
          description: "Create a badge for your event",
        };
      default:
        return {
          title: "Advocacy Poster",
          description: "Create a poster for your advocacy campaign",
        };
    }
  });

  // Original state variables
  const [posterData, setPosterData] = useState({});
  const [initialPosterData, setInitialPosterData] = useState({});
  const [newFile, setNewFile] = useState(null);
  const [elements, setElements] = useState([]);
  const [initialElements, setInitialElements] = useState([]);
  const [elementsUpdated, setElementsUpdated] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [draggedLayerIndex, setDraggedLayerIndex] = useState(null);
  const [defaultWidth, setDefaultWidth] = useState(700);
  const [defaultHeight, setDefaultHeight] = useState(700);
  const [initialized, setInitialized] = useState(false);
  const [scale, setScale] = useState(10);
  const [isBackgroundSelected, setIsBackgroundSelected] = useState(false);
  const [zoomMode, setZoomMode] = useState("fit");
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const backgroundImageRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState(type === "advocacy" ? "quick" : "details");
  const [eventFields, setEventFields] = useState(null);
  const [userFields, setuserFields] = useState(null);
  const [badgeId, setBadgeId] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [ticketType, setTicketType] = useState("ALL");
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [participantType, setParticipantType] = useState("ALL");
  const [selectedParticipantType, setSelectedParticipantType] = useState([]);

  // Enhanced Apply and Clone functionality state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneModalPhase, setCloneModalPhase] = useState("select"); // "select", "confirm", "progress", "complete"
  const [cloneProgressStep, setCloneProgressStep] = useState(0);
  const [cloneError, setCloneError] = useState(null);
  const [eventTickets, setEventTickets] = useState([]);
  const [selectedApplyTickets, setSelectedApplyTickets] = useState([]);
  const [selectedCloneTickets, setSelectedCloneTickets] = useState([]);
  const [applyMode, setApplyMode] = useState("all");

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Badge export related state - UPDATED
  const [allBadges, setAllBadges] = useState([]);
  const [exportTickets, setExportTickets] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const canvasViewportRef = useRef(null); // Ref for the outer canvas viewport
  const paddedContainerRef = useRef(null); // Ref for the inner, padded, scrollable container

  // UPDATED: Improved data fetching for badge export
  useEffect(() => {
    if (type === "badge" && data?.event?._id) {
      const fetchBadgeExportData = async () => {
        setDataLoading(true);
        try {
          // Fetch all badges for this event - CORRECTED API CALL
          try {
            const badgeResponse = await getData({ event: data.event._id }, "badge");

            if (badgeResponse?.data?.response && Array.isArray(badgeResponse.data.response)) {
              setAllBadges(badgeResponse.data.response);
            } else {
              setAllBadges([]);
            }
          } catch (badgeError) {
            console.error("Error fetching badges:", badgeError);
            setAllBadges([]);
          }

          // Fetch tickets for export functionality
          try {
            const ticketResponse = await getData({ event: data.event._id }, "ticket");

            if (ticketResponse?.data?.response && Array.isArray(ticketResponse.data.response)) {
              const formattedTickets = ticketResponse.data.response.map((ticket) => ({
                id: ticket._id,
                _id: ticket._id,
                name: ticket.title || ticket.name || "Unnamed Ticket",
                title: ticket.title || ticket.name || "Unnamed Ticket",
                value: ticket.title || ticket.name || "Unnamed Ticket",
                label: ticket.title || ticket.name || "Unnamed Ticket",
                bookingCount: ticket.bookingCount || 0,
              }));
              setExportTickets(formattedTickets);
            } else {
              setExportTickets([]);
            }
          } catch (ticketError) {
            console.error("Error fetching tickets for export:", ticketError);
            setExportTickets([]);
          }
        } catch (error) {
          console.error("General error in fetchBadgeExportData:", error);
        } finally {
          setDataLoading(false);
        }
      };

      fetchBadgeExportData();
    }
  }, [type, data?.event?._id]);

  useEffect(() => {
    const hasChanged = JSON.stringify(elements) !== JSON.stringify(initialElements);
    setElementsUpdated(hasChanged);
  }, [elements, initialElements]);

  // Fetch event tickets for Apply and Clone functionality
  const fetchEventTickets = useCallback(async () => {
    if (type === "badge" && data?.event?._id) {
      try {
        // Always fetch with a higher limit to ensure we get all tickets
        const response = await getData(
          {
            event: data.event._id,
            limit: 1000, // Increased limit to get all tickets
          },
          "ticket"
        );

        if (response?.data?.response) {
          const tickets = response.data.response.map((ticket) => ({
            id: ticket._id,
            title: ticket.title || ticket.name || "Unnamed Ticket",
          }));
          setEventTickets(tickets);
          console.log("Fetched tickets for event:", data.event._id, "Count:", tickets.length);
        } else {
          setEventTickets([]);
          console.log("No tickets found in response");
        }
      } catch (error) {
        console.error("Error fetching event tickets:", error);
        setEventTickets([]);
      }
    }
  }, [type, data?.event?._id]); // Remove data?.event from dependencies

  useEffect(() => {
    if (type === "badge") {
      fetchEventTickets();
    }
  }, [fetchEventTickets]);

  // Also update the handleClone function to add more debugging:
  const handleCloneConfirm = () => {
    // Validation first
    if (selectedCloneTickets.length === 0) {
      setMessage({
        content: "Please select a ticket to clone from",
        type: 1,
        icon: "warning",
      });
      return;
    }

    if (selectedCloneTickets.length > 1) {
      setMessage({
        content: "Please select only one ticket to clone from",
        type: 1,
        icon: "warning",
      });
      return;
    }

    // Switch to confirmation phase in the same modal
    setCloneModalPhase("confirm");
  };

  const handleClone = async () => {
    // Store the selected ticket before clearing
    const sourceTicketId = selectedCloneTickets[0];

    console.log("🚀 Starting clone process...");
    console.log("Switching to progress phase...");

    // Switch to progress phase and force a delay to ensure it renders
    setCloneModalPhase("progress");
    setCloneProgressStep(0);
    setCloneError(null);

    // Force a delay to ensure the progress phase renders
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Progress step 1: Validating
      console.log("Step 1: Validating...");
      setCloneProgressStep(1);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const sourceTicket = eventTickets.find((ticket) => ticket.id === sourceTicketId);
      if (!sourceTicket) {
        throw new Error("Selected ticket not found. Please refresh and try again.");
      }

      // Progress step 2: Fetching source badge
      console.log("Step 2: Fetching source badge...");
      setCloneProgressStep(2);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const sourceBadgeResponse = await getData(
        {
          ticket: sourceTicketId,
          event: data.event._id,
        },
        "badge/datas"
      );

      if (!sourceBadgeResponse?.data?.response?.[0]) {
        throw new Error("Source ticket badge not found or has no design");
      }

      const sourceBadge = sourceBadgeResponse.data.response[0];

      if (!sourceBadge.builderData || sourceBadge.builderData === "[]") {
        throw new Error("Selected ticket has no badge design to clone");
      }

      // Progress step 3: Cloning design
      console.log("Step 3: Cloning design...");
      setCloneProgressStep(3);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const response = await putData(
        {
          id: sourceBadge._id,
          ticket: data._id,
        },
        "badge/clone"
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Error cloning badge");
      }

      // Progress step 4: Finalizing
      console.log("Step 4: Finalizing...");
      setCloneProgressStep(4);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Progress step 5: Complete
      console.log("Step 5: Complete!");
      setCloneProgressStep(5);
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Switching to complete phase...");
      setCloneModalPhase("complete");
    } catch (error) {
      console.error("❌ Error during clone process:", error);
      setCloneError(error.message || "An unexpected error occurred during cloning");
      setCloneModalPhase("complete");
    }
  };

  const handleCloseCloneModal = () => {
    setShowCloneModal(false);
    setCloneModalPhase("select");
    setSelectedCloneTickets([]);
    setCloneProgressStep(0);
    setCloneError(null);
  };

  const handleRefreshData = async () => {
    try {
      console.log("🔄 Refreshing badge data after clone...");

      // Close the modal first
      setShowCloneModal(false);
      setCloneModalPhase("select");
      setSelectedCloneTickets([]);
      setCloneProgressStep(0);
      setCloneError(null);

      // Refresh the poster/badge data to reflect the cloned design
      await fetchPosterData();

      // Show success message
      setMessage({
        content: "Badge design updated successfully!",
        type: 0,
        icon: "success",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      setMessage({
        content: "Data refreshed but there was an issue updating the display",
        type: 1,
        icon: "warning",
      });
    }
  };

  useEffect(() => {
    if (type === "badge") {
      fetchEventTickets();
    }
  }, [fetchEventTickets]);

  const discardChanges = () => {
    setElements(initialElements);
    setPosterData(initialPosterData);
    setElementsUpdated(false);
    setSelectedElementId(null);
    setNewFile(null);
    setPreviewImage(null);
  };

  const fetchPosterData = useCallback(async () => {
    try {
      setLoaderBox(true);
      if (type === "advocacy") {
        const response = await getData({ id: data._id }, "advocacy-poster");
        const poster = response.data.data;
        let json = JSON.parse(poster.imageBulderData ?? "[]");

        const processAdvocacyData = (imgWidth, imgHeight) => {
          const currentLayoutWidth = imgWidth || poster.layoutWidth || defaultWidth;
          const currentLayoutHeight = imgHeight || poster.layoutHeight || defaultHeight;

          const newPosterData = {
            ...poster,
            title: poster.title || "",
            description: poster.description || "",
            slug: poster.slug || "",
            layoutWidth: currentLayoutWidth,
            layoutHeight: currentLayoutHeight,
            backgroundImage: poster.backgroundImage || null,
          };

          const backgroundElementIndex = json.findIndex((element) => element.type === "background");

          if (poster.backgroundImage) {
            if (backgroundElementIndex !== -1) {
              json[backgroundElementIndex] = {
                ...json[backgroundElementIndex],
                src: import.meta.env.VITE_CDN + poster.backgroundImage,
                width: currentLayoutWidth,
                height: currentLayoutHeight,
              };
            } else {
              const backgroundElement = {
                id: "background",
                type: "background",
                label: "Background",
                src: import.meta.env.VITE_CDN + poster.backgroundImage,
                positionX: 0,
                positionY: 0,
                width: currentLayoutWidth,
                height: currentLayoutHeight,
                isBackground: true,
              };
              json.unshift(backgroundElement);
            }
          } else if (backgroundElementIndex === -1) {
            const defaultBackgroundElement = {
              id: "background",
              type: "background",
              label: "Background",
              src: noimage,
              positionX: 0,
              positionY: 0,
              width: currentLayoutWidth,
              height: currentLayoutHeight,
              isBackground: true,
            };
            json.unshift(defaultBackgroundElement);
          }

          setPosterData(newPosterData);
          setInitialPosterData(newPosterData);
          setElements(json);
          setInitialElements(json);
          setDefaultWidth(currentLayoutWidth);
          setDefaultHeight(currentLayoutHeight);
          setLoaderBox(false);
          setTimeout(() => handleZoomMode("fit", currentLayoutWidth, currentLayoutHeight), 0); // Pass fresh dimensions, deferred
        };

        if (poster.backgroundImage) {
          const img = new Image();
          img.onload = () => {
            processAdvocacyData(img.width, img.height);
          };
          img.onerror = () => {
            console.error("Failed to load advocacy background image for size calculation. Using layout/default dimensions.");
            processAdvocacyData(poster.layoutWidth, poster.layoutHeight);
          };
          img.src = import.meta.env.VITE_CDN + poster.backgroundImage;
        } else {
          processAdvocacyData(poster.layoutWidth, poster.layoutHeight);
        }
      } else if (type === "badge") {
        const response = await getData({ id: data?._id }, "badge");
        const poster = response.data.data;
        let json = JSON.parse(poster.builderData ?? "[]");

        const processBadgeData = (imgWidth, imgHeight) => {
          const currentLayoutWidth = imgWidth || poster.layoutWidth || defaultWidth;
          const currentLayoutHeight = imgHeight || poster.layoutHeight || defaultHeight;

          // Construct the proper background image URL
          let backgroundImageUrl = null;
          if (poster.backgroundImage) {
            if (poster.backgroundImage.startsWith("http") || poster.backgroundImage.startsWith("blob:")) {
              backgroundImageUrl = poster.backgroundImage;
            } else {
              backgroundImageUrl = import.meta.env.VITE_CDN + poster.backgroundImage;
            }
          }

          const newPosterData = {
            ...poster,
            title: poster.title || "",
            description: poster.description || "",
            slug: poster.slug || "",
            layoutWidth: currentLayoutWidth,
            layoutHeight: currentLayoutHeight,
            backgroundImage: backgroundImageUrl || poster.backgroundImage || null,
          };

          const backgroundElementIndex = json.findIndex((element) => element.type === "background");

          if (backgroundImageUrl) {
            if (backgroundElementIndex !== -1) {
              json[backgroundElementIndex] = {
                ...json[backgroundElementIndex],
                src: backgroundImageUrl,
                width: currentLayoutWidth,
                height: currentLayoutHeight,
              };
            } else {
              const backgroundElement = {
                id: "background",
                type: "background",
                label: "Background",
                src: backgroundImageUrl,
                positionX: 0,
                positionY: 0,
                width: currentLayoutWidth,
                height: currentLayoutHeight,
                isBackground: true,
              };
              json.unshift(backgroundElement);
            }
          } else if (backgroundElementIndex === -1) {
            const defaultBackgroundElement = {
              id: "background",
              type: "background",
              label: "Background",
              src: noimage,
              positionX: 0,
              positionY: 0,
              width: currentLayoutWidth,
              height: currentLayoutHeight,
              isBackground: true,
            };
            json.unshift(defaultBackgroundElement);
          }

          setEventFields(response.data.data.eventFields);
          setPosterData(newPosterData);
          setInitialPosterData(newPosterData);
          setElements(json);
          setInitialElements(json);
          setDefaultWidth(currentLayoutWidth);
          setDefaultHeight(currentLayoutHeight);
          setLoaderBox(false);
          setTimeout(() => handleZoomMode("fit", currentLayoutWidth, currentLayoutHeight), 0); // Pass fresh dimensions, deferred
        };

        if (poster.backgroundImage) {
          const img = new Image();
          img.onload = () => {
            processBadgeData(img.width, img.height);
          };
          img.onerror = () => {
            console.error("Failed to load badge background image in fetchPosterData. Using layout/default dimensions.");
            processBadgeData(poster.layoutWidth, poster.layoutHeight);
          };
          // Construct the proper URL for image loading
          const imageUrl = poster.backgroundImage.startsWith("http") || poster.backgroundImage.startsWith("blob:") ? poster.backgroundImage : import.meta.env.VITE_CDN + poster.backgroundImage;
          img.src = imageUrl;
        } else {
          processBadgeData(poster.layoutWidth, poster.layoutHeight);
        }
      }
    } catch (error) {
      console.error("Error fetching poster data:", error);
      setLoaderBox(false);
    }
  }, [data._id, setLoaderBox, defaultWidth, defaultHeight, type, data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!data?.event) {
          console.log("No event found");
          return;
        }

        let ticket = data._id;
        if (data.ticket) {
          ticket = data.ticket._id;
        }
        const event = data.event._id;
        const response = await getData({ event, ticket }, "ticket-form-data/select-options");

        if (response?.data?.response) {
          const ticketFormFields = response.data.response;
          const eventFormFields = response.data.eventForm;

          let tempData = [];
          eventFormFields.forEach((element) => {
            if (!["info", "title", "line", "htmlEditor", "multiSelect"].includes(element.type)) {
              tempData.push({
                id: element._id,
                label: element.label,
                type: element.type,
                icon: element.icon,
                preset: element.name,
                var: element.name,
              });
            }
          });
          ticketFormFields.forEach((element) => {
            if (!["info", "title", "line", "htmlEditor", "multiSelect"].includes(element.type)) {
              tempData.push({
                id: element._id,
                label: element.label,
                type: element.type,
                icon: element.icon,
                preset: element.name,
                var: element.name,
              });
            }
          });
          setuserFields(tempData);
        }
      } catch (err) {
        console.error("Error fetching ticket form data:", err);
      }
    };

    if (type !== "advocacy") {
      fetchData();
    }
  }, [data?.event]);

  // UPDATED: Fixed badge initialization
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);

      if (type === "badge") {
        if (!data?._id || !data?.event?._id) {
          console.error("Invalid data structure for badge:", data);
          if (setMessage) {
            setMessage({
              content: "Invalid badge data provided for initialization.",
              type: 1,
              icon: "error",
            });
          }
          return;
        }

        const initializeBadgeDataWithDimensions = (imgWidth, imgHeight) => {
          const badge = data;
          try {
            setBadgeId(badge._id);
            let json = JSON.parse(badge.builderData ?? "[]");

            const currentLayoutWidth = imgWidth || badge.layoutWidth || defaultWidth;
            const currentLayoutHeight = imgHeight || badge.layoutHeight || defaultHeight;

            // Construct the proper background image URL
            let backgroundImageUrl = null;
            if (badge.backgroundImage) {
              if (badge.backgroundImage.startsWith("http") || badge.backgroundImage.startsWith("blob:")) {
                backgroundImageUrl = badge.backgroundImage;
              } else {
                backgroundImageUrl = import.meta.env.VITE_CDN + badge.backgroundImage;
              }
            }

            const newPosterData = {
              ...badge,
              title: badge.title || "",
              description: badge.description || "",
              slug: badge.slug || "",
              layoutWidth: currentLayoutWidth,
              layoutHeight: currentLayoutHeight,
              backgroundImage: backgroundImageUrl || badge.backgroundImage || null,
            };

            const backgroundElementIndex = json.findIndex((el) => el.type === "background");

            if (backgroundImageUrl) {
              if (backgroundElementIndex !== -1) {
                // Update existing background element with the proper URL
                json[backgroundElementIndex] = {
                  ...json[backgroundElementIndex],
                  src: backgroundImageUrl,
                  width: currentLayoutWidth,
                  height: currentLayoutHeight,
                };
              } else {
                // Add new background element if none exists
                const backgroundElement = {
                  id: "background",
                  type: "background",
                  label: "Background",
                  src: backgroundImageUrl,
                  positionX: 0,
                  positionY: 0,
                  width: currentLayoutWidth,
                  height: currentLayoutHeight,
                  isBackground: true,
                };
                json.unshift(backgroundElement);
              }
            } else if (backgroundElementIndex === -1) {
              // Add a default background if no badge.backgroundImage and no background element in json
              const defaultBackground = {
                id: "background",
                type: "background",
                label: "Background",
                src: noimage, // default placeholder
                positionX: 0,
                positionY: 0,
                width: currentLayoutWidth,
                height: currentLayoutHeight,
                isBackground: true,
              };
              json.unshift(defaultBackground);
            }
            // If there's already a background element in JSON but no badge.backgroundImage,
            // ensure its dimensions are consistent with currentLayoutWidth/Height if not already set by an image.
            else if (backgroundElementIndex !== -1 && !backgroundImageUrl) {
              json[backgroundElementIndex] = {
                ...json[backgroundElementIndex],
                width: json[backgroundElementIndex].width || currentLayoutWidth,
                height: json[backgroundElementIndex].height || currentLayoutHeight,
                src: json[backgroundElementIndex].src || noimage, // ensure src if somehow missing
              };
            }

            setPosterData(newPosterData);
            setInitialPosterData(newPosterData);
            setElements(json);
            setInitialElements(json);
            setDefaultWidth(currentLayoutWidth);
            setDefaultHeight(currentLayoutHeight);
            handleZoomMode("fit", currentLayoutWidth, currentLayoutHeight); // Pass fresh dimensions
          } catch (err) {
            console.error("Error initializing badge data with dimensions:", err);
            if (setMessage) {
              setMessage({
                content: "Failed to load badge data during initialization.",
                type: 1,
                icon: "error",
              });
            }
          }
        };

        if (data.backgroundImage) {
          const img = new Image();
          img.onload = () => {
            initializeBadgeDataWithDimensions(img.width, img.height);
          };
          img.onerror = () => {
            console.error("Failed to load badge background image for size calculation. Using layout/default dimensions.");
            initializeBadgeDataWithDimensions(data.layoutWidth, data.layoutHeight);
          };
          // Construct the proper URL for image loading
          const imageUrl = data.backgroundImage.startsWith("http") || data.backgroundImage.startsWith("blob:") ? data.backgroundImage : import.meta.env.VITE_CDN + data.backgroundImage;
          img.src = imageUrl;
        } else {
          // Initialize with layout dimensions or defaults if no background image
          initializeBadgeDataWithDimensions(data.layoutWidth, data.layoutHeight);
        }
      } else {
        fetchPosterData();
      }
    }
  }, [data, initialized, fetchPosterData, type, defaultWidth, defaultHeight, setMessage]);

  const handleFileChange = async (e) => {
    const { files } = e.target;
    if (files && files[0]) {
      const img = new Image();
      const fileUrl = URL.createObjectURL(files[0]);
      img.onload = async () => {
        setNewFile(files);
        setPreviewImage(fileUrl);
        handleInputChange("layoutWidth", img.width);
        handleInputChange("layoutHeight", img.height);

        // Immediately save the background image to get a proper URL
        if (type === "badge" && badgeId) {
          try {
            setLoaderBox(true);
            const badgeData = {
              id: badgeId,
              backgroundImage: files[0],
              builderData: JSON.stringify(elements),
              layoutHeight: posterData.layoutHeight,
              layoutWidth: posterData.layoutWidth,
            };

            if (ticketType === "SELECTED") {
              badgeData.badgeType = "SPECIFIC_TICKET";
              badgeData.tickets = selectedTickets;
            } else if (ticketType === "ALL") {
              badgeData.badgeType = "COMMON_TICKET";
            }

            const response = await putData(badgeData, "badge");

            // Update posterData with the server response which should contain the proper image URL
            if (response?.data?.response?.backgroundImage) {
              const serverImagePath = response.data.response.backgroundImage;
              // Construct the full URL from the server response
              const serverImageUrl = serverImagePath.startsWith("http") || serverImagePath.startsWith("blob:") ? serverImagePath : import.meta.env.VITE_CDN + serverImagePath;

              setPosterData((prev) => ({
                ...prev,
                backgroundImage: serverImageUrl,
              }));

              // Update the background element in elements with the server URL
              setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: serverImageUrl, width: img.width, height: img.height } : el)));
            } else {
              // Fallback: use the blob URL temporarily
              setPosterData((prev) => ({
                ...prev,
                backgroundImage: fileUrl,
              }));
              setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: fileUrl, width: img.width, height: img.height } : el)));
            }
          } catch (error) {
            console.error("Error saving background image:", error);
            // Fallback: use the blob URL temporarily
            setPosterData((prev) => ({
              ...prev,
              backgroundImage: fileUrl,
            }));
            setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: fileUrl, width: img.width, height: img.height } : el)));
          } finally {
            setLoaderBox(false);
          }
        } else {
          // For non-badge types or when badgeId is not available, use blob URL temporarily
          setPosterData((prev) => ({
            ...prev,
            backgroundImage: fileUrl,
          }));
          setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: fileUrl, width: img.width, height: img.height } : el)));
        }
      };
      img.src = fileUrl;
    }
  };

  const handleInputChange = (name, value) => {
    setPosterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setElementsUpdated(true);
  };

  const handleAddElement = (element) => {
    const elementType = element.type;
    const preset = element.preset;
    const label = element.label;
    const varName = element.var;

    switch (elementType) {
      case "text":
        addTextElement(preset, label, varName);
        break;
      case "image":
        addImageElement(preset, label, varName);
        break;
      case "video":
        addVideoElement();
        break;
      case "select":
        addSelectElement(preset, label, varName);
        break;
      case "qr":
        addQRElement(label, varName);
        break;
      default:
        break;
    }
  };

  const addTextElement = (preset, label, varName) => {
    let content = "Sample Text";
    let fontSize = 16;
    let elementWidth = 200;
    let elementHeight = 50;

    switch (preset) {
      case "name":
        content = "John Doe";
        fontSize = 24;
        elementHeight = fontSize * 1.5; // Adjust height based on font size
        break;
      case "designation":
        content = "Senior Developer";
        fontSize = 16;
        elementHeight = fontSize * 1.5;
        break;
      case "company":
        content = "Company Name";
        fontSize = 20;
        elementHeight = fontSize * 1.5;
        break;
      case "contact":
        content = "contact@example.com";
        fontSize = 14;
        elementHeight = fontSize * 1.5;
        break;
      default:
        // For generic text, ensure height is reasonable for default font size
        elementHeight = fontSize * 1.5;
        break;
    }

    // Calculate center position
    const canvasCenterX = (posterData.layoutWidth || defaultWidth) / 2;
    const canvasCenterY = (posterData.layoutHeight || defaultHeight) / 2;
    const positionX = canvasCenterX - elementWidth / 2;
    const positionY = canvasCenterY - elementHeight / 2;

    const newElement = {
      id: Date.now(),
      type: "text",
      label: label,
      var: varName,
      content: label || content,
      color: "#000000",
      fontSize: fontSize,
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      alignContent: "start",
      lineHeight: fontSize * 1.2,
      positionX: positionX, // Centered X
      positionY: positionY, // Centered Y
      width: elementWidth,
      height: elementHeight,
      preset: preset,
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const addImageElement = (preset, label, varName) => {
    let width = 100;
    let height = 100;
    let borderRadius = 0;

    switch (preset) {
      case "profile":
        width = 150;
        height = 150;
        borderRadius = 75;
        break;
      case "logo":
        width = 200;
        height = 80;
        break;
      default:
        break;
    }

    // Calculate center position
    const canvasCenterX = (posterData.layoutWidth || defaultWidth) / 2;
    const canvasCenterY = (posterData.layoutHeight || defaultHeight) / 2;
    const positionX = canvasCenterX - width / 2;
    const positionY = canvasCenterY - height / 2;

    const newElement = {
      id: Date.now(),
      type: "image",
      src: null,
      var: varName,
      content: label,
      // Ensure these use the locally calculated centered positionX and positionY
      positionX: positionX,
      positionY: positionY,
      width: width,
      height: height,
      borderRadius: borderRadius,
      borderWidth: 0,
      borderColor: "#000000",
      preset: preset,
      clipPathValue: "none", // Initialize clipPathValue
      lockAspectRatio: preset === "profile" ? true : false, // Default to locked for profile images
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const addSelectElement = (preset, label, varName) => {
    const elementWidth = 200;
    const elementHeight = 50;

    // Calculate center position
    const canvasCenterX = (posterData.layoutWidth || defaultWidth) / 2;
    const canvasCenterY = (posterData.layoutHeight || defaultHeight) / 2;
    const positionX = canvasCenterX - elementWidth / 2;
    const positionY = canvasCenterY - elementHeight / 2;

    const newElement = {
      id: Date.now(),
      type: "select",
      label: label,
      var: varName,
      preset: preset,
      content: label,
      positionX: positionX, // Centered X
      positionY: positionY, // Centered Y
      width: elementWidth,
      height: elementHeight,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: "#000000",
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const addVideoElement = () => {
    const elementWidth = 300;
    const elementHeight = 200;

    // Calculate center position
    const canvasCenterX = (posterData.layoutWidth || defaultWidth) / 2;
    const canvasCenterY = (posterData.layoutHeight || defaultHeight) / 2;
    const positionX = canvasCenterX - elementWidth / 2;
    const positionY = canvasCenterY - elementHeight / 2;

    const newElement = {
      id: Date.now(),
      type: "video",
      src: null,
      content: "Video",
      positionX: positionX, // Centered X
      positionY: positionY, // Centered Y
      width: elementWidth,
      height: elementHeight,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: "#000000",
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const addQRElement = (label, varName) => {
    const elementWidth = 150;
    const elementHeight = 150; // QR codes are typically square

    // Calculate center position
    const canvasCenterX = (posterData.layoutWidth || defaultWidth) / 2;
    const canvasCenterY = (posterData.layoutHeight || defaultHeight) / 2;
    const positionX = canvasCenterX - elementWidth / 2;
    const positionY = canvasCenterY - elementHeight / 2;

    const newElement = {
      id: Date.now(),
      type: "qr",
      label: label,
      positionX: positionX, // Centered X
      positionY: positionY, // Centered Y
      width: elementWidth,
      height: elementHeight,
      var: varName,
      qrValue: varName || "https://example.com",
      bgColor: "#FFFFFF",
      fgColor: "#000000",
      level: "L",
      includeMargin: true,
      size: elementWidth, // qrcode.react size prop should match width
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const updateElement = (id, updatedProperties) => {
    setElementsUpdated(true);
    setElements((prevElements) => prevElements.map((el) => (el.id === id ? { ...el, ...updatedProperties } : el)));
  };

  const moveLayer = (currentIndex, direction) => {
    const newElements = [...elements];
    const itemToMove = newElements[currentIndex];
    let targetIndex;

    if (direction === "up") {
      if (currentIndex === 0) return; // Already at the top
      targetIndex = currentIndex - 1;
      newElements.splice(currentIndex, 1); // Remove item from current position
      newElements.splice(targetIndex, 0, itemToMove); // Insert item at new position
    } else if (direction === "down") {
      if (currentIndex === elements.length - 1) return; // Already at the bottom
      targetIndex = currentIndex + 1;
      newElements.splice(currentIndex, 1); // Remove item from current position
      newElements.splice(targetIndex, 0, itemToMove); // Insert item at new position
    }

    setElements(newElements);
    setElementsUpdated(true);
  };

  const handleElementFileChange = (id, file) => {
    const url = URL.createObjectURL(file);
    updateElement(id, { src: url });
    return () => {
      URL.revokeObjectURL(url);
    };
  };

  const removeElement = (id) => {
    const element = elements.find((el) => el.id === id);
    if (element?.type === "background") return;

    setElements((prevElements) => prevElements.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleElementClick = (id) => {
    setSelectedElementId(id);
  };

  const handleTicketType = (ticketTypeValue) => {
    setTicketType(ticketTypeValue);
    if (ticketTypeValue === "SELECTED") {
      getData({ event: data.event._id }, "ticket").then((response) => {
        const tickets = response.data.response.map((ticket) => ({
          id: ticket._id,
          value: ticket.title,
        }));
        setTicketData(tickets);
      });
    }
  };

  const SaveData = async () => {
    setLoaderBox(true);
    try {
      if (type === "advocacy") {
        if (checkValidSlug(posterData.slug)) {
          if (newFile) {
            await putData(
              {
                backgroundImage: newFile,
                id: data._id,
                imageBulderData: JSON.stringify(elements),
                layoutHeight: posterData.layoutHeight,
                slug: posterData.slug,
                layoutWidth: posterData.layoutWidth,
                title: posterData.title,
                description: posterData.description,
              },
              "advocacy-poster"
            );
          } else {
            await putData(
              {
                id: data._id,
                imageBulderData: JSON.stringify(elements),
                layoutHeight: posterData.layoutHeight,
                slug: posterData.slug,
                layoutWidth: posterData.layoutWidth,
                title: posterData.title,
                description: posterData.description,
              },
              "advocacy-poster"
            );
          }
          fetchPosterData();
        } else {
          setMessage({ content: "Please enter a valid slug", type: 1, icon: "error" });
        }
      } else {
        await saveBadgeData();
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setMessage({ content: "Error saving data", type: 1, icon: "error" });
    }
    setLoaderBox(false);
  };

  const saveBadgeData = async () => {
    let badgeData;

    // Prepare builder data with current background image
    let builderDataToSave = JSON.stringify(elements);

    // If newFile exists and is a FileList or File, use the first file
    if (newFile && newFile[0]) {
      badgeData = {
        id: badgeId,
        backgroundImage: newFile[0],
        builderData: builderDataToSave,
        layoutHeight: posterData.layoutHeight,
        layoutWidth: posterData.layoutWidth,
      };
    } else {
      // If no new file but we have a background image URL, ensure it's properly formatted
      if (posterData.backgroundImage && !posterData.backgroundImage.startsWith("blob:")) {
        // Update the background element in builder data to use the full URL for display
        const updatedElements = elements.map((el) => (el.type === "background" ? { ...el, src: posterData.backgroundImage } : el));
        builderDataToSave = JSON.stringify(updatedElements);
      }

      badgeData = {
        id: badgeId,
        builderData: builderDataToSave,
        layoutHeight: posterData.layoutHeight,
        layoutWidth: posterData.layoutWidth,
      };
    }

    if (ticketType === "SELECTED") {
      badgeData.badgeType = "SPECIFIC_TICKET";
      badgeData.tickets = selectedTickets;
    } else if (ticketType === "ALL") {
      badgeData.badgeType = "COMMON_TICKET";
    }

    await putData(badgeData, "badge");
  };

  // Create enhanced badge data that includes the current elements
  const enhancedBadgeData = {
    ...posterData,
    builderData: JSON.stringify(elements), // Current elements from the builder
    layoutWidth: posterData.layoutWidth || defaultWidth,
    layoutHeight: posterData.layoutHeight || defaultHeight,
  };

  const checkValidSlug = (value) => {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(value);
  };

  const handleZoomMode = (mode, newLayoutWidth, newLayoutHeight) => {
    setZoomMode(mode);
    setPanPosition({ x: 0, y: 0 });

    if (!paddedContainerRef.current) return;

    const SAFETY_MARGIN = 20; // Increased safety buffer to 20px

    const currentPosterWidth = newLayoutWidth !== undefined ? newLayoutWidth : posterData.layoutWidth || defaultWidth;
    const currentPosterHeight = newLayoutHeight !== undefined ? newLayoutHeight : posterData.layoutHeight || defaultHeight;

    if (mode === "fit") {
      const availableWidth = Math.floor(paddedContainerRef.current.clientWidth - SAFETY_MARGIN);
      const availableHeight = Math.floor(paddedContainerRef.current.clientHeight - SAFETY_MARGIN);

      if (currentPosterWidth <= 0 || currentPosterHeight <= 0 || availableWidth <= 0 || availableHeight <= 0) return;

      const scaleX = availableWidth / currentPosterWidth;
      const scaleY = availableHeight / currentPosterHeight;

      let cssScale = Math.min(scaleX, scaleY);
      // Round the target CSS scale factor down to 5 decimal places to combat floating point inaccuracies
      cssScale = Math.floor(cssScale * 100000) / 100000;

      let newScaleState = cssScale * 10;

      setScale(Math.max(0.1, Math.min(20, newScaleState)));
    } else if (mode === "fill") {
      const availableWidth = paddedContainerRef.current.clientWidth;
      const availableHeight = paddedContainerRef.current.clientHeight;

      if (currentPosterWidth <= 0 || currentPosterHeight <= 0 || availableWidth <= 0 || availableHeight <= 0) return;

      const scaleX = availableWidth / currentPosterWidth;
      const scaleY = availableHeight / currentPosterHeight;
      let cssScale = Math.max(scaleX, scaleY);
      // Optionally, round fill mode scale too if needed, though usually less critical for overflow
      cssScale = Math.floor(cssScale * 100000) / 100000; // Applied for consistency

      let newScaleState = cssScale * 10;

      setScale(Math.max(0.1, Math.min(20, newScaleState)));
    } else if (mode === "original") {
      setScale(10); // 100% actual scale
    }
  };

  // Enhanced Apply functionality
  const handleApply = async () => {
    setLoaderBox(true);
    try {
      const currentBadgeData = {
        builderData: JSON.stringify(elements),
        layoutHeight: posterData.layoutHeight,
        layoutWidth: posterData.layoutWidth,
      };

      if (applyMode === "all") {
        const targetTickets = eventTickets.filter((ticket) => ticket.id !== data._id);

        if (targetTickets.length === 0) {
          setMessage({
            content: "No other tickets found to apply the design to",
            type: 1,
            icon: "info",
          });
          setShowApplyModal(false);
          setLoaderBox(false);
          return;
        }

        for (const ticket of targetTickets) {
          await putData(
            {
              ticket: ticket.id,
              event: data.event._id,
              ...currentBadgeData,
            },
            "badge/apply-to-ticket"
          );
        }
        setMessage({
          content: `Badge applied to all ${targetTickets.length} tickets successfully`,
          type: 0,
          icon: "success",
        });
      } else {
        if (selectedApplyTickets.length === 0) {
          setMessage({
            content: "Please select at least one ticket",
            type: 1,
            icon: "warning",
          });
          setLoaderBox(false);
          return;
        }

        for (const ticketId of selectedApplyTickets) {
          await putData(
            {
              ticket: ticketId,
              event: data.event._id,
              ...currentBadgeData,
            },
            "badge/apply-to-ticket"
          );
        }
        setMessage({
          content: `Badge applied to ${selectedApplyTickets.length} selected tickets successfully`,
          type: 0,
          icon: "success",
        });
        setSelectedApplyTickets([]);
      }

      setShowApplyModal(false);
    } catch (error) {
      console.error("Error applying badge:", error);
      let errorMessage = "Error applying badge";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setMessage({
        content: errorMessage,
        type: 1,
        icon: "error",
      });
    }
    setLoaderBox(false);
  };

  // Modal close handlers
  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
    setSelectedApplyTickets([]);
    setApplyMode("all");
  };

  // Check if apply is disabled
  const isApplyDisabled = () => {
    if (applyMode === "all") {
      return eventTickets.filter((ticket) => ticket.id !== data._id).length === 0;
    }
    return selectedApplyTickets.length === 0;
  };

  const fieldsGeneral = () => {
    if (type === "advocacy") {
      return (
        <div className="flex border border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-2">
          <button
            onClick={() => setActiveTab("quick")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "quick" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            Quick Fields
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "general" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            General
          </button>
        </div>
      );
    } else if (type === "certificate" || type === "badge") {
      return (
        <div className="flex border border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-2">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "details" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            Event Fields
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "form" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            User Fields
          </button>
        </div>
      );
    }
  };

  // TEMPLATE IMPORT FIX: When importing templates, preserve current data
  const handleImport = (template) => {
    try {
      console.log("🎯 Starting template import:", template.design);

      const templateData = template.templateData;
      const newWidth = templateData.width || defaultWidth;
      const newHeight = templateData.height || defaultHeight;

      // CRITICAL: Keep the current badge's background image, don't overwrite with template
      const updatedPosterData = {
        ...posterData,
        layoutWidth: newWidth,
        layoutHeight: newHeight,
        // DON'T overwrite backgroundImage with template
        // backgroundImage: templateData.templateImage, // REMOVE THIS LINE
        title: templateData.templateName || posterData.title,
      };

      setPosterData(updatedPosterData);
      setDefaultWidth(newWidth);
      setDefaultHeight(newHeight);

      // Create template elements but WITHOUT the background
      const templateElements = [];
      let elementIdCounter = Date.now();

      // Add template elements (name, event, ticket, QR, etc.) but keep current background
      if (templateData.isdisplayname) {
        const nameElement = {
          id: elementIdCounter++,
          type: "text",
          label: "Name",
          var: "name",
          preset: "name",
          content: "Sample Name", // Will be replaced with real data
          color: "#FFFFFF", // Use white for better visibility
          fontSize: templateData.displaynamefontSize || 28,
          fontWeight: "bold",
          fontStyle: "normal",
          textAlign: "center",
          alignContent: "center",
          lineHeight: (templateData.displaynamefontSize || 28) * 1.2,
          positionX: templateData.displaynameX || 360,
          positionY: templateData.displaynameY || 400,
          width: templateData.displaynameWidth || 160,
          height: (templateData.displaynamefontSize || 28) * 1.5,
        };
        templateElements.push(nameElement);
      }

      if (templateData.isdisplayEvent) {
        const eventElement = {
          id: elementIdCounter++,
          type: "text",
          label: "Event",
          var: "event",
          preset: "event",
          content: "Sample Event", // Will be replaced with real data
          color: "#FFFFFF",
          fontSize: templateData.displayEventfontSize || 20,
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "center",
          alignContent: "center",
          lineHeight: (templateData.displayEventfontSize || 20) * 1.2,
          positionX: templateData.displayEventX || 120,
          positionY: templateData.displayEventY || 300,
          width: templateData.displayEventWidth || 360,
          height: (templateData.displayEventfontSize || 20) * 1.5,
        };
        templateElements.push(eventElement);
      }

      if (templateData.isdisplayTicket) {
        const ticketElement = {
          id: elementIdCounter++,
          type: "text",
          label: "Ticket",
          var: "ticket",
          preset: "ticket",
          content: "Sample Ticket", // Will be replaced with real data
          color: "#FFFFFF",
          fontSize: templateData.displayTicketfontSize || 24,
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "center",
          alignContent: "center",
          lineHeight: (templateData.displayTicketfontSize || 24) * 1.2,
          positionX: templateData.displayTicketX || 160,
          positionY: templateData.displayTicketY || 700,
          width: templateData.displayTicketWidth || 280,
          height: (templateData.displayTicketfontSize || 24) * 1.5,
        };
        templateElements.push(ticketElement);
      }

      if (templateData.isQrcode) {
        const qrElement = {
          id: elementIdCounter++,
          type: "qr",
          label: "QR Code",
          var: "qrcode",
          preset: "qr",
          positionX: templateData.qrcodeX || 80,
          positionY: templateData.qrcodeY || 633,
          width: templateData.qrcodeWidth || 200,
          height: templateData.qrcodeWidth || 200,
          qrValue: "sample-qr-data", // Will be replaced with real data
          bgColor: "#FFFFFF",
          fgColor: "#000000",
          level: "L",
          includeMargin: true,
          size: templateData.qrcodeWidth || 200,
        };
        templateElements.push(qrElement);
      }

      // KEEP existing background, just add new template elements
      const existingBackground = elements.find((el) => el.type === "background");
      const existingNonBackground = elements.filter((el) => el.type !== "background");

      let newElements;
      if (existingBackground) {
        // Keep current background, replace content elements with template elements
        newElements = [existingBackground, ...templateElements];
      } else {
        // No existing background, add template elements only
        newElements = [...templateElements];
      }

      console.log("🔄 Final elements (keeping current background):", newElements);

      setElements(newElements);
      setElementsUpdated(true);
      setPreviewImage(null);
      setNewFile(null);

      if (setMessage) {
        setMessage({
          content: `Template "${template.design}" imported successfully! Current background preserved.`,
          type: 0,
          icon: "success",
        });
      }

      console.log("🎉 Template import completed - background preserved!");
    } catch (error) {
      console.error("❌ Error importing template:", error);
      if (setMessage) {
        setMessage({
          content: "Failed to import template. Please try again.",
          type: 1,
          icon: "error",
        });
      }
    }
  };

  const posterRef = useRef(null);

  return (
    <div className="grid grid-cols-[320px_1fr_300px] absolute inset-0 bg-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="border-r border-[rgb(229,231,235)] flex flex-col bg-white h-full overflow-hidden">
        <div className="p-5 overflow-y-auto h-full">
          {fieldsGeneral()}

          <div className="space-y-6">
            {activeTab === "quick" && type === "advocacy" ? (
              <div className="bg-white rounded-xl border-[rgb(229,231,235)] overflow-hidden">
                <div className="pt-2 grid grid-cols-2 gap-3">
                  {ELEMENT_GROUPS.quickFields.elements.map((element) => (
                    <button
                      key={element.id}
                      onClick={() => handleAddElement(element)}
                      className="flex flex-col items-center justify-center p-4 border border-[rgb(229,231,235)] rounded-xl hover:border-[rgb(99,102,241)] hover:-translate-y-0.5 transition-all bg-white"
                    >
                      <element.icon className="w-5 h-5 mb-2 text-[rgb(107,114,128)]" />
                      <span className="text-xs text-[rgb(17,24,39)]">{element.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : activeTab === "general" && type === "advocacy" ? (
              <div className="bg-white rounded-xl border-[rgb(229,231,235)] overflow-hidden">
                <div className="pt-2 grid grid-cols-2 gap-3">
                  {ELEMENT_GROUPS.basic.elements.map((element) => (
                    <button
                      key={element.id}
                      onClick={() => handleAddElement(element)}
                      className="flex flex-col items-center justify-center p-4 border border-[rgb(229,231,235)] rounded-xl hover:border-[rgb(99,102,241)] hover:-translate-y-0.5 transition-all bg-white"
                    >
                      <element.icon className="w-5 h-5 mb-2 text-[rgb(107,114,128)]" />
                      <span className="text-xs text-[rgb(17,24,39)]">{element.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : activeTab === "details" && (type === "certificate" || type === "badge") ? (
              <div className="bg-white rounded-xl border-[rgb(229,231,235)] overflow-hidden">
                <div className="pt-2 grid grid-cols-2 gap-3">
                  {ELEMENT_GROUPS.eventFields.elements.map((element) => (
                    <button
                      key={element.id}
                      onClick={() => handleAddElement(element)}
                      className="flex flex-col items-center justify-center p-4 border border-[rgb(229,231,235)] rounded-xl hover:border-[rgb(99,102,241)] hover:-translate-y-0.5 transition-all bg-white"
                    >
                      <element.icon className="w-5 h-5 mb-2 text-[rgb(107,114,128)]" />
                      <span className="text-xs text-[rgb(17,24,39)]">{element.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border-[rgb(229,231,235)] overflow-hidden">
                <div className="pt-2 grid grid-cols-2 gap-3">
                  {userFields &&
                    userFields.map((element) => (
                      <button
                        key={element.id}
                        onClick={() => handleAddElement(element)}
                        className="flex flex-col items-center justify-center p-4 border border-[rgb(229,231,235)] rounded-xl hover:border-[rgb(99,102,241)] hover:-translate-y-0.5 transition-all bg-white"
                      >
                        <GetIcon icon={element.icon} className="w-5 h-5 mb-2 text-[rgb(107,114,128)]" />
                        <span className="text-xs text-[rgb(17,24,39)]">{element.label}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Layers Section */}
          <div className="mt-6">
            <div className="section-header p-3 border-b border-[rgb(229,231,235)] flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[rgb(99,102,241)]" />
                <span className="text-sm font-medium text-[rgb(17,24,39)]">Layers</span>
              </div>
              {type === "badge" && (
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="px-2 py-1 text-[10px] font-medium text-[rgb(99,102,241)] bg-[rgb(238,242,255)] rounded hover:bg-[rgb(224,231,255)] transition-colors flex items-center gap-0.5"
                    title="Apply current design to other tickets"
                  >
                    <Upload className="w-3 h-3" />
                    Apply
                  </button>
                  <button
                    onClick={() => setShowCloneModal(true)}
                    className="px-2 py-1 text-[10px] font-medium text-[rgb(99,102,241)] bg-[rgb(238,242,255)] rounded hover:bg-[rgb(224,231,255)] transition-colors flex items-center gap-0.5"
                    title="Clone design from other tickets"
                  >
                    <Copy className="w-3 h-3" />
                    Clone
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-2 py-1 text-[10px] font-medium text-[rgb(99,102,241)] bg-[rgb(238,242,255)] rounded hover:bg-[rgb(224,231,255)] transition-colors flex items-center gap-0.5"
                    title="Import badge design"
                  >
                    <Upload className="w-3 h-3 rotate-180" />
                    Import
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              {elements.map((element, index) => (
                <div
                  key={element.id}
                  draggable={true} // Allow all elements to be draggable
                  onDragStart={(e) => {
                    // Set a custom drag image to potentially stabilize drag initiation
                    // Use e.currentTarget (the div itself) as the drag image, centered under cursor
                    if (e.dataTransfer && e.currentTarget instanceof HTMLElement) {
                      e.dataTransfer.setDragImage(e.currentTarget, e.currentTarget.offsetWidth / 2, e.currentTarget.offsetHeight / 2);
                    }
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", element.id.toString());

                    // Defer state update that changes opacity to avoid interfering with drag initiation
                    setTimeout(() => {
                      setDraggedLayerIndex(index);
                    }, 0);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault(); // Essential for allowing a drop
                    if (e.dataTransfer) {
                      e.dataTransfer.dropEffect = "move"; // Indicate the type of operation
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const sourceIndex = draggedLayerIndex;
                    const targetIndex = index;

                    if (sourceIndex === null || sourceIndex === targetIndex) {
                      setDraggedLayerIndex(null);
                      return;
                    }

                    let reorderedElements = [...elements];
                    const [draggedItem] = reorderedElements.splice(sourceIndex, 1);
                    reorderedElements.splice(targetIndex, 0, draggedItem);

                    // Removed the logic that forces the background to the bottom.
                    // The background layer will now be reordered like any other layer.

                    setElements(reorderedElements);
                    setElementsUpdated(true);
                    setDraggedLayerIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggedLayerIndex(null);
                  }}
                  className={`group flex justify-between items-center p-3 rounded-lg border border-[rgb(229,231,235)] select-none
                              ${selectedElementId === element.id ? "bg-[rgb(238,242,255)]" : "bg-white"}
                              hover:border-[rgb(99,102,241)] hover:-translate-y-0.5
                              cursor-grab
                              ${draggedLayerIndex === index ? "opacity-50" : ""}`}
                  onClick={() => {
                    if (element.type !== "background") {
                      setSelectedElementId(element.id);
                      setIsBackgroundSelected(false);
                    } else {
                      setIsBackgroundSelected(true);
                      setSelectedElementId(null);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {element.type === "background" ? (
                      <ImageIcon className={`w-4 h-4 ${isBackgroundSelected ? "text-[rgb(99,102,241)]" : "text-gray-500"}`} />
                    ) : element.type === "text" ? (
                      <FileText className={`w-4 h-4 ${selectedElementId === element.id ? "text-[rgb(99,102,241)]" : "text-gray-500"}`} />
                    ) : element.type === "image" ? (
                      <ImagePlus className={`w-4 h-4 ${selectedElementId === element.id ? "text-[rgb(99,102,241)]" : "text-gray-500"}`} />
                    ) : element.type === "video" ? (
                      <Video className={`w-4 h-4 ${selectedElementId === element.id ? "text-[rgb(99,102,241)]" : "text-gray-500"}`} />
                    ) : element.type === "qr" ? (
                      <QrCode className={`w-4 h-4 ${selectedElementId === element.id ? "text-[rgb(99,102,241)]" : "text-gray-500"}`} />
                    ) : (
                      <Square className={`w-4 h-4 ${selectedElementId === element.id ? "text-[rgb(99,102,241)]" : "text-gray-500"}`} />
                    )}
                    <span className="text-sm">{element.label || element.type || "Element"}</span>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayer(index, "up");
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-gray-400 hover:text-[rgb(99,102,241)]" />
                      </button>
                    )}
                    {index < elements.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayer(index, "down");
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 hover:text-[rgb(99,102,241)]" />
                      </button>
                    )}
                    {element.type !== "background" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(element.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center Canvas */}
      <div className="flex flex-col h-full bg-[rgb(249,250,251)] overflow-hidden">
        <div ref={canvasViewportRef} className="flex-1 relative overflow-hidden">
          {/* This is the div that scrolls and has padding. We need its inner dimensions. */}
          <div ref={paddedContainerRef} className="absolute inset-0 overflow-auto flex items-center justify-center p-10">
            <div
              ref={posterRef}
              className="bg-white shadow-md relative overflow-hidden rounded-sm transition-transform duration-300"
              style={{
                minWidth: `${posterData.layoutWidth || defaultWidth}px`,
                minHeight: `${posterData.layoutHeight || defaultHeight}px`,
                maxWidth: `${posterData.layoutWidth || defaultWidth}px`,
                maxHeight: `${posterData.layoutHeight || defaultHeight}px`,
                transform: `scale(${scale / 10}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                transformOrigin: "center center",
              }}
            >
              {elements.map((element, index) =>
                element.type === "background" ? (
                  <div key={element.id} className="w-full h-full flex absolute inset-0 items-center justify-center" style={{ zIndex: index }}>
                    <img
                      src={
                        previewImage ||
                        element.src ||
                        (posterData.backgroundImage
                          ? posterData.backgroundImage.startsWith("http") || posterData.backgroundImage.startsWith("blob:")
                            ? posterData.backgroundImage
                            : import.meta.env.VITE_CDN + posterData.backgroundImage
                          : noimage)
                      }
                      alt="Background"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  </div>
                ) : (
                  <Rnd
                    key={element.id}
                    size={{
                      width: element.width,
                      height: element.height,
                    }}
                    position={{
                      x: element.positionX || 0, // Fallback for positionX
                      y: element.positionY || 0, // Fallback for positionY
                    }}
                    bounds="parent"
                    enableUserSelectHack={true}
                    scale={scale / 10}
                    lockAspectRatio={element.lockAspectRatio || false}
                    onMouseDown={() => handleElementClick(element.id)}
                    onDrag={(e, d) => {
                      updateElement(element.id, {
                        positionX: d.x,
                        positionY: d.y,
                      });
                    }}
                    onResize={(e, direction, ref, delta, position) => {
                      let newWidth = ref.offsetWidth;
                      let newHeight = ref.offsetHeight;
                      let newBorderRadius = element.borderRadius;
                      // Font size and line height will no longer be scaled with the box for text elements.
                      // They are controlled explicitly via the settings panel.
                      let newFontSize = element.fontSize;
                      let newLineHeight = element.lineHeight;

                      if (element.type === "image" && element.preset === "profile") {
                        // Only update border radius for profile images if they are currently circular
                        if (element.borderRadius === element.width / 2 || element.borderRadius === element.height / 2) {
                          newBorderRadius = Math.min(newWidth, newHeight) / 2;
                        }
                      } else if (element.type === "shape") {
                        // For shapes, preserve the border radius ratio but don't make rectangles circular
                        if (element.shapeType === "circle") {
                          newBorderRadius = Math.min(newWidth, newHeight) / 2;
                        } else if (element.shapeType === "rectangle" || element.shapeType === "square") {
                          // Keep existing border radius for rectangles, don't make them circular
                          newBorderRadius = element.borderRadius;
                        } else {
                          // For other shapes, maintain the current border radius
                          newBorderRadius = element.borderRadius;
                        }
                      } else if (element.type === "text") {
                        // No longer scaling font size based on box width.
                        // Keep existing fontSize and lineHeight from the element's properties.
                      }

                      updateElement(element.id, {
                        width: newWidth,
                        height: newHeight,
                        positionX: position.x,
                        positionY: position.y,
                        borderRadius: newBorderRadius,
                        fontSize: newFontSize, // Stays the same unless changed in settings
                        lineHeight: newLineHeight, // Stays the same unless changed in settings (or fontSize changes)
                      });
                    }}
                    className={`${selectedElementId === element.id ? "border-2 border-[rgb(99,102,241)]" : "border-2 border-dashed border-[rgb(229,231,235)]"} transition-all duration-200`}
                    style={{ zIndex: index }}
                  >
                    {element.type === "text" ? (
                      <div
                        className="w-full h-full select-none p-1"
                        style={{
                          color: element.color,
                          fontSize: `${element.fontSize}px`,
                          fontWeight: element.fontWeight,
                          fontStyle: element.fontStyle,
                          textAlign: element.textAlign,
                          alignContent: element.alignContent,
                          lineHeight: `${element.lineHeight}px`,
                        }}
                      >
                        {element.content}
                      </div>
                    ) : element.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <video
                          src={element.src || noimage}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          style={{
                            borderRadius: `${element.borderRadius}px`,
                            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : "none",
                          }}
                          controls={element.controls}
                          autoPlay={element.autoplay}
                          loop={element.loop}
                          muted={element.muted}
                        />
                      </div>
                    ) : element.type === "qr" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <QRCodeSVG value={element.qrValue} size={element.size} bgColor={element.bgColor} fgColor={element.fgColor} level={element.level} includeMargin={element.includeMargin} />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={element.src || noimage}
                          alt="Element"
                          className="w-full h-full object-cover select-none pointer-events-none"
                          style={{
                            borderRadius: `${element.borderRadius}px`,
                            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : "none",
                            clipPath: element.clipPathValue && element.clipPathValue !== "none" ? element.clipPathValue : undefined,
                          }}
                        />
                      </div>
                    )}
                  </Rnd>
                )
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-[rgb(229,231,235)] z-20">
            <div className="flex items-center gap-1 border-r border-[rgb(229,231,235)] pr-2">
              <button
                className={`p-2 rounded-lg transition-colors ${zoomMode === "fit" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
                onClick={() => handleZoomMode("fit")}
              >
                <Layout className="w-4.5 h-4.5" />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors ${zoomMode === "fill" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
                onClick={() => handleZoomMode("fill")}
              >
                <Square className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 border-r border-[rgb(229,231,235)] pr-2">
              <input
                type="number"
                value={posterData.layoutWidth || defaultWidth}
                onChange={(e) => handleInputChange("layoutWidth", Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs border border-[rgb(229,231,235)] rounded-md"
                placeholder="Width"
              />
              <span className="text-xs text-gray-500">×</span>
              <input
                type="number"
                value={posterData.layoutHeight || defaultHeight}
                onChange={(e) => handleInputChange("layoutHeight", Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs border border-[rgb(229,231,235)] rounded-md"
                placeholder="Height"
              />
            </div>

            <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setScale(Math.max(0.1, scale - 1))} disabled={scale <= 0.1}>
              <ZoomOut className="w-4.5 h-4.5" />
            </button>

            <div className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[80px] text-center border-l border-r border-[rgb(229,231,235)]">{Math.round(scale * 10)}%</div>

            <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setScale(Math.min(20, scale + 1))} disabled={scale >= 20}>
              <ZoomIn className="w-4.5 h-4.5" />
            </button>

            <button
              className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => {
                setScale(10);
                setPanPosition({ x: 0, y: 0 });
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="border-l border-[rgb(229,231,235)] bg-white flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 px-3 border-b border-[rgb(229,231,235)] sticky top-0 bg-white z-10 flex items-center justify-between">
            <div className="flex justify-between w-full items-center gap-2">
              <div className="flex items-center gap-2">
                {selectedElementId !== null ? (
                  <>
                    {elements.find((el) => el.id === selectedElementId)?.type === "text" ? (
                      <>
                        <Type className="w-4 h-4 text-[rgb(99,102,241)]" />
                        <span className="font-small text-[rgb(17,24,39)]">Text Element Settings</span>
                      </>
                    ) : elements.find((el) => el.id === selectedElementId)?.type === "qr" ? (
                      <>
                        <QrCode className="w-4 h-4 text-[rgb(99,102,241)]" />
                        <span className="font-small text-[rgb(17,24,39)]">QR Code Settings</span>
                      </>
                    ) : elements.find((el) => el.id === selectedElementId)?.type === "video" ? (
                      <>
                        <Video className="w-4 h-4 text-[rgb(99,102,241)]" />
                        <span className="font-small text-[rgb(17,24,39)]">Video Settings</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 text-[rgb(99,102,241)]" />
                        <span className="font-small text-[rgb(17,24,39)]">Image Element Settings</span>
                      </>
                    )}
                  </>
                ) : isBackgroundSelected ? (
                  <>
                    <ImageIcon className="w-4 h-4 text-[rgb(99,102,241)]" />
                    <span className="font-small text-[rgb(17,24,39)]">Background Image Settings</span>
                  </>
                ) : (
                  <>
                    <Layout className="w-4 h-4 text-[rgb(99,102,241)]" />
                    <span className="font-small text-[rgb(17,24,39)]">{details.title} Settings</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {type === "badge" && (
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-2 py-1 text-[10px] font-medium text-[rgb(99,102,241)] bg-[rgb(238,242,255)] rounded hover:bg-[rgb(224,231,255)] transition-colors flex items-center gap-0.5"
                    title="Export or Print badges"
                  >
                    <Printer className="w-3 h-3" />
                    Print
                  </button>
                )}
                {(selectedElementId !== null || isBackgroundSelected) && (
                  <button onClick={() => setSelectedElementId(null) || setIsBackgroundSelected(false)} className="p-1 rounded-md transition-colors text-gray-500 hover:bg-gray-50 ">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-0">
            {selectedElementId !== null ? (
              (() => {
                const element = elements.find((el) => el.id === selectedElementId);
                if (!element) return null;

                if (element.type === "text") {
                  return (
                    <>
                      <div className="settings-section bg-white  border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-2">
                        <div className="section-content p-4">
                          <div className="flex flex-col gap-3">
                            <div>
                              <label className="text-xs font-medium text-[rgb(17,24,39)]">Label Name</label>
                              <input
                                type="text"
                                value={element.label}
                                onChange={(e) => updateElement(element.id, { label: e.target.value })}
                                className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Enter label name"
                              />
                            </div>
                            <div className="mt-0">
                              <label className="text-xs font-medium text-[rgb(17,24,39)]">Sample Text</label>
                              <input
                                type="text"
                                value={element.content}
                                onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Enter your text here"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="settings-section bg-white  border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-0">
                        <div className="section-header p-3 border-b border-[rgb(229,231,235)] flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[rgb(17,24,39)] flex items-center gap-1.5">
                            <Type className="w-4 h-4 text-[rgb(99,102,241)]" />
                            Text Properties
                          </h3>
                        </div>
                        <div className="section-content p-4">
                          <div className="settings-grid grid grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Font Size</label>
                              <input
                                type="number"
                                min={8}
                                max={70}
                                value={element.fontSize}
                                onChange={(e) => updateElement(element.id, { fontSize: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Font Size"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Line Height</label>
                              <input
                                type="number"
                                min={8}
                                max={70}
                                value={element.lineHeight}
                                onChange={(e) => updateElement(element.id, { lineHeight: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Line Height"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Text Color</label>
                              <input
                                type="color"
                                value={element.color}
                                onChange={(e) => updateElement(element.id, { color: e.target.value })}
                                className="block w-full h-7 p-0 border border-[rgb(229,231,235)] rounded-md cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="settings-section bg-white  border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-0">
                        <div className="section-header p-3 border-b border-[rgb(229,231,235)] flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[rgb(17,24,39)] flex items-center gap-1.5">
                            <Layout className="w-4 h-4 text-[rgb(99,102,241)]" />
                            Alignment & Style
                          </h3>
                        </div>
                        <div className="section-content p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-2 text-xs font-medium text-[rgb(17,24,39)]">Horizontal</label>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateElement(element.id, { textAlign: "left" })}
                                  className={`p-2 rounded-md transition-colors ${element.textAlign === "left" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
                                  title="Align Left"
                                >
                                  <AlignLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateElement(element.id, { textAlign: "center" })}
                                  className={`p-2 rounded-md transition-colors ${element.textAlign === "center" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
                                  title="Align Center"
                                >
                                  <AlignCenter className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateElement(element.id, { textAlign: "right" })}
                                  className={`p-2 rounded-md transition-colors ${element.textAlign === "right" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
                                  title="Align Right"
                                >
                                  <AlignRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block mb-2 text-xs font-medium text-[rgb(17,24,39)]">Vertical</label>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateElement(element.id, { alignContent: "start" })}
                                  className={`p-2 rounded-md transition-colors ${element.alignContent === "start" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
                                  title="Align Top"
                                >
                                  <AlignVerticalJustifyStart className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateElement(element.id, { alignContent: "center" })}
                                  className={`p-2 rounded-md transition-colors ${
                                    element.alignContent === "center" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"
                                  }`}
                                  title="Align Middle"
                                >
                                  <AlignVerticalJustifyCenter className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateElement(element.id, { alignContent: "end" })}
                                  className={`p-2 rounded-md transition-colors ${element.alignContent === "end" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
                                  title="Align Bottom"
                                >
                                  <AlignVerticalJustifyEnd className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block mb-2 text-xs font-medium text-[rgb(17,24,39)]">Text Style</label>
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    updateElement(element.id, {
                                      fontWeight: element.fontWeight === "bold" ? "normal" : "bold",
                                    })
                                  }
                                  className={`p-2 rounded-md transition-colors ${element.fontWeight === "bold" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
                                  title="Bold"
                                >
                                  <Bold className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    updateElement(element.id, {
                                      fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
                                    })
                                  }
                                  className={`p-2 rounded-md transition-colors ${element.fontStyle === "italic" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
                                  title="Italic"
                                >
                                  <Italic className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="settings-section bg-white  border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-0">
                        <div className="section-header p-3 border-b border-[rgb(229,231,235)] flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[rgb(17,24,39)] flex items-center gap-1.5">
                            <Square className="w-4 h-4 text-[rgb(99,102,241)]" />
                            Dimensions
                          </h3>
                        </div>
                        <div className="section-content p-4">
                          <div className="settings-grid grid grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Width</label>
                              <input
                                type="number"
                                min={10}
                                max={defaultWidth}
                                value={element.width}
                                onChange={(e) => updateElement(element.id, { width: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Width"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Height</label>
                              <input
                                type="number"
                                min={10}
                                max={defaultHeight}
                                value={element.height}
                                onChange={(e) => updateElement(element.id, { height: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Height"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                } else if (element.type === "image") {
                  return (
                    <>
                      <div className="settings-section bg-white border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-4">
                        <div className="section-content p-4">
                          <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Sample Text</label>
                                <input
                                  type="text"
                                  value={element.label}
                                  onChange={(e) => updateElement(element.id, { label: e.target.value })}
                                  className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                  placeholder="Enter your text here"
                                />
                              </div>
                              <div>
                                <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Upload Image</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleElementFileChange(element.id, e.target.files[0]);
                                    }
                                  }}
                                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 hover:file:cursor-pointer"
                                />
                                {element.src && (
                                  <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                      src={element.src}
                                      onError={(e) => {
                                        e.currentTarget.src = avathar;
                                      }}
                                      alt="Selected"
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                )}
                                <p className="mt-1.5 text-xs text-gray-500">Supports: PNG, JPG, JPEG</p>

                                {/* Proportional Scaling Toggle */}
                                <div className="mt-3 flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <label className="text-xs font-medium text-[rgb(17,24,39)]">Lock Aspect Ratio</label>
                                  <button
                                    onClick={() => updateElement(element.id, { lockAspectRatio: !element.lockAspectRatio })}
                                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${element.lockAspectRatio ? "bg-[rgb(99,102,241)]" : "bg-gray-300"}`}
                                  >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${element.lockAspectRatio ? "translate-x-3" : "translate-x-1"}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="settings-section bg-white  border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-0">
                        <div className="section-header p-3 border-b border-[rgb(229,231,235)] flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[rgb(17,24,39)] flex items-center gap-1.5">
                            <Square className="w-4 h-4 text-[rgb(99,102,241)]" />
                            Border
                          </h3>
                        </div>
                        <div className="section-content p-4">
                          <div className="settings-grid grid grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Border Radius</label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={element.borderRadius}
                                onChange={(e) => updateElement(element.id, { borderRadius: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Border Radius"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Border Width</label>
                              <input
                                type="number"
                                min={0}
                                max={5}
                                value={element.borderWidth}
                                onChange={(e) => updateElement(element.id, { borderWidth: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Border Width"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Border Color</label>
                              <input
                                type="color"
                                value={element.borderColor}
                                onChange={(e) => updateElement(element.id, { borderColor: e.target.value })}
                                className="block w-full h-7 p-0 border border-[rgb(229,231,235)] rounded-md cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="settings-section bg-white  border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-0">
                        <div className="section-header p-3 border-b border-[rgb(229,231,235)] flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[rgb(17,24,39)] flex items-center gap-1.5">
                            <Square className="w-4 h-4 text-[rgb(99,102,241)]" />
                            Quick Shapes
                          </h3>
                        </div>
                        <div className="section-content p-4">
                          <div className="grid grid-cols-4 gap-2">
                            {/* Square Button */}
                            <button
                              onClick={() => {
                                const newSize = Math.min(element.width, element.height);
                                updateElement(element.id, {
                                  width: newSize,
                                  height: newSize,
                                  borderRadius: 0,
                                  clipPathValue: "none",
                                });
                              }}
                              className={`flex flex-col items-center justify-center p-2 aspect-square rounded-md transition-colors text-gray-600 hover:bg-gray-100 \
                                          ${
                                            element.width === element.height && element.borderRadius === 0 && (!element.clipPathValue || element.clipPathValue === "none")
                                              ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                                              : "border border-gray-200"
                                          }`}
                              title="Square Shape"
                            >
                              <Square className="w-6 h-6" />
                              <span className="mt-1 text-xs">Square</span>
                            </button>

                            {/* Circle Button */}
                            <button
                              onClick={() => {
                                const newSize = Math.min(element.width, element.height);
                                updateElement(element.id, {
                                  width: newSize,
                                  height: newSize,
                                  borderRadius: newSize / 2,
                                  clipPathValue: "none",
                                });
                              }}
                              className={`flex flex-col items-center justify-center p-2 aspect-square rounded-md transition-colors text-gray-600 hover:bg-gray-100 \
                                          ${
                                            element.width === element.height && element.borderRadius === element.width / 2 && (!element.clipPathValue || element.clipPathValue === "none")
                                              ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                                              : "border border-gray-200"
                                          }`}
                              title="Circle Shape"
                            >
                              <Circle className="w-6 h-6" />
                              <span className="mt-1 text-xs">Circle</span>
                            </button>

                            {/* Rectangle Button */}
                            <button
                              onClick={() => {
                                // Make it rectangular by using full canvas width
                                const canvasWidth = posterData.layoutWidth || defaultWidth;
                                const currentHeight = element.height;
                                const newWidth = Math.min(canvasWidth * 0.8, canvasWidth - 40); // Use 80% of canvas width with 20px margin
                                const newHeight = Math.max(currentHeight, 50); // Ensure minimum height

                                updateElement(element.id, {
                                  width: newWidth,
                                  height: newHeight,
                                  borderRadius: 0,
                                  clipPathValue: "none",
                                });
                              }}
                              className={`flex flex-col items-center justify-center p-2 aspect-square rounded-md transition-colors text-gray-600 hover:bg-gray-100 \
                                          ${
                                            element.borderRadius === 0 && (!element.clipPathValue || element.clipPathValue === "none") && element.width !== element.height
                                              ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                                              : "border border-gray-200"
                                          }`}
                              title="Rectangle Shape"
                            >
                              <RectangleHorizontal className="w-6 h-6" />
                              <span className="mt-1 text-xs">Rectangle</span>
                            </button>

                            {/* Triangle Button */}
                            <button
                              onClick={() => {
                                updateElement(element.id, {
                                  borderRadius: 0,
                                  clipPathValue: "polygon(50% 0%, 0% 100%, 100% 100%)",
                                });
                              }}
                              className={`flex flex-col items-center justify-center p-2 aspect-square rounded-md transition-colors text-gray-600 hover:bg-gray-100 \
                                          ${element.clipPathValue === "polygon(50% 0%, 0% 100%, 100% 100%)" ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300" : "border border-gray-200"}`}
                              title="Triangle Shape"
                            >
                              <Triangle className="w-6 h-6" />
                              <span className="mt-1 text-xs">Triangle</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                } else if (element.type === "video") {
                  return (
                    <>
                      <div className="settings-section bg-white border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-4">
                        <div className="section-content p-4">
                          <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Sample Text</label>
                                <input
                                  type="text"
                                  value={element.label}
                                  onChange={(e) => updateElement(element.id, { label: e.target.value })}
                                  className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                  placeholder="Enter your text here"
                                />
                              </div>
                              <div>
                                <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Upload Video</label>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleElementFileChange(element.id, e.target.files[0]);
                                    }
                                  }}
                                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 hover:file:cursor-pointer"
                                />
                                {element.src && (
                                  <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                                    <video src={element.src} className="w-full h-full object-contain" controls />
                                  </div>
                                )}
                                <p className="mt-1.5 text-xs text-gray-500">Supports: MP4, WebM, Ogg</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="settings-section bg-white border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-4">
                        <div className="section-header p-3 border-b border-[rgb(229,231,235)] flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[rgb(17,24,39)] flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-[rgb(99,102,241)]" />
                            Video Settings
                          </h3>
                        </div>
                        <div className="section-content p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-[rgb(17,24,39)]">Autoplay</label>
                              <button
                                onClick={() => updateElement(element.id, { autoplay: !element.autoplay })}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${element.autoplay ? "bg-[rgb(99,102,241)]" : "bg-gray-200"}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${element.autoplay ? "translate-x-4" : "translate-x-1"}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-[rgb(17,24,39)]">Loop</label>
                              <button
                                onClick={() => updateElement(element.id, { loop: !element.loop })}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${element.loop ? "bg-[rgb(99,102,241)]" : "bg-gray-200"}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${element.loop ? "translate-x-4" : "translate-x-1"}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-[rgb(17,24,39)]">Muted</label>
                              <button
                                onClick={() => updateElement(element.id, { muted: !element.muted })}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${element.muted ? "bg-[rgb(99,102,241)]" : "bg-gray-200"}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${element.muted ? "translate-x-4" : "translate-x-1"}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-[rgb(17,24,39)]">Show Controls</label>
                              <button
                                onClick={() => updateElement(element.id, { controls: !element.controls })}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${element.controls ? "bg-[rgb(99,102,241)]" : "bg-gray-200"}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${element.controls ? "translate-x-4" : "translate-x-1"}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="settings-section bg-white border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-0">
                        <div className="section-header p-3 border-b border-[rgb(229,231,235)] flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[rgb(17,24,39)] flex items-center gap-1.5">
                            <Square className="w-4 h-4 text-[rgb(99,102,241)]" />
                            Border
                          </h3>
                        </div>
                        <div className="section-content p-4">
                          <div className="settings-grid grid grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Border Radius</label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={element.borderRadius}
                                onChange={(e) => updateElement(element.id, { borderRadius: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Border Radius"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Border Width</label>
                              <input
                                type="number"
                                min={0}
                                max={5}
                                value={element.borderWidth}
                                onChange={(e) => updateElement(element.id, { borderWidth: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Border Width"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Border Color</label>
                              <input
                                type="color"
                                value={element.borderColor}
                                onChange={(e) => updateElement(element.id, { borderColor: e.target.value })}
                                className="block w-full h-7 p-0 border border-[rgb(229,231,235)] rounded-md cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                } else if (element.type === "qr") {
                  return (
                    <>
                      <div className="settings-section bg-white border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-4">
                        <div className="section-content p-4">
                          <div className="space-y-4">
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">QR Value</label>
                              <input
                                type="text"
                                value={element.qrValue}
                                onChange={(e) => updateElement(element.id, { qrValue: e.target.value })}
                                className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Enter URL or text"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Background Color</label>
                                <input
                                  type="color"
                                  value={element.bgColor}
                                  onChange={(e) => updateElement(element.id, { bgColor: e.target.value })}
                                  className="block w-full h-8 p-0 border border-[rgb(229,231,235)] rounded-md cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">QR Color</label>
                                <input
                                  type="color"
                                  value={element.fgColor}
                                  onChange={(e) => updateElement(element.id, { fgColor: e.target.value })}
                                  className="block w-full h-8 p-0 border border-[rgb(229,231,235)] rounded-md cursor-pointer"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Error Correction Level</label>
                              <select
                                value={element.level}
                                onChange={(e) => updateElement(element.id, { level: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                              >
                                <option value="L">Low (7%)</option>
                                <option value="M">Medium (15%)</option>
                                <option value="Q">Quartile (25%)</option>
                                <option value="H">High (30%)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="settings-section bg-white border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-4">
                        <div className="section-header p-3 border-b border-[rgb(229,231,235)] flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[rgb(17,24,39)] flex items-center gap-1.5">
                            <Square className="w-4 h-4 text-[rgb(99,102,241)]" />
                            Size & Position
                          </h3>
                        </div>
                        <div className="section-content p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Width</label>
                              <input
                                type="number"
                                value={element.width}
                                onChange={(e) => updateElement(element.id, { width: Number(e.target.value), size: Number(e.target.value) })}
                                className="w-full px-2 py-1.5 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                min="50"
                                max="500"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Height</label>
                              <input
                                type="number"
                                value={element.height}
                                onChange={(e) => updateElement(element.id, { height: Number(e.target.value), size: Number(e.target.value) })}
                                className="w-full px-2 py-1.5 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                min="50"
                                max="500"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Position X</label>
                              <input
                                type="number"
                                value={element.positionX}
                                onChange={(e) => updateElement(element.id, { positionX: Number(e.target.value) })}
                                className="w-full px-2 py-1.5 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Position Y</label>
                              <input
                                type="number"
                                value={element.positionY}
                                onChange={(e) => updateElement(element.id, { positionY: Number(e.target.value) })}
                                className="w-full px-2 py-1.5 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                }
              })()
            ) : isBackgroundSelected ? (
              <div className="settings-section bg-white border-[rgb(229,231,235)] rounded-xl overflow-hidden mb-4">
                <div className="section-content p-4">
                  <div className="settings-grid grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Background Image</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 hover:file:cursor-pointer"
                        />
                        {(previewImage || posterData.backgroundImage) && (
                          <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={
                                previewImage ||
                                (posterData.backgroundImage
                                  ? posterData.backgroundImage.startsWith("http") || posterData.backgroundImage.startsWith("blob:")
                                    ? posterData.backgroundImage
                                    : import.meta.env.VITE_CDN + posterData.backgroundImage
                                  : noimage)
                              }
                              alt="Current background"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500">Supports: PNG, JPG, JPEG, SVG</p>
                      {posterData.backgroundImage && (
                        <button
                          onClick={() => {
                            const img = new Image();
                            img.onload = () => {
                              // Set layout dimensions based on image dimensions
                              handleInputChange("layoutWidth", img.width);
                              handleInputChange("layoutHeight", img.height);
                            };
                            img.src =
                              previewImage ||
                              (posterData.backgroundImage
                                ? posterData.backgroundImage.startsWith("http") || posterData.backgroundImage.startsWith("blob:")
                                  ? posterData.backgroundImage
                                  : import.meta.env.VITE_CDN + posterData.backgroundImage
                                : noimage);
                          }}
                          className="mt-3 w-full px-3 py-2 text-sm font-medium text-[rgb(99,102,241)] bg-[rgb(238,242,255)] rounded-lg hover:bg-[rgb(224,231,255)] transition-colors flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Set Canvas to Image Size
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={posterData.title || ""}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)] resize-y"
                        placeholder="Enter poster title"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Description</label>
                    <textarea
                      value={posterData.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)] min-h-[100px] resize-y"
                      placeholder="Enter poster description"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Slug</label>
                    <input
                      type="text"
                      value={posterData.slug || ""}
                      onChange={(e) => handleInputChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                      placeholder="enter-slug-here"
                    />
                    <p className="mt-1 text-xs text-gray-500">URL-friendly version of the title. Use hyphens to separate words.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {elementsUpdated && (
          <div className="bg-white border-t border-[rgb(229,231,235)] py-3 px-4 sticky bottom-0 flex justify-end gap-3">
            <button onClick={discardChanges} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Discard
            </button>
            <button onClick={SaveData} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
              Publish
            </button>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Apply Badge Design</h3>
              <button onClick={handleCloseApplyModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Toggle buttons for Apply mode */}
              <div className="flex gap-2">
                <button
                  onClick={() => setApplyMode("all")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${applyMode === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Apply to All
                </button>
                <button
                  onClick={() => setApplyMode("selected")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    applyMode === "selected" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Apply to Selected
                </button>
              </div>

              {/* Content based on selected mode */}
              {applyMode === "all" ? (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">This will apply the current badge design to all other tickets in this event.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Select Tickets:</label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                    {eventTickets
                      .filter((ticket) => ticket.id !== data._id)
                      .map((ticket) => (
                        <label key={ticket.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedApplyTickets.includes(ticket.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApplyTickets([...selectedApplyTickets, ticket.id]);
                              } else {
                                setSelectedApplyTickets(selectedApplyTickets.filter((id) => id !== ticket.id));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          {/* <span className="text-sm text-gray-700">{ticket.value}</span> */}
                          <span className="text-sm text-gray-700">{ticket.title}</span>
                        </label>
                      ))}
                  </div>
                  {eventTickets.filter((ticket) => ticket.id !== data._id).length === 0 && <p className="text-sm text-gray-500 text-center py-4">No other tickets available in this event.</p>}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <button onClick={handleCloseApplyModal} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={isApplyDisabled()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            {console.log("🔍 MODAL PHASE:", cloneModalPhase, "PROGRESS STEP:", cloneProgressStep)}

            {/* Selection Phase */}
            {cloneModalPhase === "select" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Clone Badge Design</h3>
                  <button onClick={handleCloseCloneModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">Select a ticket to clone the badge design from. This will overwrite your current badge design.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Ticket to Clone From:</label>
                    {eventTickets.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>Loading tickets...</p>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                        {eventTickets
                          .filter((ticket) => ticket.id !== data._id)
                          .map((ticket) => (
                            <label key={ticket.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name="cloneSource"
                                value={ticket.id}
                                checked={selectedCloneTickets.includes(ticket.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCloneTickets([e.target.value]);
                                  } else {
                                    setSelectedCloneTickets([]);
                                  }
                                }}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-700">{ticket.title}</span>
                            </label>
                          ))}
                        {eventTickets.filter((ticket) => ticket.id !== data._id).length === 0 && (
                          <div className="p-4 text-center text-gray-500">
                            <p>No other tickets available to clone from</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleCloseCloneModal} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleCloneConfirm}
                    disabled={selectedCloneTickets.length === 0 || eventTickets.length === 0}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clone Design
                  </button>
                </div>
              </>
            )}

            {/* Confirmation Phase */}
            {cloneModalPhase === "confirm" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Clone</h3>
                  <button onClick={handleCloseCloneModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-red-600 font-bold">!</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Warning</h4>
                        <p className="text-sm text-red-700">This will overwrite your current badge design. This action cannot be undone.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Source:</strong> {eventTickets.find((t) => t.id === selectedCloneTickets[0])?.title}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Target:</strong> Current badge design
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCloneModalPhase("select")}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button onClick={handleClone} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                    Yes, Clone Design
                  </button>
                </div>
              </>
            )}

            {/* Progress Phase */}
            {cloneModalPhase === "progress" && (
              <>
                {console.log("🎯 PROGRESS PHASE IS RENDERING - Step:", cloneProgressStep)}
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cloning Badge Design</h3>
                    <p className="text-sm text-gray-600">
                      {cloneProgressStep === 0 && "Initializing clone process..."}
                      {cloneProgressStep === 1 && "Validating source ticket..."}
                      {cloneProgressStep === 2 && "Fetching badge design..."}
                      {cloneProgressStep === 3 && "Cloning design elements..."}
                      {cloneProgressStep === 4 && "Finalizing clone process..."}
                      {cloneProgressStep === 5 && "Clone completed successfully!"}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${(cloneProgressStep / 5) * 100}%` }}></div>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className={cloneProgressStep >= 1 ? "text-indigo-600 font-medium" : ""}>Validate</span>
                    <span className={cloneProgressStep >= 2 ? "text-indigo-600 font-medium" : ""}>Fetch</span>
                    <span className={cloneProgressStep >= 3 ? "text-indigo-600 font-medium" : ""}>Clone</span>
                    <span className={cloneProgressStep >= 4 ? "text-indigo-600 font-medium" : ""}>Finalize</span>
                    <span className={cloneProgressStep >= 5 ? "text-green-600 font-medium" : ""}>Complete</span>
                  </div>
                </div>
              </>
            )}

            {/* Complete Phase */}
            {cloneModalPhase === "complete" && (
              <>
                <div className="text-center">
                  <div className="mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${cloneError ? "bg-red-100" : "bg-green-100"}`}>
                      {cloneError ? (
                        <X className="w-8 h-8 text-red-600" />
                      ) : (
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${cloneError ? "text-red-900" : "text-green-900"}`}>{cloneError ? "Clone Failed" : "Clone Completed!"}</h3>
                    <p className={`text-sm ${cloneError ? "text-red-600" : "text-green-600"}`}>
                      {cloneError || "Badge design has been successfully cloned. Click 'Apply Changes' to update the editor."}
                    </p>
                  </div>

                  {/* Clone Details */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Clone Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Event:</span>
                        <span className="text-gray-900 font-medium">{data.event?.title || "Current Event"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Source Ticket:</span>
                        <span className="text-gray-900 font-medium">{eventTickets.find((t) => t.id === selectedCloneTickets[0])?.title || "Selected Ticket"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Ticket:</span>
                        <span className="text-gray-900 font-medium">{data.title || "Current Ticket"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${cloneError ? "text-red-600" : "text-green-600"}`}>{cloneError ? "Failed" : "Completed"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar - Always show completed state */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${cloneError ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: cloneError ? `${(cloneProgressStep / 5) * 100}%` : "100%" }}
                      ></div>
                    </div>

                    {/* Progress Steps - Show completion status */}
                    <div className="flex justify-between text-xs">
                      <span className={cloneProgressStep >= 1 ? (cloneError && cloneProgressStep < 2 ? "text-red-600 font-medium" : "text-green-600 font-medium") : "text-gray-400"}>Validate</span>
                      <span className={cloneProgressStep >= 2 ? (cloneError && cloneProgressStep < 3 ? "text-red-600 font-medium" : "text-green-600 font-medium") : "text-gray-400"}>Fetch</span>
                      <span className={cloneProgressStep >= 3 ? (cloneError && cloneProgressStep < 4 ? "text-red-600 font-medium" : "text-green-600 font-medium") : "text-gray-400"}>Clone</span>
                      <span className={cloneProgressStep >= 4 ? (cloneError && cloneProgressStep < 5 ? "text-red-600 font-medium" : "text-green-600 font-medium") : "text-gray-400"}>Finalize</span>
                      <span className={!cloneError ? "text-green-600 font-medium" : "text-gray-400"}>Complete</span>
                    </div>
                  </div>

                  {/* Error Details */}
                  {cloneError && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg text-left">
                      <h4 className="text-sm font-medium text-red-900 mb-1">Error Details</h4>
                      <p className="text-sm text-red-700">{cloneError}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleCloseCloneModal} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Close
                  </button>
                  {!cloneError && (
                    <button onClick={handleRefreshData} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                      Apply Changes
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Import Badge Design</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <BadgeImport onClose={() => setShowImportModal(false)} onImport={handleImport} />
          </div>
        </div>
      )}

      {/* Print/Export Modal */}
      {showPrintModal && (
        <BadgeExport
          open={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          badgeData={{
            ...posterData,
            builderData: JSON.stringify(elements),
            layoutWidth: posterData.layoutWidth || defaultWidth,
            layoutHeight: posterData.layoutHeight || defaultHeight,
          }}
          allBadges={allBadges}
          tickets={exportTickets}
          userFields={userFields || []}
        />
      )}
    </div>
  );
};

export default PosterBuilder;
