import React, { useState, useEffect } from "react";
import { getData, postData, putData, deleteData } from "../../../../backend/api";
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Mail,
  UserPlus,
  Calendar,
  Tag,
  Webhook,
  Clock,
  ChevronDown,
  X,
  LayoutTemplate,
  Copy,
  Eye,
  FileText,
  MessageSquare,
  Bell,
  Star,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import CustomSelect from "../../../../components/core/select";

const adminAutomationTab = (props) => {
  const [activeTab, setActiveTab] = useState("automations"); // automations, templates
  const [automations, setAutomations] = useState([]);
  const [enabledAutomations, setEnabledAutomations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [franchiseId, setFranchiseId] = useState(null);

  useEffect(() => {
    console.log(props, "props from automation tab");
    setEventId(props.openData.data._id);
    setFranchiseId(props.openData.data.franchise._id);
  }, [props]);

  // Fetch automations and templates when eventId changes
  useEffect(() => {
    if (eventId && franchiseId) {
      fetchAutomations();
      fetchTemplates();
    }
  }, [eventId, franchiseId]);

  const fetchAutomations = async () => {
    try {
      setAutomationLoading(true);
      // Fetch all automations for this event/franchise
      const automationsResponse = await getData({ event: eventId, franchise: franchiseId, enabled: true }, "automation-collection");
      // Fetch enabled automations for this event
      const enabledResponse = await getData({ event: eventId }, "enabled-automations");

      if (automationsResponse.status === 200 && automationsResponse.data.success) {
        setAutomations(automationsResponse.data.response || []);
      } else {
        console.error("Failed to fetch automations:", automationsResponse.data?.message);
      }

      if (enabledResponse.status === 200 && enabledResponse.data.success) {
        setEnabledAutomations(enabledResponse.data.response || []);
      } else {
        console.error("Failed to fetch enabled automations:", enabledResponse.data?.message);
      }
    } catch (error) {
      console.error("Error fetching automations:", error);
    } finally {
      setAutomationLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplateLoading(true);
      const response = await getData({ event: eventId, franchise: franchiseId }, "template-collection");
      if (response.status === 200 && response.data.success) {
        setTemplates(response.data.response || []);
      } else {
        console.error("Failed to fetch templates:", response.data?.message);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setTemplateLoading(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [templateSearch, setTemplateSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    triggerType: "",
    actions: [{ actionType: "send_email", template: "" }],
    enabled: true,
  });

  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    type: "email",
    category: "registration",
    subject: "",
    content: "",
    variables: [],
  });

  const triggers = [
    { value: "new_registration", label: "New Registration", icon: UserPlus },
    { value: "session_starts", label: "Session Starts", icon: Calendar },
    { value: "session_ends", label: "Session Ends", icon: Clock },
    { value: "form_submitted", label: "Form Submitted", icon: Settings },
    { value: "payment_completed", label: "Payment Completed", icon: Settings },
  ];

  const actions = [
    { value: "send_email", label: "Send Email", icon: Mail },
    { value: "send_notification", label: "Send Notification", icon: Bell },
  ];

  const templateTypes = [
    { value: "email", label: "Email", icon: Mail },
    { value: "notification", label: "Notification", icon: Bell },
    { value: "sms", label: "SMS", icon: MessageSquare },
  ];

  const templateCategories = [
    { value: "registration", label: "Registration" },
    { value: "sessions", label: "Sessions" },
    { value: "feedback", label: "Feedback" },
    { value: "reminders", label: "Reminders" },
    { value: "marketing", label: "Marketing" },
  ];

  // Template management functions
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateFormData({
      name: "",
      type: "email",
      category: "registration",
      subject: "",
      content: "",
      variables: [],
    });
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      subject: template.subject,
      content: template.content,
      variables: template.variables || [],
    });
    setShowTemplateModal(true);
  };

  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
    setShowTemplatePreview(true);
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const duplicateData = {
        name: `${template.name} (Copy)`,
        type: template.type,
        category: template.category,
        subject: template.subject,
        content: template.content,
        variables: template.variables || [],
        isDefault: false,
        event: eventId,
        franchise: franchiseId,
        usageCount: 0,
      };

      const response = await postData(duplicateData, "template-collection");
      if (response.status === 200 && response.data.success) {
        setTemplates((prev) => [...prev, response.data.data]);
      } else {
        console.error("Failed to duplicate template:", response.data?.message);
      }
    } catch (error) {
      console.error("Error duplicating template:", error);
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      const response = await deleteData({ id }, "template-collection");
      if (response.status === 200 && response.data.success) {
        setTemplates((prev) => prev.filter((template) => template._id !== id));
      } else {
        console.error("Failed to delete template:", response.data?.message);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);

      // Extract variables from content
      const variableRegex = /\{\{([^}]+)\}\}/g;
      const matches = [...templateFormData.content.matchAll(variableRegex)];
      const extractedVariables = [...new Set(matches.map((match) => match[1]))];

      const templateData = {
        name: templateFormData.name,
        type: templateFormData.type,
        category: templateFormData.category,
        subject: templateFormData.subject,
        content: templateFormData.content,
        variables: extractedVariables,
        event: eventId,
        franchise: franchiseId,
        isDefault: false,
        usageCount: 0,
      };

      let response;
      if (editingTemplate) {
        response = await putData({ ...templateData, id: editingTemplate._id }, "template-collection");
        if (response.data.success) {
          setTemplates((prev) => prev.map((template) => (template._id === editingTemplate._id ? { ...template, ...templateData, _id: template._id } : template)));
        }
      } else {
        response = await postData(templateData, "template-collection");
        if (response.data.success) {
          setTemplates((prev) => [...prev, response.data.data]);
        }
      }

      if (response.data.success) {
        setShowTemplateModal(false);
      } else {
        console.error("Failed to save template:", response.data?.message);
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesFilter = templateFilter === "all" || template.category === templateFilter;
    const matchesSearch = template.name.toLowerCase().includes(templateSearch.toLowerCase()) || template.content.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateAutomation = () => {
    setEditingAutomation(null);
    setFormData({
      name: "",
      triggerType: "",
      actions: [{ actionType: "send_email", template: "" }],
      enabled: true,
    });
    setShowModal(true);
  };

  const handleEditAutomation = (automation) => {
    setEditingAutomation(automation);
    const isEnabled = enabledAutomations.some((ea) => ea.automation === automation._id);

    // Handle both legacy and new format, and ensure actions is always an array
    let actions = [];

    if (automation.actions) {
      // If actions is a string (from JSON.stringify), parse it
      if (typeof automation.actions === "string") {
        try {
          actions = JSON.parse(automation.actions);
        } catch (error) {
          console.error("Error parsing actions:", error);
          actions = [];
        }
      } else if (Array.isArray(automation.actions)) {
        actions = automation.actions;
      }
    }

    // Fallback to legacy format if no actions found
    if (!actions || actions.length === 0) {
      actions = [
        {
          actionType: automation.actionType || "send_email",
          template: automation.template?._id || "",
        },
      ];
    }

    setFormData({
      name: automation.name,
      triggerType: automation.triggerType || "",
      actions: actions,
      enabled: isEnabled,
    });
    setShowModal(true);
  };

  const handleDeleteAutomation = async (id) => {
    try {
      const response = await deleteData({ id }, "automation-collection");
      if (response.status === 200 && response.data.success) {
        setAutomations((prev) => prev.filter((auto) => auto._id !== id));
        setEnabledAutomations((prev) => prev.filter((ea) => ea.automation !== id));
      } else {
        console.error("Failed to delete automation:", response.data?.message);
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
    }
  };

  const handleToggleAutomation = async (id) => {
    try {
      const isCurrentlyEnabled = enabledAutomations.some((ea) => ea.automation === id);

      if (isCurrentlyEnabled) {
        // Find the enabled automation record and delete it
        const enabledAutomation = enabledAutomations.find((ea) => ea.automation === id);
        if (enabledAutomation) {
          const response = await deleteData({ id: enabledAutomation._id }, "enabled-automations");
          if (response.data.success) {
            setEnabledAutomations((prev) => prev.filter((ea) => ea._id !== enabledAutomation._id));
          } else {
            console.error("Failed to disable automation:", response.data?.message);
          }
        }
      } else {
        // Create new enabled automation record
        const enabledAutomationData = {
          event: eventId,
          automation: id,
        };
        const response = await postData(enabledAutomationData, "enabled-automations");
        if (response.data.success) {
          setEnabledAutomations((prev) => [...prev, response.data.data]);
        } else {
          console.error("Failed to enable automation:", response.data?.message);
        }
      }
    } catch (error) {
      console.error("Error toggling automation:", error);
    }
  };

  const handleSaveAutomation = async () => {
    try {
      setLoading(true);

      // Create a new object without the actions array first
      const baseData = {
        name: formData.name,
        triggerType: formData.triggerType,
        status: formData.enabled ? "active" : "paused",
        event: eventId,
        franchise: franchiseId,
      };

      // Add actions as JSON string to avoid FormData serialization issues
      const automationData = {
        ...baseData,
        actions: JSON.stringify(
          formData.actions.map((action) => ({
            actionType: action.actionType,
            template: action.template || null,
          }))
        ),
      };

      let response;
      if (editingAutomation) {
        response = await putData({ ...automationData, id: editingAutomation._id }, "automation-collection");
        if (response.data.success) {
          setAutomations((prev) => prev.map((auto) => (auto._id === editingAutomation._id ? { ...auto, ...automationData, _id: auto._id } : auto)));

          const isCurrentlyEnabled = enabledAutomations.some((ea) => ea.automation === editingAutomation._id);
          if (formData.enabled && !isCurrentlyEnabled) {
            const enabledResponse = await postData(
              {
                event: eventId,
                automation: editingAutomation._id,
              },
              "enabled-automations"
            );
            if (enabledResponse.data.success) {
              setEnabledAutomations((prev) => [...prev, enabledResponse.data.data]);
            }
          } else if (!formData.enabled && isCurrentlyEnabled) {
            const enabledAutomation = enabledAutomations.find((ea) => ea.automation === editingAutomation._id);
            if (enabledAutomation) {
              const disableResponse = await deleteData({ id: enabledAutomation._id }, "enabled-automations");
              if (disableResponse.data.success) {
                setEnabledAutomations((prev) => prev.filter((ea) => ea._id !== enabledAutomation._id));
              }
            }
          }
        }
      } else {
        response = await postData(automationData, "automation-collection");
        if (response.data.success) {
          setAutomations((prev) => [...prev, response.data.data]);

          if (formData.enabled) {
            const enabledAutomationData = {
              event: eventId,
              automation: response.data.data._id,
            };
            const enabledResponse = await postData(enabledAutomationData, "enabled-automations");
            if (enabledResponse.data.success) {
              setEnabledAutomations((prev) => [...prev, enabledResponse.data.data]);
            }
          }
        }
      }

      if (response.data.success) {
        setShowModal(false);
      } else {
        console.error("Failed to save automation:", response.data?.message);
      }
    } catch (error) {
      console.error("Error saving automation:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    const statusClasses = {
      active: "bg-green-100 text-green-800 border border-green-200",
      paused: "bg-gray-100 text-gray-800 border border-gray-200",
    };

    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status === "active" ? "Active" : "Paused"}</span>;
  };

  const TypeBadge = ({ type }) => {
    const icons = {
      email: Mail,
      notification: Bell,
      sms: MessageSquare,
    };
    const Icon = icons[type] || Mail;

    return (
      <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
        <Icon className="w-3 h-3 mr-1" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const Switch = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      type="button"
      className={`relative inline-flex h-5 w-8 items-center rounded-full transition-colors duration-150 ease-in-out ${checked ? "bg-indigo-600" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-150 ease-in-out ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );

  // Functions to handle actions
  const addAction = () => {
    setFormData((prev) => ({
      ...prev,
      actions: [...prev.actions, { actionType: "send_email", template: "" }],
    }));
  };

  const removeAction = (index) => {
    if (formData.actions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        actions: prev.actions.filter((_, i) => i !== index),
      }));
    }
  };

  const updateAction = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.map((action, i) => (i === index ? { ...action, [field]: value } : action)),
    }));
  };

  const [automationSearch, setAutomationSearch] = useState("");
  const [automationTriggerFilter, setAutomationTriggerFilter] = useState("all");

  // Filter automations
  const filteredAutomations = automations.filter((automation) => {
    const matchesTrigger = automationTriggerFilter === "all" || automation.triggerType === automationTriggerFilter;
    const matchesSearch =
      automation.name.toLowerCase().includes(automationSearch.toLowerCase()) || (automation.triggerType && automation.triggerType.toLowerCase().includes(automationSearch.toLowerCase()));
    return matchesTrigger && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Automation</h1>
          <p className="text-base text-gray-600">Set up automation rules and manage templates to streamline your event communication.</p>
        </div>
        <div className="flex space-x-3">
          {activeTab === "templates" && (
            <button onClick={handleCreateTemplate} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors">
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Create Template
            </button>
          )}
          {activeTab === "automations" && (
            <button onClick={handleCreateAutomation} className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create Automation
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("automations")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "automations" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            <RotateCcw className="w-4 h-4 inline-block mr-2" />
            Automations ({automations.length})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "templates" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            <LayoutTemplate className="w-4 h-4 inline-block mr-2" />
            Templates ({templates.length})
          </button>
        </nav>
      </div>

      {/* Automations Tab Content */}
      {activeTab === "automations" && (
        <div>
          {/* Automation Filters */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search automations..."
                  value={automationSearch}
                  onChange={(e) => setAutomationSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="relative">
                <select
                  value={automationTriggerFilter}
                  onChange={(e) => setAutomationTriggerFilter(e.target.value)}
                  className="pl-4 pr-8 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white"
                >
                  <option value="all">All Triggers</option>
                  {triggers.map((trigger) => (
                    <option key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="text-sm text-gray-500">{filteredAutomations.length} automations</div>
          </div>

          {/* Automations Grid */}
          {automationLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-indigo-600" />
              <p className="text-gray-500">Loading automations...</p>
            </div>
          ) : filteredAutomations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAutomations.map((automation) => {
                // Handle both legacy and new format, and ensure actions is always an array
                let actions = [];

                if (automation.actions) {
                  // If actions is a string (from JSON.stringify), parse it
                  if (typeof automation.actions === "string") {
                    try {
                      actions = JSON.parse(automation.actions);
                    } catch (error) {
                      console.error("Error parsing actions:", error);
                      actions = [];
                    }
                  } else if (Array.isArray(automation.actions)) {
                    actions = automation.actions;
                  }
                }

                // Fallback to legacy format if no actions found
                if (!actions || actions.length === 0) {
                  actions = [
                    {
                      actionType: automation.actionType,
                      template: automation.template,
                    },
                  ];
                }

                const isEnabled = enabledAutomations.some((ea) => ea.automation === automation._id);
                const triggerLabel = triggers.find((t) => t.value === automation.triggerType)?.label || automation.triggerType;

                return (
                  <div key={automation._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 text-indigo-600" />
                        <StatusBadge status={isEnabled ? "active" : "paused"} />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Switch checked={isEnabled} onChange={() => handleToggleAutomation(automation._id)} />
                        {!automation.isAdmin && (
                          <button onClick={() => handleEditAutomation(automation)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {!automation.isAdmin && (
                          <button onClick={() => handleDeleteAutomation(automation._id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{automation.name}</h3>

                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">When:</span> {triggerLabel}
                    </div>

                    <div className="space-y-2 mb-4">
                      {actions.map((action, index) => {
                        const actionLabel = actions.find((a) => a.value === action.actionType)?.label || action.actionType;
                        const linkedTemplate = templates.find((t) => t._id === action.template);

                        return (
                          <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                            <div className="font-medium">Action {index + 1}:</div>
                            <div>Then {actionLabel?.toLowerCase()}</div>
                            {linkedTemplate && (
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <LayoutTemplate className="w-3 h-3 mr-1" />
                                Using template: {linkedTemplate.name}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <RotateCcw className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No automations found</h3>
              <p className="text-gray-400 mb-6">
                {automationSearch || automationTriggerFilter !== "all" ? "Try adjusting your search or filter criteria." : "Create your first automation to save time on repetitive tasks!"}
              </p>
              {!automationSearch && automationTriggerFilter === "all" && (
                <button onClick={handleCreateAutomation} className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Automation
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab Content */}
      {activeTab === "templates" && (
        <div>
          {/* Template Filters */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="relative">
                <select
                  value={templateFilter}
                  onChange={(e) => setTemplateFilter(e.target.value)}
                  className="pl-4 pr-8 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {templateCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="text-sm text-gray-500">{filteredTemplates.length} templates</div>
          </div>

          {/* Templates Grid */}
          {templateLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-indigo-600" />
              <p className="text-gray-500">Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <TypeBadge type={template.type} />
                      {template.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs font-medium">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => handlePreviewTemplate(template)} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors" title="Preview">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDuplicateTemplate(template)} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      {!template.isAdmin && (
                        <button onClick={() => handleEditTemplate(template)} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {!template.isAdmin && (
                        <button onClick={() => handleDeleteTemplate(template._id)} className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>

                  <p className="text-sm font-medium text-gray-700 mb-2 truncate">{template.subject}</p>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-grow">{template.content}</p>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3 mt-auto">
                    <span>Used {template.usageCount || 0} times</span>
                    {template.lastUsed && <span>Last used {new Date(template.lastUsed).toLocaleDateString()}</span>}
                  </div>

                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <span key={variable} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                      {template.variables.length > 3 && <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">+{template.variables.length - 3} more</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!templateLoading && filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <LayoutTemplate className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-400 mb-6">{templateSearch || templateFilter !== "all" ? "Try adjusting your search or filter criteria." : "Create your first template to get started!"}</p>
              {!templateSearch && templateFilter === "all" && (
                <button onClick={handleCreateTemplate} className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Automation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{editingAutomation ? "Edit Automation" : "Create New Automation"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Automation Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome Email for New Registrants"
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">When this happens (Trigger)</label>
                  <div className="relative">
                    <select
                      value={formData.triggerType}
                      onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                    >
                      <option value="">Select trigger...</option>
                      {triggers.map((trigger) => (
                        <option key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-600">Actions</label>
                    <button type="button" onClick={addAction} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200 transition-colors">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Action
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.actions.map((action, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Action {index + 1}</h4>
                          {formData.actions.length > 1 && (
                            <button type="button" onClick={() => removeAction(index)} className="text-red-500 hover:text-red-700 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Do this (Action)</label>
                            <div className="relative">
                              <select
                                value={action.actionType}
                                onChange={(e) => updateAction(index, "actionType", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                              >
                                <option value="">Select action...</option>
                                {actions.map((actionOption) => (
                                  <option key={actionOption.value} value={actionOption.value}>
                                    {actionOption.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {(action.actionType === "send_email" || action.actionType === "send_notification") && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Select Template</label>
                            <div className="relative">
                              <CustomSelect
                                apiType="API"
                                selectApi={`template-collection/select?event=${eventId}&franchise=${franchiseId}&type=${action.actionType === "send_email" ? "email" : "notification"}`}
                                value={action.template}
                                onSelect={(e) => updateAction(index, "template", e.id)}
                                placeholder="Select template..."
                              />
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <p className="text-sm text-gray-400">Enable this automation to run automatically</p>
                  </div>
                  <Switch checked={formData.enabled} onChange={() => setFormData({ ...formData, enabled: !formData.enabled })} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-white rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveAutomation}
                disabled={!formData.name || !formData.triggerType || !formData.actions.every((action) => action.actionType) || loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingAutomation ? "Update Automation" : "Create Automation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-2 z-10">
              <h2 className="text-xl font-semibold text-gray-900">{editingTemplate ? "Edit Template" : "Create New Template"}</h2>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Template Name</label>
                  <input
                    type="text"
                    value={templateFormData.name}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                    placeholder="e.g., Welcome Email Template"
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Type</label>
                    <select
                      value={templateFormData.type}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {templateTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
                    <select
                      value={templateFormData.category}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {templateCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={templateFormData.subject}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, subject: e.target.value })}
                    placeholder="e.g., Welcome to {{event_name}}!"
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Content</label>
                  <textarea
                    value={templateFormData.content}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, content: e.target.value })}
                    placeholder="Enter your template content here... Use {{variable_name}} for dynamic content."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
                  <div className="bg-white p-4 rounded border">
                    <div className="text-sm font-medium text-gray-700 mb-2">Subject: {templateFormData.subject || "Subject will appear here..."}</div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">{templateFormData.content || "Content will appear here..."}</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">Available Variables</h3>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>
                      • <code>{`{{attendee_name}}`}</code> - Attendee's full name
                    </div>
                    <div>
                      • <code>{`{{event_name}}`}</code> - Event title
                    </div>
                    <div>
                      • <code>{`{{event_date}}`}</code> - Event date
                    </div>
                    <div>
                      • <code>{`{{organizer_name}}`}</code> - Organizer name
                    </div>
                    <div>
                      • <code>{`{{session_name}}`}</code> - Session title
                    </div>
                    <div>
                      • <code>{`{{room_name}}`}</code> - Room/location
                    </div>
                  </div>
                </div>

                {templateFormData.content && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-900 mb-3">Detected Variables</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(templateFormData.content.match(/\{\{([^}]+)\}\}/g) || [])].map((variable, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 sticky bottom-0 bg-white py-4 z-10">
              <button onClick={() => setShowTemplateModal(false)} className="px-6 py-2 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateFormData.name || !templateFormData.subject || !templateFormData.content || loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingTemplate ? "Update Template" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showTemplatePreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Template Preview: {previewTemplate.name}</h2>
              <button onClick={() => setShowTemplatePreview(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <TypeBadge type={previewTemplate.type} />
                <span className="text-sm text-gray-500">Category: {previewTemplate.category}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Subject: {previewTemplate.subject}</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border">{previewTemplate.content}</div>
              </div>

              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Dynamic Variables</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.variables.map((variable) => (
                      <span key={variable} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <span>Used {previewTemplate.usageCount || 0} times</span>
                {previewTemplate.lastUsed && <span>Last used on {new Date(previewTemplate.lastUsed).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default adminAutomationTab;
