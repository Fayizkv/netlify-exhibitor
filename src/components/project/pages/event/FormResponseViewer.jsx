import React, { useState, useEffect, useMemo, useCallback } from "react";
import { RowContainer } from "../../../styles/containers/styles";
import { PageHeader } from "../../../core/input/heading";
import ListTable from "../../../core/list/list";
import { useToast } from "../../../core/toast";
import { getData } from "../../../../backend/api";
import { ListTableSkeleton } from "../../../core/loader/shimmer";
import NoDataFound from "../../../core/list/nodata";
import MetricTile from "../../../core/metricTile";

const FormResponseViewer = ({ formData, eventId, onClose }) => {
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardCountData, setDashboardCountData] = useState(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  const toast = useToast();

  // Fetch ticket-specific response counts
  useEffect(() => {
    const fetchTicketCounts = async () => {
      const eventIdToUse = formData?.event?._id || eventId;
      const ticketIdToUse = formData?._id;

      if (!eventIdToUse || !ticketIdToUse) {
        setDashboardCountData(null);
        return;
      }

      setIsLoadingCounts(true);
      try {
        // Today's range
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Total responses for this ticket(form)
        const totalResponse = await getData(
          {
            event: eventIdToUse,
            ticket: ticketIdToUse,
            skip: 0,
            limit: 1000,
          },
          "ticket-registration/form-responses"
        );

        // Today's responses for this ticket(form)
        const todayResponse = await getData(
          {
            event: eventIdToUse,
            ticket: ticketIdToUse,
            startDate: todayStart.toISOString(),
            endDate: todayEnd.toISOString(),
            skip: 0,
            limit: 1000,
          },
          "ticket-registration/form-responses"
        );

        const totalCount = totalResponse?.data?.response?.length || 0;
        const todayCount = todayResponse?.data?.response?.length || 0;

        const counts = [
          { count: totalCount, icon: "registration", title: "TOTAL RESPONSES" },
          { count: todayCount, icon: "date", title: "TODAY'S RESPONSES" },
        ];

        setDashboardCountData(counts);
      } catch (error) {
        toast.error("Error loading form response statistics");
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchTicketCounts();
  }, [formData?._id, formData?.event?._id, eventId, toast]);

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

  // Render metric tiles via ListTable labels (align with ParticipantResponseViewer)
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

  // Build attributes for the ListTable
  useEffect(() => {
    const buildAttributes = async () => {
      if (!formData?._id) return;

      setIsLoading(true);
      try {
        // Fetch both event form fields and ticket form fields
        const [eventFormResponse, ticketFormResponse] = await Promise.all([
          // Get event form fields
          getData(
            {
              event: formData.event?._id || eventId,
            },
            `event-form-fields`
          ),

          // Get ticket form fields for the associated ticket
          getData(
            {
              ticket: formData._id,
              eventId: formData.event?._id || eventId,
            },
            `ticket-form-data`
          ),
        ]);

        // Build base attributes for registration data
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

        // Add event form fields with unique names
        if (eventFormResponse?.status === 200 && eventFormResponse?.data?.response) {
          console.log(
            "Event form fields before filtering:",
            eventFormResponse.data.response.map((f) => ({ name: f.name, label: f.label, type: f.type }))
          );

          const eventFields = eventFormResponse.data.response
            .filter((field) => field.view && !["info", "title", "line", "html"].includes(field.type) && !shouldExcludeField(field))
            .map((field) => {
              // Create unique field name to avoid conflicts
              let uniqueName = field.name;
              let uniqueLabel = field.label;

              // If field name already exists, add prefix
              if (usedFieldNames.has(uniqueName)) {
                uniqueName = `event_${field.name}`;
                uniqueLabel = `Event ${field.label}`;
              }

              usedFieldNames.add(uniqueName);

              // Handle different field types properly
              let fieldType = field.type;
              if (field.type === "mobilenumber") {
                fieldType = "text"; // Convert mobilenumber to text for display
              }

              return {
                type: fieldType,
                placeholder: field.placeholder || field.label,
                name: uniqueName,
                label: uniqueLabel,
                required: false,
                view: true,
                add: false,
                update: false,
                tag: true,
                export: true,
                collection: "formData", // Event form data is stored in formData
                showItem: field.showItem || field.name,
                originalName: field.name,
                isEventField: true,
              };
            });

          allAttributes = [...allAttributes, ...eventFields];
        }

        // Add ticket form fields with unique names
        if (ticketFormResponse?.status === 200 && ticketFormResponse?.data?.response) {
          console.log(
            "Ticket form fields before filtering:",
            ticketFormResponse.data.response.map((f) => ({ name: f.name, label: f.label, type: f.type }))
          );

          const ticketFields = ticketFormResponse.data.response
            .filter((field) => field.view && !["info", "title", "line", "html"].includes(field.type) && !shouldExcludeField(field))
            .map((field) => {
              // Create unique field name to avoid conflicts
              let uniqueName = field.name;
              let uniqueLabel = field.label;

              // If field name already exists, add prefix
              if (usedFieldNames.has(uniqueName)) {
                uniqueName = `ticket_${field.name}`;
                uniqueLabel = `Ticket ${field.label}`;
              }

              usedFieldNames.add(uniqueName);

              // Handle different field types properly
              let fieldType = field.type;
              if (field.type === "mobilenumber") {
                fieldType = "text"; // Convert mobilenumber to text for display
              }

              return {
                type: fieldType,
                placeholder: field.placeholder || field.label,
                name: uniqueName,
                label: uniqueLabel,
                required: false,
                view: true,
                add: false,
                update: false,
                tag: true,
                export: true,
                collection: "formData", // Ticket form data is also stored in formData
                showItem: field.showItem || field.name,
                originalName: field.name,
                isTicketField: true,
              };
            });

          allAttributes = [...allAttributes, ...ticketFields];
        }

        // Debug: Log the final attributes to see what's being displayed
        console.log(
          "Final attributes for table:",
          allAttributes.map((attr) => ({ name: attr.name, label: attr.label }))
        );

        setAttributes(allAttributes);
      } catch (error) {
        toast.error("Failed to load form structure");
      } finally {
        setIsLoading(false);
      }
    };

    buildAttributes();
  }, [formData?._id, formData?.event?._id, eventId, toast]);

  return (
    <RowContainer className="data-layout">
      {/* Header */}
      <PageHeader title="" description="" line={false} />

      {/* Count widgets are handled by ListTable via labels + MetricTileRender */}

      {/* Content */}
      {isLoading ? (
        <ListTableSkeleton viewMode="table" tableColumnCount={5} />
      ) : attributes.length > 0 ? (
        <>
          {/* ListTable Configuration: Backend filters by both event ID and ticket ID */}
          <ListTable
            key={`form-response-${formData?._id}-${eventId}`}
            api={`ticket-registration/form-responses`}
            labels={[
              { key: "Total Responses", title: "TOTAL RESPONSES", icon: "calendar-check", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
              { key: "Today's Responses", title: "TODAY'S RESPONSES", icon: "calendar-plus", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
            ]}
            MetricTileRender={MetricTileOverride}
            attributes={attributes}
            itemTitle={{ name: "fullName", type: "text", collection: "" }}
            shortName=""
            exportPrivilege={true}
            customClass="medium"
            viewMode="table"
            formMode="single"
            preFilter={{
              event: formData?.event?._id || eventId,
              ticket: formData?._id, // Filter by the form/ticket ID
              skip: 0,
              limit: 100,
            }}
            processData={(data) => {
              return data;
            }}
            onDataLoaded={(data) => {
              // Check if we have data
            }}
          />
        </>
      ) : (
        <NoDataFound shortName="Form Fields" icon="form-builder" description="No form fields found for this form" />
      )}
    </RowContainer>
  );
};

export default FormResponseViewer;
