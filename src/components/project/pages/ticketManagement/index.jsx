import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getData, postData, putData } from "../../../../backend/api";
import { useUser } from "../../../../contexts/UserContext";
import { PageHeader, SubPageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import NoDataFound from "../../../core/list/nodata";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons";
import AutoForm from "../../../core/form";
import FormInput from "../../../core/input";
import CrudForm from "../../../core/list/create";
import PopupView from "../../../core/popupview";
import { Button, TabButtons } from "../../../core/elements";
import { Table, Tr, ListContainerBox, TrBody, Head, Td, Title, DataItem } from "../../../core/list/styles";
import { COMPARE_TYPES } from "../../../core/functions/conditions";
import CustomTooltip from "../../../core/tooltip";
import styled from "styled-components";
import ListTable from "../../../core/list/list";

// Custom styled wrapper for the registration form with proper spacing
const StyledFormWrapper = styled.div`
  /* Add custom styles for form fields spacing */
  .popup {
    padding: 1.5em !important;
  }
  
  /* Add margin and padding to all input containers */
  [class*="InputContainer"] {
    margin-bottom: 20px !important;
    padding: 0 !important;
  }
  
  /* Ensure toggle container has proper spacing */
  .checkbox {
    margin-bottom: 20px !important;
    padding: 8px 0 !important;
    
    /* Style the toggle container */
    > div {
      width: 100%;
      padding: 8px 0;
    }
  }
`;

// Wrapper component to handle toggle functionality and add custom styling
const RegistrationFormWrapper = ({ children, formInput, onSubmit }) => {
  useEffect(() => {
    // Add custom CSS for form field spacing and button styling
    const style = document.createElement('style');
    style.textContent = `
      /* Custom styles for ticket registration form */
      .ticket-registration-form .popup {
        padding: 1.5em !important;
      }
      
      .ticket-registration-form [class*="InputContainer"] {
        margin-bottom: 20px !important;
        padding: 0 !important;
      }
      
      /* Align checkbox container with other form fields - match input field alignment */
      .ticket-registration-form [class*="InputContainer"].checkbox {
        margin-bottom: 20px !important;
        padding: 0 !important;
        align-items: flex-start !important;
      }
      
      /* Remove any left padding/margin from checkbox label to align with input text */
      .ticket-registration-form [class*="InputContainer"].checkbox > label.checkbox {
        padding-left: 0 !important;
        margin-left: 0 !important;
        width: 100% !important;
      }
      
      /* Ensure checkbox and label align properly */
      .ticket-registration-form [class*="InputContainer"].checkbox > label.checkbox > div {
        display: flex !important;
        align-items: flex-start !important;
        gap: 8px !important;
      }
      
      /* Align footnote text with checkbox label text */
      .ticket-registration-form [class*="InputContainer"].checkbox [class*="footnote"],
      .ticket-registration-form [class*="InputContainer"].checkbox .footnote {
        padding-left: 0 !important;
        margin-left: 0 !important;
        margin-top: 4px !important;
      }
      
      /* Style form buttons to match custom Button component */
      .ticket-registration-form [class*="Footer"] {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        align-items: center;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid rgb(224, 224, 227);
      }
      
      /* Style Cancel button (type="close") - matches Button component with .close class */
      .ticket-registration-form [class*="Footer"] button.close,
      .ticket-registration-form [class*="Footer"] [type="close"],
      .ticket-registration-form [class*="Footer"] input[type="close"] {
        height: 40px !important;
        border-radius: 8px !important;
        background: white !important;
        color: rgb(107, 114, 128) !important;
        border: 1px solid rgb(226, 228, 233) !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        padding: 10px 15px !important;
        cursor: pointer !important;
        transition: all 0.5s ease !important;
        margin: 0 !important;
        width: fit-content !important;
        min-width: 100px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      .ticket-registration-form [class*="Footer"] button.close:hover,
      .ticket-registration-form [class*="Footer"] [type="close"]:hover,
      .ticket-registration-form [class*="Footer"] input[type="close"]:hover {
        background: rgb(249, 250, 251) !important;
        border-color: rgb(209, 213, 219) !important;
      }
      
      /* Style Submit button (type="submit" with css="theme") - matches Button component with .theme class */
      .ticket-registration-form [class*="Footer"] button.theme,
      .ticket-registration-form [class*="Footer"] [type="submit"].theme,
      .ticket-registration-form [class*="Footer"] input[type="submit"].theme,
      .ticket-registration-form [class*="Footer"] button[type="submit"] {
        height: 40px !important;
        border-radius: 8px !important;
        background: hsl(222.2, 47.4%, 11.2%) !important;
        color: white !important;
        border: 0 !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        padding: 10px 15px !important;
        cursor: pointer !important;
        transition: all 0.5s ease !important;
        margin: 0 !important;
        width: fit-content !important;
        min-width: 100px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
      }
      
      .ticket-registration-form [class*="Footer"] button.theme:hover:not(:disabled),
      .ticket-registration-form [class*="Footer"] [type="submit"].theme:hover:not(:disabled),
      .ticket-registration-form [class*="Footer"] input[type="submit"].theme:hover:not(:disabled),
      .ticket-registration-form [class*="Footer"] button[type="submit"]:hover:not(:disabled) {
        opacity: 0.9 !important;
      }
      
      .ticket-registration-form [class*="Footer"] button.theme:disabled,
      .ticket-registration-form [class*="Footer"] [type="submit"].theme:disabled,
      .ticket-registration-form [class*="Footer"] input[type="submit"].theme:disabled,
      .ticket-registration-form [class*="Footer"] button[type="submit"]:disabled {
        background: rgb(209, 213, 219) !important;
        color: rgb(156, 163, 175) !important;
        cursor: not-allowed !important;
        opacity: 0.6 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <div className="ticket-registration-form">{children}</div>;
};


// Utility function for logging
const logAction = (action, details = {}) => {
  console.log(`[Ticket Management] ${action}:`, {
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Shimmer components
const ShimmerStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-bg-white rounded-xl shadow-sm border border-stroke-soft p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-bg-weak rounded-lg"></div>
            <div className="w-16 h-6 bg-bg-weak rounded-full"></div>
          </div>
          <div className="w-24 h-4 bg-bg-weak rounded mb-2"></div>
          <div className="w-16 h-8 bg-bg-weak rounded mb-2"></div>
          <div className="w-32 h-3 bg-bg-weak rounded"></div>
        </div>
      </div>
    ))}
  </div>
);


// Main component
export default function TicketManagement(props) {
  const { exhibitorData } = props;
  console.log(props, "props");
  const user = useUser();
  const toast = useToast();

  const [passes, setPasses] = useState([]);
  const [registrationLinks, setRegistrationLinks] = useState([]);
  const [issuedPassesCounts, setIssuedPassesCounts] = useState({}); // Store issued passes count by ticket ID (referral registrations)
  const [totalRegistrationsCounts, setTotalRegistrationsCounts] = useState({}); // Store total registrations count by ticket ID
  const [isLoading, setIsLoading] = useState(true);
  const [currentExhibitorId, setCurrentExhibitorId] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketForNew, setSelectedTicketForNew] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [formFieldsLoading, setFormFieldsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [ticketsData, setTicketsData] = useState([]);
  const [registrationLinkModalOpen, setRegistrationLinkModalOpen] = useState(false);
  const [generatedRegistrationLink, setGeneratedRegistrationLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [linkGenerationModalOpen, setLinkGenerationModalOpen] = useState(false);
  const [selectedTicketForLink, setSelectedTicketForLink] = useState(null);
  const [linkQuantity, setLinkQuantity] = useState(1);
  // Track optional expiry for generated coupon/link
  const [linkEndDate, setLinkEndDate] = useState("");
  const [generatedCouponCode, setGeneratedCouponCode] = useState("");
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [referralRegistrations, setReferralRegistrations] = useState([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [activeReferralTab, setActiveReferralTab] = useState("registrations"); // Controls which referral table is visible

  // Get current exhibitor ID and event ID
  useEffect(() => {
    logAction("useEffect triggered for ID extraction", {
      props: props,
      user: user,
      exhibitorData: exhibitorData,
      propsUser: props?.user,
      propsUserUser: props?.user?.user,
    });

    const getCurrentExhibitorId = () => {
      // First, try to get from props.user.user._id (from props structure)
      if (props?.user?.user?._id) {
        logAction("Retrieved exhibitor ID from props.user.user._id", { exhibitorId: props.user.user._id });
        return props.user.user._id;
      }

      // Try to get from props.user.userId
      if (props?.user?.userId) {
        logAction("Retrieved exhibitor ID from props.user.userId", { exhibitorId: props.user.userId });
        return props.user.userId;
      }

      // Try to get from exhibitorData
      if (exhibitorData?._id) {
        logAction("Retrieved exhibitor ID from exhibitorData._id", { exhibitorId: exhibitorData._id });
        return exhibitorData._id;
      }

      // Try to get from user context
      if (user?._id) {
        logAction("Retrieved exhibitor ID from user context", { exhibitorId: user._id });
        return user._id;
      }

      return null;
    };

    const getCurrentEventId = () => {
      // First, try to get from props.user.user.event._id
      if (props?.user?.user?.event?._id) {
        logAction("Retrieved event ID from props.user.user.event._id", { eventId: props.user.user.event._id });
        return props.user.user.event._id;
      }

      // Try to get from exhibitorData.event._id
      if (exhibitorData?.event?._id) {
        logAction("Retrieved event ID from exhibitorData.event._id", { eventId: exhibitorData.event._id });
        return exhibitorData.event._id;
      }

      // Try to get from exhibitorData.event (if string)
      if (exhibitorData?.event && typeof exhibitorData.event === "string") {
        logAction("Retrieved event ID from exhibitorData.event (string)", { eventId: exhibitorData.event });
        return exhibitorData.event;
      }

      return null;
    };

    const exhibitorId = getCurrentExhibitorId();
    const eventId = getCurrentEventId();

    setCurrentExhibitorId(exhibitorId);
    setCurrentEventId(eventId);
  }, [props, user, exhibitorData]);

  // Fetch passes from exhibitor data
  const fetchPasses = async () => {
    if (!currentExhibitorId || !currentEventId) return;

    try {
      setIsLoading(true);

      logAction("Starting to fetch passes", {
        currentExhibitorId,
        currentEventId
      });

      // Fetch exhibitor data with passes configuration
      const exhibitorResponse = await getData({ id: currentExhibitorId }, "ticket-registration/exhibitor");

      logAction("Exhibitor data API response", {
        status: exhibitorResponse.status,
        success: exhibitorResponse.data?.success,
        hasPassesConfiguration: !!exhibitorResponse.data?.response?.passesConfiguration
      });

      if (exhibitorResponse.status === 200 && exhibitorResponse.data?.response) {
        const exhibitor = exhibitorResponse.data.response;
        const passesConfiguration = exhibitor?.passesConfiguration || [];
        const couponsIssued = exhibitor?.couponsIssued || [];

        logAction("Passes configuration received", {
          passesCount: passesConfiguration.length,
          passes: passesConfiguration,
          couponsIssued
        });

        // Transform passesConfiguration to passes format
        // passesConfiguration has: { ticket: { _id, title }, quantity, usedCount, _id }
        // We need to transform it to match the expected format
        const transformedPasses = passesConfiguration.map(passConfig => {
          // Find matching couponsIssued for this ticket
          const couponData = couponsIssued.find(
            c => normalizeId(c.ticket) === normalizeId(passConfig.ticket._id || passConfig.ticket)
          );

          return {
            _id: passConfig._id,
            ticket: passConfig.ticket, // Already has _id and title
            numberOfPasses: passConfig.quantity,
            usedCount: passConfig.usedCount || 0,
            couponsIssued: couponData?.count || 0,
            exhibitorCategory: exhibitor?.exhibitorCategory?._id || exhibitor?.exhibitorCategory,
            event: currentEventId
          };
        });

        setPasses(transformedPasses);
        logAction("Passes set successfully", { passesCount: transformedPasses.length });
      } else {
        logAction("Failed to fetch exhibitor data", {
          status: exhibitorResponse.status,
          data: exhibitorResponse.data
        });
        toast.error("Failed to load passes configuration");
        setPasses([]);
      }
    } catch (error) {
      logAction("Error fetching passes", { error: error.message, stack: error.stack });
      toast.error("Failed to load passes");
      setPasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch registration links for history view and avoiding undefined handler issues
  const fetchRegistrationLinks = useCallback(async () => {
    if (!currentExhibitorId || !currentEventId) return;

    try {
      setIsLoadingLinks(true);
      logAction("Fetching registration links", { currentExhibitorId, currentEventId });

      const response = await getData({ event: currentEventId, createdBy: currentExhibitorId }, "registration-link");

      logAction("Registration links API response", {
        status: response.status,
        success: response.data?.success,
        count: response.data?.response?.length || 0
      });

      if (response.status === 200 && response.data?.success) {
        const links = response.data.response || response.data.data || [];
        setRegistrationLinks(links);
        logAction("Registration links set successfully", { linksCount: links.length });
      } else {
        setRegistrationLinks([]);
      }
    } catch (error) {
      logAction("Error fetching registration links", { error: error.message, stack: error.stack });
      setRegistrationLinks([]);
    } finally {
      setIsLoadingLinks(false);
    }
  }, [currentEventId, currentExhibitorId]);

  // Fetch referral registrations (registered users)
  // const fetchReferralRegistrations = async () => {
  //   if (!currentExhibitorId) return;

  //   try {
  //     setIsLoadingReferrals(true);
  //     logAction("Fetching referral registrations", { currentExhibitorId });

  //     const response = await getData({ exhibitor: currentExhibitorId }, "exhibitor/referred-registrations");

  //     logAction("Referral registrations API response", { 
  //       status: response.status,
  //       success: response.data?.success,
  //       count: response.data?.response?.length || 0
  //     });

  //     if (response.status === 200 && response.data?.success) {
  //       const registrations = response.data.response || response.data.data || [];
  //       setReferralRegistrations(registrations);
  //       logAction("Referral registrations set successfully", { registrationsCount: registrations.length });
  //     } else {
  //       setReferralRegistrations([]);
  //     }
  //   } catch (error) {
  //     logAction("Error fetching referral registrations", { error: error.message, stack: error.stack });
  //     setReferralRegistrations([]);
  //   } finally {
  //     setIsLoadingReferrals(false);
  //   }
  // };

  // Helper function to normalize ID for comparison (handles both string and ObjectId)
  const normalizeId = (id) => {
    if (!id) return null;
    if (typeof id === "string") return id;
    if (id._id) return String(id._id);
    return String(id);
  };

  // Fetch issued passes count for each ticket (referral registrations)
  const fetchIssuedPassesCounts = async () => {
    if (!currentExhibitorId || !currentEventId) return;

    try {
      // Fetch all ticket registrations for the event
      // Include type parameter to get all ticket types, and userType to match our registrations
      const response = await getData(
        {
          event: currentEventId,
          type: "Ticket", // Include Ticket type registrations
          userType: "eventhex", // Match the userType we're creating
          skip: 0,
          limit: 1000 // Get all to count properly
        },
        "ticket-registration"
      );

      logAction("Fetching registrations for counts", {
        event: currentEventId,
        responseStatus: response.status,
        registrationsCount: response.data?.response?.length || 0
      });

      if (response.status === 200 && response.data?.success) {
        const registrations = response.data.response || response.data.data || [];
        const currentExhibitorIdStr = String(currentExhibitorId);

        logAction("Processing registrations", {
          totalRegistrations: registrations.length,
          sampleRegistration: registrations[0]
        });

        // Filter for referral registrations by this exhibitor
        // Check both referredExhibitor and parentExhibitor fields
        const referralRegistrations = registrations.filter((registration) => {
          const referredExhibitorId = normalizeId(registration.referredExhibitor);
          const parentExhibitorId = normalizeId(registration.parentExhibitor);

          const matchesExhibitor = referredExhibitorId === currentExhibitorIdStr ||
            parentExhibitorId === currentExhibitorIdStr;

          return registration.isReferral === true && matchesExhibitor;
        });

        // Count issued passes by ticket ID (referral registrations)
        const referralCounts = {};
        referralRegistrations.forEach((registration) => {
          const ticketId = normalizeId(registration.ticket);

          if (ticketId) {
            referralCounts[ticketId] = (referralCounts[ticketId] || 0) + 1;
          }
        });

        setIssuedPassesCounts(referralCounts);

        // Count total registrations by ticket ID (all registrations, not just referral)
        // This includes all registrations created via "Add New" button
        const totalCounts = {};
        registrations.forEach((registration) => {
          const ticketId = normalizeId(registration.ticket);

          if (ticketId) {
            totalCounts[ticketId] = (totalCounts[ticketId] || 0) + 1;
          }
        });

        logAction("Updated counts", {
          referralCounts,
          totalCounts
        });

        setTotalRegistrationsCounts(totalCounts);
      }
    } catch (error) {
      logAction("Error fetching issued passes counts", { error: error.message, stack: error.stack });
      // Don't show error toast as this is supplementary data
    }
  };

  // Fetch form fields for registration
  const fetchFormFields = useCallback(async (ticketId) => {
    if (!ticketId || !currentEventId) return;

    try {
      setFormFieldsLoading(true);
      // Fetch ticket form data which includes both event form fields and ticket form fields
      const response = await getData({ ticket: ticketId, eventId: currentEventId }, "ticket-form-data");
      if (response.status === 200 && response.data) {
        // Get countries from the response (used for mobile number fields)
        const countriesData = response.data.countries || response.data.ticketData?.event?.countries || [];
        setCountries(countriesData);

        // Combine event form fields (primaryFields) and ticket form fields (secondaryFields)
        // Event form fields come first, then ticket-specific fields
        const eventFormFields = response.data.eventForm || [];
        const ticketFormFields = response.data.response || response.data.data || [];

        // Combine both, event fields first (unless ticket type is "Form")
        // For regular tickets, include event form fields; for Form type tickets, only ticket fields
        const allFields = [...eventFormFields, ...ticketFormFields];

        setFormFields(allFields);
      }
    } catch (error) {
      logAction("Error fetching form fields", { error: error.message });
      toast.error("Failed to load form fields");
    } finally {
      setFormFieldsLoading(false);
    }
  }, [currentEventId]);

  // Add custom CSS to remove margin-top from Coupons title and make buttons responsive
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .referral-coupons-section [class*="PageHeader"],
      .referral-coupons-section [class*="page-header"],
      .referral-coupons-section h1,
      .referral-coupons-section h2,
      .referral-coupons-section h3,
      .referral-coupons-section [class*="Title"],
      .referral-coupons-section [class*="title"] {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      .referral-coupons-section > div:first-child {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      .referral-coupons-section [class*="ListTable"] > div:first-child,
      .referral-coupons-section [class*="list-table"] > div:first-child {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      /* Make buttons responsive within ticket cards */
      .grid > div [class*="InputContainer"] button,
      .grid > div button[type="button"],
      .grid > div [class*="FormInput"] button {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }
      
      @media (min-width: 640px) {
        .grid > div [class*="InputContainer"] button,
        .grid > div button[type="button"],
        .grid > div [class*="FormInput"] button {
          width: auto !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Load data when IDs are available
  useEffect(() => {
    if (currentExhibitorId && currentEventId) {
      fetchPasses();
      fetchRegistrationLinks();
      fetchIssuedPassesCounts();
      // fetchReferralRegistrations();
    }
  }, [currentExhibitorId, currentEventId]);

  // Update tickets data when passes or counts change
  useEffect(() => {
    if (passes.length > 0 || totalRegistrationsCounts) {
      const processedTickets = getTicketsWithPasses();
      setTicketsData(processedTickets);
    }
  }, [passes, totalRegistrationsCounts]);

  // Group passes by ticket and calculate total passes for each ticket
  const getTicketsWithPasses = () => {
    if (!passes || passes.length === 0) return [];

    // Group passes by ticket ID
    const ticketMap = new Map();

    passes.forEach((pass) => {
      // Get ticket ID - handle both populated object and string ID
      const ticketId = typeof pass.ticket === "string" ? pass.ticket : pass.ticket?._id;
      const ticketTitle = typeof pass.ticket === "object" && pass.ticket?.title
        ? pass.ticket.title
        : "Unknown Ticket";

      if (ticketId) {
        if (!ticketMap.has(ticketId)) {
          ticketMap.set(ticketId, {
            ticketId: ticketId,
            ticketTitle: ticketTitle,
            totalPasses: 0,
            usedPasses: 0,
            couponsIssued: 0,
            canAddMore: true, // Will be calculated after totalPasses is set
            passes: [],
          });
        }

        const ticketData = ticketMap.get(ticketId);
        ticketData.totalPasses += pass.numberOfPasses || 0;
        ticketData.usedPasses += pass.usedCount || 0;
        ticketData.couponsIssued += pass.couponsIssued || 0;
        ticketData.passes.push(pass);
      }
    });

    // Calculate canAddMore for each ticket
    const tickets = Array.from(ticketMap.values());
    tickets.forEach((ticket) => {
      ticket.canAddMore = ticket.usedPasses < ticket.totalPasses;
    });

    return tickets;
  };

  // Handle add new ticket registration
  const handleAddNew = useCallback(async (ticketData) => {
    // Check if we can add more registrations
    if (!ticketData.canAddMore) {
      toast.error(`Cannot add more registrations. You have reached the limit of ${ticketData.totalPasses} passes for this ticket.`);
      return;
    }

    setSelectedTicketForNew(ticketData);
    await fetchFormFields(ticketData.ticketId);
    setAddNewModalOpen(true);
  }, [fetchFormFields]);

  // Helper function to get cached domain from localStorage
  const getCachedEventDomain = useCallback((eventId) => {
    try {
      const key = `eventhex:domain:${eventId}`;
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }, []);

  // Generate random coupon code
  const generateCouponCode = () => {
    const prefix = "REF";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  // Handle register team member - open modal to select ticket and quantity
  const handleRegisterTeamMember = useCallback(async (ticketData) => {
    try {
      setSelectedTicketForLink(ticketData);
      setLinkQuantity(1);
      setLinkEndDate("");
      setLinkGenerationModalOpen(true);
    } catch (error) {
      logAction("Error opening link generation modal", { error: error.message, stack: error.stack });
      toast.error("Failed to open link generation");
    }
  }, [toast]);

  // Handle link generation with coupon creation
  const handleGenerateLinkWithCoupon = useCallback(async () => {
    try {
      const ticketId = selectedTicketForLink?.ticketId;

      if (!ticketId) {
        toast.error("Ticket ID not found");
        return;
      }

      if (!linkQuantity || linkQuantity < 1) {
        toast.error("Please enter a valid quantity");
        return;
      }

      // Generate coupon code
      const couponCode = generateCouponCode();
      setGeneratedCouponCode(couponCode);

      // Create coupon via API
      const couponData = {
        code: couponCode,
        type: "Percentage",
        value: 100, // 100% discount for complementary passes
        usageLimit: linkQuantity,
        availability: "Selected",
        tickets: [ticketId],
        exhibitor: currentExhibitorId,
        event: currentEventId,
        isActive: true,
        ...(linkEndDate ? { endDate: linkEndDate } : {})
      };

      const couponResponse = await postData(couponData, "coupen");

      if (couponResponse.status !== 200 && couponResponse.status !== 201) {
        toast.error("Failed to create coupon code");
        return;
      }

      // Get event domain
      const cachedDomain = getCachedEventDomain(currentEventId);
      let fullUrl;

      if (cachedDomain) {
        const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
        fullUrl = `${websiteUrl}/register/${ticketId}?coupon=${encodeURIComponent(couponCode)}`;
      } else {
        // Try to fetch domain from API
        try {
          const domainRes = await getData({ event: currentEventId }, "whitelisted-domains");
          if (domainRes?.status === 200) {
            const domains = domainRes.data.response || [];
            const defaultDomain = domains.find(d => d.isDefault) || domains[0];
            if (defaultDomain?.domain) {
              const websiteUrl = defaultDomain.domain.includes("http")
                ? defaultDomain.domain
                : `https://${defaultDomain.domain}`;
              fullUrl = `${websiteUrl}/register/${ticketId}?coupon=${encodeURIComponent(couponCode)}`;
              // Cache it
              localStorage.setItem(`eventhex:domain:${currentEventId}`, defaultDomain.domain);
            }
          }
        } catch (error) {
          logAction("Error fetching domain", { error: error.message });
        }

        // Fallback
        if (!fullUrl) {
          fullUrl = `https://example.com/register/${ticketId}?coupon=${encodeURIComponent(couponCode)}`;
          toast.warning("Using default domain. Please configure event domain.");
        }
      }

      // Save registration link to database
      const registrationLinkData = {
        code: couponCode,
        name: `${selectedTicketForLink?.ticketTitle} - Registration Link`,
        ticket: ticketId,
        event: currentEventId,
        createdBy: currentExhibitorId,
        maxRegistrations: linkQuantity,
        usedRegistrations: 0,
        isActive: true,
        ...(linkEndDate ? { endDate: linkEndDate } : {})
      };

      const registrationLinkResponse = await postData(registrationLinkData, "registration-link");

      if (registrationLinkResponse.status !== 200 && registrationLinkResponse.status !== 201) {
        logAction("Failed to save registration link", {
          status: registrationLinkResponse.status,
          data: registrationLinkResponse.data
        });
        // Don't fail the entire operation, just log it
        toast.warning("Link created but could not be saved to history");
      }

      // Close selection modal and open result modal
      setLinkGenerationModalOpen(false);
      setLinkEndDate("");
      setGeneratedRegistrationLink(fullUrl);
      setRegistrationLinkModalOpen(true);

      // Refresh registration links list
      await fetchRegistrationLinks();

      toast.success(`Coupon code created: ${couponCode}`);
      logAction("Registration link with coupon generated", { url: fullUrl, ticketId, couponCode, quantity: linkQuantity });
    } catch (error) {
      logAction("Error generating registration link with coupon", { error: error.message, stack: error.stack });
      toast.error("Failed to generate registration link");
    }
  }, [selectedTicketForLink, linkQuantity, linkEndDate, currentEventId, currentExhibitorId, getCachedEventDomain, toast]);

  // Note: Copy generated registration link using design system controls
  const handleCopyRegistrationLink = useCallback(async () => {
    if (!generatedRegistrationLink) {
      toast.error("Registration link is not available yet");
      return;
    }

    const handleCopySuccess = () => {
      setCopiedLink(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    };

    try {
      await navigator.clipboard.writeText(generatedRegistrationLink);
      handleCopySuccess();
    } catch (error) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = generatedRegistrationLink;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          handleCopySuccess();
          return;
        }
        throw new Error("execCommand failed");
      } catch (fallbackError) {
        toast.error("Failed to copy link");
      }
    }
  }, [generatedRegistrationLink, toast]);

  // Note: Open generated registration link in a new tab safely
  const handleOpenRegistrationLink = useCallback(() => {
    if (!generatedRegistrationLink) {
      toast.error("Registration link is not available yet");
      return;
    }
    window.open(generatedRegistrationLink, "_blank", "noopener,noreferrer");
  }, [generatedRegistrationLink, toast]);

  // Keep calculated remaining passes handy for helper text in the modal
  const linkPassesRemaining = useMemo(() => {
    if (!selectedTicketForLink) {
      return 0;
    }
    const total = selectedTicketForLink?.totalPasses ?? 0;
    const used = selectedTicketForLink?.usedPasses ?? 0;
    return Math.max(total - used, 0);
  }, [selectedTicketForLink]);

  // Attributes for ticket passes card view - defined after handlers to access them
  const ticketPassAttributes = useMemo(() => [
    // {
    //   type: "text",
    //   name: "ticketTitle",
    //   label: "Ticket Title",
    //   view: true,
    //   tag: true,
    //   export: false,
    //   render: (value, data) => {
    //     return (
    //       <div className="mb-6 relative">
    //         <SubPageHeader
    //           title={value || "Unknown Ticket"}
    //           icon="ticket"
    //           line={true}
    //           dynamicClass="text-xl font-semibold text-text-main"
    //         />
    //         <span className="bg-primary-light text-primary-dark text-xs font-medium px-2 py-1 rounded-full absolute top-0 right-0">Pass</span>
    //       </div>
    //     );
    //   },
    // },
    {
      type: "text",
      name: "totalPasses",
      label: "Total Tickets",
      view: true,
      tag: true,
      export: false,
      itemLabel: "Total Tickets",
      render: (value, data) => {
        return (
          <div className="flex items-center justify-between py-3 border-b border-stroke-soft w-full">
            <div className="flex items-center gap-3">
              <GetIcon icon="ticket" className="w-5 h-5 text-primary-base" />
              <span className="text-sm font-medium text-text-main">Total Tickets</span>
            </div>
            <span className="text-2xl font-bold text-primary-base ml-4">{value || 0}</span>
          </div>
        );
      },
    },
    {
      type: "text",
      name: "usedPasses",
      label: "Used Tickets",
      view: true,
      tag: true,
      export: false,
      itemLabel: "Used Tickets",
      render: (value, data) => {
        return (
          <div className="flex items-center justify-between py-3 border-b border-stroke-soft w-full">
            <div className="flex items-center gap-3">
              <GetIcon icon="ticket" className="w-5 h-5 text-state-success" />
              <span className="text-sm font-medium text-text-main">Used Tickets</span>
            </div>
            <span className="text-2xl font-bold text-state-success ml-4">{value || 0}</span>
          </div>
        );
      },
    },
    {
      type: "text",
      name: "couponsIssued",
      label: "Coupons Issued",
      view: true,
      tag: true,
      export: false,
      itemLabel: "Coupons Issued",
      render: (value, data) => {
        return (
          <div className="flex items-center justify-between py-3 border-b border-stroke-soft last:border-b-0 w-full">
            <div className="flex items-center gap-3">
              <GetIcon icon="ticket" className="w-5 h-5 text-primary-dark" />
              <span className="text-sm font-medium text-text-main">Coupons Issued</span>
            </div>
            <span className="text-2xl font-bold text-primary-dark ml-4">{value || 0}</span>
          </div>
        );
      },
    },
    {
      type: "text",
      name: "actions",
      label: "Actions",
      view: true,
      tag: true,
      export: false,
      inlineAction: true,
      render: (value, data) => {
        // Check if limit is reached (either used tickets or coupon codes exceeds total)
        const isLimitReached = data.usedPasses >= data.totalPasses || data.couponsIssued >= data.totalPasses;
        const shouldHideButtons = isLimitReached;

        // If buttons should be hidden, don't render anything
        if (shouldHideButtons) {
          return (
            <div className="w-full" style={{ marginTop: "16px" }}>
              <div className="text-sm text-text-sub px-4 py-2 rounded-lg flex items-center gap-2">
                <GetIcon icon="info" className="w-5 h-5 flex-shrink-0" />
                <span>Ticket limit reached. Cannot add more registrations.</span>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full min-w-0" style={{ marginBottom: "0" }}>
            <div className="w-full sm:w-auto sm:flex-shrink-0 min-w-0" style={{ maxWidth: '100%' }}>
            <Button
              icon="add"
              isDisabled={!data.canAddMore}
              value={!data.canAddMore ? "Add New (Limit Reached)" : "Add New"}
              ClickEvent={() => handleAddNew(data)}
              type="secondary"
              align=""
              title={
                !data.canAddMore
                  ? `Cannot add more registrations. Limit reached: ${data.usedPasses}/${data.totalPasses}`
                  : `Add new registration (${data.usedPasses}/${data.totalPasses} used)`
              }
            />
            </div>
            <div className="w-full sm:flex-1 min-w-0" style={{ maxWidth: '100%' }}>
            <Button
              // icon="user-plus"
                value="Registration Link"
              ClickEvent={() => handleRegisterTeamMember(data)}
              type="primary"
              align=""
            />
            </div>
          </div>
        );
      },
    },
  ], [handleAddNew, handleRegisterTeamMember]);

  // Static tab configuration for referral content switching
  const referralTabs = useMemo(
    () => [
      { key: "registrations", title: "Referral Registrations" },
      { key: "links", title: "Referral Links" },
    ],
    []
  );

  // Handle new ticket registration success
  const handleNewRegistrationSuccess = async (formValues, formState, lastUpdated) => {
    setIsLoading(true);
    console.log("🚀 handleNewRegistrationSuccess called", { formValues, formState, lastUpdated });

    try {
      setFormFieldsLoading(true);

      // Log form values for debugging
      logAction("Form submission started", { formValues, formState, selectedTicket: selectedTicketForNew });

      // Merge form values with required ticket and event data
      // formValues only contains the form field values, not the initial formValues we passed
      const submissionData = {
        ...formValues,
        // Ensure ticket and event are included (they should be in formValues but adding as fallback)
        ticket: formValues.ticket || String(selectedTicketForNew?.ticketId || ""),
        event: formValues.event || String(currentEventId || ""),
        userType: formValues.userType || "eventhex",
      };

      // Ensure ticket and event are strings
      submissionData.ticket = String(submissionData.ticket);
      submissionData.event = String(submissionData.event);

      // Ensure toggle/checkbox fields are properly converted to boolean
      if (submissionData.notifyUser !== undefined) {
        submissionData.notifyUser = Boolean(submissionData.notifyUser);
      }

      // Format authenticationId for mobile number field
      // The API expects authenticationId as { number: string, country: string }
      // AND phoneCode as a separate field (required by the model)
      // CrudForm sets phoneCode as a separate field when mobile number changes
      let phoneCodeValue = "";

      // Try to get phoneCode from various sources (priority order)
      if (submissionData.phoneCode && submissionData.phoneCode !== "" && submissionData.phoneCode !== "undefined" && submissionData.phoneCode !== "null") {
        phoneCodeValue = String(submissionData.phoneCode);
      } else if (formValues.phoneCode && formValues.phoneCode !== "" && formValues.phoneCode !== "undefined" && formValues.phoneCode !== "null") {
        phoneCodeValue = String(formValues.phoneCode);
      } else if (submissionData.authenticationId?.country && submissionData.authenticationId.country !== "" && submissionData.authenticationId.country !== "undefined" && submissionData.authenticationId.country !== "null") {
        phoneCodeValue = String(submissionData.authenticationId.country);
      }

      // If still no phoneCode, use default from countries array
      if (!phoneCodeValue && countries.length > 0) {
        phoneCodeValue = String(countries[0].phoneCode || "");
      }

      // Validate phoneCode is present
      if (!phoneCodeValue || phoneCodeValue === "" || phoneCodeValue === "undefined" || phoneCodeValue === "null") {
        toast.error("Please select a country code for the phone number.");
        return false;
      }

      // Format authenticationId
      if (submissionData.authenticationId) {
        if (typeof submissionData.authenticationId === "string" || typeof submissionData.authenticationId === "number") {
          submissionData.authenticationId = {
            number: String(submissionData.authenticationId),
            country: phoneCodeValue,
          };
        } else if (submissionData.authenticationId.number) {
          submissionData.authenticationId = {
            number: String(submissionData.authenticationId.number),
            country: phoneCodeValue,
          };
        }
      }

      // Set phoneCode as separate field (required by the model)
      submissionData.phoneCode = phoneCodeValue;

      // Validate required fields
      if (!submissionData.ticket || submissionData.ticket === "undefined" || submissionData.ticket === "null") {
        toast.error("Ticket ID is missing. Please try again.");
        return false;
      }
      if (!submissionData.event || submissionData.event === "undefined" || submissionData.event === "null") {
        toast.error("Event ID is missing. Please try again.");
        return false;
      }
      if (!submissionData.authenticationId || !submissionData.authenticationId.number) {
        toast.error("Phone number is required.");
        return false;
      }
      submissionData.isReferral = true; // Ensure this is set to false for new registrations
      submissionData.referredExhibitor = String(currentExhibitorId || "");
      console.log("📤 Sending data to API:", submissionData);

      // Make the API call for ticket registration using exhibitor endpoint
      const response = await postData(submissionData, "exhibitor/register-user");

      console.log("📥 API response:", response);
      logAction("API response received", { status: response.status, data: response.data });

      if (response.status === 200 || response.status === 201) {
        // Show success message
        if (response?.data?.customMessage?.length > 0) {
          toast.success(response.data.customMessage);
        } else if (response?.data?.message) {
          toast.success(response.data.message);
        } else {
          toast.success("Ticket registration created successfully!");
        }

        // Refresh data after successful registration
        // Add a small delay to ensure the database has been updated
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchPasses();
        await fetchIssuedPassesCounts(); // This also updates totalRegistrationsCounts
        await fetchReferralRegistrations(); // Refresh referral registrations list

        // Close modal and reset state
        setAddNewModalOpen(false);
        setSelectedTicketForNew(null);

        // Return true to indicate successful submission (this closes the form in CrudForm)
        return true;
      } else {
        // Handle error response
        const errorMessage = response?.data?.customMessage || response?.data?.message || response?.customMessage || "Failed to create registration";
        console.error("❌ API error:", errorMessage);
        toast.error(errorMessage);
        return false;
      }
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Exception in handleNewRegistrationSuccess:", error);
      setIsLoading(false);
      logAction("Error in ticket registration", { error: error.message, stack: error.stack });
      toast.error(error.message || "Something went wrong!");
      return false;
    } finally {
      setFormFieldsLoading(false);
      setIsLoading(false);
    }
  };

  // Format form fields similar to registrations page
  const formatFormFields = useCallback((fields, countries) => {
    if (!Array.isArray(fields)) return [];

    return fields.map((attribute) => {
      const formattedAttribute = { ...attribute };

      // Handle conditional fields
      if (formattedAttribute.conditionEnabled) {
        formattedAttribute.condition = {
          item: formattedAttribute.conditionWhenField,
          if: formattedAttribute.conditionCheckMatch.includes(",")
            ? formattedAttribute.conditionCheckMatch.split(",")
            : [formattedAttribute.conditionCheckMatch],
          then: formattedAttribute.conditionIfMatch === "enabled" ? "enabled" : "disabled",
          else: formattedAttribute.conditionIfMatch === "enabled" ? "disabled" : "enabled",
        };
      }

      // Configure select fields
      if (formattedAttribute.type === "select") {
        formattedAttribute.search = true;
        formattedAttribute.filter = true;
      } else {
        formattedAttribute.filter = false;
      }

      // Handle multiSelect CSV conversion
      if (formattedAttribute.type === "multiSelect") {
        if (formattedAttribute.apiType === "CSV") {
          formattedAttribute.selectApi = formattedAttribute.selectApi
            .toString()
            .split(",")
            .map((item) => ({
              id: item,
              value: item,
            }));
          formattedAttribute.apiType = "JSON";
        }
        formattedAttribute.default = "";
      }

      // Email validation
      if (formattedAttribute.type === "email") {
        formattedAttribute.validation = "email";
      }

      // Set collection for standard fields
      if (["_id", "firstName", "authenticationId", "emailId"].includes(formattedAttribute.name)) {
        formattedAttribute.collection = "";
        if (formattedAttribute.name === "authenticationId" && countries) {
          formattedAttribute.countries = countries;
        }
        // Add image configuration for firstName field
        if (formattedAttribute.name === "firstName") {
          formattedAttribute.image = { field: "keyImage", collection: "", generateTextIcon: true };
        }
      } else {
        formattedAttribute.collection = "formData";
      }

      // Format mobile number countries
      if (formattedAttribute.type === "mobilenumber" && countries) {
        let finalCountries = countries;
        const { countryLoadingType, country: selectedCountryIds } = formattedAttribute;

        if (countryLoadingType === "exclude" && selectedCountryIds?.length) {
          const excludedIds = new Set(selectedCountryIds.map(String));
          finalCountries = countries.filter((c) => !excludedIds.has(String(c._id)));
        } else if (countryLoadingType === "include") {
          if (selectedCountryIds?.length) {
            const includedIds = new Set(selectedCountryIds.map(String));
            finalCountries = countries.filter((c) => includedIds.has(String(c._id)));
          } else {
            finalCountries = [];
          }
        }

        formattedAttribute.countries = finalCountries.map((country) => ({
          phoneCode: country.phoneCode,
          title: country.title || country.name,
          flag: country.flag,
          PhoneNumberLength: country.PhoneNumberLength || 10,
        }));
      }

      // Set default properties
      if (!formattedAttribute.tag) {
        formattedAttribute.tag = true;
      }
      formattedAttribute.showItem = formattedAttribute.name;
      formattedAttribute.update = true;
      formattedAttribute.placeholder = formattedAttribute.placeholder ?? formattedAttribute.label;
      if (formattedAttribute.type !== "title" && formattedAttribute.type !== "info") {
        formattedAttribute.tag = true;
        formattedAttribute.view = true;
      }
      formattedAttribute.export = true;
      formattedAttribute.add = true;

      return formattedAttribute;
    });
  }, []);

  // Ensure standard columns exist with correct labels
  const ensureStandardColumns = useCallback((fields) => {
    if (!Array.isArray(fields)) return [];

    const updated = fields.map((field) => {
      if (field?.name === "authenticationId") {
        return { ...field, label: "Phone Number", tag: true, view: true, export: true };
      }
      if (field?.name === "emailId") {
        return { ...field, label: "Work e-mail Address", tag: false, view: true, export: true };
      }
      if (field?.name === "firstName") {
        return {
          ...field,
          label: "First Name",
          description: { field: "emailId", type: "text", collection: "" },
          tag: true,
          view: true,
          export: true
        };
      }
      if (field?.name === "lastName" || field?.name === "formData.name0101") {
        return { ...field, label: "Last Name", tag: true, view: true, export: true };
      }
      return field;
    });

    const has = (name) => updated.some((f) => f?.name === name);
    const addIfMissing = (name, label) => {
      if (!has(name)) {
        updated.splice(0, 0, {
          type: "text",
          placeholder: label,
          name,
          validation: "",
          label,
          collection: "",
          required: false,
          view: true,
          tag: true,
          export: true,
          add: true,
          update: true,
        });
      }
    };

    addIfMissing("firstName", "First Name");
    addIfMissing("authenticationId", "Phone Number");
    addIfMissing("emailId", "Work e-mail Address");

    return updated;
  }, []);

  // Registration form attributes
  const getRegistrationFormAttributes = () => {
    if (!formFields || formFields.length === 0) return [];

    // Format the form fields
    const formattedFields = formatFormFields(formFields, countries);

    // Filter out _id field
    const filteredFields = formattedFields.filter((field) => field.name !== "_id");

    // Ensure standard columns exist
    const fieldsWithStandardColumns = ensureStandardColumns(filteredFields);

    // Get default country for hidden fields
    const defaultCountry = countries?.[0] || {};

    // Add base fields (hidden fields and toggle) - similar to registrations page
    const baseFields = [
      {
        type: "hidden",
        placeholder: "PhoneNumberLength",
        name: "PhoneNumberLength",
        validation: "",
        showItem: "PhoneNumberLength",
        collection: "formData",
        default: defaultCountry?.PhoneNumberLength,
        label: "PhoneNumberLength",
        required: false,
        add: true,
        update: true,
        export: false,
        view: false,
      },
      {
        type: "hidden",
        placeholder: "phoneCode",
        name: "phoneCode",
        default: defaultCountry?.phoneCode,
        validation: "",
        label: "phoneCode",
        required: false,
        add: true,
        update: true,
        export: false,
        view: false,
      },
      {
        type: "hidden",
        placeholder: "event",
        name: "event",
        default: currentEventId,
        validation: "",
        label: "event",
        required: false,
        add: true,
        export: false,
        view: false,
      },
      {
        type: "hidden",
        placeholder: "ticketId",
        name: "ticket",
        default: selectedTicketForNew?.ticketId || selectedTicketId,
        validation: "",
        label: "ticketId",
        required: false,
        add: true,
        export: false,
        view: false,
      },
      {
        type: "checkbox",
        placeholder: "Send Registration Confirmation to User",
        footnote: "The user will receive a registration confirmation details via all the enabled communication channels!",
        name: "notifyUser",
        default: false,
        validation: "",
        label: "Send Registration Confirmation to User",
        required: false,
        view: true,
        add: true,
        update: true,
        customClass: "full",
      },
    ];

    // Combine formatted fields with base fields
    return [...fieldsWithStandardColumns, ...baseFields];
  };

  const registrationFormAttributes = useMemo(
    () => getRegistrationFormAttributes(),
    [formFields, countries, currentEventId, selectedTicketForNew, selectedTicketId, formatFormFields, ensureStandardColumns]
  );

  const registrationFormErrors = useMemo(() => {
    const errors = { captchaError: "" };

    registrationFormAttributes.forEach((field) => {
      if (field.type === "multiple" && Array.isArray(field.forms)) {
        errors[field.name] =
          field.forms?.map((formGroup) =>
            formGroup.reduce((acc, nestedField) => {
              acc[nestedField.name] = "";
              return acc;
            }, {})
          ) ?? [];
      } else {
        errors[field.name] = "";
      }
    });

    return errors;
  }, [registrationFormAttributes]);

  const registrationFormValues = useMemo(
    () => ({
      ticket: selectedTicketForNew ? String(selectedTicketForNew.ticketId) : String(selectedTicketId || ""),
      event: currentEventId ? String(currentEventId) : "",
      userType: "eventhex",
      notifyUser: false,
    }),
    [selectedTicketForNew, selectedTicketId, currentEventId]
  );

  // Show loading or error state if no exhibitor ID or event ID
  if ((!currentExhibitorId || !currentEventId) && !isLoading) {
    return (
      <RowContainer className="data-layout">
        <div className="flex flex-col w-full h-full items-center justify-center py-24">
          <div className="text-center max-w-md">
            <GetIcon icon="ticket" className="w-16 h-16 text-text-disabled mx-auto mb-6" />
            <h3 className="text-lg font-medium text-text-main mb-3">Unable to load ticket management</h3>
            <p className="text-text-sub">
              {!currentExhibitorId && !currentEventId
                ? "Please ensure you are logged in as an exhibitor and have selected an event."
                : !currentExhibitorId
                  ? "Please ensure you are logged in as an exhibitor."
                  : "Please ensure you have selected an event."}
            </p>
          </div>
        </div>
      </RowContainer>
    );
  }
  if (isLoading) {
    return <ShimmerStats />;
  }

  return (
    <RowContainer className="data-layout">
      {/* Header */}
      <PageHeader title="Tickets & Passes" description="Manage your exhibitor passes and generate registration links" line={false} />

      {/* Content */}
      <div className="px-6 pt-6 pb-6">
        {/* Exhibitor Passes */}
        <div>
          {isLoading ? (
            <ShimmerStats />
          ) : passes.length === 0 ? (
            <NoDataFound
              shortName="Passes"
              icon="ticket"
              addPrivilege={false}
              addLabel=""
              isCreatingHandler={() => { }}
            />
          ) : ticketsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ticketsData.map((ticketData, index) => (
                <div key={ticketData.ticketId || index} className="bg-bg-white rounded-xl shadow-sm border border-stroke-soft px-6 pt-6 pb-4 flex flex-col w-full min-w-0 overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stroke-soft">
                    <GetIcon icon="ticket" className="w-5 h-5 text-primary-base" />
                    <span className="text-lg font-semibold text-text-main">{ticketData.ticketTitle || "Unknown Ticket"}</span>
                  </div>
                  <div className="flex flex-col gap-0">
                        {ticketPassAttributes.map((attribute, attrIndex) => {
                          if (attribute.view && attribute.tag) {
                            const itemValue = ticketData[attribute.name];
                            return (
                              <React.Fragment key={attrIndex}>
                                {typeof attribute.render === "function" ? (
                                  <div className="w-full">{attribute.render(itemValue, ticketData, attribute)}</div>
                                ) : (
                              <div className="custom">
                                    {attribute.itemLabel && <Title>{attribute.itemLabel}</Title>}
                                    <DataItem className="box">
                                      {attribute.icon && <GetIcon icon={attribute.icon} />}
                                      <span>{itemValue || "--"}</span>
                                    </DataItem>
                              </div>
                                )}
                              </React.Fragment>
                            );
                          }
                          return null;
                        })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoDataFound
              shortName="Passes"
              icon="ticket"
              addPrivilege={false}
              addLabel=""
              isCreatingHandler={() => { }}
            />
          )}
        </div>

        {/* Referral content section with tab switcher */}
        {!isLoading && (
          <div className="mt-8">
            <TabButtons
              tabs={referralTabs}
              selectedTab={activeReferralTab}
              selectedChange={setActiveReferralTab}
              design="underline"
            />
            <div className="mt-6">
              {activeReferralTab === "registrations" && (
                <ListTable
                  shortName="Referral Registrations"
                  description="View all registrations that have been referred by this exhibitor."
                  api={"exhibitor/referred-registrations?exhibitor=" + currentExhibitorId}
                  itemTitle={{ name: "firstName", type: "text", collection: "" }}
                  viewMode="table"
                  createPrivilege={false}
                  updatePrivilege={false}
                  delPrivilege={false}
                  exportPrivilege={true}
                  attributes={[
                    {
                      type: "text",
                      name: "firstName",
                      label: "Name",
                      view: true,
                      tag: true,
                      export: true,
                      render: (value, data) => {
                        const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "N/A";
                        return <div className="text-sm font-medium text-text-main">{fullName}</div>;
                      },
                    },
                    {
                      type: "text",
                      name: "emailId",
                      label: "Email",
                      view: true,
                      tag: true,
                      export: true,
                      render: (value) => <div className="text-sm text-text-main">{value || "N/A"}</div>,
                    },
                    {
                      type: "text",
                      name: "authenticationId",
                      label: "Phone",
                      view: true,
                      tag: true,
                      export: true,
                      render: (value, data) => {
                        const phone = data.authenticationId?.number ? `+${data.authenticationId.country} ${data.authenticationId.number}` : data.authenticationId || "N/A";
                        return <div className="text-sm text-text-main font-mono">{phone}</div>;
                      },
                    },
                    {
                      type: "text",
                      name: "ticket",
                      label: "Ticket",
                      view: true,
                      tag: true,
                      export: true,
                      render: (value, data) => {
                        const ticketTitle = typeof data.ticket === "object" ? data.ticket?.title || data.ticket?.value || "Unknown Ticket" : "Unknown Ticket";
                        return <div className="text-sm text-text-main">{ticketTitle}</div>;
                      },
                    },
                    {
                      type: "text",
                      name: "status",
                      label: "Status",
                      view: true,
                      tag: true,
                      export: true,
                      render: (value, data) => {
                        const status = data.status || "active";
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-state-success-light text-state-success">
                            <GetIcon icon="tick" className="w-3 h-3" />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        );
                      },
                    },
                    {
                      type: "datetime",
                      name: "createdAt",
                      label: "Registered On",
                      view: true,
                      tag: true,
                      export: true,
                      render: (value) => {
                        const registeredDate = value
                          ? new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "N/A";
                        return <div className="text-sm text-text-sub">{registeredDate}</div>;
                      },
                    },
                  ]}
                />
              )}
              {activeReferralTab === "links" && (
                passes.length > 0 ? (
                  <ListTable
                    shortName="Referral Links"
                    description="View all registration links that have been generated by this exhibitor."
                    api={`registration-link?createdBy=${currentExhibitorId}`}
                    itemTitle={{ name: "name", type: "text", collection: "" }}
                    viewMode="table"
                    createPrivilege={false}
                    updatePrivilege={false}
                    delPrivilege={false}
                    exportPrivilege={true}
                    attributes={[
                      {
                        type: "text",
                        name: "name",
                        label: "Link Name",
                        view: true,
                        tag: true,
                        export: true,
                        render: (value) => <div className="text-sm font-medium text-text-main">{value || "Registration Link"}</div>,
                      },
                      {
                        type: "text",
                        name: "code",
                        label: "Coupon Code",
                        view: true,
                        tag: true,
                        export: true,
                        render: (value) => <code className="text-xs bg-bg-weak px-2 py-1 rounded text-primary-base font-mono">{value}</code>,
                      },
                      {
                        type: "text",
                        name: "ticket",
                        label: "Ticket",
                        view: true,
                        tag: true,
                        export: true,
                        render: (value, data) => {
                          const ticketTitle = typeof data.ticket === "object" ? data.ticket?.value : "Unknown Ticket";
                          return <div className="text-sm text-text-main">{ticketTitle}</div>;
                        },
                      },
                      {
                        type: "text",
                        name: "usedRegistrations",
                        label: "Usage",
                        view: true,
                        tag: true,
                        export: true,
                        render: (value, data) => {
                          const usagePercent = data.maxRegistrations > 0 ? (data.usedRegistrations / data.maxRegistrations) * 100 : 0;
                          return (
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-text-main">
                                  {data.usedRegistrations} / {data.maxRegistrations}
                                </div>
                                <div className="mt-1 w-full bg-bg-weak rounded-full h-1.5">
                                  <div className="bg-primary-base h-1.5 rounded-full transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        },
                      },
                      {
                        type: "text",
                        name: "isActive",
                        label: "Status",
                        view: true,
                        tag: true,
                        export: true,
                        render: (value, data) => {
                          const isExpired = data.expiresAt && new Date(data.expiresAt) < new Date();
                          const isActive = data.isActive && !isExpired;

                          if (isActive) {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-state-success-light text-state-success">
                                <GetIcon icon="tick" className="w-3 h-3" />
                                Active
                              </span>
                            );
                          } else if (isExpired) {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-state-error-light text-state-error">
                                <GetIcon icon="time" className="w-3 h-3" />
                                Expired
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-bg-weak text-text-disabled">
                                <GetIcon icon="close" className="w-3 h-3" />
                                Inactive
                              </span>
                            );
                          }
                        },
                      },
                      {
                        type: "datetime",
                        name: "createdAt",
                        label: "Created",
                        view: true,
                        tag: true,
                        export: true,
                        render: (value) => {
                          return (
                            <div className="text-sm text-text-sub">
                              {new Date(value).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          );
                        },
                      },
                      {
                        type: "text",
                        name: "actions",
                        label: "Actions",
                        view: true,
                        tag: true,
                        export: false,
                        render: (value, data) => {
                          return (
                            <button
                              onClick={async () => {
                                const cachedDomain = getCachedEventDomain(currentEventId);
                                let linkUrl;

                                if (cachedDomain) {
                                  const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
                                  const ticketId = typeof data.ticket === "object" ? data.ticket?._id : data.ticket;
                                  linkUrl = `${websiteUrl}/register/${ticketId}?coupon=${encodeURIComponent(data.code)}`;
                                } else {
                                  try {
                                    const domainRes = await getData({ event: currentEventId }, "whitelisted-domains");
                                    if (domainRes?.status === 200) {
                                      const domains = domainRes.data.response || [];
                                      const defaultDomain = domains.find((d) => d.isDefault) || domains[0];
                                      if (defaultDomain?.domain) {
                                        const websiteUrl = defaultDomain.domain.includes("http") ? defaultDomain.domain : `https://${defaultDomain.domain}`;
                                        const ticketId = typeof data.ticket === "object" ? data.ticket?._id : data.ticket;
                                        linkUrl = `${websiteUrl}/register/${ticketId}?coupon=${encodeURIComponent(data.code)}`;
                                      }
                                    }
                                  } catch (error) {
                                    logAction("Error fetching domain for copy", { error: error.message });
                                  }
                                }

                                if (linkUrl) {
                                  try {
                                    await navigator.clipboard.writeText(linkUrl);
                                    toast.success("Link copied to clipboard!");
                                  } catch (error) {
                                    toast.error("Failed to copy link");
                                  }
                                } else {
                                  toast.error("Could not generate link URL");
                                }
                              }}
                              className="text-sm text-primary-base hover:text-primary-dark font-medium transition-colors"
                              title="Copy link"
                            >
                              Copy Link
                            </button>
                          );
                        },
                      },
                    ]}
                  />
                ) : (
                  <NoDataFound
                    shortName="Referral Links"
                    icon="link"
                    addPrivilege={false}
                    addLabel=""
                    isCreatingHandler={() => { }}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Link Generation Selection Modal */}
      {linkGenerationModalOpen && selectedTicketForLink && (
        <PopupView
          customClass="small"
          closeModal={() => {
            setLinkGenerationModalOpen(false);
            setSelectedTicketForLink(null);
            setLinkQuantity(1);
            setLinkEndDate("");
          }}
          itemTitle={{ name: "title", collection: "" }}
          openData={{ data: { _id: "link-generation", title: "Generate Registration Link" } }}
          popupData={
            <div className="p-6">
              <div className="mb-6">
                {/* <h3 className="text-lg font-semibold text-text-main mb-2">Generate Registration Link</h3> */}
                {/* <p className="text-sm text-text-sub">
                  A coupon code will be auto-generated and attached to the registration link.
                </p> */}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text-main mb-2">
                  Selected Ticket
                </label>
                <div className="flex items-center gap-3 p-3 bg-bg-weak border border-stroke-soft rounded-lg">
                  <GetIcon icon="ticket" className="w-5 h-5 text-primary-base" />
                  <span className="text-sm font-medium text-text-main">
                    {selectedTicketForLink?.ticketTitle || "Unknown Ticket"}
                  </span>
                </div>
              </div>

              {/* Usage limit and expiry controls */}
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <FormInput
                  type="number"
                  name="usageLimit"
                  label="Usage Limit"
                  sublabel="How many times can this link be used?"
                  placeholder="Enter quantity"
                  required
                  value={linkQuantity}
                  footnote={`Available: ${linkPassesRemaining} passes remaining`}
                  onChange={(event) => {
                    const parsedValue = parseInt(event.target.value, 10);
                    setLinkQuantity(Number.isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue);
                  }}
                  icon="ticket"
                />
                <FormInput
                  type="datetime"
                  name="endDate"
                  label="End Date"
                  placeholder="Select link expiry"
                  value={linkEndDate}
                  icon="date"
                  split
                  footnote="Optional: choose when the generated link should expire."
                  onChange={(value) => {
                    // DateTimeInput returns ISO string (or null when cleared)
                    setLinkEndDate(value || "");
                  }}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stroke-soft">
                <Button
                  value="Cancel"
                  type="close"
                  ClickEvent={() => {
                    setLinkGenerationModalOpen(false);
                    setSelectedTicketForLink(null);
                    setLinkQuantity(1);
                    setLinkEndDate("");
                  }}
                />
                <Button
                  value="Generate Link"
                  icon="link"
                  type="theme"
                  ClickEvent={handleGenerateLinkWithCoupon}
                />
              </div>
            </div>
          }
        />
      )}

      {/* Registration Link Result Modal */}
      {registrationLinkModalOpen && (
        <PopupView
          customClass="small"
          closeModal={() => {
            setRegistrationLinkModalOpen(false);
            setGeneratedRegistrationLink("");
            setGeneratedCouponCode("");
            setCopiedLink(false);
          }}
          itemTitle={{ name: "title", collection: "" }}
          openData={{ data: { _id: "registration-link", title: "Registration Link" } }}
          popupData={
            <div className="p-6">
              <div className="mb-6 space-y-3">
              

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-main">Registration Link</label>
                  <div className="flex flex-col gap-3">
                    <div className="rounded-xl border border-stroke-soft bg-bg-weak px-4 py-3 font-mono text-sm text-text-main break-all">
                      {generatedRegistrationLink || "https://eventhex.ai/register/---"}
                    </div>
                 
                    {/* Note: Quick actions adopt layout from reference design */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <Button
                        type="theme"
                        icon={copiedLink ? "checked" : "copy"}
                        value={copiedLink ? "Copied!" : "Copy Link"}
                        ClickEvent={handleCopyRegistrationLink}
                        isDisabled={!generatedRegistrationLink}
                      />
                      <Button
                        type="secondary"
                        icon="link"
                        value="Open Link"
                        ClickEvent={handleOpenRegistrationLink}
                        isDisabled={!generatedRegistrationLink}
                        dynamicClass="sm:ml-2"
                      />
                    </div>

                    <div>
                  {/* <h3 className="text-xl font-semibold text-text-main mb-2">Registration Link Generated</h3> */}
                  <p className="text-sm text-text-sub">
                    Share this link with users to allow them to register. The coupon code{" "}
                    <span className="inline-flex rounded-full bg-primary-lightest text-primary-base font-mono text-xs tracking-wide px-3 py-1">
                      {generatedCouponCode}
                    </span>{" "}
                    has been created with {linkQuantity} {linkQuantity === 1 ? "usage" : "usages"}.
                  </p>
                </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Referral Registration Modal */}
      {registrationModalOpen && selectedTicketId && (
        <PopupView
          customClass="large"
          closeModal={() => {
            setRegistrationModalOpen(false);
            setSelectedPass(null);
            setSelectedTicketId(null);
          }}
          itemTitle={{ name: "title", collection: "" }}
          openData={{ data: { _id: selectedTicketId || "new", title: "Register User via Referral" } }}
          popupData={
            <RegistrationFormWrapper>
              <AutoForm
                header="Register User via Referral"
                api="ticket-registration/referred-registration"
                formType="post"
                formInput={getRegistrationFormAttributes()}
                formValues={{ ticket: selectedTicketId }}
                isOpenHandler={() => {
                  setRegistrationModalOpen(false);
                  setSelectedPass(null);
                  setSelectedTicketId(null);
                }}
                setLoaderBox={setFormFieldsLoading}
                onClose={() => {
                  setRegistrationModalOpen(false);
                  setSelectedPass(null);
                  setSelectedTicketId(null);
                }}
                onCancel={() => {
                  setRegistrationModalOpen(false);
                  setSelectedPass(null);
                  setSelectedTicketId(null);
                }}
                submitHandler={handleRegistrationSuccess}
              />
            </RegistrationFormWrapper>
          }
        />
      )}

      {/* Add New Ticket Registration Modal */}
      {addNewModalOpen && selectedTicketForNew && currentEventId && (
        <RegistrationFormWrapper>
          <CrudForm
            // Align Add New with booth member slide-over experience
            formMode="single"
            api="ticket-registration"
            formType="post"
            header={`Register New Ticket - ${selectedTicketForNew.ticketTitle}`}
            button="Submit"
            formInput={registrationFormAttributes}
            formValues={registrationFormValues}
            formErrors={registrationFormErrors}
            submitHandler={handleNewRegistrationSuccess}
            isOpenHandler={() => {
              setAddNewModalOpen(false);
              setSelectedTicketForNew(null);
            }}
            isOpen={addNewModalOpen}
            setLoaderBox={setFormFieldsLoading}
          />
        </RegistrationFormWrapper>
      )}
    </RowContainer>
  );
}