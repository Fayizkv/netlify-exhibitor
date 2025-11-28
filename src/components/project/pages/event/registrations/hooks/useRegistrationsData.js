import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, postData, getBlobData } from "../../../../../../backend/api";

// Custom hook for event form fields
export const useEventFormFields = (eventId, isReady = true) => {
  return useQuery({
    queryKey: ["event-form-fields", eventId],
    queryFn: async () => {
      const response = await getData({ event: eventId }, "event-form-fields");
      if (response.status === 200) {
        return response.data?.response;
      }
      throw new Error(response.customMessage || "Failed to fetch event form fields");
    },
    enabled: !!eventId && isReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for ticket form data
export const useTicketFormData = (ticketId, eventId, isReady = true) => {
  return useQuery({
    queryKey: ["ticket-form-data", ticketId, eventId],
    queryFn: async () => {
      console.log("🔍 [useTicketFormData] Fetching data for:", { ticketId, eventId });
      const response = await getData({ ticket: ticketId, eventId }, "ticket-form-data");
      console.log("📦 [useTicketFormData] API Response:", {
        ticketId,
        status: response.status,
        ticketTitle: response.data?.ticketData?.title,
        participantTypeName: response.data?.ticketData?.participantTypeName,
        participantType: response.data?.ticketData?.participantType,
        eventFormFieldsCount: response.data?.eventForm?.length,
        countriesCount: response.data?.countries?.length,
        formFieldsCount: response.data?.response?.length,
        formFields: response.data?.response
      });
      console.log("📦 [useTicketFormData] Full Ticket Object:", response.data?.ticketData);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error(response.customMessage || "Failed to fetch ticket form data");
    },
    enabled: !!ticketId && !!eventId && ticketId !== "all" && isReady,
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Custom hook for approval counts (optimized to fetch all in one call)
export const useApprovalCounts = (eventId, needsApproval, isReady = true) => {
  return useQuery({
    queryKey: ["approval-counts", eventId],
    queryFn: async () => {
      if (!needsApproval) return null;
      
      // Fetch all approval counts in parallel
      const [allResponse, pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        getData({ event: eventId, needsApproval: "true" }, "ticket-registration/all"),
        getData({ event: eventId, approve: false, needsApproval: "true" }, "ticket-registration/all"),
        getData({ event: eventId, approve: true, needsApproval: "true" }, "ticket-registration/all"),
        getData({ event: eventId, approve: "rejected", needsApproval: "true" }, "ticket-registration/all"),
      ]);

      return {
        all: allResponse?.data?.response?.length || 0,
        pending: pendingResponse?.data?.response?.length || 0,
        approved: approvedResponse?.data?.response?.length || 0,
        rejected: rejectedResponse?.data?.response?.length || 0,
      };
    },
    enabled: !!eventId && needsApproval && isReady,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refresh when window gains focus
  });
};

// Mutation for resending confirmation
export const useResendConfirmation = (setMessage) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await postData({ id }, "authentication/resend-confirmation");
      if (response.status === 200) {
        return response.data;
      }
      throw new Error(response.data?.customMessage || "Failed to send confirmation");
    },
    onSuccess: (data) => {
      setMessage({
        type: 1,
        content: data.message || "Confirmation sent successfully via WhatsApp and Email!",
        icon: "success",
      });
    },
    onError: (error) => {
      setMessage({
        type: 1,
        content: error.message || "Error sending confirmation",
        icon: "error",
      });
    },
  });
};

// Mutation for generating badge
export const useGenerateBadge = (setMessage) => {
  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await getBlobData({}, `badge/get/${id}`);
      if (response.status === 200) {
        return { blob: response.data, id };
      }
      throw new Error(response.data?.customMessage || "Failed to generate badge");
    },
    onSuccess: ({ blob, id }) => {
      const url = window.URL.createObjectURL(blob);
      
      setMessage({
        type: 2,
        title: "Generated Badge",
        content: `
          <div class="text-center">
            <div class="mb-4">
              <img 
                src="${url}" 
                alt="Badge for registration ${id}"
                style="max-width: 400px; max-height: 400px; width: auto; height: auto; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
              />
            </div>
            <p class="text-gray-600 text-sm">Click "Download Badge" to save the image to your device.</p>
          </div>
        `,
        proceed: "Download Badge",
        okay: "Close",
        onProceed: async () => {
          const link = document.createElement("a");
          link.href = url;
          link.download = `badge-${id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setMessage({
            type: 1,
            content: "Badge downloaded successfully!",
            icon: "success",
          });

          window.URL.revokeObjectURL(url);
          return true;
        },
      });
    },
    onError: (error) => {
      setMessage({
        type: 1,
        content: error.message || "Error generating badge",
        icon: "error",
      });
    },
  });
};

// Mutation for approval actions (approve/reject/resend)
export const useApprovalAction = (setMessage, eventId) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, action }) => {
      const response = await postData({ id }, `authentication/${action}`);
      if (response.status === 200) {
        return { data: response.data, action };
      }
      throw new Error(response.data?.customMessage || `Failed to ${action}`);
    },
    onSuccess: ({ data, action }, { id, action: actionType, refreshView, slNo }) => {
      setMessage({
        type: 1,
        content: data.message,
        icon: "success",
      });

      // Update the item in the list if refreshView is provided
      if (refreshView) {
        if (action === "approve") {
          refreshView(false, slNo, { approve: true });
        } else if (action === "reject") {
          refreshView(false, slNo, { approve: "rejected" });
        }
      }

      // Invalidate and refetch approval counts
      setTimeout(() => {
        queryClient.invalidateQueries(["approval-counts", eventId]);
      }, 1000);
    },
    onError: (error) => {
      setMessage({
        type: 1,
        content: error.message || "Action failed",
        icon: "error",
      });
    },
  });
};

// Mutation for bulk resend confirmation
export const useBulkResendConfirmation = (setLoaderBox, setMessage) => {
  return useMutation({
    mutationFn: async ({ ticketId }) => {
      const response = await postData({ ticketId }, "authentication/bulk-resend");
      if (response.status === 200) {
        return response.data;
      }
      throw new Error(response.data?.message || response.customMessage || "Error sending confirmation");
    },
    onMutate: () => {
      setLoaderBox(true);
    },
    onSuccess: (data) => {
      setMessage({
        type: 1,
        content: data?.message || "Confirmation sent successfully!",
        icon: "success",
      });
    },
    onError: (error) => {
      setMessage({
        type: 1,
        content: error.message || "Error sending confirmation",
        icon: "error",
      });
    },
    onSettled: () => {
      setLoaderBox(false);
    },
  });
};

// Mutation for checking in user
export const useCheckinUser = (setMessage, eventId) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await postData({ id }, "attendance/check-in");
      if (response.status === 200) {
        return response.data;
      }
      throw new Error(response.data?.customMessage || "Failed to check in user");
    },
    onSuccess: (data, { id, refreshView, slNo }) => {
      setMessage({
        type: 1,
        content: data.message || "User checked in successfully!",
        icon: "success",
      });

      // Update the item in the list if refreshView is provided
      if (refreshView) {
        refreshView(false, slNo, { attendance: true });
      }

      // Invalidate attendance data
      setTimeout(() => {
        queryClient.invalidateQueries(["attendance-data", eventId]);
      }, 1000);
    },
    onError: (error) => {
      setMessage({
        type: 1,
        content: error.message || "Failed to check in user",
        icon: "error",
      });
    },
  });
};
