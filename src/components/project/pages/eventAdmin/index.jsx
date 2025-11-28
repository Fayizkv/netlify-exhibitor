import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import { Container } from "../../../core/layout/styels";
import { checkprivilege, privileges } from "../../brand/previliage";
import { getData } from "../../../../backend/api";
import { useToast } from "../../../core/toast";
import ListTable from "../../../core/list/list";
import Message from "../../../core/message";

const EventAdmin = (props) => {
  console.log("====================================");
  console.log(props, "data from event admin");
  console.log("====================================");
  useEffect(() => {
    document.title = `Event Team Management - EventHex Portal`;
  }, []);

  const toast = useToast();
  const [availableEvents, setAvailableEvents] = useState([]);
  const [ticketTypes, setTicketTypes] = useState({});
  // Removed unused state variables since we're using view-only mode
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [expandedEventItems, setExpandedEventItems] = useState({});

  // Function to handle messages (compatible with ListTable)
  const handleSetMessage = (messageContent) => {
    setMessage(messageContent);
    setShowMessage(true);
  };

  // Function to close message
  const closeMessage = () => {
    setShowMessage(false);
  };

  // Function to toggle expanded events
  const toggleExpandedEvents = (userId) => {
    console.log("Toggling expanded events for user:", userId);
    setExpandedEventItems((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Fetch available events
  const fetchEvents = async () => {
    try {
      const response = await getData({}, "event");

      if (response.status === 200 && response.data.success) {
        setAvailableEvents(
          response.data.response.map((event) => ({
            id: event._id,
            title: event.title,
            ticketTypes: [], // Will be populated when event is selected
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Fetch ticket types for a specific event
  const fetchTicketTypes = async (eventId) => {
    try {
      const response = await getData({ event: eventId }, "ticket");

      if (response.status === 200 && response.data.success) {
        const tickets = response.data.response.map((ticket) => ({
          id: ticket._id,
          title: ticket.title,
        }));

        setTicketTypes((prev) => ({
          ...prev,
          [eventId]: tickets,
        }));

        // Update availableEvents with ticket types
        setAvailableEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, ticketTypes: tickets } : event)));
      }
    } catch (error) {
      console.error("Error fetching ticket types:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchEvents();
    // Test the user/eventAdmin API directly
    testEventAdminAPI();
  }, []);

  // Test function to call the API directly
  const testEventAdminAPI = async () => {
    try {
      console.log("=====================================");
      console.log("Testing user/eventAdmin API directly...");

      const response = await getData({}, "user/eventAdmin");

      console.log("Direct API Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);

      if (response.status === 200 && response.data?.success) {
        console.log("✅ API call successful!");
        console.log("Data count:", response.data.response?.length || 0);
        console.log("First item:", response.data.response?.[0]);
      } else {
        console.log("❌ API call failed or no data");
        console.log("Error details:", response.data);
      }
      console.log("=====================================");
    } catch (error) {
      console.error("❌ Error testing API:", error);
    }
  };

  // Define attributes for the ListTable
  const attributes = [
    {
      type: "text",
      name: "name",
      label: "Name",
      required: true,
      view: true,
      add: true,
      update: true,
      tag: true,
      filterable: true,
      searchable: true,
      customClass: "full",
    },
    {
      type: "hidden",
      placeholder: "Creating Event Admin for",
      name: "franchise",
      validation: "",
      editable: true,
      label: "Creating Event Admin for",
      group: "Event Details",
      sublabel: "",
      showItem: "",
      required: true,
      customClass: "full",
      filter: false,
      view: true,
      add: false,
      update: false,
      apiType: "API",
      footnote: "",
      selectApi: "franchise/select",
      onChange: (fieldName, values) => {
        // Clear previously selected events when franchise changes and log for debugging
        const next = { ...values, event: [], eventArray: [] };
        console.log("[EventAdmin] Franchise changed:", {
          franchise: next.franchise,
          clearedEventIds: next.event,
        });
        return next;
      },
    },
    {
      type: "text",
      name: "assignedEvents",
      label: "Event Name",
      required: false,
      view: true,
      add: false,
      update: false,
      tag: true,
      filterable: false,
      searchable: false,
      customClass: "full",
      render: (value, data, attribute) => {
        console.log("Render function called for assignedEvents:", { value, data, attribute });

        // Check if user has assigned events
        if (data.event && Array.isArray(data.event) && data.event.length > 0) {
          const events = data.event;
          const userId = data._id;
          const isExpanded = expandedEventItems[userId];
          console.log("Events found for user:", data.name, events);

          // Show first event name, and indicate if there are more
          if (events.length === 1) {
            return <span className="text-text-main">{events[0].title}</span>;
          } else {
            return (
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-text-main">{events[0].title}</span>
                  <span className="text-primary-base ml-1 cursor-pointer hover:underline" onClick={() => toggleExpandedEvents(userId)} title="Click to see all events">
                    {isExpanded ? "Show less" : `+${events.length - 1}`}
                  </span>
                </div>
                {isExpanded && (
                  <div className="mt-1 pl-2 border-l-2 border-primary-light">
                    {events.slice(1).map((event, index) => (
                      <div key={index + 1} className="text-sm text-text-sub">
                        {event.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
        }

        console.log("No events found for user:", data.name);
        return <span className="text-text-soft">All Events</span>;
      },
    },
    {
      type: "text",
      name: "userRole",
      label: "Role",
      required: false,
      view: true,
      add: false,
      update: false,
      tag: true,
      filterable: false,
      searchable: false,
      customClass: "half",
      render: (value, data, attribute) => {
        console.log("Render function called for userRole:", { value, data, attribute });

        // Display the role from userType object
        const role = data.userType?.roleDisplayName || data.userType?.role || "No Role Assigned";
        console.log("User role extracted:", role, "for user:", data.name);

        return (
          <div className="text-sm">
            <span className="font-medium text-text-main">{role}</span>
          </div>
        );
      },
    },
    {
      type: "text",
      name: "email",
      label: "Email",
      required: true,
      view: false,
      add: true,
      update: true,
      tag: false,
      filterable: true,
      searchable: true,
      customClass: "full",
    },
    {
      type: "text",
      name: "password",
      label: "Password",
      required: true,
      view: false,
      add: true,
      update: false,
      tag: false,
      filterable: false,
      searchable: false,
      customClass: "full",
    },
    {
      type: "hidden",
      name: "password",
      label: "Password",
      required: false,
      view: false,
      add: true,
      update: false,
      customClass: "full",
    },
    {
      type: "multiSelect",
      name: "event",
      label: "Assigned Events",
      required: true,
      group: "Event Details",
      view: false,
      add: true,
      update: false,
      tag: false,
      filterable: false,
      apiType: "API",
      selectApi: "event/select-event",
      // Update this list when franchise changes so only that franchise's
      // events are fetched and displayed in this dropdown
      updateOn: "franchise",
      // Pass currently selected franchise to the select API so it filters events
      params: [
        { name: "franchise", dynamic: true },
      ],
      onChange: (fieldName, values) => {
        // Log franchise and selected events whenever events change
        console.log("[EventAdmin] Events updated:", {
          franchise: values.franchise,
          eventIds: values.event,
        });
        return values;
      },
      showItem: "title",
      customClass: "full",
      arrayOut: true,
      selectType: "dropdown",
      hideSelectAll: true,
    },
  ];

  // Removed custom form attributes since we're using view-only mode

  // Custom actions for the ListTable - removed edit action to show only view
  const actions = [
    // No custom actions - only view functionality
  ];

  // Custom dot menu actions
  const dotMenu = [
    {
      key: "viewDetails",
      label: "View Details",
      handler: (item) => {
        console.log("View details for:", item);
      },
    },
    {
      key: "resetPassword",
      label: "Reset Password",
      handler: (item) => {
        console.log("Reset password for:", item);
      },
    },
  ];

  // Header actions
  const headerActions = [
    {
      key: "bulkAssign",
      label: "Bulk Assign",
      icon: "users",
      onClick: () => {
        toast.info("Bulk assign functionality coming soon!");
      },
    },
  ];

  // Statistics/metrics display
  const labels = [
    {
      key: "Event Admins",
      title: "EVENT ADMINS",
      icon: "user-check",
      backgroundColor: "rgba(59, 130, 246, 0.15)",
      color: "#1d4ed8",
    },
    {
      key: "Ticket Admins",
      title: "TICKET ADMINS",
      icon: "ticket",
      backgroundColor: "rgba(16, 185, 129, 0.15)",
      color: "#059669",
    },
    {
      key: "Total Members",
      title: "TOTAL MEMBERS",
      icon: "users",
      backgroundColor: "rgba(139, 92, 246, 0.15)",
      color: "#7c3aed",
    },
  ];

  // Removed custom form submission handler since we're using view-only mode

  const { userType } = props;

  return (
    <Container className="noshadow">
      <div className="w-full">
        {/* ListTable Component */}
        <ListTable
          api="user/eventAdmin"
          shortName="Teams"
          pluralName="Teams"
          icon="users"
          attributes={attributes}
          actions={actions}
          dotMenu={dotMenu}
          headerActions={headerActions}
          // labels={labels}
          viewMode="table"
          formMode="popup"
          popupMode="medium"
          rowLimit={10}
          showFilters={true}
          addPrivilege={true}
          showSearch={true}
          showPagination={true}
          createPrivilege={true}
          updatePrivilege={false}
          delPrivilege={true}
          exportPrivilege={true}
          printPrivilege={false}
          bulkUplaod={false}
          allowCustomFilter={true}
          allowRangeFilter={false}
          defaultSort={{ field: "name", order: "asc" }}
          onDataLoaded={(data) => {
            console.log("=====================================");
            console.log("Team members data loaded:", data);
            console.log("API Response Structure:", {
              success: data?.success,
              response: data?.response,
              count: data?.response?.length,
              firstItem: data?.response?.[0],
            });
            console.log("=====================================");
          }}
          setMessage={handleSetMessage}
          // Disable row click popup
          openPage={false}
          itemOpenMode={null}
        />

        {/* Removed custom modal since we're using view-only mode */}

        {/* Message Component for Confirmations */}
        {showMessage && message && <Message message={message} closeMessage={closeMessage} setLoaderBox={() => {}} showMessage={showMessage} />}
      </div>
    </Container>
  );
};

export default Layout(EventAdmin);
