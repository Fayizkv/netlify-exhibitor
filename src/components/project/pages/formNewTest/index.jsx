import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Button, ElementContainer, IconButton } from "../../../core/elements";
import { deleteData, getData, postData, putData } from "../../../../backend/api";
import FormInput from "../../../core/input";
import CustomLabel from "../../../core/input/label";
import AutoForm from "../../../core/autoform/AutoForm";
import PopupView from "../../../core/popupview";
import SettingsModal from "./SettingsModal";
import { SubPageHeader } from "../../../core/input/heading";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "../../../core/toast";
import withLayout from "../../../core/layout";
import {
  FaPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaBriefcase,
  FaFlag,
  FaHashtag,
  FaKey,
  FaCalendarAlt,
  FaClock,
  FaFileUpload,
  FaCheckSquare,
  FaListUl,
  FaCog,
  FaEye,
  FaEnvelopeOpen,
  FaWhatsapp,
  FaRobot,
  FaMagic,
  FaTimes,
  FaGripVertical,
  FaTrash,
  FaEdit,
  FaCopy,
  FaBell,
} from "react-icons/fa";
import {
  Settings,
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
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import IphoneMockup from "./iphoneMockup";
import Editor from "../../../core/editor";
// Field type definitions
const fieldTypes = [
  {
    name: "Your Name",
    type: "text",
    preview: "Short answer text",
    icon: User,
    category: "preset",
  },
  {
    name: "Email ID",
    type: "email",
    preview: "Email address",
    icon: Mail,
    category: "preset",
  },
  {
    name: "Mobile Number",
    type: "tel",
    preview: "Phone number with country code",
    icon: Phone,
    category: "preset",
  },
  {
    name: "Company",
    type: "company",
    preview: "Company name",
    icon: Building,
    category: "preset",
  },
  {
    name: "Website",
    type: "url",
    preview: "Website URL",
    icon: Globe,
    category: "preset",
  },
  {
    name: "Text Input",
    type: "text-custom",
    preview: "Short answer text",
    icon: Edit,
    category: "custom",
  },
  {
    name: "Number",
    type: "number",
    preview: "Numeric input",
    icon: Hash,
    category: "custom",
  },
  {
    name: "Textarea",
    type: "textarea",
    preview: "Long answer text",
    icon: FileText,
    category: "custom",
  },
  {
    name: "Select Box",
    type: "select",
    preview: "Dropdown selection",
    icon: CheckSquare,
    category: "custom",
  },
  {
    name: "Date",
    type: "date",
    preview: "Date picker",
    icon: Calendar,
    category: "custom",
  },
  {
    name: "HTML Editor",
    type: "html",
    preview: "Rich text content",
    icon: FileText,
    category: "custom",
  },
];

// Field type definitions for quick fields
const quickFields = [
  { label: "Name", icon: <FaUser />, value: "Name", type: "text" },
  { label: "Email", icon: <FaEnvelope />, value: "Email", type: "email" },
  { label: "Phone", icon: <FaPhone />, value: "Phone", type: "mobilenumber" },
  { label: "Company", icon: <FaBuilding />, value: "Company", type: "text" },
  {
    label: "Job Title",
    icon: <FaBriefcase />,
    value: "Job Title",
    type: "text",
  },
  { label: "Country", icon: <FaFlag />, value: "Country", type: "select" },
];

const customFields = [
  { label: "Text Input", icon: <FaUser />, value: "Text Input", type: "text" },
  { label: "Email", icon: <FaEnvelope />, value: "Email", type: "email" },
  { label: "Number", icon: <FaHashtag />, value: "Number", type: "number" },
  { label: "Password", icon: <FaKey />, value: "Password", type: "password" },
  { label: "Date", icon: <FaCalendarAlt />, value: "Date", type: "date" },
  { label: "Time", icon: <FaClock />, value: "Time", type: "time" },
  {
    label: "File Upload",
    icon: <FaFileUpload />,
    value: "File Upload",
    type: "file",
  },
  {
    label: "Checkbox",
    icon: <FaCheckSquare />,
    value: "Checkbox",
    type: "checkbox",
  },
  { label: "Dropdown", icon: <FaListUl />, value: "Dropdown", type: "select" },
];

// Helper function to get field icon
const getFieldIcon = (type) => {
  const iconMap = {
    text: <FaUser />,
    email: <FaEnvelope />,
    phone: <FaPhone />,
    mobilenumber: <FaPhone />,
    number: <FaHashtag />,
    password: <FaKey />,
    date: <FaCalendarAlt />,
    time: <FaClock />,
    file: <FaFileUpload />,
    checkbox: <FaCheckSquare />,
    select: <FaListUl />,
  };
  return iconMap[type] || <FaUser />;
};

// AI Form Generation Function
const generateFormWithAI = async (description) => {
  try {
    const response = await postData(
      {
        description: description,
        formType: "registration",
        context: "event_registration",
      },
      "ai/generate-form"
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to generate form");
    }

    return response.data.fields;
  } catch (error) {
    console.error("AI form generation error:", error);

    // Fallback: Generate basic fields based on keywords in description
    const fallbackFields = generateFallbackFields(description);
    if (fallbackFields.length > 0) {
      console.log("Using fallback field generation");
      return fallbackFields;
    }

    throw error;
  }
};

// Fallback field generation based on keywords
const generateFallbackFields = (description) => {
  const lowerDesc = description.toLowerCase();
  const fields = [];

  // Always include basic fields
  fields.push({
    label: "Full Name",
    type: "text",
    placeholder: "Enter your full name",
    required: true,
  });

  fields.push({
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email address",
    required: true,
  });

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

  if (lowerDesc.includes("date") || lowerDesc.includes("when") || lowerDesc.includes("schedule")) {
    fields.push({
      label: "Preferred Date",
      type: "date",
      placeholder: "Select a date",
      required: false,
    });
  }

  return fields;
};

const FormBuilderNew = (props) => {
  const toast = useToast();
  const themeColors = useSelector((state) => state.themeColors);

  // State management
  const [formFields, setFormFields] = useState([]);
  const [eventFormFields, setEventFormFields] = useState([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");
  const [selectedField, setSelectedField] = useState(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [triggerEffect, setTriggerEffect] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneTickets, setCloneTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [selectedCloneTicket, setSelectedCloneTicket] = useState(null);
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState(null);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  // Track which section opened the field selector: 'event' (Common Questions) or 'custom' (Custom Questions)
  const [fieldSelectorTarget, setFieldSelectorTarget] = useState(null);
  const [fieldSearchTerm, setFieldSearchTerm] = useState("");
  const [expandedField, setExpandedField] = useState(null);
  const [conditionalLogicEnabled, setConditionalLogicEnabled] = useState({});

  // Add click outside handler for field selector popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFieldSelectorOpen && !event.target.closest(".field-selector-popup")) {
        setIsFieldSelectorOpen(false);
        setFieldSelectorTarget(null);
        setFieldSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFieldSelectorOpen]);

  // Filter fields based on search term
  const filteredQuickFields = useMemo(() => {
    if (!fieldSearchTerm.trim()) return quickFields;
    return quickFields.filter((field) => field.label.toLowerCase().includes(fieldSearchTerm.toLowerCase()) || field.value.toLowerCase().includes(fieldSearchTerm.toLowerCase()));
  }, [fieldSearchTerm, quickFields]);

  const filteredCustomFields = useMemo(() => {
    if (!fieldSearchTerm.trim()) return customFields;
    return customFields.filter((field) => field.label.toLowerCase().includes(fieldSearchTerm.toLowerCase()) || field.value.toLowerCase().includes(fieldSearchTerm.toLowerCase()));
  }, [fieldSearchTerm, customFields]);

  // Add state for editing mode
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);

  // New Settings Modal State Variables
  const [activeSubmissionTab, setActiveSubmissionTab] = useState("email");
  const [activeApprovalTab, setActiveApprovalTab] = useState("approval");
  const [approvalEnabled, setApprovalEnabled] = useState(props?.data?.needsApproval || false);
  const [activeApprovalChannel, setActiveApprovalChannel] = useState("email");
  const [activeRejectionChannel, setActiveRejectionChannel] = useState("email");

  // State for approval dynamic preview data - initialized with ticket model defaults
  const [approvalEmailSubject, setApprovalEmailSubject] = useState("Your submission has been approved - {{formTitle}}");
  const [approvalEmailMessage, setApprovalEmailMessage] = useState(
    props?.data?.approvalEmailTemplate || "Hi {{name}}, great news! Your submission for {{formTitle}} has been approved. We will contact you soon with next steps."
  );
  const [approvalWhatsappMessage, setApprovalWhatsappMessage] = useState(
    props?.data?.approvalWhatsappTemplate || "Hi {{name}}, great news! Your submission for {{formTitle}} has been approved. We will contact you soon with next steps."
  );
  const [rejectionEmailSubject, setRejectionEmailSubject] = useState("Update on your submission - {{formTitle}}");
  const [rejectionEmailMessage, setRejectionEmailMessage] = useState(
    props?.data?.rejectionEmailTemplate || "Hi {{name}}, thank you for your submission for {{formTitle}}. Unfortunately, we are unable to approve your request at this time."
  );
  const [rejectionWhatsappMessage, setRejectionWhatsappMessage] = useState(
    props?.data?.rejectionWhatsappTemplate || "Hi {{name}}, thank you for your submission for {{formTitle}}. Unfortunately, we are unable to approve your request at this time."
  );

  // Save settings to backend - maps to ticket model fields
  const saveSettings = async (settingsData, options = { silent: false }) => {
    const { silent } = options || {};
    try {
      if (!props?.data?._id) {
        if (!silent) toast.error("No ticket ID available");
        return false;
      }

      // Map form settings to ticket model fields
      const ticketUpdateData = {};

      if (settingsData.emailMessage !== undefined) {
        ticketUpdateData.emailTemplate = settingsData.emailMessage;
      }
      if (settingsData.whatsappMessage !== undefined) {
        ticketUpdateData.whatsappTemplate = settingsData.whatsappMessage;
      }
      if (settingsData.websiteMessage !== undefined) {
        ticketUpdateData.onsuccessfullMessage = settingsData.websiteMessage;
      }
      if (settingsData.approvalEmailMessage !== undefined) {
        ticketUpdateData.approvalEmailTemplate = settingsData.approvalEmailMessage;
      }
      if (settingsData.approvalWhatsappMessage !== undefined) {
        ticketUpdateData.approvalWhatsappTemplate = settingsData.approvalWhatsappMessage;
      }
      if (settingsData.rejectionEmailMessage !== undefined) {
        ticketUpdateData.rejectionEmailTemplate = settingsData.rejectionEmailMessage;
      }
      if (settingsData.rejectionWhatsappMessage !== undefined) {
        ticketUpdateData.rejectionWhatsappTemplate = settingsData.rejectionWhatsappMessage;
      }
      if (settingsData.approvalEnabled !== undefined) {
        ticketUpdateData.needsApproval = settingsData.approvalEnabled;
      }
      if (settingsData.captchaEnabled !== undefined) {
        ticketUpdateData.enableCaptcha = settingsData.captchaEnabled;
      }
      if (settingsData.consentEnabled !== undefined) {
        ticketUpdateData.consent = settingsData.consentEnabled;
      }
      if (settingsData.consentMessage !== undefined) {
        ticketUpdateData.consentLetter = settingsData.consentMessage;
      }
      if (settingsData.termsEnabled !== undefined) {
        ticketUpdateData.termsAndPolicy = settingsData.termsEnabled;
      }
      if (settingsData.termsMessage !== undefined) {
        ticketUpdateData.termsAndPolicyMessage = settingsData.termsMessage;
      }

      const response = await putData(
        {
          id: props.data._id,
          ...ticketUpdateData,
        },
        "ticket"
      );

      if (response?.data?.success) {
        if (!silent) toast.success("Settings saved successfully");
        return true;
      } else {
        if (!silent) toast.error("Failed to save settings");
        return false;
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      if (!silent) toast.error("Failed to save settings");
      return false;
    }
  };

  // Load settings from backend - maps from ticket model fields
  const loadSettings = async () => {
    try {
      if (!props?.data?._id) return;

      // Since we already have the ticket data in props.data, we can use it directly
      const ticketData = props.data;

      // Update state with loaded settings from ticket model
      if (ticketData.emailTemplate) setEmailMessage(ticketData.emailTemplate);
      if (ticketData.whatsappTemplate) setWhatsappMessage(ticketData.whatsappTemplate);
      if (ticketData.onsuccessfullMessage) setWebsiteMessage(ticketData.onsuccessfullMessage);
      if (ticketData.approvalEmailTemplate) setApprovalEmailMessage(ticketData.approvalEmailTemplate);
      if (ticketData.approvalWhatsappTemplate) setApprovalWhatsappMessage(ticketData.approvalWhatsappTemplate);
      if (ticketData.rejectionEmailTemplate) setRejectionEmailMessage(ticketData.rejectionEmailTemplate);
      if (ticketData.rejectionWhatsappTemplate) setRejectionWhatsappMessage(ticketData.rejectionWhatsappTemplate);
      if (ticketData.needsApproval !== undefined) setApprovalEnabled(ticketData.needsApproval);
      if (ticketData.enableCaptcha !== undefined) setCaptchaEnabled(ticketData.enableCaptcha);
      if (ticketData.consent !== undefined) setConsentEnabled(ticketData.consent);
      if (ticketData.consentLetter) setConsentMessage(ticketData.consentLetter);
      if (ticketData.termsAndPolicy !== undefined) setTermsEnabled(ticketData.termsAndPolicy);
      if (ticketData.termsAndPolicyMessage) setTermsMessage(ticketData.termsAndPolicyMessage);
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

  // Security & Privacy State Variables - initialized with ticket model defaults
  const [captchaEnabled, setCaptchaEnabled] = useState(props?.data?.enableCaptcha || false);
  const [consentEnabled, setConsentEnabled] = useState(props?.data?.consent || false);
  const [consentMessage, setConsentMessage] = useState(
    props?.data?.consentLetter || "By continuing with this registration, you provide your consent to participate in this event. Please review the terms and conditions carefully before proceeding."
  );
  const [termsEnabled, setTermsEnabled] = useState(props?.data?.termsAndPolicy || false);
  const [termsMessage, setTermsMessage] = useState(
    props?.data?.termsAndPolicyMessage || "By registering, you agree to our terms and policies. Please ensure you have read and understood the terms before proceeding."
  );

  // Error boundary - moved after all hooks are declared
  const renderErrorBoundary = () => {
    if (error) {
      return (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "#f8fafc",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <h2 style={{ color: "#dc2626", marginBottom: "16px" }}>Something went wrong</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>{error.message}</p>
          <button
            onClick={() => setError(null)}
            style={{
              padding: "12px 24px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return null;
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Load form data
  useEffect(() => {
    if (props?.data?._id) {
      getData({ ticket: props.data._id, eventId: props.data.event?._id }, "ticket-form-data")
        .then((response) => {
          console.log("Loaded form fields:", response?.data?.response);
          const fields = response?.data?.response || [];
          // Ensure each field has a width property (using customClass)
          const fieldsWithWidth = fields.map((field) => ({
            ...field,
            width: field.customClass === "full" ? "double" : "single",
          }));
          console.log("Processed form fields:", fieldsWithWidth);
          setFormFields(fieldsWithWidth);
          setEventFormFields(response?.data?.eventForm || []);
        })
        .catch((error) => {
          console.error("Error loading form data:", error);
          toast.error("Failed to load form data");
        });
    }
  }, [props.data, triggerEffect, toast]);

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formFields.findIndex((item) => item._id === active.id);
      const newIndex = formFields.findIndex((item) => item._id === over.id);

      const newFormFields = arrayMove(formFields, oldIndex, newIndex);
      setFormFields(newFormFields);

      // Update order in backend
      try {
        const updatePromises = newFormFields.map((item, index) => putData({ id: item._id, orderId: index + 1 }, "ticket-form-data"));
        await Promise.all(updatePromises);
      } catch (error) {
        console.error("Error updating field order:", error);
      }
    }
  };

  // Handle drag end for event form fields
  const handleEventFormDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = eventFormFields.findIndex((item) => item._id === active.id);
      const newIndex = eventFormFields.findIndex((item) => item._id === over.id);

      const newEventFormFields = arrayMove(eventFormFields, oldIndex, newIndex);
      setEventFormFields(newEventFormFields);

      // Update order in backend for event form fields
      try {
        const updatePromises = newEventFormFields.map((item, index) => putData({ id: item._id, orderId: index + 1 }, "event-form-fields"));
        await Promise.all(updatePromises);
      } catch (error) {
        console.error("Error updating event form field order:", error);
      }
    }
  };

  // Add field to form
  const handleAddField = async (field, isEventForm = false) => {
    try {
      if (!props?.data?._id) {
        toast.error("No ticket ID available");
        return;
      }

      console.log("Adding field:", field);
      console.log("Ticket ID:", props.data._id);
      console.log("Is Event Form:", isEventForm);

      const fieldData = {
        ticket: props.data._id,
        name: field.value || field.label || field.name,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder || field.label,
        required: field.required || false,
        customClass: "half", // Set default width using customClass
        view: true,
        add: true,
        update: true,
      };

      // Ensure correct parent id based on target section
      if (isEventForm) {
        delete fieldData.ticket;
        fieldData.event = props?.data?.event?._id;
      }

      // Add optional fields if they exist
      if (field.selectApi) fieldData.selectApi = field.selectApi;
      if (field.apiType) fieldData.apiType = field.apiType;
      if (field.options) fieldData.options = field.options;

      console.log("Field data being sent:", fieldData);

      // Use different endpoint for event form fields
      const endpoint = isEventForm ? "event-form-fields" : "ticket-form-data";
      const response = await postData(fieldData, endpoint);

      console.log("API Response:", response);

      if (response?.data?.success || response?.success) {
        toast.success("Field added successfully");
        setTriggerEffect((prev) => !prev);

        // Set the newly added field as expanded to show inline settings
        if (response?.data?.response?._id) {
          setExpandedField(response.data.response._id);
        }
      } else {
        console.error("API returned error:", response);
        toast.error(response?.data?.message || response?.message || "Failed to add field - check console for details");
      }
    } catch (error) {
      console.error("Error adding field:", error);
      toast.error("Failed to add field: " + (error.message || "Network error"));
    }
  };

  // Delete field
  const handleDeleteField = async (field, isEventForm = false) => {
    try {
      const endpoint = isEventForm ? "event-form-fields" : "ticket-form-data";
      const response = await deleteData({ id: field._id }, endpoint);

      if (response?.data?.success) {
        toast.success("Field deleted successfully");
        setTriggerEffect((prev) => !prev);
      } else {
        toast.error("Failed to delete field");
      }
    } catch (error) {
      console.error("Error deleting field:", error);
      toast.error("Failed to delete field");
    }
  };

  // Edit field
  const handleEditField = (field) => {
    setSelectedField(field);
    setIsFieldModalOpen(true);
  };

  // Update field inline
  const handleUpdateField = async (fieldId, updates, isEventForm = false) => {
    try {
      console.log("Updating field:", fieldId, "with updates:", updates);
      const endpoint = isEventForm ? "event-form-fields" : "ticket-form-data";
      const response = await putData({ id: fieldId, ...updates }, endpoint);
      if (response?.data?.success) {
        console.log("Field updated successfully:", response.data);
        // Add a small delay to ensure the database update is complete
        setTimeout(() => {
          setTriggerEffect((prev) => !prev);
        }, 100);
      } else {
        console.error("Failed to update field:", response);
        toast.error("Failed to update field");
      }
    } catch (error) {
      console.error("Error updating field:", error);
      toast.error("Failed to update field");
    }
  };

  // AI form generation
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
          await handleAddField(formField);
          successCount++;
        } catch (fieldError) {
          console.error("Error adding field:", fieldError);
        }
      }

      if (successCount > 0) {
        toast.success(`Generated ${successCount} fields successfully!`);
        setIsAIModalOpen(false);
        setAiDescription("");
      } else {
        toast.error("Failed to add any generated fields");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate form. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // SortableItem component for drag and drop
  const SortableItem = ({ field, isEventForm = false }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 rounded-lg border group relative transition-all duration-200 cursor-pointer hover:shadow-sm ${
          expandedField === field._id ? "border-blue-500 bg-blue-50/20" : "border-gray-200 hover:border-blue-300"
        } ${(field.customClass || "half") === "full" ? "col-span-2" : "col-span-1"}`}
        data-field-width={field.customClass === "full" ? "double" : "single"}
        data-field-id={field._id}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center mr-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span onClick={() => openSideBar(field)} className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 hover:underline transition-all duration-200">
                {field.label}
              </span>

              {field.required && <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Required</span>}
              {(field.customClass || "half") === "full" && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                  <Columns2 className="w-3 h-3" />
                  Double
                </span>
              )}
              {(field.conditionEnabled || conditionalLogicEnabled[field._id]) && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Conditional
                </span>
              )}
            </div>
            {renderPreviewField(field)}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="text-red-500 hover:bg-red-50 p-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteField(field, isEventForm);
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render preview field based on type
  const renderPreviewField = (field) => {
    const placeholder = field.placeholder || `Enter ${field.label.toLowerCase()}`;

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            placeholder={placeholder}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-y focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            rows={3}
            disabled
          />
        );
      case "select":
        const options = field.selectApi ? field.selectApi.split(",") : ["Option 1", "Option 2", "Option 3"];
        return (
          <select className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50" disabled>
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={index} value={option.trim()}>
                {option.trim()}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" disabled />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        );
      case "date":
        return (
          <input
            type="date"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
            disabled
          />
        );
      case "time":
        return (
          <input
            type="time"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
            disabled
          />
        );
      case "email":
        return (
          <input
            type="email"
            placeholder={placeholder}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
            disabled
          />
        );
      case "number":
        return (
          <input
            type="number"
            placeholder={placeholder}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
            disabled
          />
        );
      case "password":
        return (
          <input
            type="password"
            placeholder={placeholder}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
            disabled
          />
        );
      case "file":
        return (
          <input
            type="file"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
            disabled
          />
        );
      case "html":
        return (
          <div className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 min-h-[100px] flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-lg mb-2">📝</div>
              <div className="text-xs">Rich Text Content</div>
              <div className="text-xs opacity-75">Click to edit</div>
            </div>
          </div>
        );
      case "htmleditor":
        return (
          <div className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 min-h-[100px] flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-lg mb-2">📝</div>
              <div className="text-xs">Rich Text Content</div>
              <div className="text-xs opacity-75">Click to edit</div>
            </div>
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder={placeholder}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-50"
            disabled
          />
        );
    }
  };

  // Sidebar functionality
  const openSideBar = (field) => {
    setSelectedFieldForSidebar(field);
    setIsSidebarOpen(true);
  };

  // Clone functionality
  const openCloneModal = async () => {
    setIsCloneModalOpen(true);
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

  const closeCloneModal = () => {
    setIsCloneModalOpen(false);
    setSelectedCloneTicket(null);
  };

  const handleCloneFields = async () => {
    if (!selectedCloneTicket) return;
    setIsCloning(true);
    try {
      const response = await getData({ ticket: selectedCloneTicket }, "ticket-form-data");
      const clonedFields = response?.data?.response || [];

      const currentFieldNames = new Set(formFields.map((f) => f.name));

      for (const field of clonedFields) {
        if (!currentFieldNames.has(field.name)) {
          const { _id, ticket, ...rest } = field;
          await postData({ ...rest, ticket: props?.data?._id }, "ticket-form-data");
        }
      }

      const updated = await getData({ ticket: props?.data?._id, eventId: props?.data?.event?._id }, "ticket-form-data");
      setFormFields(updated?.data?.response || []);
      toast.success("Custom fields cloned successfully!");
      closeCloneModal();
    } catch (e) {
      toast.error("Failed to clone fields");
    }
    setIsCloning(false);
  };

  // Settings tabs
  const settingsTabs = [
    { id: "general", label: "General" },
    { id: "submissions", label: "Submissions" },
    { id: "approval", label: "Approval" },
    { id: "security", label: "Security & Privacy" },
    { id: "notifications", label: "Notifications" },
  ];

  // Open Settings modal when parent toggles trigger
  useEffect(() => {
    if (props?.openSettingsTrigger > 0) {
      setIsSettingsModalOpen(true);
    }
  }, [props?.openSettingsTrigger]);

  // Settings Modal Render Functions
  const renderGeneralSettings = () => (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Form Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            defaultValue={props?.data?.title || "Business Conclave '25"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            defaultValue={props?.data?.description || "Presented by YouthIndia Kuwait"}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );

  // State for dynamic preview data - initialized with ticket model defaults
  const [emailSubject, setEmailSubject] = useState("Thank you for your submission - {{formTitle}}");
  const [emailMessage, setEmailMessage] = useState(
    props?.data?.emailTemplate || "Hi {{name}}, thank you for submitting {{formTitle}}! We have received your information and will get back to you soon."
  );
  const [whatsappMessage, setWhatsappMessage] = useState(props?.data?.whatsappTemplate || "Hi {{name}}, thank you for registering for {{formTitle}}! We will contact you soon with further details.");
  const [websiteMessage, setWebsiteMessage] = useState(props?.data?.onsuccessfullMessage || "Thank you for your submission!");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFieldForSidebar, setSelectedFieldForSidebar] = useState(null);

  // Helper function to replace variables in text
  const replaceVariables = (text) => {
    const formTitle = props?.data?.title || "Business Conclave '25";
    const sampleData = {
      "{{name}}": "Jessica",
      "{{email}}": "jessica@example.com",
      "{{phone}}": "+1 (555) 123-4567",
      "{{formTitle}}": formTitle,
    };

    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return sampleData[match] || match;
    });
  };

  const renderSubmissionSettings = () => (
    <div className="p-2">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission Messaging</h3>
        <p className="text-sm text-gray-600">Configure the message shown to users immediately after they submit the form.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveSubmissionTab("email")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeSubmissionTab === "email" ? "bg-purple-100 text-purple-700 border border-purple-200" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setActiveSubmissionTab("whatsapp")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeSubmissionTab === "whatsapp" ? "bg-purple-100 text-purple-700 border border-purple-200" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          WhatsApp
        </button>
        <button
          onClick={() => setActiveSubmissionTab("website")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeSubmissionTab === "website" ? "bg-purple-100 text-purple-700 border border-purple-200" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Website
        </button>
      </div>

      <div className="grid  grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div>
          {activeSubmissionTab === "email" && (
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4">Email Configuration</h4>

              <div className="flex items-center gap-3 mb-6">
                <input type="radio" id="send-email" name="email-option" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                <label htmlFor="send-email" className="text-sm font-medium text-gray-700">
                  Send confirmation email
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => {
                      setEmailSubject(e.target.value);
                      // Save after a short delay to avoid too many API calls
                      setTimeout(() => {
                        saveSettings({ emailSubject: e.target.value }, { silent: true });
                      }, 500);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Message</label>
                  <textarea
                    rows={4}
                    value={emailMessage}
                    onChange={(e) => {
                      setEmailMessage(e.target.value);
                      // Save after a short delay to avoid too many API calls
                      setTimeout(() => {
                        saveSettings({ emailMessage: e.target.value }, { silent: true });
                      }, 500);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="text-xs text-gray-500">
                  Available variables: <span className="text-blue-600">{"{{name}}"}</span>, <span className="text-blue-600">{"{{email}}"}</span>, <span className="text-blue-600">{"{{phone}}"}</span>,{" "}
                  <span className="text-blue-600">{"{{formTitle}}"}</span>
                </div>
              </div>
            </div>
          )}

          {activeSubmissionTab === "whatsapp" && (
            <div className="w-full p-4">
              <h4 className="text-base font-semibold text-gray-900 mb-4">WhatsApp Configuration</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Message</label>
                  <textarea
                    rows={4}
                    value={whatsappMessage}
                    onChange={(e) => {
                      setWhatsappMessage(e.target.value);
                      // Save after a short delay to avoid too many API calls
                      setTimeout(() => {
                        saveSettings({ whatsappMessage: e.target.value }, { silent: true });
                      }, 500);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="text-xs text-gray-500">
                  Available variables: <span className="text-blue-600">{"{{name}}"}</span>, <span className="text-blue-600">{"{{email}}"}</span>, <span className="text-blue-600">{"{{phone}}"}</span>,{" "}
                  <span className="text-blue-600">{"{{formTitle}}"}</span>
                </div>
              </div>
            </div>
          )}

          {activeSubmissionTab === "website" && (
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4">Website Configuration</h4>

              <div className="flex items-center gap-3 mb-6">
                <input type="radio" id="show-message" name="website-option" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                <label htmlFor="show-message" className="text-sm font-medium text-gray-700">
                  Show a confirmation message
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Message</label>
                  <textarea
                    rows={3}
                    value={websiteMessage}
                    onChange={(e) => {
                      setWebsiteMessage(e.target.value);
                      // Save after a short delay to avoid too many API calls
                      setTimeout(() => {
                        saveSettings({ websiteMessage: e.target.value }, { silent: true });
                      }, 500);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="text-xs text-gray-500">
                  Available variables: <span className="text-blue-600">{"{{name}}"}</span>, <span className="text-blue-600">{"{{email}}"}</span>, <span className="text-blue-600">{"{{phone}}"}</span>,{" "}
                  <span className="text-blue-600">{"{{formTitle}}"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        <div>
          {activeSubmissionTab === "email" && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Email Confirmation</span>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">To:</span> jessica@example.com
                </div>
                <div>
                  <span className="font-medium">Subject:</span> {replaceVariables(emailSubject)}
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded text-gray-700">{replaceVariables(emailMessage)}</div>
              </div>
            </div>
          )}

          {/* whatsup iphone mockup settings  */}
          {activeSubmissionTab === "whatsapp" && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Live Preview</h5>
              <div className="max-w-sm mx-auto">
                <IphoneMockup messageText={replaceVariables(whatsappMessage)} sender="EventHex.ai" />
              </div>
              {/* <div className="bg-white rounded-3xl  border-black border-4 max-w-sm mx-auto" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div className="bg-green-500 p-4 rounded-b-3xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <span className="text-sm font-medium">EventHex.ai</span>
                    <div className="ml-auto flex gap-1">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-800">{replaceVariables(whatsappMessage)}</p>
                  </div>

                  <div className="mt-3 flex justify-center">
                    <div className="flex items-center bg-white rounded-full px-4 py-2 text-sm text-gray-500">Type a message...</div>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          {activeSubmissionTab === "website" && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission Successful!</h3>
              <p className="text-sm text-gray-600 mb-4">Form submitted successfully</p>
              <p className="text-sm text-gray-800 mb-6">{replaceVariables(websiteMessage)}</p>

              <div className="flex gap-3 justify-center">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Submit Another</button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">Download Receipt</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderApprovalSettings = () => (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Approval Workflow</h3>
            <p className="text-sm text-gray-600">Enable this to manually approve or reject submissions for a ticket.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={approvalEnabled}
              onChange={(e) => {
                setApprovalEnabled(e.target.checked);
                // Save immediately for toggles
                saveSettings({ approvalEnabled: e.target.checked }, { silent: true });
              }}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {approvalEnabled && (
        <>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveApprovalTab("approval")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeApprovalTab === "approval" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              On Approval
            </button>
            <button
              onClick={() => setActiveApprovalTab("rejection")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeApprovalTab === "rejection" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              On Rejection
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div>
              {activeApprovalTab === "approval" && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Approval Configuration</h4>

                  {/* Email/WhatsApp Toggle */}
                  <div className="flex space-x-1 mb-6 bg-purple-50 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveApprovalChannel("email")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        activeApprovalChannel === "email" ? "bg-purple-100 text-purple-700 border border-purple-200" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      onClick={() => setActiveApprovalChannel("whatsapp")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        activeApprovalChannel === "whatsapp" ? "bg-purple-100 text-purple-700 border border-purple-200" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      WhatsApp
                    </button>
                  </div>

                  {activeApprovalChannel === "email" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Approval Email Subject</label>
                        <input
                          type="text"
                          value={approvalEmailSubject}
                          onChange={(e) => {
                            setApprovalEmailSubject(e.target.value);
                            // Save after a short delay to avoid too many API calls
                            setTimeout(() => {
                              saveSettings({ approvalEmailSubject: e.target.value }, { silent: true });
                            }, 500);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Approval Email Message</label>
                        <textarea
                          rows={4}
                          value={approvalEmailMessage}
                          onChange={(e) => {
                            setApprovalEmailMessage(e.target.value);
                            // Save after a short delay to avoid too many API calls
                            setTimeout(() => {
                              saveSettings({ approvalEmailMessage: e.target.value }, { silent: true });
                            }, 500);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeApprovalChannel === "whatsapp" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Approval WhatsApp Message</label>
                        <textarea
                          rows={4}
                          value={approvalWhatsappMessage}
                          onChange={(e) => {
                            setApprovalWhatsappMessage(e.target.value);
                            // Save after a short delay to avoid too many API calls
                            setTimeout(() => {
                              saveSettings({ approvalWhatsappMessage: e.target.value }, { silent: true });
                            }, 500);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div className="text-xs text-gray-500">
                        Available variables: <span className="text-blue-600">{"{{name}}"}</span>, <span className="text-blue-600">{"{{email}}"}</span>,{" "}
                        <span className="text-blue-600">{"{{phone}}"}</span>, <span className="text-blue-600">{"{{formTitle}}"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeApprovalTab === "rejection" && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Rejection Configuration</h4>

                  {/* Email/WhatsApp Toggle */}
                  <div className="flex space-x-1 mb-6 bg-purple-50 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveRejectionChannel("email")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        activeRejectionChannel === "email" ? "bg-purple-100 text-purple-700 border border-purple-200" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      onClick={() => setActiveRejectionChannel("whatsapp")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        activeRejectionChannel === "whatsapp" ? "bg-purple-100 text-purple-700 border border-purple-200" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      WhatsApp
                    </button>
                  </div>

                  {activeRejectionChannel === "email" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Email Subject</label>
                        <input
                          type="text"
                          value={rejectionEmailSubject}
                          onChange={(e) => {
                            setRejectionEmailSubject(e.target.value);
                            // Save after a short delay to avoid too many API calls
                            setTimeout(() => {
                              saveSettings({ rejectionEmailSubject: e.target.value }, { silent: true });
                            }, 500);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Email Message</label>
                        <textarea
                          rows={4}
                          value={rejectionEmailMessage}
                          onChange={(e) => {
                            setRejectionEmailMessage(e.target.value);
                            // Save after a short delay to avoid too many API calls
                            setTimeout(() => {
                              saveSettings({ rejectionEmailMessage: e.target.value }, { silent: true });
                            }, 500);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeRejectionChannel === "whatsapp" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rejection WhatsApp Message</label>
                        <textarea
                          rows={4}
                          value={rejectionWhatsappMessage}
                          onChange={(e) => {
                            setRejectionWhatsappMessage(e.target.value);
                            // Save after a short delay to avoid too many API calls
                            setTimeout(() => {
                              saveSettings({ rejectionWhatsappMessage: e.target.value }, { silent: true });
                            }, 500);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div className="text-xs text-gray-500">
                        Available variables: <span className="text-blue-600">{"{{name}}"}</span>, <span className="text-blue-600">{"{{email}}"}</span>,{" "}
                        <span className="text-blue-600">{"{{phone}}"}</span>, <span className="text-blue-600">{"{{formTitle}}"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Preview Panel */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4">Preview</h4>

              {activeApprovalTab === "approval" && (
                <>
                  {activeApprovalChannel === "email" && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Approval Email Notification</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">To:</span> jessica@example.com
                        </div>
                        <div>
                          <span className="font-medium">Subject:</span> {replaceVariables(approvalEmailSubject)}
                        </div>
                        <div className="mt-4 p-3 bg-green-50 rounded text-gray-700">{replaceVariables(approvalEmailMessage)}</div>
                      </div>
                    </div>
                  )}

                  {activeApprovalChannel === "whatsapp" && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Approval WhatsApp Preview</h5>

                      <div className="bg-white rounded-lg p-4 max-w-sm mx-auto" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        {/* Phone mockup */}
                        <div className="bg-black rounded-t-3xl h-6 relative">
                          <div className="absolute left-1/2 top-1 transform -translate-x-1/2 w-16 h-1 bg-gray-800 rounded-full"></div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-b-3xl">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <span className="text-sm font-medium">EventHex.ai</span>
                            <div className="ml-auto flex gap-1">
                              <Smartphone className="w-4 h-4 text-gray-400" />
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-800">{replaceVariables(approvalWhatsappMessage)}</p>
                          </div>

                          <div className="mt-3 flex justify-center">
                            <div className="flex items-center bg-white rounded-full px-4 py-2 text-sm text-gray-500">Type a message...</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeApprovalTab === "rejection" && (
                <>
                  {activeRejectionChannel === "email" && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Rejection Email Notification</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">To:</span> jessica@example.com
                        </div>
                        <div>
                          <span className="font-medium">Subject:</span> {replaceVariables(rejectionEmailSubject)}
                        </div>
                        <div className="mt-4 p-3 bg-red-50 rounded text-gray-700">{replaceVariables(rejectionEmailMessage)}</div>
                      </div>
                    </div>
                  )}

                  {activeRejectionChannel === "whatsapp" && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Rejection WhatsApp Preview</h5>

                      <div className="bg-white rounded-lg p-4 max-w-sm mx-auto" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <div className="bg-black rounded-t-3xl h-6 relative">
                          <div className="absolute left-1/2 top-1 transform -translate-x-1/2 w-16 h-1 bg-gray-800 rounded-full"></div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-b-3xl">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <span className="text-sm font-medium">EventHex.ai</span>
                            <div className="ml-auto flex gap-1">
                              <Smartphone className="w-4 h-4 text-gray-400" />
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-800">{replaceVariables(rejectionWhatsappMessage)}</p>
                          </div>

                          <div className="mt-3 flex justify-center">
                            <div className="flex items-center bg-white rounded-full px-4 py-2 text-sm text-gray-500">Type a message...</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
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
                // Save immediately for toggles
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
                // Save immediately for toggles
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
                // Save after a short delay to avoid too many API calls
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
                // Save immediately for toggles
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
                // Save after a short delay to avoid too many API calls
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

  const renderNotificationSettings = () => (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h3>
        <p className="text-sm text-gray-600">Configure how and when you receive notifications about form submissions.</p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Email Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="text-sm font-medium text-gray-700">Receive email notifications for new submissions</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="text-sm font-medium text-gray-700">Receive daily summary emails</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="text-sm font-medium text-gray-700">Receive weekly analytics reports</span>
            </label>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-base font-semibold text-gray-900 mb-4">SMS Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="text-sm font-medium text-gray-700">Receive SMS notifications for urgent submissions</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="text-sm font-medium text-gray-700">Receive daily SMS summaries</span>
            </label>
          </div>
        </div>

        {/* Notification Frequency */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Notification Frequency</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="radio" name="frequency" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-sm font-medium text-gray-700">Immediate (for each submission)</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="frequency" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-sm font-medium text-gray-700">Batch (every 10 submissions)</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="frequency" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-sm font-medium text-gray-700">Daily summary only</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Publish handler: save current field orders and settings
  const handlePublish = async () => {
    if (!props?.data?._id) {
      toast.error("No ticket ID available");
      return;
    }

    try {
      setIsPublishing(true);

      // Persist current order for both primary (event) and custom fields
      const orderUpdatePromises = [];
      if (Array.isArray(eventFormFields)) {
        eventFormFields.forEach((item, index) => {
          if (item?._id) {
            orderUpdatePromises.push(putData({ id: item._id, orderId: index + 1 }, "event-form-fields"));
          }
        });
      }
      if (Array.isArray(formFields)) {
        formFields.forEach((item, index) => {
          if (item?._id) {
            orderUpdatePromises.push(putData({ id: item._id, orderId: index + 1 }, "ticket-form-data"));
          }
        });
      }

      await Promise.all(orderUpdatePromises);

      // Persist current settings silently
      const allSettings = {
        emailSubject,
        emailMessage,
        whatsappMessage,
        websiteMessage,
        approvalEmailSubject,
        approvalEmailMessage,
        approvalWhatsappMessage,
        rejectionEmailSubject,
        rejectionEmailMessage,
        rejectionWhatsappMessage,
        approvalEnabled,
        captchaEnabled,
        consentEnabled,
        consentMessage,
        termsEnabled,
        termsMessage,
      };
      await saveSettings(allSettings, { silent: true });

      toast.success("Form published successfully");
    } catch (e) {
      console.error("Publish failed:", e);
      toast.error("Failed to publish form");
    } finally {
      setIsPublishing(false);
    }
  };

  // Check for error first
  const errorContent = renderErrorBoundary();
  if (errorContent) {
    return errorContent;
  }

  try {
    return (
      <div className="min-h-screen  bg-gray-50">
        <header className="bg-white  border-gray-200 px-6  sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"></div>
          </div>
        </header>

        <div className="flex h-screen    w-full">
          <div className="w-[60%] p-6 overflow-y-auto bg-white/[0.31]">
            {/* Primary Fields Section */}
            <div className="mb-8 p-6 border-2 rounded-lg border-gray-200 bg-gray-50/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">Common Questions1</h3>
                    {!isEditingEnabled && <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-600 leading-5 max-w-md">
                    {isEditingEnabled ? "Essential information required for all submissions - editing enabled" : "Essential information required for all submissions - locked for editing"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-6 flex-shrink-0">
                  <button
                    onClick={() => setIsEditingEnabled(!isEditingEnabled)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border text-gray-700 border-gray-300 hover:bg-gray-100 whitespace-nowrap"
                  >
                    {isEditingEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    {isEditingEnabled ? "Lock Editing" : "Enable Editing"}
                  </button>
                  {isEditingEnabled && (
                    <div className="relative">
                      <button
                        onClick={() => {
                          setFieldSelectorTarget("event");
                          setIsFieldSelectorOpen(!isFieldSelectorOpen);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        Add Field
                      </button>

                      {/* Inline Field Selector Popup */}
                      {isFieldSelectorOpen && fieldSelectorTarget === "event" && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 w-80 z-50 field-selector-popup">
                          <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                placeholder="Search fields..."
                                value={fieldSearchTerm}
                                onChange={(e) => setFieldSearchTerm(e.target.value)}
                                className="pl-10 text-sm h-9 border border-gray-200 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="max-h-96 overflow-y-auto">
                            <div className="p-4 space-y-6">
                              {/* Quick Fields */}
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">COMMON QUESTIONS</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {filteredQuickFields.map((field) => (
                                    <button
                                      key={field.value}
                                      onClick={() => {
                                        handleAddField(field, true);
                                        setIsFieldSelectorOpen(false);
                                        setFieldSelectorTarget(null);
                                      }}
                                      className="group flex flex-col items-center p-3 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-18 justify-center"
                                    >
                                      <div className="text-blue-600 text-lg mb-2">{field.icon}</div>
                                      <p className="font-medium text-xs text-gray-800 group-hover:text-gray-900 leading-tight">{field.label}</p>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Custom Fields */}
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">CUSTOM QUESTIONS</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {filteredCustomFields.map((field) => (
                                    <button
                                      key={field.value}
                                      onClick={() => {
                                        handleAddField(field, true);
                                        setIsFieldSelectorOpen(false);
                                        setFieldSelectorTarget(null);
                                      }}
                                      className="group flex flex-col items-center p-3 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-18 justify-center"
                                    >
                                      <div className="text-blue-600 text-lg mb-2">{field.icon}</div>
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
                  )}
                </div>
              </div>

              {eventFormFields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-700 mb-1">No primary fields yet</h3>
                  <p className="text-xs text-gray-500 mb-3">{isEditingEnabled ? "Add essential fields that all users must fill out" : "Enable editing to add primary fields"}</p>
                  {isEditingEnabled && (
                    <div className="relative">
                      <button
                        onClick={() => {
                          setFieldSelectorTarget("event");
                          setIsFieldSelectorOpen(!isFieldSelectorOpen);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Add Your First Primary Field
                      </button>

                      {/* Inline Field Selector Popup for First Field */}
                      {isFieldSelectorOpen && fieldSelectorTarget === "event" && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 w-80 z-50 field-selector-popup">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">Add Primary Field</h3>
                              <button onClick={() => setIsFieldSelectorOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                placeholder="Search fields..."
                                value={fieldSearchTerm}
                                onChange={(e) => setFieldSearchTerm(e.target.value)}
                                className="pl-10 text-sm h-9 border border-gray-200 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="max-h-96 overflow-y-auto">
                            <div className="p-4 space-y-6">
                              {/* Quick Fields */}
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">COMMON QUESTIONS</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {filteredQuickFields.map((field) => (
                                    <button
                                      key={field.value}
                                      onClick={() => {
                                        handleAddField(field, true);
                                        setIsFieldSelectorOpen(false);
                                        setFieldSelectorTarget(null);
                                      }}
                                      className="group flex flex-col items-center p-3 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-18 justify-center"
                                    >
                                      <div className="text-blue-600 text-lg mb-2">{field.icon}</div>
                                      <p className="font-medium text-xs text-gray-800 group-hover:text-gray-900 leading-tight">{field.label}</p>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Custom Fields */}
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">CUSTOM QUESTIONS</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {filteredCustomFields.map((field) => (
                                    <button
                                      key={field.value}
                                      onClick={() => {
                                        handleAddField(field, true);
                                        setIsFieldSelectorOpen(false);
                                        setFieldSelectorTarget(null);
                                      }}
                                      className="group flex flex-col items-center p-3 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-18 justify-center"
                                    >
                                      <div className="text-blue-600 text-lg mb-2">{field.icon}</div>
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
                  )}
                </div>
              ) : isEditingEnabled ? (
                // Editing enabled - show draggable fields with controls
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEventFormDragEnd}>
                  <SortableContext items={eventFormFields.map((field) => field._id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-2 gap-3">
                      {eventFormFields.map((field) => (
                        <SortableItem key={field._id} field={field} isEventForm={true} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                // Editing disabled - show read-only fields
                <div className="grid grid-cols-2 gap-3">
                  {eventFormFields.map((field) => (
                    <div key={field._id} className="p-4 rounded-lg border border-gray-200 group relative transition-all duration-200 cursor-not-allowed opacity-75">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center mr-2 cursor-not-allowed">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-900 truncate">{field.label}</span>
                            {field.required && <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Required</span>}
                          </div>
                          {renderPreviewField(field)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Fields Section */}
            <div className="mb-8 p-6 border-2 rounded-lg border-gray-200 bg-gray-50/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Custom Questions</h3>
                  <p className="text-sm text-gray-600 leading-5 max-w-md">Additional information specific to this form</p>
                </div>
                <div className="flex items-center gap-2 ml-6 flex-shrink-0">
                  <button onClick={openCloneModal} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 whitespace-nowrap">
                    <FaCopy size={12} />
                    Clone Fields
                  </button>
                  <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 whitespace-nowrap"
                  >
                    <FaRobot size={12} />
                    AI Generate
                  </button>
                  {formFields.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => {
                          setFieldSelectorTarget("custom");
                          setIsFieldSelectorOpen(!isFieldSelectorOpen);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        Add Field
                      </button>

                      {/* Field Selector Modal */}
                      {isFieldSelectorOpen && fieldSelectorTarget === "custom" && (
                        <div
                          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                          onClick={() => {
                            setIsFieldSelectorOpen(false);
                            setFieldSelectorTarget(null);
                          }}
                        >
                          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <h1 className="text-[18px] font-medium text-gray-900 flex items-center gap-3">
                                  <Plus className="text-blue-600" />
                                  Add Field to Form
                                </h1>
                                <button
                                  onClick={() => {
                                    setIsFieldSelectorOpen(false);
                                    setFieldSelectorTarget(null);
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-6 h-6" />
                                </button>
                              </div>
                            </div>

                            <div className="p-6 border-b border-gray-200">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                  placeholder="Search fields..."
                                  value={fieldSearchTerm}
                                  onChange={(e) => setFieldSearchTerm(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="pl-10 text-sm h-10 border border-gray-200 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                              <div className="p-6 space-y-8">
                                {/* Quick Fields */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 px-1">COMMON QUESTIONS</p>
                                  <div className="grid grid-cols-3 gap-3">
                                    {filteredQuickFields.map((field) => (
                                      <button
                                        key={field.value}
                                        onClick={() => {
                                          handleAddField(field, false);
                                          setIsFieldSelectorOpen(false);
                                          setFieldSelectorTarget(null);
                                        }}
                                        className="group flex flex-col items-center p-4 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-20 justify-center"
                                      >
                                        <div className="text-blue-600 text-xl mb-2">{field.icon}</div>
                                        <p className="font-medium text-xs text-gray-800 group-hover:text-gray-900 leading-tight">{field.label}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Custom Fields */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 px-1">CUSTOM QUESTIONS</p>
                                  <div className="grid grid-cols-3 gap-3">
                                    {filteredCustomFields.map((field) => (
                                      <button
                                        key={field.value}
                                        onClick={() => {
                                          handleAddField(field, false);
                                          setIsFieldSelectorOpen(false);
                                          setFieldSelectorTarget(null);
                                        }}
                                        className="group flex flex-col items-center p-4 rounded-lg bg-white hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md text-center h-20 justify-center"
                                      >
                                        <div className="text-blue-600 text-xl mb-2">{field.icon}</div>
                                        <p className="font-medium text-xs text-gray-800 group-hover:text-gray-900 leading-tight">{field.label}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* AI Generate Option */}
                                <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white text-center">
                                  <h4 className="text-lg font-semibold mb-3">Generate with AI</h4>
                                  <p className="text-sm opacity-90 mb-4">Describe your form and let AI create the fields for you</p>
                                  <button
                                    onClick={() => {
                                      setIsFieldSelectorOpen(false);
                                      setFieldSelectorTarget(null);
                                      setIsAIModalOpen(true);
                                    }}
                                    className="px-6 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-sm font-medium hover:bg-opacity-30 transition-all duration-200"
                                  >
                                    <FaMagic className="w-4 h-4 inline mr-2" />
                                    Generate with AI
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {formFields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-700 mb-1">No custom fields yet</h3>
                  <p className="text-xs text-gray-500 mb-3">Add custom fields to collect specific information for this form</p>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setFieldSelectorTarget("custom");
                        setIsFieldSelectorOpen(!isFieldSelectorOpen);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Custom Field
                    </button>
                  </div>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={formFields.map((field) => field._id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-2 gap-3">
                      {formFields.map((field) => (
                        <SortableItem key={field._id} field={field} isEventForm={false} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-[40%] bg-white border-l border-gray-200 p-6 ">
            <div className="w-full mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Form Preview</h3>
              </div>
              <div className="h-px bg-gray-200"></div>

              <form className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {eventFormFields.map((field) => (
                    <div key={field._id} className={`space-y-2 ${(field.customClass || "half") === "full" ? "col-span-2" : "col-span-1"}`}>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {(field.customClass || "half") === "full" && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                            <Columns2 className="w-3 h-3" />
                            Double
                          </span>
                        )}
                      </div>
                      {renderPreviewField(field)}
                    </div>
                  ))}

                  {formFields.map((field) => (
                    <div key={field._id} className={`space-y-2 ${(field.customClass || "half") === "full" ? "col-span-2" : "col-span-1"}`}>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {(field.customClass || "half") === "full" && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                            <Columns2 className="w-3 h-3" />
                            Double
                          </span>
                        )}
                        {(field.conditionEnabled || conditionalLogicEnabled[field._id]) && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Conditional
                          </span>
                        )}
                      </div>
                      {renderPreviewField(field)}
                    </div>
                  ))}
                </div>

                {eventFormFields.length === 0 && formFields.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No fields added yet</p>
                    <p className="text-sm">Start building your form by adding fields from the left panel</p>
                  </div>
                )}

                {(eventFormFields.length > 0 || formFields.length > 0) && (
                  <div className="pt-6 flex items-center justify-center  w-full">
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className={`px-6 py-2 rounded-md font-medium transition-colors ${isPublishing ? "bg-blue-300 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                      {isPublishing ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* AI Modal */}
        {isAIModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsAIModalOpen(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <FaMagic className="text-purple-600" />
                    Generate Form with AI
                  </h2>
                  <button onClick={() => setIsAIModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                <button onClick={() => setIsAIModalOpen(false)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
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

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settingsTabs={settingsTabs}
          activeSettingsTab={activeSettingsTab}
          onTabChange={setActiveSettingsTab}
          renderGeneralSettings={renderGeneralSettings}
          renderSubmissionSettings={renderSubmissionSettings}
          renderApprovalSettings={renderApprovalSettings}
          renderSecuritySettings={renderSecuritySettings}
          renderNotificationSettings={renderNotificationSettings}
          onSave={async () => {
            const allSettings = {
              emailSubject,
              emailMessage,
              whatsappMessage,
              websiteMessage,
              approvalEmailSubject,
              approvalEmailMessage,
              approvalWhatsappMessage,
              rejectionEmailSubject,
              rejectionEmailMessage,
              rejectionWhatsappMessage,
              approvalEnabled,
              captchaEnabled,
              consentEnabled,
              consentMessage,
              termsEnabled,
              termsMessage,
            };
            const success = await saveSettings(allSettings);
            if (success) setIsSettingsModalOpen(false);
          }}
        />

        {/* Field Edit Modal */}
        {isFieldModalOpen && selectedField && (
          <PopupView
            customClass="medium"
            popupData={
              <AutoForm
                formType="post"
                header="Edit Field"
                formInput={[
                  {
                    type: "text",
                    name: "label",
                    label: "Field Label",
                    default: selectedField.label,
                    required: true,
                  },
                  {
                    type: "text",
                    name: "placeholder",
                    label: "Placeholder",
                    default: selectedField.placeholder,
                  },
                  {
                    type: "checkbox",
                    name: "required",
                    label: "Required Field",
                    default: selectedField.required,
                  },
                ]}
                submitHandler={(data) => {
                  putData({ id: selectedField._id, ...data }, "ticket-form-data").then((response) => {
                    if (response?.data?.success) {
                      toast.success("Field updated successfully");
                      setTriggerEffect((prev) => !prev);
                      setIsFieldModalOpen(false);
                    }
                  });
                }}
                button="Save Changes"
                isOpenHandler={() => setIsFieldModalOpen(false)}
                isOpen={true}
              />
            }
            themeColors={themeColors}
            closeModal={() => setIsFieldModalOpen(false)}
          />
        )}

        {/* Clone Modal */}
        {isCloneModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeCloneModal}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Clone Fields</h2>
                  <button onClick={closeCloneModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-auto">
                <p className="text-gray-600 mb-5">Select a ticket to copy its custom fields to this form.</p>

                {isLoadingTickets && (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading tickets...</p>
                  </div>
                )}

                {!isLoadingTickets && cloneTickets.length === 0 && (
                  <div className="text-center py-10 text-gray-600">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-lg font-medium mb-2">No Other Tickets Found</h3>
                    <p>There are no other tickets in this event to clone fields from.</p>
                  </div>
                )}

                {!isLoadingTickets && cloneTickets.length > 0 && (
                  <div className="space-y-3">
                    {cloneTickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        onClick={() => setSelectedCloneTicket(ticket._id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedCloneTicket === ticket._id ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium mb-1">{ticket.title || "Untitled Ticket"}</div>
                        {ticket.description && <div className="text-sm text-gray-600 mb-2">{ticket.description}</div>}
                        <div className="text-xs text-gray-400">ID: {ticket._id.slice(-6)}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={closeCloneModal}
                    disabled={isCloning}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCloneFields}
                    disabled={!selectedCloneTicket || isCloning}
                    className={`px-4 py-2 rounded-lg border-none flex items-center gap-2 transition-colors ${
                      selectedCloneTicket && !isCloning ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isCloning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Cloning...
                      </>
                    ) : (
                      <>
                        <FaCopy />
                        Clone Fields
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Field Details Sidebar */}
        {isSidebarOpen && selectedFieldForSidebar && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)} />
            {/* Sidebar */}
            <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 pb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-[18px] font-[500] text-gray-900 capitalize">
                      {selectedFieldForSidebar.type === "text" && "Properties"}
                      {selectedFieldForSidebar.type === "email" && "Email"}
                      {selectedFieldForSidebar.type === "mobilenumber" && "Mobile Number"}
                      {selectedFieldForSidebar.type === "number" && "Number"}
                      {selectedFieldForSidebar.type === "password" && "Password"}
                      {selectedFieldForSidebar.type === "date" && "Date"}
                      {selectedFieldForSidebar.type === "time" && "Time"}
                      {selectedFieldForSidebar.type === "file" && "File Upload"}
                      {selectedFieldForSidebar.type === "checkbox" && "Checkbox"}
                      {selectedFieldForSidebar.type === "select" && "Dropdown"}
                      {selectedFieldForSidebar.type === "textarea" && "Textarea"}
                      {selectedFieldForSidebar.type === "tel" && "Phone Number"}
                      {selectedFieldForSidebar.type === "company" && "Company"}
                      {selectedFieldForSidebar.type === "url" && "Website"}
                      {selectedFieldForSidebar.type === "text-custom" && "Custom Text"}
                      {selectedFieldForSidebar.type === "info" && "Information Text"}
                      {selectedFieldForSidebar.type === "multiselect" && "Multi-Select"}
                      {selectedFieldForSidebar.type === "title" && "Section Title"}
                      {selectedFieldForSidebar.type === "line" && "Divider Line"}
                      {selectedFieldForSidebar.type === "htmleditor" && "HTML Editor"}
                      {![
                        "text",
                        "email",
                        "mobilenumber",
                        "number",
                        "password",
                        "date",
                        "time",
                        "file",
                        "checkbox",
                        "select",
                        "textarea",
                        "tel",
                        "company",
                        "url",
                        "text-custom",
                        "info",
                        "multiselect",
                        "title",
                        "line",
                        "htmleditor",
                      ].includes(selectedFieldForSidebar.type) && selectedFieldForSidebar.type}
                    </h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Field Type Dropdown - Always Visible */}
                    <div className="">
                      <FormInput
                        type="select"
                        label="Field Type"
                        value={selectedFieldForSidebar.type || "text"}
                        onChange={(event) => {
                          const newType = event.id;
                          setSelectedFieldForSidebar((prev) => ({
                            ...(prev || {}),
                            type: newType,
                          }));
                          if (selectedFieldForSidebar?._id) {
                            handleUpdateField(selectedFieldForSidebar._id, {
                              type: newType,
                            });
                          }
                        }}
                        apiType="JSON"
                        selectApi={[
                          { id: "text", value: "Text" },
                          { id: "number", value: "Number" },
                          { id: "password", value: "Password" },
                          { id: "email", value: "Email" },
                          { id: "mobilenumber", value: "Mobile Number" },
                          { id: "time", value: "Time" },
                          { id: "date", value: "Date" },
                          { id: "image", value: "Image" },
                          { id: "file", value: "File" },
                          { id: "htmleditor", value: "HTML Editor" },
                          { id: "textarea", value: "Text Area" },
                          { id: "checkbox", value: "Checkbox" },
                          { id: "toggle", value: "Toggle" },
                          { id: "select", value: "Select" },
                          { id: "multiselect", value: "Multi Select" },
                          { id: "info", value: "Info" },
                          { id: "line", value: "Line" },
                          { id: "title", value: "Title" },
                          { id: "html", value: "html" },
                        ]}
                        placeholder="Select field type"
                        customClass="full"
                      />
                    </div>

                    {/* Dynamic Fields Based on Selected Type */}
                    <div className=" overflow-y-auto">
                      {/* Text Input Fields */}
                      {["text", "email", "mobilenumber", "password", "number", "tel", "url", "text-custom", "textarea"].includes(selectedFieldForSidebar.type) && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Date and Time Fields */}
                      {["date", "time"].includes(selectedFieldForSidebar.type) && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* File Upload Field */}
                      {selectedFieldForSidebar.type === "file" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="text"
                                label="Placeholder"
                                value={selectedFieldForSidebar.placeholder || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    placeholder: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { placeholder: event.target.value });
                                  }
                                }}
                                placeholder="Enter placeholder text"
                                customClass="full"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Checkbox Field */}
                      {selectedFieldForSidebar.type === "checkbox" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Select/Dropdown Field */}
                      {selectedFieldForSidebar.type === "select" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Company Field */}
                      {selectedFieldForSidebar.type === "company" && (
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <h3 className="font-semibold text-amber-900 mb-3">Company Field Settings</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-amber-800 mb-1">Field Label</label>
                              <input
                                type="text"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(e) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: e.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: e.target.value });
                                  }
                                }}
                                className="w-full px-3 py-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                placeholder="Enter field label"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-amber-800 mb-1">Company Type</label>
                              <select
                                value={selectedFieldForSidebar.companyType || "any"}
                                onChange={(e) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    companyType: e.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { companyType: e.target.value });
                                  }
                                }}
                                className="w-full px-3 py-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                              >
                                <option value="any">Any Company</option>
                                <option value="startup">Startup</option>
                                <option value="enterprise">Enterprise</option>
                                <option value="nonprofit">Non-Profit</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedFieldForSidebar.required || false}
                                  onChange={(e) => {
                                    setSelectedFieldForSidebar((prev) => ({
                                      ...(prev || {}),
                                      required: e.target.checked,
                                    }));
                                    if (selectedFieldForSidebar?._id) {
                                      handleUpdateField(selectedFieldForSidebar._id, { required: e.target.checked });
                                    }
                                  }}
                                  className="mr-2 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm font-medium text-amber-800">Required Field</span>
                              </label>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-amber-800 mb-1">Field Width</label>
                              <select
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(e) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: e.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: e.target.value });
                                  }
                                }}
                                className="w-full px-3 py-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                              >
                                <option value="full">Full Width</option>
                                <option value="half">Half Width</option>
                                <option value="third">One Third</option>
                                <option value="quarter">One Quarter</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Info Field */}
                      {selectedFieldForSidebar.type === "info" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Field */}
                      {selectedFieldForSidebar.type === "image" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Toggle Field */}
                      {selectedFieldForSidebar.type === "toggle" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Multi-Select Field */}
                      {selectedFieldForSidebar.type === "multiselect" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>

                            <div>
                              <FormInput
                                type="text"
                                label="Place Holder"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Line Field */}
                      {selectedFieldForSidebar.type === "line" && (
                        <div className="">
                          <div className="space-y-3">
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Title/Section Field */}
                      {selectedFieldForSidebar.type === "title" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* HTML Editor Field */}
                      {selectedFieldForSidebar.type === "htmleditor" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Required Field"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div>
                              <h1 className="text-[16px] mb-2  border-b font-medium">Character Length</h1>
                              <div className="space-y-3">
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Minimum"
                                    value={selectedFieldForSidebar.minLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        minLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { minLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Minimum"
                                    customClass="full"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    type="number"
                                    label="Maximum"
                                    value={selectedFieldForSidebar.maxLength || ""}
                                    onChange={(event) => {
                                      setSelectedFieldForSidebar((prev) => ({
                                        ...(prev || {}),
                                        maxLength: event.target.value,
                                      }));
                                      if (selectedFieldForSidebar?._id) {
                                        handleUpdateField(selectedFieldForSidebar._id, { maxLength: event.target.value });
                                      }
                                    }}
                                    placeholder="Maximum"
                                    customClass="full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFieldForSidebar.type === "html" && (
                        <div className="">
                          <div className="space-y-3">
                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>

                            <div>
                              <CustomLabel label="Content" required={false} />
                              <Editor
                                value={selectedFieldForSidebar.content || ""}
                                onChange={(content) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    content: content,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { content: content });
                                  }
                                }}
                                placeholder="Enter your content here..."
                                customClass="full"
                                label="Content Editor"
                                id="content-editor"
                                type="content"
                              />
                            </div>

                            <div>
                              <FormInput
                                type="text"
                                label="Label"
                                value={selectedFieldForSidebar.label || ""}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    label: event.target.value,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { label: event.target.value });
                                  }
                                }}
                                placeholder="Enter field label"
                                customClass="full"
                              />
                            </div>
                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Permission Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Required "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Condition Settings</h1>
                            </div>

                            <div className="flex items-center gap-4">
                              <FormInput
                                type="checkbox"
                                label="Enable Condition "
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                            <div>
                              <FormInput
                                type="select"
                                label="Grid Column"
                                value={selectedFieldForSidebar.customClass || "full"}
                                onChange={(event) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    customClass: event.id,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { customClass: event.id });
                                  }
                                }}
                                apiType="JSON"
                                selectApi={[
                                  { id: "quarter", value: "Quarter" },
                                  { id: "third", value: "Third" },
                                  { id: "half", value: "Half" },
                                  { id: "full", value: "Full" },
                                ]}
                                placeholder="Select grid column"
                                customClass="full"
                              />
                            </div>

                            <div className="py-2">
                              <h1 className="text-[16px]  mb-2 border-b font-medium">Additional Settings</h1>
                              <FormInput
                                type="checkbox"
                                label="Enable Additional"
                                value={selectedFieldForSidebar.required || false}
                                onChange={(checked) => {
                                  setSelectedFieldForSidebar((prev) => ({
                                    ...(prev || {}),
                                    required: checked,
                                  }));
                                  if (selectedFieldForSidebar?._id) {
                                    handleUpdateField(selectedFieldForSidebar._id, { required: checked });
                                  }
                                }}
                                customClass="full"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer with Action Buttons */}
              <div className="border-t border-gray-200 bg-white shadow-lg">
                <div className="p-4 flex  items-center justify-between gap-4">
                  <div className="flex">
                    <Button
                      type="secondary"
                      value="Cancel"
                      ClickEvent={() => {
                        setIsSidebarOpen(false);
                        setSelectedFieldForSidebar(null);
                      }}
                      customClass="custom secondary"
                    />
                  </div>
                  <div className="flex">
                    <Button
                      type="primary"
                      value="Save Changes"
                      ClickEvent={() => {
                        // Save changes logic here
                        console.log("Saving changes for field:", selectedFieldForSidebar);
                        // Close sidebar after saving
                        setIsSidebarOpen(false);
                        setSelectedFieldForSidebar(null);
                      }}
                      customClass="custom primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <style>
          {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
        </style>
      </div>
    );
  } catch (err) {
    console.error("FormBuilderNew render error:", err);
    setError(err);
    // Return error content using the same function
    return renderErrorBoundary();
  }
};

export default withLayout(FormBuilderNew);
