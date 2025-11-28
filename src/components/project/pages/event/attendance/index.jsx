import React, { useEffect, useState } from "react";
import Layout from "../../../../core/layout";
import ListTable from "../../../../core/list/list";
// import { getData } from "../../../../../backend/api";
import { ElementContainer } from "../../../../core/elements";
import { attendanceDataAttributes, attendanceActionsAttributes } from "../attributes/attendance/index";

const Attendance = (props) => {
  const eventId = props?.openData?.data?._id;
  const [selectedTab, setSelectedTab] = useState("all");
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log("[Attendance Page] Component initialized with eventId:", eventId);

  // Function to get the dynamic API endpoint based on selected tab
  const getApiEndpoint = () => {
    console.log("[Attendance Page] Getting API endpoint for selectedTab:", selectedTab);

    // Use the original attendance-status endpoint for all cases
    return "attendance/attendance-status";
  };

  // Function to handle filter changes
  const handleFilterChange = async (data) => {
    console.log("[Attendance Page] Filter data received:", data);
    console.log("[Attendance Page] Current selectedTab:", selectedTab);

    try {
      setIsLoading(true);

      // Map the filter values to our tab states
      let newTab = "all";
      if (data.status === "true" || data.status === true) {
        newTab = "check-in";
      } else if (data.status === "false" || data.status === false) {
        newTab = "pending";
      }

      console.log("[Attendance Page] New tab based on filter:", newTab);

      if (newTab !== selectedTab) {
        console.log("[Attendance Page] Updating selectedTab from", selectedTab, "to", newTab);
        setSelectedTab(newTab);
      }
    } catch (error) {
      console.error("[Attendance Page] Error in filter change:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = `Attendance - EventHex Portal`;
    console.log("[Attendance Page] Setting up attendance page for eventId:", eventId);

    // New filter field for attendance status - using the same pattern as Event page
    const attendanceStatusFilter = {
      type: "select",
      name: "status",
      label: "Attendance Status",
      apiType: "JSON",
      filter: true,
      filterPosition: "right",
      filterType: "tabs",
      selectApi: [
        { value: "All", id: "" },
        { value: "Check-in", id: "true" },
        { value: "Pending", id: "false" },
      ],
    };

    // Instance filter field
    const instanceFilterField = {
      type: "select",
      footnote: "",
      placeholder: "Choose Instance",
      name: "instance",
      validation: "",
      label: "Instance",
      showItem: "title",
      default: "all",
      value: "all",
      required: false,
      view: true,
      filter: true,
      add: false,
      update: true,
      apiType: "API",
      selectApi: `instance/event-instance`,
      export: false,
      // preFill: [
      //   {
      //     id: "all",
      //     value: "All",
      //   },
      // ],
    };

    // Use the shared attendance attributes and add our custom filters
    const baseAttributes = [...attendanceDataAttributes];

    // Update the ticket filter in baseAttributes to use the correct API
    const updatedBaseAttributes = baseAttributes.map((attr) => {
      if (attr.name === "ticket") {
        return {
          ...attr,
          selectApi: "ticket/event-ticket", // Use the correct API endpoint
          showItem: "title", // Use title instead of value
        };
      }
      return attr;
    });

    // Set attributes with the new attendance status filter and shared attributes
    setAttributes([attendanceStatusFilter, instanceFilterField, ...updatedBaseAttributes]);
    console.log("[Attendance Page] Attributes set with attendance status filter");
    console.log("[Attendance Page] Filter configuration:", {
      name: attendanceStatusFilter.name,
      selectApi: attendanceStatusFilter.selectApi,
      filterType: attendanceStatusFilter.filterType,
      filterPosition: attendanceStatusFilter.filterPosition,
    });
    console.log("[Attendance Page] Using shared attendance attributes:", updatedBaseAttributes.length);
  }, [eventId]);

  // Monitor selectedTab changes and log expected API parameters
  useEffect(() => {
    console.log("[Attendance Page] Selected tab changed to:", selectedTab);
    console.log("[Attendance Page] API endpoint will be:", getApiEndpoint());
    console.log("[Attendance Page] PreFilter will be:", getPreFilter());
    console.log("[Attendance Page] Expected API call parameters:", {
      api: getApiEndpoint(),
      event: eventId,
      status: selectedTab === "check-in" ? "true" : selectedTab === "pending" ? "false" : "",
    });
  }, [selectedTab, eventId]);

  // Function to get preFilter based on selected tab - this will be passed as query parameters
  const getPreFilter = () => {
    const baseFilter = {
      event: eventId,
    };

    // Add status parameter based on selected tab
    if (selectedTab === "check-in") {
      baseFilter.status = "true";
    } else if (selectedTab === "pending") {
      baseFilter.status = "false";
    } else {
      // For "all" tab, don't add status parameter or set it to empty string
      baseFilter.status = "";
    }

    console.log("[Attendance Page] Applying filter for tab:", selectedTab);
    console.log("[Attendance Page] Base filter:", JSON.stringify(baseFilter, null, 2));
    return baseFilter;
  };

  console.log("[Attendance Page] Rendering with selectedTab:", selectedTab);
  console.log("[Attendance Page] Current attributes count:", attributes.length);
  console.log("[Attendance Page] Using API endpoint:", getApiEndpoint());

  // Don't render if we don't have the required data
  if (!eventId) {
    console.log("[Attendance Page] No eventId available, not rendering ListTable");
    return (
      <ElementContainer className="column">
        <div className="text-center p-4">
          <p>Loading attendance data...</p>
        </div>
      </ElementContainer>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <ElementContainer className="column">
        <div className="text-center p-4">
          <p>Loading attendance data for {selectedTab}...</p>
        </div>
      </ElementContainer>
    );
  }

  return (
    <ElementContainer className="column">
      <ListTable
        api={getApiEndpoint()}
        key={`attendance-${selectedTab}`} // Force re-render when tab changes
        itemTitle={{
          name: "firstName",
          type: "text",
          collection: "",
        }}
        shortName="Attendance"
        formMode="single"
        preFilter={getPreFilter()}
        parents={{
          event: eventId,
        }}
        onFilter={handleFilterChange}
        onDataLoaded={(data) => {
          console.log("[Attendance Page] Data loaded for tab:", selectedTab, "Count:", data?.length || 0);
          console.log("[Attendance Page] API endpoint used:", getApiEndpoint());
          console.log("[Attendance Page] Sample data:", data?.slice(0, 2));
        }}
        bulkUplaod={false}
        delPrivilege={false}
        addPrivilege={false}
        updatePrivilege={false}
        exportPrivilege={true}
        viewMode="table"
        name="attendance"
        actions={attendanceActionsAttributes}
        {...props}
        attributes={attributes}
        openPage={false}
        itemOpenMode={null}
      />
    </ElementContainer>
  );
};

export default Layout(Attendance);
