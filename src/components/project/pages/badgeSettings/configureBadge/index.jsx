/*
1. badge type
2. {
    "_id": "6858d0618dcffef6bfc76799",
    "backgroundImage": "eventhex/uploads/badge/backgroundImage-1750651001614.jpeg",
    "backgroundColor": "",
    "fontFamily": "",
    "layoutWidth": 576,
    "layoutHeight": 1280,
    "ticket": {
        "_id": "68149717c4b9b3811e79476a",
        "id": "68149717c4b9b3811e79476a",
        "value": "Testingg"
    },
    "tickets": [],
    "participantTypes": [],
    "isActive": true,
    "event": {
        "_id": "68149714c4b9b3811e79475c",
        "id": "68149714c4b9b3811e79475c",
        "value": "Testing Event of Datahex for Confirmign the Event is Working"
    },
    "createdAt": "2025-06-23T03:56:17.988Z",
    "updatedAt": "2025-06-23T04:33:49.469Z",
    "__v": 0,
    "badgeType": "COMMON_TICKET",
    "builderData": "[{\"id\":\"background\",\"type\":\"background\",\"label\":\"Background\",\"src\":\"https://event-manager.syd1.digitaloceanspaces.com/eventhex/uploads/badge/backgroundImage-1750651001614.jpeg\",\"positionX\":0,\"positionY\":0,\"width\":576,\"height\":1280,\"isBackground\":true},{\"id\":1750650984657,\"type\":\"text\",\"label\":\"Name\",\"var\":\"name\",\"preset\":\"name\",\"content\":\"Sample Name\",\"color\":\"#FFFFFF\",\"fontSize\":28,\"fontWeight\":\"bold\",\"fontStyle\":\"normal\",\"textAlign\":\"center\",\"alignContent\":\"center\",\"lineHeight\":33.6,\"positionX\":0.000013661916160547895,\"positionY\":194.63396687972988,\"width\":160,\"height\":47},{\"id\":1750650984658,\"type\":\"text\",\"label\":\"Event\",\"var\":\"event\",\"preset\":\"event\",\"content\":\"Sample Event\",\"color\":\"#FFFFFF\",\"fontSize\":20,\"fontWeight\":\"normal\",\"fontStyle\":\"normal\",\"textAlign\":\"center\",\"alignContent\":\"center\",\"lineHeight\":24,\"positionX\":94.62959009500487,\"positionY\":9.334316874186872,\"width\":360,\"height\":52},{\"id\":1750650984659,\"type\":\"text\",\"label\":\"Ticket\",\"var\":\"ticket\",\"preset\":\"ticket\",\"content\":\"Sample Ticket\",\"color\":\"#FFFFFF\",\"fontSize\":24,\"fontWeight\":\"normal\",\"fontStyle\":\"normal\",\"textAlign\":\"center\",\"alignContent\":\"center\",\"lineHeight\":28.799999999999997,\"positionX\":0.0000016665408601862427,\"positionY\":279.9688620817677,\"width\":177,\"height\":36},{\"id\":1750650984660,\"type\":\"qr\",\"label\":\"QR Code\",\"var\":\"qrcode\",\"preset\":\"qr\",\"positionX\":375.99999790034497,\"positionY\":755.0155701198494,\"width\":200,\"height\":200,\"qrValue\":\"sample-qr-data\",\"bgColor\":\"#FFFFFF\",\"fgColor\":\"#000000\",\"level\":\"L\",\"includeMargin\":true,\"size\":200}]"
}

3. (status) => {
      setShowLoader(status);
    } 'setLoaderBox'

4. (messageContent) => {
      setMessage(messageContent);
      setShowMessage(true);
    } 'setMessage'
*/
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { avathar, noimage } from "../../../../../images";
import { getData, putData } from "../../../../../backend/api";
import { useToast } from "../../../../core/toast";
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
  Eye,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GetIcon } from "../../../../../icons";
import PrintBadge from "../printBadge";

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
      { id: "qr", label: "User QR Code", icon: QrCode, type: "qr" },
      { id: "image", label: "Image", icon: ImagePlus, type: "image" },
      { id: "event", label: "Event", icon: Calendar, type: "text", preset: "event", var: "title" },
      { id: "ticket", label: "Ticket", icon: FileText, type: "text", preset: "ticket", var: "ticket" },
      { id: "location", label: "Location", icon: MapPin, type: "text", preset: "location", var: "venue" },
      { id: "startDate", label: "Event Start Date", icon: CalendarDays, type: "text", preset: "startDate", var: "startDate" },
      { id: "endDate", label: "Event End Date", icon: Clock, type: "text", preset: "endDate", var: "endDate" },
      { id: "description", label: "Description", icon: Info, type: "text", preset: "description", var: "description" },
      { id: "banner", label: "Banner", icon: ImagePlus, type: "image", preset: "banner", var: "banner" },
      { id: "ticketStartDate", label: "Ticket Start Date", icon: CalendarDays, type: "text", preset: "ticketStartDate", var: "ticketStartDate" },
      { id: "ticketEndDate", label: "Ticket End Date", icon: Clock, type: "text", preset: "ticketEndDate", var: "ticketEndDate" },
      { id: "ticketNumber", label: "Ticket Number", icon: FileText, type: "text", preset: "ticketNumber", var: "ticketNumber" },
      // { id: "organizer", label: "Organizer", icon: Organization, type: "text", preset: "organizer", var: "franchise" },
      // { id: "contact", label: "Contact", icon: PhoneCall, type: "text", preset: "contact", var: "contactNumber" },
    ],
  },
  ticketFields: {
    title: "Ticket Fields",
    elements: [],
  },
};

const PosterBuilder = ({ type = "advocacy", data, setLoaderBox, setMessage }) => {
  // console.log(data, "data");
  const toast = useToast();
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
  const [backgroundType, setBackgroundType] = useState("image"); // "image" or "color"
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [zoomMode, setZoomMode] = useState("fit");
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const backgroundImageRef = useRef(null);
  const rightPanelRef = useRef(null);
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
  const [eventTickets, setEventTickets] = useState([]);
  const [selectedApplyTickets, setSelectedApplyTickets] = useState([]);
  const [selectedCloneTickets, setSelectedCloneTickets] = useState([]);
  const [applyMode, setApplyMode] = useState("all");

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [originalElements, setOriginalElements] = useState([]);

  // Badge export related state - UPDATED
  const [allBadges, setAllBadges] = useState([]);
  const [exportTickets, setExportTickets] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Undo/Redo History State
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  const canvasViewportRef = useRef(null); // Ref for the outer canvas viewport
  const paddedContainerRef = useRef(null); // Ref for the inner, padded, scrollable container

  // History Management Functions
  const saveHistory = useCallback((elementsSnapshot, posterDataSnapshot) => {
    if (isUndoRedoAction) return; // Don't save history during undo/redo operations
    
    const historyEntry = {
      elements: JSON.parse(JSON.stringify(elementsSnapshot)),
      posterData: JSON.parse(JSON.stringify(posterDataSnapshot)),
      timestamp: Date.now()
    };

    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(historyEntry);
      
      // Limit history to 50 entries to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prevIndex => Math.min(prevIndex + 1, 49));
  }, [historyIndex, isUndoRedoAction]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedoAction(true);
      const previousState = history[historyIndex - 1];
      
      setElements(previousState.elements);
      setPosterData(previousState.posterData);
      setHistoryIndex(prevIndex => prevIndex - 1);
      
      setTimeout(() => setIsUndoRedoAction(false), 100);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoAction(true);
      const nextState = history[historyIndex + 1];
      
      setElements(nextState.elements);
      setPosterData(nextState.posterData);
      setHistoryIndex(prevIndex => prevIndex + 1);
      
      setTimeout(() => setIsUndoRedoAction(false), 100);
    }
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Preview functionality
  const handlePreview = useCallback(async () => {
    if (isPreviewMode) {
      // If already in preview mode, toggle it off
      handleClosePreview();
      return;
    }

    try {
      setLoaderBox(true);
      
      // Save current elements state
      setOriginalElements([...elements]);
      
      // Fetch sample ticket registration data
      const response = await getData({
        event: data.event._id,
        limit: 1
      }, "ticket-registration");
      
      if (response?.data?.response && response.data.response.length > 0) {
        const sampleData = response.data.response[0];
        setPreviewData(sampleData);
        
        console.log("🎯 Preview Data:", sampleData);
        console.log("🎯 Current Elements:", elements);
        
        // Update elements with sample data
        const updatedElements = elements.map(element => {
          if (element.type === 'text' && element.var) {
            let content = element.content;
            
            // Replace sample text with real data based on var
            switch (element.var) {
              case 'name':
                content = sampleData.firstName || sampleData.name || 'No Name Available';
                break;
              case 'firstName':
                content = sampleData.firstName || 'No First Name Available';
                break;
              case 'lastName':
                content = sampleData.lastName || 'No Last Name Available';
                break;
              case 'email':
                content = sampleData.emailId || sampleData.email || 'No Email Available';
                break;
              case 'phone':
                content = sampleData.authenticationId || sampleData.phone || 'No Phone Available';
                break;
              case 'event':
                content = data.event?.value || data.event?.title || 'No Event Available';
                break;
              case 'ticket':
                content = data.ticket?.value || data.ticket?.title || 'No Ticket Available';
                break;
              case 'designation':
                content = sampleData.designation || sampleData.jobTitle || 'No Designation Available';
                break;
              case 'company':
                content = sampleData.company || sampleData.organization || 'No Company Available';
                break;
              case 'contact':
                content = sampleData.authenticationId || sampleData.phone || sampleData.emailId || 'No Contact Available';
                break;
              case 'ticketNumber':
                content = sampleData.ticketNumber || sampleData.formattedTicketNumber || 'No Ticket Number Available';
                break;
              case 'ticketStartDate':
                content = sampleData.ticketStartDate || 'No Start Date Available';
                break;
              case 'ticketEndDate':
                content = sampleData.ticketEndDate || 'No End Date Available';
                break;
              default:
                // Try to find the field in sampleData
                if (sampleData[element.var]) {
                  content = sampleData[element.var];
                }
                break;
            }
            
            return {
              ...element,
              content: content || 'No Text Available'
            };
          }
          
          // Handle image elements with CDN
          if (element.type === 'image' && element.src) {
            let src = element.src;
            
            // Convert relative paths to CDN URLs
            if (src && !src.startsWith('http') && !src.startsWith('blob:')) {
              src = `https://event-manager.syd1.digitaloceanspaces.com/${src}`;
            }
            
            return {
              ...element,
              src: src
            };
          }
          
          return element;
        });
        
        console.log("🎯 Updated Elements:", updatedElements);
        
        setElements(updatedElements);
        setIsPreviewMode(true);
      } else {
        // No data available, show message
        if (setMessage) {
          setMessage({
            type: 1,
            content: "No ticket registration data available for preview",
            icon: "info",
            title: "No Data"
          });
        }
      }
    } catch (error) {
      console.error("Error fetching preview data:", error);
      if (setMessage) {
        setMessage({
          type: 1,
          content: "Failed to load preview data",
          icon: "error",
          title: "Error"
        });
      }
    } finally {
      setLoaderBox(false);
    }
  }, [elements, data, setMessage, setLoaderBox, isPreviewMode]);

  const handleClosePreview = useCallback(() => {
    // Restore original elements
    if (originalElements.length > 0) {
      setElements(originalElements);
    }
    setIsPreviewMode(false);
    setPreviewData(null);
    setOriginalElements([]);
  }, [originalElements]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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

  // Fix misalignment: Re-apply zoom when elements are loaded to ensure proper positioning
  useEffect(() => {
    if (elements.length > 0 && initialized && posterData.layoutWidth && posterData.layoutHeight) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        handleZoomMode(zoomMode, posterData.layoutWidth, posterData.layoutHeight);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [elements.length, initialized, posterData.layoutWidth, posterData.layoutHeight, zoomMode]);

  // Click outside handler to close element settings modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if an element is selected or background is selected
      if ((selectedElementId !== null || isBackgroundSelected) && rightPanelRef.current) {
        // Check if the click is outside the right panel
        if (!rightPanelRef.current.contains(event.target)) {
          setSelectedElementId(null);
          setIsBackgroundSelected(false);
        }
      }
    };

    // Add event listener when element is selected
    if (selectedElementId !== null || isBackgroundSelected) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedElementId, isBackgroundSelected]);

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
  const handleClone = async () => {
    setLoaderBox(true);

    try {
      console.log("🚀 Starting clone process...");
      console.log("Current ticket ID:", data._id);
      console.log("Selected clone tickets:", selectedCloneTickets);
      console.log("Event ID:", data.event._id);
      console.log("Available tickets:", eventTickets);

      if (selectedCloneTickets.length === 0) {
        setMessage({
          content: "Please select a ticket to clone from",
          type: 1,
          icon: "warning",
        });
        setLoaderBox(false);
        return;
      }

      if (selectedCloneTickets.length > 1) {
        setMessage({
          content: "Please select only one ticket to clone from",
          type: 1,
          icon: "warning",
        });
        setLoaderBox(false);
        return;
      }

      const sourceTicketId = selectedCloneTickets[0];

      // Verify the source ticket exists in our eventTickets list
      const sourceTicket = eventTickets.find((ticket) => ticket.id === sourceTicketId);
      if (!sourceTicket) {
        console.error("Source ticket not found in eventTickets list:", sourceTicketId);
        setMessage({
          content: "Selected ticket not found. Please refresh and try again.",
          type: 1,
          icon: "error",
        });
        setLoaderBox(false);
        return;
      }

      console.log("✅ Source ticket found:", sourceTicket);
      console.log("Getting source badge for ticket:", sourceTicketId);

      try {
        const sourceBadgeResponse = await getData(
          {
            ticket: sourceTicketId,
            event: data.event._id,
          },
          "badge/datas"
        );

        console.log("Badge API response:", sourceBadgeResponse);

        if (!sourceBadgeResponse?.data?.response?.[0]) {
          setMessage({
            content: "Source ticket badge not found or has no design",
            type: 1,
            icon: "error",
          });
          setLoaderBox(false);
          return;
        }

        const sourceBadge = sourceBadgeResponse.data.response[0];
        console.log("✅ Source badge found:", {
          badgeId: sourceBadge._id,
          hasBuilderData: !!sourceBadge.builderData && sourceBadge.builderData !== "[]",
        });

        if (!sourceBadge.builderData || sourceBadge.builderData === "[]") {
          setMessage({
            content: "Selected ticket has no badge design to clone",
            type: 1,
            icon: "warning",
          });
          setLoaderBox(false);
          return;
        }

        console.log("🔄 Calling clone API with:", {
          sourceBadgeId: sourceBadge._id,
          targetTicketId: data._id,
        });

        const response = await putData(
          {
            id: sourceBadge._id,
            ticket: data._id,
          },
          "badge/clone"
        );

        console.log("Clone API response:", response);

        if (response?.data?.success) {
          setMessage({
            content: "Badge design cloned successfully",
            type: 0,
            icon: "success",
          });

          setTimeout(() => {
            window.location.reload();
          }, 1500);

          setShowCloneModal(false);
          setSelectedCloneTickets([]);
        } else {
          const errorMsg = response?.data?.message || "Error cloning badge";
          console.error("❌ Clone failed:", errorMsg);
          setMessage({
            content: errorMsg,
            type: 1,
            icon: "error",
          });
        }
      } catch (fetchError) {
        console.error("❌ Error during clone process:", fetchError);

        if (fetchError?.response?.status === 400) {
          const errorMessage = fetchError?.response?.data?.message;
          if (errorMessage && errorMessage.includes("ValidationError")) {
            setMessage({
              content: "Selected ticket has no valid badge design to clone",
              type: 1,
              icon: "warning",
            });
          } else {
            setMessage({
              content: errorMessage || "Error accessing source ticket badge",
              type: 1,
              icon: "error",
            });
          }
        } else if (fetchError?.response?.status === 404) {
          setMessage({
            content: "Source ticket or badge not found",
            type: 1,
            icon: "error",
          });
        } else {
          const errorMsg = fetchError?.response?.data?.message || "Failed to clone badge design";
          setMessage({
            content: errorMsg,
            type: 1,
            icon: "error",
          });
        }
        setLoaderBox(false);
        return;
      }
    } catch (error) {
      console.error("💥 Exception during clone operation:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "An unexpected error occurred during cloning.";
      setMessage({
        content: errorMsg,
        type: 1,
        icon: "error",
      });
    } finally {
      setLoaderBox(false);
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
              json.push(backgroundElement);
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
            json.push(defaultBackgroundElement);
          }

          setPosterData(newPosterData);
          setInitialPosterData(newPosterData);
          setElements(json);
          setInitialElements(json);
          setDefaultWidth(currentLayoutWidth);
          setDefaultHeight(currentLayoutHeight);
          setLoaderBox(false);
          // Fix timing issue: Wait for DOM to be ready before applying zoom
          setTimeout(() => {
            handleZoomMode("fit", currentLayoutWidth, currentLayoutHeight);
          }, 100);
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
          // FIXED: Don't let image pixel dimensions override layout CM dimensions
          // Only use poster.layoutWidth/Height (which are in CM) unless they don't exist
          let currentLayoutWidth = poster.layoutWidth || defaultWidth;
          let currentLayoutHeight = poster.layoutHeight || defaultHeight;

          // Only convert from pixels to CM if the saved dimensions are clearly in pixels (> 50)
          if (currentLayoutWidth > 50) {
            currentLayoutWidth = currentLayoutWidth / 37.795; // Convert pixels to CM
          }
          if (currentLayoutHeight > 50) {
            currentLayoutHeight = currentLayoutHeight / 37.795; // Convert pixels to CM
          }

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
                width: currentLayoutWidth, // Keep in CM
                height: currentLayoutHeight, // Keep in CM
                positionX: 0,
                positionY: 0,
              };
            } else {
              const backgroundElement = {
                id: "background",
                type: "background",
                label: "Background",
                src: backgroundImageUrl,
                positionX: 0,
                positionY: 0,
                width: currentLayoutWidth, // Keep in CM
                height: currentLayoutHeight, // Keep in CM
                isBackground: true,
              };
              json.push(backgroundElement);
            }
          } else if (backgroundElementIndex === -1) {
            const defaultBackgroundElement = {
              id: "background",
              type: "background",
              label: "Background",
              src: noimage,
              positionX: 0,
              positionY: 0,
              width: currentLayoutWidth, // Keep in CM
              height: currentLayoutHeight, // Keep in CM
              isBackground: true,
            };
            json.push(defaultBackgroundElement);
          }

          setEventFields(response.data.data.eventFields);
          setPosterData(newPosterData);
          setInitialPosterData(newPosterData);
          setElements(json);
          setInitialElements(json);
          setDefaultWidth(currentLayoutWidth);
          setDefaultHeight(currentLayoutHeight);
          setLoaderBox(false);
          // Fix timing issue: Wait for DOM to be ready before applying zoom
          setTimeout(() => {
            handleZoomMode("fit", currentLayoutWidth, currentLayoutHeight);
          }, 100);
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
            let json;
            try {
              json = JSON.parse(badge.builderData ?? "[]");
            } catch (parseError) {
              console.error("Error parsing builderData:", parseError);
              json = [];
            }

            // FIXED: All dimensions should be in CM for storage, pixels only for display
            let layoutWidthCM = badge.layoutWidth || defaultWidth;
            let layoutHeightCM = badge.layoutHeight || defaultHeight;

            // Convert from pixels to CM if the saved dimensions are clearly in pixels (> 50)
            if (layoutWidthCM > 50) {
              layoutWidthCM = layoutWidthCM / 37.795;
            }
            if (layoutHeightCM > 50) {
              layoutHeightCM = layoutHeightCM / 37.795;
            }

            // Process elements - ensure they're in CM format for internal storage
            json = json.map((element) => {
              const convertedElement = { ...element };

              // Detect if data is in pixel format (old data) vs CM format (new data)
              const isLikelyPixelFormat = element.width > 100 || element.height > 100 || element.positionX > 50 || element.positionY > 50;

              if (isLikelyPixelFormat) {
                // Convert from pixels to CM
                console.log(`Converting ${element.type} from pixels to CM`);
                convertedElement.positionX = (element.positionX || 0) / 37.795;
                convertedElement.positionY = (element.positionY || 0) / 37.795;
                convertedElement.width = (element.width || 1) / 37.795;
                convertedElement.height = (element.height || 1) / 37.795;
              } else {
                // Already in CM format, ensure we have valid numbers
                convertedElement.positionX = element.positionX || 0;
                convertedElement.positionY = element.positionY || 0;
                convertedElement.width = element.width || 1;
                convertedElement.height = element.height || 1;
              }

              // Special handling for background element - always match layout dimensions
              if (element.type === "background") {
                convertedElement.width = layoutWidthCM;
                convertedElement.height = layoutHeightCM;
                convertedElement.positionX = 0;
                convertedElement.positionY = 0;
              }

              // Ensure all element types have proper defaults
              if (element.type === "qr") {
                convertedElement.qrValue = element.qrValue || "https://example.com";
                convertedElement.bgColor = element.bgColor || "#FFFFFF";
                convertedElement.fgColor = element.fgColor || "#000000";
                convertedElement.level = element.level || "L";
                convertedElement.includeMargin = element.includeMargin !== false;
                convertedElement.size = convertedElement.width * 37.795; // Convert CM to pixels for QR display
              }

              if (element.type === "text") {
                convertedElement.content = element.content || "Sample Text";
                convertedElement.color = element.color || "#FFFFFF";
                convertedElement.fontSize = element.fontSize || 16;
                convertedElement.fontWeight = element.fontWeight || "normal";
                convertedElement.fontStyle = element.fontStyle || "normal";
                convertedElement.textAlign = element.textAlign || "center";
                convertedElement.alignContent = element.alignContent || "center";
                convertedElement.lineHeight = element.lineHeight || convertedElement.fontSize * 1.2;
              }

              if (element.type === "image") {
                convertedElement.borderRadius = element.borderRadius || 0;
                convertedElement.borderWidth = element.borderWidth || 0;
                convertedElement.borderColor = element.borderColor || "#000000";
              }

              return convertedElement;
            });

            const currentLayoutWidth = layoutWidthCM;
            const currentLayoutHeight = layoutHeightCM;

            // Construct the proper background image URL
            let backgroundImageUrl = null;
            if (badge.backgroundImage) {
              if (badge.backgroundImage.startsWith("http") || badge.backgroundImage.startsWith("blob:")) {
                backgroundImageUrl = badge.backgroundImage;
              } else {
                backgroundImageUrl = import.meta.env.VITE_CDN + badge.backgroundImage;
              }
            }

            // Update background element with proper URL
            const backgroundElement = json.find((el) => el.type === "background");
            if (backgroundElement) {
              // Fix invalid background image paths
              if (backgroundElement.src && (backgroundElement.src.startsWith("/src/") || backgroundElement.src.startsWith("src/"))) {
                backgroundElement.src = noimage; // Use the imported noimage
              } else if (backgroundImageUrl) {
                backgroundElement.src = backgroundImageUrl;
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
                  width: currentLayoutWidth, // Keep in CM
                  height: currentLayoutHeight, // Keep in CM
                  positionX: 0,
                  positionY: 0,
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
                  width: currentLayoutWidth, // Keep in CM
                  height: currentLayoutHeight, // Keep in CM
                  isBackground: true,
                };
                json.push(backgroundElement);
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
                width: currentLayoutWidth, // Keep in CM
                height: currentLayoutHeight, // Keep in CM
                isBackground: true,
              };
              json.push(defaultBackground);
            }
            // If there's already a background element in JSON but no badge.backgroundImage,
            // ensure its dimensions are consistent with currentLayoutWidth/Height.
            else if (backgroundElementIndex !== -1 && !backgroundImageUrl) {
              json[backgroundElementIndex] = {
                ...json[backgroundElementIndex],
                width: currentLayoutWidth, // Force layout dimensions in CM
                height: currentLayoutHeight, // Force layout dimensions in CM
                positionX: 0,
                positionY: 0,
                src: json[backgroundElementIndex].src || noimage, // ensure src if somehow missing
              };
            }

            console.log("🎯 Badge elements loaded successfully!");
            console.log("📐 Layout dimensions:", currentLayoutWidth, "x", currentLayoutHeight, "cm");
            console.log("📦 Total elements:", json.length);
            json.forEach((element, index) => {
              if (element.type === "background") {
                console.log(`  ${index}. 🖼️  ${element.type}: ${element.width}cm x ${element.height}cm`);
              } else {
                console.log(`  ${index}. ✨ ${element.type}: pos(${element.positionX}cm, ${element.positionY}cm), size(${element.width}cm x ${element.height}cm)`);
                if (element.type === "qr") {
                  console.log(`      QR: "${element.qrValue}", display size: ${element.size}px`);
                }
                if (element.type === "text") {
                  console.log(`      Text: "${element.content}", color: ${element.color}`);
                }
              }
            });

            setPosterData(newPosterData);
            setInitialPosterData(newPosterData);
            setElements(json);
            setInitialElements(json);
            setDefaultWidth(currentLayoutWidth);
            setDefaultHeight(currentLayoutHeight);
            
            // Fix timing issue: Wait for DOM to be ready before applying zoom
            setTimeout(() => {
              handleZoomMode("fit", currentLayoutWidth, currentLayoutHeight);
            }, 100);
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

  // Function to generate an image from a color
  const generateColorImage = async (color, width, height) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Convert cm to pixels (assuming 300 DPI for high quality)
      const pixelWidth = width * 118.11; // 300 DPI: 1 cm = 118.11 pixels
      const pixelHeight = height * 118.11;
      
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      
      // Fill canvas with the selected color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, pixelWidth, pixelHeight);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], `background-${color.replace('#', '')}.png`, {
          type: 'image/png',
          lastModified: Date.now()
        });
        resolve(file);
      }, 'image/png', 1.0);
    });
  };

  // Function to handle background color change
  const handleBackgroundColorChange = async (color) => {
    setBackgroundColor(color);
    
    // Generate colored image with badge dimensions
    const colorFile = await generateColorImage(color, posterData.layoutWidth, posterData.layoutHeight);
    const fileUrl = URL.createObjectURL(colorFile);
    
    // Save history before changing background image
    saveHistory(elements, posterData);
    
    setNewFile([colorFile]);
    setPreviewImage(fileUrl);

    // We don't set layout dimensions from the image anymore. They are fixed.

    if (type === "badge" && badgeId) {
      try {
        setLoaderBox(true);
        const badgeData = {
          id: badgeId,
          backgroundImage: colorFile,
          builderData: JSON.stringify(elements),
          layoutHeight: posterData.layoutHeight, // in cm
          layoutWidth: posterData.layoutWidth, // in cm
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
          setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: serverImageUrl } : el)));
        } else {
          // Fallback: use the blob URL temporarily
          setPosterData((prev) => ({
            ...prev,
            backgroundImage: fileUrl,
          }));
          setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: fileUrl } : el)));
        }
      } catch (error) {
        console.error("Error saving background color:", error);
        // Fallback: use the blob URL temporarily
        setPosterData((prev) => ({
          ...prev,
          backgroundImage: fileUrl,
        }));
        setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: fileUrl } : el)));
      } finally {
        setLoaderBox(false);
      }
    } else {
      // For non-badge types, just update locally
      setPosterData((prev) => ({
        ...prev,
        backgroundImage: fileUrl,
      }));
      setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: fileUrl } : el)));
    }
  };

  const handleFileChange = async (e) => {
    const { files } = e.target;
    if (files && files[0]) {
      const fileUrl = URL.createObjectURL(files[0]);
      
      // Save history before changing background image
      saveHistory(elements, posterData);
      
      setNewFile(files);
      setPreviewImage(fileUrl);

      // We don't set layout dimensions from the image anymore. They are fixed.

      if (type === "badge" && badgeId) {
        try {
          setLoaderBox(true);
          const badgeData = {
            id: badgeId,
            backgroundImage: files[0],
            builderData: JSON.stringify(elements),
            layoutHeight: posterData.layoutHeight, // in cm
            layoutWidth: posterData.layoutWidth, // in cm
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
            setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: serverImageUrl } : el)));
          } else {
            // Fallback: use the blob URL temporarily
            setPosterData((prev) => ({
              ...prev,
              backgroundImage: fileUrl,
            }));
            setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: fileUrl } : el)));
          }
        } catch (error) {
          console.error("Error saving background image:", error);
          // Fallback: use the blob URL temporarily
          setPosterData((prev) => ({
            ...prev,
            backgroundImage: fileUrl,
          }));
          setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: fileUrl } : el)));
        } finally {
          setLoaderBox(false);
        }
      } else {
        // For non-badge types or when badgeId is not available, use blob URL temporarily
        setPosterData((prev) => ({
          ...prev,
          backgroundImage: fileUrl,
        }));
        setElements((prevElements) => prevElements.map((el) => (el.type === "background" ? { ...el, src: fileUrl } : el)));
      }
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
      // Treat text-like input types as text elements in the badge builder
      case "email":
      case "mobilenumber":
      case "number":
      case "textarea":
      case "date":
      case "time":
      case "datetime":
      case "password":
      case "url":
      case "phone":
      case "tel":
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
        // Fallback to text for any unrecognized field types
        addTextElement(preset, label, varName);
        break;
    }
  };

  const addTextElement = (preset, label, varName) => {
    let content = "Sample Text";
    let fontSize = 16;
    let elementWidth = 5.3; // ~200px in CM
    let elementHeight = 1.3; // ~50px in CM
    let color = "#000000";

    switch (preset) {
      case "name":
        content = "Sample Name";
        fontSize = 28;
        elementHeight = 1.5;
        color = "#FFFFFF"; // White for better visibility on dark backgrounds
        break;
      case "designation":
        content = "Sample Designation";
        fontSize = 16;
        elementHeight = 1.3;
        color = "#FFFFFF";
        break;
      case "company":
        content = "Sample Company";
        fontSize = 20;
        elementHeight = 1.3;
        color = "#FFFFFF";
        break;
      case "contact":
        content = "contact@example.com";
        fontSize = 14;
        elementHeight = 1.3;
        color = "#FFFFFF";
        break;
      case "event":
        content = "Sample Event";
        fontSize = 20;
        elementHeight = 1.4;
        color = "#FFFFFF";
        break;
      case "ticket":
        content = "Sample Ticket";
        fontSize = 24;
        elementHeight = 1.3;
        color = "#FFFFFF";
        break;
      default:
        elementHeight = 1.3;
        break;
    }

    // Position is relative to canvas size (all in CM)
    const canvasWidthCM = posterData.layoutWidth || defaultWidth;
    const canvasHeightCM = posterData.layoutHeight || defaultHeight;
    const canvasCenterX = canvasWidthCM / 2;
    const canvasCenterY = canvasHeightCM / 2;
    const positionX = canvasCenterX - elementWidth / 2;
    const positionY = canvasCenterY - elementHeight / 2;

    const newElement = {
      id: Date.now(),
      type: "text",
      label: label || "Text Element",
      var: varName || "text",
      content: label || content,
      color: color,
      fontSize: fontSize,
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "center",
      alignContent: "center",
      lineHeight: fontSize * 1.2,
      positionX: positionX, // Centered X
      positionY: positionY, // Centered Y
      width: elementWidth,
      height: elementHeight,
      preset: preset,
    };
    // Save history before adding element
    saveHistory(elements, posterData);
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
    console.log("Added text element:", newElement);
  };

  const addImageElement = (preset, label, varName) => {
    let width = 2.6; // ~100px in CM
    let height = 2.6; // ~100px in CM
    let borderRadius = 0;

    switch (preset) {
      case "profile":
        width = 4.0; // ~150px in CM
        height = 4.0; // ~150px in CM
        borderRadius = 2.0; // ~75px in CM
        break;
      case "logo":
        width = 5.3; // ~200px in CM
        height = 2.1; // ~80px in CM
        break;
      default:
        break;
    }

    // Position is relative to canvas size (all in CM)
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
    // Save history before adding element
    saveHistory(elements, posterData);
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const addSelectElement = (preset, label, varName) => {
    const elementWidth = 5.3; // ~200px in CM
    const elementHeight = 1.3; // ~50px in CM

    // Position is relative to canvas size (all in CM)
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
    // Save history before adding element
    saveHistory(elements, posterData);
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const addVideoElement = () => {
    const elementWidth = 7.9; // ~300px in CM
    const elementHeight = 5.3; // ~200px in CM

    // Position is relative to canvas size (all in CM)
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
    // Save history before adding element
    saveHistory(elements, posterData);
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const addQRElement = (label, varName) => {
    const elementWidth = 4.0; // ~150px in CM
    const elementHeight = 4.0; // ~150px in CM (QR codes are typically square)

    // Position is relative to canvas size (all in CM)
    const canvasCenterX = (posterData.layoutWidth || defaultWidth) / 2;
    const canvasCenterY = (posterData.layoutHeight || defaultHeight) / 2;
    const positionX = canvasCenterX - elementWidth / 2;
    const positionY = canvasCenterY - elementHeight / 2;

    const newElement = {
      id: Date.now(),
      type: "qr",
      label: label || "QR Code",
      positionX: positionX, // Centered X (in CM)
      positionY: positionY, // Centered Y (in CM)
      width: elementWidth, // in CM
      height: elementHeight, // in CM
      var: varName || "qrcode",
      // qrValue: "https://example.com", // Default QR value
      bgColor: "#FFFFFF",
      fgColor: "#000000",
      level: "L",
      includeMargin: true,
      size: elementWidth * 37.795, // Convert CM to pixels for qrcode.react
    };
    // Save history before adding element
    saveHistory(elements, posterData);
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
    console.log("Added QR element:", newElement);
  };

  const updateElement = (id, updatedProperties) => {
    setElementsUpdated(true);
    setElements((prevElements) => {
      const newElements = prevElements.map((el) => (el.id === id ? { ...el, ...updatedProperties } : el));
      // Save history before updating
      saveHistory(prevElements, posterData);
      return newElements;
    });
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

    // Save history before moving layer
    saveHistory(elements, posterData);
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

    // Save history before removing element
    saveHistory(elements, posterData);
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
                layoutHeight: posterData.layoutHeight, // in cm
                slug: posterData.slug,
                layoutWidth: posterData.layoutWidth, // in cm
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
                layoutHeight: posterData.layoutHeight, // in cm
                slug: posterData.slug,
                layoutWidth: posterData.layoutWidth, // in cm
                title: posterData.title,
                description: posterData.description,
              },
              "advocacy-poster"
            );
          }
          // setMessage({ content: "Advocacy poster published successfully!", type: 0, icon: "success" });
          fetchPosterData();
          toast.success("Advocacy poster published successfully!");
        } else {
          setMessage({ content: "Please enter a valid slug", type: 1, icon: "error" });
        }
      } else {
        // setMessage({ content: "Saving badge data...", type: 0, icon: "info" });
        await saveBadgeData();
        // setMessage({ content: "Badge published successfully!", type: 0, icon: "success" });
        toast.success("Badge published successfully!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setMessage({ content: "Error saving data", type: 1, icon: "error" });
    }
    setLoaderBox(false);
  };

  const saveBadgeData = async () => {
    let badgeData;

    // Prepare elements for saving - ensure all are in CM format
    const elementsToSave = elements.map((el) => {
      const elementCopy = { ...el };

      // Ensure background element matches layout dimensions
      if (el.type === "background") {
        elementCopy.width = posterData.layoutWidth || defaultWidth; // in CM
        elementCopy.height = posterData.layoutHeight || defaultHeight; // in CM
        elementCopy.positionX = 0;
        elementCopy.positionY = 0;
      }

      return elementCopy;
    });

    let builderDataToSave = JSON.stringify(elementsToSave);
    console.log("💾 Saving badge data - elements:", elementsToSave.length);

    if (newFile && newFile[0]) {
      badgeData = {
        id: badgeId,
        backgroundImage: newFile[0],
        builderData: builderDataToSave,
        layoutHeight: posterData.layoutHeight, // in cm
        layoutWidth: posterData.layoutWidth, // in cm
      };
    } else {
      // If no new file but we have a background image URL, ensure it's properly formatted
      if (posterData.backgroundImage && !posterData.backgroundImage.startsWith("blob:")) {
        // Update the background element in builder data to use the full URL for display
        const updatedElements = elementsToSave.map((el) => (el.type === "background" ? { ...el, src: posterData.backgroundImage } : el));
        builderDataToSave = JSON.stringify(updatedElements);
      }

      badgeData = {
        id: badgeId,
        builderData: builderDataToSave,
        layoutHeight: posterData.layoutHeight, // in cm
        layoutWidth: posterData.layoutWidth, // in cm
      };
    }

    if (ticketType === "SELECTED") {
      badgeData.badgeType = "SPECIFIC_TICKET";
      badgeData.tickets = selectedTickets;
    } else if (ticketType === "ALL") {
      badgeData.badgeType = "COMMON_TICKET";
    }

    console.log("💾 Badge data to save:", {
      layoutWidth: badgeData.layoutWidth,
      layoutHeight: badgeData.layoutHeight,
      elementsCount: elementsToSave.length,
    });

    await putData(badgeData, "badge");
    
    // Clear history after successful save/publish
    clearHistory();
  };

  // Create enhanced badge data that includes the current elements
  const enhancedBadgeData = {
    ...posterData,
    builderData: JSON.stringify(elements), // Current elements from the builder
    layoutWidth: posterData.layoutWidth || defaultWidth, // in cm
    layoutHeight: posterData.layoutHeight || defaultHeight, // in cm
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

    // Current poster dimensions are stored in CM. Convert to PX for viewport scaling math.
    const currentPosterWidthCM = newLayoutWidth !== undefined ? newLayoutWidth : posterData.layoutWidth || defaultWidth;
    const currentPosterHeightCM = newLayoutHeight !== undefined ? newLayoutHeight : posterData.layoutHeight || defaultHeight;
    const currentPosterWidthPX = currentPosterWidthCM * 37.795;
    const currentPosterHeightPX = currentPosterHeightCM * 37.795;

    if (mode === "fit") {
      const availableWidth = Math.floor(paddedContainerRef.current.clientWidth - SAFETY_MARGIN);
      const availableHeight = Math.floor(paddedContainerRef.current.clientHeight - SAFETY_MARGIN);

      if (currentPosterWidthPX <= 0 || currentPosterHeightPX <= 0 || availableWidth <= 0 || availableHeight <= 0) return;

      const scaleX = availableWidth / currentPosterWidthPX;
      const scaleY = availableHeight / currentPosterHeightPX;

      let cssScale = Math.min(scaleX, scaleY);
      // Round the target CSS scale factor down to 5 decimal places to combat floating point inaccuracies
      cssScale = Math.floor(cssScale * 100000) / 100000;

      let newScaleState = cssScale * 10;

      setScale(Math.max(0.1, Math.min(20, newScaleState)));
    } else if (mode === "fill") {
      const availableWidth = paddedContainerRef.current.clientWidth;
      const availableHeight = paddedContainerRef.current.clientHeight;

      if (currentPosterWidthPX <= 0 || currentPosterHeightPX <= 0 || availableWidth <= 0 || availableHeight <= 0) return;

      const scaleX = availableWidth / currentPosterWidthPX;
      const scaleY = availableHeight / currentPosterHeightPX;
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

  const handleCloseCloneModal = () => {
    setShowCloneModal(false);
    setSelectedCloneTickets([]);
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
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "general" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "bg-white text-gray-500 hover:bg-gray-50"}`}
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
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "details" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "bg-white text-gray-500 hover:bg-gray-50"}`}
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
              {/* {type === "badge" && (
                <div className="flex gap-1 ml-2">
                  <button onClick={() => setShowApplyModal(true)} className="px-2 py-1 text-[10px] font-medium text-[rgb(99,102,241)] bg-[rgb(238,242,255)] rounded hover:bg-[rgb(224,231,255)] transition-colors flex items-center gap-0.5" title="Apply current design to other tickets">
                    <Upload className="w-3 h-3" />
                    Apply
                  </button>
                  <button onClick={() => setShowCloneModal(true)} className="px-2 py-1 text-[10px] font-medium text-[rgb(99,102,241)] bg-[rgb(238,242,255)] rounded hover:bg-[rgb(224,231,255)] transition-colors flex items-center gap-0.5" title="Clone design from other tickets">
                    <Copy className="w-3 h-3" />
                    Clone
                  </button>
                  <button onClick={() => setShowImportModal(true)} className="px-2 py-1 text-[10px] font-medium text-[rgb(99,102,241)] bg-[rgb(238,242,255)] rounded hover:bg-[rgb(224,231,255)] transition-colors flex items-center gap-0.5" title="Import badge design">
                    <Upload className="w-3 h-3 rotate-180" />
                    Import
                  </button>
                </div>
              )} */}
            </div>
            <div className="space-y-4">
              {/* Background Layers Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 px-1">Background Layers</h4>
            <div className="space-y-1.5">
                  {elements
                    .map((element, index) => ({ element, index }))
                    .filter(({ element }) => {
                      // Background layers: background image, event, location, start date, end date, description, banner
                      return (
                        element.type === "background" ||
                        element.preset === "event" ||
                        element.preset === "location" ||
                        element.preset === "startDate" ||
                        element.preset === "endDate" ||
                        element.preset === "description" ||
                        element.preset === "banner"
                      );
                    })
                    .map(({ element, index }) => (
                <div
                  key={element.id}
                        draggable={true}
                  onDragStart={(e) => {
                    if (e.dataTransfer && e.currentTarget instanceof HTMLElement) {
                      e.dataTransfer.setDragImage(e.currentTarget, e.currentTarget.offsetWidth / 2, e.currentTarget.offsetHeight / 2);
                    }
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", element.id.toString());
                    setTimeout(() => {
                      setDraggedLayerIndex(index);
                    }, 0);
                  }}
                  onDragOver={(e) => {
                          e.preventDefault();
                    if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = "move";
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

              {/* Dynamic Layers Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 px-1">Dynamic Layers</h4>
                <div className="space-y-1.5">
                  {elements
                    .map((element, index) => ({ element, index }))
                    .filter(({ element }) => {
                      // Dynamic layers: all other elements except background layers
                      return !(
                        element.type === "background" ||
                        element.preset === "event" ||
                        element.preset === "location" ||
                        element.preset === "startDate" ||
                        element.preset === "endDate" ||
                        element.preset === "description" ||
                        element.preset === "banner"
                      );
                    })
                    .map(({ element, index }) => (
                      <div
                        key={element.id}
                        draggable={true}
                        onDragStart={(e) => {
                          if (e.dataTransfer && e.currentTarget instanceof HTMLElement) {
                            e.dataTransfer.setDragImage(e.currentTarget, e.currentTarget.offsetWidth / 2, e.currentTarget.offsetHeight / 2);
                          }
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", element.id.toString());
                          setTimeout(() => {
                            setDraggedLayerIndex(index);
                          }, 0);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = "move";
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
        </div>
      </div>

      {/* Center Canvas */}
      <div className="flex flex-col h-full bg-[rgb(249,250,251)] overflow-hidden">
        {/* Preview Mode Indicator */}
        {isPreviewMode && (
          <div className="bg-orange-100 border-l-4 border-orange-500 p-3 mx-4 mt-2 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-4 h-4 text-orange-500 mr-2" />
                <p className="text-sm text-orange-700">
                  <strong>Preview Mode:</strong> Showing real data from ticket registration
                  {previewData && (
                    <span className="ml-2 text-xs">
                      ({previewData.firstName || previewData.name || previewData.fullname || 'Sample User'})
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={handlePreview}
                className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-200 hover:bg-orange-300 rounded transition-colors flex items-center gap-1"
                title="Exit preview mode"
              >
                <Eye className="w-3 h-3" />
                Exit Preview
              </button>
            </div>
          </div>
        )}
        
        <div ref={canvasViewportRef} className="flex-1 relative overflow-hidden">
          {/* This is the div that scrolls and has padding. We need its inner dimensions. */}
          <div ref={paddedContainerRef} className="absolute inset-0 overflow-auto flex items-center justify-center p-10">
            <div
              ref={posterRef}
              className="bg-white shadow-md relative overflow-hidden rounded-sm transition-transform duration-300"
              style={{
                width: `${(posterData.layoutWidth || defaultWidth) * 37.795}px`,
                height: `${(posterData.layoutHeight || defaultHeight) * 37.795}px`,
                // Translate first (in px), then scale. This keeps panning independent of zoom.
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${scale / 10})`,
                transformOrigin: "center center",
              }}
            >
              {/* Render background first with lowest z-index */}
              {elements
                .filter((element) => element.type === "background")
                .map((element) => (
                  <div
                    key={element.id}
                    className="w-full h-full absolute inset-0"
                    style={{
                      zIndex: 1,
                      position: "absolute",
                    }}
                  >
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
                ))}

              {/* Render all other elements with higher z-index */}
              {elements
                .filter((element) => element.type !== "background")
                .map((element, index) => (
                  <Rnd
                    key={element.id}
                    size={{
                      width: Math.max(1, element.width * 37.795), // Convert CM to pixels for display, ensure minimum 1px
                      height: Math.max(1, element.height * 37.795), // Convert CM to pixels for display, ensure minimum 1px
                    }}
                    position={{
                      x: (element.positionX || 0) * 37.795, // Convert CM to pixels for display
                      y: (element.positionY || 0) * 37.795, // Convert CM to pixels for display
                    }}
                    onMouseDown={() => {
                      console.log("Element clicked:", element.id, "Position:", element.positionX, element.positionY, "Type:", element.type);
                      handleElementClick(element.id);
                    }}
                    bounds="parent"
                    enableUserSelectHack={true}
                    scale={scale / 10}
                    lockAspectRatio={element.lockAspectRatio || false}
                    onDrag={(e, d) => {
                      updateElement(element.id, {
                        positionX: d.x / 37.795, // Convert pixels back to CM for storage
                        positionY: d.y / 37.795, // Convert pixels back to CM for storage
                      });
                    }}
                    onResize={(e, direction, ref, delta, position) => {
                      let newWidth = ref.offsetWidth / 37.795; // Convert pixels to CM
                      let newHeight = ref.offsetHeight / 37.795; // Convert pixels to CM
                      let newBorderRadius = element.borderRadius;
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
                        // Keep existing fontSize and lineHeight
                      }

                      updateElement(element.id, {
                        width: newWidth, // Store in CM
                        height: newHeight, // Store in CM
                        positionX: position.x / 37.795, // Convert pixels to CM
                        positionY: position.y / 37.795, // Convert pixels to CM
                        borderRadius: newBorderRadius,
                        fontSize: newFontSize,
                        lineHeight: newLineHeight,
                      });
                    }}
                    className={`${selectedElementId === element.id ? "border-2 border-[rgb(99,102,241)]" : "border-2 border-dashed border-[rgb(229,231,235)]"} transition-all duration-200`}
                    style={{
                      zIndex: 100 + index, // Start from 100, incrementing for each element
                      position: "absolute",
                    }}
                  >
                    {element.type === "text" ? (
                      <div
                        className="w-full h-full select-none p-1 flex items-center justify-center"
                        style={{
                          color: element.color || "#000000",
                          fontSize: `${element.fontSize || 16}px`,
                          fontWeight: element.fontWeight || "normal",
                          fontStyle: element.fontStyle || "normal",
                          textAlign: element.textAlign || "center",
                          alignItems: element.alignContent === "start" ? "flex-start" : element.alignContent === "end" ? "flex-end" : "center",
                          justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center",
                          lineHeight: `${element.lineHeight || (element.fontSize || 16) * 1.2}px`,
                          wordWrap: "break-word",
                          overflow: "hidden",
                        }}
                      >
                        <span>{element.content || "Sample Text"}</span>
                      </div>
                    ) : element.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <video
                          src={element.src || noimage}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          style={{
                            borderRadius: `${element.borderRadius * 37.795}px`,
                            border: element.borderWidth ? `${element.borderWidth * 37.795}px solid ${element.borderColor}` : "none",
                          }}
                          controls={element.controls}
                          autoPlay={element.autoplay}
                          loop={element.loop}
                          muted={element.muted}
                        />
                      </div>
                    ) : element.type === "qr" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <QRCodeSVG
                          value={element.qrValue || "https://example.com"}
                          size={Math.min(element.width * 37.795, element.height * 37.795)} // Use full available space
                          bgColor={element.bgColor || "#FFFFFF"}
                          fgColor={element.fgColor || "#000000"}
                          level={element.level || "L"}
                          includeMargin={false}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        {element.src ? (
                          <img
                            src={element.src}
                            alt="Element"
                            className="w-full h-full object-cover select-none pointer-events-none"
                            style={{
                              borderRadius: `${(element.borderRadius || 0) * 37.795}px`,
                              border: element.borderWidth ? `${element.borderWidth * 37.795}px solid ${element.borderColor || "#000000"}` : "none",
                              clipPath: element.clipPathValue && element.clipPathValue !== "none" ? element.clipPathValue : undefined,
                            }}
                            onError={(e) => {
                              e.currentTarget.src = noimage;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-300 bg-gray-50">
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <span>Upload Image</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Rnd>
                ))}
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
                onChange={(e) => handleInputChange("layoutWidth", parseFloat(e.target.value))}
                className="w-20 px-2 py-1 text-xs border border-[rgb(229,231,235)] rounded-md"
                placeholder="Width"
              />
              <span className="text-xs text-gray-500">×</span>
              <input
                type="number"
                value={posterData.layoutHeight || defaultHeight}
                onChange={(e) => handleInputChange("layoutHeight", parseFloat(e.target.value))}
                className="w-20 px-2 py-1 text-xs border border-[rgb(229,231,235)] rounded-md"
                placeholder="Height"
              />
              <span className="text-xs text-gray-400 pl-1">cm</span>
            </div>

            <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setScale(Math.max(0.1, scale - 1))} disabled={scale <= 0.1}>
              <ZoomOut className="w-4.5 h-4.5" />
            </button>

            <div className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[80px] text-center border-l border-r border-[rgb(229,231,235)]">{Math.round(scale * 10)}%</div>

            <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setScale(Math.min(20, scale + 1))} disabled={scale >= 20}>
              <ZoomIn className="w-4.5 h-4.5" />
            </button>

            <button
              className={`p-2 rounded-lg transition-colors ${
                historyIndex > 0 
                  ? "text-gray-700 hover:bg-gray-50" 
                  : "text-gray-300 cursor-not-allowed"
              }`}
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              className={`p-2 rounded-lg transition-colors ${
                historyIndex < history.length - 1 
                  ? "text-gray-700 hover:bg-gray-50" 
                  : "text-gray-300 cursor-not-allowed"
              }`}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <RotateCcw className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div ref={rightPanelRef} className="border-l border-[rgb(229,231,235)] bg-white flex flex-col h-full overflow-hidden">
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
                  <>
                    <button
                      onClick={handlePreview}
                      className={`px-2 py-1 text-[10px] font-medium text-white rounded transition-colors flex items-center gap-0.5 ${
                        isPreviewMode 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      title={isPreviewMode ? "Exit preview mode" : "Preview badge with sample data"}
                      style={{ display: isPreviewMode ? 'none' : 'flex' }}
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                  </>
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
                            {/* <div>
                              <label className="text-xs font-medium text-[rgb(17,24,39)]">Label Name</label>
                              <input
                                type="text"
                                value={element.label}
                                onChange={(e) => updateElement(element.id, { label: e.target.value })}
                                className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Enter label name"
                              />
                            </div> */}
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
                                  className={`p-2 rounded-md transition-colors ${element.alignContent === "center" ? "bg-[rgb(238,242,255)] text-[rgb(99,102,241)]" : "text-gray-500 hover:bg-gray-50"}`}
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
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Width (cm)</label>
                              <input
                                type="number"
                                min={0.1}
                                max={posterData.layoutWidth}
                                step={0.1}
                                value={element.width}
                                onChange={(e) => updateElement(element.id, { width: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Width"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Height (cm)</label>
                              <input
                                type="number"
                                min={0.1}
                                max={posterData.layoutHeight}
                                step={0.1}
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
                              {element.preset !== "banner" && (
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
                                </div>
                              )}

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
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Border Radius (cm)</label>
                              <input
                                type="number"
                                min={0}
                                max={5}
                                step={0.1}
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
                                          ${element.width === element.height && element.borderRadius === 0 && (!element.clipPathValue || element.clipPathValue === "none") ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300" : "border border-gray-200"}`}
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
                                          ${element.width === element.height && element.borderRadius === element.width / 2 && (!element.clipPathValue || element.clipPathValue === "none") ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300" : "border border-gray-200"}`}
                              title="Circle Shape"
                            >
                              <Circle className="w-6 h-6" />
                              <span className="mt-1 text-xs">Circle</span>
                            </button>

                            {/* Rectangle Button */}
                            <button
                              onClick={() => {
                                updateElement(element.id, {
                                  borderRadius: 0,
                                  clipPathValue: "none",
                                });
                              }}
                              className={`flex flex-col items-center justify-center p-2 aspect-square rounded-md transition-colors text-gray-600 hover:bg-gray-100 \
                                          ${element.borderRadius === 0 && (!element.clipPathValue || element.clipPathValue === "none") && (element.width !== element.height || (element.width === element.height && element.borderRadius !== element.width / 2)) ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300" : "border border-gray-200"}`}
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
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Border Radius (cm)</label>
                              <input
                                type="number"
                                min={0}
                                max={5}
                                step={0.1}
                                value={element.borderRadius}
                                onChange={(e) => updateElement(element.id, { borderRadius: Number(e.target.value) })}
                                className="w-full px-2 py-1 text-xs text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Border Radius"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Border Width (cm)</label>
                              <input
                                type="number"
                                min={0}
                                max={2}
                                step={0.1}
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
                            {/* <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">QR Value</label>
                              <input
                                type="text"
                                value={element.qrValue}
                                onChange={(e) => updateElement(element.id, { qrValue: e.target.value })}
                                className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                placeholder="Enter URL or text"
                              />
                            </div> */}

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

                            {/* <div>
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
                            </div> */}
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
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Width (cm)</label>
                              <input
                                type="number"
                                value={element.width}
                                step={0.1}
                                onChange={(e) => {
                                  const newWidth = Number(e.target.value);
                                  const updates = { width: newWidth };
                                  if (element.type === "qr") {
                                    updates.size = newWidth * 37.795;
                                  }
                                  updateElement(element.id, updates);
                                }}
                                className="w-full px-2 py-1.5 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                min="0.5"
                                max="15"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Height (cm)</label>
                              <input
                                type="number"
                                value={element.height}
                                step={0.1}
                                onChange={(e) => {
                                  const newHeight = Number(e.target.value);
                                  const updates = { height: newHeight };
                                  if (element.type === "qr") {
                                    updates.size = newHeight * 37.795;
                                  }
                                  updateElement(element.id, updates);
                                }}
                                className="w-full px-2 py-1.5 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                                min="0.5"
                                max="15"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Position X (cm)</label>
                              <input
                                type="number"
                                value={element.positionX}
                                step={0.1}
                                onChange={(e) => updateElement(element.id, { positionX: Number(e.target.value) })}
                                className="w-full px-2 py-1.5 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Position Y (cm)</label>
                              <input
                                type="number"
                                value={element.positionY}
                                step={0.1}
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
                      <label className="block mb-2 text-xs font-medium text-[rgb(17,24,39)]">Background Type</label>
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => {
                            setBackgroundType("image");
                            // Clear preview when switching to image mode
                            if (backgroundType === "color") {
                              setPreviewImage(null);
                            }
                          }}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            backgroundType === "image"
                              ? "bg-[rgb(99,102,241)] text-white"
                              : "bg-[rgb(238,242,255)] text-[rgb(99,102,241)] hover:bg-[rgb(224,231,255)]"
                          }`}
                        >
                          <ImageIcon className="w-4 h-4" />
                          Image
                        </button>
                        <button
                          onClick={() => {
                            setBackgroundType("color");
                          }}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            backgroundType === "color"
                              ? "bg-[rgb(99,102,241)] text-white"
                              : "bg-[rgb(238,242,255)] text-[rgb(99,102,241)] hover:bg-[rgb(224,231,255)]"
                          }`}
                        >
                          <div className="w-4 h-4 rounded border border-white shadow-sm" style={{ backgroundColor: backgroundColor }} />
                          Color
                        </button>
                      </div>

                      {backgroundType === "image" ? (
                        <div>
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
                        </div>
                      ) : (
                        <div>
                          <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Background Color</label>
                          <div className="flex gap-3 mb-3">
                            <input
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => handleBackgroundColorChange(e.target.value)}
                              className="w-16 h-10 p-1 border border-[rgb(229,231,235)] rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={backgroundColor}
                              onChange={(e) => {
                                if (/^#[0-9A-F]{6}$/i.test(e.target.value) || e.target.value === "") {
                                  setBackgroundColor(e.target.value);
                                }
                              }}
                              onBlur={(e) => {
                                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                  handleBackgroundColorChange(e.target.value);
                                }
                              }}
                              placeholder="#ffffff"
                              className="flex-1 px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                            />
                          </div>
                          
                          {/* Preset Colors */}
                          <div className="mb-3">
                            <label className="block mb-2 text-xs font-medium text-[rgb(17,24,39)]">Quick Colors</label>
                            <div className="flex gap-2 flex-wrap">
                              {[
                                "#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6", "#ced4da",
                                "#6c757d", "#495057", "#343a40", "#212529", "#000000",
                                "#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5",
                                "#2196f3", "#1e88e5", "#1976d2", "#1565c0", "#0d47a1",
                                "#f3e5f5", "#e1bee7", "#ce93d8", "#ba68c8", "#ab47bc",
                                "#9c27b0", "#8e24aa", "#7b1fa2", "#6a1b9a", "#4a148c",
                                "#e8f5e8", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a",
                                "#4caf50", "#43a047", "#388e3c", "#2e7d32", "#1b5e20",
                                "#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726",
                                "#ff9800", "#fb8c00", "#f57c00", "#ef6c00", "#e65100",
                                "#ffebee", "#ffcdd2", "#ef9a9a", "#e57373", "#ef5350",
                                "#f44336", "#e53935", "#d32f2f", "#c62828", "#b71c1c"
                              ].map((color) => (
                                <button
                                  key={color}
                                  onClick={() => handleBackgroundColorChange(color)}
                                  className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                                    backgroundColor === color ? "border-[rgb(99,102,241)] shadow-lg" : "border-gray-300 hover:border-gray-400"
                                  }`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
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
                          <p className="mt-1.5 text-xs text-gray-500">Choose a color to generate a background image with your badge dimensions</p>
                        </div>
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
                  {/* <div>
                    <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Description</label>
                    <textarea
                      value={posterData.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)] min-h-[100px] resize-y"
                      placeholder="Enter poster description"
                    />
                  </div> */}
                  {/* <div>
                    <label className="block mb-1.5 text-xs font-medium text-[rgb(17,24,39)]">Slug</label>
                    <input
                      type="text"
                      value={posterData.slug || ""}
                      onChange={(e) => handleInputChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      className="w-full px-3 py-2 text-sm text-[rgb(17,24,39)] border border-[rgb(229,231,235)] rounded-md focus:outline-none focus:border-[rgb(99,102,241)]"
                      placeholder="enter-slug-here"
                    />
                    <p className="mt-1 text-xs text-gray-500">URL-friendly version of the title. Use hyphens to separate words.</p>
                  </div> */}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-bg-white border-t border-stroke-soft py-3 px-4 sticky bottom-0 flex justify-end gap-3">
          {elementsUpdated && (
            <button
              onClick={discardChanges}
              className="px-4 py-2 text-sm font-medium text-text-main bg-bg-white border border-stroke-soft rounded-lg hover:bg-bg-soft transition-colors"
              data-testid="discard-button"
            >
              Discard
            </button>
          )}
          {elementsUpdated && (
            <button
              onClick={SaveData}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors bg-primary-base hover:bg-primary-dark"
              data-testid="publish-button"
              title="Save and publish"
            >
              Save
            </button>
          )}
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-bg-weak hover:bg-bg-soft text-text-main flex items-center gap-2"
            data-testid="print-button"
            title="Export or print badges"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
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
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${applyMode === "selected" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
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

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
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
                              console.log("Selected ticket for cloning:", {
                                ticketId: e.target.value,
                                ticketTitle: ticket.title,
                              });
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
                onClick={handleClone}
                disabled={selectedCloneTickets.length === 0 || eventTickets.length === 0}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clone Design
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print/Export Modal */}
      {showPrintModal && (
        <PrintBadge
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
