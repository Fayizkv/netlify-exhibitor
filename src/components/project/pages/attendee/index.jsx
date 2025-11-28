import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import { getData } from "../../../../backend/api/index.js";
import { Calendar, DollarSign, UserPlus, Ticket } from "lucide-react";
import { useToast } from "../../../core/toast/ToastContext.jsx";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Attendee = (props) => {
  const toast = useToast();
  const [dashboardCountData, setDashboardCountData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  //to update the page title
  useEffect(() => {
    document.title = `Attendee List - EventHex Portal`;
  }, []);

  // Fetch dashboard counts when event changes
  useEffect(() => {
    const fetchDashboardCounts = async () => {
      // Try multiple ways to get event ID
      const eventId = props?.openData?.data?._id || props?.data?._id || props?.eventId || new URLSearchParams(window.location.search).get("event");

      console.log("[Attendee Page] Props received:", props);
      console.log("[Attendee Page] Props.openData:", props?.openData);
      console.log("[Attendee Page] Props.data:", props?.data);
      console.log("[Attendee Page] Event ID from props:", eventId);
      console.log("[Attendee Page] URL search params:", window.location.search);

      if (!eventId) {
        console.log("[Attendee Page] No event ID found in props, skipping dashboard counts fetch");
        console.log("[Attendee Page] Available props keys:", Object.keys(props || {}));
        return;
      }

      setIsLoading(true);
      try {
        console.log("[Attendee Page] Fetching dashboard counts for event:", eventId);
        const response = await getData({ event: eventId }, "dashboard");

        console.log("[Attendee Page] Dashboard API response:", response);

        if (response.status === 200) {
          console.log("[Attendee Page] Dashboard counts fetched successfully:", response.data);
          setDashboardCountData(response.data || []);
        } else {
          console.error("[Attendee Page] Failed to fetch dashboard counts:", response);
          toast.error("Failed to load dashboard statistics");
        }
      } catch (error) {
        console.error("[Attendee Page] Error fetching dashboard counts:", error);
        toast.error("Error loading dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardCounts();
  }, [props?.openData?.data?._id, props?.data?._id, props?.eventId, toast]);

  const stats = useMemo(
    () => [
      {
        id: 1,
        title: "TOTAL REGISTRATIONS",
        value: dashboardCountData?.[0]?.count || "0",
        icon: dashboardCountData?.[0]?.icon || "registration",
        bgColor: "bg-[#e2f6e6]",
        iconColor: "text-green-500",
      },
      {
        id: 2,
        title: "TODAY'S REGISTRATIONS",
        value: dashboardCountData?.[1]?.count || "0",
        icon: dashboardCountData?.[1]?.icon || "date",
        bgColor: "bg-[#deebff]",
        iconColor: "text-blue-500",
      },
      {
        id: 3,
        title: "TOTAL TICKET AMOUNT",
        value: dashboardCountData?.[2]?.count || "0",
        icon: dashboardCountData?.[2]?.icon || "currency",
        bgColor: "bg-[#ffe5e2]",
        iconColor: "text-red-500",
      },
      // {
      //   id: 4,
      //   title: "AVG TICKET AMOUNT",
      //   value: dashboardCountData?.[3]?.count || "0",
      //   icon: dashboardCountData?.[3]?.icon || "ticket",
      //   bgColor: "bg-[#e6e6f9]",
      //   iconColor: "text-purple-500",
      // },
    ],
    [dashboardCountData]
  );

  console.log("[Attendee Page] Current dashboardCountData:", dashboardCountData);
  console.log("[Attendee Page] Current stats:", stats);
  console.log("[Attendee Page] Current isLoading:", isLoading);

  const [attributes] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      // tag: true,
      default: "",
      label: "Event",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "ticket/select",
      placeholder: "Ticket",
      name: "ticket",
      validation: "",
      showItem: "title",
      // tag: true,
      default: "",
      label: "Ticket",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "select",
      //   apiType: "API",
      //   selectApi: "authentication/select",
      placeholder: "Your Name",
      name: "fullName",
      validation: "",
      showItem: "fullName",
      tag: true,
      default: "",
      label: "Your Name",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "mobilenumber",
      placeholder: "Mobile Number",
      name: "authenticationId",
      validation: "",
      default: "",
      tag: true,
      label: "Mobile Number",
      required: true,
      view: true,
      add: false,
      update: false,
    },
    {
      type: "email",
      placeholder: "Email ID",
      name: "emailId",
      validation: "",
      default: "",
      tag: true,
      label: "Email ID",
      required: true,
      view: true,
      add: false,
      update: false,
    },
    {
      type: "datetime",
      placeholder: "Registration Time",
      name: "createdAt",
      validation: "",
      default: "",
      label: "Registration Time",
      minimum: 0,
      maximum: 16,
      required: true,
      view: true,
      tag: true,
      export: false,
      sort: true,
    },
  ]);

  // Get event ID for ListTable preFilter
  const eventIdForFilter = props?.openData?.data?._id || props?.data?._id || props?.eventId || new URLSearchParams(window.location.search).get("event");

  return (
    <Container className="noshadow">
      {/* Dashboard Stats Section */}
      {!isLoading && dashboardCountData && (
        <div className="w-full border border-gray-200 p-2 bg-white rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {stats.map((stat, index) => (
              <div key={stat.id} className={`flex items-center p-2 gap-3 ${index !== stats.length - 1 ? "border-r border-gray-200" : ""}`}>
                <div className="flex items-center justify-center border border-gray-200 rounded-full">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                    {stat.icon === "currency" ? (
                      <DollarSign className="" width={18} height={18} stroke="#99231b" />
                    ) : stat.icon === "registration" ? (
                      <UserPlus className="" width={18} height={18} stroke="#016a27" />
                    ) : stat.icon === "date" ? (
                      <Calendar className="" width={18} height={18} stroke="#004999" />
                    ) : (
                      <Ticket className="" width={18} height={18} stroke="#2b2a69" />
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
      )}

      {/* Debug info - remove this in production */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>Event ID: {eventIdForFilter || "Not found"}</p>
          <p>Loading: {isLoading ? "Yes" : "No"}</p>
          <p>Dashboard Data: {dashboardCountData ? "Loaded" : "Not loaded"}</p>
          <p>Stats Count: {stats.length}</p>
          <p>Dashboard Data Length: {dashboardCountData?.length || 0}</p>
          <p>First Stat Value: {stats[0]?.value}</p>
          <p>Props Keys: {Object.keys(props || {}).join(", ")}</p>
          <p>Props.openData Keys: {props?.openData ? Object.keys(props.openData).join(", ") : "No openData"}</p>
        </div>
      )} */}

      <ListTable
        // actions={actions}
        api={`ticket-registration/register`}
        preFilter={{ event: eventIdForFilter }}
        itemTitle={{
          name: "title",
          type: "text",
          collection: "ticket",
        }}
        shortName={`Attendee List`}
        formMode={`double`}
        attributes={attributes}
        {...props}
      ></ListTable>
    </Container>
  );
};

export default Layout(Attendee);
