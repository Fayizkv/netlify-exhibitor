import React, { useState, useEffect, useCallback } from "react";
import PosterBuilder from "../../posterbuilder/index.jsx";
import BadgeExport from "../../posterbuilder/BadgeExport.jsx";
import { getData, putData, postData } from "../../../../backend/api";

// Template selection step (from createBadge/index.jsx logic)
const fetchTemplates = async () => {
  try {
    const response = await getData({}, "badge-template");
    return response.data?.response || [];
  } catch (e) {
    return [];
  }
};

const BadgeBuilder = ({ badge, eventId, onClose, onSuccess }) => {
  const [step, setStep] = useState(badge ? 2 : 1); // 1: template, 2: builder, 3: print
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [badgeData, setBadgeData] = useState(badge || null);
  const [showPrint, setShowPrint] = useState(false);

  // Fetch templates on mount
  useEffect(() => {
    if (!badge) {
      fetchTemplates().then(setTemplates);
    }
  }, [badge]);

  // When template is selected, prefill badgeData
  useEffect(() => {
    if (selectedTemplate) {
      // All dimensions are now in CM
      setBadgeData({
        ...badgeData,
        name: selectedTemplate.templateName,
        backgroundImage: selectedTemplate.templateImage,
        layoutWidth: selectedTemplate.width, // in cm
        layoutHeight: selectedTemplate.height, // in cm
        builderData: selectedTemplate.builderData || selectedTemplate.templateData || "[]",
        event: eventId,
      });
      setStep(2);
    }
  }, [selectedTemplate]);

  // Save handler
  const handleSave = async (data) => {
    try {
      let payload = {
        ...badgeData,
        ...data,
        event: eventId,
      };
      // builderData must be stringified
      if (typeof payload.builderData !== "string") {
        payload.builderData = JSON.stringify(payload.builderData);
      }
      let res;
      if (badge && badge._id) {
        payload.id = badge._id;
        res = await putData(payload, "badge");
      } else {
        res = await postData(payload, "badge");
      }
      if (onSuccess) onSuccess(res?.data?.response || res?.data?.data);
      setStep(3); // Go to print step
    } catch (e) {
      alert("Failed to save badge");
    }
  };

  // Print handler
  const handlePrint = () => setShowPrint(true);
  const handlePrintClose = () => setShowPrint(false);

  // Render
  if (step === 1) {
    // Template selection
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 400, maxWidth: 600 }}>
          <h2 style={{ marginBottom: 24 }}>Choose a Badge Template</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {templates.map((tpl) => (
              <div key={tpl._id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 16, cursor: "pointer", width: 160 }} onClick={() => setSelectedTemplate(tpl)}>
                <img src={tpl.templateImage} alt={tpl.templateName} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6 }} />
                <div style={{ marginTop: 8, fontWeight: 500 }}>{tpl.templateName}</div>
              </div>
            ))}
          </div>
          <button style={{ marginTop: 32 }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === 2 && badgeData) {
    // Builder step
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000 }}>
        <PosterBuilder type="badge" data={badgeData} setLoaderBox={() => {}} setMessage={() => {}} onSave={handleSave} onClose={onClose} onPrint={handlePrint} />
        {/* The BadgeExport component is not needed here as PrintBadge is now the standard */}
      </div>
    );
  }

  if (step === 3) {
    // After saving, the user should be returned to the previous screen
    // The PrintBadge component will be used for printing
    if (onSuccess) onSuccess(badgeData);
    onClose();
    return null;
  }

  return null;
};

export default BadgeBuilder;
