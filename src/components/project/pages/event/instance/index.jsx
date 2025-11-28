import { useState, useEffect, useRef, useCallback } from "react";
import { getData } from "../../../../../backend/api";
import FormInput from "../../../../core/input";
import { Ticket } from "lucide-react";
import { GetIcon } from "../../../../../icons";

const CreateInstance = (props) => {
  const { formValues, params, onChange, id } = props;
  const [eventData, setEventData] = useState(null);
  const [groupedTickets, setGroupedTickets] = useState({ general: [], withType: [] });
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const previousEventId = useRef(null);
  const [firstLoad, setFirstLoad] = useState(true);
  // Track per-ticket user selection mode (true = choose specific users)
  const [ticketUserModes, setTicketUserModes] = useState({});
  // Track users selected per ticket id (array of user ids)
  const [usersByTicket, setUsersByTicket] = useState({});

  // Fetch event data and tickets
  useEffect(() => {
    const fetchEventData = async () => {
      const eventId = params?.event;

      // Don't fetch if event hasn't changed
      if (previousEventId.current === eventId && eventData) {
        return;
      }

      setIsLoading(true);
      previousEventId.current = eventId;

      try {
        // Fetch event details (use query param style used across the app)
        const eventResponse = await getData({ id: eventId }, "event");
        const event = (eventResponse?.data && eventResponse?.data?.response) || eventResponse?.data || null;
        // Fetch tickets for the event
        const ticketsResponse = await getData({ event: eventId }, "ticket/event-ticket");
        const tickets = ticketsResponse.data || [];

        // Set event data
        setEventData(event ? { ...event, tickets } : { tickets });

        // Group tickets
        const grouped = tickets.reduce(
          (acc, ticket) => {
            if (ticket.participantType && ticket.participantType.length > 0) {
              acc.withType.push(ticket);
            } else {
              acc.general.push(ticket);
            }
            return acc;
          },
          { general: [], withType: [] }
        );
        setGroupedTickets(grouped);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setEventData(null);
        setGroupedTickets({ general: [], withType: [] });
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.event) {
      fetchEventData();
    }
  }, [params?.event]);

  // Initialize selected tickets from formValues
  useEffect(() => {
    if (firstLoad && formValues?.ticket) {
      setFirstLoad(false);
      if (Array.isArray(formValues.ticket)) {
        const initialSelected = {};
        formValues.ticket.forEach((ticket) => {
          const ticketId = ticket._id || ticket.id || ticket;
          initialSelected[ticketId] = [ticket];
        });
        setSelectedTickets(initialSelected);
      }
    }
  }, [formValues?.ticket, firstLoad]);

  // Initialize per-ticket modes and users from existing instance users (edit case)
  useEffect(() => {
    if (!formValues || !Array.isArray(formValues.users)) return;

    const groupedByTicket = formValues.users.reduce((acc, entry) => {
      const tId = entry.ticket || entry.ticketId || entry?.ticket?._id;
      if (!tId) return acc;
      if (!acc[tId]) acc[tId] = { all: false, users: [] };
      if (entry.users === "All Users") {
        acc[tId].all = true;
      } else {
        const uid = entry._id || entry.id;
        if (uid) acc[tId].users.push(uid);
      }
      return acc;
    }, {});

    const nextModes = {};
    const nextUsers = {};
    Object.entries(groupedByTicket).forEach(([ticketId, data]) => {
      if (data.all) {
        nextModes[ticketId] = false; // auto-select all users
      } else {
        nextModes[ticketId] = true; // specific users
        nextUsers[ticketId] = data.users;
      }
    });

    if (Object.keys(nextModes).length > 0) {
      setTicketUserModes((prev) => ({ ...prev, ...nextModes }));
    }
    if (Object.keys(nextUsers).length > 0) {
      setUsersByTicket((prev) => ({ ...prev, ...nextUsers }));
    }
  }, [formValues]);

  const onSelect = useCallback(
    (e, id) => {
      const newSelectedTickets = { ...selectedTickets, [id]: e };
      setSelectedTickets(newSelectedTickets);

      // Convert to array of ticket IDs for the form (deduped)
      const ticketIds = Array.from(new Set(Object.values(newSelectedTickets).flatMap((tickets) => tickets.map((t) => t.id || t))));

      // Build value object carrying per-ticket user selections and modes
      const valueObject = {
        tickets: ticketIds,
        selection: Object.fromEntries(Object.entries(usersByTicket).map(([ticketId, users]) => [ticketId, { mode: !!ticketUserModes[ticketId], users }])),
      };

      onChange?.(valueObject, props.id, "element");
    },
    [selectedTickets, onChange, props.id, usersByTicket, ticketUserModes]
  );

  const onSelectTyped = useCallback(
    (e) => {
      const ticketId = params?.event ? `${params.event}_typed` : "typed";
      const newSelectedTickets = { ...selectedTickets, [ticketId]: e };
      setSelectedTickets(newSelectedTickets);

      // Convert to array of ticket IDs for the form (deduped)
      const ticketIds = Array.from(new Set(Object.values(newSelectedTickets).flatMap((tickets) => tickets.map((t) => t.id || t))));

      const valueObject = {
        tickets: ticketIds,
        selection: Object.fromEntries(Object.entries(usersByTicket).map(([tid, users]) => [tid, { mode: !!ticketUserModes[tid], users }])),
      };
      onChange?.(valueObject, props.id, "element");
    },
    [selectedTickets, onChange, props.id, params?.event, usersByTicket, ticketUserModes]
  );
  // Fetch and cache all users under a specific ticket when toggle is OFF
  const fetchAllUsersForTicket = useCallback(
    async (ticketId) => {
      try {
        const response = await getData({ event: params?.event, ticket: ticketId }, "instance/registered-users/select");
        const users = Array.isArray(response?.data) ? response.data : [];
        const userIds = users.map((u) => u.id || u._id || u);
        setUsersByTicket((prev) => ({ ...prev, [ticketId]: userIds }));
        return userIds;
      } catch (err) {
        console.error("Failed to fetch users for ticket", ticketId, err);
        setUsersByTicket((prev) => ({ ...prev, [ticketId]: [] }));
        return [];
      }
    },
    [params?.event]
  );

  // When tickets change, initialize mode (default OFF) and preload all users for OFF tickets
  useEffect(() => {
    const currentTicketIds = Object.values(selectedTickets)
      .flatMap((tickets) => tickets.map((t) => t.id || t))
      .filter(Boolean);
    if (currentTicketIds.length === 0) return;

    setTicketUserModes((prev) => {
      const next = { ...prev };
      currentTicketIds.forEach((tid) => {
        if (next[tid] === undefined) next[tid] = false; // default OFF
      });
      return next;
    });

    currentTicketIds.forEach((tid) => {
      if (!ticketUserModes[tid]) {
        fetchAllUsersForTicket(tid);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTickets]);

  // Handle toggle change for a ticket id
  const handleToggleTicketMode = useCallback(
    async (ticketId, nextOn) => {
      setTicketUserModes((prev) => ({ ...prev, [ticketId]: nextOn }));

      // Build latest users map reflecting this change
      let updatedUsersByTicket = { ...usersByTicket };
      if (!nextOn) {
        // OFF -> auto-select all users for the ticket
        const autoUsers = await fetchAllUsersForTicket(ticketId);
        updatedUsersByTicket = { ...updatedUsersByTicket, [ticketId]: autoUsers };
      } else {
        // ON -> clear any previously auto-selected users
        setUsersByTicket((prev) => ({ ...prev, [ticketId]: [] }));
        updatedUsersByTicket = { ...updatedUsersByTicket, [ticketId]: [] };
      }

      // Push aggregate selection upward with the updated users map and mode
      const ticketIds = Array.from(new Set(Object.values(selectedTickets).flatMap((tickets) => tickets.map((t) => t.id || t))));
      const valueObject = {
        tickets: ticketIds,
        selection: Object.fromEntries(Object.entries(updatedUsersByTicket).map(([tid, users]) => [tid, { mode: tid === ticketId ? nextOn : !!ticketUserModes[tid], users }])),
      };
      onChange?.(valueObject, props.id, "element");
    },
    [fetchAllUsersForTicket, onChange, props.id, selectedTickets, ticketUserModes, usersByTicket]
  );

  // Handle per-ticket user selection change (when toggle is ON)
  const handleUsersSelect = useCallback(
    (items, ticketId) => {
      const ids = (items || []).map((u) => u.id || u);
      setUsersByTicket((prev) => ({ ...prev, [ticketId]: ids }));

      const ticketIds = Array.from(new Set(Object.values(selectedTickets).flatMap((tickets) => tickets.map((t) => t.id || t))));
      const valueObject = {
        tickets: ticketIds,
        selection: Object.fromEntries(Object.entries({ ...usersByTicket, [ticketId]: ids }).map(([tid, users]) => [tid, { mode: !!ticketUserModes[tid], users }])),
      };
      onChange?.(valueObject, props.id, "element");
    },
    [selectedTickets, usersByTicket, ticketUserModes, onChange, props.id]
  );

  // Note: User list is handled by attributes/instance/instance.jsx via updateOn: "ticket"

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-12 bg-bg-weak rounded-lg animate-pulse"></div>
        <div className="bg-bg-white rounded-lg border border-stroke-soft p-4">
          <div className="flex items-center gap-2 mb-3 animate-pulse">
            <div className="w-4 h-4 bg-bg-weak rounded"></div>
            <div className="h-4 w-32 bg-bg-weak rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-bg-weak rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return <div className="text-center text-text-sub py-8">No event data found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Event Title */}
      <div className="bg-bg-weak rounded-lg border border-stroke-soft p-3 text-sm font-medium text-text-main">{eventData.title || "Current Event"}</div>

      {/* General Tickets */}
      {groupedTickets.general.length > 0 && (
        <div className="bg-bg-white rounded-lg border border-stroke-soft p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ticket className="w-4 h-4 text-text-sub" />
            <div className="text-sm font-medium text-text-sub">Tickets</div>
          </div>
          {(() => {
            // Build selected ids for current session (event-keyed) or from preloaded keys (ticket-keyed)
            const generalTicketIds = new Set(groupedTickets.general.map((t) => t._id || t.id));
            const selectedFromEventKey = (selectedTickets[params?.event] || []).map((t) => t.id || t);
            const selectedFromTicketKeys = Object.keys(selectedTickets).filter((k) => generalTicketIds.has(k));
            const selectedIds = selectedFromEventKey.length > 0 ? selectedFromEventKey : selectedFromTicketKeys;
            return (
              <FormInput
                selectType="card"
                type="multiSelect"
                apiType="JSON"
                selectApi={groupedTickets.general.map((ticket) => ({
                  value: ticket.title || ticket.value || "",
                  id: ticket._id || ticket.id,
                }))}
                value={selectedIds}
                onChange={onSelect}
                name="ticket"
                id={params?.event}
              />
            );
          })()}

          {/* Per-ticket controls */}
          <div className="mt-3 flex flex-col gap-2">
            {(() => {
              const generalTicketIds = new Set(groupedTickets.general.map((t) => t._id || t.id));
              const selectedFromEventKey = (selectedTickets[params?.event] || []).map((t) => t.id || t);
              const selectedFromTicketKeys = Object.keys(selectedTickets).filter((k) => generalTicketIds.has(k));
              const ids = selectedFromEventKey.length > 0 ? selectedFromEventKey : selectedFromTicketKeys;
              return ids.map((tid) => {
                const ticketObj = groupedTickets.general.find((g) => (g._id || g.id) === tid);
                const displayName = ticketObj?.title || ticketObj?.value || "Ticket";
                const isOn = !!ticketUserModes[tid];
                return (
                  <div key={tid} className="flex flex-col gap-2 p-3 border border-stroke-soft rounded-lg bg-bg-weak">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-text-main">
                        <GetIcon icon="ticket" />
                        <span>{displayName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          data-testid={`auto-select-${tid}`}
                          className={`px-3 py-1 rounded-md text-sm ${!isOn ? "bg-primary-base text-white" : "bg-bg-white text-text-main border border-stroke-soft"}`}
                          onClick={() => handleToggleTicketMode(tid, false)}
                        >
                          Auto-select all users
                        </button>
                        <button
                          type="button"
                          data-testid={`specific-users-${tid}`}
                          className={`px-3 py-1 rounded-md text-sm ${isOn ? "bg-primary-base text-white" : "bg-bg-white text-text-main border border-stroke-soft"}`}
                          onClick={() => handleToggleTicketMode(tid, true)}
                        >
                          Specific users
                        </button>
                      </div>
                    </div>
                    {isOn && (
                      <FormInput
                        key={`users_${tid}_on`}
                        type="multiSelect"
                        apiType="API"
                        selectApi={"instance/registered-users/select"}
                        params={[
                          { name: "event", value: params?.event, dynamic: false },
                          { name: "ticket", value: tid, dynamic: false },
                        ]}
                        placeholder="Select users"
                        name={`users_${tid}`}
                        label="Users"
                        value={usersByTicket[tid] ?? []}
                        onChange={(items) => handleUsersSelect(items, tid)}
                        id={`users_${tid}`}
                      />
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Participant Type Tickets */}
      {groupedTickets.withType.length > 0 && (
        <div className="bg-bg-white rounded-lg border border-stroke-soft p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ticket className="w-4 h-4 text-text-sub" />
            <div className="text-sm font-medium text-text-sub">Participant Types</div>
          </div>
          {(() => {
            const typeTicketIds = new Set(groupedTickets.withType.map((t) => t._id || t.id));
            const selectedFromEventKey = (selectedTickets[`${params?.event}_typed`] || []).map((t) => t.id || t);
            const selectedFromTicketKeys = Object.keys(selectedTickets).filter((k) => typeTicketIds.has(k));
            const selectedIds = selectedFromEventKey.length > 0 ? selectedFromEventKey : selectedFromTicketKeys;
            return (
              <FormInput
                selectType="card"
                type="multiSelect"
                apiType="JSON"
                selectApi={groupedTickets.withType.map((ticket) => ({
                  value: ticket.title || ticket.value || "",
                  id: ticket._id || ticket.id,
                }))}
                value={selectedIds}
                onChange={onSelectTyped}
                name="ticket"
                id={`${params?.event}_typed`}
              />
            );
          })()}

          {/* Per-participant-type controls */}
          <div className="mt-3 flex flex-col gap-2">
            {(() => {
              const typeTicketIds = new Set(groupedTickets.withType.map((t) => t._id || t.id));
              const selectedFromEventKey = (selectedTickets[`${params?.event}_typed`] || []).map((t) => t.id || t);
              const selectedFromTicketKeys = Object.keys(selectedTickets).filter((k) => typeTicketIds.has(k));
              const ids = selectedFromEventKey.length > 0 ? selectedFromEventKey : selectedFromTicketKeys;
              return ids.map((tid) => {
                const typeObj = groupedTickets.withType.find((g) => (g._id || g.id) === tid);
                const displayName = typeObj?.title || typeObj?.value || "Participant Type";
                const isOn = !!ticketUserModes[tid];
                return (
                  <div key={tid} className="flex flex-col gap-2 p-3 border border-stroke-soft rounded-lg bg-bg-weak">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-text-main">
                        <GetIcon icon="participantType" />
                        <span>{displayName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          data-testid={`auto-select-${tid}`}
                          className={`px-3 py-1 rounded-md text-sm ${!isOn ? "bg-primary-base text-white" : "bg-bg-white text-text-main border border-stroke-soft"}`}
                          onClick={() => handleToggleTicketMode(tid, false)}
                        >
                          Auto-select all users
                        </button>
                        <button
                          type="button"
                          data-testid={`specific-users-${tid}`}
                          className={`px-3 py-1 rounded-md text-sm ${isOn ? "bg-primary-base text-white" : "bg-bg-white text-text-main border border-stroke-soft"}`}
                          onClick={() => handleToggleTicketMode(tid, true)}
                        >
                          Specific users
                        </button>
                      </div>
                    </div>
                    {isOn && (
                      <FormInput
                        key={`users_${tid}_on`}
                        type="multiSelect"
                        apiType="API"
                        selectApi={"instance/registered-users/select"}
                        params={[
                          { name: "event", value: params?.event, dynamic: false },
                          { name: "ticket", value: tid, dynamic: false },
                        ]}
                        placeholder="Select users"
                        name={`users_${tid}`}
                        label="Users"
                        value={usersByTicket[tid] ?? []}
                        onChange={(items) => handleUsersSelect(items, tid)}
                        id={`users_${tid}`}
                      />
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {groupedTickets.general.length === 0 && groupedTickets.withType.length === 0 && <div className="text-center text-text-sub py-8">No tickets available</div>}
    </div>
  );
};

export default CreateInstance;
