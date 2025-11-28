import { useState, useEffect } from "react";
import { FolderOpen, FileText, Video } from "lucide-react";
import { getData, postData } from "../../../../backend/api";
import { useUser } from "../../../../contexts/UserContext";
import { PageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import { TabButtons } from "../../../core/elements";
import { GetIcon } from "../../../../icons";
import NoDataFound from "../../../core/list/nodata";
import { useToast } from "../../../core/toast";
import ListTable from "../../../core/list/list";

// Utility function for logging
const logAction = (action, details = {}) => {
  console.log(`[Resources] ${action}:`, {
    timestamp: new Date().toISOString(),
    ...details,
  });
};

const ShimmerTable = ({ rows = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-bg-weak rounded-lg">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="w-32 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="w-48 h-3 bg-gray-200 rounded mb-1 animate-pulse"></div>
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Resources(props) {
  const { exhibitorData } = props;
  const user = useUser();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState(null);
  const [currentExhibitorId, setCurrentExhibitorId] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);

  // Dynamic resource types
  const [resourceTypes, setResourceTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  // Get current exhibitor ID and event ID
  useEffect(() => {
    logAction("useEffect triggered for ID extraction", {
      props: props,
      user: user,
      exhibitorData: exhibitorData,
    });

    const getCurrentExhibitorId = () => {
      if (props?.user?.user?._id) {
        logAction("Retrieved exhibitor ID from props.user.user._id", { exhibitorId: props.user.user._id });
        return props.user.user._id;
      }

      if (props?.user?.userId) {
        logAction("Retrieved exhibitor ID from props.user.userId", { exhibitorId: props.user.userId });
        return props.user.userId;
      }

      if (exhibitorData?._id) {
        logAction("Retrieved exhibitor ID from exhibitorData._id", { exhibitorId: exhibitorData._id });
        return exhibitorData._id;
      }

      if (user?._id) {
        logAction("Retrieved exhibitor ID from user context", { exhibitorId: user._id });
        return user._id;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.userId) {
            logAction("Retrieved exhibitor ID from localStorage", { exhibitorId: userData.userId });
            return userData.userId;
          }
        } catch (error) {
          logAction("Error parsing user data from localStorage", { error: error.message });
        }
      }

      logAction("No valid exhibitor ID found");
      return null;
    };

    const getCurrentEventId = () => {
      if (props?.user?.user?.event?._id) {
        logAction("Retrieved event ID from props.user.user.event._id", { eventId: props.user.user.event._id });
        return props.user.user.event._id;
      }

      if (exhibitorData?.event?._id) {
        logAction("Retrieved event ID from exhibitorData.event._id", { eventId: exhibitorData.event._id });
        return exhibitorData.event._id;
      }

      if (exhibitorData?.event && typeof exhibitorData.event === "string") {
        logAction("Retrieved event ID from exhibitorData.event (string)", { eventId: exhibitorData.event });
        return exhibitorData.event;
      }

      logAction("No valid event ID found");
      return null;
    };

    const exhibitorId = getCurrentExhibitorId();
    const eventId = getCurrentEventId();

    logAction("Setting IDs", { exhibitorId: exhibitorId, eventId: eventId });

    setCurrentExhibitorId(exhibitorId);
    setCurrentEventId(eventId);
  }, [props, user, exhibitorData]);

  // Fetch resource types
  const fetchResourceTypes = async () => {
    if (!currentEventId) {
      setIsLoadingTypes(false);
      return;
    }

    try {
      logAction("Fetching resource types", { eventId: currentEventId });
      const response = await getData({ event: currentEventId }, "event-resource-types/master/select");
      
      logAction("Resource types response", {
        status: response.status,
        data: response.data,
      });

      if (response.status === 200) {
        const typesData = Array.isArray(response.data) ? response.data : [];
        setResourceTypes(typesData);
        
        // Set first tab as active if not already set
        if (typesData.length > 0 && !activeTab) {
          setActiveTab(typesData[0].id);
        }
      } else {
        setResourceTypes([]);
      }
    } catch (error) {
      logAction("Error fetching resource types", { error: error.message });
      toast.error("Failed to load resource types");
      setResourceTypes([]);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  // Fetch resource types when event ID is available
  useEffect(() => {
    if (currentEventId) {
      fetchResourceTypes();
    }
  }, [currentEventId]);

  // Helper function to get file type from URL
  const getFileTypeFromUrl = (url) => {
    if (!url) return "Document";
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'Video';
      case 'doc':
      case 'docx':
        return 'Document';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'Image';
      default:
        return 'Document';
    }
  };

  // Helper function to get full URL
  const getFullUrl = (attachment) => {
    if (!attachment) return "";
    if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
      return attachment;
    }
    const baseUrl = import.meta.env.VITE_API || 'http://localhost:5000/api';
    return `${baseUrl}${attachment}`;
  };

  // Handle download
  const handleDownload = async (item) => {
    try {
      const url = getFullUrl(item.attachment);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.title || "download";
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Increment download count if API supports it
      if (item._id) {
        try {
          await postData({}, `download/${item._id}/increment`);
        } catch (error) {
          console.error("Failed to increment download count:", error);
        }
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error("Failed to download file");
    }
  };

  // Handle delete resource
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      const response = await deleteData({ id: resourceId }, "download");
      if (response.status === 200) {
        toast.success("Resource deleted successfully");
        fetchExhibitorResources();
      } else {
        toast.error("Failed to delete resource");
      }
    } catch (error) {
      logAction("Error deleting resource", { error: error.message });
      toast.error("Failed to delete resource");
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'image':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return 'text-red-600 bg-red-100';
      case 'video':
        return 'text-purple-600 bg-purple-100';
      case 'image':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };



    // Custom card render function for ListTable matching the image design
  const ResourceCardRender = ({ data, actions, onClick }) => {
    const fileType = getFileTypeFromUrl(data.attachment || "");
    const typeColor = getTypeColor(fileType);
    const iconComponent = getTypeIcon(fileType);
    const resourceTypeName = data.resourceType?.value || "Document";
    
    return (
      <div 
        className="border border-stroke-soft rounded-lg p-4 hover:shadow-md transition-shadow bg-bg-white"
      >
        {/* Top section with icon and title/badge row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon on left */}
          <div className="p-2 bg-bg-weak rounded-lg flex-shrink-0 w-12 h-12 flex items-center justify-center">
            {iconComponent}
          </div>
          
          {/* Title and badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-text-main truncate">{data.title}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor} flex-shrink-0`}>
                {fileType}
              </span>
            </div>
            <span className="text-xs text-text-soft">{resourceTypeName}</span>
          </div>
        </div>
        
        {/* Description */}
        {data.description && (
          <p className="text-sm text-text-sub line-clamp-2 mb-4">{data.description}</p>
        )}
        
        {/* Bottom section with download count and button */}
        <div className="flex items-center justify-between pt-3 border-t border-stroke-soft">
          <span className="text-sm text-text-soft">{data.downloadCount || 0} downloads</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(data);
            }}
            className="bg-bg-white hover:bg-bg-weak text-text-main border border-stroke-soft px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <GetIcon icon="download" className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  };

  // Build dynamic tabs from resource types
  const tabs = resourceTypes.map((type) => ({
    key: type.id,
    title: type.value,
    icon: "file",
  }));

  // Define attributes for Event Resources ListTable
  const eventResourcesAttributes = [
    {
      type: "text",
      name: "title",
      label: "Title",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
    },
    {
      type: "textarea",
      name: "description",
      label: "Description",
      required: false,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
    },
    {
      type: "file",
      name: "attachment",
      label: "Attachment",
      required: true,
      tag: false,
      view: false,
      add: true,
      update: true,
      customClass: "full",
    },
    {
      type: "select",
      name: "resourceType",
      label: "Resource Type",
      required: false,
      tag: false,
      view: true,
      add: true,
      update: true,
      customClass: "full",
      apiType: "API",
      selectApi: `event-resource-types/master/select?event=${currentEventId}`,
      showItem: "value",
      saveItem: "id",
      collection: "value",
    },
    {
      type: "number",
      name: "downloadCount",
      label: "Download Count",
      required: false,
      tag: false,
      view: false,
      add: false,
      update: false,
      customClass: "half",
    },
  ];

  // No actions needed - button is rendered directly in card
  const eventResourcesActions = [];

  // Build preFilter for downloads based on active tab (resource type)
  const getDownloadsPreFilter = () => {
    if (!currentEventId || !activeTab) return null;
    
    return {
      event: currentEventId,
      resourceType: activeTab,
      // isExhibitor: false,
      skip: 0,
      limit: 100,
    };
  };

  // Exhibitor Resources card render (with delete button)
  const ExhibitorResourceCardRender = ({ data, actions, onClick }) => {
    const fileType = getFileTypeFromUrl(data.attachment || "");
    const typeColor = getTypeColor(fileType);
    const iconComponent = getTypeIcon(fileType);
    
    return (
      <div 
        className="border border-stroke-soft rounded-lg p-4 hover:shadow-md transition-shadow bg-bg-white"
      >
        {/* Top section with icon and title/badge row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon on left */}
          <div className="p-2 bg-bg-weak rounded-lg flex-shrink-0 w-12 h-12 flex items-center justify-center">
            {iconComponent}
          </div>
          
          {/* Title and badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-text-main truncate">{data.title}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor} flex-shrink-0`}>
                {fileType}
              </span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        {data.description && (
          <p className="text-sm text-text-sub line-clamp-2 mb-4">{data.description}</p>
        )}
        
        {/* Bottom section with buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-stroke-soft">
          <span className="text-sm text-text-soft">Your resource</span>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(data);
              }}
              className="bg-bg-white hover:bg-bg-weak text-text-main border border-stroke-soft px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <GetIcon icon="download" className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteResource(data._id);
              }}
              className="text-state-error hover:bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Floor Plans card render (similar but with Map icon)
  const FloorPlanCardRender = ({ data, actions, onClick }) => {
    return (
      <div 
        className="border border-stroke-soft rounded-lg p-4 hover:shadow-md transition-shadow bg-bg-white"
      >
        {/* Top section with icon and title */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon on left */}
          <div className="p-2 bg-bg-weak rounded-lg flex-shrink-0 w-12 h-12 flex items-center justify-center">
            <Map className="w-5 h-5 text-primary-base" />
          </div>
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-text-main truncate">{data.title}</h4>
          </div>
        </div>
        
        {/* Description */}
        {data.description && (
          <p className="text-sm text-text-sub line-clamp-2 mb-4">{data.description}</p>
        )}
        
        {/* Bottom section with button */}
        <div className="flex items-center justify-between pt-3 border-t border-stroke-soft">
          <span className="text-sm text-text-soft">Floor Plan</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(data);
            }}
            className="bg-bg-white hover:bg-bg-weak text-text-main border border-stroke-soft px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <GetIcon icon="download" className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  };

  // FAQ card render
  const FAQCardRender = ({ data, actions, onClick }) => {
    const category = data.type || 'General';
    
    return (
      <div 
        className="border border-stroke-soft rounded-lg p-4 hover:shadow-md transition-shadow bg-bg-white"
      >
        {/* Top section with icon and category badge */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon on left */}
          <div className="p-2 bg-bg-weak rounded-lg flex-shrink-0 w-12 h-12 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-base" />
          </div>
          
          {/* Category badge */}
          <div className="flex-1 min-w-0">
            <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100 inline-block">
              {category}
            </span>
          </div>
        </div>
        
        {/* Question */}
        <h4 className="font-medium text-text-main mb-2">{data.question}</h4>
        
        {/* Answer */}
        {data.answer && (
          <div 
            className="text-text-sub text-sm line-clamp-3"
            dangerouslySetInnerHTML={{ __html: data.answer }}
          />
        )}
      </div>
    );
  };

  // Show loading or error state if no event ID
  if (!currentEventId && !isLoadingTypes) {
    return (
      <RowContainer className="data-layout">
        <div className="flex flex-col w-full h-full bg-gray-50 items-center justify-center py-20">
          <div className="text-center">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load resources</h3>
            <p className="text-gray-500">Please ensure you have selected an event.</p>
          </div>
        </div>
      </RowContainer>
    );
  }


  return (
    <RowContainer className="data-layout">
      {/* Header */}
      <PageHeader title="Resources" description="Access event resources and downloads by category" line={false} />

      {/* Tabs */}
      {isLoadingTypes ? (
        <div className="mb-4">
          <ShimmerTable rows={1} />
        </div>
      ) : tabs.length > 0 ? (
        <div className="mb-0" style={{ marginBottom: 0 }}>
          <TabButtons 
            tabs={tabs} 
            selectedTab={activeTab} 
            selectedChange={setActiveTab}
            design="underline"
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-soft">No resource types available</p>
        </div>
      )}

      {/* Content */}
      <div style={{ marginTop: 0, paddingTop: 0 }}>
        {activeTab && getDownloadsPreFilter() && (
          <div className="mt-0" style={{ marginTop: 0, paddingTop: 0 }}>
            {/* Hide search icon and refresh button in resources section */}
            <style>{`
              /* Remove spacing between TabButtons and ListTable */
              .data-layout > div:has(> nav[aria-label="Tabs"]) {
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
              }
              .data-layout > div:has(> nav[aria-label="Tabs"]) > div {
                margin-bottom: 0 !important;
              }
              .data-layout > div:has(> nav[aria-label="Tabs"]) nav {
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
              }
              .data-layout > div:has(> .resources-page-section),
              .data-layout > div:has(> div > .resources-page-section) {
                margin-top: 0 !important;
                padding-top: 0 !important;
              }
              .resources-page-section {
                margin-top: 0 !important;
                padding-top: 0 !important;
              }
              .resources-page-section .flex.left > div:has(input[name="search-1"]) {
                display: none !important;
              }
              .resources-page-section .flex.left > div:has(> div > svg[data-icon="search"]) {
                display: none !important;
              }
              .resources-page-section input[type="text"][name="search-1"][placeholder="Search"] {
                display: none !important;
              }
              /* Hide refresh/reload button - multiple selectors for better compatibility */
              .resources-page-section .flex.left button svg[viewBox="0 0 512 512"],
              .resources-page-section .ButtonPanel .flex.left button svg[viewBox="0 0 512 512"] {
                display: none !important;
              }
              .resources-page-section .flex.left button:has(svg[viewBox="0 0 512 512"]),
              .resources-page-section .ButtonPanel .flex.left button:has(svg[viewBox="0 0 512 512"]) {
                display: none !important;
              }
              /* Fallback: Hide button that only contains SVG with viewBox 512x512 (reload icon) */
              .resources-page-section .flex.left > button:has(> svg[viewBox="0 0 512 512"]:only-child) {
                display: none !important;
              }
              /* Additional selector: target button that is sibling before Search component */
              .resources-page-section .flex.left > button:nth-of-type(2):not(:has(span)) {
                display: none !important;
              }
            `}</style>
            <div className="resources-page-section">
            <ListTable
              key={`downloads-${currentEventId}-${activeTab}`}
              api="download"
              itemTitle={{
                name: "title",
                type: "text",
                collection: "",
              }}
              shortName="Resources"
              formMode="single"
              preFilter={getDownloadsPreFilter()}
              viewMode="list"
              displayColumn="triple"
              attributes={eventResourcesAttributes}
              actions={eventResourcesActions}
              ListItemRender={ResourceCardRender}
              showSearch={false}
              showTitle={false}
              addPrivilege={false}
              delPrivilege={false}
              updatePrivilege={false}
              dotMenu={false}
              {...props}
            />
            </div>
          </div>
        )}
        
        {!activeTab && !isLoadingTypes && resourceTypes.length === 0 && (
          <NoDataFound 
            title="No Resources Available"
            description="There are no resource types configured for this event."
          />
        )}
      </div>
    </RowContainer>
  );
}

