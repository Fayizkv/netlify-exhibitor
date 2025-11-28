import { useQuery } from "@tanstack/react-query";
import { getData } from "../../../../../backend/api";

// Dashboard count data hook
export const useDashboardCountData = (eventId, enabled = true) => {
  return useQuery({
    queryKey: ["dashboard-count", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");
      const response = await getData({ event: eventId }, "dashboard");
      if (response.status !== 200) {
        throw new Error("Failed to load dashboard count data");
      }
      return response.data || [];
    },
    enabled: enabled && !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (renamed from cacheTime in v5)
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
    retry: 2,
  });
};

// Event overview data hook
export const useEventOverviewData = (eventId, enabled = true) => {
  return useQuery({
    queryKey: ["event-overview", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");
      const response = await getData({ event: eventId }, "dashboard/event-overview");
      if (response.status !== 200) {
        throw new Error("Failed to load event overview data");
      }
      return response.data;
    },
    enabled: enabled && !!eventId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

// Registration overview data hook
export const useRegistrationOverviewData = (eventId, enabled = true) => {
  return useQuery({
    queryKey: ["registration-overview", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");
      const response = await getData({ event: eventId }, "dashboard/registration-overview");
      if (response.status !== 200) {
        throw new Error("Failed to load registration overview data");
      }
      return response.data.data;
    },
    enabled: enabled && !!eventId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 12 * 60 * 1000, // 12 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

// Chart data hook
export const useChartData = (eventId, enabled = true) => {
  return useQuery({
    queryKey: ["chart-data", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");
      const response = await getData({ event: eventId }, "dashboard/chart-data");
      if (response.status !== 200) {
        throw new Error("Failed to load chart data");
      }
      return response.data.data;
    },
    enabled: enabled && !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

// Attendance data hook (only for attendance tab)
export const useAttendanceData = (eventId, enabled = true) => {
  return useQuery({
    queryKey: ["attendance-data", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");
      const response = await getData({ ticket: "all", event: eventId, limit: 10 }, "attendance/check-in");
      if (response.status !== 200) {
        throw new Error("Failed to load attendance data");
      }
      return Array.isArray(response.data.response) ? response.data.response : [];
    },
    enabled: enabled && !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for attendance)
    gcTime: 8 * 60 * 1000, // 8 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

// Attendance breakdown data hook
export const useAttendanceBreakdownData = (eventId, enabled = true) => {
  return useQuery({
    queryKey: ["attendance-breakdown", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");
      const response = await getData({ event: eventId }, "dashboard/attendance-breakdown");
      if (response.status !== 200) {
        throw new Error("Failed to load attendance breakdown data");
      }
      return response.data.data;
    },
    enabled: enabled && !!eventId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 12 * 60 * 1000, // 12 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

// Combined hook for all dashboard data
export const useDashboardData = (eventId, activeTab = 1) => {
  const isRegistrationTab = activeTab === 1;
  const isAttendanceTab = activeTab === 2;

  // Always fetch basic data
  const dashboardCount = useDashboardCountData(eventId);
  const eventOverview = useEventOverviewData(eventId);
  
  // Registration tab specific data
  const registrationOverview = useRegistrationOverviewData(eventId, isRegistrationTab);
  const chartData = useChartData(eventId, isRegistrationTab);
  
  // Attendance tab specific data (only fetch when attendance tab is active)
  const attendanceData = useAttendanceData(eventId, isAttendanceTab);
  const attendanceBreakdown = useAttendanceBreakdownData(eventId, isAttendanceTab);

  // Determine overall loading state
  const isLoading = dashboardCount.isLoading || eventOverview.isLoading || 
    (isRegistrationTab && (registrationOverview.isLoading || chartData.isLoading)) ||
    (isAttendanceTab && (attendanceData.isLoading || attendanceBreakdown.isLoading));

  // Determine if there are any errors
  const error = dashboardCount.error || eventOverview.error || 
    registrationOverview.error || chartData.error || 
    attendanceData.error || attendanceBreakdown.error;

  return {
    // Data
    dashboardCountData: dashboardCount.data,
    eventOverviewData: eventOverview.data,
    registrationOverviewData: registrationOverview.data,
    chartData: chartData.data,
    attendanceData: attendanceData.data,
    attendanceBreakdownData: attendanceBreakdown.data,
    
    // States
    isLoading,
    error,
    
    // Individual query states for fine-grained control
    queries: {
      dashboardCount,
      eventOverview,
      registrationOverview,
      chartData,
      attendanceData,
      attendanceBreakdown,
    },
    
    // Refetch functions
    refetchAll: () => {
      dashboardCount.refetch();
      eventOverview.refetch();
      if (isRegistrationTab) {
        registrationOverview.refetch();
        chartData.refetch();
      }
      if (isAttendanceTab) {
        attendanceData.refetch();
        attendanceBreakdown.refetch();
      }
    },
  };
};
