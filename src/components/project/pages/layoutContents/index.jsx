import React, { useEffect, useRef } from "react";
import { getData, putData, postData } from "../../../../backend/api";
import { GetAccessToken } from "../../../../backend/authentication";
import { Upload, Move, Trash2, Plus, Image as ImageIcon, Settings, ChevronDown, ChevronUp, GripVertical, Code, FileText, Maximize2, Minimize2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { noimage } from "../../../../images";
import { mergeLayoutContentData, logEventWebsiteOperation } from "../../../../utils/eventWebsiteUtils";
import { Switch } from "../../../core/elements";
import { SubPageHeader } from "../../../core/input/heading";

const style = `
    .moduleOption {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.75rem;
        background-color: #ffffff; transition: all 0.2s ease-in-out;
        text-align: center; cursor: pointer; min-height: 80px;
    }
    .moduleOption:hover {
        background-color: #f8fafc; border-color: #3b82f6; transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
    .moduleOption svg {
        color: #6b7280;
        transition: color 0.2s ease-in-out;
    }
    .moduleOption:hover svg {
        color: #3b82f6;
    }
    .moduleItem.dragging {
        opacity: 0.5; 
        background: #e0e7ff;
        transform: rotate(5deg);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .moduleItem {
        transition: all 0.2s ease;
    }
    
    .moduleItem:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .upload-loading {
        display: inline-flex;
        align-items: center;
        padding: 0.5rem 1rem;
        background-color: #f3f4f6;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        color: #6b7280;
    }

    .upload-loading::before {
        content: "";
        width: 1rem;
        height: 1rem;
        margin-right: 0.5rem;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const DEFAULT_MODULES = [
  { type: "banner", name: "Event Banner" },
  { type: "overview", name: "Event Overview" },
  { type: "speakers", name: "Speakers" },
  { type: "sessions", name: "Sessions" },
  { type: "sponsors", name: "Sponsors" },
  { type: "exhibitors", name: "Exhibitors" },
  { type: "countdown", name: "Event Countdown" },
  { type: "location", name: "Location" },
  { type: "social", name: "Social Media Icons" },
  { type: "gallery", name: "Gallery" },
  { type: "carousel", name: "Image Carousel" },
  { type: "tickets", name: "Tickets" },
];

// Helper function to check if a module type is a default event module
const isDefaultModuleType = (type) => {
  const defaultTypes = ["banner", "overview", "speakers", "sessions", "sponsors", "exhibitors", "countdown", "location", "social", "gallery", "carousel", "tickets"];
  return defaultTypes.includes(type);
};

// Helper function to get display name for module type
const getModuleDisplayName = (type) => {
  const defaultModule = DEFAULT_MODULES.find((m) => m.type === type);
  return defaultModule ? defaultModule.name : type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper function to display images (handles base64 data directly)
const getCDNUrl = (filePath) => {
  if (!filePath) return "";

  // If it's base64 data, return as-is (this is what we'll be storing)
  if (filePath.startsWith("data:")) {
    return filePath;
  }

  // If it's already a full URL, return as-is (backwards compatibility)
  if (filePath.startsWith("http")) {
    return filePath;
  }

  // For any other case, assume it's a file path and construct CDN URL (backwards compatibility)
  const CDN_BASE_URL = "https://event-manager.syd1.cdn.digitaloceanspaces.com/";
  const cleanPath = filePath.replace(/^\/+/, "");
  const fullUrl = `${CDN_BASE_URL}${cleanPath}`;
  return fullUrl;
};

const uploadFileToBackend = async (file, uploadType = "eventWebsite") => {
  try {
    console.log("[uploadFileToBackend] Starting upload:", { fileName: file.name, uploadType });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", uploadType);

    const response = await fetch("https://app-api.eventhex.ai/api/v1/event-website/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("[uploadFileToBackend] Upload response:", result);

    if (response.status === 200 || response.status === 201) {
      const filePath = result.data?.filePath || result.data?.data?.filePath;
      if (filePath) {
        console.log("[uploadFileToBackend] Upload successful, filePath:", filePath);
        return filePath;
      } else {
        console.error("[uploadFileToBackend] No file path in response:", result);
        throw new Error("No file path returned from server");
      }
    } else {
      console.error("[uploadFileToBackend] Upload failed with status:", response.status, result);
      throw new Error(result.message || `Upload failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("[uploadFileToBackend] Upload error:", error);
    throw new Error(error.message || "Upload failed. Please try again.");
  }
};

const MediaUpload = ({ title = "Upload Media", helpText = "PNG, JPG, GIF up to 5MB", settingsForm, setSettingsForm }) => {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState("");

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("[MediaUpload] File selected:", { fileName: file.name, fileSize: file.size, fileType: file.type });

    setUploadError("");

    // Validate file type
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = `Invalid file type: ${file.type}. Please select PNG, JPG, JPEG, GIF, or SVG.`;
      setUploadError(errorMsg);
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const errorMsg = `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max size is 5MB.`;
      setUploadError(errorMsg);
      return;
    }

    setUploading(true);

    try {
      console.log("[MediaUpload] Uploading file to backend...");
      const filePath = await uploadFileToBackend(file, "eventWebsite");
      console.log("[MediaUpload] File uploaded successfully:", filePath);

      setSettingsForm((f) => {
        const newSettings = { media: filePath, fileName: file.name };
        console.log("[MediaUpload] Updated settingsForm:", newSettings);
        console.log("[MediaUpload] setSettingsForm function type:", typeof setSettingsForm);
        return newSettings;
      });
    } catch (error) {
      console.error("[MediaUpload] Upload failed:", error);
      setUploadError(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveFile = () => {
    setSettingsForm((f) => ({ ...f, media: "", fileName: "" }));
    setUploadError("");
    const fileInput = document.getElementById(`file-input-${title.replace(/\s+/g, "-").toLowerCase()}`);
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleChooseFile = () => {
    if (uploading) return;
    const fileInput = document.getElementById(`file-input-${title.replace(/\s+/g, "-").toLowerCase()}`);
    if (fileInput) {
      fileInput.click();
    }
  };

  const mediaPath = settingsForm.media || "";
  const fileName = settingsForm.fileName || "";
  const fullImageUrl = getCDNUrl(mediaPath);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{title}</label>
      <input
        type="file"
        id={`file-input-${title.replace(/\s+/g, "-").toLowerCase()}`}
        onChange={handleFileSelect}
        accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml"
        className="hidden"
        disabled={uploading}
      />
      {uploadError && <div className="mb-3 p-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">{uploadError}</div>}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
        {!mediaPath && !uploading ? (
          <div className="text-center">
            <button
              type="button"
              onClick={handleChooseFile}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={uploading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Choose file
            </button>
            <p className="mt-2 text-sm text-gray-500">No file chosen</p>
          </div>
        ) : uploading ? (
          <div className="text-center">
            <div className="upload-loading">Uploading...</div>
            <p className="mt-2 text-sm text-gray-500">Please wait while your file is being uploaded</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={fullImageUrl}
                alt="Preview"
                className="max-w-full h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.style.display = "none";
                  const errorDiv = document.createElement("div");
                  errorDiv.className = "bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm";
                  errorDiv.textContent = `Image preview failed. Path: ${mediaPath}`;
                  e.target.parentNode.appendChild(errorDiv);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleChooseFile}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700"
                  disabled={uploading}
                >
                  Choose file
                </button>
              </div>
              <button type="button" onClick={handleRemoveFile} className="text-red-600 hover:text-red-800 text-sm font-medium" disabled={uploading}>
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">{helpText}</p>
    </div>
  );
};

// --- Reusable Components with Blue Theme ---
const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}
  >
    {children}
  </button>
);

const Select = ({ label, options, value, onChange }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ColorPicker = ({ color, onChange, label }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm text-gray-700">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 border-none cursor-pointer rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        aria-label={label}
      />
      <span className="text-sm text-gray-700 uppercase">{color}</span>
    </div>
  </div>
);

const FormatToggle = ({ isActive, onToggle, icon: Icon, label }) => (
  <button
    onClick={onToggle}
    className={`p-2 rounded-md transition-colors ${isActive ? "bg-blue-100 text-blue-600" : "bg-white text-gray-600 hover:bg-gray-100"} border border-gray-300`}
    aria-pressed={isActive}
    aria-label={label}
  >
    <Icon size={16} />
  </button>
);

// --- Typography Controller ---
const TypographyControls = ({ styles, onUpdate }) => {
  return (
    <div className="space-y-3">
      <Select
        label="Font Family"
        value={styles.font}
        onChange={(v) => onUpdate("font", v)}
        options={[
          { value: "Inter", label: "Inter" },
          { value: "Manrope", label: "Manrope" },
          { value: "Arial", label: "Arial" },
        ]}
      />
      <Select
        label="Font Size"
        value={styles.fontSize}
        onChange={(v) => onUpdate("fontSize", v)}
        options={[
          { value: "12px", label: "12px" },
          { value: "14px", label: "14px" },
          { value: "16px", label: "16px" },
          { value: "18px", label: "18px" },
          { value: "20px", label: "20px" },
          { value: "24px", label: "24px" },
        ]}
      />
      <ColorPicker color={styles.color} onChange={(v) => onUpdate("color", v)} label="Color" />
      <div className="flex items-center gap-2">
        <FormatToggle isActive={styles.isBold} onToggle={() => onUpdate("isBold", !styles.isBold)} icon={LucideIcons.Bold} label="Bold" />
        <FormatToggle isActive={styles.isItalic} onToggle={() => onUpdate("isItalic", !styles.isItalic)} icon={LucideIcons.Italic} label="Italic" />
        <FormatToggle isActive={styles.isUnderlined} onToggle={() => onUpdate("isUnderlined", !styles.isUnderlined)} icon={LucideIcons.Underline} label="Underline" />
      </div>
    </div>
  );
};

// --- Icon Box Accordion ---
const IconBoxAccordionItem = ({ id, icon, heading, description, onUpdate, onDelete, onMove, isFirst, isLast }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const IconComponent = LucideIcons[icon] || LucideIcons.HelpCircle;

  return (
    <div className="border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 truncate">{heading || "Untitled Icon Box"}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove("up");
            }}
            disabled={isFirst}
            className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-50 rounded-md hover:bg-blue-100"
          >
            <LucideIcons.ArrowUp size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove("down");
            }}
            disabled={isLast}
            className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-50 rounded-md hover:bg-blue-100"
          >
            <LucideIcons.ArrowDown size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-600 hover:text-red-500 rounded-md hover:bg-red-100"
          >
            <LucideIcons.Trash2 size={18} />
          </button>
          {isOpen ? <LucideIcons.ChevronUp size={20} className="text-gray-600" /> : <LucideIcons.ChevronDown size={20} className="text-gray-600" />}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-300 space-y-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g., 'CheckCircle'"
              value={icon}
              onChange={(e) => onUpdate("icon", e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-900"
            />
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md">
              <IconComponent size={20} className="text-blue-600" />
            </div>
          </div>
          <input
            type="text"
            placeholder="Enter heading"
            value={heading}
            onChange={(e) => onUpdate("heading", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-900"
          />
          <textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => onUpdate("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-900"
          />
        </div>
      )}
    </div>
  );
};

// --- Icon Row Settings Component ---
const IconRowSettings = ({ settingsForm, setSettingsForm, onApply, handleSave, modules, activeModuleId, setModules }) => {
  const [activeTab, setActiveTab] = React.useState("Content");
  const [migrationDone, setMigrationDone] = React.useState(false);

  // Migrate old data structure to new structure
  const migrateIconRows = (rows) => {
    if (!rows || !Array.isArray(rows)) return [];

    return rows.map((row, index) => {
      // Handle old structure that used 'image' and 'title' vs new structure that uses 'icon' and 'heading'
      if (row.image && !row.icon) {
        // This is old data, migrate it
        return {
          id: row.id || Date.now() + index,
          icon: "Image", // Default icon for migrated image-based rows
          heading: row.title || `Feature ${index + 1}`,
          description: row.description || "Legacy feature description",
        };
      }
      // This is new data or already migrated - preserve all existing fields
      return {
        id: row.id || Date.now() + index,
        icon: row.icon || "HelpCircle",
        heading: row.heading || row.title || `Feature ${index + 1}`,
        description: row.description || "Feature description",
      };
    });
  };

  // Initialize default values if not present - use current settingsForm data directly
  const sectionTitle = settingsForm.title || "Our Amazing Features";
  const sectionDescription = settingsForm.description || "";

  // Use settingsForm.iconRows directly and only migrate on first load
  let iconRows = settingsForm.iconRows || [];
  if (iconRows.length === 0) {
    iconRows = [
      { id: 1, icon: "Award", heading: "Certified Quality", description: "Recognized for excellence and compliance with industry standards." },
      { id: 2, icon: "ShieldCheck", heading: "Secure & Reliable", description: "Your data is protected with enterprise-grade security protocols." },
    ];
  }
  const itemsPerRow = settingsForm.layoutStyle === "4 Columns" ? 4 : 3;
  const layoutType = settingsForm.layoutType || "style1";

  // Handle backward compatibility for background settings
  let backgroundType = settingsForm.backgroundType;
  let backgroundColor = settingsForm.backgroundColor || "#FFFFFF";
  let backgroundImage = settingsForm.backgroundImage;

  // If backgroundType is not set, infer from existing data
  if (!backgroundType) {
    if (settingsForm.media && (settingsForm.media.startsWith("http") || settingsForm.media.includes("/uploads/"))) {
      backgroundType = "image";
      backgroundImage = settingsForm.media;
    } else {
      backgroundType = "color";
      backgroundColor = settingsForm.media && settingsForm.media.startsWith("#") ? settingsForm.media : "#FFFFFF";
    }
  }
  const iconColor = settingsForm.iconColor || "#2563EB";
  const fontSettings = settingsForm.fontSettings || {
    Heading: { font: "Inter", fontSize: "18px", color: "#1E1E1E", isBold: true, isItalic: false, isUnderlined: false },
    Description: { font: "Inter", fontSize: "14px", color: "#6B7280", isBold: false, isItalic: false, isUnderlined: false },
  };
  const [editTarget, setEditTarget] = React.useState("Heading");

  const addIconRow = () => {
    const newRow = {
      id: Date.now(),
      icon: "Gift",
      heading: "New Feature",
      description: "Briefly describe this awesome new feature.",
    };
    const currentIconRows = settingsForm.iconRows || [];
    const updatedIconRows = [...currentIconRows, newRow];
    console.log("[IconRowSettings] Adding new icon row:", newRow);
    setSettingsForm((f) => ({ ...f, iconRows: updatedIconRows }));
  };

  const deleteIconRow = (id) => {
    const currentIconRows = settingsForm.iconRows || [];
    const updatedIconRows = currentIconRows.filter((row) => row.id !== id);
    console.log("[IconRowSettings] Deleting icon row:", id);
    setSettingsForm((f) => ({ ...f, iconRows: updatedIconRows }));
  };

  const updateIconRow = (id, field, value) => {
    const currentIconRows = settingsForm.iconRows || [];
    const updatedIconRows = currentIconRows.map((row) => (row.id === id ? { ...row, [field]: value } : row));
    console.log("[IconRowSettings] Updating icon row:", { id, field, value });
    setSettingsForm((f) => ({ ...f, iconRows: updatedIconRows }));
  };

  const moveIconRow = (id, direction) => {
    const currentIconRows = settingsForm.iconRows || [];
    const index = currentIconRows.findIndex((row) => row.id === id);
    if (index === -1) return;
    const newRows = [...currentIconRows];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newRows.length) {
      [newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]];
    }
    console.log("[IconRowSettings] Moving icon row:", { id, direction });
    setSettingsForm((f) => ({ ...f, iconRows: newRows }));
  };

  const handleStyleUpdate = (field, value) => {
    const updatedFontSettings = {
      ...fontSettings,
      [editTarget]: { ...fontSettings[editTarget], [field]: value },
    };
    setSettingsForm((f) => ({ ...f, fontSettings: updatedFontSettings }));
  };

  const handleImageUpload = async (file) => {
    try {
      const filePath = await uploadFileToBackend(file, "eventWebsite");
      setSettingsForm((f) => ({ ...f, backgroundImage: filePath, media: filePath }));
    } catch (error) {
      console.error("Background image upload failed:", error);
    }
  };

  // Auto-migrate old data when component mounts (run only once)
  React.useEffect(() => {
    if (!migrationDone) {
      if (settingsForm.iconRows && settingsForm.iconRows.length > 0) {
        const hasOldData = settingsForm.iconRows.some((row) => row.image && !row.icon);
        if (hasOldData) {
          console.log("[IconRowSettings] Migrating old data structure to new format");
          const migratedRows = migrateIconRows(settingsForm.iconRows);
          setSettingsForm((f) => ({
            ...f,
            iconRows: migratedRows,
            // Set default values for new fields if not present
            description: f.description || "",
            layoutType: f.layoutType || "style1",
            backgroundType: f.backgroundType || (f.media && (f.media.startsWith("http") || f.media.includes("/uploads/")) ? "image" : "color"),
            backgroundColor: f.backgroundColor || (f.media && f.media.startsWith("#") ? f.media : "#FFFFFF"),
            backgroundImage: f.backgroundImage || (f.media && (f.media.startsWith("http") || f.media.includes("/uploads/")) ? f.media : null),
            iconColor: f.iconColor || "#2563EB",
            fontSettings: f.fontSettings || {
              Heading: { font: "Inter", fontSize: "18px", color: "#1E1E1E", isBold: true, isItalic: false, isUnderlined: false },
              Description: { font: "Inter", fontSize: "14px", color: "#6B7280", isBold: false, isItalic: false, isUnderlined: false },
            },
          }));
        }
      }
      setMigrationDone(true);
    }
  }, [migrationDone]); // Only depend on migrationDone, not settingsForm.iconRows

  return (
    <div className="bg-white max-w-full mx-auto font-sans">
      <div className="space-y-6">
        <div className="flex gap-6 border-b border-gray-200 pb-4">
          <TabButton isActive={activeTab === "Content"} onClick={() => setActiveTab("Content")}>
            Content
          </TabButton>
          <TabButton isActive={activeTab === "Layout"} onClick={() => setActiveTab("Layout")}>
            Layout
          </TabButton>
          <TabButton isActive={activeTab === "Style"} onClick={() => setActiveTab("Style")}>
            Style
          </TabButton>
        </div>

        <div className="space-y-6">
          {activeTab === "Content" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Title for this section"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Description (optional)</label>
                <textarea
                  value={sectionDescription}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="A short description for this section"
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-900"
                />
              </div>
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">Icon Boxes</h3>
                <button onClick={addIconRow} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold">
                  <Plus size={16} /> Add Icon
                </button>
              </div>
              <div className="space-y-3">
                {(settingsForm.iconRows || []).length > 0 ? (
                  (settingsForm.iconRows || []).map((row, index) => (
                    <IconBoxAccordionItem
                      key={row.id}
                      {...row}
                      onUpdate={(field, value) => updateIconRow(row.id, field, value)}
                      onDelete={() => deleteIconRow(row.id)}
                      onMove={(dir) => moveIconRow(row.id, dir)}
                      isFirst={index === 0}
                      isLast={index === (settingsForm.iconRows || []).length - 1}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">Click "Add Icon" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Layout" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Layout Type</h3>
                <Select
                  label="Layout Style"
                  value={layoutType}
                  onChange={(v) => setSettingsForm((f) => ({ ...f, layoutType: v }))}
                  options={[
                    { value: "style1", label: "Style 1" },
                    { value: "style2", label: "Style 2" },
                    { value: "style3", label: "Style 3" },
                  ]}
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Row Settings</h3>
                <Select
                  label="Items per Row"
                  value={itemsPerRow}
                  onChange={(v) => setSettingsForm((f) => ({ ...f, layoutStyle: v === 4 ? "4 Columns" : "3 Columns" }))}
                  options={[
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                  ]}
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Background</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSettingsForm((f) => ({ ...f, backgroundType: "color" }))}
                    className={`flex-1 py-2 text-sm rounded-md transition-colors ${backgroundType === "color" ? "bg-blue-100 text-blue-600 font-semibold" : "bg-white hover:bg-gray-100"}`}
                  >
                    Color
                  </button>
                  <button
                    onClick={() => setSettingsForm((f) => ({ ...f, backgroundType: "image" }))}
                    className={`flex-1 py-2 text-sm rounded-md transition-colors ${backgroundType === "image" ? "bg-blue-100 text-blue-600 font-semibold" : "bg-white hover:bg-gray-100"}`}
                  >
                    Image
                  </button>
                </div>
                {backgroundType === "color" && <ColorPicker color={backgroundColor} onChange={(v) => setSettingsForm((f) => ({ ...f, backgroundColor: v, media: v }))} label="Background Color" />}
                {backgroundType === "image" && (
                  <div className="space-y-2">
                    <input
                      id="background-image-upload"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleImageUpload(file);
                      }}
                      accept="image/*"
                    />
                    <label
                      htmlFor="background-image-upload"
                      className="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-100"
                    >
                      <p className="text-sm text-gray-600">Click to upload background image</p>
                    </label>
                    {backgroundImage && (
                      <div className="relative">
                        <img src={getCDNUrl(backgroundImage)} alt="Background Preview" className="w-full h-24 object-cover rounded-md" />
                        <button
                          onClick={() => setSettingsForm((f) => ({ ...f, backgroundImage: null, backgroundType: "color", media: backgroundColor }))}
                          className="absolute top-1 right-1 p-1 bg-white/70 rounded-full text-gray-600 hover:text-red-500"
                        >
                          <LucideIcons.X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Style" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Icon</h3>
                <ColorPicker color={iconColor} onChange={(v) => setSettingsForm((f) => ({ ...f, iconColor: v }))} label="Global Icon Color" />
              </div>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Typography</h3>
                <div className="flex gap-2 p-1 bg-gray-200 rounded-md">
                  <button
                    onClick={() => setEditTarget("Heading")}
                    className={`flex-1 py-1 text-sm rounded-md transition-colors ${editTarget === "Heading" ? "bg-white text-gray-900 shadow-sm font-semibold" : "text-gray-600"}`}
                  >
                    Heading
                  </button>
                  <button
                    onClick={() => setEditTarget("Description")}
                    className={`flex-1 py-1 text-sm rounded-md transition-colors ${editTarget === "Description" ? "bg-white text-gray-900 shadow-sm font-semibold" : "text-gray-600"}`}
                  >
                    Description
                  </button>
                </div>
                <TypographyControls styles={fontSettings[editTarget]} onUpdate={handleStyleUpdate} />
              </div>
            </div>
          )}
        </div>

        {/* Apply Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            type="button"
            onClick={() => {
              console.log("[IconRowSettings] Apply button clicked, current settingsForm:", {
                title: settingsForm.title,
                description: settingsForm.description,
                iconRows: settingsForm.iconRows,
                fullSettings: settingsForm,
              });
              onApply();
            }}
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SETTINGS_TEMPLATES REFACTOR ---
const MultiMediaUpload = ({ title = "Upload Images", helpText = "PNG, JPG, GIF up to 5MB each", settingsForm, setSettingsForm }) => {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState("");

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setUploadError("");
    setUploading(true);
    try {
      const uploadedPaths = [];
      for (const file of files) {
        // Validate file type
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif", "image/svg+xml"];
        if (!allowedTypes.includes(file.type)) {
          const errorMsg = `Invalid file type: ${file.type}. Please select PNG, JPG, JPEG, GIF, or SVG.`;
          setUploadError(errorMsg);
          setUploading(false);
          return;
        }
        // Validate file size
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          const errorMsg = `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max size is 5MB.`;
          setUploadError(errorMsg);
          setUploading(false);
          return;
        }
        const filePath = await uploadFileToBackend(file, "eventWebsite");
        uploadedPaths.push(filePath);
      }
      setSettingsForm((f) => ({ ...f, images: [...(f.images || []), ...uploadedPaths] }));
    } catch (error) {
      setUploadError(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    setSettingsForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };
  const images = settingsForm.images || [];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{title}</label>
      <input type="file" multiple onChange={handleFileSelect} accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml" className="hidden" id="multi-image-upload" disabled={uploading} />
      <button
        type="button"
        onClick={() => document.getElementById("multi-image-upload").click()}
        disabled={uploading}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Choose files
      </button>
      {uploadError && <div className="mb-3 p-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">{uploadError}</div>}
      <div className="flex flex-wrap mt-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative mr-2 mb-2">
            <img src={getCDNUrl(img)} alt={`carousel-img-${idx}`} className="w-24 h-24 object-cover rounded border border-gray-200" />
            <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">
              x
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">{helpText}</p>
    </div>
  );
};

const EventBannerSettings = ({ settingsForm, setSettingsForm, onApply }) => {
  // Use settingsForm for all state
  const isExpanded = true; // Always expanded in settings panel
  const bannerType = settingsForm.bannerType || "single";
  const layoutType = settingsForm.layoutType || "sided";
  const sliderConfig = settingsForm.sliderConfig || {
    autoplay: true,
    autoplaySpeed: 5000,
    showDots: true,
    showArrows: true,
    fade: false,
    infinite: true,
  };
  const bannerImages = settingsForm.bannerImages || [
    {
      id: 1,
      url: "/api/placeholder/1200/400",
    },
  ];

  // Handlers
  const setBannerType = (value) => {
    setSettingsForm((f) => {
      let newImages = f.bannerImages || [];
      if (value === "single") {
        // Only keep the first image
        newImages = newImages.length > 0 ? [newImages[0]] : [];
      }
      // If switching to slider, keep existing images
      return { ...f, bannerType: value, bannerImages: newImages };
    });
  };

  const setLayoutType = (value) => setSettingsForm((f) => ({ ...f, layoutType: value }));
  const setSliderConfigField = (field, value) => setSettingsForm((f) => ({ ...f, sliderConfig: { ...sliderConfig, [field]: value } }));
  const setBannerImages = (imgs) => {
    setSettingsForm((f) => ({ ...f, bannerImages: imgs }));
  };

  const addSlideImage = () => {
    // Find the next id (sequential)
    const nextId = bannerImages.length > 0 ? Math.max(...bannerImages.map((img) => img.id || 0)) + 1 : 1;
    const newImage = { id: nextId, url: "" };
    setBannerImages([...bannerImages, newImage]);
  };

  const removeSlideImage = (id) => {
    setBannerImages(bannerImages.filter((img) => img.id !== id));
  };

  // For upload, upload to backend and save only the file path
  const handleUpload = async (id, file) => {
    try {
      const filePath = await uploadFileToBackend(file, "eventWebsite");
      setBannerImages(bannerImages.map((img) => (img.id === id ? { ...img, url: filePath } : img)));
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Configuration Panel */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-6">
          {/* Banner Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Banner Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" name="bannerType" value="single" checked={bannerType === "single"} onChange={(e) => setBannerType(e.target.value)} className="mr-2" />
                <span className="text-sm text-gray-700">Single Image</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="bannerType" value="slider" checked={bannerType === "slider"} onChange={(e) => setBannerType(e.target.value)} className="mr-2" />
                <span className="text-sm text-gray-700">Image Slider</span>
              </label>
            </div>
          </div>

          {/* Layout Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Layout Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" name="layoutType" value="sided" checked={layoutType === "sided"} onChange={(e) => setLayoutType(e.target.value)} className="mr-2" />
                <span className="text-sm text-gray-700">Boxed</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="layoutType" value="full-width" checked={layoutType === "full-width"} onChange={(e) => setLayoutType(e.target.value)} className="mr-2" />
                <span className="text-sm text-gray-700">Full Width</span>
              </label>
            </div>
          </div>

          {/* Banner Images Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">{bannerType === "single" ? "Banner Image" : "Slider Images"}</label>
              {bannerType === "slider" && (
                <button onClick={addSlideImage} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700" type="button">
                  <Plus className="w-4 h-4" />
                  <span>Add Image</span>
                </button>
              )}
            </div>

            {/* Image List */}
            <div className="space-y-3">
              {bannerType === "single"
                ? bannerImages.slice(0, 1).map((image, index) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            <img src={image.url && image.url.trim() !== "" ? getCDNUrl(image.url) : noimage} alt="" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Banner Image</span>
                          </div>
                          <label className="mt-3 flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span>Upload New Image</span>
                            <input
                              type="file"
                              accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleUpload(image.id, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))
                : bannerImages.map((image, index) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            <img src={image.url && image.url.trim() !== "" ? getCDNUrl(image.url) : noimage} alt="" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{`Slide ${index + 1}`}</span>
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600" title="Move" type="button">
                                <Move className="w-4 h-4" />
                              </button>
                              {bannerImages.length > 1 && (
                                <button onClick={() => removeSlideImage(image.id)} className="p-1 text-red-400 hover:text-red-600" title="Remove Slide" type="button">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <label className="mt-3 flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span>Upload New Image</span>
                            <input
                              type="file"
                              accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleUpload(image.id, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Slider Configuration */}
          {bannerType === "slider" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Slider Settings</label>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Autoplay Speed (ms)</label>
                  <input
                    type="number"
                    value={sliderConfig.autoplaySpeed}
                    onChange={(e) => setSliderConfigField("autoplaySpeed", parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1000"
                    max="10000"
                    step="500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" checked={sliderConfig.autoplay} onChange={(e) => setSliderConfigField("autoplay", e.target.checked)} className="mr-2 h-4 w-4 rounded" />
                    <span className="text-sm text-gray-700">Autoplay</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={sliderConfig.infinite} onChange={(e) => setSliderConfigField("infinite", e.target.checked)} className="mr-2 h-4 w-4 rounded" />
                    <span className="text-sm text-gray-700">Infinite Loop</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={sliderConfig.showDots} onChange={(e) => setSliderConfigField("showDots", e.target.checked)} className="mr-2 h-4 w-4 rounded" />
                    <span className="text-sm text-gray-700">Show Dots</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={sliderConfig.showArrows} onChange={(e) => setSliderConfigField("showArrows", e.target.checked)} className="mr-2 h-4 w-4 rounded" />
                    <span className="text-sm text-gray-700">Show Arrows</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={sliderConfig.fade} onChange={(e) => setSliderConfigField("fade", e.target.checked)} className="mr-2 h-4 w-4 rounded" />
                    <span className="text-sm text-gray-700">Fade Transition</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          {/* Apply Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              type="button"
              onClick={onApply}
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SETTINGS_TEMPLATES = {
  _renderTitle({ settingsForm, setSettingsForm }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
        <input
          type="text"
          placeholder="Title for this section"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={settingsForm.title || ""}
          onChange={(e) => setSettingsForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>
    );
  },
  _renderSubtitle({ settingsForm, setSettingsForm }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (optional)</label>
        <textarea
          placeholder="A short description"
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={settingsForm.subtitle || ""}
          onChange={(e) => setSettingsForm((f) => ({ ...f, subtitle: e.target.value }))}
        ></textarea>
      </div>
    );
  },
  _renderToggle(label, key, { settingsForm, setSettingsForm }) {
    const id = `toggle-${key}`;
    return (
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={!!settingsForm[key]} id={id} className="sr-only peer" onChange={(e) => setSettingsForm((f) => ({ ...f, [key]: e.target.checked }))} />
          <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    );
  },
  _renderLayoutSelect(options, { settingsForm, setSettingsForm }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Layout Style</label>
        <select
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={settingsForm.layoutStyle || ""}
          onChange={(e) => setSettingsForm((f) => ({ ...f, layoutStyle: e.target.value }))}
        >
          <option value="">Select layout</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    );
  },
  _renderMediaUpload(title = "Upload Media", helpText = "PNG, JPG, GIF up to 5MB", { settingsForm, setSettingsForm }) {
    return <MediaUpload title={title} helpText={helpText} settingsForm={settingsForm} setSettingsForm={setSettingsForm} />;
  },
  _renderContentEditor({ settingsForm, setSettingsForm }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          rows={4}
          placeholder="Enter your text content here..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={settingsForm.content || ""}
          onChange={(e) => setSettingsForm((f) => ({ ...f, content: e.target.value }))}
        ></textarea>
      </div>
    );
  },
  _renderApplyButton({ onApply }) {
    return (
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          type="button"
          onClick={onApply}
        >
          Apply Settings
        </button>
      </div>
    );
  },
  // --- MODULE-SPECIFIC TEMPLATES ---
  banner({ settingsForm, setSettingsForm, onApply }) {
    return <EventBannerSettings settingsForm={settingsForm} setSettingsForm={setSettingsForm} onApply={onApply} />;
  },
  overview({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Event overview module is enabled. Content will be displayed from your event description.</p>
      </div>
    );
  },
  speakers({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        {this._renderTitle({ settingsForm, setSettingsForm })}
        {this._renderSubtitle({ settingsForm, setSettingsForm })}
        {/* {this._renderLayoutSelect(["Carousel", "List"], { settingsForm, setSettingsForm })} */}
        {this._renderToggle("Show speaker bios as popup", "showBio", { settingsForm, setSettingsForm })}
        {this._renderToggle("Show social media links", "showSocialLinks", { settingsForm, setSettingsForm })}
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  sessions({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        {this._renderTitle({ settingsForm, setSettingsForm })}
        {this._renderSubtitle({ settingsForm, setSettingsForm })}
        {/* {this._renderLayoutSelect(["Timeline View", "Tabbed by Day", "Collapsible List"], { settingsForm, setSettingsForm })} */}
        {this._renderToggle("Show speaker photos", "showSpeakerPhotos", { settingsForm, setSettingsForm })}
        {this._renderToggle("Allow session filtering", "allowSessionFiltering", { settingsForm, setSettingsForm })}
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  sponsors({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        {this._renderTitle({ settingsForm, setSettingsForm })}
        {this._renderSubtitle({ settingsForm, setSettingsForm })}
        {/* {this._renderLayoutSelect(["Grid", "Carousel (Slider)", "Tiered by Level"], { settingsForm, setSettingsForm })} */}
        {this._renderToggle("Show sponsor level titles", "showSponsorLevelTitles", { settingsForm, setSettingsForm })}
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  exhibitors({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        {this._renderTitle({ settingsForm, setSettingsForm })}
        {/* {this._renderLayoutSelect(["Grid with Logos", "List with Details"], { settingsForm, setSettingsForm })} */}
        {this._renderToggle("Show exhibitor details", "showExhibitorDetails", { settingsForm, setSettingsForm })}
        {this._renderToggle("Enable exhibitor search", "enableExhibitorSearch", { settingsForm, setSettingsForm })}
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  countdown({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Event countdown is enabled. </p>
      </div>
    );
  },
  location({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Location module is enabled. Location details will be displayed from your event data.</p>
      </div>
    );
  },
  social({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Social media feed module is enabled. Posts will be displayed from your social media accounts.</p>
        {this._renderLayoutSelect(["Instagram Feed", "Twitter Feed", "Combined Wall"], { settingsForm, setSettingsForm })}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hashtag to Follow</label>
          <input
            type="text"
            placeholder="#YourEvent2025"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={settingsForm.hashtag || ""}
            onChange={(e) => setSettingsForm((f) => ({ ...f, hashtag: e.target.value }))}
          />
        </div>
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  image({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Image module is enabled. Upload an image to display.</p>
        {this._renderMediaUpload("Image", "Upload a high-quality image", { settingsForm, setSettingsForm })}
        {this._renderLayoutSelect(["Right", "Left"], { settingsForm, setSettingsForm })}
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  video({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Video module is enabled. Configure video settings below.</p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube, Vimeo)</label>
        <input
          type="url"
          placeholder="https://..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={settingsForm.videoUrl || ""}
          onChange={(e) => setSettingsForm((f) => ({ ...f, videoUrl: e.target.value }))}
        />
        {this._renderLayoutSelect(["Right", "Left"], { settingsForm, setSettingsForm })}
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  "text-media"({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        {this._renderContentEditor({ settingsForm, setSettingsForm })}
        {this._renderMediaUpload("Image or Video", undefined, { settingsForm, setSettingsForm })}
        {this._renderLayoutSelect(["Text Left, Media Right", "Media Left, Text Right"], { settingsForm, setSettingsForm })}
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  "icon-row"({ settingsForm, setSettingsForm, onApply, handleSave, modules, activeModuleId, setModules }) {
    return (
      <IconRowSettings
        settingsForm={settingsForm}
        setSettingsForm={setSettingsForm}
        onApply={onApply}
        handleSave={handleSave}
        modules={modules}
        activeModuleId={activeModuleId}
        setModules={setModules}
      />
    );
  },
  gallery({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Gallery module is enabled. Images will be displayed from your event gallery.</p>
        <MultiMediaUpload title="Gallery Images" settingsForm={settingsForm} setSettingsForm={setSettingsForm} />
        {this._renderLayoutSelect(["Grid", "Masonry", "Slider"], { settingsForm, setSettingsForm })}
        {this._renderToggle("Show image captions", "showCaptions", { settingsForm, setSettingsForm })}
        {this._renderToggle("Enable lightbox", "enableLightbox", { settingsForm, setSettingsForm })}
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  carousel({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Carousel module is enabled. Images will rotate automatically.</p>
        <MultiMediaUpload title="Carousel Images" settingsForm={settingsForm} setSettingsForm={setSettingsForm} />
        {this._renderToggle("Auto-play carousel", "autoplay", { settingsForm, setSettingsForm })}
        {this._renderToggle("Show navigation dots", "showDots", { settingsForm, setSettingsForm })}
        {this._renderToggle("Show navigation arrows", "showArrows", { settingsForm, setSettingsForm })}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slide Duration (seconds)</label>
          <input
            type="number"
            placeholder="5"
            min="1"
            max="30"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={settingsForm.slideDuration || ""}
            onChange={(e) => setSettingsForm((f) => ({ ...f, slideDuration: e.target.value }))}
          />
        </div>
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  tickets({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        {this._renderTitle({ settingsForm, setSettingsForm })}
        {this._renderSubtitle({ settingsForm, setSettingsForm })}
        {this._renderLayoutSelect(["Grid", "Carousel", "List"], { settingsForm, setSettingsForm })}
        {this._renderToggle("Show ticket bios", "showBio", { settingsForm, setSettingsForm })}
        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
  whatsapp({ settingsForm, setSettingsForm, onApply }) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Whatsapp module is enabled. </p>
      </div>
    );
  },
  html({ settingsForm, setSettingsForm, onApply, modules, activeModuleId, setModules, eventData, eventId }) {
    // Ensure settingsForm has the required fields
    if (!settingsForm) {
      settingsForm = { title: "", htmlContent: "" };
    }
    if (settingsForm.title === undefined) settingsForm.title = "";
    if (settingsForm.htmlContent === undefined) settingsForm.htmlContent = "";

    // Get current module for name editing
    const currentModule = modules?.find((m) => m.id === activeModuleId);
    const currentName = currentModule?.name || "Custom HTML";

    const handleNameChange = (newName) => {
      if (setModules && activeModuleId) {
        setModules((prevModules) => prevModules.map((m) => (m.id === activeModuleId ? { ...m, name: newName.trim() || "Custom HTML", title: newName.trim() || "Custom HTML" } : m)));
        // Also update the settingsForm title to match the block name
        setSettingsForm((f) => ({ ...f, title: newName.trim() || "Custom HTML" }));
      }
    };

    const showAIPopup = () => {
      // Event data is now passed as parameter

      // Create AI popup with React Portal approach
      const popupId = "ai-popup-" + Date.now();
      const popup = document.createElement("div");
      popup.id = popupId;
      popup.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      popup.style.zIndex = "9999";

      popup.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">AI Assistant</h3>
                  <p class="text-sm text-gray-600">Generate HTML content with AI</p>
                </div>
              </div>
              <button id="close-ai-popup-${popupId}" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Describe what you want to create</label>
                <textarea 
                  id="ai-popup-prompt-${popupId}" 
                  rows="4" 
                  placeholder="Example: 'A contact form with name, email and message fields' or 'A pricing table with 3 columns'"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                ></textarea>
              </div>
              <div class="flex space-x-3">
                <button 
                  id="cancel-ai-${popupId}" 
                  class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  id="generate-ai-${popupId}" 
                  class="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                >
                  Generate HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(popup);

      // Event listeners with unique IDs
      const closePopup = () => {
        const popupElement = document.getElementById(popupId);
        if (popupElement && document.body.contains(popupElement)) {
          document.body.removeChild(popupElement);
        }
      };

      document.getElementById(`close-ai-popup-${popupId}`).addEventListener("click", closePopup);
      document.getElementById(`cancel-ai-${popupId}`).addEventListener("click", closePopup);

      document.getElementById(`generate-ai-${popupId}`).addEventListener("click", () => {
        const prompt = document.getElementById(`ai-popup-prompt-${popupId}`).value;
        if (!prompt.trim()) {
          alert("Please enter a description");
          return;
        }

        const button = document.getElementById(`generate-ai-${popupId}`);
        button.disabled = true;
        button.innerHTML = "Generating...";

        // Call backend API for HTML generation
        (async () => {
          try {
            console.log("🚀 Starting AI generation:", { prompt, eventId });

            // Call backend endpoint
            const response = await postData(
              {
                prompt: prompt.trim(),
                eventId: eventId,
                eventData: eventData || {},
              },
              "ai/generate-html"
            );

            if (response.status === 200 && response.data?.success) {
              const htmlContent = response.data.data?.htmlContent || "";
              
              if (!htmlContent) {
                throw new Error("No HTML content generated. Please try again with a different prompt.");
              }

              console.log("🎉 Successfully generated HTML, length:", htmlContent.length);
              setSettingsForm((f) => ({ ...f, htmlContent: htmlContent }));
              closePopup();
            } else {
              throw new Error(response.data?.message || "Failed to generate HTML content.");
            }
          } catch (error) {
            console.error("AI Generation Error:", error);

            // Show more specific error messages based on error type
            let errorMessage = "Failed to generate HTML. Please try again.";

            if (error.message.includes("Failed to fetch") || error.message.includes("Network")) {
              errorMessage = "Network error. Please check your connection and try again.";
            } else if (error.message.includes("401") || error.message.includes("Authentication")) {
              errorMessage = "Authentication failed. Please log in again.";
            } else if (error.message.includes("403") || error.message.includes("Permission")) {
              errorMessage = "Permission denied. Please check your access rights.";
            } else if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("rate limit")) {
              errorMessage = "AI service is busy. Please wait a moment and try again.";
            } else if (error.message.includes("500") || error.message.includes("Server error")) {
              errorMessage = "Server error. Please try again later.";
            } else if (error.message.includes("API key") || error.message.includes("not configured")) {
              errorMessage = "AI service configuration error. Please contact support.";
            } else if (error.message && error.message.length > 0) {
              errorMessage = error.message;
            }

            // Show user-friendly error message
            alert(`❌ ${errorMessage}`);

            // Reset button state
            button.disabled = false;
            button.innerHTML = "Generate HTML";
          }
        })();
      });

      // Close on backdrop click
      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          closePopup();
        }
      });

      // Focus on textarea
      setTimeout(() => {
        document.getElementById(`ai-popup-prompt-${popupId}`).focus();
      }, 100);
    };

    // Use a simple variable for preview mode since this is inside a config object
    let showPreview = false;

    const togglePreview = () => {
      const previewContainer = document.getElementById("html-content-container");
      const toggleBtn = document.getElementById("preview-toggle-btn");

      if (previewContainer && toggleBtn) {
        showPreview = !showPreview;

        if (showPreview) {
          // Show preview-only mode with edit capability
          previewContainer.innerHTML = `
            <div class="space-y-4">
              <!-- Preview Header with Edit Toggle -->
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h4 class="text-sm font-medium text-gray-700">Live Preview</h4>
                  <p class="text-xs text-gray-500">Click elements to edit content directly</p>
                </div>
                <div class="flex items-center space-x-2">
                  <button 
                    id="edit-mode-toggle"
                    class="text-xs px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Edit Mode: ON
                  </button>
                  <button 
                    id="refresh-preview"
                    class="text-xs px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    ↻
                  </button>
                </div>
              </div>
              
              <!-- Live Preview Area -->
              <div class="border border-gray-300 rounded-lg bg-white min-h-[400px] overflow-auto">
                <style>
                  /* Dynamic color variables for preview */
                  .preview-content {
                    --primaryBase: #3B82F6 !important;
                    --primaryDark: #1D4ED8 !important;
                    --primaryDarker: #1E3A8A !important;
                    --primaryLighter: #60A5FA !important;
                    --primaryLightest: #DBEAFE !important;
                  }
                  .preview-content [contenteditable="true"] {
                    outline: 2px dashed #3B82F6;
                    outline-offset: 2px;
                    cursor: text;
                  }
                  .preview-content [contenteditable="true"]:hover {
                    outline-color: #1D4ED8;
                    background-color: rgba(59, 130, 246, 0.05);
                  }
                </style>
                <div id="live-preview-content" class="preview-content p-4">
                  ${
                    settingsForm.htmlContent ||
                    `
                    <div style="text-align: center; padding: 80px 20px; color: #9CA3AF;">
                      <svg style="width: 64px; height: 64px; margin: 0 auto 24px; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                      <h3 style="font-size: 20px; margin-bottom: 12px; color: #475569;">Preview Mode Active</h3>
                      <p style="font-size: 16px; margin: 0 0 8px 0;">Generate content with AI or add HTML to see live preview</p>
                      <p style="font-size: 14px; margin: 0; opacity: 0.7;">Click on text elements to edit them directly</p>
                    </div>
                  `
                  }
                </div>
              </div>
            </div>
          `;

          // Update button text and style
          toggleBtn.textContent = "Hide Preview";
          toggleBtn.className = "text-xs px-3 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors";

          // Enable edit mode functionality
          let editMode = true;
          const editToggle = document.getElementById("edit-mode-toggle");
          const refreshBtn = document.getElementById("refresh-preview");
          const previewContent = document.getElementById("live-preview-content");

          // Toggle edit mode
          editToggle.addEventListener("click", () => {
            editMode = !editMode;
            if (editMode) {
              editToggle.textContent = "Edit Mode: ON";
              editToggle.className = "text-xs px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors";
              enableEditMode();
            } else {
              editToggle.textContent = "Edit Mode: OFF";
              editToggle.className = "text-xs px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors";
              disableEditMode();
            }
          });

          // Refresh preview
          refreshBtn.addEventListener("click", () => {
            previewContent.innerHTML =
              settingsForm.htmlContent ||
              `
              <div style="text-align: center; padding: 80px 20px; color: #9CA3AF;">
                <p style="font-size: 16px; margin: 0;">No HTML Content</p>
                <p style="font-size: 14px; margin: 8px 0 0 0; opacity: 0.7;">Generate content with AI to see preview</p>
              </div>
            `;
            if (editMode) enableEditMode();
          });

          // Enable edit mode function
          function enableEditMode() {
            const editableElements = previewContent.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, div, button, a");
            editableElements.forEach((el) => {
              if (el.children.length === 0 || el.textContent.trim()) {
                el.contentEditable = true;
                el.addEventListener("blur", () => {
                  // Update the form with the new content
                  setSettingsForm((f) => ({ ...f, htmlContent: previewContent.innerHTML }));
                });
              }
            });
          }

          // Disable edit mode function
          function disableEditMode() {
            const editableElements = previewContent.querySelectorAll('[contenteditable="true"]');
            editableElements.forEach((el) => {
              el.contentEditable = false;
            });
          }

          // Initialize edit mode
          if (editMode) enableEditMode();
        } else {
          // Show single textarea
          previewContainer.innerHTML = `
            <textarea 
              id="html-textarea"
              rows="15" 
              placeholder="Paste your HTML code here..." 
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
            >${settingsForm.htmlContent || ""}</textarea>
          `;

          // Update button text and style
          toggleBtn.textContent = "Show Preview";
          toggleBtn.className = "text-xs px-3 py-1 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors";

          // Add event listener to the textarea
          const textarea = document.getElementById("html-textarea");
          if (textarea) {
            textarea.addEventListener("input", (e) => {
              setSettingsForm((f) => ({ ...f, htmlContent: e.target.value }));
            });
          }
        }
      }
    };

    const showFullPagePreview = () => {
      const fullPageId = "fullpage-preview-" + Date.now();
      const popup = document.createElement("div");
      popup.id = fullPageId;
      popup.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      popup.style.zIndex = "9999";

      popup.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] mx-4 flex flex-col">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
            <div>
              <h3 class="text-lg font-semibold">🚀 Full Page Preview</h3>
              <p class="text-sm opacity-90">${currentName}</p>
            </div>
            <button id="close-fullpage-${fullPageId}" class="text-white hover:text-gray-200 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-auto p-6 bg-gray-50">
            <div class="bg-white rounded-lg shadow-sm min-h-full">
              <style>
                /* Dynamic color variables for preview */
                :root {
                  --primaryBase: #3B82F6;
                  --primaryDark: #1D4ED8;
                  --primaryDarker: #1E3A8A;
                  --primaryLighter: #60A5FA;
                  --primaryLightest: #DBEAFE;
                }
                .preview-content * {
                  color: var(--primaryBase) !important;
                }
                .preview-content [style*="primaryBase"] {
                  background-color: var(--primaryBase) !important;
                }
                .preview-content [style*="primaryDark"] {
                  background-color: var(--primaryDark) !important;
                }
                .preview-content [style*="primaryDarker"] {
                  background-color: var(--primaryDarker) !important;
                }
                .preview-content [style*="primaryLighter"] {
                  background-color: var(--primaryLighter) !important;
                }
                .preview-content [style*="primaryLightest"] {
                  background-color: var(--primaryLightest) !important;
                }
              </style>
              <div class="preview-content p-4">
                ${
                  settingsForm.htmlContent ||
                  `
                  <div style="text-align: center; padding: 100px 20px; color: #64748b;">
                    <div style="max-width: 400px; margin: 0 auto;">
                      <svg style="width: 80px; height: 80px; margin: 0 auto 24px; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                      </svg>
                      <h2 style="font-size: 24px; margin-bottom: 12px; color: #475569;">No HTML Content</h2>
                      <p style="font-size: 16px; line-height: 1.6;">Add some HTML content to your block to see the full page preview</p>
                    </div>
                  </div>
                `
                }
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(popup);

      const closePopup = () => {
        const popupElement = document.getElementById(fullPageId);
        if (popupElement && document.body.contains(popupElement)) {
          document.body.removeChild(popupElement);
          document.removeEventListener("keydown", handleEscape);
        }
      };

      // Event listeners
      document.getElementById(`close-fullpage-${fullPageId}`).addEventListener("click", closePopup);

      // Close on backdrop click
      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          closePopup();
        }
      });

      // Close on escape key
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          closePopup();
        }
      };
      document.addEventListener("keydown", handleEscape);
    };

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Configure your custom HTML block settings below.</p>

        {/* Block Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Block Name</label>
          <input
            type="text"
            value={currentName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter a name for this HTML block"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Block Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Enable Block</h3>
            <p className="text-xs text-gray-500">Toggle to enable/disable this HTML block</p>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                const currentModule = modules?.find((m) => m.id === activeModuleId);
                if (currentModule && setModules) {
                  setModules((prevModules) => prevModules.map((m) => (m.id === activeModuleId ? { ...m, enabled: !m.enabled } : m)));
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                currentModule?.enabled ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentModule?.enabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* HTML Content Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">HTML Content</label>
            <div className="flex items-center space-x-2">
              <button type="button" onClick={showAIPopup} className="flex items-center space-x-1 text-xs px-3 py-1 text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span>Generate with AI</span>
              </button>
              <button type="button" id="preview-toggle-btn" onClick={togglePreview} className="text-xs px-3 py-1 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors">
                Show Preview
              </button>
              <button type="button" onClick={showFullPagePreview} className="text-xs px-3 py-1 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition-colors">
                Full Page
              </button>
              <div className="relative group">
                <svg className="w-4 h-4 text-yellow-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Only use trusted HTML. Avoid scripts.
                </div>
              </div>
            </div>
          </div>

          <div id="html-content-container">
            <textarea
              id="html-textarea"
              rows={15}
              placeholder="Paste your HTML code here..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
              value={settingsForm.htmlContent || ""}
              onChange={(e) => setSettingsForm((f) => ({ ...f, htmlContent: e.target.value }))}
            />
          </div>
        </div>

        {this._renderApplyButton({ onApply })}
      </div>
    );
  },
};

// Define which fields to keep for each module type in settings
const MODULE_SETTINGS_FIELDS = {
  image: ["title", "subtitle", "media", "fileName", "layoutStyle"],
  video: ["title", "subtitle", "videoUrl", "layoutStyle"],
  "text-media": ["title", "subtitle", "content", "layoutStyle", "media", "fileName"],
  "icon-row": ["title", "description", "layoutType", "layoutStyle", "backgroundType", "backgroundColor", "backgroundImage", "media", "iconColor", "fontSettings", "iconRows"],
  html: ["title", "htmlContent"],
  banner: ["media", "showButton", "buttonText", "buttonLink", "bannerType", "layoutType", "bannerImages", "sliderConfig"],
  overview: [],
  speakers: ["title", "subtitle", "layoutStyle", "showBio", "showSocialLinks", "showInHeader"],
  sessions: ["title", "subtitle", "layoutStyle", "showSpeakerPhotos", "allowSessionFiltering"],
  sponsors: ["title", "layoutStyle", "showSponsorLevelTitles", "showInHeader"],
  exhibitors: ["title", "layoutStyle", "showExhibitorDetails", "enableExhibitorSearch"],
  countdown: ["title", "showCountdownUnits"],
  location: ["showMap"],
  social: ["layoutStyle", "hashtag"],
  gallery: ["images", "layoutStyle", "showCaptions", "enableLightbox", "showInHeader"],
  carousel: ["images", "autoplay", "showDots", "showArrows", "slideDuration"],
  tickets: ["title", "subtitle", "layoutStyle", "showBio"],
  whatsapp: [],
};

const DisplayModule = (props) => {
  const eventId = props.openData.data._id;
  const registrationType = props.openData?.data?.registrationType || "";
  const isGroupCheckout = typeof registrationType === "string" && registrationType.toLowerCase().includes("multiple");
  const addModulePopupRef = useRef(null);
  const addModuleBtnRef = useRef(null);
  const [modules, setModules] = React.useState([]);
  const [activeModuleId, setActiveModuleId] = React.useState(null);
  const [showAddModule, setShowAddModule] = React.useState(false);
  const [draggedId, setDraggedId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [eventWebsite, setEventWebsite] = React.useState(null);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [settingsForm, setSettingsForm] = React.useState({});
  const [message, setMessage] = React.useState(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  useEffect(() => {
    if (!eventId) return;

    setLoading(true);
    setError(null);
    setDataLoaded(false);

    getData({ event: eventId }, "event-website")
      .then((result) => {
        const eventWebsiteData = result.data?.data;

        if (result.status === 200 && eventWebsiteData) {
          setEventWebsite(eventWebsiteData);

          // --- MERGE DEFAULT_MODULES WITH BACKEND MODULES ---
          let backendModules = Array.isArray(eventWebsiteData.modules) ? eventWebsiteData.modules : [];
          // Map for quick lookup
          const backendMap = {};
          backendModules.forEach((m, i) => {
            backendMap[m.type] = { ...m, order: m.order !== undefined ? Number(m.order) : i };
          });

          // Start with all DEFAULT_MODULES
          let mergedModules = DEFAULT_MODULES.map((def, i) => {
            const backend = backendMap[def.type];
            // Set default enabled state for specific modules
            const enabledByDefaultTypes = ["banner", "overview", "tickets", "location", "whatsapp", "social"];
            const isEnabledDefault = enabledByDefaultTypes.includes(def.type);
            // Force disable tickets for Group Checkout Form (Multiple)
            const forcedDisabled = def.type === "tickets" && isGroupCheckout;
            const enabled = forcedDisabled ? false : backend ? Boolean(backend.enabled !== undefined ? backend.enabled : isEnabledDefault) : isEnabledDefault;
            // Use backend name if available, otherwise use default name
            const moduleName = backend && backend.name ? backend.name : def.name;
            return {
              type: def.type,
              name: moduleName,
              isCustom: false,
              id: backend ? `module-db-${def.type}-${i}` : `module-default-${Date.now()}-${i}`,
              enabled,
              settings: backend ? backend.settings || {} : {},
              order: backend ? backend.order : i,
            };
          });

          // Add any custom modules from backend that are not in DEFAULT_MODULES
          backendModules.forEach((m, i) => {
            if (!DEFAULT_MODULES.find((def) => def.type === m.type)) {
              mergedModules.push({
                type: m.type,
                name: m.name || getModuleDisplayName(m.type),
                isCustom: true,
                id: `module-db-${m.type}-${i}`,
                enabled: Boolean(m.enabled !== undefined ? m.enabled : true),
                settings: m.settings || {},
                order: m.order !== undefined ? Number(m.order) : mergedModules.length,
              });
            }
          });

          // Sort by order
          mergedModules.sort((a, b) => (a.order || 0) - (b.order || 0));
          setModules(mergedModules);
          // --- END MERGE LOGIC ---
        } else {
          // Fallback to all DEFAULT_MODULES
          const defaultModules = DEFAULT_MODULES.map((m, index) => {
            // Set default enabled state for specific modules
            const enabledByDefaultTypes = ["banner", "overview", "tickets", "location", "whatsapp", "social"];
            const isEnabledDefault = enabledByDefaultTypes.includes(m.type);
            const forcedDisabled = m.type === "tickets" && isGroupCheckout;
            const enabled = forcedDisabled ? false : isEnabledDefault;
            return { ...m, isCustom: false, id: `module-default-${Date.now()}-${index}`, enabled, settings: {}, order: index };
          });
          setModules(defaultModules);
        }

        setDataLoaded(true);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load event website data");
        // On error, set all DEFAULT_MODULES
        const defaultModules = DEFAULT_MODULES.map((m, index) => {
          // Set default enabled state for specific modules
          const enabledByDefaultTypes = ["banner", "overview", "tickets", "location", "whatsapp", "social"];
          const isEnabledDefault = enabledByDefaultTypes.includes(m.type);
          const forcedDisabled = m.type === "tickets" && isGroupCheckout;
          const enabled = forcedDisabled ? false : isEnabledDefault;
          return { ...m, isCustom: false, id: `module-default-${Date.now()}-${index}`, enabled, settings: {}, order: index };
        });
        setModules(defaultModules);

        setDataLoaded(true);
        setLoading(false);
      });
  }, [eventId]);

  // Enforce tickets disabled in UI whenever registration type switches to group/multiple
  useEffect(() => {
    if (!modules || modules.length === 0) return;
    if (!isGroupCheckout) return;

    const hasEnabledTickets = modules.some((m) => m.type === "tickets" && m.enabled);
    if (hasEnabledTickets) {
      const updatedModules = modules.map((m) => (m.type === "tickets" ? { ...m, enabled: false } : m));
      setModules(updatedModules);
      // Auto-save the change to persist
      (async () => {
        try {
          await handleSave(updatedModules);
        } catch (e) {
          // silent fail; error handling already inside handleSave
        }
      })();
    }
  }, [isGroupCheckout]);

  // Listen for menu updates from MenuSettings component
  useEffect(() => {
    const handleMenuUpdate = (event) => {
      if (event.detail?.eventWebsiteId === eventWebsite?._id) {
        // Refresh eventWebsite data to get updated menu information
        getData({ event: eventId }, "event-website")
          .then((result) => {
            if (result.status === 200 && result.data?.data) {
              setEventWebsite(result.data.data);
            }
          })
          .catch((err) => {
            console.error("[LayoutContents] Failed to refresh data after menu update:", err);
          });
      }
    };

    window.addEventListener("menuUpdated", handleMenuUpdate);
    return () => window.removeEventListener("menuUpdated", handleMenuUpdate);
  }, [eventId, eventWebsite?._id]);

  const handleSave = async (modulesToSave = modules, silent = false) => {
    if (!eventId) {
      return;
    }
    setLoading(true);
    setError(null);

    // Validate modules before processing
    if (!Array.isArray(modulesToSave)) {
      const errorMsg = "Modules data is invalid";
      setError(errorMsg);
      setLoading(false);
      return;
    }

    // Process each module carefully, filtering settings fields
    const processedModules = [];

    for (let i = 0; i < modulesToSave.length; i++) {
      const module = modulesToSave[i];

      // Validate module structure
      if (!module || typeof module !== "object") {
        const errorMsg = `Module ${i} is invalid`;
        setError(errorMsg);
        setLoading(false);
        return;
      }

      if (!module.type) {
        const errorMsg = `Module ${i} is missing type`;
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Special handling for icon-row module to preserve iconRows data
      let filteredSettings = {};
      if (module.type === "icon-row") {
        console.log("[LayoutContents] Processing icon-row module:", {
          originalSettings: module.settings,
          iconRows: module.settings?.iconRows,
          moduleId: module.id,
        });

        // Always preserve the entire settings object for icon-row modules
        filteredSettings = { ...module.settings };

        // Ensure iconRows is properly structured if it exists
        if (module.settings.iconRows && Array.isArray(module.settings.iconRows)) {
          filteredSettings.iconRows = module.settings.iconRows.map((row) => ({
            id: row.id,
            // Support both old and new field names for backward compatibility
            title: row.title || row.heading || "",
            heading: row.heading || row.title || "",
            description: row.description || "",
            icon: row.icon || "HelpCircle",
            // Keep old fields for backward compatibility
            image: row.image || "",
            fileName: row.fileName || "",
            layoutStyle: row.layoutStyle || "3 Columns",
          }));
        }

        console.log("[LayoutContents] Final processed icon-row settings:", filteredSettings);
        console.log(
          "[LayoutContents] Icon rows data:",
          filteredSettings.iconRows?.map((row) => ({
            id: row.id,
            heading: row.heading,
            icon: row.icon,
            description: row.description,
            // Legacy fields
            title: row.title,
            image: row.image,
          }))
        );
      } else {
        // For other modules, only keep allowed fields
        const allowedFields = MODULE_SETTINGS_FIELDS[module.type] || [];
        if (module.settings && typeof module.settings === "object") {
          allowedFields.forEach((field) => {
            if (module.settings[field] !== undefined) {
              filteredSettings[field] = module.settings[field];
            }
          });
        }
      }

      const cleanModule = {
        type: String(module.type),
        name: module.name || getModuleDisplayName(module.type),
        settings: filteredSettings,
        // Enforce tickets disabled for group checkout on save as final guard
        enabled: module.type === "tickets" && isGroupCheckout ? false : Boolean(module.enabled !== undefined ? module.enabled : true),
        order: Number(module.order !== undefined ? module.order : i),
      };
      processedModules.push(cleanModule);
    }

    // Sort by order before saving to ensure consistency
    processedModules.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Create the final payload with proper data types
    // IMPORTANT: Preserve existing menu data to prevent overwriting
    const layoutData = {
      title: String(eventWebsite?.title || ""),
      subtitle: String(eventWebsite?.subtitle || ""),
      button: {
        show: Boolean(eventWebsite?.button?.show !== false),
        text: String(eventWebsite?.button?.text || "Register Now"),
        link: String(eventWebsite?.button?.link || ""),
      },
      modules: processedModules, // Pass as array, not JSON string
      event: String(eventId),
    };

    // Use utility function to merge data properly
    const payload = mergeLayoutContentData(eventWebsite, layoutData);
    logEventWebsiteOperation("SAVE_LAYOUT", "LayoutContents", payload);

    // Log the final payload for debugging
    console.log("[LayoutContents] Final payload being sent to API:", {
      modules: payload.modules?.map((m) => ({
        type: m.type,
        settings:
          m.type === "icon-row"
            ? {
                ...m.settings,
                iconRows: m.settings.iconRows?.map((row) => ({
                  id: row.id,
                  title: row.title,
                  image: row.image,
                  fileName: row.fileName,
                })),
              }
            : m.settings,
      })),
    });

    // Test JSON serialization before sending
    try {
      JSON.stringify(payload);
    } catch (serializationError) {
      const errorMsg = "Data serialization failed";
      setError(errorMsg);
      setLoading(false);
      return;
    }

    // Determine whether to CREATE or UPDATE
    const isUpdate = eventWebsite && eventWebsite._id;

    // Make the appropriate API call using direct fetch for both CREATE and UPDATE
    try {
      let response;

      if (isUpdate) {
        // Use direct fetch for UPDATE
        response = await fetch(`${import.meta.env.VITE_API}event-website/${eventWebsite._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GetAccessToken(),
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Use direct fetch for CREATE instead of postData to avoid serialization issues
        response = await fetch(`${import.meta.env.VITE_API}event-website`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GetAccessToken(),
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.status !== 200 && response.status !== 201) {
        // Try to show the backend error message if available
        const errorData = await response.json().catch(() => ({}));
        let backendMsg = errorData.message || response.message || null;
        if (!backendMsg) {
          backendMsg = `API returned error status (${response.status}). Full response: ${JSON.stringify(errorData)}`;
        }
        setError(backendMsg);
        throw new Error(backendMsg);
      }

      // Handle response
      const result = await response.json();

      let eventWebsiteData;
      if (result.data && result.data.data) {
        eventWebsiteData = result.data.data;
      } else if (result.data && result.data._id) {
        eventWebsiteData = result.data;
      } else {
        eventWebsiteData = result.data;
      }

      setEventWebsite(eventWebsiteData);
      setLoading(false);

      // Dispatch layout update event to notify other components
      const layoutUpdateEvent = new CustomEvent("layoutUpdated", {
        detail: {
          eventWebsiteId: eventWebsiteData._id,
          modules: processedModules,
        },
      });
      window.dispatchEvent(layoutUpdateEvent);

      // Only show success message if not in silent mode
      if (!silent) {
        if (isUpdate) {
          props.setMessage({
            content: "Event website updated successfully! Image data has been saved.",
            type: 1,
            icon: "success",
          });
        } else {
          props.setMessage({
            content: "Event website created successfully! Image data has been saved.",
            type: 1,
            icon: "success",
          });
        }
      }
    } catch (err) {
      console.error("[LayoutContents] API call failed:", err);

      if (
        !isUpdate &&
        err.response &&
        err.response.data &&
        err.response.data.message === "EventWebsite already exists for this event. Please update instead." &&
        err.response.data.data &&
        err.response.data.data._id
      ) {
        console.log("[LayoutContents] Retrying as update with existing ID:", err.response.data.data._id);
        setEventWebsite(err.response.data.data);

        // Retry as update (PUT) using the existing ID
        try {
          const retryResponse = await fetch(`${import.meta.env.VITE_API}event-website/${err.response.data.data._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + GetAccessToken(),
            },
            body: JSON.stringify(payload),
          });

          const retryResult = await retryResponse.json();

          if (retryResponse.ok) {
            console.log("[LayoutContents] Retry update successful");
            setEventWebsite(retryResult.data);
            setLoading(false);

            // Dispatch layout update event to notify other components
            const layoutUpdateEvent = new CustomEvent("layoutUpdated", {
              detail: {
                eventWebsiteId: retryResult.data._id,
                modules: processedModules,
              },
            });
            window.dispatchEvent(layoutUpdateEvent);

            // Only show success message if not in silent mode
            if (!silent) {
              setMessage({
                content: "event website updated successfully",
                type: 0,
                icon: "success",
              });
            }
          } else {
            throw new Error(retryResult.message || "Retry update failed");
          }
        } catch (updateErr) {
          console.error("[LayoutContents] Retry update failed:", updateErr);
          setError(updateErr.message || "Failed to update event website data");
          setLoading(false);
        }
        return;
      }

      setLoading(false);

      // Extract meaningful error message
      let errorMessage = "Failed to save";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Show detailed error to user
      if (err.response?.data?.errors) {
        const errorDetails = err.response.data.errors.map((e) => `${e.field}: ${e.message}`).join("\n");
        alert(`Save failed:\n${errorDetails}`);
      } else {
        alert(`Save failed: ${errorMessage}`);
      }
    }
  };
  const handleDragStart = (id) => {
    // Prevent dragging the Event Banner (type: 'banner')
    const module = modules.find((m) => m.id === id);
    if (module && module.type === "banner") {
      return;
    }
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDragOver = async (e, overId) => {
    e.preventDefault();
    if (draggedId === null || draggedId === overId) return;
    // Prevent dropping before or on the Event Banner
    const overModule = modules.find((m) => m.id === overId);
    if (overModule && overModule.type === "banner") {
      return;
    }
    const draggedIdx = modules.findIndex((m) => m.id === draggedId);
    const overIdx = modules.findIndex((m) => m.id === overId);
    if (draggedIdx === -1 || overIdx === -1) return;
    // Prevent moving Event Banner
    if (modules[draggedIdx].type === "banner") {
      return;
    }
    // Remove dragged module
    const newModules = [...modules];
    const [removed] = newModules.splice(draggedIdx, 1);
    // Insert after Event Banner if dropping at index 0
    let insertIdx = overIdx;
    if (insertIdx === 0) insertIdx = 1;
    newModules.splice(insertIdx, 0, removed);
    // Ensure Event Banner is always first
    const bannerModule = newModules.find((m) => m.type === "banner");
    const filteredModules = newModules.filter((m) => m.type !== "banner");
    const reorderedModules = [bannerModule, ...filteredModules].map((module, index) => ({
      ...module,
      order: index,
    }));

    setModules(reorderedModules);

    // Auto-save the changes silently (no success message during drag)
    await handleSave(reorderedModules, true);
  };

  // Add module with auto-save
  const handleAddModule = async (type, name) => {
    // Get the highest order number and add 1
    const maxOrder = modules.length > 0 ? Math.max(...modules.map((m) => m.order || 0)) : -1;
    const newOrder = maxOrder + 1;

    // Auto-increment names for HTML modules
    let finalName = name;
    if (type === "html") {
      const existingHtmlModules = modules.filter((m) => m.type === "html");
      const htmlCount = existingHtmlModules.length;
      finalName = `HTML${htmlCount + 1}`;
    }

    // Initialize default settings for specific module types
    let defaultSettings = {};
    if (type === "html") {
      defaultSettings = {
        title: finalName, // Use block name as default title
        htmlContent: "",
      };
    }

    const newModule = {
      type,
      name: finalName,
      isCustom: true,
      id: `module-custom-${type}-${Date.now()}-${Math.random()}`,
      enabled: true,
      settings: defaultSettings,
      order: newOrder,
    };

    const updatedModules = [...modules, newModule];
    setModules(updatedModules);

    setShowAddModule(false);

    // Set the newly added module as active for settings
    setTimeout(() => {
      setActiveModuleId(newModule.id);
      // Initialize settings form for HTML modules
      if (type === "html") {
        setSettingsForm({
          title: finalName, // Use the same name as block name
          htmlContent: "",
        });
      }
    }, 100);

    // Auto-save the changes
    await handleSave(updatedModules);
  };

  // Remove module with auto-save
  const handleRemoveModule = async (id) => {
    try {
      console.log("Removing module with id:", id);
      const moduleToRemove = modules.find((m) => m.id === id);

      if (!moduleToRemove) {
        console.error("Module not found:", id);
        return;
      }

      const updatedModules = modules.filter((m) => m.id !== id);
      const reorderedModules = updatedModules.map((module, index) => ({ ...module, order: index }));

      console.log("Updated modules:", reorderedModules);
      setModules(reorderedModules);

      // If the removed module was active in settings, close the settings panel
      if (activeModuleId === id) {
        setActiveModuleId(null);
        setSettingsForm({});
      }

      // Auto-save the changes
      await handleSave(reorderedModules);

      // Show success message
      if (props.setMessage) {
        props.setMessage({
          content: `${moduleToRemove?.name || "Module"} removed successfully`,
          type: 1,
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error in handleRemoveModule:", error);
      if (props.setMessage) {
        props.setMessage({
          content: `Failed to remove module: ${error.message}`,
          type: 2,
          icon: "error",
        });
      }
      throw error;
    }
  };

  // Show settings
  const handleShowSettings = (id) => {
    setActiveModuleId(id);
    const module = modules.find((m) => m.id === id);

    // If banner, and no images, but eventWebsite or event data has a banner image, set it
    if (module?.type === "banner" && (!module.settings.bannerImages || module.settings.bannerImages.length === 0)) {
      const rawBanner = eventWebsite?.bannerImage || (props.openData?.data?.banner ? props.openData.data.banner : null);
      let defaultBanner = "/noimage.jpg";
      if (rawBanner) {
        defaultBanner = getCDNUrl(rawBanner);
      } else {
        defaultBanner = noimage;
      }
      setSettingsForm({
        ...module.settings,
        bannerImages: [{ id: 1, url: defaultBanner }],
      });
    } else {
      // Initialize with default values for HTML modules if settings are empty
      if (module?.type === "html" && (!module.settings || Object.keys(module.settings).length === 0)) {
        setSettingsForm({
          title: "",
          htmlContent: "",
        });
      } else {
        setSettingsForm(module?.settings || {});
      }
    }
  };

  // Hide settings
  const handleHideSettings = () => {
    setActiveModuleId(null);
    setSettingsForm({});
  };

  // Apply settings handler with auto-save
  const handleApplySettings = async () => {
    if (!activeModuleId) return;

    console.log("[LayoutContents] handleApplySettings called:", {
      activeModuleId,
      currentSettingsForm: settingsForm,
      iconRows: settingsForm.iconRows,
    });

    // Special handling for icon-row modules to ensure iconRows data is preserved
    const updatedModules = modules.map((m) => {
      if (m.id === activeModuleId) {
        if (m.type === "icon-row") {
          console.log("[LayoutContents] Applying settings for icon-row module:", {
            originalSettings: m.settings,
            newSettings: settingsForm,
            iconRows: settingsForm.iconRows,
          });

          // Ensure iconRows is properly preserved
          const updatedSettings = {
            ...settingsForm,
            iconRows: settingsForm.iconRows || [],
          };

          console.log("[LayoutContents] Final updated settings for icon-row:", updatedSettings);
          return { ...m, settings: updatedSettings };
        } else {
          return { ...m, settings: { ...settingsForm } };
        }
      }
      return m;
    });

    console.log("[LayoutContents] Updated modules before save:", updatedModules);
    setModules(updatedModules);

    // Auto-save the changes
    console.log("[LayoutContents] Calling handleSave with updated modules");
    await handleSave(updatedModules);

    // Show success message
    if (props.setMessage) {
      props.setMessage({
        content: "Settings applied and saved successfully!",
        type: 1,
        icon: "success",
      });
    }
  };

  // Add handler for toggling module enabled state with auto-save
  const handleToggleModule = async (id) => {
    const target = modules.find((m) => m.id === id);
    if (target?.type === "tickets" && isGroupCheckout) {
      // Prevent enabling tickets in group checkout mode
      const forced = modules.map((m) => (m.id === id ? { ...m, enabled: false } : m));
      setModules(forced);
      // Optional user feedback if available
      if (props.setMessage) {
        props.setMessage({
          content: "Tickets section is disabled for Multiple registration type.",
          type: 1,
          icon: "warning",
        });
      }
      await handleSave(forced);
      return;
    }
    const updatedModules = modules.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    setModules(updatedModules);

    // Auto-save the changes
    await handleSave(updatedModules);
  };

  // Render settings panel
  const renderSettingsPanel = () => {
    return (
      <div id="settings-panel" className="h-full">
        {/* Settings Panel Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">{isFullScreen ? "Settings Panel" : "Settings"}</h3>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-weak hover:bg-bg-soft text-text-main transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
            title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            <div className={`transition-all duration-300 ease-in-out transform ${isFullScreen ? "rotate-180" : "rotate-0"}`}>{isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</div>
          </button>
        </div>
        {!activeModuleId ? (
          <div id="default-state" className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Ready to configure?</h4>
            <p className="text-sm text-gray-600 mt-1">Select any block from the left to manage its settings.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mt-4">
              <h3 id="settings-title" className="font-semibold text-gray-900 text-lg">
                {modules.find((m) => m.id === activeModuleId)?.name} Settings
              </h3>
              <button id="close-settings" className="text-gray-400 hover:text-gray-600 transition-colors" onClick={handleHideSettings}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div id="settings-content" className="mt-4 flex-1 overflow-y-auto pr-2">
              {(() => {
                const module = modules.find((m) => m.id === activeModuleId);
                if (!module) return null;
                const templateFn = SETTINGS_TEMPLATES[module.type] || (() => <p>No settings available.</p>);

                // Pass additional parameters for templates
                const templateParams = {
                  settingsForm,
                  setSettingsForm,
                  onApply: handleApplySettings,
                  eventData: props.openData?.data || {},
                  eventId: eventId,
                };

                // Add additional parameters for specific module types
                if (module.type === "icon-row" || module.type === "html") {
                  templateParams.handleSave = handleSave;
                  templateParams.modules = modules;
                  templateParams.activeModuleId = activeModuleId;
                  templateParams.setModules = setModules;
                }

                return templateFn.call(SETTINGS_TEMPLATES, templateParams);
              })()}
            </div>
          </>
        )}
        {/* Manual Save Button - Optional since auto-save is now enabled */}
        {/* <div className="pb-4 border-b border-gray-200">
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3" onClick={() => handleSave()} disabled={loading} style={{ display: "block" }}>
            {loading ? "Saving..." : "Manual Save (Auto-save enabled)"}
          </button>
        </div> */}
      </div>
    );
  };

  // Render module list
  const renderModuleList = () => {
    const bannerModule = modules.find((m) => m.type === "banner");
    const otherModules = modules.filter((m) => m.type !== "banner");
    const sortedOtherModules = [...otherModules].sort((a, b) => {
      if (a.enabled === b.enabled) {
        return (a.order || 0) - (b.order || 0);
      }
      return a.enabled ? -1 : 1;
    });

    // Combine for rendering
    const sortedModules = bannerModule ? [bannerModule, ...sortedOtherModules] : sortedOtherModules;

    return (
      <div id="sortable-modules" className="space-y-3">
        {sortedModules.map((m, idx) => (
          <div
            key={m.id}
            className={`moduleItem group w-full border rounded-xl transition-all duration-200 ${
              draggedId === m.id ? "dragging shadow-2xl transform rotate-2 scale-105 border-blue-300 bg-blue-50" : ""
            } ${activeModuleId === m.id ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-lg" : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"} ${
              !m.enabled ? "opacity-50 grayscale" : ""
            }`}
            data-module-type={m.type}
            id={m.id}
            draggable={m.type !== "banner"}
            onDragStart={() => handleDragStart(m.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, m.id)}
          >
            <div className="p-4 sm:p-6">
              <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                {/* Left Section - Module Info */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Drag Handle */}
                  <div className={`flex-shrink-0 mt-1 sm:mt-0 ${m.type !== "banner" ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed"}`}>
                    <LucideIcons.ArrowDownUp size={18} className={`transition-colors duration-200 ${m.type !== "banner" ? "text-text-sub hover:text-text-main" : "text-text-disabled"}`} />
                  </div>

                  {/* Module Icon */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                      m.isCustom ? "bg-primary-light text-primary-base border-primary-light" : "bg-bg-soft text-text-sub border-stroke-soft"
                    }`}
                  >
                    {m.type === "html" ? (
                      <Code size={20} className="sm:w-6 sm:h-6" />
                    ) : m.type === "banner" ? (
                      <ImageIcon size={20} className="sm:w-6 sm:h-6" />
                    ) : (
                      <FileText size={20} className="sm:w-6 sm:h-6" />
                    )}
                  </div>

                  {/* Module Info */}
                  <div className="flex flex-col flex-1 min-w-0 gap-2">
                    {/* Title */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-text-main truncate">{m.name || getModuleDisplayName(m.type)}</h3>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${m.isCustom ? "bg-primary-light text-primary-base" : "bg-bg-soft text-text-sub"}`}>
                          {m.isCustom ? "Custom" : "Default"}
                        </span>

                        {m.type === "banner" && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-state-warning text-white">Fixed</span>}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.type === "html" && m.settings?.title && <span className="text-sm text-text-sub bg-bg-weak px-3 py-1.5 rounded-lg border border-stroke-soft">Section: {m.settings.title}</span>}
                      {m.type === "html" && !m.settings?.title && <span className="text-sm text-text-disabled italic">No section title set</span>}
                      {m.type !== "html" && <span className="text-sm text-text-sub capitalize">{m.type.replace("-", " ")} module</span>}
                    </div>
                  </div>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-auto justify-end md:justify-start flex-nowrap">
                  {/* Settings Button - Hide for overview and tickets */}
                  {m.type !== "overview" && m.type !== "tickets" && (
                    <button
                      className="group relative p-2.5 text-text-sub hover:text-primary-base hover:bg-primary-light rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-base focus:ring-offset-2"
                      aria-label="Configure section"
                      title="Configure settings"
                      onClick={() => handleShowSettings(m.id)}
                    >
                      <Settings className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                    </button>
                  )}

                  {/* Toggle Switch for Enable/Disable */}
                  <button
                    onClick={() => handleToggleModule(m.id)}
                    className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-base focus:ring-offset-2 ${
                      m.enabled ? "bg-primary-base shadow-lg shadow-primary-base/30" : "bg-bg-soft border border-stroke-soft"
                    }`}
                    aria-label={m.enabled ? "Disable section" : "Enable section"}
                    title={m.enabled ? "Click to disable" : "Click to enable"}
                  >
                    <span
                      className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                        m.enabled ? "translate-x-6 sm:translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>

                  {/* Delete Button - Using application's standard prompt dialog */}
                  {m.isCustom && (
                    <button
                      className="group relative p-2.5 text-text-sub hover:text-state-error hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-state-error focus:ring-offset-2"
                      aria-label="Delete section"
                      title="Delete section"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Use application's standard confirmation dialog
                        if (props.setMessage) {
                          props.setMessage({
                            type: 2,
                            content: `Are you sure you want to delete "${m.name}" section?`,
                            proceed: "Delete",
                            okay: "Cancel",
                            icon: "question",
                            onProceed: async () => {
                              try {
                                await handleRemoveModule(m.id);
                              } catch (error) {
                                console.error("Error removing module:", error);
                                props.setMessage({
                                  content: `Failed to delete section: ${error.message}`,
                                  type: 1,
                                  icon: "error",
                                });
                              }
                            },
                          });
                        }
                      }}
                    >
                      <Trash2 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render add module popup
  const renderAddModulePopup = () => (
    <div id="add-module-popup" className={`absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-10${showAddModule ? "" : " hidden"}`} ref={addModulePopupRef}>
      <div className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4 text-center">Choose a Content Block</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <button
            className="moduleOption"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddModule("image", "Image");
            }}
          >
            <svg className="w-6 h-6 mx-auto text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            Image
          </button>
          <button
            className="moduleOption"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddModule("video", "Video");
            }}
          >
            <svg className="w-6 h-6 mx-auto text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              ></path>
            </svg>
            Video
          </button>
          <button
            className="moduleOption"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddModule("text-media", "Text + Media");
            }}
          >
            <svg className="w-6 h-6 mx-auto text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"></path>
            </svg>
            Text + Media
          </button>
          <button
            className="moduleOption"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddModule("icon-row", "Icon Boxes");
            }}
          >
            <svg className="w-6 h-6 mx-auto text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.472-2.472a3.375 3.375 0 00-4.773-4.773L6.75 11.42m5.877 5.877l-5.877-5.877m0 0a3.375 3.375 0 014.773-4.773l2.472 2.472"
              ></path>
            </svg>
            Icon Boxes
          </button>
          <button
            className="moduleOption"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddModule("html", "Custom HTML");
            }}
          >
            <svg className="w-6 h-6 mx-auto text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
            Custom HTML
          </button>
        </div>
      </div>
    </div>
  );

  // Hide popup on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (addModuleBtnRef.current && !addModuleBtnRef.current.contains(e.target) && addModulePopupRef.current && !addModulePopupRef.current.contains(e.target)) {
        setShowAddModule(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <style>{style}</style>

      {error && <div className="text-red-500 p-4 bg-red-50 border border-red-200">{error}</div>}

      <div className={`flex transition-all duration-500 ease-in-out ${isFullScreen ? "fixed inset-0 z-50 bg-white backdrop-blur-sm" : "h-screen"}`}>
        {/* Left Side - Website Layout & Content */}
        <main className="overflow-y-auto transition-all duration-500 ease-in-out" style={isFullScreen ? { flexBasis: "30%", maxWidth: "30%" } : { flexBasis: "40%", maxWidth: "40%" }}>
          <div className="p-4 transition-all duration-500 ease-in-out">
            <div className="max-w-3xl mx-auto">
              <div>
                <header className="flex items-start justify-between mb-6">
                  <div>
                    <SubPageHeader title="Website Layout & Content" line={false} description="Build your event page by adding and arranging content blocks below." />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        id="add-module-btn"
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#375DFB] rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
                        ref={addModuleBtnRef}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddModule(!showAddModule);
                        }}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Block
                      </button>
                      {renderAddModulePopup()}
                    </div>
                  </div>
                </header>
                <div className="w-full">
                  {/* Module List */}
                  {renderModuleList()}
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* Right Side - Settings Panel */}
        <aside
          className="bg-white border-l border-gray-200 h-screen sticky top-0 transition-all duration-500 ease-in-out"
          style={isFullScreen ? { flexBasis: "70%", minWidth: "500px", maxWidth: "70%" } : { flexBasis: "60%", minWidth: "500px", maxWidth: "700px" }}
        >
          <div className="p-6 h-full overflow-y-auto transition-all duration-500 ease-in-out">{renderSettingsPanel()}</div>
        </aside>
      </div>
    </>
  );
};

export default DisplayModule;
