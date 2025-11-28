import React, { useEffect, useState, useMemo, useCallback, useRef, memo } from "react";
import FormInput from "../../../../core/input";
import AutoForm from "../../../../core/autoform/AutoForm";
import PopupView from "../../../../core/popupview";
import { useSelector } from "react-redux";
import { ElementContainer, TabButtons } from "../../../../core/elements";
import { deleteData, getData, postData, putData } from "../../../../../backend/api";
import withLayout from "../../../../core/layout";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EventFormPrimary from "./primary";
import EditorNew from "../../../../core/editor";
import { customFields, quickFields } from "./styles";
import { useToast } from "../../../../core/toast";
import SettingsModal from "./SettingsModal";
import { FaCopy, FaMagic } from "react-icons/fa";
import geminiService from "../../../../../services/geminiService";
import {
  Plus,
  X,
  User,
  Phone,
  Mail,
  Building,
  Globe,
  Calendar,
  CheckSquare,
  Hash,
  FileText,
  Edit,
  Search,
  Columns2,
  Columns,
  GripVertical,
  Lock,
  Unlock,
  Clock,
  Image,
  Minus,
  Info,
  Link,
  Briefcase,
  Type,
  CheckCircle,
} from "lucide-react";
import IphoneMockup from "./iphoneMockup";

// Constants
const FIELD_TYPES = [
  "textarea",
  "select",
  "checkbox",
  "date",
  "time",
  "number",
  "mobilenumber",
  "email",
  "text",
  // "password",
  "datetime",
  "image",
  "file",
  "buttonInput",
  "submit",
  "button",
  "linkbutton",
  "widges",
  "close",
  "toggle",
  "multiSelect",
  "info",
  "html",
  "line",
  "title",
  "hidden",
  "htmleditor",
];

const DEBOUNCE_DELAY = 1000;
const FIELD_ADD_DELAY = 150;

// Memoized field type icon mapping
const FIELD_ICON_MAP = {
  text: User,
  email: Mail,
  mobilenumber: Phone,
  number: Hash,
  // password: Lock,
  date: Calendar,
  time: Clock,
  file: FileText,
  image: Image,
  checkbox: CheckSquare,
  select: Columns,
  multiSelect: Columns2,
  textarea: Edit,
  htmleditor: Edit,
  html: Edit,
  line: Minus,
  info: Info,
  company: Building,
  url: Globe,
  website: Globe,
  designation: Building,
  country: Globe,
};

const getFieldTypeIcon = (type, label = "") => {
  // Handle special cases where we want different icons based on label
  const labelBasedIcons = {
    Website: Link,
    Company: Building,
    Designation: Briefcase,
    "Text Input": Type,
  };

  // Check if we have a label-based icon first
  if (labelBasedIcons[label]) {
    const IconComponent = labelBasedIcons[label];
    return <IconComponent className="w-5 h-5" />;
  }

  // Fall back to type-based mapping
  const IconComponent = FIELD_ICON_MAP[type] || Edit;
  return <IconComponent className="w-5 h-5" />;
};

// Memoized CloneTicketPopup Component
const CloneTicketPopup = memo(({ cloneTickets = [], isLoadingTickets = false, selectedCloneTicket, setSelectedCloneTicket, isCloning = false, onClone, onClose }) => {
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          maxWidth: "512px",
          width: "100%",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(to right, #2563eb, #1d4ed8)", color: "white", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="m4 16 0 2 0 0 2 0 9.5-9.5-2-2L4 16" />
                <path d="m22 4-2-2-6.5 6.5 2 2L22 4" />
              </svg>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>Clone Ticket Fields</h2>
                <p style={{ color: "#bfdbfe", fontSize: "14px", margin: "4px 0 0 0" }}>Select a ticket to copy its custom fields</p>
              </div>
            </div>
            <button onClick={onClose} style={{ color: "white", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px" }}>Choose a ticket from the list below to copy all its custom fields to the current ticket.</p>
          </div>
          {/* Loading State */}
          {isLoadingTickets && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#6b7280" }}>
                <div style={{ width: "24px", height: "24px", border: "2px solid #2563eb", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <span>Loading tickets...</span>
              </div>
            </div>
          )}
          {/* No Tickets State */}
          {!isLoadingTickets && cloneTickets.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", color: "#6b7280" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" style={{ marginBottom: "12px" }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
              <h3 style={{ fontSize: "18px", fontWeight: "500", color: "#374151", margin: "0 0 4px 0" }}>No Other Tickets Found</h3>
              <p style={{ fontSize: "14px", textAlign: "center", margin: 0 }}>There are no other tickets in this event to clone fields from.</p>
            </div>
          )}
          {/* Tickets Grid */}
          {!isLoadingTickets && cloneTickets.length > 0 && (
            <div style={{ display: "grid", gap: "12px", overflowY: "auto", paddingRight: "8px", flex: 1, minHeight: 0 }}>
              {cloneTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  style={{
                    border: selectedCloneTicket === ticket._id ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    backgroundColor: selectedCloneTicket === ticket._id ? "#eff6ff" : "white",
                  }}
                  onClick={() => setSelectedCloneTicket(ticket._id)}
                  onMouseEnter={(e) => {
                    if (selectedCloneTicket !== ticket._id) {
                      e.target.style.borderColor = "#93c5fd";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCloneTicket !== ticket._id) {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <h3 style={{ fontWeight: "500", color: "#111827", margin: 0 }}>{ticket.title || "Untitled Ticket"}</h3>
                        {ticket.type && (
                          <span style={{ padding: "4px 8px", borderRadius: "9999px", fontSize: "12px", fontWeight: "500", backgroundColor: "#dbeafe", color: "#1e40af" }}>{ticket.type}</span>
                        )}
                      </div>
                      {ticket.description && <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 12px 0" }}>{ticket.description}</p>}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "#6b7280" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="m22 21-3-3m0 0L16 15m3 3 3-3m-3 3v6" />
                          </svg>
                          <span>ID: {ticket._id.slice(-6)}</span>
                        </div>
                        {ticket.updatedAt && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                              <line x1="16" x2="16" y1="2" y2="6" />
                              <line x1="8" x2="8" y1="2" y2="6" />
                              <line x1="3" x2="21" y1="10" y2="10" />
                            </svg>
                            <span>Modified {formatDate(ticket.updatedAt)}</span>
                          </div>
                        )}
                        {ticket.price !== undefined && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ color: "#059669", fontWeight: "500" }}>{ticket.price === 0 ? "Free" : `$${ticket.price}`}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ marginLeft: "16px" }}>
                      {selectedCloneTicket === ticket._id && (
                        <div style={{ width: "24px", height: "24px", backgroundColor: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#f9fafb", padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button
            onClick={onClose}
            disabled={isCloning}
            style={{ padding: "8px 16px", color: "#6b7280", backgroundColor: "transparent", border: "none", cursor: isCloning ? "not-allowed" : "pointer" }}
          >
            Cancel
          </button>
          <button
            disabled={!selectedCloneTicket || isCloning || isLoadingTickets}
            style={{
              padding: "8px 24px",
              borderRadius: "8px",
              fontWeight: "500",
              border: "none",
              cursor: selectedCloneTicket && !isCloning && !isLoadingTickets ? "pointer" : "not-allowed",
              backgroundColor: selectedCloneTicket && !isCloning && !isLoadingTickets ? "#2563eb" : "#d1d5db",
              color: selectedCloneTicket && !isCloning && !isLoadingTickets ? "white" : "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={onClone}
          >
            {isCloning ? (
              <>
                <div style={{ width: "16px", height: "16px", border: "2px solid white", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <span>Cloning...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="m4 16 0 2 0 0 2 0 9.5-9.5-2-2L4 16" />
                  <path d="m22 4-2-2-6.5 6.5 2 2L22 4" />
                </svg>
                <span>Clone Fields</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add CSS animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `,
        }}
      />
    </div>
  );
});

// FormBuilder Component - Updated with modern design to match formBuilderNew layout
// Features: Two-panel layout with field builder on left and live preview on right
// Maintains all existing functionality while providing modern UI/UX
const FormBuilder = (props) => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEventSidebarOpen, setIsEventSidebarOpen] = useState(false);
  const themeColors = useSelector((state) => state.themeColors);
  const [activeInput, setActiveInput] = useState({});
  const [ticketFormValues, setTicketFormValues] = useState(null);
  const [eventTicketFormValues, setEventTicketFormValues] = useState(null);
  const [id, setId] = useState("");
  const [activeInputType, setActiveInputType] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedEventField, setSelectedEventField] = useState(null);
  const [triggerEffect, setTriggerEffect] = useState(false); // State variable to trigger useEffect
  const [formFields, setFormFields] = useState([]);
  const [originalFormFields, setOriginalFormFields] = useState([]);
  const [eventFormFields, setEventFormFields] = useState([]);
  const [countries, setCountries] = useState([]);
  const [ticketData, setTicketData] = useState(null);
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [isClonePopupOpen, setIsClonePopupOpen] = useState(false);
  const [cloneTickets, setCloneTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [selectedCloneTicket, setSelectedCloneTicket] = useState(null);
  const [isCloning, setIsCloning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Editing toggle and inline field selector (align with formBuilderNew)
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const [fieldSelectorTarget, setFieldSelectorTarget] = useState(""); // 'event' | 'custom'
  const [fieldSearchTerm, setFieldSearchTerm] = useState("");

  // Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // const [activeSettingsTab, setActiveSettingsTab] = useState("general");
  const [activeSettingsTab, setActiveSettingsTab] = useState("approval");
  // const [activeSubmissionTab, setActiveSubmissionTab] = useState("email");
  const [activeApprovalTab, setActiveApprovalTab] = useState("submission");
  const [activeApprovalChannel, setActiveApprovalChannel] = useState("email");
  // const [activeRejectionChannel, setActiveRejectionChannel] = useState("email");

  // State for editor instances (for variable insertion)
  const [emailEditor, setEmailEditor] = useState(null);
  const [websiteEditor, setWebsiteEditor] = useState(null);

  // State for registration data preview
  const [registrationData, setRegistrationData] = useState(null);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(false);
  const [fullEventData, setFullEventData] = useState(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);

  // AI Generation State Variables
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTargetSection, setAiTargetSection] = useState("custom"); // Track which section AI was triggered from
  // Settings State Variables
  const [formTitle, setFormTitle] = useState(props?.data?.title || "Event Registration");
  const [formDescription, setFormDescription] = useState(props?.data?.description || "Event registration form");
  const [emailSubject, setEmailSubject] = useState("Thank you for your submission - {{formTitle}}");
  const [emailMessage, setEmailMessage] = useState(
    props?.data?.emailTemplate || "Hi {{name}}, thank you for submitting {{formTitle}}! We have received your information and will get back to you soon."
  );
  const [whatsappMessage, setWhatsappMessage] = useState(props?.data?.whatsappTemplate || "Hi {{name}}, thank you for registering for {{formTitle}}! We will contact you soon with further details.");
  const [websiteMessage, setWebsiteMessage] = useState(props?.data?.onsuccessfullMessage || "Thank you for your submission!");
  const [approvalEmailSubject, setApprovalEmailSubject] = useState(props?.data?.approvalEmailSubject || "Your submission has been approved - {{formTitle}}");
  const [approvalEmailMessage, setApprovalEmailMessage] =
    useState(props?.data?.approvalEmailTemplate) || "Hi {firstName}, Congratulations! Your registration for {ticket} at {event} has been approved. Best regards, Team {event}";
  const [approvalWhatsappMessage, setApprovalWhatsappMessage] = useState(props?.data?.approvalWhatsappTemplate || "Hi {{name}}, your submission for {{formTitle}} has been approved!");
  const [rejectionEmailSubject, setRejectionEmailSubject] = useState("Update on your submission - {{formTitle}}");
  const [rejectionEmailMessage, setRejectionEmailMessage] = useState(
    props?.data?.rejectionEmailTemplate || "Hi {{name}}, thank you for your submission for {{formTitle}}. Unfortunately, we are unable to approve your request at this time."
  );
  const [rejectionWhatsappMessage, setRejectionWhatsappMessage] = useState(
    props?.data?.rejectionWhatsappTemplate || "Hi {{name}}, thank you for your submission for {{formTitle}}. Unfortunately, we are unable to approve your request at this time."
  );
  // Add missing approval badge state variables
  const [approvalWhatsapp, setApprovalWhatsapp] = useState(props?.data?.approvalWhatsapp || false);
  const [attachBadgeEmailOnApproval, setAttachBadgeEmailOnApproval] = useState(props?.data?.attachBadgeEmailOnApproval || false);
  // Consolidated timeout refs for debouncing
  const timeoutRefs = useRef({
    formTitle: null,
    formDescription: null,
    emailSubject: null,
    emailMessage: null,
    whatsappMessage: null,
    websiteMessage: null,
  });

  // Utility function for debounced saving
  const debouncedSave = useCallback((key, settings, delay = DEBOUNCE_DELAY) => {
    clearTimeout(timeoutRefs.current[key]);
    timeoutRefs.current[key] = setTimeout(() => {
      saveSettings(settings, { silent: true });
    }, delay);
  }, []);
  const [attachBadgeWhatsappOnApproval, setAttachBadgeWhatsappOnApproval] = useState(props?.data?.attachBadgeWhatsappOnApproval || false);
  const [approvalEnabled, setApprovalEnabled] = useState(props?.data?.needsApproval || false);
  const [enableApprovalEmail, setEnableApprovalEmail] = useState(props?.data?.enableApprovalEmail !== undefined ? props?.data?.enableApprovalEmail : true);
  const [enableRejectionEmail, setEnableRejectionEmail] = useState(props?.data?.enableRejectionEmail !== undefined ? props?.data?.enableRejectionEmail : true);
  const [enableRejectionWhatsapp, setEnableRejectionWhatsapp] = useState(props?.data?.enableRejectionWhatsapp !== undefined ? props?.data?.enableRejectionWhatsapp : true);
  const [captchaEnabled, setCaptchaEnabled] = useState(props?.data?.enableCaptcha || false);
  const [consentEnabled, setConsentEnabled] = useState(props?.data?.consent || false);
  const [consentMessage, setConsentMessage] = useState(
    props?.data?.consentLetter || "By continuing with this registration, you provide your consent to participate in this event. Please review the terms and conditions carefully before proceeding."
  );
  const [termsEnabled, setTermsEnabled] = useState(props?.data?.termsAndPolicy || false);
  const [termsMessage, setTermsMessage] = useState(
    props?.data?.termsAndPolicyMessage || "By registering, you agree to our terms and policies. Please ensure you have read and understood the terms before proceeding."
  );
  // Add missing badge-related state variables
  const [enableEmail, setEnableEmail] = useState(props?.data?.enableEmail !== undefined ? props?.data?.enableEmail : true);
  const [enableWhatsapp, setEnableWhatsapp] = useState(props?.data?.enableWhatsapp !== undefined ? props?.data?.enableWhatsapp : true);
  const [attachBadgeEmail, setAttachBadgeEmail] = useState(props?.data?.attachBadgeEmail !== undefined ? props?.data?.attachBadgeEmail : true);
  const [attachBadgeWhatsapp, setAttachBadgeWhatsapp] = useState(props?.data?.attachBadgeWhatsapp !== undefined ? props?.data?.attachBadgeWhatsapp : true);
  const [enableEmailCalendar, setEnableEmailCalendar] = useState(props?.data?.enableEmailCalendar !== undefined ? props?.data?.enableEmailCalendar : false);

  // Saving state indicator
  const [isSaving, setIsSaving] = useState(false);

  // Event settings state
  const [eventSettings, setEventSettings] = useState(null);
  const [isLoadingEventSettings, setIsLoadingEventSettings] = useState(false);
  // Settings tabs (match formBuilderNew)
  const settingsTabs = [
    // { id: "general", label: "General" },
    // { id: "approval", label: "Approval" },
    // { id: "security", label: "Security & Privacy" },
  ];

  // Settings tabs for Abstraction forms (no tabs - render approval directly)
  const abstractionSettingsTabs = [];

  // Debounce refs to avoid multiple ticket API calls while typing in approval settings
  const approvalWhatsappMessageTimeoutRef = useRef(null);

  // Open Settings modal only when the trigger counter CHANGES (not just > 0)
  const prevSettingsTriggerRef = useRef(props?.setOpenEventFormSettingsTrigger);
  useEffect(() => {
    const current = props?.setOpenEventFormSettingsTrigger;
    if (prevSettingsTriggerRef.current !== current) {
      // Open only in response to an explicit click that increments the counter
      if (prevSettingsTriggerRef.current !== undefined) {
        setIsSettingsModalOpen(true);
      }
      prevSettingsTriggerRef.current = current;
    }
  }, [props?.setOpenEventFormSettingsTrigger]);

  // Helper function to generate fallback email from firstName
  const generateFallbackEmail = (firstName) => {
    if (!firstName) return "user@gmail.com";
    const cleanFirstName = firstName.replace(/\s+/g, "");
    return `${cleanFirstName}@gmail.com`;
  };

  // Helper function to set placeholder registration data
  const setPlaceholderRegistrationData = () => {
    setRegistrationData({
      emailId: "{firstName}@gmail.com",
      firstName: "{firstName}",
    });
  };

  // Fetch full event data for banner
  const fetchFullEventData = async () => {
    if (!props?.data?.event?._id) return;

    setIsLoadingEvent(true);
    try {
      const response = await getData({ id: props.data.event._id }, "event");
      if (response.status === 200 && response.data?.success) {
        setFullEventData(response.data.response);
      } else {
        setFullEventData(null);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      setFullEventData(null);
    } finally {
      setIsLoadingEvent(false);
    }
  };

  // Fetch first registration data for preview
  const fetchFirstRegistration = async () => {
    const ticketId = props?.data?.participantType || props?.data?._id;
    const eventId = props?.data?.event?._id;

    if (!eventId || !ticketId) return;

    setIsLoadingRegistration(true);
    try {
      const response = await getData(
        {
          ticket: ticketId,
          event: eventId,
          type: "Ticket",
          limit: 1,
          skip: 0,
        },
        "ticket-registration"
      );

      if (response.status === 200 && response.data?.success) {
        const registrations = response.data.response || [];
        if (registrations.length > 0) {
          const registration = registrations[0];
          const registrationTicketId = registration.ticket?._id || registration.ticket;
          if (registrationTicketId !== ticketId) {
            setPlaceholderRegistrationData();
            return;
          }
          let emailId = registration.emailId;
          if (!emailId || emailId.trim() === "") {
            emailId = generateFallbackEmail(registration.firstName);
          }
          setRegistrationData({
            ...registration,
            emailId: emailId,
          });
        } else {
          setPlaceholderRegistrationData();
        }
      } else {
        setPlaceholderRegistrationData();
      }
    } catch (error) {
      console.error("Error fetching registration data:", error);
      setPlaceholderRegistrationData();
    } finally {
      setIsLoadingRegistration(false);
    }
  };

  // Available variables for submission messages
  const availableVariables = [
    { key: "firstName", label: "{firstName}" },
    { key: "event", label: "{event}" },
    { key: "ticket", label: "{ticket}" },
    { key: "formTitle", label: "{formTitle}" },
  ];

  // Function to insert variable into message at cursor position
  const insertVariable = (variable, messageType) => {
    const variableText = variable;
    switch (messageType) {
      case "email":
        if (emailEditor && emailEditor.commands) {
          emailEditor.commands.insertContent(`<strong>${variableText}</strong>`);
        } else {
          const currentEmailContent = emailMessage || "";
          const newEmailContent = currentEmailContent + (currentEmailContent ? " " : "") + `<strong>${variableText}</strong>`;
          setEmailMessage(newEmailContent);
          debouncedSave("emailMessage", { emailTemplate: newEmailContent });
        }
        break;
      case "whatsapp":
        const whatsappTextarea = document.querySelector('textarea[name="submission-whatsapp-message"]');
        const boldVariableText = `*${variableText}*`;
        if (whatsappTextarea) {
          const start = whatsappTextarea.selectionStart;
          const end = whatsappTextarea.selectionEnd;
          const text = whatsappTextarea.value;
          const before = text.substring(0, start);
          const after = text.substring(end, text.length);
          const newText = before + boldVariableText + after;

          setWhatsappMessage(newText);
          debouncedSave("whatsappMessage", { whatsappTemplate: newText });

          setTimeout(() => {
            whatsappTextarea.focus();
            whatsappTextarea.setSelectionRange(start + boldVariableText.length, start + boldVariableText.length);
          }, 0);
        } else {
          const newText = whatsappMessage + (whatsappMessage ? " " : "") + boldVariableText;
          setWhatsappMessage(newText);
          debouncedSave("whatsappMessage", { whatsappTemplate: newText });
        }
        break;
      case "website":
        if (websiteEditor && websiteEditor.commands) {
          websiteEditor.commands.insertContent(`<strong>${variableText}</strong>`);
        } else {
          const currentWebsiteContent = websiteMessage || "";
          const newWebsiteContent = currentWebsiteContent + (currentWebsiteContent ? " " : "") + `<strong>${variableText}</strong>`;
          setWebsiteMessage(newWebsiteContent);
          debouncedSave("websiteMessage", { onsuccessfullMessage: newWebsiteContent });
        }
        break;
      default:
        break;
    }
  };

  // Variable button component
  const VariableButton = ({ variable, messageType }) => (
    <button
      type="button"
      onClick={() => insertVariable(variable, messageType)}
      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors duration-200"
      title={`Click to insert ${variable}`}
    >
      {variable}
    </button>
  );

  // Load settings from backend - maps from ticket model fields
  const loadSettings = async () => {
    try {
      if (!props?.data) return;
      // Always fetch latest ticket to avoid stale props after a refresh/save
      let ticketData = props.data;
      try {
        const latest = await getData({ id: props?.data?._id }, "ticket");
        if (latest?.data?.response) {
          ticketData = latest.data.response;
        }
      } catch (e) {
        // Fallback to props.data if API fails
        ticketData = props.data;
      }
      if (ticketData.title) {
        setFormTitle(ticketData.title);
      }
      if (ticketData.description) {
        setFormDescription(ticketData.description);
      }
      if (ticketData.emailSubject) setEmailSubject(ticketData.emailSubject);
      if (ticketData.emailTemplate) setEmailMessage(ticketData.emailTemplate);
      if (ticketData.whatsappTemplate) setWhatsappMessage(ticketData.whatsappTemplate);
      if (ticketData.onsuccessfullMessage) setWebsiteMessage(ticketData.onsuccessfullMessage);
      if (ticketData.approvalEmailSubject) setApprovalEmailSubject(ticketData.approvalEmailSubject);
      if (ticketData.approvalEmailTemplate) setApprovalEmailMessage(ticketData.approvalEmailTemplate);
      if (ticketData.approvalWhatsappTemplate) setApprovalWhatsappMessage(ticketData.approvalWhatsappTemplate);
      if (ticketData.rejectionEmailSubject) setRejectionEmailSubject(ticketData.rejectionEmailSubject);
      if (ticketData.rejectionEmailTemplate) setRejectionEmailMessage(ticketData.rejectionEmailTemplate);
      if (ticketData.rejectionWhatsappTemplate) setRejectionWhatsappMessage(ticketData.rejectionWhatsappTemplate);
      if (ticketData.needsApproval !== undefined) setApprovalEnabled(ticketData.needsApproval);
      if (ticketData.enableCaptcha !== undefined) setCaptchaEnabled(ticketData.enableCaptcha);
      if (ticketData.consent !== undefined) setConsentEnabled(ticketData.consent);
      if (ticketData.consentLetter) setConsentMessage(ticketData.consentLetter);
      if (ticketData.termsAndPolicy !== undefined) setTermsEnabled(ticketData.termsAndPolicy);
      if (ticketData.termsAndPolicyMessage) setTermsMessage(ticketData.termsAndPolicyMessage);
      // Load badge-related settings
      if (ticketData.enableEmail !== undefined) setEnableEmail(ticketData.enableEmail);
      if (ticketData.enableWhatsapp !== undefined) setEnableWhatsapp(ticketData.enableWhatsapp);
      if (ticketData.attachBadgeEmail !== undefined) setAttachBadgeEmail(ticketData.attachBadgeEmail);
      if (ticketData.attachBadgeWhatsapp !== undefined) setAttachBadgeWhatsapp(ticketData.attachBadgeWhatsapp);
      if (ticketData.enableEmailCalendar !== undefined) setEnableEmailCalendar(ticketData.enableEmailCalendar);
      if (ticketData.approvalWhatsapp !== undefined) setApprovalWhatsapp(ticketData.approvalWhatsapp);
      if (ticketData.attachBadgeWhatsappOnApproval !== undefined) setAttachBadgeWhatsappOnApproval(ticketData.attachBadgeWhatsappOnApproval);
      if (ticketData.attachBadgeEmailOnApproval !== undefined) setAttachBadgeEmailOnApproval(ticketData.attachBadgeEmailOnApproval);
      if (ticketData.enableApprovalEmail !== undefined) setEnableApprovalEmail(ticketData.enableApprovalEmail);
      if (ticketData.enableRejectionEmail !== undefined) setEnableRejectionEmail(ticketData.enableRejectionEmail);
      if (ticketData.enableRejectionWhatsapp !== undefined) setEnableRejectionWhatsapp(ticketData.enableRejectionWhatsapp);

      // Apply and persist defaults when missing
      const defaultUpdates = {};
      if (ticketData.enableEmail === undefined) {
        defaultUpdates.enableEmail = true;
        setEnableEmail(true);
      }
      if (ticketData.attachBadgeEmail === undefined) {
        defaultUpdates.attachBadgeEmail = true;
        setAttachBadgeEmail(true);
      }
      if (ticketData.enableWhatsapp === undefined) {
        defaultUpdates.enableWhatsapp = true;
        setEnableWhatsapp(true);
      }
      if (ticketData.attachBadgeWhatsapp === undefined) {
        defaultUpdates.attachBadgeWhatsapp = true;
        setAttachBadgeWhatsapp(true);
      }
      if (Object.keys(defaultUpdates).length > 0) {
        try {
          await putData({ id: props?.data?._id, ...defaultUpdates }, "ticket");
        } catch (e) {
          // silent fail; non-blocking default persist
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  // Load settings on component mount and when ticket data changes
  useEffect(() => {
    if (props?.data) {
      loadSettings();
    }
  }, [props?.data]);

  // Fetch event settings
  const fetchEventSettings = async () => {
    if (!props?.data?.event?._id) return;

    setIsLoadingEventSettings(true);
    try {
      const response = await getData({ event: props.data.event._id }, "settings");
      if (response.status === 200 && response.data?.success) {
        const settingsData = response.data.response?.[0];
        setEventSettings(settingsData);
      } else {
        setEventSettings(null);
      }
    } catch (error) {
      console.error("Error fetching event settings:", error);
      setEventSettings(null);
    } finally {
      setIsLoadingEventSettings(false);
    }
  };

  // Fetch event settings when component mounts
  useEffect(() => {
    if (props?.data?.event?._id) {
      fetchEventSettings();
    }
  }, [props?.data?.event?._id]);

  // Fetch registration data when modal opens
  useEffect(() => {
    if (isSettingsModalOpen && props?.data?.event?._id && props?.data?._id) {
      setRegistrationData(null);
      fetchFirstRegistration();
    }
  }, [isSettingsModalOpen, props?.data?.event?._id, props?.data?._id]);

  // Fetch full event data when modal opens
  useEffect(() => {
    if (isSettingsModalOpen && props?.data?.event?._id) {
      fetchFullEventData();
    }
  }, [isSettingsModalOpen, props?.data?.event?._id]);

  // Reset to email channel when switching to approval or rejection tabs
  useEffect(() => {
    if (activeApprovalTab === "approval" || activeApprovalTab === "rejection") {
      setActiveApprovalChannel("email");
    }
  }, [activeApprovalTab]);

  // Helper function to determine which tabs should be hidden
  const getHiddenTabs = () => {
    if (!eventSettings) return [];

    const hiddenTabs = [];

    // Email is always customizable - no template restrictions

    // Hide whatsapp tab if defaultWhatsapp is "EventHex Whatsapp"
    if (eventSettings.defaultWhatsapp === "EventHex Whatsapp") {
      hiddenTabs.push("whatsapp");
    }

    return hiddenTabs;
  };

  // Memoized helper function to replace variables in text
  const replaceVariables = useCallback(
    (text) => {
      if (!text) return "";

      // Get actual event and ticket data
      // Handle both cases: event as object or string ID
      const eventTitle = typeof props?.data?.event === "object" ? props?.data?.event?.title : "Event Test"; // If event is a string ID, we can't get the title directly
      const ticketTitle = props?.data?.title || "Dummy";
      const formTitle = ticketTitle; // Form title is the same as ticket title

      const sampleData = {
        // Single curly brace format (used in SubmissionsModal)
        "{firstName}": "Participant",
        "{event}": eventTitle,
        "{ticket}": ticketTitle,
        "{formTitle}": formTitle,
        // Double curly brace format (legacy)
        "{{name}}": "Participant",
        "{{email}}": "participant@example.com",
        "{{phone}}": "+1 (555) 123-4567",
        "{{formTitle}}": formTitle,
      };

      // Replace both single and double curly brace formats
      return text
        .replace(/\{(\w+)\}/g, (match, variable) => {
          return sampleData[match] || match;
        })
        .replace(/\{\{(\w+)\}\}/g, (match, variable) => {
          return sampleData[match] || match;
        });
    },
    [props?.data?.title, props?.data?.event]
  );

  // Close inline selector when clicking outside
  useEffect(() => {
    const handler = (event) => {
      if (isFieldSelectorOpen && !event.target.closest?.(".field-selector-popup") && !event.target.closest?.(".add-field-trigger")) {
        setIsFieldSelectorOpen(false);
        setFieldSelectorTarget("");
        setFieldSearchTerm(""); // Clear search when closing
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isFieldSelectorOpen]);

  const filteredQuickFields = useMemo(() => {
    if (!fieldSearchTerm.trim()) return quickFields;
    const searchLower = fieldSearchTerm.toLowerCase();
    return quickFields.filter((f) => (f.label || "").toLowerCase().includes(searchLower) || (f.value || "").toLowerCase().includes(searchLower));
  }, [fieldSearchTerm]);

  const filteredCustomFields = useMemo(() => {
    if (!fieldSearchTerm.trim()) return customFields;
    const searchLower = fieldSearchTerm.toLowerCase();
    return customFields.filter((f) => (f.label || "").toLowerCase().includes(searchLower) || (f.value || "").toLowerCase().includes(searchLower));
  }, [fieldSearchTerm]);

  const handleInputClick = (input, inputType) => {
    setActiveInput(input);
    setActiveInputType(inputType);
  };

  const toggleModal = () => {
    if (isModalOpen) {
      setSelectedField([]);
    }
    setIsModalOpen(!isModalOpen);
  };

  const [isEditMode, setIsEditMode] = useState(false);

  const toggleModalPrimary = async () => {
    if (isEditMode) {
      setIsEditMode(false);
      await getData({ ticket: props?.data?._id, eventId: props?.data?.event?._id }, "ticket-form-data").then((response) => {
        setFormFields(generateFormFields(response?.data?.response, response?.data?.countries));
        setOriginalFormFields(generateFormFields(response?.data?.response, response?.data?.countries) || []);
        setEventFormFields(generateFormFields(response?.data?.eventForm, response?.data?.countries).sort((a, b) => (a.orderId || 0) - (b.orderId || 0)));
        setTicketData(response?.data?.ticketData);
        setCountries(response?.data?.countries);
      });
    } else {
      setIsEditMode(true);
    }
  };
  const openSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const openEventSidebar = () => {
    setIsEventSidebarOpen(!isEventSidebarOpen);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setIsSidebarOpen(false);
    setIsEventSidebarOpen(false);
    setActiveInput(null);
    setTicketFormValues({});
    setEventTicketFormValues({});
    setTriggerEffect((prevState) => !prevState);
    setId("");
  };
  const addFieldToForm = () => {
    if (selectedField) {
      postData(
        {
          ticket: props?.data?._id,
          ...selectedField,
          view: true,
          add: true,
          update: true,
        },
        "ticket-form-data"
      ).then((response) => {
        if (response?.data?.success === true) {
          toast.success("A field has been added to the form");
        }
        setTriggerEffect((prevState) => !prevState);
      });
      setSelectedField(null);
      closeModal();
    }
  };
  // Utility to get next orderId for event fields
  const getNextEventOrderId = () => {
    if (!eventFormFields || eventFormFields.length === 0) return 1;
    // Always use the highest orderId in the sorted array
    const sorted = [...eventFormFields].sort((a, b) => (a.orderId || 0) - (b.orderId || 0));
    return (sorted[sorted.length - 1]?.orderId || 0) + 1;
  };
  const addEventFieldToForm = () => {
    if (selectedEventField) {
      postData(
        {
          ticket: props?.data?._id,
          ...selectedEventField,
          view: true,
          add: true,
          update: true,
          event: props?.data?.event?._id,
          orderId: getNextEventOrderId(), // Ensure new field is appended
        },
        "event-form-fields"
      ).then((response) => {
        if (response?.data?.success === true) {
          toast.success("A field has been added to the form");
        }
        setTriggerEffect((prevState) => !prevState);
      });
      setSelectedEventField(null);
      closeModal();
    }
  };

  const handleDeleteField = (field) => {
    const id = field?._id;
    // Delete immediately without confirmation
    deleteData({ id }, `ticket-form-data`).then((response) => {
      if (response?.data?.success === true) {
        toast.success("A field has been deleted from the form");
      } else {
        toast.error(response.customMessage);
      }
      // Trigger refresh regardless to keep UI in sync
      setTriggerEffect((prevState) => !prevState);
    });
  };
  const handleEventDeleteField = (field) => {
    const id = field?._id;
    // Delete immediately without confirmation
    deleteData({ id }, `event-form-fields`).then((response) => {
      if (response?.data?.success === true) {
        toast.success("A field has been deleted from the form");
      } else {
        toast.error(response?.customMessage || "Failed to delete field");
      }
      setTriggerEffect((prevState) => !prevState);
    });
  };
  const handleFieldSelection = (field) => {
    setSelectedField(field);
    // Show selection for a short time before adding
    setTimeout(() => {
      postData(
        {
          ticket: props?.data?._id,
          ...field,
          view: true,
          add: true,
          update: true,
        },
        "ticket-form-data"
      ).then((response) => {
        if (response?.data?.success === true) {
          toast.success("A field has been added to the form");
        }
        setTriggerEffect((prevState) => !prevState);
      });
      setSelectedField(null);
      closeModal();
    }, FIELD_ADD_DELAY);
  };
  const handleEventFieldSelection = (field) => {
    // Create a proper field object with name from value
    const fieldData = {
      ...field,
      name: field.value?.toLowerCase().replace(/\s+/g, "_"), // Convert "Full Name" to "full_name"
      label: field.label,
      type: field.type,
      placeholder: field.placeholder,
      required: false,
      view: true,
      add: true,
      update: true,
    };
    setSelectedEventField(field);
    // Immediately add the event field
    postData(
      {
        ticket: props?.data?._id,
        ...fieldData,
        event: props?.data?.event?._id,
        orderId: getNextEventOrderId(), // Ensure new field is appended
      },
      "event-form-fields"
    )
      .then((response) => {
        if (response?.data?.success === true) {
          toast.success("A field has been added to the form");
        } else {
          toast.error(response?.data?.message || "Failed to add field");
        }
        setTriggerEffect((prevState) => !prevState);
      })
      .catch((error) => {
        console.error("Error adding field:", error);
        toast.error("Failed to add field");
      });
    setSelectedEventField(null);
    closeModal();
  };

  // Handle adding fields to custom fields section
  const handleAddField = async (field, isEventForm = false) => {
    if (isEventForm) {
      handleEventFieldSelection(field);
    } else {
      // Create a proper field object with name from value
      const fieldData = {
        ...field,
        // Let the server generate a unique name based on label; avoid collisions between fields
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        required: false,
        view: true,
        add: true,
        update: true,
      };
      setSelectedField(field);
      // Immediately add the field
      postData(
        {
          ticket: props?.data?._id,
          ...fieldData,
        },
        "ticket-form-data"
      )
        .then((response) => {
          if (response?.data?.success === true) {
            toast.success("A field has been added to the form");
          } else {
            toast.error(response?.data?.message || "Failed to add field");
          }
          setTriggerEffect((prevState) => !prevState);
        })
        .catch((error) => {
          console.error("Error adding field:", error);
          toast.error("Failed to add field");
        });
      setSelectedField(null);
      closeModal();
    }
  };

  // Memoized getCountries function
  const getCountries = useCallback((field, countries) => {
    if (field?.type !== "mobilenumber") return null;

    const countryList = [...countries];
    field.countryLoadingType = field?.countryLoadingType || "all";
    field.country = field?.country || [];

    // Helper function to safely get country ID
    const getCountryId = (country) => {
      if (!country) return "";
      return typeof country === "object" ? country._id?.toString() : country.toString();
    };

    if (field?.countryLoadingType === "exclude") {
      const excludedIds = field.country.map((id) => getCountryId(id));
      return countryList.filter((country) => !excludedIds.includes(getCountryId(country)));
    }

    if (field?.countryLoadingType === "include") {
      const includedIds = field.country.map((id) => getCountryId(id));
      return countryList.filter((country) => includedIds.includes(getCountryId(country)));
    }

    return countryList;
  }, []);

  // Memoized field click handler
  const handleFieldClick = useCallback((field) => {
    setTicketFormValues(field);
    setId(field?._id);
    handleInputClick(field, field?.type);
    openSidebar();
  }, []);

  // Memoized event field click handler
  const handleEventFieldClick = useCallback((field) => {
    setEventTicketFormValues(field);
    setId(field?._id);
    handleInputClick(field, field?.type);
    openEventSidebar();
  }, []);

  // Optimized renderInputField function
  const renderInputField = useCallback(
    (field) => {
      if (!field?.type || !FIELD_TYPES.includes(field.type)) {
        return null;
      }

      return (
        <div onClick={() => handleFieldClick(field)}>
          <FormInput
            {...field}
            // Ensure numeric attributes so native limits work
            maxLength={Number(field?.maxLength) > 0 ? Number(field.maxLength) : undefined}
            minLength={Number(field?.minLength) > 0 ? Number(field.minLength) : undefined}
            onChange={(e) => {
              const limit = Number(field?.maxLength);
              if (Number.isFinite(limit) && limit > 0 && e?.target?.value && e.target.value.length > limit) {
                e.target.value = e.target.value.slice(0, limit);
              }
            }}
          />
        </div>
      );
    },
    [handleFieldClick]
  );

  // Optimized renderEventInputField function
  const renderEventInputField = useCallback(
    (field) => {
      if (!field?.type || !FIELD_TYPES.includes(field.type)) {
        return null;
      }

      return (
        <div onClick={() => handleEventFieldClick(field)}>
          <FormInput
            {...field}
            maxLength={Number(field?.maxLength) > 0 ? Number(field.maxLength) : undefined}
            minLength={Number(field?.minLength) > 0 ? Number(field.minLength) : undefined}
            onChange={(e) => {
              const limit = Number(field?.maxLength);
              if (Number.isFinite(limit) && limit > 0 && e?.target?.value && e.target.value.length > limit) {
                e.target.value = e.target.value.slice(0, limit);
              }
            }}
          />
        </div>
      );
    },
    [handleEventFieldClick]
  );

  const onChange = useCallback((name, updateValue) => {
    const { label } = updateValue;
    updateValue["placeHolder"] = label;
    return updateValue;
  }, []);

  const [ticketFormData, setTicketFormData] = useState(null);
  const [tempTicketFormData] = useState([
    // Type selector - no condition needed
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: activeInputType,
      tag: true,
      label: "Type",
      showItem: "Type",
      required: false,
      view: true,
      filter: false,
      add: false,
      update: false,
      apiType: "JSON",
      selectApi: [
        { id: "text", value: "Text", icon: "text" },
        // { id: "password", value: "Password", icon: "password" },
        { id: "email", value: "Email", icon: "email" },
        { id: "number", value: "Number", icon: "number" },
        { id: "mobilenumber", value: "Mobile Number", icon: "mobilenumber" },
        { id: "time", value: "Time", icon: "time" },
        { id: "date", value: "Date", icon: "date" },
        { id: "datetime", value: "Date Time", icon: "datetime" },
        { id: "image", value: "Image", icon: "image" },
        { id: "file", value: "File", icon: "file" },
        { id: "textarea", value: "Text Area", icon: "textarea" },
        { id: "htmleditor", value: "Html Editor", icon: "paragraph" },
        { id: "checkbox", value: "Check Box", icon: "checkBox" },
        { id: "toggle", value: "Toggle", icon: "toggle" },
        { id: "select", value: "Select", icon: "dropDown" },
        { id: "multiSelect", value: "Multi Select", icon: "multipleChoice" },
        { id: "info", value: "Info", icon: "info" },
        { id: "html", value: "Html", icon: "html" },
        { id: "line", value: "Line", icon: "line" },
        // { id: "title", value: "Title", icon: "title" },
      ],
    },
    // Title field - only for title type
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      condition: {
        item: "type",
        if: ["title"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Title",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "",
      selectApi: "",
    },
    // Content field - only for info type
    {
      type: "htmleditor",
      placeholder: "Content",
      name: "content",
      condition: {
        item: "type",
        if: ["info", "html"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Content",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "",
      selectApi: "",
    },
    // Label field - disabled for line
    {
      type: "text",
      placeholder: "Label",
      name: "label",
      condition: {
        item: "type",
        if: ["line"],
        then: "disabled",
        else: "enabled",
      },
      validation: "",
      default: activeInput ? activeInput?.label : "",
      label: "Label",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
      onChange: onChange,
      footnote: "This text appears above the input field",
    },
    // Placeholder - enabled for input types
    {
      type: "text",
      placeholder: "Place Holder",
      name: "placeholder",
      condition: {
        item: "type",
        if: ["text", "email", "number", "mobilenumber", "textarea", "select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Place Holder",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
      footnote: "Helper text that guides users on what to enter",
    },
    // Required checkbox
    {
      type: "toggle",
      placeholder: "Required",
      name: "required",
      condition: {
        item: "type",
        if: ["line", "title", "info", "html"],
        then: "disabled",
        else: "enabled",
      },
      validation: "",
      default: activeInput && ["firstName", "authenticationId", "emailId"].includes(activeInput?.name) ? true : activeInput ? activeInput?.required : false,
      tag: true,
      label: "Required",
      required: false,
      view: true,
      add: true,
      update: true,
      footnote: activeInput && ["firstName", "authenticationId", "emailId"].includes(activeInput?.name) ? "This field always required and cannot be changed" : "Make this field mandatory to submit",
      disabled: activeInput && ["firstName", "authenticationId", "emailId"].includes(activeInput?.name),
    },
    {
      type: "toggle",
      placeholder: "Searchable dropdown",
      name: "searchableDropdown",
      condition: {
        item: "type",
        if: ["select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "true",
      tag: true,
      label: "Searchable dropdown",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Settings",
      footnote: "Whether the dropdown is searchable",
    },
    {
      type: "line",
      condition: {
        item: "type",
        if: ["select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      add: true,
      update: true,
      group: "Settings",
    },
    {
      type: "toggle",
      placeholder: "Default State",
      name: "defaultState",
      condition: {
        item: "type",
        if: ["checkbox"],
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "true",
      tag: true,
      label: "Default State",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Settings",
      footnote: "Whether the checkbox is checked by default",
    },
    {
      type: "line",
      condition: {
        item: "type",
        if: ["checkbox"],
        then: "enabled",
        else: "disabled",
      },
      add: true,
      update: true,
      group: "Settings",
    },
    {
      type: "select",
      name: "customClass",
      label: "Width",
      apiType: "JSON",
      selectType: "card",
      selectApi: [
        { id: "half", value: "Half Width" },
        { id: "full", value: "Full Width" },
      ],
      default: "full",
      add: true,
      update: true,
      view: true,
      group: "Settings",
      icon: "width",
      customClass: "quarter",
      footnote: "How much space this field takes in the form layout",
    },
    {
      type: "line",
      add: true,
      update: true,
      group: "Settings",
    },
    // Info block for email validation hint under Settings
    {
      type: "info",
      name: "emailValidationInfo",
      condition: {
        item: "type",
        if: ["email"],
        then: "enabled",
        else: "disabled",
      },
      content: "This field automatically checks for valid email format (like user@example.com)",
      add: true,
      update: true,
      group: "Settings",
    },
    {
      type: "info",
      name: "numberValidationInfo",
      condition: {
        item: "type",
        if: ["number"],
        then: "enabled",
        else: "disabled",
      },
      content: "This field only accepts numeric values (integers and decimals) without any special characters or spaces",
      add: true,
      update: true,
      group: "Settings",
    },
    {
      type: "info",
      name: "checkboxValidationInfo",
      condition: {
        item: "type",
        if: ["checkbox"],
        then: "enabled",
        else: "disabled",
      },
      content: "Users can check or uncheck this option. Perfect for agreements, preferences, or confirmations.",
      add: true,
      update: true,
      group: "Settings",
    },
    {
      type: "info",
      name: "selectInfo",
      condition: {
        item: "type",
        if: ["select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      add: true,
      content: "Great for long lists of options. Keeps your form compact while offering many choices.",
      update: true,
      group: "Settings",
    },
    // Character Length Title
    {
      type: "title",
      title: "Character Length",
      name: "sm",
      condition: {
        item: "type",
        if: ["mobilenumber", "textarea", "text", "number"],
        then: "enabled",
        else: "disabled",
      },
      add: true,
      update: true,
      group: "Advanced",
    },
    {
      type: "title",
      title: "Number Length",
      name: "sm",
      condition: {
        item: "type",
        if: ["number"],
        then: "enabled",
        else: "disabled",
      },
      add: true,
      update: true,
      group: "Advanced",
    },
    {
      type: "text",
      placeholder: "No Limit",
      name: "minimum",
      condition: {
        item: "type",
        if: ["number"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Minimum",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
      customClass: "quarter",
    },
    // Maximum length
    {
      type: "text",
      placeholder: "No Limit",
      name: "maximum",
      condition: {
        item: "type",
        if: ["number"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Maximum",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
      footnote: "Set the allowed range of numbers users can enter",
      customClass: "quarter",
    },
    // Minimum length
    {
      type: "number",
      placeholder: "0",
      name: "minLength",
      condition: {
        item: "type",
        if: ["mobilenumber", "textarea", "text", "number"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "0",
      tag: false,
      label: "Minimum Characters",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
      customClass: "quarter",
    },
    // Maximum length
    {
      type: "number",
      placeholder: "No Limit",
      name: "maxLength",
      condition: {
        item: "type",
        if: ["mobilenumber", "textarea", "text", "number"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "0",
      tag: false,
      label: "Maximum Characters",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
      customClass: "quarter",
      footnote: "Control how many characters users can enter",
    },
    {
      type: "line",
      add: true,
      update: true,
      group: "Advanced",
    },
    {
      type: "toggle",
      placeholder: "Enable Condition",
      name: "conditionEnabled",
      validation: "",
      default: "false",
      tag: true,
      label: "Conditional visibility",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
      footnote: "Show this field only when certain conditions are met",
    },
    // Match Values
    {
      type: "text",
      placeholder: "Match Values",
      name: "conditionCheckMatch",
      condition: {
        item: "conditionEnabled",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Match Values",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
    },
    // If Match Action
    {
      type: "select",
      placeholder: "If Match",
      name: "conditionIfMatch",
      condition: {
        item: "conditionEnabled",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      apiType: "JSON",
      selectApi: [
        { id: "enabled", value: "Show This Filed" },
        { id: "disabled", value: "Hide This Filed" },
      ],
      label: "Check Match Values",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
    },
    // Condition Field
    {
      type: "select",
      placeholder: "Condition Checking Field",
      name: "conditionWhenField",
      condition: {
        item: "conditionEnabled",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Condition Checking Field",
      tag: true,
      required: false,
      view: true,
      add: true,
      apiType: "JSON",
      selectApi: [],
      update: true,
      group: "Advanced",
    },
    {
      type: "line",
      add: true,
      update: true,
      group: "Advanced",
    },
    {
      type: "toggle",
      placeholder: "Enable Additional",
      name: "additionalEnabled",
      validation: "",
      default: "false",
      tag: true,
      label: "Custom attributes",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
      footnote: "Add HTML attributes for advanced customization",
    },
    // Sub Label - disabled for line, title, info
    {
      type: "text",
      placeholder: "Sub Label",
      name: "sublabel",
      condition: {
        item: "additionalEnabled",
        // if: ["line", "title", "info", "html"],
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Sub Label",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
    },
    // Foot Note - disabled for title and info
    {
      type: "text",
      placeholder: "Foot Note",
      name: "footnote",
      condition: {
        item: "additionalEnabled",
        // if: ["title", "info", "html", "line"],
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Foot Note",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
    },
    // Default value
    {
      type: "text",
      placeholder: "Default",
      name: "default",
      condition: {
        item: "additionalEnabled",
        // if: ["title", "info", "html", "line"],
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Default",
      tag: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
    },
    {
      type: "date",
      placeholder: "Minimum",
      name: "minDate",
      condition: {
        item: "type",
        if: ["date", "datetime"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "empty",
      tag: false,
      label: "Minimum",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
    },
    // Maximum length
    {
      type: "date",
      placeholder: "Maximum",
      name: "maxDate",
      condition: {
        item: "type",
        if: ["date", "datetime"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "empty",
      tag: false,
      label: "Maximum",
      required: false,
      view: true,
      add: true,
      update: true,
      group: "Advanced",
    },
    // API Type - only for select types
    {
      type: "hidden",
      placeholder: "Api Type",
      name: "apiType",
      condition: {
        item: "type",
        if: ["select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "CSV",
      tag: false,
      label: "Api Type",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "CSV",
    },
    // Select API for single select
    {
      type: "options",
      placeholder: "Add options",
      name: "selectApi",
      condition: {
        item: "type",
        if: ["select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Add options",
      required: false,
      view: true,
      add: true,
      update: true,
      footnote: "Check the box to set a default selection. Users will see this option pre-selected.",
    },
    // Select API for multi select
    {
      type: "textarea",
      placeholder: "Select Api",
      name: "selectApi",
      condition: {
        item: "type",
        if: ["multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Select Api",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "multiSelect",
      placeholder: "Allowed File Types",
      name: "allowedFileTypes",
      condition: {
        item: "type",
        if: ["file"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Allowed File Types",
      required: true,
      view: true,
      add: true,
      update: true,
      apiType: "JSON",
      selectApi: [
        // Images
        { id: "image/jpeg", value: "JPG/JPEG Image" },
        { id: "image/png", value: "PNG Image" },
        { id: "image/gif", value: "GIF Image" },
        // Documents
        { id: "application/pdf", value: "PDF Document" },
        { id: "application/msword", value: "Word Document (DOC)" },
        { id: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", value: "Word Document (DOCX)" },
        { id: "text/plain", value: "Text File" },
        // Spreadsheets
        { id: "text/csv", value: "CSV File" },
        { id: "application/vnd.ms-excel", value: "Excel Spreadsheet (XLS)" },
        { id: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", value: "Excel Spreadsheet (XLSX)" },
        // Optional additional formats you might want to include
        { id: "image/webp", value: "WebP Image" },
        { id: "image/svg+xml", value: "SVG Image" },
        { id: "application/vnd.oasis.opendocument.text", value: "OpenDocument Text (ODT)" },
        { id: "application/vnd.oasis.opendocument.spreadsheet", value: "OpenDocument Spreadsheet (ODS)" },
        { id: "application/zip", value: "ZIP Archive" },
        { id: "application/x-rar-compressed", value: "RAR Archive" },
      ],
    },
    // Collection - no condition needed
    {
      type: "hidden",
      placeholder: "Collection",
      name: "dbcollection",
      validation: "",
      default: "formData",
      label: "Collection",
      tag: false,
      view: true,
      add: true,
      update: true,
    },
    // Show Item - no condition needed
    {
      type: "hidden",
      placeholder: "Show Item",
      name: "showItem",
      validation: "",
      default: "",
      label: "Show Item",
      tag: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "hidden",
      placeholder: "Tag",
      name: "tag",
      validation: "",
      default: "true",
      value: true,
      tag: false,
      label: "Tag",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // View permission
    {
      type: "hidden",
      value: true,
      placeholder: "View",
      name: "view",
      validation: "",
      tag: false,
      label: "View",
      required: false,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    // Add permission
    {
      type: "hidden",
      placeholder: "Add",
      value: true,
      name: "add",
      validation: "",
      tag: false,
      label: "Add",
      required: false,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    // Update permission
    {
      type: "hidden",
      value: true,
      placeholder: "Update",
      name: "update",
      validation: "",
      tag: false,
      label: "Update",
      required: false,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    // Filter permission
    {
      type: "hidden",
      placeholder: "Filter",
      value: true,
      name: "filter",
      validation: "",
      tag: false,
      label: "Filter",
      required: false,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    {
      type: "select",
      label: "How to load country codes?",
      showLabel: true,
      name: "countryLoadingType",
      default: "all",
      condition: {
        item: "type",
        if: ["mobilenumber"],
        then: "enabled",
        else: "disabled",
      },
      selectApi: [
        { id: "all", value: "All Countries" },
        { id: "exclude", value: "Exclude Some Countries" },
        { id: "include", value: "Limit to Specific Countries" },
      ],
      apiType: "JSON",
      selectType: "radio",
      add: true,
      update: true,
    },
    {
      type: "multiSelect",
      placeholder: "Specific Countries",
      name: "country",
      condition: {
        item: "countryLoadingType",
        if: ["include"],
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Select your specific countries",
      tag: true,
      selectApi: "country/select?isSovereign=true",
      apiType: "API",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "multiSelect",
      placeholder: "Excluded Countries",
      name: "country",
      condition: {
        item: "countryLoadingType",
        if: ["exclude"],
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Select countries to exclude",
      tag: true,
      selectApi: "country/select?isSovereign=true",
      apiType: "API",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  useEffect(() => {
    const temp = [...tempTicketFormData];
    temp[0].default = activeInputType;

    const conditionField = temp.find((item) => item?.name === "conditionWhenField");
    if (conditionField && eventFormFields?.length) {
      conditionField.selectApi = [...eventFormFields, ...formFields].map((field) => ({
        value: field?.label || "",
        id: field?.name || "",
      }));
    }

    // Remove any pre-existing Grade Type field if present
    const gradeTypeIndex = temp.findIndex((item) => item?.name === "gradeType");
    if (gradeTypeIndex !== -1) {
      temp.splice(gradeTypeIndex, 1);
    }

    console.log(conditionField);
    setTicketFormData(temp);
  }, [activeInputType, tempTicketFormData, eventFormFields, formFields, props?.data?.type]);

  const submitChange = async (post) => {
    // Check if user is trying to change core fields (firstName, authenticationId, emailId)
    if (activeInput && ["firstName", "authenticationId", "emailId"].includes(activeInput?.name)) {
      // Only prevent required status changes for core fields
      if (post.required === false) {
        toast.error("This field always required and cannot be changed");
        return;
      }
      // Force required to always be true for core fields
      post.required = true;
    }

    // Persist min/max length into validation string for text-like fields
    try {
      if (["text", "email", "textarea", "mobilenumber"].includes(activeInputType)) {
        const toInt = (v) => (v === undefined || v === null || v === "" ? undefined : parseInt(v, 10));
        const minL = toInt(post.minLength);
        const maxL = toInt(post.maxLength);
        const existing = (activeInput?.validation || post.validation || "").split("|").filter(Boolean);
        const withoutMinMax = existing.filter((t) => !/^min:\d+$/.test(t) && !/^max:\d+$/.test(t));
        if (Number.isInteger(minL)) withoutMinMax.push(`min:${minL}`);
        if (Number.isInteger(maxL)) withoutMinMax.push(`max:${maxL}`);
        post.validation = withoutMinMax.join("|");
      }
    } catch (_) {}

    putData({ id, ...post }, "ticket-form-data").then((response) => {
      if (response?.data?.success === true) {
        toast.success("A field has been updated in the form");
        closeModal();
      }
    });
    // write your code here
  };

  const submitEventChange = async (post) => {
    // Check if this is the static abstraction field
    if (id === "abstraction_field_static") {
      toast.error("This is a static field for Abstraction forms and cannot be modified");
      closeModal();
      return;
    }

    // Check if user is trying to change core fields (firstName, authenticationId, emailId)
    if (activeInput && ["firstName", "authenticationId", "emailId"].includes(activeInput?.name)) {
      // Only prevent required status changes for core fields
      if (post.required === false) {
        toast.error("This field always required and cannot be changed");
        return;
      }
      // Force required to always be true for core fields
      post.required = true;
    }

    // Persist min/max length into validation string for text-like fields
    try {
      if (["text", "email", "textarea", "mobilenumber"].includes(activeInputType)) {
        const toInt = (v) => (v === undefined || v === null || v === "" ? undefined : parseInt(v, 10));
        const minL = toInt(post.minLength);
        const maxL = toInt(post.maxLength);
        const existing = (activeInput?.validation || post.validation || "").split("|").filter(Boolean);
        const withoutMinMax = existing.filter((t) => !/^min:\d+$/.test(t) && !/^max:\d+$/.test(t));
        if (Number.isInteger(minL)) withoutMinMax.push(`min:${minL}`);
        if (Number.isInteger(maxL)) withoutMinMax.push(`max:${maxL}`);
        post.validation = withoutMinMax.join("|");
      }
    } catch (_) {}

    putData({ id, ...post }, "event-form-fields").then((response) => {
      if (response?.data?.success === true) {
        toast.success("A field has been updated in the form");
        closeModal();
      }
    });
    // write your code here
  };
  const generateFormFields = useCallback((response, countries) => {
    if (!response || !countries) return [];

    return response.map((field) => {
      if (field?.type === "mobilenumber") {
        // Create a new object to avoid mutating the original
        return {
          ...field,
          countries: getCountries(field, countries),
        };
      }
      // Normalize legacy length keys so UI limits work
      if (["text", "email", "textarea", "mobilenumber"].includes(field?.type)) {
        const normalized = { ...field };
        const isNumeric = (v) => typeof v === "number" || (typeof v === "string" && /^\d+$/.test(v.trim()));
        if (normalized.maxLength == null && isNumeric(normalized.maximum)) {
          normalized.maxLength = Number(normalized.maximum);
        }
        if (normalized.minLength == null && isNumeric(normalized.minimum)) {
          normalized.minLength = Number(normalized.minimum);
        }
        // Extract from validation string: min:X|max:Y
        if (typeof normalized.validation === "string" && normalized.validation.length > 0) {
          const parts = normalized.validation.split("|").filter(Boolean);
          for (const p of parts) {
            const m1 = p.match(/^min:(\d+)$/);
            const m2 = p.match(/^max:(\d+)$/);
            if (m1) normalized.minLength = Number(m1[1]);
            if (m2) normalized.maxLength = Number(m2[1]);
          }
        }
        return normalized;
      }
      return field;
    });
  }, []);
  useEffect(() => {
    // Fix: Determine the correct ticket ID based on the data structure
    // For participant type forms, use participantType ID if available, otherwise use _id
    const ticketId = props?.data?.participantType || props?.data?._id;
    const eventId = props?.data?.event?._id;

    if (!ticketId || !eventId) {
      console.error("EventForm useEffect - Missing required IDs:", { ticketId, eventId });
      return;
    }

    setIsLoadingFields(true);
    getData({ ticket: ticketId, eventId: eventId }, "ticket-form-data")
      .then((response) => {
        setFormFields(generateFormFields(response?.data?.response, response?.data?.countries));
        setOriginalFormFields(generateFormFields(response?.data?.response, response?.data?.countries) || []);
        setEventFormFields(generateFormFields(response?.data?.eventForm, response?.data?.countries).sort((a, b) => (a.orderId || 0) - (b.orderId || 0)));
        setCountries(response?.data?.countries);
        setTicketData(response?.data?.ticketData);
        setIsLoadingFields(false);
      })
      .catch((error) => {
        console.error("EventForm API error:", error);
        setIsLoadingFields(false);
      });
  }, [props, triggerEffect]);

  // Initialize sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging after moving 5 pixels
      },
    })
  );

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active?.id !== over?.id) {
      const oldIndex = formFields?.findIndex((item) => item?._id === active?.id);
      const newIndex = formFields?.findIndex((item) => item?._id === over?.id);

      const newFormFields = arrayMove(formFields, oldIndex, newIndex);

      // Update orderId based on new index
      const updatedFields = newFormFields.map((field, index) => ({
        ...field,
        orderId: index + 1, // Ensure orderId is updated according to new order
      }));

      try {
        props?.setLoaderBox(true);
        // Trigger the updates and wait for all of them to complete
        const updatePromises = updatedFields.map((item) => {
          return putData(
            { id: item?._id, orderId: item?.orderId }, // Update only relevant fields
            "ticket-form-data"
          );
        });

        // Wait for all the promises to resolve
        await Promise.all(updatePromises);

        setTriggerEffect((prevState) => !prevState);
        props?.setLoaderBox(false);
      } catch (error) {
        console.error("Error updating form fields:", error);
      }
    }
  };
  // Handle drag end
  const handleEventDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active?.id !== over?.id) {
      const oldIndex = eventFormFields?.findIndex((item) => item?._id === active?.id);
      const newIndex = eventFormFields?.findIndex((item) => item?._id === over?.id);

      const newFormFields = arrayMove(eventFormFields, oldIndex, newIndex);

      // Update orderId based on new index
      const updatedFields = newFormFields.map((field, index) => ({
        ...field,
        orderId: index + 1, // Ensure orderId is updated according to new order
      }));

      try {
        props?.setLoaderBox(true);
        // Trigger the updates and wait for all of them to complete
        const updatePromises = updatedFields.map((item) => {
          return putData(
            { id: item?._id, orderId: item?.orderId }, // Update only relevant fields
            "event-form-fields"
          );
        });

        // Wait for all the promises to resolve
        await Promise.all(updatePromises);

        setTriggerEffect((prevState) => !prevState);
        props?.setLoaderBox(false);
      } catch (error) {
        console.error("Error updating form fields:", error);
      }
    }
  };

  // Memoized SortableItem Component for Custom Fields
  const SortableItem = memo(({ field }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field?._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const handleDeleteClick = useCallback(
      (e) => {
        e.stopPropagation();
        handleDeleteField(field);
      },
      [field]
    );

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 rounded-lg border group relative transition-all duration-200 cursor-pointer hover:shadow-sm border-gray-200 hover:border-blue-300 ${
          (field.customClass || "half") === "full" ? "col-span-2" : "col-span-1"
        }`}
        data-field-width={field.customClass === "full" ? "double" : "single"}
        data-field-id={field._id}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center mr-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div onClick={() => handleFieldClick(field)}>{renderInputField(field)}</div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="text-red-500 hover:bg-red-50 p-1 rounded" onClick={handleDeleteClick}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  });

  // Memoized SortableEventItem Component for Primary Fields
  const SortableEventItem = memo(({ field }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field?._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const handleDeleteClick = useCallback(
      (e) => {
        e.stopPropagation();
        handleEventDeleteField(field);
      },
      [field]
    );

    const handleFieldClick = useCallback(() => {
      // Disable editing for Abstraction forms
      if (isEditingEnabled && props?.data?.type !== "Abstraction") {
        handleEventFieldClick(field);
      }
    }, [isEditingEnabled, field, handleEventFieldClick]);

    // Check if editing is disabled for Abstraction forms
    const isAbstractionForm = props?.data?.type === "Abstraction";
    const canEdit = isEditingEnabled && !isAbstractionForm;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 rounded-lg border group relative transition-all duration-200 ${
          canEdit ? "cursor-pointer hover:shadow-sm border-gray-200 hover:border-blue-300" : "cursor-not-allowed opacity-75 border-gray-200"
        }`}
        data-field-id={field._id}
      >
        <div className="flex items-start justify-between">
          <div className={`flex items-center mr-2 ${canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed"}`} {...(canEdit ? { ...attributes, ...listeners } : {})}>
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div onClick={handleFieldClick}>{renderEventInputField(field)}</div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-red-500 hover:bg-red-50 p-1 rounded" onClick={handleDeleteClick}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  });

  // Open clone popup and fetch tickets for this event
  const openClonePopup = async () => {
    setIsClonePopupOpen(true);
    setIsLoadingTickets(true);
    setSelectedCloneTicket(null);
    try {
      const response = await getData({ event: props?.data?.event?._id }, "ticket");
      setCloneTickets(response?.data?.response?.filter((t) => t._id !== props?.data?._id) || []);
    } catch (e) {
      setCloneTickets([]);
    }
    setIsLoadingTickets(false);
  };
  const closeClonePopup = () => {
    setIsClonePopupOpen(false);
    setSelectedCloneTicket(null);
  };
  // Clone fields from selected ticket
  const handleCloneFields = async () => {
    if (!selectedCloneTicket) return;
    setIsCloning(true);
    try {
      // 1. Get fields from the selected ticket
      const response = await getData({ ticket: selectedCloneTicket }, "ticket-form-data");
      const clonedFields = response?.data?.response || [];

      // 2. Get current fields to avoid duplicates
      const currentFieldNames = new Set((originalFormFields || []).map((f) => f.name));

      // 3. For each cloned field, if not already present, POST to backend
      for (const field of clonedFields) {
        if (!currentFieldNames.has(field.name)) {
          // Remove _id and ticket from the cloned field, set ticket to current ticket
          const { _id, ticket, ...rest } = field;
          await postData({ ...rest, ticket: props?.data?._id }, "ticket-form-data");
        }
      }

      // 4. Refetch and update UI
      const updated = await getData({ ticket: props?.data?._id, eventId: props?.data?.event?._id }, "ticket-form-data");
      setFormFields(generateFormFields(updated?.data?.response, updated?.data?.countries));
      setOriginalFormFields(generateFormFields(updated?.data?.response, updated?.data?.countries));
      toast.success("Custom fields cloned and saved!");
      closeClonePopup();
    } catch (e) {
      toast.error("Failed to clone fields");
    }
    setIsCloning(false);
  };

  const filterFields = (fields) => {
    return fields.filter((field) => {
      const label = field.label.toLowerCase();
      const value = field.value.toLowerCase();
      const query = searchQuery.toLowerCase();
      return label.includes(query) || value.includes(query);
    });
  };

  // Memoized sorted event form fields
  const sortedEventFormFields = useMemo(() => {
    // ALWAYS filter out "Submit your Abstraction" field from database for ALL form types
    // We'll render it conditionally in the UI for Abstraction forms only
    const filtered = eventFormFields.filter((field) => {
      const isAbstractionField =
        field.name === "submit_abstraction" ||
        field.name === "submit_your_abstraction" ||
        field.label === "Submit your Abstraction" ||
        (field.type === "file" && field.label && field.label.toLowerCase().includes("abstraction"));

      if (isAbstractionField) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => (a.orderId || 0) - (b.orderId || 0));
  }, [eventFormFields, props?.data?.type]);

  const renderGeneralSettings = () => (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Form Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => {
              console.log("🔍 [TITLE INPUT] onChange triggered:", {
                newValue: e.target.value,
                currentFormTitle: formTitle,
                timestamp: new Date().toISOString(),
              });
              setFormTitle(e.target.value);
              // Debounce save
              debouncedSave("formTitle", { title: e.target.value });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formDescription}
            onChange={(e) => {
              console.log("🔍 [DESCRIPTION INPUT] onChange triggered:", {
                newValue: e.target.value,
                currentFormDescription: formDescription,
                timestamp: new Date().toISOString(),
              });
              setFormDescription(e.target.value);
              // Debounce save
              debouncedSave("formDescription", { description: e.target.value });
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderApprovalSettings = () => (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="mb-6">
        <TabButtons
          tabs={[
            { key: "submission", title: "On Submission" },
            { key: "approval", title: "On Approval" },
            { key: "rejection", title: "On Rejection" },
          ]}
          selectedTab={activeApprovalTab}
          selectedChange={setActiveApprovalTab}
          design="underline"
        />
      </div>

      <div className="bg-bg-white border border-stroke-soft rounded-lg p-4 shadow-sm">
        <div className="grid gap-6 h-[400px]" style={{ gridTemplateColumns: "7fr 3fr" }}>
          {/* Configuration Panel */}
          <div className="overflow-y-auto pr-2">
            {activeApprovalTab === "submission" && (
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  {activeApprovalChannel === "email" ? "Email Configuration" : activeApprovalChannel === "whatsapp" ? "WhatsApp Configuration" : "Website Configuration"}
                </h4>

                {/* Tab Navigation for Email/WhatsApp/Website */}
                <div className="mb-4">
                  <TabButtons
                    tabs={[
                      { key: "email", title: "Email", icon: "email" },
                      { key: "whatsapp", title: "WhatsApp", icon: "whatsapp" },
                      { key: "website", title: "Website", icon: "globe" },
                    ]}
                    selectedTab={activeApprovalChannel}
                    selectedChange={setActiveApprovalChannel}
                    design="underline"
                  />
                </div>

                {activeApprovalChannel === "email" && (
                  <div>
                    <div className="mb-4">
                      <FormInput
                        type="toggle"
                        name="enable-email"
                        label="Send confirmation email"
                        value={enableEmail}
                        onChange={(checked) => {
                          setEnableEmail(checked);
                          saveSettings({ enableEmail: checked }, { silent: true });
                        }}
                        customClass="full"
                      />
                    </div>
                    <div className="mb-3">
                      <FormInput
                        type="toggle"
                        name="attach-badge-email"
                        label="Attach badge/ticket"
                        value={attachBadgeEmail}
                        onChange={(checked) => {
                          setAttachBadgeEmail(checked);
                          saveSettings({ attachBadgeEmail: checked }, { silent: true });
                        }}
                        customClass="full"
                      />
                    </div>
                    <div className="mb-3">
                      <FormInput
                        type="toggle"
                        name="enable-email-calendar"
                        label="Attach calendar invite (.ics)"
                        value={enableEmailCalendar}
                        onChange={(checked) => {
                          setEnableEmailCalendar(checked);
                          saveSettings({ enableEmailCalendar: checked }, { silent: true });
                        }}
                        customClass="full"
                      />
                    </div>

                    {enableEmail && (
                      <div className="space-y-3">
                        <div>
                          <FormInput
                            type="text"
                            name="email-subject"
                            label="Email Subject"
                            value={emailSubject}
                            onChange={(e) => {
                              setEmailSubject(e.target.value);
                              debouncedSave("emailSubject", { emailSubject: e.target.value });
                            }}
                            customClass="full"
                          />
                        </div>
                        <div>
                          <EditorNew
                            value={emailMessage}
                            placeholder="Email Message"
                            customClass="full"
                            onChange={(content) => {
                              setEmailMessage(content);
                              debouncedSave("emailMessage", { emailTemplate: content });
                            }}
                            onEditorReady={setEmailEditor}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Available variables:{" "}
                          {availableVariables.map((variable, index) => (
                            <span key={variable.key}>
                              <VariableButton variable={variable.label} messageType="email" />
                              {index < availableVariables.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeApprovalChannel === "whatsapp" && (
                  <div>
                    <div className="mb-4">
                      <FormInput
                        type="toggle"
                        name="enable-whatsapp"
                        label="Send confirmation WhatsApp"
                        value={enableWhatsapp}
                        onChange={(checked) => {
                          setEnableWhatsapp(checked);
                          saveSettings({ enableWhatsapp: checked }, { silent: true });
                        }}
                        customClass="full"
                      />
                    </div>
                    <div className="mb-3">
                      <FormInput
                        type="toggle"
                        name="attach-badge-whatsapp"
                        label="Attach badge/ticket"
                        value={attachBadgeWhatsapp}
                        onChange={(checked) => {
                          setAttachBadgeWhatsapp(checked);
                          saveSettings({ attachBadgeWhatsapp: checked }, { silent: true });
                        }}
                        customClass="full"
                      />
                    </div>

                    {getHiddenTabs().includes("whatsapp") ? (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-gray-600">
                          <p className="text-sm font-medium mb-2">Using Default EventHex WhatsApp Template</p>
                          <p className="text-xs text-gray-500">
                            The message content is managed by EventHex Business Account. To customize the WhatsApp message, please update your event settings to use a custom WhatsApp configuration.
                          </p>
                        </div>
                      </div>
                    ) : (
                      enableWhatsapp && (
                        <div className="space-y-3">
                          <div>
                            <FormInput
                              type="textarea"
                              name="submission-whatsapp-message"
                              label="WhatsApp Message"
                              value={whatsappMessage}
                              onChange={(e) => {
                                setWhatsappMessage(e.target.value);
                                debouncedSave("whatsappMessage", { whatsappTemplate: e.target.value });
                              }}
                              customClass="full"
                              size="large"
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            Available variables:{" "}
                            {availableVariables.map((variable, index) => (
                              <span key={variable.key}>
                                <VariableButton variable={variable.label} messageType="whatsapp" />
                                {index < availableVariables.length - 1 && ", "}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {activeApprovalChannel === "website" && (
                  <div>
                    <div className="space-y-3">
                      <div>
                        <EditorNew
                          value={websiteMessage}
                          placeholder="Confirmation Message"
                          customClass="full"
                          onChange={(content) => {
                            setWebsiteMessage(content);
                            debouncedSave("websiteMessage", { onsuccessfullMessage: content });
                          }}
                          onEditorReady={setWebsiteEditor}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Available variables:{" "}
                        {availableVariables.map((variable, index) => (
                          <span key={variable.key}>
                            <VariableButton variable={variable.label} messageType="website" />
                            {index < availableVariables.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeApprovalTab === "approval" && (
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Approval Configuration</h4>

                {/* Email/WhatsApp Toggle */}
                <div className="mb-4">
                  <TabButtons
                    tabs={[
                      { key: "email", title: "Email", icon: "email" },
                      { key: "whatsapp", title: "WhatsApp", icon: "whatsapp" },
                    ]}
                    selectedTab={activeApprovalChannel}
                    selectedChange={setActiveApprovalChannel}
                    design="underline"
                  />
                </div>

                {activeApprovalChannel === "email" && (
                  <div className="space-y-3">
                    <div>
                      <FormInput
                        type="toggle"
                        name="enable-approval-email"
                        label="Send confirmation email"
                        value={enableApprovalEmail}
                        onChange={(checked) => {
                          setEnableApprovalEmail(checked);
                          saveSettings({ enableApprovalEmail: checked }, { silent: true });
                        }}
                        customClass="full"
                      />
                    </div>
                    {enableApprovalEmail && (
                      <>
                        <div>
                          <FormInput
                            type="toggle"
                            name="attach-badge-email-approval"
                            label="Attach badge/ticket"
                            value={attachBadgeEmailOnApproval}
                            onChange={(checked) => {
                              setAttachBadgeEmailOnApproval(checked);
                              saveSettings({ attachBadgeEmailOnApproval: checked }, { silent: true });
                            }}
                            customClass="full"
                          />
                        </div>
                      </>
                    )}
                    {enableApprovalEmail && (
                      <>
                        <div>
                          <FormInput
                            type="text"
                            name="approval-email-subject"
                            label="Approval Email Subject"
                            value={approvalEmailSubject}
                            onChange={(e) => {
                              setApprovalEmailSubject(e.target.value);
                              debouncedSave("approvalEmailSubject", { approvalEmailSubject: e.target.value });
                            }}
                            customClass="full"
                          />
                        </div>
                        <div>
                          <EditorNew
                            value={approvalEmailMessage}
                            placeholder="Approval Email Message"
                            customClass="full"
                            onChange={(content) => {
                              setApprovalEmailMessage(content);
                              debouncedSave("approvalEmailMessage", { approvalEmailTemplate: content });
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Available variables:{" "}
                          {[
                            { key: "firstName", label: "{firstName}" },
                            { key: "event", label: "{event}" },
                            { key: "ticket", label: "{ticket}" },
                            { key: "formTitle", label: "{formTitle}" },
                          ].map((variable, index) => (
                            <span key={variable.key}>
                              <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">{variable.label}</span>
                              {index < 3 && ", "}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    {!enableApprovalEmail && <div className="text-sm text-gray-500 italic">Email notifications are disabled</div>}
                  </div>
                )}

                {activeApprovalChannel === "whatsapp" && (
                  <div className="space-y-3">
                    <div>
                      <FormInput
                        type="toggle"
                        name="approval-whatsapp"
                        label="Send approval WhatsApp message"
                        value={approvalWhatsapp}
                        onChange={(checked) => {
                          setApprovalWhatsapp(checked);
                          saveSettings({ approvalWhatsapp: checked }, { silent: true });
                        }}
                        customClass="full"
                      />
                    </div>

                    {approvalWhatsapp && getHiddenTabs().includes("whatsapp") && (
                      <>
                        <div>
                          <FormInput
                            type="toggle"
                            name="attach-badge-whatsapp-approval"
                            label="Attach badge/ticket"
                            value={attachBadgeWhatsappOnApproval}
                            onChange={(checked) => {
                              setAttachBadgeWhatsappOnApproval(checked);
                              saveSettings({ attachBadgeWhatsappOnApproval: checked }, { silent: true });
                            }}
                            customClass="full"
                          />
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="text-gray-600">
                            <p className="text-sm font-medium mb-2">Using Default EventHex WhatsApp Template</p>
                            <p className="text-xs text-gray-500">
                              The message content is managed by EventHex Business Account. To customize the WhatsApp message, please update your event settings to use a custom WhatsApp configuration.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                    {approvalWhatsapp && !getHiddenTabs().includes("whatsapp") && (
                      <>
                        <div>
                          <FormInput
                            type="toggle"
                            name="attach-badge-whatsapp-approval"
                            label="Attach badge to WhatsApp approval message"
                            value={attachBadgeWhatsappOnApproval}
                            onChange={(checked) => {
                              setAttachBadgeWhatsappOnApproval(checked);
                              saveSettings({ attachBadgeWhatsappOnApproval: checked }, { silent: true });
                            }}
                            customClass="full"
                          />
                        </div>
                        <div>
                          <FormInput
                            type="textarea"
                            name="approval-whatsapp-message"
                            label="Approval WhatsApp Message"
                            value={approvalWhatsappMessage}
                            onChange={(e) => {
                              setApprovalWhatsappMessage(e.target.value);
                              if (approvalWhatsappMessageTimeoutRef?.current) {
                                clearTimeout(approvalWhatsappMessageTimeoutRef.current);
                              }
                              approvalWhatsappMessageTimeoutRef.current = setTimeout(() => {
                                saveSettings({ approvalWhatsappMessage: e.target.value }, { silent: true });
                              }, 700);
                            }}
                            customClass="full"
                            size="large"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Available variables:{" "}
                          {[
                            { key: "firstName", label: "{firstName}" },
                            { key: "event", label: "{event}" },
                            { key: "ticket", label: "{ticket}" },
                            { key: "formTitle", label: "{formTitle}" },
                          ].map((variable, index) => (
                            <span key={variable.key}>
                              <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">{variable.label}</span>
                              {index < 3 && ", "}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeApprovalTab === "rejection" && (
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Rejection Configuration</h4>

                {/* Email/WhatsApp Toggle */}
                <div className="mb-4">
                  <TabButtons
                    tabs={[
                      { key: "email", title: "Email", icon: "email" },
                      { key: "whatsapp", title: "WhatsApp", icon: "whatsapp" },
                    ]}
                    selectedTab={activeApprovalChannel}
                    selectedChange={setActiveApprovalChannel}
                    design="underline"
                  />
                </div>

                {activeApprovalChannel === "email" && (
                  <div className="space-y-3">
                    <div>
                      <FormInput
                        type="toggle"
                        name="enable-rejection-email"
                        label="Send confirmation email"
                        value={enableRejectionEmail}
                        onChange={(checked) => {
                          setEnableRejectionEmail(checked);
                          saveSettings({ enableRejectionEmail: checked }, { silent: true });
                        }}
                        customClass="full"
                      />
                    </div>
                    {enableRejectionEmail && (
                      <>
                        <div>
                          <FormInput
                            type="text"
                            name="rejection-email-subject"
                            label="Rejection Email Subject"
                            value={rejectionEmailSubject}
                            onChange={(e) => {
                              setRejectionEmailSubject(e.target.value);
                              debouncedSave("rejectionEmailSubject", { rejectionEmailSubject: e.target.value });
                            }}
                            customClass="full"
                          />
                        </div>
                        <div>
                          <EditorNew
                            value={rejectionEmailMessage}
                            placeholder="Rejection Email Message"
                            customClass="full"
                            onChange={(content) => {
                              setRejectionEmailMessage(content);
                              debouncedSave("rejectionEmailMessage", { rejectionEmailTemplate: content });
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Available variables:{" "}
                          {[
                            { key: "firstName", label: "{firstName}" },
                            { key: "event", label: "{event}" },
                            { key: "ticket", label: "{ticket}" },
                            { key: "formTitle", label: "{formTitle}" },
                          ].map((variable, index) => (
                            <span key={variable.key}>
                              <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">{variable.label}</span>
                              {index < 3 && ", "}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    {!enableRejectionEmail && <div className="text-sm text-gray-500 italic">Email notifications are disabled</div>}
                  </div>
                )}

                {activeApprovalChannel === "whatsapp" && (
                  <div className="space-y-3">
                    <div>
                      <FormInput
                        type="toggle"
                        name="enable-rejection-whatsapp"
                        label="Send confirmation WhatsApp"
                        value={enableRejectionWhatsapp}
                        onChange={(checked) => {
                          setEnableRejectionWhatsapp(checked);
                          saveSettings({ enableRejectionWhatsapp: checked }, { silent: true });
                        }}
                        customClass="full"
                      />
                    </div>

                    {enableRejectionWhatsapp && getHiddenTabs().includes("whatsapp") && (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-gray-600">
                          <p className="text-sm font-medium mb-2">Using Default EventHex WhatsApp Template</p>
                          <p className="text-xs text-gray-500">
                            The message content is managed by EventHex Business Account. To customize the WhatsApp message, please update your event settings to use a custom WhatsApp configuration.
                          </p>
                        </div>
                      </div>
                    )}
                    {enableRejectionWhatsapp && !getHiddenTabs().includes("whatsapp") && (
                      <>
                        <div>
                          <FormInput
                            type="textarea"
                            name="rejection-whatsapp-message"
                            label="Rejection WhatsApp Message"
                            value={rejectionWhatsappMessage}
                            onChange={(e) => {
                              setRejectionWhatsappMessage(e.target.value);
                              setTimeout(() => {
                                saveSettings({ rejectionWhatsappMessage: e.target.value }, { silent: true });
                              }, 500);
                            }}
                            customClass="full"
                            size="large"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Available variables:{" "}
                          {[
                            { key: "firstName", label: "{firstName}" },
                            { key: "event", label: "{event}" },
                            { key: "ticket", label: "{ticket}" },
                            { key: "formTitle", label: "{formTitle}" },
                          ].map((variable, index) => (
                            <span key={variable.key}>
                              <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">{variable.label}</span>
                              {index < 3 && ", "}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    {!enableRejectionWhatsapp && <div className="text-sm text-gray-500 italic">WhatsApp notifications are disabled</div>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="overflow-y-auto pl-2">
            {activeApprovalTab === "submission" && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                {activeApprovalChannel === "email" && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Email Confirmation</span>
                    </div>
                    {enableEmail ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">To:</span>{" "}
                          {isLoadingRegistration ? (
                            <span className="text-gray-400 italic">Loading...</span>
                          ) : (
                            <span className={registrationData?.emailId && registrationData.emailId !== "{firstName}@gmail.com" ? "text-gray-900" : "text-gray-500 italic"}>
                              {registrationData?.emailId || "{firstName}@gmail.com"}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Subject:</span> {replaceVariables(emailSubject)}
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded text-gray-700">
                          {/* Event Banner inside email message */}
                          {isLoadingEvent ? (
                            <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-500 text-center">Loading event banner...</div>
                          ) : fullEventData?.banner ? (
                            <div className="mb-4">
                              <img
                                src={`${import.meta.env.VITE_CDN}${fullEventData.banner}`}
                                alt={fullEventData.title || "Event Banner"}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          ) : null}

                          <div
                            className="prose prose-sm max-w-none"
                            style={{ lineHeight: "1.6" }}
                            dangerouslySetInnerHTML={{
                              __html: replaceVariables(emailMessage)
                                .replace(/\{firstName\}/g, registrationData?.firstName || "{firstName}")
                                .replace(/\{\{firstName\}\}/g, registrationData?.firstName || "{firstName}")
                                .replace(/Participant/g, registrationData?.firstName || "{firstName}"),
                            }}
                          />
                        </div>
                        {attachBadgeEmail && <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs">📎 Badge will be attached to this email</div>}
                        {enableEmailCalendar && <div className="mt-2 p-2 bg-purple-50 rounded text-purple-700 text-xs">📅 Calendar invite (.ics) will be attached</div>}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">Email notifications are disabled</div>
                    )}
                  </>
                )}

                {activeApprovalChannel === "whatsapp" && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="max-w-sm mx-auto">
                      {getHiddenTabs().includes("whatsapp") ? (
                        <>
                          <IphoneMockup
                            messageText={`Dear ${registrationData?.firstName || "{firstName}"},\n\nYour registration for "${replaceVariables("{ticket}")}, ${replaceVariables("{event}")}" has been completed successfully.\n\nThis message is sent from EventHex Business Account`}
                            sender="EventHex.ai"
                          />
                          <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs text-center">
                            <span className="font-medium">Note:</span> This is the default EventHex template. Badge/ticket will be attached automatically.
                          </div>
                        </>
                      ) : enableWhatsapp ? (
                        <>
                          <IphoneMockup
                            messageText={replaceVariables(whatsappMessage)
                              .replace(/<[^>]*>/g, "")
                              .replace(/<br\s*\/?>/gi, "\n")
                              .replace(/\{firstName\}/g, registrationData?.firstName || "Participant")
                              .replace(/\{\{firstName\}\}/g, registrationData?.firstName || "Participant")
                              .replace(/Participant/g, registrationData?.firstName || "Participant")}
                            sender="EventHex.ai"
                          />
                          {attachBadgeWhatsapp && <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs text-center">📎 Badge will be attached to this WhatsApp message</div>}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 italic text-center">WhatsApp notifications are disabled</div>
                      )}
                    </div>
                  </div>
                )}

                {activeApprovalChannel === "website" && (
                  <div className="border border-gray-200 rounded-lg p-6 bg-white text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission Successful!</h3>
                    <p className="text-sm text-gray-600 mb-4">Form submitted successfully</p>

                    <div className="text-sm text-gray-800 mb-6 text-left">
                      <div
                        className="prose prose-sm max-w-none"
                        style={{ lineHeight: "1.6" }}
                        dangerouslySetInnerHTML={{
                          __html: replaceVariables(websiteMessage || "")
                            .replace(/\{firstName\}/g, registrationData?.firstName || "Participant")
                            .replace(/\{\{firstName\}\}/g, registrationData?.firstName || "Participant")
                            .replace(/Participant/g, registrationData?.firstName || "Participant"),
                        }}
                      />
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Submit Another</button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm">Download</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeApprovalTab === "approval" && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-green-600">Approval Notification</span>
                </div>

                {activeApprovalChannel === "email" && enableApprovalEmail && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">To:</span> <span className="text-gray-500 italic">participant@example.com</span>
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span> {replaceVariables(approvalEmailSubject)}
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded text-gray-700">
                      <div
                        className="prose prose-sm max-w-none"
                        style={{ lineHeight: "1.6" }}
                        dangerouslySetInnerHTML={{
                          __html: replaceVariables(approvalEmailMessage || "")
                            .replace(/\{firstName\}/g, "Participant")
                            .replace(/\{event\}/g, "Sample Event")
                            .replace(/\{ticket\}/g, "VIP Ticket"),
                        }}
                      />
                    </div>
                    {attachBadgeEmailOnApproval && <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs text-center">📎 Badge will be attached to this email</div>}
                  </div>
                )}
                {activeApprovalChannel === "email" && !enableApprovalEmail && <div className="text-sm text-gray-500 italic text-center">Email notifications are disabled</div>}

                {activeApprovalChannel === "whatsapp" && approvalWhatsapp && (
                  <>
                    {getHiddenTabs().includes("whatsapp") ? (
                      <>
                        <div className="max-w-sm mx-auto">
                          <IphoneMockup
                            messageText={`Dear Participant,\n\nYour registration for "VIP Ticket, Sample Event" has been approved.\n\nThis message is sent from EventHex Business Account`}
                            sender="EventHex.ai"
                          />
                          <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs text-center">
                            <span className="font-medium">Note:</span> This is the default EventHex template. Badge/ticket will be attached automatically.
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="max-w-sm mx-auto">
                        <IphoneMockup
                          messageText={replaceVariables(approvalWhatsappMessage || "")
                            .replace(/<[^>]*>/g, "")
                            .replace(/<br\s*\/?>/gi, "\n")
                            .replace(/\{firstName\}/g, "Participant")
                            .replace(/\{event\}/g, "Sample Event")
                            .replace(/\{ticket\}/g, "VIP Ticket")}
                          sender="EventHex.ai"
                        />
                        {attachBadgeWhatsappOnApproval && <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs text-center">📎 Badge will be attached to this WhatsApp message</div>}
                      </div>
                    )}
                  </>
                )}

                {activeApprovalChannel === "whatsapp" && !approvalWhatsapp && <div className="text-sm text-gray-500 italic text-center">WhatsApp notifications are disabled</div>}
              </div>
            )}

            {activeApprovalTab === "rejection" && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-red-600">Rejection Notification</span>
                </div>

                {activeApprovalChannel === "email" && enableRejectionEmail && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">To:</span> <span className="text-gray-500 italic">participant@example.com</span>
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span> {replaceVariables(rejectionEmailSubject)}
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded text-gray-700">
                      <div
                        className="prose prose-sm max-w-none"
                        style={{ lineHeight: "1.6" }}
                        dangerouslySetInnerHTML={{
                          __html: replaceVariables(rejectionEmailMessage || "")
                            .replace(/\{firstName\}/g, "Participant")
                            .replace(/\{event\}/g, "Sample Event")
                            .replace(/\{ticket\}/g, "VIP Ticket"),
                        }}
                      />
                    </div>
                  </div>
                )}
                {activeApprovalChannel === "email" && !enableRejectionEmail && <div className="text-sm text-gray-500 italic text-center">Email notifications are disabled</div>}

                {activeApprovalChannel === "whatsapp" && enableRejectionWhatsapp && (
                  <>
                    {getHiddenTabs().includes("whatsapp") ? (
                      <>
                        <div className="max-w-sm mx-auto">
                          <IphoneMockup
                            messageText={`Dear Participant,\n\nWe regret to inform you that your registration for "VIP Ticket, Sample Event" has not been approved.\n\nIf you believe this was a mistake or have any questions, feel free to contact us.\n\nBest regards,\nTeam Sample Event\n\nThis message is sent from EventHex Business Account`}
                            sender="EventHex.ai"
                          />
                          <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs text-center">
                            <span className="font-medium">Note:</span> This is the default EventHex template.
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="max-w-sm mx-auto">
                        <IphoneMockup
                          messageText={replaceVariables(rejectionWhatsappMessage || "")
                            .replace(/<[^>]*>/g, "")
                            .replace(/<br\s*\/?>/gi, "\n")
                            .replace(/\{firstName\}/g, "Participant")
                            .replace(/\{event\}/g, "Sample Event")
                            .replace(/\{ticket\}/g, "VIP Ticket")}
                          sender="EventHex.ai"
                        />
                      </div>
                    )}
                  </>
                )}
                {activeApprovalChannel === "whatsapp" && !enableRejectionWhatsapp && <div className="text-sm text-gray-500 italic text-center">WhatsApp notifications are disabled</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Security & Privacy Settings</h3>
        <p className="text-sm text-gray-600">Configure security measures and privacy options for your form.</p>
      </div>
      <div className="space-y-6">
        {/* Captcha Setting */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900 mb-1">Protect form with a Captcha</h4>
            <p className="text-sm text-gray-600">If enabled we will make sure respondent is a human</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={captchaEnabled}
              onChange={(e) => {
                setCaptchaEnabled(e.target.checked);
                saveSettings({ captchaEnabled: e.target.checked }, { silent: true });
              }}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {/* Consent Setting */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900 mb-1">Consent</h4>
            <p className="text-sm text-gray-600">This field will be placed near the primary action button</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={consentEnabled}
              onChange={(e) => {
                setConsentEnabled(e.target.checked);
                saveSettings({ consentEnabled: e.target.checked }, { silent: true });
              }}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {/* Consent Message - Only show when consent is enabled */}
        {consentEnabled && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-base font-semibold text-gray-900 mb-3">Consent Message</h4>
            <textarea
              rows={4}
              value={consentMessage}
              onChange={(e) => {
                setConsentMessage(e.target.value);
                setTimeout(() => {
                  saveSettings({ consentMessage: e.target.value }, { silent: true });
                }, 500);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">Add the text to the linked inside the [] brackets and the URL in () brackets</p>
          </div>
        )}
        {/* Terms & Policies Setting */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900 mb-1">Terms & Policies</h4>
            <p className="text-sm text-gray-600">Terms and Policies not configured in the event</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={termsEnabled}
              onChange={(e) => {
                setTermsEnabled(e.target.checked);
                saveSettings({ termsEnabled: e.target.checked }, { silent: true });
              }}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {/* Terms & Policy Text - Only show when terms is enabled */}
        {termsEnabled && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-base font-semibold text-gray-900 mb-3">Terms & Policy</h4>
            <input
              type="text"
              value={termsMessage}
              onChange={(e) => {
                setTermsMessage(e.target.value);
                setTimeout(() => {
                  saveSettings({ termsMessage: e.target.value }, { silent: true });
                }, 500);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );

  // AI Form Generation Function using Gemini
  const generateFormWithAI = async (description) => {
    try {
      // Use Gemini service to generate form fields
      const generatedFields = await geminiService.generateFormFields(description);

      return generatedFields;
    } catch (error) {
      console.error("Gemini AI form generation error:", error);

      // Fallback: Generate basic fields based on keywords in description
      const fallbackFields = generateFallbackFields(description);
      if (fallbackFields.length > 0) {
        return fallbackFields;
      }
      throw error;
    }
  };

  // Fallback field generation based on keywords
  const generateFallbackFields = (description) => {
    const lowerDesc = description.toLowerCase();
    const fields = [];

    // Only add basic fields if the description suggests it's appropriate
    const isRegistrationOrContact =
      lowerDesc.includes("registration") || lowerDesc.includes("contact") || lowerDesc.includes("form") || lowerDesc.includes("signup") || lowerDesc.includes("application");

    if (isRegistrationOrContact) {
      // Only add name and email if context suggests it's needed
      if (lowerDesc.includes("name") || lowerDesc.includes("person") || lowerDesc.includes("user")) {
        fields.push({
          label: "Full Name",
          type: "text",
          placeholder: "Enter your full name",
          required: true,
        });
      }

      if (lowerDesc.includes("email") || lowerDesc.includes("contact") || lowerDesc.includes("communication")) {
        fields.push({
          label: "Email Address",
          type: "email",
          placeholder: "Enter your email address",
          required: true,
        });
      }
    }

    // Add conditional fields based on keywords
    if (lowerDesc.includes("phone") || lowerDesc.includes("contact") || lowerDesc.includes("mobile")) {
      fields.push({
        label: "Phone Number",
        type: "mobilenumber",
        placeholder: "Enter your phone number",
        required: false,
      });
    }

    if (lowerDesc.includes("company") || lowerDesc.includes("organization") || lowerDesc.includes("business")) {
      fields.push({
        label: "Company",
        type: "text",
        placeholder: "Enter your company name",
        required: false,
      });
    }

    if (lowerDesc.includes("job") || lowerDesc.includes("title") || lowerDesc.includes("position")) {
      fields.push({
        label: "Job Title",
        type: "text",
        placeholder: "Enter your job title",
        required: false,
      });
    }

    if (lowerDesc.includes("message") || lowerDesc.includes("comment") || lowerDesc.includes("feedback")) {
      fields.push({
        label: "Message",
        type: "textarea",
        placeholder: "Enter your message",
        required: false,
      });
    }

    if (lowerDesc.includes("country") || lowerDesc.includes("location") || lowerDesc.includes("region")) {
      fields.push({
        label: "Country",
        type: "select",
        placeholder: "Select your country",
        required: false,
        options: ["United States", "Canada", "United Kingdom", "Australia", "India", "Other"],
      });
    }

    if (lowerDesc.includes("dietary") || lowerDesc.includes("food") || lowerDesc.includes("meal")) {
      fields.push({
        label: "Dietary Preferences",
        type: "select",
        placeholder: "Select your dietary preferences",
        required: false,
        options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Other"],
      });
    }

    return fields;
  };

  // AI form generation handler
  const handleAIGenerate = async () => {
    if (!aiDescription.trim()) {
      toast.error("Please describe your form first");
      return;
    }
    setIsGenerating(true);
    try {
      const generatedFields = await generateFormWithAI(aiDescription);
      if (!generatedFields || generatedFields.length === 0) {
        toast.error("No fields were generated. Please try a different description.");
        return;
      }
      // Add generated fields to form
      let successCount = 0;
      for (const field of generatedFields) {
        try {
          // Convert AI field format to our field format
          const formField = {
            label: field.label || "Untitled Field",
            type: field.type || "text",
            placeholder: field.placeholder || `Enter ${field.label || "value"}`,
            required: Boolean(field.required),
            ...(field.options && {
              selectApi: field.options.join(","),
              apiType: "CSV",
            }),
          };
          await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay between requests
          // Add to the correct section based on aiTargetSection
          if (aiTargetSection === "event") {
            // Add to Common Questions section
            await handleEventFieldSelection(formField);
          } else {
            // Add to Custom Questions section
            await handleAddField(formField, false);
          }
          successCount++;
        } catch (fieldError) {
          console.error("Error adding field:", fieldError);
        }
      }

      if (successCount > 0) {
        toast.success(`Generated ${successCount} fields successfully!`);
        setIsAIModalOpen(false);
        setAiDescription("");
        setAiTargetSection("custom"); // Reset to default
      } else {
        toast.error("Failed to add any generated fields");
      }
    } catch (error) {
      console.error("AI generation error:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to generate form. ";

      if (error.message?.includes("API key")) {
        errorMessage += "Please check your Gemini API key configuration.";
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage += "Please check your internet connection and try again.";
      } else if (error.message?.includes("parse")) {
        errorMessage += "The AI response was invalid. Using fallback method.";
      } else {
        errorMessage += "Please try again with a different description.";
      }
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailMessageChange = (e) => {
    const content = typeof e === "string" ? e : e.target.value;
    setEmailMessage(content);

    // Debounce the save to avoid too many API calls
    debouncedSave("emailMessage", { emailTemplate: content });
  };

  // 2. Update the website message change handler
  const handleWebsiteMessageChange = (e) => {
    const content = typeof e === "string" ? e : e.target.value;
    setWebsiteMessage(content);

    // Debounce the save to avoid too many API calls
    debouncedSave("websiteMessage", { onsuccessfullMessage: content });
  };

  const saveSettings = async (settings, options = {}) => {
    // Set saving state to true when starting save
    if (!options.silent) {
      setIsSaving(true);
    }

    try {
      // Map form settings to ticket model fields
      const ticketUpdateData = {};

      // Map all possible fields
      if (settings.title !== undefined) {
        ticketUpdateData.title = settings.title;
      }
      if (settings.description !== undefined) {
        ticketUpdateData.description = settings.description;
      }
      if (settings.emailSubject !== undefined) ticketUpdateData.emailSubject = settings.emailSubject;
      if (settings.emailTemplate !== undefined) ticketUpdateData.emailTemplate = settings.emailTemplate;
      if (settings.whatsappTemplate !== undefined) ticketUpdateData.whatsappTemplate = settings.whatsappTemplate;
      if (settings.onsuccessfullMessage !== undefined) ticketUpdateData.onsuccessfullMessage = settings.onsuccessfullMessage;
      // Approval/Rejection email + whatsapp templates
      if (settings.approvalEmailSubject !== undefined) ticketUpdateData.approvalEmailSubject = settings.approvalEmailSubject;
      if (settings.approvalEmailTemplate !== undefined) ticketUpdateData.approvalEmailTemplate = settings.approvalEmailTemplate;
      if (settings.rejectionEmailSubject !== undefined) ticketUpdateData.rejectionEmailSubject = settings.rejectionEmailSubject;
      if (settings.rejectionEmailTemplate !== undefined) ticketUpdateData.rejectionEmailTemplate = settings.rejectionEmailTemplate;
      if (settings.approvalWhatsappTemplate !== undefined) ticketUpdateData.approvalWhatsappTemplate = settings.approvalWhatsappTemplate;
      if (settings.rejectionWhatsappTemplate !== undefined) ticketUpdateData.rejectionWhatsappTemplate = settings.rejectionWhatsappTemplate;
      // Backward-compatible aliases from older handlers
      if (settings.approvalEmailMessage !== undefined) ticketUpdateData.approvalEmailTemplate = settings.approvalEmailMessage;
      if (settings.rejectionEmailMessage !== undefined) ticketUpdateData.rejectionEmailTemplate = settings.rejectionEmailMessage;
      if (settings.approvalWhatsappMessage !== undefined) ticketUpdateData.approvalWhatsappTemplate = settings.approvalWhatsappMessage;
      if (settings.rejectionWhatsappMessage !== undefined) ticketUpdateData.rejectionWhatsappTemplate = settings.rejectionWhatsappMessage;
      if (settings.enableEmail !== undefined) ticketUpdateData.enableEmail = settings.enableEmail;
      if (settings.enableWhatsapp !== undefined) ticketUpdateData.enableWhatsapp = settings.enableWhatsapp;
      if (settings.attachBadgeEmail !== undefined) ticketUpdateData.attachBadgeEmail = settings.attachBadgeEmail;
      if (settings.attachBadgeWhatsapp !== undefined) ticketUpdateData.attachBadgeWhatsapp = settings.attachBadgeWhatsapp;
      if (settings.enableEmailCalendar !== undefined) ticketUpdateData.enableEmailCalendar = settings.enableEmailCalendar;
      // Map approvalEnabled to needsApproval for backend
      if (settings.approvalEnabled !== undefined) ticketUpdateData.needsApproval = settings.approvalEnabled;
      if (settings.needsApproval !== undefined) ticketUpdateData.needsApproval = settings.needsApproval;
      // Map other settings
      if (settings.enableCaptcha !== undefined) ticketUpdateData.enableCaptcha = settings.enableCaptcha;
      if (settings.consent !== undefined) ticketUpdateData.consent = settings.consent;
      if (settings.consentLetter !== undefined) ticketUpdateData.consentLetter = settings.consentLetter;
      if (settings.termsAndPolicy !== undefined) ticketUpdateData.termsAndPolicy = settings.termsAndPolicy;
      if (settings.termsAndPolicyMessage !== undefined) ticketUpdateData.termsAndPolicyMessage = settings.termsAndPolicyMessage;
      if (settings.approvalWhatsapp !== undefined) ticketUpdateData.approvalWhatsapp = settings.approvalWhatsapp;
      if (settings.attachBadgeWhatsappOnApproval !== undefined) ticketUpdateData.attachBadgeWhatsappOnApproval = settings.attachBadgeWhatsappOnApproval;
      if (settings.attachBadgeEmailOnApproval !== undefined) ticketUpdateData.attachBadgeEmailOnApproval = settings.attachBadgeEmailOnApproval;
      if (settings.enableApprovalEmail !== undefined) ticketUpdateData.enableApprovalEmail = settings.enableApprovalEmail;
      if (settings.enableRejectionEmail !== undefined) ticketUpdateData.enableRejectionEmail = settings.enableRejectionEmail;
      if (settings.enableRejectionWhatsapp !== undefined) ticketUpdateData.enableRejectionWhatsapp = settings.enableRejectionWhatsapp;

      // Prepare final data for API call
      const finalData = {
        id: props?.data?._id,
        ...ticketUpdateData,
      };

      // Save to backend
      const response = await putData(finalData, "ticket");

      if (response?.data?.success === true) {
        if (!options.silent) {
          toast.success("Settings saved successfully");
          setIsSaving(false);
        }
        return true;
      } else {
        console.error("Save settings failed:", response);
        if (!options.silent) {
          toast.error("Failed to save settings");
          setIsSaving(false);
        }
        return false;
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      if (!options.silent) {
        toast.error("Failed to save settings");
        setIsSaving(false);
      }
      return false;
    }
  };

  return (
    <>
      {isEditMode && (
        <PopupView
          customClass="full-page"
          popupData={
            <ElementContainer className="">
              <EventFormPrimary
                isOpen={isEditMode}
                onClose={toggleModalPrimary}
                eventFormFields={eventFormFields}
                data={{
                  _id: props?.data?._id,
                  event: typeof props?.data?.event === "object" ? props?.data?.event?._id : props?.data?.event,
                  title: props?.data?.title || props?.data?.name,
                  slug: props?.data?.slug,
                  // Ensure participantType is handled as a string, not an object
                  participantType: typeof props?.data?.participantType === "object" ? props?.data?.participantType?._id : props?.data?.participantType,
                  participantTypeName: props?.data?.participantTypeName || props?.data?.participantType?.name,
                }}
              />
            </ElementContainer>
          }
          themeColors={themeColors}
          closeModal={toggleModalPrimary}
          itemTitle={{
            name: "title",
            type: "text",
            collection: "",
          }}
          openData={{
            data: { _id: props?.data?.event?._id || props?.data?.event, title: "Primary Custom Fields" },
          }}
        ></PopupView>
      )}
      {/* Modern Two-Panel Layout - Left Panel for Field Building, Right Panel for Live Preview */}
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-gray-200 px-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"></div>
          </div>
        </header>

        <div className="flex h-screen w-full">
          {/* Left Panel - Field Builder with Primary and Custom Fields Sections */}
          <div className="w-[60%] p-6 overflow-y-auto bg-white/[0.31]">
            {/* Primary Fields Section */}
            <div className="mb-8 p-6 border-2 rounded-lg border-gray-200 bg-gray-50/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* <h3 className="text-lg font-semibold text-gray-900">Common Questions</h3> */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{props?.data?.type === "Abstraction" ? "Basic Information" : "Common Questions"}</h3>
                    {(props?.data?.type === "Abstraction" || !isEditingEnabled) && <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-600 leading-5 max-w-md">
                    {props?.data?.type === "Abstraction"
                      ? "Essential information required for all submissions - editing disabled for abstraction forms"
                      : isEditingEnabled
                        ? "Essential information required for all submissions - editing enabled"
                        : "Essential information required for all submissions - locked for editing"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-6 flex-shrink-0 relative">
                  {props?.data?.type !== "Abstraction" && (
                    <>
                      <button
                        onClick={() => setIsEditingEnabled((v) => !v)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border text-gray-700 border-gray-300 hover:bg-gray-100 whitespace-nowrap"
                      >
                        {isEditingEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        {isEditingEnabled ? "Lock Editing" : "Enable Editing"}
                      </button>
                      {isEditingEnabled && (
                        <button
                          onClick={() => {
                            setFieldSelectorTarget("event");
                            setIsFieldSelectorOpen((s) => !s);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4" />
                          Add Field
                        </button>
                      )}
                    </>
                  )}

                  {isEditingEnabled && isFieldSelectorOpen && fieldSelectorTarget === "event" && (
                    <div className="field-selector-popup absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 w-96 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            placeholder="Search fields..."
                            value={fieldSearchTerm}
                            onChange={(e) => setFieldSearchTerm(e.target.value)}
                            className="pl-10 text-sm h-10 border border-gray-200 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-4 space-y-6">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">PRESET FIELDS</p>
                            <div className="grid grid-cols-3 gap-3">
                              {filteredQuickFields.map((field) => (
                                <button
                                  key={field.value}
                                  onClick={() => {
                                    handleEventFieldSelection(field);
                                    setIsFieldSelectorOpen(false);
                                  }}
                                  className="group flex flex-col items-center p-4 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-20 justify-center"
                                >
                                  <div className="text-blue-600 text-xl mb-2">{getFieldTypeIcon(field.type, field.label)}</div>
                                  <p className="font-medium text-xs text-gray-800 group-hover:text-gray-900 leading-tight">{field.label}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">CUSTOM FIELDS</p>
                            <div className="grid grid-cols-3 gap-3">
                              {filteredCustomFields.map((field) => (
                                <button
                                  key={field.value}
                                  onClick={() => {
                                    handleEventFieldSelection(field);
                                    setIsFieldSelectorOpen(false);
                                  }}
                                  className="group flex flex-col items-center p-4 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-20 justify-center"
                                >
                                  <div className="text-blue-600 text-xl mb-2">{getFieldTypeIcon(field.type, field.label)}</div>
                                  <p className="font-medium text-xs text-gray-800 group-hover:text-gray-900 leading-tight">{field.label}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* AI Generate Option */}
                          <div className="p-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white text-center">
                            <h4 className="text-base font-semibold mb-2">Generate with AI</h4>
                            <p className="text-sm opacity-90 mb-4">Describe your form and let AI create the fields for you</p>
                            <button
                              onClick={() => {
                                setIsFieldSelectorOpen(false);
                                setAiTargetSection("event"); // Set target to Common Questions
                                setIsAIModalOpen(true);
                              }}
                              className="px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-sm font-medium hover:bg-opacity-30 transition-all duration-200"
                            >
                              <FaMagic className="w-4 h-4 inline mr-2" />
                              Generate with AI
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {isFieldSelectorOpen && fieldSelectorTarget === "custom" && (
                    <div className="field-selector-popup absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 w-96 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            placeholder="Search fields..."
                            value={fieldSearchTerm}
                            onChange={(e) => setFieldSearchTerm(e.target.value)}
                            className="pl-10 text-sm h-10 border border-gray-200 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-4 space-y-6">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">PRESET FIELDS</p>
                            <div className="grid grid-cols-3 gap-2">
                              {filteredQuickFields.map((field) => (
                                <button
                                  key={field.value}
                                  onClick={() => {
                                    handleAddField(field, false);
                                    setIsFieldSelectorOpen(false);
                                  }}
                                  className="group flex flex-col items-center p-3 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-18 justify-center"
                                >
                                  <div className="text-blue-600 text-lg mb-2">{getFieldTypeIcon(field.type, field.label)}</div>
                                  <p className="font-medium text-xs text-gray-800 group-hover:text-gray-900 leading-tight">{field.label}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">CUSTOM FIELDS</p>
                            <div className="grid grid-cols-3 gap-2">
                              {filteredCustomFields.map((field) => (
                                <button
                                  key={field.value}
                                  onClick={() => {
                                    handleAddField(field, false);
                                    setIsFieldSelectorOpen(false);
                                  }}
                                  className="group flex flex-col items-center p-3 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-18 justify-center"
                                >
                                  <div className="text-blue-600 text-lg mb-2">{getFieldTypeIcon(field.type, field.label)}</div>
                                  <p className="font-medium text-xs text-gray-800 group-hover:text-gray-900 leading-tight">{field.label}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* AI Generate Option */}
                          <div className="p-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white text-center">
                            <h4 className="text-base font-semibold mb-2">Generate with AI</h4>
                            <p className="text-sm opacity-90 mb-4">Describe your form and let AI create the fields for you</p>
                            <button
                              onClick={() => {
                                setIsFieldSelectorOpen(false);
                                setAiTargetSection("custom"); // Set target to Custom Questions
                                setIsAIModalOpen(true);
                              }}
                              className="px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-sm font-medium hover:bg-opacity-30 transition-all duration-200"
                            >
                              <FaMagic className="w-4 h-4 inline mr-2" />
                              Generate with AI
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {sortedEventFormFields.length === 0 && props?.data?.type !== "Abstraction" ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-700 mb-1">No primary fields yet</h3>
                  <p className="text-xs text-gray-500 mb-3">Enable editing to add primary fields</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEventDragEnd}>
                  <SortableContext items={sortedEventFormFields?.map((field) => field?._id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-2 gap-3">
                      {sortedEventFormFields.map((field) => (
                        <SortableEventItem key={field._id} field={field} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Custom Fields Section */}
            <div className="mb-8 p-6 border-2 rounded-lg border-gray-200 bg-gray-50/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{props?.data?.type === "Abstraction" ? "Abstract Questions" : "Custom Questions"}</h3>
                  <p className="text-sm text-gray-600 leading-5 max-w-md">Additional information specific to this form</p>
                </div>
                <div className="flex items-center gap-2 ml-6 flex-shrink-0 relative">
                  <button onClick={openClonePopup} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 whitespace-nowrap">
                    <FaCopy size={12} />
                    Clone Fields
                  </button>
                  <button
                    onClick={() => {
                      setAiTargetSection("custom"); // Set target to Custom Questions
                      setIsAIModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 whitespace-nowrap"
                  >
                    <FaMagic className="w-4 h-4" />
                    AI Generate
                  </button>
                  <button
                    onClick={() => {
                      setFieldSelectorTarget("custom");
                      setIsFieldSelectorOpen((s) => !s);
                    }}
                    className="add-field-trigger flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field
                  </button>
                </div>
              </div>

              {formFields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-700 mb-1">No custom fields yet</h3>
                  <p className="text-xs text-gray-500 mb-3">Add custom fields to collect specific information for this form</p>
                  <button
                    onClick={() => {
                      setFieldSelectorTarget("custom");
                      setIsFieldSelectorOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Custom Field
                  </button>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={formFields?.map((field) => field?._id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-2 gap-3">
                      {formFields?.map((field) => (
                        <SortableItem key={field?._id} field={field} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              {/* placeholder to keep structure consistent */}
            </div>
          </div>

          {/* Right Panel - Live Form Preview with Real-time Field Rendering */}
          <div className="w-[40%] bg-white border-l border-gray-200 p-6">
            <div style={{ scrollbarWidth: "none" }} className="w-full h-screen mx-auto overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Form Preview</h3>
              </div>
              <div className="h-px bg-gray-200"></div>

              <form className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {sortedEventFormFields.map((field) => (
                    <div key={field._id} className={`space-y-2 ${(field.customClass || "half") === "full" ? "col-span-2" : "col-span-1"}`}>
                      {renderEventInputField(field)}
                    </div>
                  ))}

                  {formFields.map((field) => (
                    <div key={field._id} className={`space-y-2 ${(field.customClass || "half") === "full" ? "col-span-2" : "col-span-1"}`}>
                      {renderInputField(field)}
                    </div>
                  ))}
                </div>

                {sortedEventFormFields.length === 0 && formFields.length === 0 && props?.data?.type !== "Abstraction" && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No fields added yet</p>
                    <p className="text-sm">Start building your form by adding fields from the left panel</p>
                  </div>
                )}

                {(sortedEventFormFields.length > 0 || formFields.length > 0 || props?.data?.type === "Abstraction") && (
                  <div className="pt-6 flex items-center justify-center w-full">
                    <button type="submit" className="px-6 py-2 rounded-md font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700">
                      Submit
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Modals and Sidebars - Field Configuration and Settings */}
        {isModalOpen && (
          <PopupView
            customClass={"medium"}
            popupData={
              <ElementContainer className="column">
                <ElementContainer className="custom">
                  {customFields?.map(({ label, icon, value, type }) => (
                    <FormInput
                      key={value}
                      type="widges"
                      value={label}
                      icon={icon}
                      onChange={() => handleEventFieldSelection({ label, icon, value, type })}
                      isSelected={selectedEventField?.value === value}
                    />
                  ))}
                </ElementContainer>
              </ElementContainer>
            }
            themeColors={themeColors}
            closeModal={closeModal}
            itemTitle={{
              name: "title",
              type: "text",
              collection: "",
            }}
            openData={{
              data: { _id: "", title: "Primary Custom Fields" },
            }}
          ></PopupView>
        )}
        {isSidebarOpen && ticketFormData && (
          <div className="no-tab-icons">
            <AutoForm
              useCaptcha={false}
              key={"elements" + activeInputType}
              formType={"post"}
              header={`${ticketFormValues?.label || "Field"} - Properties`}
              description={""}
              formInput={ticketFormData}
              formValues={ticketFormValues}
              submitHandler={submitChange}
              button={"Save"}
              isOpenHandler={closeModal}
              isOpen={true}
              plainForm={true}
              formMode={"single"}
              setMessage={props?.setMessage}
              setLoaderBox={props?.setLoaderBox}
              formTabTheme={"tab"}
            ></AutoForm>
            <style>{`.no-tab-icons .accordion-icon-container{display:none}`}</style>
          </div>
        )}
        {isEventSidebarOpen && ticketFormData && (
          <div className="no-tab-icons">
            <AutoForm
              useCaptcha={false}
              key={"elements" + activeInputType}
              formType={"post"}
              header={`${eventTicketFormValues?.label || "Field"} - Properties`}
              description={""}
              formInput={ticketFormData}
              formValues={eventTicketFormValues}
              submitHandler={submitEventChange}
              button={"Save"}
              isOpenHandler={closeModal}
              isOpen={true}
              plainForm={true}
              formMode={"single"}
              formTabTheme={"tab"}
              setMessage={props?.setMessage}
              setLoaderBox={props?.setLoaderBox}
            ></AutoForm>
            <style>{`.no-tab-icons .accordion-icon-container{display:none}`}</style>
          </div>
        )}

        {/* Clone Popup */}
        {isClonePopupOpen && (
          <CloneTicketPopup
            cloneTickets={cloneTickets}
            isLoadingTickets={isLoadingTickets}
            selectedCloneTicket={selectedCloneTicket}
            setSelectedCloneTicket={setSelectedCloneTicket}
            isCloning={isCloning}
            onClone={handleCloneFields}
            onClose={closeClonePopup}
          />
        )}

        {/* AI Modal */}
        {isAIModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setIsAIModalOpen(false);
              setAiTargetSection("custom"); // Reset to default when closing
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <FaMagic className="text-purple-600" />
                    Generate Form with AI
                  </h2>
                  <button
                    onClick={() => {
                      setIsAIModalOpen(false);
                      setAiTargetSection("custom"); // Reset to default when closing
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-2">Describe your form</label>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="E.g., Create a registration form for a business conference with fields for name, email, company, job title, and dietary preferences..."
                    className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg text-sm resize-y focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="text-sm text-gray-600 mb-6">💡 Be specific about the type of information you want to collect and any special requirements.</div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAIModalOpen(false);
                    setAiTargetSection("custom"); // Reset to default when closing
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={!aiDescription.trim() || isGenerating}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic />
                      Generate Form
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Settings Modal - Use SettingsModal for all form types */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settingsTabs={props?.data?.type === "Abstraction" ? abstractionSettingsTabs : settingsTabs}
        activeSettingsTab={activeSettingsTab}
        onTabChange={setActiveSettingsTab}
        renderGeneralSettings={props?.data?.type === "Abstraction" ? null : renderGeneralSettings}
        renderApprovalSettings={renderApprovalSettings}
        renderSecuritySettings={props?.data?.type === "Abstraction" ? null : renderSecuritySettings}
        onSave={async () => {
          const allSettings = {
            // Only approval settings for abstract forms
            approvalEmailSubject,
            approvalEmailTemplate: approvalEmailMessage,
            approvalWhatsappTemplate: approvalWhatsappMessage,
            rejectionEmailSubject,
            rejectionEmailTemplate: rejectionEmailMessage,
            rejectionWhatsappTemplate: rejectionWhatsappMessage,
            needsApproval: approvalEnabled,
            approvalWhatsapp,
            attachBadgeWhatsappOnApproval,
            attachBadgeEmailOnApproval,
          };

          // Add additional settings for non-abstraction forms
          if (props?.data?.type !== "Abstraction") {
            allSettings.title = formTitle;
            allSettings.description = formDescription;
            allSettings.emailSubject = emailSubject;
            allSettings.emailTemplate = emailMessage;
            allSettings.whatsappTemplate = whatsappMessage;
            allSettings.onsuccessfullMessage = websiteMessage;
          }

          const success = await saveSettings(allSettings);
          if (success) {
            await loadSettings();
            setIsSettingsModalOpen(false);
          } else {
            console.error("Settings save was not successful");
          }
        }}
      />
    </>
  );
};

export default withLayout(FormBuilder);
