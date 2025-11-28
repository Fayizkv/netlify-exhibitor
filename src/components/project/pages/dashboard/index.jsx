import React, { useState, useEffect, memo } from "react";
import { PageHeader, SubPageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import NoDataFound, { PlainNoData } from "../../../core/list/nodata";
import { DashboardSkeleton } from "../../../core/loader/shimmer";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons";
import { getData } from "../../../../backend/api";
import { 
  Calendar, 
  DollarSign, 
  UserPlus, 
  Ticket, 
  Users, 
  Clock, 
  Star,
  Mail,
  Phone,
  Eye,
  Plus,
  Database,
  MapPin,
  Building,
  TrendingUp
} from "lucide-react";
import { useUser } from "../../../../contexts/UserContext";

// Helper function to capitalize each word in a string
const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper function to get avatar color
const getAvatarColor = (letter) => {
  if (!letter) return "bg-gray-400";
  const colors = ["bg-pink-500", "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-yellow-500", "bg-red-500"];
  const charCode = letter.toUpperCase().charCodeAt(0);
  const index = (charCode - 65) % colors.length;
  return colors[index] || "bg-gray-400";
};

// Helper function to get interest color
const getInterestColor = (interest) => {
  switch (interest) {
    case "high":
      return "text-state-error bg-red-100";
    case "medium":
      return "text-yellow-700 bg-yellow-100";
    case "low":
      return "text-state-success bg-green-100";
    default:
      return "text-text-sub bg-bg-weak";
  }
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

const Dashboard = memo(({ openData, initialTab = 1, showTabs = true }) => {
  const toast = useToast();
  const user = useUser();
  const [analytics, setAnalytics] = useState(null);
  const [ticketsByType, setTicketsByType] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentExhibitorId, setCurrentExhibitorId] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);

  // Get current exhibitor ID and event ID
  useEffect(() => {
    console.log("[Dashboard] openData:", openData);
    console.log("[Dashboard] user:", user);
    
    const getCurrentExhibitorId = () => {
      if (openData?.user?.user?._id) {
        console.log("[Dashboard] Found exhibitor ID from openData.user.user._id:", openData.user.user._id);
        return openData.user.user._id;
      }
      if (openData?.user?.userId) {
        console.log("[Dashboard] Found exhibitor ID from openData.user.userId:", openData.user.userId);
        return openData.user.userId;
      }
      if (user?._id) {
        console.log("[Dashboard] Found exhibitor ID from user._id:", user._id);
        return user._id;
      }
      console.log("[Dashboard] No exhibitor ID found");
      return null;
    };

    const getCurrentEventId = () => {
      if (openData?.user?.user?.event?._id) {
        console.log("[Dashboard] Found event ID from openData.user.user.event._id:", openData.user.user.event._id);
        return openData.user.user.event._id;
      }
      if (openData?.data?._id) {
        console.log("[Dashboard] Found event ID from openData.data._id:", openData.data._id);
        return openData.data._id;
      }
      if (user?.event?._id) {
        console.log("[Dashboard] Found event ID from user.event._id:", user.event._id);
        return user.event._id;
      }
      if (user?.event && typeof user.event === "string") {
        console.log("[Dashboard] Found event ID from user.event (string):", user.event);
        return user.event;
      }
      console.log("[Dashboard] No event ID found");
      return null;
    };

    const exhibitorId = getCurrentExhibitorId();
    const eventId = getCurrentEventId();

    console.log("[Dashboard] Setting IDs - exhibitorId:", exhibitorId, "eventId:", eventId);
    setCurrentExhibitorId(exhibitorId);
    setCurrentEventId(eventId);
  }, [openData, user]);

  // Fetch dashboard analytics
  const fetchAnalytics = async () => {
    console.log("[Dashboard] fetchAnalytics called, currentExhibitorId:", currentExhibitorId);
    
    try {
      setIsLoading(true);
      console.log("[Dashboard] Making API call to exhibitor/dashboard/analytics");
      const response = await getData({}, "exhibitor/dashboard/analytics");
      console.log("[Dashboard] Analytics API response:", response);
      
      if (response.status === 200 && response.data?.success) {
        console.log("[Dashboard] Analytics data received:", response.data.data);
        setAnalytics(response.data.data || {});
      } else {
        console.error("[Dashboard] Failed to load analytics:", response.data);
        toast.error("Failed to load dashboard analytics");
      }
    } catch (error) {
      console.error("[Dashboard] Error fetching analytics:", error);
      toast.error("Error loading dashboard analytics");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tickets by type
  const fetchTicketsByType = async () => {
    console.log("[Dashboard] fetchTicketsByType called");
    
    try {
      console.log("[Dashboard] Making API call to exhibitor/dashboard/tickets-by-type");
      const response = await getData({}, "exhibitor/dashboard/tickets-by-type");
      console.log("[Dashboard] Tickets by type API response:", response);
      
      if (response.status === 200 && response.data?.success) {
        console.log("[Dashboard] Tickets by type data received:", response.data.data);
        setTicketsByType(response.data.data || {});
      }
    } catch (error) {
      console.error("[Dashboard] Error fetching tickets by type:", error);
    }
  };

  // Fetch data when component mounts or when IDs are available
  // Note: API endpoints use req.user from auth token, so we can call them even without exhibitorId
  useEffect(() => {
    console.log("[Dashboard] useEffect triggered for API calls");
    // Always try to fetch - the backend uses req.user from the auth token
    fetchAnalytics();
    fetchTicketsByType();
  }, []); // Empty dependency array - fetch once on mount

  // Stats cards configuration - matching design system
  const stats = [
    {
      id: 1,
      title: "TOTAL LEADS",
      value: analytics?.totalLeads || 0,
      icon: "users",
      bgColor: "bg-[#e2f6e6]",
      iconColor: "#016a27",
    },
    {
      id: 2,
      title: "HIGH INTEREST",
      value: analytics?.highInterestLeads || 0,
      icon: "star",
      bgColor: "bg-[#ffe5e2]",
      iconColor: "#99231b",
    },
    {
      id: 3,
      title: "TICKETS ISSUED",
      value: analytics?.ticketStats?.issued || 0,
      icon: "ticket",
      bgColor: "bg-[#deebff]",
      iconColor: "#004999",
    },
    {
      id: 4,
      title: "CONVERSION RATE",
      value: analytics?.conversionRate ? `${analytics.conversionRate}%` : "0%",
      icon: "trending",
      bgColor: "bg-[#e6e6f9]",
      iconColor: "#2b2a69",
    },
  ];

  const recentLeads = analytics?.recentLeads || [];

  return (
    <RowContainer className="data-layout">
   

      {/* Loading State */}
      {isLoading && (
        <div className="w-full">
          <DashboardSkeleton />
        </div>
      )}

      {/* Stats Cards - Matching design system */}
      {!isLoading && (
        <div className="bg-bg-white rounded-xl shadow-sm border border-stroke-soft p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {stats.map((stat, index) => (
              <div 
                key={stat.id} 
                className={`flex items-center p-2 gap-3 ${index !== stats.length - 1 ? "border-r border-stroke-soft" : ""}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                  {stat.icon === "users" ? (
                    <UserPlus className="w-6 h-6" stroke={stat.iconColor} />
                  ) : stat.icon === "star" ? (
                    <Star className="w-6 h-6" stroke={stat.iconColor} />
                  ) : stat.icon === "ticket" ? (
                    <Ticket className="w-6 h-6" stroke={stat.iconColor} />
                  ) : (
                    <TrendingUp className="w-6 h-6" stroke={stat.iconColor} />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-medium font-inter text-text-sub uppercase">{stat.title}</p>
                  <p className="text-[16px] font-bold font-inter text-text-main">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Breakdown by Type */}
      {!isLoading && ticketsByType && Object.keys(ticketsByType).length > 0 && (
        <div className="bg-bg-white rounded-xl shadow-sm border border-stroke-soft p-6 mb-6">
          <SubPageHeader 
            title="Breakdown by Ticket Type" 
            icon=""
            line={true}
            dynamicClass="mb-4 text-xl md:text-2xl font-bold leading-tight text-text-main"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {Object.entries(ticketsByType).map(([type, stats]) => (
              <div key={type} className="bg-bg-white rounded-lg p-4 border-[0.5px] border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-text-main">{type.replace("_", " ")}</h4>
                  <span className="text-xs font-medium text-primary-dark bg-primary-light px-2 py-1 rounded-full whitespace-nowrap">
                    {stats.allocated} allocated
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">Issued:</span>
                    <span className="font-medium text-state-success">{stats.issued}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">Available:</span>
                    <span className="font-medium text-orange-600">{stats.available}</span>
                  </div>
                  <div className="w-full bg-bg-soft rounded-full h-2 mt-2">
                    <div
                      className="bg-primary-base h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.allocated > 0 ? (stats.issued / stats.allocated) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <div className="bg-bg-white rounded-xl shadow-sm border border-stroke-soft">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <SubPageHeader 
                  title="Recent Leads" 
                  icon="users"
                  line={true}
                  dynamicClass="text-xl md:text-2xl font-bold leading-tight text-text-main"
                />
                <button
                  aria-label="View All Leads"
                  className="w-9 h-9 flex items-center justify-center bg-bg-white hover:bg-bg-weak text-text-main rounded-lg transition-colors"
                >
                  <GetIcon icon="eye" />
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-4 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-bg-weak rounded-lg animate-pulse">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-bg-soft rounded-full"></div>
                        <div className="flex-1">
                          <div className="w-32 h-4 bg-bg-soft rounded mb-2"></div>
                          <div className="w-48 h-3 bg-bg-soft rounded mb-1"></div>
                          <div className="w-24 h-3 bg-bg-soft rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-bg-soft rounded"></div>
                        <div className="w-8 h-8 bg-bg-soft rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentLeads.length === 0 ? (
                <PlainNoData
                  title="No Leads found!"
                  icon="users"
                  description="Add a new leads to get started!"
                  className=""
                />
              ) : (
                <div
                  style={{ scrollbarWidth: "none" }}
                  className="flex flex-col gap-2 max-h-[400px] overflow-y-auto mt-4"
                >
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-bg-weak transition-colors bg-bg-white"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 ${getAvatarColor(lead.name?.charAt(0))} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                          {lead.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-text-main">{lead.name}</h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getInterestColor(lead.interest)}`}>
                              {lead.interest}
                            </span>
                          </div>
                          <p className="text-sm text-text-sub">
                            {lead.jobTitle} {lead.company && `at ${lead.company}`}
                          </p>
                          <p className="text-xs text-text-soft mt-1">
                            {lead.createdAt ? formatDate(lead.createdAt) : "No date"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center justify-center w-8 h-8 bg-bg-white hover:bg-bg-weak text-text-main rounded-lg transition-colors">
                          <GetIcon icon="email" />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 bg-bg-white hover:bg-bg-weak text-text-main rounded-lg transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Event Info */}
        <div className="space-y-6">
          {/* Quick Actions - HIDDEN
              Reason: Temporarily disabled per request. Retain markup for future use.
              To re-enable, remove the surrounding JSX comment block. */}
          {/*
          <div className="bg-bg-white rounded-xl shadow-sm border border-stroke-soft p-6">
            <SubPageHeader 
              title="Quick Actions" 
              icon="add"
              line={true}
              dynamicClass="mb-4"
            />
            <div className="space-y-3">
              {[
                {
                  icon: <Plus className="w-4 h-4 mr-2" />,
                  text: "Add New Lead",
                  variant: "default",
                  className: "w-full justify-start bg-primary-base hover:bg-primary-dark text-white",
                },
                {
                  icon: <Ticket className="w-4 h-4 mr-2" />,
                  text: "Issue Guest Pass",
                  variant: "outline",
                  className: "w-full justify-start border-stroke-soft",
                },
                {
                  icon: <Users className="w-4 h-4 mr-2" />,
                  text: "Invite Team Member",
                  variant: "outline",
                  className: "w-full justify-start border-stroke-soft",
                },
                {
                  icon: <Database className="w-4 h-4 mr-2" />,
                  text: "Export Data",
                  variant: "outline",
                  className: "w-full justify-start border-stroke-soft",
                },
              ].map((action, index) => (
                <button
                  key={index}
                  className={`flex gap-2 items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${action.className}`}
                >
                  {action.icon}
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>
          */}

          {/* Event Info */}
          <div className="bg-bg-white rounded-xl shadow-sm border border-stroke-soft p-6">
            <SubPageHeader 
              title="Event Info" 
              icon="date"
              line={true}
            dynamicClass="mb-4 text-xl md:text-2xl font-bold leading-tight text-text-main"
            />
            <div className="space-y-3 mt-4">
              {[
                {
                  label: "Booth Location",
                  value: "A-123",
                  icon: MapPin,
                  iconColor: "text-blue-500",
                  valueColor: "text-blue-500",
                },
                {
                  label: "Booth Hours",
                  value: "9:00 AM - 6:00 PM",
                  icon: Clock,
                  iconColor: "text-green-500",
                  valueColor: "text-green-500",
                },
                {
                  label: "Event",
                  value: openData?.data?.title || "Event",
                  icon: Building,
                  iconColor: "text-orange-500",
                  valueColor: "text-orange-500",
                },
                {
                  label: "Event Dates",
                  value: openData?.data?.startDate 
                    ? `${new Date(openData.data.startDate).toLocaleDateString()} - ${new Date(openData.data.endDate || openData.data.startDate).toLocaleDateString()}`
                    : "Not set",
                  icon: Calendar,
                  iconColor: "text-purple-500",
                  valueColor: "text-purple-500",
                },
              ].map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${info.iconColor}`} />
                      <span className="text-sm font-medium text-text-main">{info.label}</span>
                    </div>
                    <span className={`text-sm font-semibold ${info.valueColor}`}>{info.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </RowContainer>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
