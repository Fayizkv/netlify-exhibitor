import { useState, useEffect } from "react";
import { FolderOpen, FileText, HelpCircle, Video, Trash2, Map, Search as SearchIcon, ChevronUp, ChevronDown } from "lucide-react";
import { getData, postData, deleteData } from "../../../../backend/api";
import { useUser } from "../../../../contexts/UserContext";
import { RowContainer } from "../../../styles/containers/styles";
import { GetIcon } from "../../../../icons";
import { useToast } from "../../../core/toast";
import { PageHeader } from "../../../core/input/heading";

// Utility function for logging
const logAction = (action, details = {}) => {
  console.log(`[Resources] ${action}:`, {
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Shimmer components
const ShimmerStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-bg-white rounded-xl shadow-sm border border-stroke-soft p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
          <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-32 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

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

  const [activeTab, setActiveTab] = useState("resources");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentExhibitorId, setCurrentExhibitorId] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);

  // Data states
  const [downloads, setDownloads] = useState([]);
  const [exhibitorResources, setExhibitorResources] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [expandedFaqId, setExpandedFaqId] = useState(null);

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
        // console.log(props, "props in event id");
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

  // Fetch downloads (Event Resources - excluding exhibitor resources)
  const fetchDownloads = async () => {
    if (!currentEventId) {
      setIsLoading(false);
      return;
    }

    try {
      logAction("Fetching downloads", { eventId: currentEventId });
      const response = await getData({ event: currentEventId }, "download");
      
      logAction("Downloads response", {
        status: response.status,
        data: response.data,
      });

      if (response.status === 200) {
        // Handle different response structures: response.data, response.data.data, or response.data.response
        const downloadsData = response.data?.data || response.data?.response || (Array.isArray(response.data) ? response.data : []);
        setDownloads(Array.isArray(downloadsData) ? downloadsData : []);
      } else {
        setDownloads([]);
      }
    } catch (error) {
      logAction("Error fetching downloads", { error: error.message });
      toast.error("Failed to load downloads");
      setDownloads([]);
    }
  };

  // Fetch exhibitor resources (My Resources)
  const fetchExhibitorResources = async () => {
    if (!currentEventId || !currentExhibitorId) {
      setIsLoading(false);
      return;
    }

    try {
      logAction("Fetching exhibitor resources", { eventId: currentEventId, exhibitorId: currentExhibitorId });
      const response = await getData({ event: currentEventId, exhibitor: currentExhibitorId }, "download");
      
      logAction("Exhibitor resources response", {
        status: response.status,
        data: response.data,
      });

      if (response.status === 200) {
        const resourcesData = response.data?.response || response.data?.data || [];
        setExhibitorResources(Array.isArray(resourcesData) ? resourcesData : []);
      } else {
        setExhibitorResources([]);
      }
    } catch (error) {
      logAction("Error fetching exhibitor resources", { error: error.message });
      toast.error("Failed to load exhibitor resources");
      setExhibitorResources([]);
    }
  };

  // Fetch floor plans
  const fetchFloorPlans = async () => {
    if (!currentEventId) {
      setIsLoading(false);
      return;
    }

    try {
      logAction("Fetching floor plans", { eventId: currentEventId });
      const response = await getData({ event: currentEventId }, "floor-plan");
      
      logAction("Floor plans response", {
        status: response.status,
        data: response.data,
      });

      if (response.status === 200) {
        const floorPlansData = response.data?.response || response.data?.data || [];
        setFloorPlans(Array.isArray(floorPlansData) ? floorPlansData : []);
      } else {
        setFloorPlans([]);
      }
    } catch (error) {
      logAction("Error fetching floor plans", { error: error.message });
      toast.error("Failed to load floor plans");
      setFloorPlans([]);
    }
  };

  // Fetch FAQs with search and type filters
  const fetchFAQs = async () => {
    if (!currentEventId) {
      setIsLoading(false);
      return;
    }

    try {
      logAction("Fetching FAQs", { eventId: currentEventId, searchTerm });
      const queryParams = {
        event: currentEventId,
        skip: 0,
        limit: 100
      };
      
      // Add search key if provided
      if (searchTerm) {
        queryParams.searchkey = searchTerm;
      }
      
      const response = await getData(queryParams, "faq");
      
      logAction("FAQs response", {
        status: response.status,
        data: response.data,
      });

      if (response.status === 200) {
        const faqsData = response.data?.response || response.data?.data || [];
        setFaqs(Array.isArray(faqsData) ? faqsData : []);
      } else {
        setFaqs([]);
      }
    } catch (error) {
      logAction("Error fetching FAQs", { error: error.message });
      toast.error("Failed to load FAQs");
      setFaqs([]);
    }
  };

  // Load data for tabs that don't use ListTable (exhibitor resources)
  useEffect(() => {
    if (currentEventId) {
      setIsLoading(true);
      Promise.all([
        fetchExhibitorResources(),
        fetchFloorPlans(), // Keep for My Resources tab
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [currentEventId, currentExhibitorId]);

  // Fetch FAQs when event ID, search term, or selected type changes
  useEffect(() => {
    if (currentEventId) {
      setIsLoading(true);
      fetchFAQs().finally(() => {
        setIsLoading(false);
      });
    }
  }, [currentEventId, searchTerm]);

  // Reset expanded state whenever the FAQ dataset changes to keep the UI predictable
  useEffect(() => {
    setExpandedFaqId(null);
  }, [faqs]);

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

  // Build preFilter for Event Resources ListTable (event resources only)
  const eventResourcesPreFilter = currentEventId
    ? {
        event: currentEventId,
        skip: 0,
        limit: 100,
      }
    : null;

  // Build preFilter for Exhibitor Resources ListTable
  const exhibitorResourcesPreFilter = currentEventId && currentExhibitorId
    ? {
        event: currentEventId,
        exhibitor: currentExhibitorId,
        skip: 0,
        limit: 100,
      }
    : null;

  // Build preFilter for Floor Plans ListTable
  const floorPlansPreFilter = currentEventId
    ? {
        event: currentEventId,
        skip: 0,
        limit: 100,
      }
    : null;

  // Build preFilter for FAQs ListTable
  const faqsPreFilter = currentEventId
    ? {
        event: currentEventId,
        skip: 0,
        limit: 100,
      }
    : null;

  // Define attributes for Floor Plans ListTable
  const floorPlansAttributes = [
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
  ];

  // Define attributes for FAQs ListTable
  const faqsAttributes = [
    {
      type: "text",
      name: "question",
      label: "Question",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
    },
    {
      type: "text",
      name: "answer",
      label: "Answer",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
    },
    {
      type: "select",
      name: "type",
      label: "Type",
      required: false,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
      filter: true,
      filterPosition: "left",
      filterType: "single",
      apiType: "API",
      selectApi: `faq-types/master/select?event=${currentEventId}`,
      showItem: "value",
      saveItem: "id",
      collection: "faqType",
    },
  ];

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

  // Toggle FAQ accordion
  const toggleFaq = (faqId) => {
    setExpandedFaqId((prev) => (prev === faqId ? null : faqId));
  };

  // FAQ accordion component mirroring the provided inspiration layout
  const FAQAccordion = ({ faqs }) => {
    if (!faqs || faqs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-stroke-soft bg-bg-weak">
          <HelpCircle className="w-12 h-12 text-text-soft mb-4" />
          <p className="text-text-sub">No FAQs available for this event yet.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq) => {
          const isExpanded = expandedFaqId === faq._id;

          return (
            <div
              key={faq._id}
              className="rounded-2xl border border-stroke-soft px-5 py-3"
            >
              <button
                onClick={() => toggleFaq(faq._id)}
                className="flex w-full items-center justify-between gap-3 text-left"
                data-testid={`faq-card-${faq._id}`}
                aria-expanded={isExpanded}
              >
                <h4 className="flex-1 text-base font-medium text-text-main">
                  {faq.question}
                </h4>
                <span className="flex-shrink-0 text-text-main transition-transform">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </span>
              </button>

              {isExpanded && faq.answer && (
                <div className="mt-3 text-sm leading-relaxed text-text-sub">
                  <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Show loading or error state if no event ID
  if ((!currentEventId) && !isLoading) {
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
      <PageHeader 
        title="Frequently Asked Questions" 
        line={false} 
        description="Find quick answers about onboarding, plan limits, billing, and more—everything you need to get started smoothly."
      />

      <div className="space-y-8">
        {/* Search and filter row to match the minimal mock */}
        <div className="relative flex-1 max-w-5xl">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a question"
            className="w-full border-b border-stroke-soft bg-transparent py-3 pl-10 pr-3 text-base text-text-main placeholder:text-text-soft focus:border-text-main focus:outline-none"
            data-testid="faq-search-input"
            aria-label="Search FAQs"
          />
        </div>

        <div className="max-w-5xl">
          {isLoading ? (
            <ShimmerTable rows={5} />
          ) : currentEventId ? (
            <FAQAccordion faqs={faqs} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="mb-4 h-16 w-16 text-text-soft" />
              <p className="text-text-sub">Please select an event to view FAQs</p>
            </div>
          )}
        </div>
      </div>
    </RowContainer>
  );
}

