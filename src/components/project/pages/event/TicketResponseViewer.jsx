import React, { useState, useEffect } from "react";
import { RowContainer } from "../../../styles/containers/styles";
import ListTable from "../../../core/list/list";
import { useToast } from "../../../core/toast";
import { getData } from "../../../../backend/api";
import { ListTableSkeleton } from "../../../core/loader/shimmer";
import { allCountries } from "./attributes/countries";

const TicketResponseViewer = ({ ticketData, eventId, onClose }) => {
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardCountData, setDashboardCountData] = useState(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const toast = useToast();
  // Fetch ticket-specific registration counts
  useEffect(() => {
    const fetchTicketCounts = async () => {
      const eventIdToUse = ticketData?.event?._id || eventId;
      const ticketIdToUse = ticketData?._id;

      if (!eventIdToUse || !ticketIdToUse) {
        setDashboardCountData(null);
        return;
      }

      setIsLoadingCounts(true);
      try {
        // Get today's date for filtering today's registrations
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Fetch total registrations for this ticket
        const totalResponse = await getData(
          {
            event: eventIdToUse,
            ticket: ticketIdToUse,
            type: "Ticket",
            skip: 0,
            limit: 1000, // Get a large number to count all
          },
          "ticket-registration"
        );

        // Fetch today's registrations for this ticket
        const todayResponse = await getData(
          {
            event: eventIdToUse,
            ticket: ticketIdToUse,
            type: "Ticket",
            startDate: todayStart.toISOString(),
            endDate: todayEnd.toISOString(),
            skip: 0,
            limit: 1000,
          },
          "ticket-registration"
        );


        const totalCount = totalResponse?.data?.response?.length || 0;
        const todayCount = todayResponse?.data?.response?.length || 0;

        // Calculate total amount from registrations
        let totalAmount = 0;
        if (totalResponse?.data?.response) {
          totalAmount = totalResponse.data.response.reduce((sum, registration) => {
            return sum + (registration.amount || 0);
          }, 0);
        }

        const counts = [
          {
            count: totalCount,
            icon: "registration",
            title: "TOTAL REGISTRATIONS",
          },
          {
            count: todayCount,
            icon: "date",
            title: "TODAY'S REGISTRATIONS",
          },
          {
            count: totalAmount,
            icon: "currency",
            title: "TOTAL TICKET AMOUNT",
          },
        ];

        setDashboardCountData(counts);
      } catch (error) {
        console.error("[TicketResponseViewer] Error fetching ticket counts:", error);
        toast.error("Error loading ticket statistics");
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchTicketCounts();
  }, [ticketData?.event?._id, ticketData?._id, eventId, toast]);

  // Build attributes for the ListTable
  useEffect(() => {
    const buildAttributes = async () => {
      if (!ticketData?._id) return;

      setIsLoading(true);
      try {
        // Fetch both event form fields and ticket form fields
        const [eventFormResponse, ticketFormResponse] = await Promise.all([
          // Get event form fields
          getData(
            {
              event: ticketData.event?._id || eventId,
            },
            `event-form-fields`
          ),

          // Get ticket form fields
          getData(
            {
              ticket: ticketData._id,
              eventId: ticketData.event?._id || eventId,
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
          },
          {
            type: "text",
            placeholder: "Name",
            name: "firstName",
            label: "Name",
            required: false,
            view: false,
            add: true,
            update: true,
            tag: false,
            export: false,
          },
          {
            type: "text",
            placeholder: "Email",
            name: "emailId",
            label: "Email",
            required: false,
            view: true,
            add: true,
            update: true,
            tag: true,
            export: true,
          },
          {
            type: "text",
            placeholder: "Phone",
            name: "authenticationId",
            label: "Phone",
            required: false,
            view: true,
            add: false,
            update: false,
            tag: true,
            export: true,
          },
          {
            type: "mobilenumber",
            placeholder: "Phone",
            name: "authenticationId",
            label: "Phone",
            required: false,
            view: false,
            add: true,
            update: true,
            tag: false,
            export: false,
            countries: allCountries,
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
            placeholder: "Company Name",
            name: "company",
            label: "Company Name",
            required: false,
            view: true,
            add: true,
            update: true,
            tag: true,
            export: true,
            collection: "formData",
            showItem: "company",
          },
        ];

        // Track used field names to avoid duplicates
        const usedFieldNames = new Set(["_id", "fullName", "emailId", "authenticationId", "createdAt", "company", "firstName"]);

        // Fields that should not be displayed as tags (repetitive or already shown)
        const hiddenFieldNames = new Set([
          "fullName",
          "emailId",
          "authenticationId",
          "firstName",
          "createdAt",
          "company",
          "name",
          "Name",
          "Your Name",
          "Event Name",
          "email",
          "Email",
          "Email ID",
          "Event Email ID",
          "phone",
          "Phone",
          "mobileNumber",
          "Mobile Number",
          "Event Mobile Number",
          "mobile",
          "Mobile",
          "contactPersonphone",
          "company",
          "companyName",
          "Company",
          "Company Name",
        ]);

        let allAttributes = [...baseAttributes];

        // Add event form fields with unique names
        if (eventFormResponse?.status === 200 && eventFormResponse?.data?.response) {
          const eventFields = eventFormResponse.data.response
            .filter((field) => field.view && !["info", "title", "line", "html"].includes(field.type))
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

              // Check if this field should be hidden from tags (repetitive fields)
              const shouldHideTag =
                hiddenFieldNames.has(field.name) ||
                hiddenFieldNames.has(field.label) ||
                field.name.toLowerCase().includes("company") ||
                field.name.toLowerCase().includes("phone") ||
                field.name.toLowerCase().includes("mobile") ||
                field.name.toLowerCase().includes("email") ||
                field.name.toLowerCase().includes("name");

              const baseField = {
                type: field.type,
                placeholder: field.placeholder || field.label,
                name: uniqueName,
                label: uniqueLabel,
                required: false,
                view: true,
                add: false,
                update: false,
                tag: !shouldHideTag, // Hide tag if field should be hidden
                export: true,
                collection: "formData", // Event form data is stored in formData
                showItem: field.showItem || field.name,
                // Store original field name for data mapping
                originalName: field.name,
                isEventField: true,
              };

              // Add countries prop for mobilenumber fields
              if (field.type === "mobilenumber") {
                baseField.countries = allCountries;
              }

              return baseField;
            });

          allAttributes = [...allAttributes, ...eventFields];
        }

        // Add ticket form fields with unique names
        if (ticketFormResponse?.status === 200 && ticketFormResponse?.data?.response) {
          const ticketFields = ticketFormResponse.data.response
            .filter((field) => field.view && !["info", "title", "line", "html"].includes(field.type))
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

              // Check if this field should be hidden from tags (repetitive fields)
              const shouldHideTag =
                hiddenFieldNames.has(field.name) ||
                hiddenFieldNames.has(field.label) ||
                field.name.toLowerCase().includes("company") ||
                field.name.toLowerCase().includes("phone") ||
                field.name.toLowerCase().includes("mobile") ||
                field.name.toLowerCase().includes("email") ||
                field.name.toLowerCase().includes("name");

              const baseField = {
                type: field.type,
                placeholder: field.placeholder || field.label,
                name: uniqueName,
                label: uniqueLabel,
                required: false,
                view: true,
                add: false,
                update: false,
                tag: !shouldHideTag, // Hide tag if field should be hidden
                export: true,
                collection: "formData", // Ticket form data is also stored in formData
                showItem: field.showItem || field.name,
                // Store original field name for data mapping
                originalName: field.name,
                isTicketField: true,
              };

              // Add countries prop for mobilenumber fields
              if (field.type === "mobilenumber") {
                baseField.countries = allCountries;
              }

              return baseField;
            });

          allAttributes = [...allAttributes, ...ticketFields];
        }

        setAttributes(allAttributes);
      } catch (error) {
        console.error("Error building attributes:", error);
        toast.error("Failed to load form structure");
      } finally {
        setIsLoading(false);
      }
    };

    buildAttributes();
  }, [ticketData?._id, ticketData?.event?._id, eventId, toast]);

    return (
    <RowContainer className="data-layout">
     
      {/* Content */}
      {isLoading ? (
        <ListTableSkeleton viewMode="table" tableColumnCount={5} />
      ) : (
        <ListTable
          api={`ticket-registration`}
          labels={[
            { key: "Total Registrations", title: "TOTAL REGISTRATIONS", icon: "calendar-check", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
            { key: "Today's Registrations", title: "TODAY'S REGISTRATIONS", icon: "calendar-plus", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
            { key: "Total Ticket Amount", title: "TOTAL TICKET AMOUNT", icon: "currency", backgroundColor: "rgba(255, 99, 71, 0.15)", color: "#99231b" },
          ]}
          attributes={attributes}
          itemTitle={{ name: "fullName", type: "text", collection: "" }}
          shortName="Responses"
          addLabel={{ label: "Add New", icon: "add" }}
          addPrivilege={true}
          updatePrivilege={true}
          delPrivilege={true}
          exportPrivilege={false}
          showEditInDotMenu={true}
          popupMode="medium"
          popupMenu="vertical-menu"
          preFilter={{
            event: ticketData?.event?._id || eventId,
            ticket: ticketData?._id, // Add ticket filter
            type: "Ticket",
            skip: 0,
            limit: 25,
          }}
          parents={{
            event: ticketData?.event?._id || eventId,
            ticket: ticketData?._id, // Add ticket filter
            type: "Ticket",
          }}
          onDataLoaded={(data) => {
            console.log("ListTable data loaded:", data);
            console.log("API endpoint:", `ticket-registration`);
            console.log("PreFilter:", {
              event: ticketData?.event?._id || eventId,
              ticket: ticketData?._id,
              type: "Ticket",
            });
          }}
        />
      )}
    </RowContainer>
  );
};

export default TicketResponseViewer;
