import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../../../contexts/UserContext";
import { PageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons";
import MetricTile from "../../../core/metricTile";
import { Button } from "../../../core/elements";
import ListTable from "../../../core/list/list";
import { getData } from "../../../../backend/api";

// Utility function for logging
const logAction = (action, details = {}) => {
  console.log(`[Lead Management] ${action}:`, {
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Main component
export default function LeadManagement(props) {
  const { exhibitorData } = props;
  const user = useUser();
  const toast = useToast();

  const [leads, setLeads] = useState([]);
  const [currentExhibitorId, setCurrentExhibitorId] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [shouldFilterByEvent, setShouldFilterByEvent] = useState(false);
  const [leadSummaryFromApi, setLeadSummaryFromApi] = useState(null);
  const [isLeadSummaryLoading, setIsLeadSummaryLoading] = useState(false);

  // Get current exhibitor ID and event ID
  useEffect(() => {
    logAction("useEffect triggered for ID extraction", {
      props: props,
      user: user,
      exhibitorData: exhibitorData,
      propsUser: props?.user,
      propsUserUser: props?.user?.user,
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

      // Try to get from exhibitorData
      if (exhibitorData?._id) {
        logAction("Retrieved exhibitor ID from exhibitorData._id", { exhibitorId: exhibitorData._id });
        return exhibitorData._id;
      }

      // Try to get from user context
      if (user?._id) {
        logAction("Retrieved exhibitor ID from user context", { exhibitorId: user._id });
        return user._id;
      }

      return null;
    };

    const getCurrentEventId = () => {
      // First, try to get from props.user.user.event._id
      if (props?.user?.user?.event?._id) {
        logAction("Retrieved event ID from props.user.user.event._id", { eventId: props.user.user.event._id });
        return props.user.user.event._id;
      }

      // Try to get from exhibitorData.event._id
      if (exhibitorData?.event?._id) {
        logAction("Retrieved event ID from exhibitorData.event._id", { eventId: exhibitorData.event._id });
        return exhibitorData.event._id;
      }

      // Try to get from exhibitorData.event (if string)
      if (exhibitorData?.event && typeof exhibitorData.event === "string") {
        logAction("Retrieved event ID from exhibitorData.event (string)", { eventId: exhibitorData.event });
        return exhibitorData.event;
      }

      return null;
    };

    const exhibitorId = getCurrentExhibitorId();
    const eventId = getCurrentEventId();

    setCurrentExhibitorId(exhibitorId);
    setCurrentEventId(eventId);
  }, [props, user, exhibitorData]);

  // Auto-toggle event-based filtering whenever the resolved event changes
  useEffect(() => {
    setShouldFilterByEvent(Boolean(currentEventId));
  }, [currentEventId]);

  // Calculate fallback counts from the currently loaded leads data
  const localPriorityCounts = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        const priority = lead?.priority || "medium";
        acc.total += 1;
        if (priority === "high") {
          acc.high += 1;
        } else if (priority === "low") {
          acc.low += 1;
        } else {
          acc.medium += 1;
        }
        return acc;
      },
      { total: 0, high: 0, medium: 0, low: 0 }
    );
  }, [leads]);

  const fallbackLeadCounts = useMemo(
    () => ({
      ...localPriorityCounts,
      manual: 0,
      exhibitor: localPriorityCounts.total,
    }),
    [localPriorityCounts]
  );

  const resolvedLeadCounts = leadSummaryFromApi || fallbackLeadCounts;

  const metricData = useMemo(
    () => ({
      total: { count: resolvedLeadCounts.total || 0 },
      high: { count: resolvedLeadCounts.high || 0 },
      medium: { count: resolvedLeadCounts.medium || 0 },
      low: { count: resolvedLeadCounts.low || 0 },
    }),
    [resolvedLeadCounts]
  );

  // Fetch aggregated lead counts for the summary tiles
  useEffect(() => {
    if (!currentExhibitorId) {
      setLeadSummaryFromApi(null);
      setIsLeadSummaryLoading(false);
      return;
    }

    const filters = {
      parentExhibitor: currentExhibitorId,
      ...(currentEventId && shouldFilterByEvent ? { event: currentEventId } : {}),
    };

    let isActive = true;
    const fetchLeadCounts = async () => {
      try {
        setIsLeadSummaryLoading(true);
        logAction("Fetching aggregated lead counts", filters);
        const response = await getData(filters, "mobile/exhibitor-leads/count");

        if (!isActive) {
          return;
        }

        if (response.status === 200 && response.data?.success) {
          const payload = response.data?.data || {};
          const prioritySummary = payload.prioritySummary || {};

          setLeadSummaryFromApi({
            total: payload.totalLeadsCount ?? 0,
            high: prioritySummary.high ?? 0,
            medium: prioritySummary.medium ?? 0,
            low: prioritySummary.low ?? 0,
            manual: payload.manualLeadsCount ?? 0,
            exhibitor: payload.exhibitorLeadsCount ?? 0,
          });

          logAction("Aggregated lead counts loaded", {
            ...filters,
            total: payload.totalLeadsCount,
          });
        } else {
          setLeadSummaryFromApi(null);
          toast.error("Unable to load lead counts");
          logAction("Failed to load aggregated lead counts", {
            status: response.status,
            data: response.data,
          });
        }
      } catch (error) {
        if (isActive) {
          setLeadSummaryFromApi(null);
          toast.error("Unable to load lead counts");
          console.error("Failed to fetch lead counts", error);
          logAction("Lead count fetch error", { error: error?.message });
        }
      } finally {
        if (isActive) {
          setIsLeadSummaryLoading(false);
        }
      }
    };

    fetchLeadCounts();
    return () => {
      isActive = false;
    };
  }, [currentExhibitorId, currentEventId, shouldFilterByEvent, toast]);

  // Render function for lead name with priority badge
  const renderLeadName = (value, data, attribute) => {
    // Extract lead name from nested objects
    const leadName = data?.user?.fullName || 
                     data?.ticketRegistration?.fullName || 
                     data?.exhibitor?.fullName || 
                     "Unknown";
    
    const profileImage = data?.user?.profileImage || 
                        data?.ticketRegistration?.profileImage || 
                        "";
    
    const designation = data?.user?.designation || 
                       data?.ticketRegistration?.designation || 
                       "";
    
    const company = data?.user?.companyName || 
                   data?.ticketRegistration?.companyName || 
                   "";
    
    const priority = data?.priority || "medium";
    const priorityColors = {
      high: "text-state-error bg-red-100",
      medium: "text-yellow-700 bg-yellow-100",
      low: "text-state-success bg-green-100",
    };
    const priorityIcons = {
      high: "star",
      medium: "time",
      low: "checked",
    };

    return (
      <div className="flex items-center gap-3">
        {profileImage ? (
          <img 
            src={import.meta.env.VITE_CDN + profileImage} 
            alt={leadName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-primary-base rounded-full flex items-center justify-center text-white font-medium shrink-0">
            {leadName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-main">{leadName}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${priorityColors[priority] || "text-text-sub bg-bg-weak"}`}>
              <GetIcon icon={priorityIcons[priority] || "users"} className="w-3 h-3" />
              {priority}
            </span>
          </div>
          {(designation || company) && (
            <div className="text-sm text-text-sub mt-1">
              {designation}{designation && company && ", "}{company}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render function for contact information
  const renderContactInfo = (value, data, attribute) => {
    // Extract contact info from nested objects
    const email = data?.user?.emailId || 
                  data?.ticketRegistration?.emailId || 
                  data?.exhibitor?.emailId || 
                  "";
    
    const phoneCode = data?.user?.phoneCode || 
                     data?.ticketRegistration?.phoneCode || 
                     "";
    
    const mobileNumber = data?.user?.mobileNumber || 
                        data?.user?.authenticationId || 
                        data?.ticketRegistration?.mobileNumber || 
                        data?.ticketRegistration?.authenticationId || 
                        "";
    
    const company = data?.user?.companyName || 
                   data?.ticketRegistration?.companyName || 
                   data?.exhibitor?.companyName || 
                   "";

    return (
      <div className="space-y-1">
        {company && (
          <div className="flex items-center gap-1 text-sm text-text-sub">
            <GetIcon icon="branding" className="w-4 h-4" />
            <span>{company}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-1 text-sm text-text-sub">
            <GetIcon icon="email" className="w-4 h-4" />
            <span>{email}</span>
          </div>
        )}
        {mobileNumber && (
          <div className="flex items-center gap-1 text-sm text-text-sub">
            <GetIcon icon="call" className="w-4 h-4" />
            <span>{phoneCode ? `+${phoneCode} ${mobileNumber}` : mobileNumber}</span>
          </div>
        )}
      </div>
    );
  };

  // Render function for scanned by information
  const renderScannedBy = (value, data, attribute) => {
    // Extract the exhibitor who scanned the lead
    const scannedBy = data?.exhibitor?.fullName || "Unknown";
    const scannedByEmail = data?.exhibitor?.emailId || "";

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-sm text-text-main">
          <GetIcon icon="manager" className="w-4 h-4" />
          <span className="font-medium">{scannedBy}</span>
        </div>
        {scannedByEmail && (
          <div className="text-xs text-text-sub">
            {scannedByEmail}
          </div>
        )}
      </div>
    );
  };

  // Render function for actions
  const renderActions = (value, data, attribute) => {
    return (
      <Button
        value="Email"
        icon="email"
        type="secondary"
        ClickEvent={() => {}}
      />
    );
  };

  // Define attributes for ListTable
  const attributes = [
    {
      type: "select",
      name: "priority",
      label: "Priority",
      required: false,
      tag: false,
      view: false,
      add: false,
      update: false,
      filter: true,
      apiType: "JSON",
      selectApi: [
        { id: "", value: "All Priority" },
        { id: "high", value: "High Priority" },
        { id: "medium", value: "Medium Priority" },
        { id: "low", value: "Low Priority" },
      ],
      showItem: "value",
      customClass: "full",
    },
    {
      type: "text",
      name: "fullName",
      label: "Lead Name",
      required: false,
      tag: true,
      view: true,
      add: false,
      update: false,
      customClass: "full",
      render: renderLeadName,
      collection: "user",
    },
    {
      type: "text",
      name: "contactInfo",
      label: "Contact Information",
      required: false,
      tag: true,
      view: true,
      add: false,
      update: false,
      customClass: "full",
      render: renderContactInfo,
    },
    {
      type: "datetime",
      name: "createdAt",
      label: "Visit Time",
      required: false,
      tag: true,
      view: true,
      add: false,
      update: false,
      customClass: "half",
    },
    {
      type: "text",
      name: "scannedBy",
      label: "Scanned By",
      required: false,
      tag: true,
      view: true,
      add: false,
      update: false,
      customClass: "half",
      render: renderScannedBy,
    },
    {
      type: "text",
      name: "remarks",
      label: "Remarks",
      required: false,
      tag: false,
      view: true,
      add: false,
      update: false,
      customClass: "half",
    },
    {
      type: "text",
      name: "actions",
      label: "Actions",
      required: false,
      tag: false,
      view: true,
      add: false,
      update: false,
      customClass: "quarter",
      render: renderActions,
    },
  ];

  // Memoized filter payload to keep ListTable inputs predictable and optimized
  const computedFilters = useMemo(() => {
    return {
      parentExhibitor: currentExhibitorId,
      ...(currentEventId && shouldFilterByEvent ? { event: currentEventId } : {}),
      skip: 0,
      limit: 100,
    };
  }, [currentExhibitorId, currentEventId, shouldFilterByEvent]);

  // Memoized parents help ListTable know the owning entities for CRUD actions
  const parents = useMemo(() => {
    return {
      parentExhibitor: currentExhibitorId,
      ...(currentEventId && shouldFilterByEvent ? { event: currentEventId } : {}),
    };
  }, [currentExhibitorId, currentEventId, shouldFilterByEvent]);

  // Show loading or error state if no exhibitor ID
  if (!currentExhibitorId) {
    return (
      <RowContainer className="data-layout">
        <div className="flex flex-col w-full h-full bg-bg-weak items-center justify-center">
          <div className="text-center">
            <GetIcon icon="userList" className="w-16 h-16 text-text-disabled mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-main mb-2">Unable to load lead management</h3>
            <p className="text-text-sub">Please ensure you are logged in as an exhibitor.</p>
          </div>
        </div>
      </RowContainer>
    );
  }

  return (
    <RowContainer className="data-layout">
      {/* Header */}
      {/* <PageHeader title="Lead Management" description="Track and manage your event leads and prospects" line={false} /> */}

      {/* Statistics Cards - Using our MetricTile component */}
      <div className="mb-0">
        <MetricTile
          labels={[
            { key: "total", title: "TOTAL LEADS", icon: "users", backgroundColor: "#e2f6e6", color: "#016a27" },
            { key: "high", title: "HIGH PRIORITY", icon: "star", backgroundColor: "#ffe5e2", color: "#99231b" },
            { key: "medium", title: "MEDIUM PRIORITY", icon: "star", backgroundColor: "#fff3c4", color: "#8a6d00" },
            { key: "low", title: "LOW PRIORITY", icon: "star", backgroundColor: "#e2f6e6", color: "#016a27" },
          ]}
        data={metricData}
        isLoading={isLeadSummaryLoading}
        />
      </div>

      {/* ListTable for Leads - Export icon appears in action bar when exportPrivilege={true} */}
      <ListTable
        key={`leads-${currentExhibitorId}-${shouldFilterByEvent && currentEventId ? currentEventId : "all"}`}
        api="exhibitor/leads"
        itemTitle={{
          name: "fullName",
          type: "text",
          collection: "user",
        }}
        shortName="Lead Management"
        formMode="single"
        preFilter={computedFilters}
        parents={parents}
        onDataLoaded={(data, meta) => {
          logAction("ListTable data loaded", { count: data?.length || 0 });
          setLeads(data || []);

          // Fallback: if event filtering returns zero rows but server reports data, retry without event filter
          if (
            shouldFilterByEvent &&
            currentEventId &&
            (!data || data.length === 0) &&
            meta?.totalCount > 0 &&
            (meta?.filterCount === 0 || meta?.count === 0)
          ) {
            logAction("Fallback to exhibitor-only filter due to empty event-scoped result", {
              totalCount: meta?.totalCount,
              filterCount: meta?.filterCount,
            });
            setShouldFilterByEvent(false);
          }
        }}
        bulkUplaod={false}
        delPrivilege={false}
        addPrivilege={false}
        updatePrivilege={false}
        exportPrivilege={true}
        viewMode="table"
        attributes={attributes}
        showSearch={true}
        {...props}
      />

      {/* Info Footer */}
      {/* <div className="mt-6 bg-bg-white rounded-xl shadow-sm border border-stroke-soft p-4">
        <div className="flex items-center gap-2 text-sm text-text-sub">
          <GetIcon icon="trending" className="w-4 h-4" />
          Track and manage your event leads for maximum conversion
        </div>
      </div> */}
    </RowContainer>
  );
}

