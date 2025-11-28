import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useUser } from "../../../../contexts/UserContext";
import { GetIcon } from "../../../../icons";
import { RowContainer } from "../../../styles/containers/styles";
import ListTable from "../../../core/list/list";
import { getCountries } from "../event/attributes/countries";
import { getData } from "../../../../backend/api";
import { useToast } from "../../../core/toast";
import { useMessage } from "../../../core/message/useMessage";
import MetricTile from "../../../core/metricTile";

// Utility function for logging
const logAction = (action, details = {}) => {
  console.log(`[Team Management] ${action}:`, {
    timestamp: new Date().toISOString(),
    ...details,
  });
};


// Main component
export default function Team(props) {
  const { exhibitorData } = props;
  console.log(props, "props");
  const user = useUser(); // Get current user from context

  // Log exhibitor data for debugging
  useEffect(() => {
    logAction("Team Management component mounted", {
      exhibitorData: exhibitorData,
      user: user,
      exhibitorDataKeys: exhibitorData ? Object.keys(exhibitorData) : null,
      userKeys: user ? Object.keys(user) : null,
    });
  }, [exhibitorData, user]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentExhibitorId, setCurrentExhibitorId] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [exhibitorPassesLimit, setExhibitorPassesLimit] = useState(null); // Category passes limit
  const [exhibitorOwnPasses, setExhibitorOwnPasses] = useState(null); // Exhibitor's own passes (if added)
  const [canAddMore, setCanAddMore] = useState(true);
  const [addedCount, setAddedCount] = useState(0); // Track ADDED count from API
  const addedCountRef = useRef(0); // Ref to track last added count to prevent unnecessary updates
  const toast = useToast();
  const { showMessage } = useMessage(); // Get showMessage from useMessage hook
  
  // Create setMessage function that wraps showMessage for ListTable compatibility
  // This ensures setMessage is always available and prevents "setMessage is not a function" errors
  const setMessage = useCallback((messageContent) => {
    if (showMessage && typeof showMessage === "function") {
      showMessage(messageContent);
    } else if (props?.setMessage && typeof props.setMessage === "function") {
      // Fallback to props.setMessage if available
      props.setMessage(messageContent);
    } else {
      // Final fallback: use browser confirm for critical actions
      console.warn("[Team Management] setMessage not available, using fallback");
      if (messageContent?.type === 2 && messageContent?.content) {
        // For confirmation dialogs, use browser confirm
        if (window.confirm(messageContent.content)) {
          if (messageContent?.onProceed) {
            messageContent.onProceed();
          }
        } else if (messageContent?.onClose) {
          messageContent.onClose();
        }
      }
    }
  }, [showMessage, props]);

  // Get current exhibitor ID and event ID
  useEffect(() => {
    logAction("useEffect triggered for ID extraction", {
      props: props,
      user: user,
      exhibitorData: exhibitorData,
      propsUser: props?.user,
      propsUserUser: props?.user?.user,
      userKeys: user ? Object.keys(user) : null,
      exhibitorDataKeys: exhibitorData ? Object.keys(exhibitorData) : null,
    });

    const getCurrentExhibitorId = () => {
      // First, try to get from props.user.user._id (from props structure)
      if (props?.user?.user?._id) {
        logAction("Retrieved exhibitor ID from props.user.user._id", { exhibitorId: props.user.user._id });
        return props.user.user._id;
      }

      // Try to get from props.user.userId
      if (props?.user?.userId) {
        logAction("Retrieved exhibitor ID from props.user.userId", { exhibitorId: props.user.userId });
        return props.user.userId;
      }

      // Try to get from exhibitorData (the exhibitor we're managing)
      if (exhibitorData?._id) {
        logAction("Retrieved exhibitor ID from exhibitorData._id", { exhibitorId: exhibitorData._id });
        return exhibitorData._id;
      }

      // Try to get from user context as fallback
      if (user?._id) {
        logAction("Retrieved exhibitor ID from user context (fallback)", { exhibitorId: user._id });
        return user._id;
      }

      // Try to get from localStorage as last fallback
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.userId) {
            logAction("Retrieved exhibitor ID from localStorage (fallback)", { exhibitorId: userData.userId });
            return userData.userId;
          }
        } catch (error) {
          logAction("Error parsing user data from localStorage", { error: error.message });
        }
      }

      logAction("No valid exhibitor ID found", { props: props, user: user, exhibitorData: exhibitorData });
      return null;
    };

    const getCurrentEventId = () => {
      logAction("Getting current event ID", {
        props: props,
        exhibitorData: exhibitorData,
        exhibitorDataEvent: exhibitorData?.event,
        exhibitorDataId: exhibitorData?._id,
        propsUserEvent: props?.user?.user?.event,
        exhibitorDataEventKeys: exhibitorData?.event ? Object.keys(exhibitorData.event) : null,
      });

      // First, try to get from props.user.user.event._id (from props structure)
      if (props?.user?.user?.event?._id) {
        logAction("Retrieved event ID from props.user.user.event._id", { eventId: props.user.user.event._id });
        return props.user.user.event._id;
      }

      // Try to get event ID from exhibitorData.event._id (populated event object)
      if (exhibitorData?.event?._id) {
        logAction("Retrieved event ID from exhibitorData.event._id", { eventId: exhibitorData.event._id });
        return exhibitorData.event._id;
      }

      // Try to get from exhibitorData.event (if it's just the ID string)
      if (exhibitorData?.event && typeof exhibitorData.event === "string") {
        logAction("Retrieved event ID from exhibitorData.event (string)", { eventId: exhibitorData.event });
        return exhibitorData.event;
      }

      logAction("No valid event ID found", { props: props, exhibitorData: exhibitorData });
      return null;
    };

    const exhibitorId = getCurrentExhibitorId();
    const eventId = getCurrentEventId();

    logAction("Setting IDs", { exhibitorId: exhibitorId, eventId: eventId });

    setCurrentExhibitorId(exhibitorId);
    setCurrentEventId(eventId);
  }, [props, user, exhibitorData]);

  // Fetch exhibitor record and category to get exhibitorPasses limit
  // Priority: exhibitor's own exhibitorPasses > category's exhibitorPasses
  useEffect(() => {
    const fetchExhibitorData = async () => {
      if (!currentExhibitorId || !currentEventId) return;

      try {
        // First, try to get exhibitor data from props/exhibitorData
        let exhibitorRecord = exhibitorData;
        let exhibitorCategoryId = exhibitorData?.exhibitorCategory?._id || 
                                  exhibitorData?.exhibitorCategory ||
                                  props?.user?.user?.exhibitorCategory?._id ||
                                  props?.user?.user?.exhibitorCategory;

        // If exhibitor record not available or missing category, fetch from API
        if (!exhibitorRecord || !exhibitorCategoryId) {
          const exhibitorResponse = await getData({ id: currentExhibitorId }, "ticket-registration/exhibitor");
          console.log("exhibitorResponse:", exhibitorResponse);
          if (exhibitorResponse.status === 200 && exhibitorResponse.data?.response) {
            console.log("Fetched exhibitor record to get passes and category ID");
            exhibitorRecord = exhibitorResponse.data.response;
            exhibitorCategoryId = exhibitorRecord?.exhibitorCategory?._id || exhibitorRecord?.exhibitorCategory;
            console.log("exhibitorCategoryId from exhibitor record:", exhibitorCategoryId);
          }
        }

        // Check if exhibitor has its own exhibitorPasses (additional passes added)
        // This takes priority over category passes
        if (exhibitorRecord?.exhibitorPasses !== undefined && exhibitorRecord?.exhibitorPasses !== null) {
          const ownPasses = Number(exhibitorRecord.exhibitorPasses);
          setExhibitorOwnPasses(ownPasses);
          console.log("[Team Management] Set exhibitorOwnPasses to:", ownPasses);
          logAction("Exhibitor own passes found", { 
            exhibitorId: currentExhibitorId,
            exhibitorPasses: ownPasses
          });
        } else {
          // No own passes, will use category passes
          setExhibitorOwnPasses(null);
          logAction("Exhibitor has no own passes, will use category passes", { 
            exhibitorId: currentExhibitorId
          });
        }

        // Fetch exhibitor category to get base passes limit (fallback if no own passes)
        if (exhibitorCategoryId) {
          const categoryResponse = await getData(
            { id: exhibitorCategoryId },
            "exhibitor-category"
          );

          if (categoryResponse.status === 200 && categoryResponse.data?.success) {
            const category = categoryResponse.data.response;
            
            logAction("Fetched exhibitor category", { 
              exhibitorCategoryId,
              categoryName: category.categoryName,
              exhibitorPasses: category.exhibitorPasses
            });

            if (category?.exhibitorPasses !== undefined && category?.exhibitorPasses !== null) {
              const passes = Number(category.exhibitorPasses);
              setExhibitorPassesLimit(passes);
              console.log("[Team Management] Set exhibitorPassesLimit (category) to:", passes);
              logAction("Exhibitor category loaded", { 
                categoryName: category.categoryName,
                exhibitorPasses: passes,
                categoryId: category._id
              });
            }
          } else {
            logAction("Failed to fetch exhibitor category", { 
              status: categoryResponse?.status,
              data: categoryResponse?.data
            });
          }
        }
      } catch (error) {
        console.error("[Team Management] Error fetching exhibitor data:", error);
        logAction("Error fetching exhibitor data", { error: error.message, stack: error.stack });
      }
    };

    fetchExhibitorData();
  }, [currentExhibitorId, currentEventId, exhibitorData, props]);

  // Memoize the total booth-member allocation limit
  // Priority: exhibitor's own exhibitorPasses > category's exhibitorPasses
  const totalAllocationLimit = useMemo(() => {
    // If exhibitor has its own passes (additional passes added), use that
    if (exhibitorOwnPasses !== null && Number.isFinite(exhibitorOwnPasses)) {
      const limit = Number(exhibitorOwnPasses);
      logAction("Using exhibitor's own passes for allocation limit", { 
        exhibitorOwnPasses: limit,
        categoryPasses: exhibitorPassesLimit
      });
      return limit;
    }
    
    // Otherwise, use category's exhibitorPasses (base limit)
    if (Number.isFinite(exhibitorPassesLimit)) {
      const limit = Number(exhibitorPassesLimit);
      logAction("Using category passes for allocation limit", { 
        categoryPasses: limit,
        exhibitorOwnPasses: exhibitorOwnPasses
      });
      return limit;
    }
    
    // Default to 0 if neither is available
    return 0;
  }, [exhibitorOwnPasses, exhibitorPassesLimit]);

  // Calculate if we can add more booth members based on ADDED count and ALLOCATED limit
  useEffect(() => {
    if (Number.isFinite(totalAllocationLimit)) {
      // Use ADDED count from API (more accurate than teamMembers.length)
      // Use ref value to get the latest count without causing re-renders
      const currentAdded = addedCountRef.current;
      const canAdd = currentAdded < totalAllocationLimit;
      setCanAddMore(canAdd);
      logAction("Booth member limit check", {
        addedCount: currentAdded,
        limit: totalAllocationLimit,
        canAddMore: canAdd,
        message: "Add privilege disabled when addedCount >= totalAllocationLimit"
      });
    } else {
      // If limit not loaded yet, allow adding (will be checked on submit)
      setCanAddMore(true);
    }
  }, [addedCount, totalAllocationLimit]);

  // Debug: Log when exhibitorPassesLimit changes
  useEffect(() => {
    console.log("[Team Management] exhibitorPassesLimit (category) changed:", exhibitorPassesLimit);
    logAction("exhibitorPassesLimit state changed", { exhibitorPassesLimit });
  }, [exhibitorPassesLimit]);

  // Debug: Log when exhibitorOwnPasses changes
  useEffect(() => {
    console.log("[Team Management] exhibitorOwnPasses changed:", exhibitorOwnPasses);
    logAction("exhibitorOwnPasses state changed", { exhibitorOwnPasses });
  }, [exhibitorOwnPasses]);

  // Debug: Log when totalAllocationLimit changes
  useEffect(() => {
    console.log("[Team Management] totalAllocationLimit changed:", totalAllocationLimit);
    logAction("totalAllocationLimit changed", { 
      totalAllocationLimit,
      exhibitorOwnPasses,
      exhibitorPassesLimit,
      source: exhibitorOwnPasses !== null ? "exhibitor" : "category"
    });
  }, [totalAllocationLimit, exhibitorOwnPasses, exhibitorPassesLimit]);

  // Handle data loaded from ListTable
  const handleDataLoaded = (data) => {
    logAction("ListTable data loaded", { count: data?.length || 0 });
    setTeamMembers(data || []);
  };


  // Debug logging for troubleshooting
  useEffect(() => {
    console.log("user context:", user);
    console.log("props:", props);
    console.log("exhibitorData prop:", exhibitorData);
    console.log("Current Exhibitor ID:", currentExhibitorId);
    console.log("Current Event ID:", currentEventId);
  }, [currentExhibitorId, currentEventId, props, user, exhibitorData]);





  // Utility: normalize backend metric payloads into reliable numeric counts
  const extractMetricCount = useCallback((metricValue) => {
    // All metric responses must be converted to numbers to keep privilege toggles accurate
    if (typeof metricValue === "number" && Number.isFinite(metricValue)) {
      return metricValue;
    }
    if (typeof metricValue === "string" && metricValue.trim().length > 0) {
      const parsed = Number(metricValue);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    if (metricValue && typeof metricValue === "object") {
      if (metricValue.count !== undefined) {
        return extractMetricCount(metricValue.count);
      }
      if (metricValue.value !== undefined) {
        return extractMetricCount(metricValue.value);
      }
    }
    return 0;
  }, []);

  // Custom MetricTile renderer to override "allocatedBoothMember" with dynamic allocation limit
  // This must be defined before any conditional returns to follow React hooks rules
  // "ALLOCATED BOOTH MEMBER" should show: exhibitor's own exhibitorPasses OR category's exhibitorPasses
  // "PENDING" should be calculated as ALLOCATED - ADDED (remaining slots available)
  const MetricTileOverride = useCallback(
    ({ labels, data }) => {
      // Create a new data object with all the original counts
      const overrideData = { ...data };
      
      // Get the current ADDED count from backend response
      const currentAddedCount = extractMetricCount(data?.added);
      
      // Update the ref and state for addPrivilege check
      // This ensures we're using the accurate count from the API
      if (currentAddedCount !== addedCountRef.current) {
        addedCountRef.current = currentAddedCount;
        // Update state to trigger canAddMore recalculation
        setAddedCount(currentAddedCount);
      }
      
      // Override allocatedBoothMember with totalAllocationLimit (exhibitor's own passes OR category passes)
      // This represents the maximum number of booth members that can be added
      let allocatedCount = extractMetricCount(data?.allocatedBoothMember);
      if (Number.isFinite(totalAllocationLimit)) {
        allocatedCount = Number(totalAllocationLimit);
        overrideData.allocatedBoothMember = {
          count: allocatedCount,
        };
      } else {
        overrideData.allocatedBoothMember = {
          count: allocatedCount,
        };
      }
      
      // Calculate PENDING as ALLOCATED - ADDED (remaining slots available)
      // This represents how many more booth members can be added
      const safeAllocatedCount = Number.isFinite(allocatedCount) ? allocatedCount : 0;
      const safeAddedCount = Number.isFinite(currentAddedCount) ? currentAddedCount : 0;
      const pendingCount = Math.max(0, safeAllocatedCount - safeAddedCount);
      overrideData.pending = {
        count: pendingCount,
      };
      
      // Debug logging
      console.log("[Team Management] MetricTileOverride - Counts:", {
        exhibitorOwnPasses,
        exhibitorPassesLimit,
        totalAllocationLimit,
        allocatedCount,
        currentAddedCount,
        pendingCount,
        originalAllocated: data?.allocatedBoothMember?.count || data?.allocatedBoothMember,
        originalPending: data?.pending?.count || data?.pending,
        message: "ALLOCATED = exhibitor's own passes (if exists) OR category passes, PENDING = ALLOCATED - ADDED"
      });
      
      logAction("MetricTileOverride - Counts override", {
        exhibitorOwnPasses,
        exhibitorPassesLimit,
        totalAllocationLimit,
        allocatedCount,
        currentAddedCount,
        pendingCount,
        originalAllocated: data?.allocatedBoothMember?.count || data?.allocatedBoothMember,
        originalPending: data?.pending?.count || data?.pending,
      });
      
      return <MetricTile labels={labels} data={overrideData} />;
    },
    [exhibitorOwnPasses, exhibitorPassesLimit, totalAllocationLimit, addedCount, extractMetricCount]
  );

  // Render function for designation/role
  const renderDesignation = (value, data, attribute) => {
    const designation = data?.designation || "";

    return designation ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium text-text-sub bg-bg-weak">
        {designation}
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium text-text-sub bg-bg-weak">
        Booth Member
      </span>
    );
  };

  // Counts will be fetched from backend API response

  // Show loading or error state if no exhibitor ID or event ID
  if (!currentExhibitorId || !currentEventId) {
    return (
      <RowContainer className="data-layout">
        <div className="flex flex-col w-full h-full bg-bg-weak items-center justify-center min-h-[400px]">
          <div className="text-center">
            <GetIcon icon="user" className="w-16 h-16 text-text-disabled mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-main mb-2">Unable to load team management</h3>
            <p className="text-text-sub">
              {!currentExhibitorId && !currentEventId
                ? "Please ensure you are logged in as an exhibitor and have selected an event."
                : !currentExhibitorId
                  ? "Please ensure you are logged in as an exhibitor."
                  : "Please ensure you have selected an event."}
            </p>
          </div>
        </div>
      </RowContainer>
    );
  }

  // Define attributes for ListTable
  const attributes = [
    {
      type: "text",
      name: "fullName",
      label: "Member Name",
      required: false,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
      image: { type: "image", field: "profileImage", collection: "" },
      // render: renderMemberName,
    },
    {
      type: "text",
      name: "designation",
      label: "Designation",
      required: false,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "half",
      render: renderDesignation,
    },
    {
      type: "image",
      name: "profileImage",
      label: "Profile Image",
      required: false,
      tag: false,
      view: true,
      add: true,
      update: true,
    },


    {
      type: "text",
      name: "emailId",
      label: "Email ID",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "mobilenumber",
      name: "authenticationId",
      label: "Mobile Number",
      required: false,
      tag: true,
      view: true,
      add: true,
      update: true,
      icon: "mobilenumber",
      // Get countries from event data if available, otherwise use all countries
      countries: getCountries(exhibitorData?.event?.countries || []),
    },
   
  ];

  // Build preFilter for ListTable
  const preFilter = {
    parentExhibitor: currentExhibitorId,
    searchkey: "",
    ...(currentEventId && { event: currentEventId }),
    skip: 0,
    limit: 100,
  };

  // Build parents for ListTable
  const parents = {
    parentExhibitor: currentExhibitorId,
    ...(currentEventId && { event: currentEventId }),
  };

  // MetricTile configuration - matching dashboard design
  // ListTable will automatically use counts from backend API response
  const metricLabels = [
    {
      key: "allocatedBoothMember",
      title: "ALLOCATED BOOTH MEMBER",
      icon: "user-plus",
      backgroundColor: "#e2f6e6",
      color: "#016a27",
    },
    {
      key: "added",
      title: "ADDED",
      icon: "star",
      backgroundColor: "#ffe5e2",
      color: "#99231b",
    },
    {
      key: "pending",
      title: "PENDING",
      icon: "time",
      backgroundColor: "#deebff",
      color: "#004999",
    },
  ];

  return (
    <RowContainer className="data-layout">  
      {/* ListTable for Booth Members - MetricTile will be rendered automatically using labels prop */}
      <ListTable
        key={`booth-members-${currentExhibitorId}-${currentEventId}`}
        api="ticket-registration/boothmember"
        labels={metricLabels}
        MetricTileRender={MetricTileOverride}
        itemTitle={{
          name: "fullName",
          type: "text",
          collection: "",
        }}
        shortName="Booth Members"
        formMode="single"
        preFilter={preFilter}
        setMessage={setMessage}
        {...props}
        parents={parents}
        onDataLoaded={handleDataLoaded}
        bulkUplaod={false}
        // Enable inline privileges so edit/delete appear inside the dot menu (default rendering)
        updatePrivilege={true}
        delPrivilege={true}
        exportPrivilege={false}
        viewMode="table"
        attributes={attributes}
        showSearch={false}
        addPrivilege={canAddMore}
      />
    </RowContainer>
  );
}
