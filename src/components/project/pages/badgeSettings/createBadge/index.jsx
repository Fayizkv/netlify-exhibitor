import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronRight, ArrowLeft, X, CheckCircle2, PlusCircle, Ruler, FileText, CreditCard, BadgeCheck, Users, User, Ticket, UserCheck, Building, UserPlus } from "lucide-react";
import { getData, postData } from "../../../../../backend/api";

// EventHex Design System tokens
const ds = {
  colors: {
    primary: "#4F46E5",
    primaryHover: "#4338CA",
    primaryLight: "#EEF2FF",
    primaryLighter: "rgba(79, 70, 229, 0.05)",
    gray50: "#F9FAFB",
    gray100: "#F3F4F6",
    gray200: "#E5E7EB",
    gray300: "#D1D5DB",
    gray400: "#9CA3AF",
    gray600: "#4B5563",
    gray700: "#374151",
    gray800: "#1F2937",
    gray900: "#111827",
  },
  text: {
    heading2: { fontSize: "20px", fontWeight: 600 },
    heading3: { fontSize: "18px", fontWeight: 600 },
    subtitle: { fontSize: "16px", fontWeight: 500 },
    body: { fontSize: "14px", fontWeight: 400 },
    small: { fontSize: "12px", fontWeight: 400 },
    label: { fontSize: "12px", fontWeight: 500 },
  },
  spacing: { sm: "8px", md: "12px", lg: "16px", xl: "24px" },
  shadows: { modal: "0px 16px 32px -12px rgba(88, 92, 95, 0.10)" },
  borders: { radius: { md: "6px", lg: "8px" } },
};

// Badge Types
const badgeTypes = [
  { id: "COMMON_TICKET", name: "Common for all Tickets", icon: Ticket },
  { id: "SPECIFIC_TICKET", name: "Specific Ticket", icon: Users },
  { id: "COMMON_PARTICIPANT", name: "Common for all Participants", icon: User },
  { id: "SPECIFIC_PARTICIPANT", name: "Specific Participant Type", icon: UserCheck },
];

// Predefined Sizes in CM
const predefinedSizes = [
  { id: "standard-conference", name: "Standard Conference", width: 8.5, height: 5.5, icon: Ruler },
  { id: "compact-business", name: "Compact Business", width: 5.5, height: 8.5, icon: Ruler },
  { id: "large-event", name: "Large Event", width: 10, height: 15, icon: Ruler },
  { id: "custom", name: "Custom Size", width: 8.5, height: 5.5, icon: Ruler },
];

// Main Component
const BadgeSetupModalRealSizes = ({ onClose, onComplete, eventId }) => {
  const [step, setStep] = useState(1);

  // Step 1 State
  const [selectedBadgeType, setSelectedBadgeType] = useState("COMMON_TICKET");
  const [selectedSpecificTicket, setSelectedSpecificTicket] = useState("");
  const [selectedSpecificParticipant, setSelectedSpecificParticipant] = useState("");
  const [badgeName, setBadgeName] = useState("");
  const [tickets, setTickets] = useState([]);

  // Step 2 State
  const [selectedSizeId, setSelectedSizeId] = useState("standard-conference");
  const [customDimensions, setCustomDimensions] = useState({ width: 8.5, height: 5.5 });

  // Step 3 State
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      const response = await getData({ event: eventId }, "ticket");
      const filteredTickets = response.data.response.map((ticket) => ({
        id: ticket._id,
        value: ticket.title,
      }));
      setTickets(filteredTickets);
    };
    fetchTickets();
  }, [eventId]);

  // Event handlers
  const handleNextStep = useCallback(() => {
    if (step < 3) {
      setStep(step + 1);
    }
    if (step === 2) setSelectedTemplateId(null);
  }, [step]);

  const handleComplete = useCallback(async () => {
    setCreating(true);

    // Badge name is now optional
    const finalBadgeName = badgeName.trim() || `Badge for ${selectedBadgeType}`;

    try {
      const size = selectedSizeId === "custom" ? customDimensions : predefinedSizes.find((s) => s.id === selectedSizeId);
      const selectedTemplate = templates.find((t) => t.id === selectedTemplateId || t._id === selectedTemplateId);

      // Create builder data from template following the same pattern as handleImport
      const builderElements = [];
      let elementIdCounter = Date.now();

      // Add background element first (this is critical)
      if (selectedTemplate?.templateImage) {
        // console.log(selectedTemplate, size);
        // console.log(selectedTemplate.width, selectedTemplate.height);
        // console.log("selectedTemplate.width", selectedTemplate.width);
        // console.log("selectedTemplate.height", selectedTemplate.height);
        const backgroundElement = {
          id: "background",
          type: "background",
          label: "Background",
          src: `${import.meta.env.VITE_CDN}${selectedTemplate.templateImage}`,
          positionX: 0,
          positionY: 0,
          width: selectedTemplate.width || size.width,
          height: selectedTemplate.height || size.height,
          isBackground: true,
        };
        builderElements.push(backgroundElement);
      }

      // Add template elements based on template settings
      if (selectedTemplate?.isdisplayname) {
        const nameElement = {
          id: elementIdCounter++,
          type: "text",
          label: "Name",
          var: "name",
          preset: "name",
          content: "Sample Name",
          color: "#FFFFFF",
          fontSize: selectedTemplate.displaynamefontSize || 28,
          fontWeight: "bold",
          fontStyle: "normal",
          textAlign: "center",
          alignContent: "center",
          lineHeight: (selectedTemplate.displaynamefontSize || 28) * 1.2,
          positionX: selectedTemplate.displaynameX || 80,
          positionY: selectedTemplate.displaynameY || 545,
          width: selectedTemplate.displaynameWidth || 160,
          height: (selectedTemplate.displaynamefontSize || 28) * 1.5,
        };
        builderElements.push(nameElement);
      }

      if (selectedTemplate?.isdisplayEvent) {
        const eventElement = {
          id: elementIdCounter++,
          type: "text",
          label: "Event",
          var: "event",
          preset: "event",
          content: "Sample Event",
          color: "#FFFFFF",
          fontSize: selectedTemplate.displayEventfontSize || 20,
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "center",
          alignContent: "center",
          lineHeight: (selectedTemplate.displayEventfontSize || 20) * 1.2,
          positionX: selectedTemplate.displayEventX || 120,
          positionY: selectedTemplate.displayEventY || 300,
          width: selectedTemplate.displayEventWidth || 360,
          height: (selectedTemplate.displayEventfontSize || 20) * 1.5,
        };
        builderElements.push(eventElement);
      }

      if (selectedTemplate?.isdisplayTicket) {
        const ticketElement = {
          id: elementIdCounter++,
          type: "text",
          label: "Ticket",
          var: "ticket",
          preset: "ticket",
          content: "Sample Ticket",
          color: "#FFFFFF",
          fontSize: selectedTemplate.displayTicketfontSize || 24,
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "center",
          alignContent: "center",
          lineHeight: (selectedTemplate.displayTicketfontSize || 24) * 1.2,
          positionX: selectedTemplate.displayTicketX || 160,
          positionY: selectedTemplate.displayTicketY || 700,
          width: selectedTemplate.displayTicketWidth || 280,
          height: (selectedTemplate.displayTicketfontSize || 24) * 1.5,
        };
        builderElements.push(ticketElement);
      }

      if (selectedTemplate?.isQrcode) {
        const qrElement = {
          id: elementIdCounter++,
          type: "qr",
          label: "QR Code",
          var: "qrcode",
          preset: "qr",
          positionX: selectedTemplate.qrcodeX || 320,
          positionY: selectedTemplate.qrcodeY || 545,
          width: selectedTemplate.qrcodeWidth || 200,
          height: selectedTemplate.qrcodeWidth || 200,
          qrValue: "sample-qr-data",
          bgColor: "#FFFFFF",
          fgColor: "#000000",
          level: "L",
          includeMargin: true,
          size: selectedTemplate.qrcodeWidth || 200,
        };
        builderElements.push(qrElement);
      }

      // Create badge data based on the model
      const badgeData = {
        name: finalBadgeName,
        badgeType: selectedBadgeType,
        event: eventId,
        layoutWidth: size.width, // in cm
        layoutHeight: size.height, // in cm
        isActive: true,
        backgroundImage: selectedTemplate?.templateImage || "",
        backgroundColor: "",
        fontFamily: "",
        builderData: JSON.stringify(builderElements), // Properly structured builder data
        // tickets: selectedBadgeType === 'SPECIFIC_TICKET' ? [selectedSpecificTicket] : [],
        // ticket: selectedBadgeType === 'SPECIFIC_TICKET' ? selectedSpecificTicket : '',
        participantTypes: selectedBadgeType === "SPECIFIC_PARTICIPANT" ? [selectedSpecificParticipant] : [],
      };
      if (selectedBadgeType === "SPECIFIC_TICKET") {
        badgeData.ticket = selectedSpecificTicket;
      }
      if (selectedBadgeType === "SPECIFIC_PARTICIPANT") {
        badgeData.participantTypes = [selectedSpecificParticipant];
      }

      // Create the badge
      const response = await postData(badgeData, "badge");

      if (response?.data?.success) {
        onComplete && onComplete(response.data.data);
      } else {
        throw new Error("Failed to create badge");
      }
    } catch (error) {
      console.error("Error creating badge:", error);
      alert("Failed to create badge. Please try again.");
    } finally {
      setCreating(false);
    }
  }, [badgeName, selectedBadgeType, selectedSpecificTicket, selectedSpecificParticipant, selectedSizeId, customDimensions, selectedTemplateId, templates, eventId, onComplete]);

  const canProceedFromStep1 = useCallback(() => {
    // Badge name is optional
    if (selectedBadgeType === "SPECIFIC_TICKET") return selectedSpecificTicket !== "";
    if (selectedBadgeType === "SPECIFIC_PARTICIPANT") return selectedSpecificParticipant !== "";
    return true;
  }, [selectedBadgeType, selectedSpecificTicket, selectedSpecificParticipant]);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getData({}, "badge-template");
      if (response?.data?.response) {
        // Add blank template option
        const templatesWithBlank = [{ id: "blank", templateName: "Start from Scratch", templateImage: "" }, ...response.data.response];
        setTemplates(templatesWithBlank);
      } else {
        setTemplates([{ id: "blank", templateName: "Start from Scratch", templateImage: "" }]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([{ id: "blank", templateName: "Start from Scratch", templateImage: "" }]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCustomDimensionsChange = useCallback((e) => {
    const { name, value } = e.target;
    setCustomDimensions((prev) => ({ ...prev, [name]: parseFloat(value) }));
  }, []);

  const getStepTitle = useCallback(() => {
    switch (step) {
      case 1:
        return "Badge Type & Configuration";
      case 2:
        return "Badge Size Selection";
      case 3:
        return "Template Selection";
      default:
        return "";
    }
  }, [step]);

  // Step Components - Memoized to prevent re-rendering
  const Step1_BadgeType = useCallback(
    () => (
      <>
        <div style={{ marginBottom: ds.spacing.xl }}>
          <label style={{ ...ds.text.label, color: ds.colors.gray700, display: "block", marginBottom: ds.spacing.md }}>Badge Name (Optional)</label>
          <input
            key="badge-name-input"
            type="text"
            value={badgeName}
            onChange={(e) => setBadgeName(e.target.value)}
            placeholder="Enter badge name"
            style={{
              width: "100%",
              padding: ds.spacing.md,
              borderRadius: ds.borders.radius.md,
              border: `1px solid ${ds.colors.gray300}`,
              fontSize: ds.text.body.fontSize,
              backgroundColor: "white",
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: ds.spacing.xl }}>
          {badgeTypes.map((type) => (
            <BadgeTypeCard key={type.id} type={type} isSelected={type.id === selectedBadgeType} onClick={() => setSelectedBadgeType(type.id)} icon={type.icon} />
          ))}
        </div>

        {selectedBadgeType.includes("SPECIFIC") && (
          <div style={{ marginBottom: ds.spacing.xl }}>
            <label style={{ ...ds.text.label, color: ds.colors.gray700, display: "block", marginBottom: ds.spacing.md }}>
              {`Select ${selectedBadgeType === "SPECIFIC_TICKET" ? "Ticket" : "Participant"} Type`}
            </label>
            <select
              value={selectedBadgeType === "SPECIFIC_TICKET" ? selectedSpecificTicket : selectedSpecificParticipant}
              onChange={(e) => (selectedBadgeType === "SPECIFIC_TICKET" ? setSelectedSpecificTicket(e.target.value) : setSelectedSpecificParticipant(e.target.value))}
              style={{ width: "100%", padding: ds.spacing.md, borderRadius: ds.borders.radius.md, border: `1px solid ${ds.colors.gray300}`, fontSize: ds.text.body.fontSize, backgroundColor: "white" }}
            >
              <option value="">{`Choose a ${selectedBadgeType === "SPECIFIC_TICKET" ? "ticket" : "participant"} type...`}</option>
              {tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.value}
                </option>
              ))}
            </select>
          </div>
        )}
      </>
    ),
    [badgeName, selectedBadgeType, selectedSpecificTicket, selectedSpecificParticipant, tickets]
  );

  const Step2_Size = useCallback(
    () => (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: ds.spacing.xl }}>
          {predefinedSizes.map((size) => (
            <SizeCard key={size.id} size={size} isSelected={size.id === selectedSizeId} onClick={() => setSelectedSizeId(size.id)} icon={size.icon} />
          ))}
        </div>
        <div
          style={{
            padding: ds.spacing.lg,
            borderRadius: ds.borders.radius.lg,
            border: `2px solid ${selectedSizeId === "custom" ? ds.colors.primary : ds.colors.gray200}`,
            backgroundColor: selectedSizeId === "custom" ? ds.colors.primaryLighter : "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: ds.spacing.md, cursor: "pointer" }} onClick={() => setSelectedSizeId("custom")}>
            <Ruler size={24} style={{ color: selectedSizeId === "custom" ? ds.colors.primary : ds.colors.gray400 }} />
            <h4 style={{ ...ds.text.subtitle, margin: 0, color: ds.colors.gray900, flexGrow: 1 }}>Custom Size</h4>
            {selectedSizeId === "custom" && <CheckCircle2 size={18} style={{ color: ds.colors.primary }} />}
          </div>
          {selectedSizeId === "custom" && (
            <div style={{ marginTop: ds.spacing.lg, display: "flex", gap: ds.spacing.lg }}>
              {["width", "height"].map((dim) => (
                <div key={dim} style={{ flex: 1 }}>
                  <label style={{ ...ds.text.label, color: ds.colors.gray700, display: "block", marginBottom: ds.spacing.sm, textTransform: "capitalize" }}>{dim} (cm)</label>
                  <input
                    type="number"
                    name={dim}
                    min="1"
                    max="50"
                    step="0.1"
                    value={customDimensions[dim]}
                    onChange={handleCustomDimensionsChange}
                    style={{ width: "100%", padding: ds.spacing.md, borderRadius: ds.borders.radius.md, border: `1px solid ${ds.colors.gray300}`, fontSize: ds.text.body.fontSize }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    ),
    [selectedSizeId, customDimensions, handleCustomDimensionsChange]
  );

  const Step3_Template = useCallback(() => {
    const selectedSizeDetails = selectedSizeId === "custom" ? { name: "Custom Size", ...customDimensions } : predefinedSizes.find((s) => s.id === selectedSizeId);
    return (
      <>
        <div
          style={{
            padding: ds.spacing.lg,
            borderRadius: ds.borders.radius.lg,
            backgroundColor: "white",
            border: `1px solid ${ds.colors.gray200}`,
            marginBottom: ds.spacing.xl,
            display: "flex",
            alignItems: "center",
            gap: ds.spacing.lg,
          }}
        >
          <div>
            <h5 style={{ ...ds.text.subtitle, color: ds.colors.gray900, margin: 0 }}>{selectedSizeDetails.name}</h5>
            <p style={{ ...ds.text.small, color: ds.colors.gray600, margin: 0 }}>{`${selectedSizeDetails.width} × ${selectedSizeDetails.height} cm`}</p>
          </div>
          <button
            onClick={() => setStep(2)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: ds.colors.primary,
              fontWeight: 500,
              fontSize: ds.text.small.fontSize,
              display: "flex",
              alignItems: "center",
              gap: ds.spacing.sm,
            }}
          >
            <ArrowLeft size={14} /> Change Size
          </button>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: ds.spacing.xl }}>
            <span style={{ ...ds.text.body, color: ds.colors.gray600 }}>Loading templates...</span>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${templates.length === 1 ? "md:grid-cols-1 max-w-xs mx-auto" : ""}`}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id || template._id}
                template={template}
                isSelected={(template.id || template._id) === selectedTemplateId}
                onClick={() => setSelectedTemplateId(template.id || template._id)}
              />
            ))}
          </div>
        )}
      </>
    );
  }, [selectedSizeId, customDimensions, loading, templates, selectedTemplateId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50 }}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: ds.borders.radius.lg,
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: ds.shadows.modal,
        }}
      >
        <header style={{ padding: ds.spacing.lg, borderBottom: `1px solid ${ds.colors.gray200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ ...ds.text.heading2, color: ds.colors.gray900, margin: 0 }}>Create New Badge</h2>
          <StepIndicator currentStep={step} />
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
            <X size={24} style={{ color: ds.colors.gray600 }} />
          </button>
        </header>

        <main style={{ padding: ds.spacing.xl, overflowY: "auto", flex: 1, backgroundColor: "white" }}>
          <h3 style={{ ...ds.text.heading3, color: ds.colors.gray800, marginTop: 0, marginBottom: ds.spacing.xl }}>{getStepTitle()}</h3>
          {step === 1 && Step1_BadgeType()}
          {step === 2 && Step2_Size()}
          {step === 3 && Step3_Template()}
        </main>

        <footer style={{ padding: ds.spacing.lg, borderTop: `1px solid ${ds.colors.gray200}`, display: "flex", justifyContent: "space-between", backgroundColor: "white" }}>
          <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={step === 1} iconLeft={<ArrowLeft size={16} />}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={handleNextStep} disabled={step === 1 && !canProceedFromStep1()} iconRight={<ChevronRight size={16} />}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!selectedTemplateId || loading || creating}>
              {creating ? "Creating..." : "Create Badge"}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
};

const TemplateCard = ({ template, isSelected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: ds.spacing.lg,
      borderRadius: ds.borders.radius.lg,
      border: `2px solid ${isSelected ? ds.colors.primary : ds.colors.gray200}`,
      backgroundColor: isSelected ? ds.colors.primaryLighter : "#FFFFFF",
      cursor: "pointer",
      position: "relative",
    }}
  >
    {isSelected && <CheckCircle2 size={18} style={{ color: ds.colors.primary, position: "absolute", top: ds.spacing.sm, right: ds.spacing.sm }} />}
    <div
      style={{ height: "120px", backgroundColor: ds.colors.gray100, borderRadius: ds.borders.radius.md, marginBottom: ds.spacing.md, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {template.id === "blank" ? (
        <PlusCircle size={32} style={{ color: ds.colors.gray400 }} />
      ) : (
        <img
          src={`${import.meta.env.VITE_CDN || ""}${template.templateImage}`}
          alt={template.templateName}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: ds.borders.radius.md }}
        />
      )}
    </div>
    <h4 style={{ ...ds.text.subtitle, color: ds.colors.gray900, margin: 0, textAlign: "center" }}>{template.templateName}</h4>
  </div>
);

const Button = ({ variant = "primary", children, onClick, disabled = false, iconLeft, iconRight }) => {
  const styles = {
    primary: { backgroundColor: ds.colors.primary, color: "white" },
    secondary: { backgroundColor: "white", color: ds.colors.gray700, border: `1px solid ${ds.colors.gray300}` },
    disabled: { backgroundColor: ds.colors.gray200, color: ds.colors.gray400, cursor: "not-allowed" },
  };
  const currentStyle = disabled ? styles.disabled : styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: ds.spacing.sm,
        padding: `${ds.spacing.md} ${ds.spacing.xl}`,
        borderRadius: ds.borders.radius.md,
        fontSize: ds.text.body.fontSize,
        fontWeight: 500,
        cursor: "pointer",
        border: "none",
        ...currentStyle,
      }}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
};

const BadgeTypeCard = ({ type, isSelected, onClick, icon: Icon }) => (
  <div
    onClick={onClick}
    style={{
      padding: ds.spacing.lg,
      borderRadius: ds.borders.radius.lg,
      border: `2px solid ${isSelected ? ds.colors.primary : ds.colors.gray200}`,
      backgroundColor: isSelected ? ds.colors.primaryLighter : "#FFFFFF",
      cursor: "pointer",
      textAlign: "center",
    }}
  >
    <Icon size={24} style={{ color: isSelected ? ds.colors.primary : ds.colors.gray400, marginBottom: ds.spacing.sm }} />
    <h4 style={{ ...ds.text.subtitle, color: ds.colors.gray900, margin: 0 }}>{type.name}</h4>
  </div>
);

const SizeCard = ({ size, isSelected, onClick, icon: Icon }) => (
  <div
    onClick={onClick}
    style={{
      padding: ds.spacing.lg,
      borderRadius: ds.borders.radius.lg,
      border: `2px solid ${isSelected ? ds.colors.primary : ds.colors.gray200}`,
      backgroundColor: isSelected ? ds.colors.primaryLighter : "#FFFFFF",
      cursor: "pointer",
      textAlign: "center",
    }}
  >
    <Icon size={24} style={{ color: isSelected ? ds.colors.primary : ds.colors.gray400, marginBottom: ds.spacing.sm }} />
    <h4 style={{ ...ds.text.subtitle, color: ds.colors.gray900, margin: 0 }}>{size.name}</h4>
    <p style={{ ...ds.text.small, color: ds.colors.gray600, margin: 0 }}>{`${size.width} × ${size.height} cm`}</p>
  </div>
);

const StepIndicator = ({ currentStep }) => (
  <div style={{ display: "flex", gap: ds.spacing.sm }}>
    {[1, 2, 3].map((step) => (
      <div
        key={step}
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: step <= currentStep ? ds.colors.primary : ds.colors.gray300,
        }}
      />
    ))}
  </div>
);

export default BadgeSetupModalRealSizes;
