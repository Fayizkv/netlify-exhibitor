import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import { checkprivilege, privileges } from "../../brand/previliage";
import { getData, postData, putData, deleteData } from "../../../../backend/api";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons/index.jsx";
import { PageHeader } from "../../../core/input/heading/index.jsx";
import CustomSelect from "../../../core/select";

const EventTicketAdmin = (props) => {
  console.log("props in ticket admin page", props);
  useEffect(() => {
    document.title = `Events & Admin Assignment - EventHex Portal`;
  }, []);

  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showManageModal, setShowManageModal] = useState(false);
  const [showHelloModal, setShowHelloModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventAdmins, setEventAdmins] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [ticketRegistrations, setTicketRegistrations] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    member: "",
    role: "Event Admin",
  });

  // Add eventId state and set it up using the same method as sessions page
  const [eventId, setEventId] = useState(props.openData?.data?._id);

  // Show more/less state for administrators
  const [showMoreEventAdmins, setShowMoreEventAdmins] = useState({});
  const [showMoreTicketAdmins, setShowMoreTicketAdmins] = useState({});
  const [showMoreTickets, setShowMoreTickets] = useState({});

  // Fetch events and admins data
  useEffect(() => {
    fetchEventsData();
    fetchEventAdminMembers(); // Use the new function to fetch from eventAdmin API
    fetchTicketRegistrations();

    console.log("eventId in ticket admin page", eventId);
  }, [eventId]); // Add eventId dependency to refetch when event changes

  // Refetch events when search term changes
  useEffect(() => {
    if (searchTerm !== "") {
      fetchEventsData();
    }
  }, [searchTerm]);

  // Update eventId when props change (same pattern as sessions page)
  useEffect(() => {
    if (props.openData?.data?._id) {
      setEventId(props.openData.data._id);
      console.log("Event ID set in TicketAdmin:", props.openData.data._id);
    }
  }, [props.openData?.data?._id]);

  const fetchEventsData = async () => {
    try {
      setLoading(true);

      // Fetch events first - use eventId if available, similar to sessions page pattern
      const eventParams = { searchkey: searchTerm, skip: 0, limit: 50 };
      if (eventId) {
        eventParams._id = eventId;
      }
      const eventsResponse = await getData(eventParams, "event");

      if (eventsResponse.status === 200 && eventsResponse.data?.success) {
        const eventsData = eventsResponse.data.response || [];

        // Fetch BOTH ticket-admins and event-admins, then merge by event
        const [ticketAdminsRes, eventAdminsRes] = await Promise.all([
          getData({ searchkey: "", skip: 0, limit: 50 }, "user/ticket-admin"),
          getData({ searchkey: "", skip: 0, limit: 50 }, "user/eventAdmin"),
        ]);

        if ((ticketAdminsRes.status === 200 || ticketAdminsRes.status === 204) && (eventAdminsRes.status === 200 || eventAdminsRes.status === 204)) {
          const eventMap = {};

          const addAdminToEvent = (admin, eventItem, roleLabel, ticketsFromAdmin) => {
            if (!eventItem || !eventItem._id) return;
            if (!eventMap[eventItem._id]) {
              eventMap[eventItem._id] = {
                _id: eventItem._id,
                title: eventItem.title,
                startDate: eventItem.startDate || "2024-03-11",
                administrators: [],
                tickets: [],
              };
            }
            eventMap[eventItem._id].administrators.push({
              id: admin._id,
              name: admin.name || admin.email,
              email: admin.email,
              role: roleLabel,
              tickets: ticketsFromAdmin || [],
            });
          };

          const ticketAdmins = Array.isArray(ticketAdminsRes.data?.response) ? ticketAdminsRes.data.response : [];
          ticketAdmins.forEach((admin) => {
            if (Array.isArray(admin.event)) {
              admin.event.forEach((ev) => {
                const ticketsForThisEvent = Array.isArray(admin.ticket) ? admin.ticket.filter((t) => t.event === ev._id).map((t) => t.title) : [];
                addAdminToEvent(admin, ev, "Ticket Admin", ticketsForThisEvent);
              });
            }
          });

          const eventAdmins = Array.isArray(eventAdminsRes.data?.response) ? eventAdminsRes.data.response : [];
          eventAdmins.forEach((admin) => {
            if (Array.isArray(admin.event)) {
              admin.event.forEach((ev) => addAdminToEvent(admin, ev, "Event Organizer", []));
            } else if (admin.event && admin.event._id) {
              addAdminToEvent(admin, admin.event, "Event Organizer", []);
            }
          });

          // Merge events with admin data
          const enrichedEvents = eventsData.map((event) => {
            const adminData = eventMap[event._id] || { administrators: [], tickets: [] };
            return {
              ...event,
              administrators: adminData.administrators,
            };
          });

          setEvents(enrichedEvents);
        } else {
          // If admin fetch fails, still show events without admin data
          setEvents(eventsData);
        }
      } else {
        toast.error("Failed to fetch events data");
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events data:", error);
      toast.error("Error loading events data");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Fetch both event admins and ticket admins using proper API methods
      const [eventAdminResponse, ticketAdminResponse] = await Promise.all([
        getData({ searchkey: "", skip: 0, limit: 50 }, "user/eventAdmin"),
        getData({ searchkey: "", skip: 0, limit: 50 }, "user/ticket-admin"),
      ]);

      const allMembers = [];

      if (eventAdminResponse.status === 200 && eventAdminResponse.data?.success) {
        if (eventAdminResponse.data.response && Array.isArray(eventAdminResponse.data.response)) {
          eventAdminResponse.data.response.forEach((admin) => {
            allMembers.push({
              id: admin._id,
              name: admin.name,
              email: admin.email,
              type: "Event Admin",
            });
          });
        }
      }

      if (ticketAdminResponse.status === 200 && ticketAdminResponse.data?.success) {
        if (ticketAdminResponse.data.response && Array.isArray(ticketAdminResponse.data.response)) {
          ticketAdminResponse.data.response.forEach((admin) => {
            if (!allMembers.find((m) => m.id === admin._id)) {
              allMembers.push({
                id: admin._id,
                name: admin.name,
                email: admin.email,
                type: "Ticket Admin",
              });
            }
          });
        }
      }

      setTeamMembers(allMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Error loading team members");
    }
  };

  const fetchTicketRegistrations = async () => {
    try {
      // Use eventId if available, similar to sessions page pattern
      const params = { searchkey: "", skip: 0, limit: 100 };
      if (eventId) {
        params.event = eventId;
      }

      const response = await getData(params, "ticket-registration/all");

      if (response.status === 200 && response.data?.success) {
        const registrations = response.data.response || [];
        console.log("Ticket registrations data:", registrations);
        setTicketRegistrations(registrations);
      } else {
        console.log("No ticket registrations found or API error:", response);
        setTicketRegistrations([]);
      }
    } catch (error) {
      console.error("Error fetching ticket registrations:", error);
      toast.error("Error loading ticket registrations");
      setTicketRegistrations([]);
    }
  };

  // Fetch team members from eventAdmin API
  const fetchEventAdminMembers = async () => {
    try {
      const params = { searchkey: "", userType: "", event: "", skip: 0, limit: 50 };
      if (eventId) {
        params.event = eventId;
      }

      console.log("Fetching event admin members with params:", params);
      const response = await getData(params, "user/eventAdmin");

      if (response.status === 200 && response.data?.success) {
        const members = response.data.response || [];
        console.log("Event admin members data:", members);

        // Transform the data to match the CustomSelect format
        const transformedMembers = members.map((member) => ({
          id: member._id,
          value: member.name || member.email || member._id,
          label: member.name || member.email || member._id,
          userType: member.userType,
          email: member.email,
          event: member.event,
        }));

        console.log("Transformed team members:", transformedMembers);
        setTeamMembers(transformedMembers);
      } else {
        console.log("No event admin members found or API error:", response);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error("Error fetching event admin members:", error);
      toast.error("Error loading team members");
      setTeamMembers([]);
    }
  };

  const openManageModal = async (event) => {
    console.log("Opening manage modal for event:", event);
    setSelectedEvent(event);
    setEventAdmins(event.administrators || []);

    // Filter out members who are already assigned to this event
    const availableMembersForEvent = teamMembers.filter((member) => !event.administrators.some((admin) => admin.id === member.id));
    setAvailableMembers(availableMembersForEvent);

    setShowManageModal(true);
    console.log("Modal should now be visible");
    console.log("Available members for this event:", availableMembersForEvent);
  };

  const addNewAssignment = () => {
    if (!newAssignment.member) return;

    const member = teamMembers.find((m) => m.id === newAssignment.member);
    if (!member) return;

    const newAdmin = {
      id: member.id,
      name: member.value, // Use value since that's what we set in the transformed data
      email: member.email,
      role: newAssignment.role,
      tickets: [],
    };

    setEventAdmins([...eventAdmins, newAdmin]);
    setAvailableMembers((prev) => prev.filter((m) => m.id !== member.id));
    setNewAssignment({ member: "", role: "Event Admin" });

    // Here you would make an API call to actually assign the role
    console.log("Adding assignment:", newAdmin, "to event:", selectedEvent.title);
  };

  const removeAdmin = (adminId) => {
    const adminToRemove = eventAdmins.find((admin) => admin.id === adminId);
    setEventAdmins(eventAdmins.filter((admin) => admin.id !== adminId));

    // Add the removed member back to available members
    const removedMember = teamMembers.find((m) => m.id === adminId);
    if (removedMember && !availableMembers.find((m) => m.id === adminId)) {
      setAvailableMembers([...availableMembers, removedMember]);
    }

    // Here you would make an API call to remove the assignment
    console.log("Removing admin:", adminToRemove, "from event:", selectedEvent.title);
  };

  // Helper functions for show more/less functionality
  const toggleShowMoreEventAdmins = (eventId) => {
    setShowMoreEventAdmins((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const toggleShowMoreTicketAdmins = (eventId) => {
    setShowMoreTicketAdmins((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const toggleShowMoreTickets = (adminId) => {
    setShowMoreTickets((prev) => ({
      ...prev,
      [adminId]: !prev[adminId],
    }));
  };

  // Custom render function for the venue column to show admin information
  const renderAdminInfo = (value, data, attribute) => {
    const eventAdmins = data.administrators?.filter((admin) => admin.role === "Event Admin" || admin.role === "Event Organizer") || [];
    const ticketAdmins = data.administrators?.filter((admin) => admin.role === "Ticket Admin") || [];

    return (
      <div className="flex flex-col gap-2">
        {/* Event Admins */}
        <div>
          <div className="text-xs font-medium text-text-sub mb-1">Event Admins:</div>
          {eventAdmins.length > 0 ? (
            <div className="space-y-1">
              {eventAdmins.slice(0, 2).map((admin, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-text-main">{admin.name}</div>
                  <div className="text-xs text-text-sub">{admin.email}</div>
                </div>
              ))}
              {eventAdmins.length > 2 && (
                <button onClick={() => toggleShowMoreEventAdmins(data._id)} className="text-xs text-primary-base hover:underline">
                  {showMoreEventAdmins[data._id] ? "Show Less" : `Show ${eventAdmins.length - 2} More`}
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-text-soft italic">No event admin assigned</div>
          )}
        </div>

        {/* Ticket Admins */}
        <div>
          <div className="text-xs font-medium text-text-sub mb-1">Ticket Admins:</div>
          {ticketAdmins.length > 0 ? (
            <div className="space-y-1">
              {ticketAdmins.slice(0, 2).map((admin, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-text-main">{admin.name}</div>
                  <div className="text-xs text-text-sub">{admin.email}</div>
                  {admin.tickets && admin.tickets.length > 0 && (
                    <div className="mt-1">
                      <div className="text-xs text-text-soft">Tickets ({admin.tickets.length}):</div>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {admin.tickets.slice(0, 3).map((ticket, ticketIndex) => (
                          <span key={ticketIndex} className="bg-state-success/20 text-state-success px-1 py-0.5 rounded text-xs">
                            {ticket}
                          </span>
                        ))}
                        {admin.tickets.length > 3 && (
                          <button onClick={() => toggleShowMoreTickets(admin.id)} className="text-xs text-primary-base hover:underline bg-state-success/20 px-1 py-0.5 rounded">
                            {showMoreTickets[admin.id] ? "Show Less" : `+${admin.tickets.length - 3} more`}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {ticketAdmins.length > 2 && (
                <button onClick={() => toggleShowMoreTicketAdmins(data._id)} className="text-xs text-primary-base hover:underline">
                  {showMoreTicketAdmins[data._id] ? "Show Less" : `Show ${ticketAdmins.length - 2} More`}
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-text-soft italic">No ticket admin assigned</div>
          )}
        </div>
      </div>
    );
  };

  // Custom render function for actions column
  const renderActions = (value, data, attribute) => {
    return (
      <button onClick={() => openManageModal(data)} className="text-primary-base hover:text-primary-dark font-medium text-sm">
        Manage Access
      </button>
    );
  };

  // Define the attributes for the ListTable
  const attributes = [
    {
      type: "text",
      name: "title",
      label: "Event Name",
      required: true,
      tag: true,
      view: true,
      add: false,
      update: false,
      customClass: "full",
    },
    {
      type: "datetime",
      name: "startDate",
      label: "Event Date",
      tag: true,
      required: true,
      view: true,
      add: false,
      update: false,
      customClass: "half",
    },
    {
      type: "text",
      name: "venue",
      label: "Administrators",
      required: false,
      view: true,
      tag: true,
      add: false,
      update: false,
      customClass: "full",
      render: renderAdminInfo,
    },
    {
      type: "text",
      name: "actions",
      label: "Actions",
      required: false,
      view: true,
      add: false,
      update: false,
      customClass: "quarter",
      render: renderActions,
    },
  ];

  // Define actions for the ListTable
  const actions = [
    {
      element: "button",
      type: "callback",
      callback: () => setShowHelloModal(true),
      icon: "add",
      title: "Manage Access",
      params: {
        customClass: "full-page",
      },
      actionType: "button",
    },
  ];

  return (
    <Container className="noshadow">
      <ListTable
        itemDescription={{ name: "startDate", type: "datetime" }}
        rowLimit={10}
        showInfo={false}
        viewMode="table"
        showFilter={true}
        itemOpenMode={{ type: "open" }}
        icon="event"
        addLabel={false}
        submitButtonText={"Create"}
        showInfoType={"edit"}
        displayColumn={"triple"}
        profileImage={"logo"}
        enableFullScreen={true}
        bulkUplaod={false}
        formLayout={"center medium"}
        formTabTheme={"steps"}
        isSingle={false}
        popupMode="full-page"
        popupMenu={"vertical-menu"}
        parentReference={"event"}
        actions={actions}
        showTitle={true}
        description="Overview of events and their assigned administrators"
        api="event"
        itemTitle={{ name: "title", type: "text", collection: "" }}
        formMode="double"
        labels={[
          { key: "Live Events", title: "LIVE EVENTS", icon: "calendar-check", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
          { key: "Upcoming Events", title: "UPCOMING EVENTS", icon: "calendar-plus", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
          { key: "Archive", title: "PAST EVENTS", icon: "calendar-minus", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
          { key: "Total Events", title: "TOTAL EVENTS", icon: "calendar-alt", backgroundColor: "rgba(88, 86, 214, 0.15)", color: "#2B2A69" },
        ]}
        {...props}
        addPrivilege={false}
        updatePrivilege={false}
        attributes={attributes}
        subPageAuthorization={true}
        dotMenu={true}
        showEditInDotMenu={true}
        showDeleteInDotMenu={true}
        delPrivilege={true}
      />

      {/* Manage Access Modal */}
      {showHelloModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "700px",
              maxHeight: "80vh",
              overflow: "auto",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              {/* <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Manage Access for Event
              </h3> */}

              <PageHeader title={"Manage Access for Event"} description="Current Administrators" />
              <button onClick={() => setShowHelloModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            {/* Current Administrators */}
            <div style={{ marginBottom: "32px" }}>
              {/* <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Current Administrators
              </h4> */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "500", fontSize: "16px", marginBottom: "4px" }}>Admin 1</div>
                  <span
                    style={{
                      backgroundColor: "#d1fae5",
                      color: "#059669",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    Ticket Admin
                  </span>
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Tickets: A+ Mudra</div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          backgroundColor: "#f3e8ff",
                          color: "#7c3aed",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "11px",
                        }}
                      >
                        A+ Mudra
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3b82f6",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    🔧
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            {/* Add New Administrator */}
            <div>
              <div style={{ display: "flex", gap: "12px", alignItems: "end" }}>
                <div style={{ flex: 1 }}>
                  <CustomSelect
                    id="member-select"
                    name="member"
                    value={newAssignment.member}
                    onSelect={(option) => setNewAssignment((prev) => ({ ...prev, member: option.id }))}
                    apiType="JSON"
                    selectApi={teamMembers.map((member) => ({
                      id: member.id,
                      value: member.value,
                      label: member.label,
                      userType: member.userType,
                      email: member.email,
                    }))}
                    placeholder="Select Team Member"
                    label="Select Team Member"
                    className="w-full"
                    showItem="value"
                  />
                  {console.log("CustomSelect team members data:", teamMembers)}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Assign Role</label>
                  <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="radio"
                        name="role"
                        value="Event Admin"
                        checked={newAssignment.role === "Event Admin"}
                        onChange={() => setNewAssignment((prev) => ({ ...prev, role: "Event Admin" }))}
                      />
                      Event Admin
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="radio"
                        name="role"
                        value="Ticket Admin"
                        checked={newAssignment.role === "Ticket Admin"}
                        onChange={() => setNewAssignment((prev) => ({ ...prev, role: "Ticket Admin" }))}
                      />
                      Ticket Admin
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Done Button */}
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowHelloModal(false)}
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Layout(EventTicketAdmin);
