import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import { ButtonPanel, Filter } from "../../../core/list/styles";
import { Button } from "../../../core/elements";
import Search from "../../../core/search";
import NoDataFound from "../../../core/list/nodata";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons";
import { getData } from "../../../../backend/api";

import moment from "moment";

// Shimmer loading components for better user experience during data loading
const StatisticsShimmer = () => (
  <div className="space-y-6">
    {/* Summary Stats Shimmer */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-stroke-soft p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Events Table Shimmer */}
    <div className="bg-white rounded-xl shadow-sm border border-stroke-soft">
      <div className="p-6 border-b border-stroke-soft">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-48 h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StatisticsPage = () => {
  const toast = useToast();

  // State management for events data and UI controls
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Summary statistics state for dashboard overview
  const [summaryStats, setSummaryStats] = useState({
    totalEvents: 0,
    todaysEvents: 0,
    totalTickets: 0,
    todaysTickets: 0,
  });

  // Fetch events and comprehensive statistics for each event
  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      // Fetch all events without pagination
      const eventsResponse = await getData(
        {
          searchkey: searchTerm,
        },
        "event"
      );

      if (eventsResponse.status === 200) {
        const eventsData = eventsResponse.data?.response || [];
        console.log("Events response:", eventsResponse);
        console.log("Events data:", eventsData);
        setEvents(eventsData);

        // Fetch detailed statistics for each event including tickets, registrations, and orders
        const eventsWithStats = await Promise.all(
          eventsData.map(async (event) => {
            try {
              // Fetch all tickets for this event to get ticket count
              const ticketsResponse = await getData({ event: event._id }, "ticket");
              console.log(`Tickets response for event ${event._id}:`, ticketsResponse);
              const tickets = ticketsResponse.status === 200 ? ticketsResponse.data?.response || [] : [];
              console.log(`Tickets for event ${event._id}:`, tickets.length);

              // Fetch dashboard counts for this event to get accurate registration counts
              const dashboardResponse = await getData(
                {
                  event: event._id,
                },
                "dashboard"
              );
              console.log(`Dashboard response for event ${event._id}:`, dashboardResponse);

              // Get registration counts from dashboard API
              const dashboardData = dashboardResponse.status === 200 ? dashboardResponse.data || [] : [];

              // Find total and today's registration counts from dashboard data
              const totalRegistrations = dashboardData.find((item) => item.title === "Total Registration")?.count || 0;
              const todaysRegistrations = dashboardData.find((item) => item.title === "Today's Registration")?.count || 0;

              console.log(`Registration counts for event ${event._id}:`, {
                total: totalRegistrations,
                today: todaysRegistrations,
              });

              // Fetch all orders for this event to calculate order counts
              const ordersResponse = await getData(
                {
                  event: event._id,
                  skip: 0,
                  limit: 1000,
                },
                "orders/status"
              );
              console.log(`Orders response for event ${event._id}:`, ordersResponse);
              const orders = ordersResponse.status === 200 ? ordersResponse.data?.response || [] : [];
              console.log(`Orders for event ${event._id}:`, orders.length);

              // Get order counts from the API response
              const orderCounts = ordersResponse.status === 200 ? ordersResponse.data?.counts || {} : {};
              console.log(`Order counts for event ${event._id}:`, orderCounts);

              // Calculate ticket-wise registration counts for detailed breakdown
              const ticketStats = await Promise.all(
                tickets.map(async (ticket) => {
                  try {
                    // Use the same endpoint pattern as event page to ensure counts are computed
                    const ticketRegsRes = await getData(
                      {
                        event: event._id,
                        ticket: ticket._id,
                        searchkey: "",
                        type: "Ticket",
                        skip: 0,
                        limit: 1,
                      },
                      "ticket-registration/all"
                    );

                    const counts = ticketRegsRes?.status === 200 ? ticketRegsRes.data?.counts || {} : {};

                    // Be resilient to key name/case/punctuation and pluralization variations
                    const normalize = (str) =>
                      (str || "")
                        .toString()
                        .toLowerCase()
                        .replace(/[^a-z]/g, "");
                    const findCount = (obj, targetKeysNormalized) => {
                      if (!obj) return 0;
                      for (const rawKey of Object.keys(obj)) {
                        const keyNorm = normalize(rawKey);
                        if (targetKeysNormalized.includes(keyNorm)) {
                          const val = obj[rawKey]?.count;
                          if (typeof val !== "undefined") return val;
                        }
                      }
                      return 0;
                    };

                    const totalCount = findCount(counts, ["totalregistration", "totalregistrations"]);
                    const todayCount = findCount(counts, ["todaysregistration", "todaysregistrations", "todayregistration", "todayregistrations"]);

                    return {
                      ticketId: ticket._id,
                      ticketTitle: ticket.title,
                      totalRegistrations: totalCount,
                      todaysRegistrations: todayCount,
                    };
                  } catch (err) {
                    console.error(`Ticket-wise count failed for ${ticket._id}`, err);
                    return {
                      ticketId: ticket._id,
                      ticketTitle: ticket.title,
                      totalRegistrations: 0,
                      todaysRegistrations: 0,
                    };
                  }
                })
              );

              return {
                ...event,
                tickets: tickets,
                ticketStats: ticketStats,
                totalRegistrations: totalRegistrations,
                todaysRegistrations: todaysRegistrations,
                totalOrders: orderCounts["No of orders"]?.count || 0,
                todaysOrders: orderCounts["today order"]?.count || 0,
              };
            } catch (error) {
              console.error(`Error fetching stats for event ${event._id}:`, error);
              console.error(`Event data:`, event);
              return {
                ...event,
                tickets: [],
                ticketStats: [],
                totalRegistrations: 0,
                todaysRegistrations: 0,
                totalOrders: 0,
                todaysOrders: 0,
              };
            }
          })
        );

        setEvents(eventsWithStats);

        // Calculate summary statistics for dashboard overview cards
        const today = moment().startOf("day");
        const totalTickets = eventsWithStats.reduce((sum, event) => sum + event.tickets.length, 0);
        const todaysEvents = eventsWithStats.filter((event) => moment(event.startDate).isSame(today, "day") || moment(event.endDate).isSame(today, "day")).length;
        const totalRegistrations = eventsWithStats.reduce((sum, event) => sum + event.totalRegistrations, 0);
        const todaysRegistrations = eventsWithStats.reduce((sum, event) => sum + event.todaysRegistrations, 0);

        setSummaryStats({
          totalEvents: eventsWithStats.length,
          todaysEvents,
          totalTickets,
          todaysTickets: todaysRegistrations, // Changed to use actual registration count
        });
      } else {
        toast.error("Failed to fetch events data");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when search changes
  useEffect(() => {
    fetchStatistics();
  }, [searchTerm]);

  // Handle search functionality
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Filtered events based on search term for real-time filtering
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    return events.filter((event) => event.title?.toLowerCase().includes(searchTerm.toLowerCase()) || event.venue?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [events, searchTerm]);

  // Summary statistics cards configuration for dashboard overview
  const summaryCards = [
    {
      title: "Total Events",
      value: summaryStats.totalEvents,
      icon: "calendar",
      bgColor: "bg-[#e2f6e6]",
      iconColor: "text-green-500",
    },
    {
      title: "Today's Events",
      value: summaryStats.todaysEvents,
      icon: "date",
      bgColor: "bg-[#deebff]",
      iconColor: "text-blue-500",
    },
    {
      title: "Total Registrations",
      value: summaryStats.totalRegistrations || 0,
      icon: "registration",
      bgColor: "bg-[#ffe5e2]",
      iconColor: "text-red-500",
    },
    {
      title: "Today's Registrations",
      value: summaryStats.todaysTickets, // This now contains today's registrations
      icon: "time",
      bgColor: "bg-[#e6e6f9]",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <RowContainer className="data-layout">
      {/* Header */}
      <PageHeader title="Event Statistics" description="Comprehensive overview of all events with detailed statistics including registrations, tickets, and orders" line={false} />

      {/* Action Panel */}
      <ButtonPanel className="custom">
        <div className="flex items-center gap-3">
          <Search title="Search Events" placeholder="Search by event name or venue..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
          <Filter onClick={() => {}}>
            <GetIcon icon="filter" />
            <span>Filter</span>
          </Filter>
        </div>
      </ButtonPanel>

      {/* Content */}
      {isLoading ? (
        <StatisticsShimmer />
      ) : (
        <div className="space-y-6">
          {/* Summary Statistics Cards - Overview of key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {summaryCards.map((stat, index) => (
              <div key={stat.id || index} className="bg-white rounded-xl shadow-sm border border-stroke-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                    {stat.icon === "calendar" ? (
                      <GetIcon icon="calendar" className={stat.iconColor} />
                    ) : stat.icon === "date" ? (
                      <GetIcon icon="date" className={stat.iconColor} />
                    ) : stat.icon === "ticket" ? (
                      <GetIcon icon="ticket" className={stat.iconColor} />
                    ) : stat.icon === "time" ? (
                      <GetIcon icon="time" className={stat.iconColor} />
                    ) : (
                      <GetIcon icon="chart" className={stat.iconColor} />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-sub">Today</p>
                    <p className="text-xs text-text-soft">vs yesterday</p>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-main">{stat.value}</p>
                  <p className="text-sm text-text-sub mt-1">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Events Statistics Table - Detailed breakdown of each event */}
          <div className="bg-white rounded-xl shadow-sm border border-stroke-soft">
            <div className="p-6 border-b border-stroke-soft">
              <h3 className="text-lg font-semibold text-text-main">Events Statistics</h3>
              <p className="text-sm text-text-sub mt-1">Detailed breakdown of events with registration and order counts</p>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="p-6">
                <NoDataFound shortName="Events" icon="calendar" addPrivilege={false} description="No events found matching your search criteria" />
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                    <div key={event._id} className="border border-stroke-soft rounded-lg p-4">
                      {/* Event Header - Basic event information and summary counts */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                            <GetIcon icon="calendar" className="text-primary-base" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-text-main text-lg">{event.title}</h4>
                            <p className="text-text-sub text-sm">
                              {event.venue && `${event.venue} • `}
                              {event.startDate && moment(event.startDate).format("MMM DD, YYYY")}
                              {event.endDate && event.endDate !== event.startDate && ` - ${moment(event.endDate).format("MMM DD, YYYY")}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-text-main">{event.totalRegistrations}</p>
                            <p className="text-xs text-text-sub">Total Reg</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-text-main">{event.todaysRegistrations}</p>
                            <p className="text-xs text-text-sub">Today</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-text-main">{event.totalOrders}</p>
                            <p className="text-xs text-text-sub">Orders</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-text-main">{event.todaysOrders}</p>
                            <p className="text-xs text-text-sub">Today</p>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Statistics - Detailed breakdown by ticket type */}
                      {event.ticketStats && event.ticketStats.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium text-text-main mb-3">Ticket Breakdown</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {event.ticketStats.map((ticket) => (
                              <div key={ticket.ticketId} className="bg-bg-weak rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-text-main text-sm">{ticket.ticketTitle}</p>
                                    <p className="text-text-sub text-xs">Ticket Type</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-text-main">{ticket.totalRegistrations}</p>
                                    <p className="text-xs text-text-sub">Total</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-primary-base">{ticket.todaysRegistrations}</p>
                                    <p className="text-xs text-text-sub">Today</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </RowContainer>
  );
};

export default StatisticsPage;
