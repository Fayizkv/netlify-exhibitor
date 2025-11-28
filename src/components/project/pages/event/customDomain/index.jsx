import React, { useCallback, useEffect, useState } from "react";
import { SubPageHeader } from "../../../../core/input/heading";
import { GetIcon } from "../../../../../icons";
import { getData, postData, deleteData, putData } from "../../../../../backend/api";
import { TabButtons, Toggle } from "../../../../core/elements";
import QRCode from "react-qr-code";
import { useQuery, useQueryClient } from "@tanstack/react-query";
const DomainManager = (props) => {
  const [activeTab, setActiveTab] = useState("eventhex");
  const [selectedView, setSelectedView] = useState("subdomains");
  const [newDomain, setNewDomain] = useState({
    domain: "",
    isValid: false,
    error: "",
  });
  const eventId = props?.openData?.data?._id;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDomainType, setSelectedDomainType] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);
  const [editingValue, setEditingValue] = useState({
    value: "",
    isValid: false,
    error: "",
  });
  const { setMessage, setLoaderBox } = props;
  const queryClient = useQueryClient();
  const appConfigs = [
    {
      id: "eventhex",
      title: "EventHex Domain",
      name: "Event Website",
      description: "Main domain for your event",
      rootDomain: "eventhex.ai",
      isMain: true,
    },
    // {
    //   id: "eventapp",
    //   title: "Event App",
    //   name: "Event App",
    //   description: "Enable Event App subdomain",
    //   rootDomain: "eventhex.ai",
    //   isMain: false,
    // },
    {
      id: "instarecap",
      title: "InstaRecap",
      name: "InstaRecap",
      description: "Enable InstaRecap subdomain",
      rootDomain: "instarecap.ai",
      isMain: false,
    },
    {
      id: "instasnap",
      title: "InstaSnap",
      name: "InstaSnap",
      description: "Enable InstaSnap subdomain",
      rootDomain: "instasnap.ai",
      isMain: false,
    },
  ];

  const [qrCodeData, setQrCodeData] = useState({
    show: false,
    domain: "",
    appType: "",
  });

  // Derive which app configs to show based on event coreModules
  const eventCoreModulesRaw = props?.openData?.data?.coreModules || [];
  const eventCoreModuleNames = Array.isArray(eventCoreModulesRaw) ? eventCoreModulesRaw.map((mod) => (typeof mod === "string" ? mod : mod?.name || mod?.title || mod?.moduleName)).filter(Boolean) : [];
  const eventCoreModuleNamesLower = eventCoreModuleNames.map((n) => String(n).toLowerCase());

  // Filter app configs based on core modules - InstaSnap and InstaRecap should be active if present in coreModules
  const [filteredAppConfigs] = useState(
    appConfigs.filter((config) => {
      // Always show main config (eventhex)
      if (config.isMain) return true;

      // Check if the module is in coreModules
      const moduleNameLower = config.name.toLowerCase();
      const isInCoreModules = eventCoreModuleNamesLower.includes(moduleNameLower);

      return isInCoreModules;
    })
  );

  const validateSubdomain = (value) => {
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$/;
    if (!value) {
      return { isValid: false, error: "Subdomain cannot be empty" };
    }
    if (!regex.test(value)) {
      return {
        isValid: false,
        error: "Invalid subdomain format. Use letters, numbers, and hyphens.",
      };
    }
    return { isValid: true, error: "" };
  };

  const validateCustomDomain = (domain) => {
    const regex = /^(?!-)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,24}$/;
    if (!domain) {
      return { isValid: false, error: "Domain cannot be empty" };
    }
    if (!regex.test(domain)) {
      return { isValid: false, error: "Invalid domain format" };
    }
    return { isValid: true, error: "" };
  };

  const {
    data: domains,
    isPending,
    error,
  } = useQuery({
    queryKey: ["whitelisted-Domains", eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      try {
        const response = await getData({ event: eventId }, "whitelisted-Domains");

        // Initialize default domains structure
        const newDomains = {
          instarecap: { subdomain: null, customDomains: [] },
          instasnap: { subdomain: null, customDomains: [] },
          eventhex: { subdomain: null, customDomains: [] },
          eventapp: { subdomain: null, customDomains: [] },
        };

        if (response.status === 200) {
          const items = response?.data?.response || [];

          items.forEach((item) => {
            if (item.appType && newDomains[item.appType]) {
              if (item.domainType === "subdomain") {
                newDomains[item.appType].subdomain = item;
              } else {
                newDomains[item.appType].customDomains.push(item);
              }
            }
          });
        }

        return newDomains;
      } catch (error) {
        // Return default structure even on error to prevent undefined
        return {
          instarecap: { subdomain: null, customDomains: [] },
          instasnap: { subdomain: null, customDomains: [] },
          eventhex: { subdomain: null, customDomains: [] },
          eventapp: { subdomain: null, customDomains: [] },
        };
      }
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const refreshDomains = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ["whitelisted-Domains", eventId] });
  }, [eventId, setMessage]);

  // Function to check and auto-enable domains based on core modules
  const checkAndAutoEnableDomains = async (currentDomains) => {
    // Prevent infinite loops
    if (isAutoEnabling) {
      return;
    }

    try {
      setIsAutoEnabling(true);

      // Get core modules from event data
      const eventCoreModulesRaw = props?.openData?.data?.coreModules || [];
      const eventCoreModuleNames = Array.isArray(eventCoreModulesRaw)
        ? eventCoreModulesRaw.map((mod) => (typeof mod === "string" ? mod : mod?.name || mod?.title || mod?.moduleName)).filter(Boolean)
        : [];
      const eventCoreModuleNamesLower = eventCoreModuleNames.map((n) => String(n).toLowerCase());

      // Check each app config that should be enabled based on core modules
      for (const config of filteredAppConfigs) {
        if (config.isMain) {
          continue; // Skip main config (eventhex)
        }

        const moduleNameLower = config.name.toLowerCase();
        const isInCoreModules = eventCoreModuleNamesLower.includes(moduleNameLower);

        if (isInCoreModules) {
          const domainData = currentDomains[config.id];
          const hasSubdomain = domainData?.subdomain;

          // If module is in core modules but no subdomain exists, auto-enable it
          if (!hasSubdomain) {
            await handleEnableSubdomain(config);
          }
        }
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsAutoEnabling(false);
    }
  };
  // const [isLoaded, setIsLoaded] = useState(false);

  const handleAddCustomDomain = async () => {
    if (!newDomain.isValid) return;

    try {
      setLoaderBox(true);
      const response = await postData(
        {
          event: eventId,
          domain: newDomain.domain,
          appType: activeTab,
        },
        "whitelisted-Domains/custom-domain"
      );

      if (response.status === 200) {
        await refreshDomains();
        setSelectedDomainType(null);
        setNewDomain({ domain: "", isValid: false, error: "" });

        // Check if DNS setup is required
        if (response.data.requiredSetup) {
          setMessage({
            type: 1,
            content: response.data.message,
            icon: "success",
          });

          // Show DNS configuration instructions
          setDnsInstructions({
            show: true,
            type: response.data.requiredSetup.type,
            value: response.data.requiredSetup.value,
            steps: response.data.requiredSetup.instructions,
          });
        } else {
          setMessage({
            type: 1,
            content: response.data.message,
            icon: "success",
          });
        }
      } else if (response.status === 400) {
        // DNS Configuration Required (legacy format)
        setMessage({
          type: 1,
          content: response.data.message,
          icon: "error",
        });

        // Show DNS configuration instructions
        if (response.data.requiredSetup) {
          setDnsInstructions({
            show: true,
            type: response.data.requiredSetup.type,
            value: response.data.requiredSetup.value,
            steps: response.data.requiredSetup.instructions,
          });
        }
      } else if (response.status === 409) {
        // Domain already exists
        setMessage({
          type: 1,
          content: response.data.message,
          icon: "error",
        });
      } else {
        setMessage({
          type: 1,
          content: response.data.message || "Failed to add domain",
          icon: "error",
        });
      }
    } catch (error) {
      setMessage({
        type: 1,
        content: error.response?.data?.message || "Failed to add domain",
        icon: "error",
      });
    } finally {
      setLoaderBox(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({
        type: 1,
        content: "CNAME value copied to clipboard",
        icon: "success",
      });
    } catch (err) {
      setMessage({
        type: 1,
        content: "Failed to copy CNAME value",
        icon: "error",
      });
    }
  };

  const handleStartEdit = (domain, type) => {
    const value = type === "subdomain" ? domain.domain.split(".")[0] : domain.domain;
    const validation = type === "subdomain" ? validateSubdomain(value) : validateCustomDomain(value);

    setEditingDomain({
      id: domain._id,
      type,
      appType: domain.appType,
      oldValue: value,
    });
    setEditingValue({
      value,
      isValid: validation.isValid,
      error: validation.error,
    });
  };

  const handleCancelEdit = () => {
    setEditingDomain(null);
    setEditingValue({ value: "", isValid: false, error: "" });
  };

  const handleSaveEdit = async () => {
    if (!editingValue.isValid) return;

    try {
      setLoaderBox(true);
      const response = await putData(
        {
          id: editingDomain.id,
          domain: editingValue.value,
          oldDomain: editingDomain.oldValue,
          appType: editingDomain.appType,
        },
        "whitelisted-Domains/update"
      );

      if (response.status === 200) {
        await refreshDomains();
        setEditingDomain(null);
        setEditingValue({ value: "", isValid: false, error: "" });
        setMessage({
          type: 1,
          content: "Domain updated successfully",
          icon: "success",
        });
      }
    } catch (error) {
      setMessage({
        type: 1,
        content: error.response?.data?.message || "Failed to update domain",
        icon: "error",
      });
    } finally {
      setLoaderBox(false);
    }
  };

  const handleToggleStatus = async (domain, newStatus) => {
    try {
      setLoaderBox(true);
      console.log("handleToggleStatus called:", { domain, newStatus, domainType: domain.domainType });

      // If disabling a subdomain, delete it
      if (!newStatus && domain.domainType === "subdomain") {
        console.log("Disabling subdomain, calling delete API");
        const response = await deleteData({}, `whitelisted-Domains/delete/${domain._id}`);
        console.log("Delete subdomain response:", response);

        if (response.status === 200) {
          await refreshDomains();
          setMessage({
            type: 1,
            content: "Subdomain deleted successfully",
            icon: "success",
          });
        } else {
          setMessage({
            type: 1,
            content: response.data?.message || "Failed to delete subdomain",
            icon: "error",
          });
        }
        return;
      }

      // For enabling or custom domains, use toggle-status
      console.log("Toggling domain status, calling toggle-status API");
      const response = await postData(
        {
          id: domain._id,
          status: newStatus,
        },
        "whitelisted-Domains/toggle-status"
      );
      console.log("Toggle status response:", response);

      if (response.status === 200) {
        await refreshDomains();
        setMessage({
          type: 1,
          content: response.data.message || `Domain ${newStatus ? "enabled" : "disabled"} successfully`,
          icon: "success",
        });
      } else {
        setMessage({
          type: 1,
          content: response.data?.message || `Failed to ${newStatus ? "enable" : "disable"} domain`,
          icon: "error",
        });
      }
    } catch (error) {
      console.error("handleToggleStatus error:", error);
      setMessage({
        type: 1,
        content: error.response?.data?.message || `Failed to ${newStatus ? "enable" : "disable"} domain`,
        icon: "error",
      });
    } finally {
      setLoaderBox(false);
    }
  };

  const getDefaultSubdomain = () => {
    const eventhexDomain = domains.eventhex?.subdomain?.domain;
    if (eventhexDomain) {
      const prefix = eventhexDomain.split(".")[0];
      return prefix;
    }
    // Get event title and convert it to a valid subdomain format
    const eventTitle = props?.openData?.data?.title || "my-event";
    const eventId = props?.openData?.data?._id || "";
    // Take first 6 characters of the event ID for uniqueness
    const uniqueId = eventId.substring(0, 6);

    return `${eventTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric chars with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, "")}-${uniqueId}`; // Add unique ID suffix
  };

  // Add verify handler
  const handleVerifyDomain = async (domain) => {
    try {
      setLoaderBox(true);
      const response = await postData({ id: domain._id }, "whitelisted-Domains/verify");

      if (response.status === 200) {
        await refreshDomains();
        setMessage({
          type: 1,
          content: "Domain verification initiated",
          icon: "success",
        });
      }
    } catch (error) {
      setMessage({
        type: 1,
        content: "Failed to verify domain",
        icon: "error",
      });
    } finally {
      setLoaderBox(false);
    }
  };

  const handleDelete = async (domain) => {
    try {
      setLoaderBox(true);
      const response = await deleteData({}, `whitelisted-Domains/delete/${domain._id}`);

      if (response.status === 200) {
        await refreshDomains();
        setMessage({
          type: 1,
          content: "Domain deleted successfully",
          icon: "success",
        });
      } else {
        setMessage({
          type: 1,
          content: response.data?.message || "Failed to delete domain",
          icon: "error",
        });
      }
    } catch (error) {
      setMessage({
        type: 1,
        content: error.response?.data?.message || "Failed to delete domain",
        icon: "error",
      });
    } finally {
      setLoaderBox(false);
    }
  };

  // Helper function to check if any domain is already default for the same app type (kept for compatibility)
  const hasDefaultDomain = (appType) => {
    if (!domains) return false;

    // Check if any subdomain for this specific app type is default
    const domainData = domains[appType];
    if (domainData?.subdomain?.isDefault) return true;

    // Check custom domains for this app type
    const customDomains = domainData?.customDomains || [];
    if (customDomains.some((domain) => domain.isDefault)) return true;

    return false;
  };

  // Add this helper function to get app config
  const getAppConfig = (appType) => {
    return (
      appConfigs.find((config) => config.id === appType) || {
        name: appType.charAt(0).toUpperCase() + appType.slice(1),
        rootDomain: "eventhex.ai",
      }
    );
  };

  // Helper function to check if a domain should be auto-enabled based on core modules
  const shouldAutoEnableDomain = (config) => {
    const eventCoreModulesRaw = props?.openData?.data?.coreModules || [];
    const eventCoreModuleNames = Array.isArray(eventCoreModulesRaw)
      ? eventCoreModulesRaw.map((mod) => (typeof mod === "string" ? mod : mod?.name || mod?.title || mod?.moduleName)).filter(Boolean)
      : [];
    const eventCoreModuleNamesLower = eventCoreModuleNames.map((n) => String(n).toLowerCase());

    return eventCoreModuleNamesLower.includes(config.name.toLowerCase());
  };

  // Add this new handler
  const handleEnableSubdomain = async (config) => {
    try {
      setLoaderBox(true);
      const defaultPrefix = getDefaultSubdomain();

      const response = await postData(
        {
          event: eventId,
          domain: defaultPrefix,
          appType: config.id,
          route: config.id,
        },
        "whitelisted-Domains/sub-domain"
      );

      if (response.status === 200) {
        await refreshDomains();

        // Check if the subdomain was automatically set as default
        const isFirstSubdomain = !hasDefaultDomain(config.id);
        const message = isFirstSubdomain ? `${config.name} subdomain enabled and set as default successfully` : response.data.message;

        setMessage({
          type: 1,
          content: message,
          icon: "success",
        });
      }
    } catch (error) {
      setMessage({
        type: 1,
        content: `Failed to enable ${config.name} subdomain`,
        icon: "error",
      });
    } finally {
      setLoaderBox(false);
    }
  };

  // Add this helper function
  const openDomainUrl = (domain) => {
    const protocol = "https://";
    window.open(protocol + domain, "_blank");
  };

  // Rename function to match UI terminology but keep delete functionality
  const handleDisableSubdomain = async (domain) => {
    try {
      setLoaderBox(true);
      console.log("Disabling subdomain confirmed, calling delete API");

      const response = await deleteData({}, `whitelisted-Domains/delete/${domain._id}`);
      console.log("Disable subdomain response:", response);

      if (response.status === 200) {
        // Update local state
        await refreshDomains();

        setMessage({
          type: 1,
          content: "Subdomain disabled successfully",
          icon: "success",
        });
        return true; // Close modal after successful action
      } else {
        setMessage({
          type: 1,
          content: response.data?.message || "Failed to disable subdomain",
          icon: "error",
        });
        return false; // Keep modal open
      }
    } catch (error) {
      console.error("handleDisableSubdomain error:", error);
      setMessage({
        type: 1,
        content: error.response?.data?.message || "Failed to disable subdomain",
        icon: "error",
      });
      return false; // Keep modal open
    } finally {
      setLoaderBox(false);
    }
  };

  // Add state for DNS instructions
  const [dnsInstructions, setDnsInstructions] = useState({
    show: false,
    type: "",
    value: "",
    steps: [],
  });

  // Add state to prevent infinite loops during auto-enable
  const [isAutoEnabling, setIsAutoEnabling] = useState(false);

  // Add DNS Instructions Component
  const DNSInstructions = ({ instructions, onClose }) => (
    <div className="mt-4 bg-blue-50 rounded-md p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-blue-900">DNS Configuration Required</h4>
        <button onClick={onClose} className="text-blue-500 hover:text-blue-700">
          <GetIcon icon="close" className="w-4 h-4" />
        </button>
      </div>
      <ol className="list-decimal pl-4 space-y-2 text-sm text-blue-700">
        {instructions.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      <div className="mt-3 flex items-center gap-2 text-sm text-blue-700">
        <span>CNAME Value:</span>
        <code className="bg-blue-100 px-2 py-1 rounded">{instructions.value}</code>
        <button onClick={() => copyToClipboard(instructions.value)} className="text-blue-600 hover:text-blue-800">
          <GetIcon icon="copy" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Add this new function to handle QR code display
  const handleShowQRCode = (domain, appType) => {
    setQrCodeData({
      show: true,
      domain: domain.domain,
      appType: appType,
    });
  };

  // Add this new function to handle QR code close
  const handleCloseQRCode = () => {
    setQrCodeData({
      show: false,
      domain: "",
      appType: "",
    });
  };

  // Add this new function to handle QR code download
  const handleDownloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-code-${qrCodeData.domain}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Show loading state
  if (isPending) {
    return (
      <div>
        <SubPageHeader title="Domain Management" line={false} description="Set up and customize your unique domain for the photo-sharing experience" />
        <div className="animate-pulse space-y-4">
          {/* Shimmer for each domain row */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-100 rounded"></div>
                  <div className="h-4 w-48 bg-gray-100 rounded"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                  <div className="h-6 w-12 bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <SubPageHeader title="Domain Management" line={false} description="Set up and customize your unique domain for the photo-sharing experience" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400">
              <GetIcon icon="alert-circle" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading domains</h3>
              <p className="text-sm text-red-700 mt-1">{error.message}</p>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["whitelisted-Domains", eventId] })} className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SubPageHeader title="Domain Management" line={false} description="Set up and customize your unique domain for the photo-sharing experience" />
      {/* Tab Navigation */}
      <div className="mb-4 mt-4 border-b border-gray-200">
        <TabButtons
          tabs={[
            { key: "subdomains", title: "Subdomains" },
            { key: "custom-domains", title: "Custom Domains" },
          ]}
          selectedTab={selectedView}
          selectedChange={(key) => setSelectedView(key)}
          design="underline"
        ></TabButtons>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {/* Shimmer for each domain row */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-100 rounded"></div>
                  <div className="h-4 w-48 bg-gray-100 rounded"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                  <div className="h-6 w-12 bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white mt-4 space-y-4">
          {/* Subdomains Tab Content */}
          {selectedView === "subdomains" && (
            <div className="border border-gray-200 rounded-lg">
              {domains &&
                filteredAppConfigs.map((config) => {
                  const subdomain = domains[config.id]?.subdomain;
                  const defaultPrefix = getDefaultSubdomain();
                  const suggestedValue = `${defaultPrefix}.${config.rootDomain}`;

                  return (
                    <div key={config.id} className="p-3 border-b last:border-b-0">
                      <div className="flex items-center justify-between py-2 md:flex-row flex-col gap-2">
                        {/* Left side - Domain info */}
                        <div className="flex items-center gap-2 sm:flex-row flex-col">
                          <div className="flex items-center gap-2">
                            <GetIcon icon="globe" className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{config.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            {subdomain?.domain || suggestedValue}
                            {!subdomain && <span className="text-xs text-gray-400 ml-1">(suggested)</span>}
                            {subdomain?.verified ? (
                              <div className="inline-flex items-center ml-2">
                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span className="text-xs text-green-600 ml-1">Active</span>
                              </div>
                            ) : subdomain?.status ? (
                              <div className="inline-flex items-center ml-2">
                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                <span className="text-xs text-red-600 ml-1">Pending</span>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>

                        {/* Right side - Actions and Toggle */}
                        {subdomain ? (
                          <div className="flex items-center gap-3">
                            {/* Action Buttons First */}
                            <div className="flex items-center gap-2">
                              {editingDomain?.id === subdomain._id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    className={`w-64 px-3 py-1.5 rounded-md border ${editingValue.error ? "border-red-300" : "border-gray-300"} text-sm`}
                                    placeholder="Enter subdomain"
                                    value={editingValue.value}
                                    onChange={(e) => {
                                      const validation = validateSubdomain(e.target.value);
                                      setEditingValue({
                                        value: e.target.value,
                                        isValid: validation.isValid,
                                        error: validation.error,
                                      });
                                    }}
                                  />
                                  <button
                                    onClick={handleSaveEdit}
                                    disabled={!editingValue.isValid}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium text-white ${editingValue.isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
                                  >
                                    Submit
                                  </button>
                                  <button onClick={handleCancelEdit} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(subdomain, "subdomain")}
                                    className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1"
                                  >
                                    <GetIcon icon="edit" className="w-3 h-3" />
                                    Rename
                                  </button>

                                  {subdomain.status && (
                                    <>
                                      <button
                                        onClick={() => openDomainUrl(subdomain.domain)}
                                        className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1"
                                      >
                                        <GetIcon icon="link" className="w-3 h-3" />
                                        Visit Site
                                      </button>
                                      <button
                                        onClick={() => handleShowQRCode(subdomain, config.id)}
                                        className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1"
                                      >
                                        <GetIcon icon="qr" className="w-3 h-3" />
                                        QR Code
                                      </button>
                                    </>
                                  )}
                                  {!subdomain.status && subdomain.verified && <></>}
                                </>
                              )}
                            </div>

                            {/* Divider */}
                            <div className="h-4 w-px bg-gray-200"></div>

                            {/* Toggle Last */}
                            <Toggle
                              isEnabled={subdomain.status}
                              onToggle={() => {
                                if (subdomain.status) {
                                  // Check if this is an auto-enabled domain
                                  if (shouldAutoEnableDomain(config)) {
                                    setMessage({
                                      type: 2,
                                      content: `This ${config.name} subdomain is automatically enabled because "${config.name}" is included in your event's core modules. Disabling it may affect your event functionality. Are you sure you want to continue?`,
                                      proceed: "Disable Anyway",
                                      okay: "Cancel",
                                      onProceed: () => {
                                        handleDisableSubdomain(subdomain);
                                      },
                                    });
                                  } else {
                                    // Show confirmation dialog with softer language
                                    setMessage({
                                      type: 2,
                                      content: `Are you sure you want to disable subdomain '${domain.domain}'?`,
                                      proceed: "Disable",
                                      okay: "Cancel",
                                      onProceed: async () => {
                                        handleDisableSubdomain(subdomain);
                                      },
                                    });
                                  }
                                } else {
                                  handleToggleStatus(subdomain, true);
                                }
                              }}
                              size="default"
                              title={subdomain.status ? "Disable Subdomain" : "Enable Subdomain"}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Toggle isEnabled={false} onToggle={() => handleEnableSubdomain(config)} size="default" title={`Activate ${config.name} subdomain`} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Custom Domains Tab Content */}
          {selectedView === "custom-domains" && (
            <div className="border border-gray-200 rounded-lg">
              <div className="p-3 border-b flex justify-between items-center">
                <h3 className="text-sm font-medium">Custom Domains</h3>
                {Object.values(domains).some((domain) => domain.customDomains.length > 0) && (
                  <button onClick={() => setSelectedDomainType("domain")} className="text-xs px-2 py-1 border rounded text-gray-700">
                    + Add New
                  </button>
                )}
              </div>

              {/* Show Add Domain form if no custom domains exist or if add button was clicked */}
              {(selectedDomainType === "domain" || !Object.values(domains).some((domain) => domain.customDomains.length > 0)) && (
                <div className="p-4 border-b">
                  <div className="space-y-4">
                    {/* App Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select App Type</label>
                      <div className="flex flex-wrap gap-2">
                        {filteredAppConfigs.map((config) => {
                          const hasSubdomain = domains?.[config.id]?.subdomain;
                          const hasCustomDomain = (domains?.[config.id]?.customDomains || []).length > 0;
                          const isDisabled = selectedDomainType === "subdomain" ? hasSubdomain : hasCustomDomain;

                          return (
                            <div
                              key={config.id}
                              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                                isDisabled
                                  ? "bg-gray-50 text-gray-500"
                                  : activeTab === config.id
                                    ? "bg-blue-100 border border-blue-500 text-blue-700"
                                    : "border border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-50"
                              }`}
                              onClick={() => !isDisabled && setActiveTab(config.id)}
                            >
                              <span className="flex items-center gap-2">
                                {activeTab === config.id ? (
                                  <>
                                    <GetIcon icon="tick" className="w-4 h-4 inline-block ml-1" /> {config.name}
                                  </>
                                ) : (
                                  `${config.name}`
                                )}
                              </span>
                              {isDisabled && <GetIcon icon="success" className="w-4 h-4 text-green-500" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Domain Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Enter Custom Domain</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          className={`block w-full px-3 py-2 rounded-md border ${newDomain.error ? "border-red-300" : "border-gray-300"} sm:text-sm`}
                          placeholder="example.com"
                          value={newDomain.domain}
                          onChange={(e) => {
                            const validation = validateCustomDomain(e.target.value);
                            setNewDomain((prev) => ({
                              ...prev,
                              domain: e.target.value,
                              isValid: validation.isValid,
                              error: validation.error,
                            }));
                          }}
                        />
                        {newDomain.error && <p className="mt-1 text-sm text-red-600">{newDomain.error}</p>}
                      </div>
                    </div>

                    {/* Show DNS Instructions when needed */}
                    {dnsInstructions.show && (
                      <DNSInstructions
                        instructions={dnsInstructions}
                        onClose={() =>
                          setDnsInstructions({
                            show: false,
                            type: "",
                            value: "",
                            steps: [],
                          })
                        }
                      />
                    )}

                    {/* DNS Configuration Guide */}
                    <div className="mt-4 bg-gray-50 rounded-md p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">DNS Configuration Steps:</h4>
                      <ol className="list-decimal pl-4 space-y-2 text-sm text-gray-600">
                        <li>Log in to your domain registrar's control panel</li>
                        <li>Navigate to DNS management or DNS records section</li>
                        <li>
                          Add a new CNAME record with the following details:
                          <ul className="list-disc pl-4 mt-2 space-y-1">
                            <li>Type: CNAME</li>
                            <li>Host/Name: www or subdomain</li>
                            <li className="flex items-center justify-between">
                              <span>
                                Value/Points to: cname.
                                {getAppConfig(activeTab).rootDomain}
                              </span>
                              <button onClick={() => copyToClipboard(`cname.${getAppConfig(activeTab).rootDomain}`)} className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-700">
                                <GetIcon icon="copy" className="w-4 h-4" />
                              </button>
                            </li>
                            <li>TTL: 3600 or Automatic</li>
                          </ul>
                        </li>
                        <li>Save changes and wait for DNS propagation (up to 48 hours)</li>
                      </ol>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setSelectedDomainType(null);
                          setNewDomain({
                            domain: "",
                            isValid: false,
                            error: "",
                          });
                          setDnsInstructions({
                            show: false,
                            type: "",
                            value: "",
                            steps: [],
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCustomDomain}
                        disabled={!newDomain.isValid}
                        className={`px-4 py-2 rounded-md text-sm font-medium text-white ${newDomain.isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
                      >
                        Verify & Add Domain
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* List of existing custom domains */}
              {Object.entries(domains).flatMap(([appType, domainData]) =>
                domainData.customDomains.map((domain) => (
                  <div key={domain._id} className="p-3 border-b last:border-b-0">
                    <div className="flex items-center justify-between py-2">
                      {/* Left side - Domain info */}
                      <div className="flex items-center gap-2">
                        <GetIcon icon="globe" className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{domain.domain}</span>
                        <span className="text-xs text-gray-500">
                          ({getAppConfig(appType).name} Custom Domain)
                          {domain.verified && (
                            <span className="inline-flex items-center ml-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                              <span className="text-xs text-green-600">verified</span>
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Right side - Actions and Toggle */}
                      <div className="flex items-center gap-3">
                        {/* Action Buttons First */}
                        <div className="flex items-center gap-2">
                          {editingDomain?.id === domain._id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                className={`w-64 px-3 py-1.5 rounded-md border ${editingValue.error ? "border-red-300" : "border-gray-300"} text-sm`}
                                placeholder="example.com"
                                value={editingValue.value}
                                onChange={(e) => {
                                  const validation = validateCustomDomain(e.target.value);
                                  setEditingValue({
                                    value: e.target.value,
                                    isValid: validation.isValid,
                                    error: validation.error,
                                  });
                                }}
                              />
                              <button
                                onClick={handleSaveEdit}
                                disabled={!editingValue.isValid}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium text-white ${editingValue.isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
                              >
                                Submit
                              </button>
                              <button onClick={handleCancelEdit} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(domain, "domain")}
                                className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1"
                              >
                                <GetIcon icon="edit" className="w-3 h-3" />
                                Rename
                              </button>

                              {domain.status && domain.verified && (
                                <>
                                  <button
                                    onClick={() => openDomainUrl(domain.domain)}
                                    className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1"
                                  >
                                    <GetIcon icon="link" className="w-3 h-3" />
                                    Visit Site
                                  </button>
                                  <button
                                    onClick={() => handleShowQRCode(domain, appType)}
                                    className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1"
                                  >
                                    <GetIcon icon="qr" className="w-3 h-3" />
                                    QR Code
                                  </button>
                                </>
                              )}

                              <button onClick={() => handleDelete(domain)} className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded-full border border-red-200 flex items-center gap-1">
                                <GetIcon icon="delete" className="w-3 h-3" />
                                Remove
                              </button>
                            </>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="h-4 w-px bg-gray-200"></div>

                        {/* Toggle Last */}
                        <Toggle
                          isEnabled={domain.status}
                          onToggle={() => handleToggleStatus(domain, !domain.status)}
                          size="default"
                          disabled={!domain.verified}
                          title={!domain.verified ? "Verify domain first" : domain.status ? "Disable domain" : "Enable domain"}
                        />
                      </div>
                    </div>

                    {/* DNS Configuration - Only show when not verified */}
                    {!domain.verified && (
                      <div className="mt-2 bg-gray-50 rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">Required DNS Configuration:</p>
                          <button onClick={() => handleVerifyDomain(domain)} className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1">
                            <GetIcon icon="reload" className="w-3 h-3" />
                            Verify Now
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div>
                            <p>
                              CNAME Record → cname.
                              {getAppConfig(domain.appType).rootDomain}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">DNS changes can take up to 48 hours to propagate</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(`cname.${getAppConfig(domain.appType).rootDomain}`)}
                            className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1"
                          >
                            <GetIcon icon="copy" className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Modify QR Code Modal */}
      {qrCodeData.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              {/* <h3 className="text-lg font-medium text-gray-900">QR Code</h3> */}
              <button onClick={handleCloseQRCode} className="text-gray-400 hover:text-gray-500">
                <GetIcon icon="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg mb-4">
                <QRCode id="qr-code-svg" value={`https://${qrCodeData.domain}`} size={200} level="H" />
              </div>
              <p className="text-sm text-gray-600 mb-4">{qrCodeData.domain}</p>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(qrCodeData.domain)} className="text-xs px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1">
                  <GetIcon icon="copy" className="w-3 h-3" />
                  Copy Link
                </button>
                <button onClick={handleDownloadQRCode} className="text-xs px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-full border border-green-200 flex items-center gap-1">
                  <GetIcon icon="download" className="w-3 h-3" />
                  Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainManager;
