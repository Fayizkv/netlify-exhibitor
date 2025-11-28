import React, { useState, useEffect } from "react";

const ParticipantType = () => {
  const [participantsData, setParticipantsData] = useState([
    { id: 1, name: "Media", slug: "media", isDefault: true, regCount: 0, status: true, formCollection: true, limit: null, liveUntil: null },
    { id: 2, name: "Volunteer", slug: "volunteer", isDefault: true, regCount: 28, status: true, formCollection: true, limit: 30, liveUntil: null },
    { id: 3, name: "Official", slug: "official", isDefault: true, regCount: 0, status: false, formCollection: true, limit: null, liveUntil: null },
    { id: 4, name: "Early Bird Attendee", slug: "early-bird-attendee", isDefault: false, regCount: 150, status: true, formCollection: true, limit: 150, liveUntil: "2024-10-15T23:59" },
    { id: 5, name: "VIP Guest", slug: "vip-guest", isDefault: false, regCount: 10, status: true, formCollection: false, limit: null, liveUntil: null },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    formCollection: false,
    limit: "",
    liveUntil: "",
  });
  const [showFormOptions, setShowFormOptions] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState({});

  const BASE_URL = "https://example.com/participant/";

  // Styles
  const styles = {
    body: {
      fontFamily: "Inter, sans-serif",
      backgroundColor: "#FFFFFF",
    },
    tableHeader: {
      color: "#475467",
      fontSize: "12px",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    primaryButton: {
      backgroundColor: "#4F46E5",
      color: "white",
      fontWeight: 500,
      borderRadius: "0.375rem",
      padding: "0.5rem 1rem",
      transition: "background-color 0.2s",
      border: "none",
      cursor: "pointer",
    },
    secondaryButton: {
      backgroundColor: "white",
      color: "#344054",
      fontWeight: 500,
      borderRadius: "0.375rem",
      border: "1px solid #D0D5DD",
      padding: "0.25rem 0.75rem",
      fontSize: "0.875rem",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      transition: "background-color 0.2s",
      cursor: "pointer",
    },
    tag: {
      display: "inline-flex",
      alignItems: "center",
      padding: "0.25rem 0.75rem",
      borderRadius: "9999px",
      fontSize: "0.875rem",
      fontWeight: 500,
      whiteSpace: "nowrap",
    },
    tagBlue: {
      backgroundColor: "#EFF4FF",
      color: "#3B82F6",
    },
    tagGreen: {
      backgroundColor: "#ECFDF5",
      color: "#10B981",
    },
    formInput: {
      display: "block",
      width: "100%",
      border: "1px solid #D1D5DB",
      borderRadius: "0.375rem",
      padding: "0.5rem 0.75rem",
      fontSize: "1rem",
      transition: "border-color 0.2s, box-shadow 0.2s",
    },
    modalContainer: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "flex-end",
      opacity: isModalOpen ? 1 : 0,
      pointerEvents: isModalOpen ? "auto" : "none",
      transition: "opacity 0.3s ease-in-out",
      zIndex: 50,
    },
    modalPanel: {
      backgroundColor: "white",
      width: "100%",
      maxWidth: "28rem",
      height: "100%",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transform: isModalOpen ? "translateX(0)" : "translateX(100%)",
      transition: "transform 0.3s ease-in-out",
    },
    dropdown: {
      position: "relative",
      display: "inline-block",
    },
    dropdownContent: {
      display: "none",
      position: "absolute",
      right: 0,
      backgroundColor: "white",
      minWidth: "220px",
      borderRadius: "0.5rem",
      border: "1px solid #F2F4F7",
      boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)",
      zIndex: 50,
    },
    tooltip: {
      position: "relative",
      display: "inline-flex",
    },
    tooltipText: {
      visibility: "hidden",
      width: "80px",
      backgroundColor: "#1F2937",
      color: "#fff",
      textAlign: "center",
      borderRadius: "6px",
      padding: "5px 0",
      position: "absolute",
      zIndex: 1,
      bottom: "125%",
      left: "50%",
      marginLeft: "-40px",
      opacity: 0,
      transition: "opacity 0.3s",
    },
    urlRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: "nowrap",
      marginTop: "4px",
      height: "20px",
    },
    urlText: {
      fontSize: "0.75rem",
      color: "#6B7280",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    urlActions: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      flexShrink: 0,
    },
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const updateUrlPreview = () => {
    const slug = formData.slug;
    if (slug) {
      return `${BASE_URL}${slug}`;
    }
    return "";
  };

  const handleStatusToggle = (id) => {
    console.log("Status toggle clicked for participant ID:", id);
    setParticipantsData((prev) => prev.map((p) => (p.id === id ? { ...p, status: !p.status } : p)));
  };

  const handleFormCollectionToggle = (id, action) => {
    console.log("Form collection toggle clicked for participant ID:", id, "Action:", action);
    setParticipantsData((prev) => prev.map((p) => (p.id === id ? { ...p, formCollection: action === "enable" } : p)));
  };

  const handleEdit = (participant) => {
    console.log("Edit participant:", participant);
    setEditingParticipant(participant);
    setFormData({
      name: participant.name,
      slug: participant.slug,
      formCollection: participant.formCollection,
      limit: participant.limit || "",
      liveUntil: participant.liveUntil || "",
    });
    setShowFormOptions(participant.formCollection);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    console.log("Delete participant ID:", id);
    if (window.confirm("Are you sure you want to delete this participant type?")) {
      setParticipantsData((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCopyUrl = (url) => {
    console.log("Copying URL:", url);
    navigator.clipboard.writeText(url).then(() => {
      setCopyTooltip((prev) => ({ ...prev, [url]: true }));
      setTimeout(() => {
        setCopyTooltip((prev) => ({ ...prev, [url]: false }));
      }, 2000);
    });
  };

  const openModal = () => {
    setEditingParticipant(null);
    setFormData({
      name: "",
      slug: "",
      formCollection: false,
      limit: "",
      liveUntil: "",
    });
    setShowFormOptions(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingParticipant(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);

    const submitData = {
      ...formData,
      limit: formData.limit ? parseInt(formData.limit) : null,
      liveUntil: formData.liveUntil || null,
    };

    if (editingParticipant) {
      setParticipantsData((prev) => prev.map((p) => (p.id === editingParticipant.id ? { ...p, ...submitData } : p)));
    } else {
      const newId = participantsData.length > 0 ? Math.max(...participantsData.map((p) => p.id)) + 1 : 1;
      setParticipantsData((prev) => [
        ...prev,
        {
          id: newId,
          ...submitData,
          isDefault: false,
          regCount: 0,
          status: true,
        },
      ]);
    }
    closeModal();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "name") {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const sortedData = [...participantsData].sort((a, b) => b.isDefault - a.isDefault);

  return (
    <div style={styles.body} className="overflow-x-hidden max-w-6xl bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Participant Type</h1>
            <p className="text-gray-600 mt-1">Create and manage different participant types.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button style={styles.secondaryButton} className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10m-7 8h4" />
              </svg>
              Filter
            </button>
            <button style={styles.secondaryButton} className="p-2">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
              </svg>
            </button>
            <button style={styles.secondaryButton} className="p-2">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button onClick={openModal} style={styles.primaryButton} className="ml-2 flex items-center">
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Participant Type
            </button>
          </div>
        </header>

        {/* Participant Types Table for Desktop */}
        <div className="rounded-lg shadow-sm overflow-hidden w-full">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-left" style={styles.tableHeader}>
                  Participant Name
                </th>
                <th scope="col" className="px-6 py-3 text-left" style={styles.tableHeader}>
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left" style={styles.tableHeader}>
                  Registrations
                </th>
                <th scope="col" className="px-6 py-3 text-right" style={styles.tableHeader}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
              {sortedData.map((participant) => {
                const hasFormAccess = (participant.formCollection || participant.isDefault) && participant.status;
                const fullUrl = `${BASE_URL}${participant.slug}`;
                let regInfo = hasFormAccess ? `${participant.regCount}` : "---";
                if (hasFormAccess && participant.limit) {
                  regInfo += ` / ${participant.limit}`;
                }

                return (
                  <tr key={participant.id} className="bg-white">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{participant.name}</div>
                        {hasFormAccess && (
                          <div style={styles.urlRow}>
                            <span style={styles.urlText}>{fullUrl}</span>
                            <div style={styles.urlActions}>
                              <div style={styles.tooltip}>
                                <button onClick={() => handleCopyUrl(fullUrl)} className="copy-btn text-gray-400 hover:text-indigo-600">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                                <span
                                  style={{
                                    ...styles.tooltipText,
                                    visibility: copyTooltip[fullUrl] ? "visible" : "hidden",
                                    opacity: copyTooltip[fullUrl] ? 1 : 0,
                                  }}
                                >
                                  {copyTooltip[fullUrl] ? "Copied!" : "Copy"}
                                </span>
                              </div>
                              <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span style={{ ...styles.tag, ...(participant.isDefault ? styles.tagBlue : styles.tagGreen) }}>{participant.isDefault ? "Default" : "User-created"}</span>
                    </td>
                    <td className="px-6 py-4 align-top">{regInfo}</td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex justify-end items-center gap-2">
                        {participant.status && (participant.formCollection || participant.isDefault) && (
                          <>
                            <button className="border border-gray-300 rounded px-3 py-1 flex items-center gap-1 text-gray-700 hover:bg-gray-100">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Form Builder
                            </button>
                            <button className="border border-gray-300 rounded px-3 py-1 flex items-center gap-1 text-gray-700 hover:bg-gray-100">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                              </svg>
                              View Response
                            </button>
                          </>
                        )}
                        <button className="p-2 rounded hover:bg-gray-100">
                          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                        <label className="relative inline-flex items-center cursor-pointer ml-2">
                          <input type="checkbox" checked={participant.status} onChange={() => handleStatusToggle(participant.id)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-checked:bg-indigo-600 rounded-full peer transition-colors duration-200"></div>
                          <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                        </label>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      Add/Edit Participant Modal
      {isModalOpen && (
        <div style={styles.modalContainer} onClick={closeModal}>
          <div style={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
              <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{editingParticipant ? "Edit Participant Type" : "Add Participant Type"}</h2>
                <button type="button" onClick={closeModal} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-grow">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="participant-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Participant Name
                    </label>
                    <input
                      type="text"
                      id="participant-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      style={styles.formInput}
                      placeholder="e.g., Early Bird Attendee"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="participant-slug" className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      id="participant-slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      style={styles.formInput}
                      placeholder="e.g., early-bird-attendee"
                      required
                    />
                    {formData.slug && (
                      <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-md break-all">
                        Your participant type will be available at: <span className="text-gray-800 font-medium">{updateUrlPreview()}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Enable Form Collection</h3>
                        <p className="text-sm text-gray-500">Allow public registration for this type.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.formCollection}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, formCollection: e.target.checked }));
                            setShowFormOptions(e.target.checked);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-checked:bg-indigo-600 rounded-full peer transition-colors duration-200"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                      </label>
                    </div>
                  </div>

                  {showFormOptions && (
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="registration-limit" className="block text-sm font-medium text-gray-700 mb-1">
                          Limit Total Registrations
                        </label>
                        <input
                          type="number"
                          id="registration-limit"
                          value={formData.limit}
                          onChange={(e) => handleInputChange("limit", e.target.value)}
                          style={styles.formInput}
                          placeholder="No limit"
                        />
                      </div>
                      <div>
                        <label htmlFor="live-until" className="block text-sm font-medium text-gray-700 mb-1">
                          Live Until
                        </label>
                        <input type="datetime-local" id="live-until" value={formData.liveUntil} onChange={(e) => handleInputChange("liveUntil", e.target.value)} style={styles.formInput} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end p-4 border-t bg-gray-50">
                <button type="button" onClick={closeModal} style={styles.secondaryButton} className="mr-2">
                  Cancel
                </button>
                <button type="submit" style={styles.primaryButton}>
                  {editingParticipant ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantType;
