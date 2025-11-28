import { useState, useEffect, useRef, useCallback } from "react";
import { getData } from "../../../../../backend/api";
import FormInput from "../../../../core/input";
import { Users, Ticket, Phone, Mail } from "lucide-react";

// Custom debounce hook
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

const StatsShimmer = () => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100  sticky top-0 z-10">
    <div className="flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const TicketSectionShimmer = () => (
  <div className="flex flex-col gap-4">
    <div className="h-8 bg-gray-200 rounded-lg w-full animate-pulse"></div>
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3 animate-pulse">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  </div>
);

const CreateAudience = (props) => {
  const { formValues, params, onChange } = props;
  const [eventData, setEventData] = useState([]);
  const previousEventIds = useRef([]);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [totalRegistrants, setTotalRegistrants] = useState(0);
  const [uniqueRegistrants, setUniqueRegistrants] = useState(0);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const onChangeTimeoutRef = useRef(null);
  const [firstLoad, setFirstLoad] = useState(true);

  const calculateTotalRegistrants = useCallback(
    (newSelectedTickets) => {
      let total = 0;

      Object.entries(newSelectedTickets).forEach(([eventId, selectedEventTickets]) => {
        const actualEventId = eventId.replace("_typed", "");
        const event = eventData.find((e) => e._id === actualEventId);

        if (!event || !Array.isArray(selectedEventTickets)) return;

        selectedEventTickets.forEach((selectedTicket) => {
          const generalTicket = event.groupedTickets?.general?.find((t) => t.id === selectedTicket.id);
          const typedTicket = event.groupedTickets?.withType?.find((t) => t.id === selectedTicket.id);
          const ticketData = generalTicket || typedTicket;
          if (ticketData?.bookingCount) {
            total += parseInt(ticketData.bookingCount);
          }
        });
      });

      return total;
    },
    [eventData]
  );

  const fetchUniqueRegistrants = useCallback(
    async (newSelectedTickets) => {
      setIsLoadingStats(true);
      try {
        const selectedTicketIds = Object.values(newSelectedTickets).flatMap((t) => t.map((t) => t.id));
        if (selectedTicketIds.length === 0) {
          setUniqueRegistrants(0);
          setTotalRegistrants(0);
          if (onChangeTimeoutRef.current) {
            clearTimeout(onChangeTimeoutRef.current);
          }
          onChange?.(null, props.id, "element");
          setIsLoadingStats(false);
          return;
        }

        // Clear any pending timeout before setting a new one
        if (onChangeTimeoutRef.current) {
          clearTimeout(onChangeTimeoutRef.current);
        }

        // Set new timeout with API call inside
        onChangeTimeoutRef.current = setTimeout(async () => {
          try {
            const response = await getData(
              { tickets: selectedTicketIds, event: params?.event, excludeAlreadyRegistered: formValues?.excludeAlreadyRegistered, eventSelection: formValues?.eventSelection },
              "event/unique-registrants"
            );
            const data = response.data.data;
            const hasRegistrants = data.uniqueRegistrants.phone > 0 || data.uniqueRegistrants.email > 0;
            setUniqueRegistrants(data.uniqueRegistrants);
            setTotalRegistrants(data.totalRegistrants);
            onChange?.(hasRegistrants > 0 ? JSON.stringify({ data: newSelectedTickets, tickets: selectedTicketIds, events: formValues?.events }) : null, props.id, "element");
          } catch (error) {
            console.error("Error fetching unique registrants:", error);
            setUniqueRegistrants(0);
            setTotalRegistrants(0);
            onChange?.(null, props.id, "element");
          } finally {
            setIsLoadingStats(false);
            onChangeTimeoutRef.current = null;
          }
        }, 500);
      } catch (error) {
        console.error("Error in fetchUniqueRegistrants:", error);
        setUniqueRegistrants(0);
        setTotalRegistrants(0);
        onChange?.(null, props.id, "element");
      }
    },
    [onChange, props.id, formValues?.events, params?.event, formValues?.excludeAlreadyRegistered, formValues?.eventSelection]
  );

  const debouncedFetchUniqueRegistrants = useDebounce(fetchUniqueRegistrants, 1000);

  const onSelect = useCallback(
    async (e, id) => {
      setIsLoadingStats(true);
      onChange?.(null, props.id, "element");
      const newSelectedTickets = { ...selectedTickets, [id]: e };
      setSelectedTickets(newSelectedTickets);

      // Calculate total registrants immediately
      const total = calculateTotalRegistrants(newSelectedTickets);
      setTotalRegistrants(total);

      // Debounce the unique registrants fetch
      debouncedFetchUniqueRegistrants(newSelectedTickets);
    },
    [selectedTickets, calculateTotalRegistrants, onChange, props.id, debouncedFetchUniqueRegistrants]
  );
  useEffect(() => {
    if (firstLoad && eventData.length > 0) {
      console.log("firstLoad");
      setFirstLoad(false);
      debouncedFetchUniqueRegistrants(formValues?.audience ?? {});
      setSelectedTickets(formValues?.audience ?? {});
      // calculateTotalRegistrants(formValues?.audience ?? {});
    }
  }, [firstLoad, formValues?.audience, debouncedFetchUniqueRegistrants, calculateTotalRegistrants, eventData]);
  useEffect(() => {
    const fetchEventTickets = async () => {
      setIsLoadingTickets(true);
      try {
        const eventId = formValues?.eventSelection === "currentEvent" ? params?.event : formValues?.events;

        if (!eventId) {
          console.log("No eventId found:", { formValues, params });
          setEventData([]);
          setSelectedTickets({});
          return;
        }

        const currentEventIds = Array.isArray(eventId) ? eventId : [eventId];

        const hasChanged = previousEventIds.current.length !== currentEventIds.length || !previousEventIds.current.every((id, index) => id === currentEventIds[index]);

        if (!hasChanged) {
          return;
        }

        console.log("Fetching tickets for events:", currentEventIds);
        previousEventIds.current = currentEventIds;

        const response = await getData({ event: currentEventIds }, "event/tickets");
        setEventData(Array.isArray(response.data) ? response.data : []);

        // Clear selected tickets for events that are no longer in the list
        setSelectedTickets((prev) => {
          const newSelectedTickets = {};
          Object.entries(prev).forEach(([key, value]) => {
            const eventIdWithoutTyped = key.replace("_typed", "");
            if (currentEventIds.includes(eventIdWithoutTyped)) {
              newSelectedTickets[key] = value;
            }
          });
          return newSelectedTickets;
        });
      } catch (error) {
        console.error("Error fetching event tickets:", error);
        setEventData([]);
        setSelectedTickets({});
      } finally {
        setIsLoadingTickets(false);
      }
    };

    fetchEventTickets();
  }, [formValues, params]);

  return (
    <div className="flex flex-col gap-4">
      {isLoadingStats ? (
        <StatsShimmer />
      ) : (
        (totalRegistrants > 0 || uniqueRegistrants.phone > 0 || uniqueRegistrants.email > 0) && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs font-medium text-gray-500">TOTAL REGISTRANTS</div>
                  <div className="text-xl font-semibold">{(totalRegistrants || 0).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs font-medium text-gray-500">UNIQUE PHONE</div>
                  <div className="text-xl font-semibold">{(uniqueRegistrants.phone || 0).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs font-medium text-gray-500">UNIQUE EMAIL</div>
                  <div className="text-xl font-semibold">{(uniqueRegistrants.email || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
      {isLoadingTickets ? (
        <>
          <TicketSectionShimmer />
          <TicketSectionShimmer />
        </>
      ) : Array.isArray(eventData) && eventData.length > 0 ? (
        eventData.map((event, eventIndex) => {
          const hasTickets = event?.groupedTickets?.general?.length > 0 || event?.groupedTickets?.withType?.length > 0;
          return hasTickets ? (
            <div className="flex flex-col gap-4" key={event._id}>
              <div className="text-sm font-semibold mb-0 border-b rounded-lg border border-gray-100 p-2 bg-gray-100">{event?.title || "Untitled Event"}</div>

              {/* General Tickets */}
              {event?.groupedTickets?.general?.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Ticket className="w-4 h-4 text-gray-500" />
                    <div className="text-sm font-medium text-gray-600">Tickets</div>
                  </div>
                  <FormInput
                    key={event._id + "_general" + firstLoad}
                    selectType="card"
                    type="multiSelect"
                    apiType="JSON"
                    selectApi={event.groupedTickets.general.map((ticket) => ({
                      value: ticket.value || "",
                      id: ticket.id,
                      bookingCount: ticket.bookingCount || 0,
                    }))}
                    value={selectedTickets[event._id]?.map((ticket) => ticket.id) ?? []}
                    onChange={onSelect}
                    name={event._id}
                    id={event._id}
                  />
                </div>
              )}

              {/* Participant Type Tickets */}
              {event?.groupedTickets?.withType?.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Ticket className="w-4 h-4 text-gray-500" />
                    <div className="text-sm font-medium text-gray-600">Participant Types</div>
                  </div>
                  <FormInput
                    selectType="card"
                    key={event._id + "_typed" + firstLoad}
                    type="multiSelect"
                    apiType="JSON"
                    selectApi={event.groupedTickets.withType.map((ticket) => ({
                      value: ticket.value || "",
                      id: ticket.id,
                      bookingCount: ticket.bookingCount || 0,
                    }))}
                    value={selectedTickets[event._id + "_typed"]?.map((ticket) => ticket.id) ?? []}
                    onChange={onSelect}
                    name={`${event._id}_typed`}
                    id={`${event._id}_typed`}
                  />
                </div>
              )}
            </div>
          ) : null;
        })
      ) : (
        <div className="text-center text-gray-500 py-8">No events found</div>
      )}
    </div>
  );
};

export default CreateAudience;
