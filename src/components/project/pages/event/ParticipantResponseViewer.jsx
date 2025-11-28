import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { RowContainer } from "../../../styles/containers/styles";
import { PageHeader } from "../../../core/input/heading";
import ListTable from "../../../core/list/list";
import { useToast } from "../../../core/toast";
import { getData, postData } from "../../../../backend/api";
import { ListTableSkeleton, SimpleShimmer } from "../../../core/loader/shimmer";
import Loader from "../../../core/loader";
import { UserPlus, Calendar } from "lucide-react";
import MetricTile from "../../../core/metricTile";

/**
 * ParticipantResponseViewer Component
 *
 * Displays participant type registration responses in a ListTable filtered by the
 * participant type's corresponding ticket and event.
 *
 * API CALL: /ticket-registration/form-responses?event={eventId}&ticket={ticketId}
 */

const ParticipantResponseViewer = ({ participantData, eventId, onClose, setMessage }) => {
  const [attributes, setAttributes] = useState([]);
  const [loader, setLoader] = useState(false);
  const [dashboardCountData, setDashboardCountData] = useState(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  const toast = useToast();
  const themeColors = useSelector((state) => state.themeColors);

  // Fetch participant-type specific response counts
  const fetchParticipantCounts = useCallback(async () => {
    const currentEventId = eventId || participantData?.event?._id;
    const participantTypeId = participantData?._id;

    if (!currentEventId || !participantTypeId) {
      setDashboardCountData(null);
      return;
    }

    setIsLoadingCounts(true);
    try {
      // Fetch response data with counts from the API
      const response = await getData(
        {
          event: currentEventId,
          participantType: participantTypeId,
          skip: 0,
          limit: 1000,
        },
        "ticket-registration/participant-type-responses"
      );

      // Extract counts from the API response
      const counts = response?.data?.counts || {};
      const totalCount = counts["Total Responses"]?.count || 0;
      const todayCount = counts["Today's Responses"]?.count || 0;

      setDashboardCountData([
        { count: totalCount, icon: "registration", title: "TOTAL RESPONSES" },
        { count: todayCount, icon: "date", title: "TODAY'S RESPONSES" },
      ]);
    } catch (error) {
      toast.error("Error loading participant responses statistics");
    } finally {
      setIsLoadingCounts(false);
    }
  }, [participantData?._id, participantData?.event?._id, eventId, toast]);

  // Initial fetch and refresh when dependencies change
  useEffect(() => {
    fetchParticipantCounts();
  }, [fetchParticipantCounts]);

  // Refresh function that can be called from ListTable
  const refreshCounts = useCallback(() => {
    fetchParticipantCounts();
  }, [fetchParticipantCounts]);

  // Watch for changes in the ListTable data to refresh counts
  const listTableData = useSelector((state) => state.pages[`ticket-registration/participant-type-responses-${eventId || participantData?.event?._id}-${participantData?._id}`]);

  useEffect(() => {
    if (listTableData) {
      // Refresh counts when ListTable data changes
      fetchParticipantCounts();
    }
  }, [listTableData, fetchParticipantCounts]);

  // Add periodic refresh to ensure counts stay updated
  useEffect(() => {
    const interval = setInterval(() => {
      fetchParticipantCounts();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchParticipantCounts]);

  // Configure stats for count widgets
  const stats = useMemo(
    () => [
      {
        id: 1,
        title: "TOTAL RESPONSES",
        value: dashboardCountData?.[0]?.count || 0,
        icon: dashboardCountData?.[0]?.icon || "registration",
        bgColor: "bg-[#e2f6e6]",
        iconColor: "text-green-500",
      },
      {
        id: 2,
        title: "TODAY'S RESPONSES",
        value: dashboardCountData?.[1]?.count || 0,
        icon: dashboardCountData?.[1]?.icon || "date",
        bgColor: "bg-[#deebff]",
        iconColor: "text-blue-500",
      },
    ],
    [dashboardCountData]
  );

  // Custom Metric Tile renderer to avoid relying on internal counts from ListTable
  const MetricTileOverride = useCallback(
    ({ labels }) => {
      const data = {
        "Total Responses": { count: dashboardCountData?.[0]?.count ?? 0 },
        "Today's Responses": { count: dashboardCountData?.[1]?.count ?? 0 },
      };
      return <MetricTile labels={labels} data={data} />;
    },
    [dashboardCountData]
  );

  // Resend confirmation function - matches the pattern from registrations index.jsx
  const resendConfirmation = (id, refreshView, slNo) => {
    setLoader(true);
    postData({ id }, `authentication/resend-confirmation`)
      .then((response) => {
        setLoader(false);
        if (response.status === 200) {
          if (response.data) {
            setMessage({
              type: 1,
              content: response.data.message || "Confirmation sent successfully via WhatsApp and Email!",
              icon: "success",
            });
            // Optional: refresh the view if needed
            // refreshView();
          } else {
            console.error("Response data is undefined.");
          }
        } else {
          setMessage({
            type: 1,
            content: response.data?.customMessage || "Failed to send confirmation",
            icon: "error",
          });
        }
      })
      .catch((error) => {
        setLoader(false);
        console.error("API request error:", error);
        setMessage({
          type: 1,
          content: "Error sending confirmation",
          icon: "error",
        });
      });
  };

  // Actions array with resend confirmation functionality
  const actions = useMemo(() => {
    return [
      {
        element: "button",
        type: "callback",
        callback: (item, data, refreshView, slNo) => {
          // Use the resendConfirmation function that matches registrations page pattern
          resendConfirmation(data._id, refreshView, slNo);
        },
        itemTitle: {
          name: "user",
          type: "text",
          collection: "",
        },
        icon: "next",
        title: "Resend Confirmation",
        params: {
          api: ``,
          parentReference: "",
          itemTitle: {
            name: "user",
            type: "text",
            collection: "",
          },
          shortName: "Resend Confirmation",
          addPrivilege: true,
          delPrivilege: true,
          updatePrivilege: true,
          customClass: "medium",
        },
      },
    ];
  }, []);

  // Build attributes for the ListTable - Only show required fields
  useEffect(() => {
    const buildAttributes = async () => {
      if (!participantData?._id) return;

      try {
        // Resolve event and ticket ids
        const currentEventId = eventId || participantData?.event?._id;
        const ticketId = participantData?.ticket?._id || participantData?.ticket;
        if (!currentEventId || !ticketId) return;

        // Fetch both event form fields and ticket form fields
        const [eventFormResponse, ticketFormResponse] = await Promise.all([
          getData({ event: currentEventId }, `event-form-fields`),
          getData({ ticket: ticketId, eventId: currentEventId }, `ticket-form-data`),
        ]);

        // Base attributes (keep minimal required columns)
        const baseAttributes = [
          {
            type: "text",
            placeholder: "Registration ID",
            name: "_id",
            label: "Registration ID",
            required: false,
            view: true,
            add: false,
            update: false,
            tag: false,
            export: true,
          },
          {
            type: "text",
            placeholder: "Full Name",
            name: "fullName",
            label: "Full Name",
            required: false,
            view: true,
            add: false,
            update: false,
            tag: true,
            export: true,
            collection: "authentication",
            showItem: "fullName",
          },
          {
            type: "text",
            placeholder: "Email",
            name: "emailId",
            label: "Email",
            required: false,
            view: true,
            add: false,
            update: false,
            tag: true,
            export: true,
          },
          {
            type: "text",
            placeholder: "Mobile",
            name: "authenticationId",
            label: "Mobile",
            required: false,
            view: true,
            add: false,
            update: false,
            tag: true,
            export: true,
          },
          {
            type: "datetime",
            placeholder: "Registration Date",
            name: "createdAt",
            label: "Registration Date",
            required: false,
            view: true,
            add: false,
            update: false,
            tag: true,
            export: true,
          },
          {
            type: "text",
            placeholder: "Company",
            name: "company",
            label: "Company",
            required: false,
            view: true,
            add: false,
            update: false,
            tag: true,
            export: true,
            collection: "formData",
            showItem: "company",
          },
        ];

        // Track used field names to avoid duplicates
        const usedFieldNames = new Set(["_id", "fullName", "emailId", "authenticationId", "createdAt", "company"]);
        let allAttributes = [...baseAttributes];

        // Fields to exclude from display
        const excludedFields = ["Your Name", "Event Mobile Number", "Event Email ID", "Designation", "Whatsapp Number", "Districts in Kerala", "Gender", "Phone", "Ticket Company", "phone"];

        // Helper function to check if field should be excluded
        const shouldExcludeField = (field) => {
          const fieldLabel = field.label?.toLowerCase() || "";
          const fieldName = field.name?.toLowerCase() || "";

          // Check against exclusion list
          const isExcluded = excludedFields.some((excludedField) => {
            const excludedLower = excludedField.toLowerCase();
            return fieldLabel.includes(excludedLower) || fieldName.includes(excludedLower) || fieldLabel === excludedLower || fieldName === excludedLower;
          });

          // Additional checks for duplicate fields
          const isDuplicateField =
            fieldName === "phone" ||
            fieldName === "mobilenumber" ||
            fieldName === "mobile" ||
            fieldName === "email" ||
            fieldName === "emailid" ||
            (fieldLabel.includes("mobile") && fieldLabel !== "mobile") ||
            (fieldLabel.includes("email") && fieldLabel !== "email") ||
            (fieldLabel.includes("phone") && fieldLabel !== "phone");

          return isExcluded || isDuplicateField;
        };

        // Event fields (only visible, non-info-line-html)
        if (eventFormResponse?.status === 200 && eventFormResponse?.data?.response) {
          const eventFields = eventFormResponse.data.response
            .filter((field) => field.view && ["info", "title", "line", "html"].indexOf(field.type) === -1 && !shouldExcludeField(field))
            .map((field) => {
              let uniqueName = field.name;
              let uniqueLabel = field.label;
              if (usedFieldNames.has(uniqueName)) {
                uniqueName = `event_${field.name}`;
                uniqueLabel = `Event ${field.label}`;
              }
              usedFieldNames.add(uniqueName);
              return {
                type: field.type,
                placeholder: field.placeholder || field.label,
                name: uniqueName,
                label: uniqueLabel,
                required: false,
                view: true,
                add: false,
                update: false,
                tag: true,
                export: true,
                collection: "formData",
                showItem: field.showItem || field.name,
                originalName: field.name,
                isEventField: true,
              };
            });
          allAttributes = [...allAttributes, ...eventFields];
        }

        // Ticket fields (only visible, non-info-line-html)
        if (ticketFormResponse?.status === 200 && ticketFormResponse?.data?.response) {
          const ticketFields = ticketFormResponse.data.response
            .filter((field) => field.view && ["info", "title", "line", "html"].indexOf(field.type) === -1 && !shouldExcludeField(field))
            .map((field) => {
              let uniqueName = field.name;
              let uniqueLabel = field.label;
              if (usedFieldNames.has(uniqueName)) {
                uniqueName = `ticket_${field.name}`;
                uniqueLabel = `Ticket ${field.label}`;
              }
              usedFieldNames.add(uniqueName);
              return {
                type: field.type,
                placeholder: field.placeholder || field.label,
                name: uniqueName,
                label: uniqueLabel,
                required: false,
                view: true,
                add: false,
                update: false,
                tag: true,
                export: true,
                collection: "formData",
                showItem: field.showItem || field.name,
                originalName: field.name,
                isTicketField: true,
              };
            });
          allAttributes = [...allAttributes, ...ticketFields];
        }

        setAttributes(allAttributes);
      } catch (error) {
        toast.error("Failed to load form structure");
      }
    };

    buildAttributes();
  }, [participantData?._id, participantData?.event?._id, eventId, toast]);

  return (
    <RowContainer className="data-layout">
      {/* Header */}
      <PageHeader title="" description="" line={false} />

      {/* Count Widgets */}
      {/* {isLoadingCounts ? (
        <div className="mb-6">
          <SimpleShimmer message="Loading responses..." />
        </div>
      ) : (
        dashboardCountData && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-stroke-soft p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stats.map((stat, index) => (
                  <div key={stat.id} className={`flex items-center p-2 gap-3 ${index !== stats.length - 1 ? "border-r border-gray-200" : ""}`}>
                    <div className="flex items-center justify-center border border-gray-200 rounded-full">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                        {stat.icon === "registration" ? (
                          <UserPlus className="" width={18} height={18} stroke="#016a27" />
                        ) : (
                          <Calendar className="" width={18} height={18} stroke="#004999" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium font-inter text-gray-500">{stat.title}</p>
                      <p className="text-[16px] font-bold font-inter text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )} */}

      {/* Content */}
      {attributes.length === 0 ? (
        <ListTableSkeleton viewMode="table" tableColumnCount={5} />
      ) : (
        <div className="w-full position-relative">
          <ListTable
            // key={`${eventId || participantData?.event?._id}-${participantData?._id}`}
            actions={actions}
            api={`ticket-registration/participant-type-responses`}
            labels={[
              { key: "Total Responses", title: "TOTAL RESPONSES", icon: "calendar-check", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
              { key: "Today's Responses", title: "TODAY'S RESPONSES", icon: "calendar-plus", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
            ]}
            MetricTileRender={MetricTileOverride}
            attributes={attributes}
            itemTitle={{ name: "fullName", type: "text", collection: "authentication" }}
            shortName="Responses"
            addPrivilege={true}
            updatePrivilege={true}
            delPrivilege={true}
            exportPrivilege={true}
            viewMode="table"
            showEditInDotMenu={true}
            popupMode="medium"
            popupMenu="vertical-menu"
            preFilter={{
              event: eventId || participantData?.event?._id,
              participantType: participantData?._id,
              skip: 0,
              limit: 100,
            }}
            refreshCallback={refreshCounts}
          />
          {loader && <Loader position="absolute" />}
        </div>
      )}
    </RowContainer>
  );
};

export default ParticipantResponseViewer;
