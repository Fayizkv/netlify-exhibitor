import React, { useEffect, useState } from "react";
import Layout from "../../../../core/layout";
import ListTable from "../../../../core/list/list";
import { getData } from "../../../../../backend/api";
import { ElementContainer, TabButtons, Title } from "../../../../core/elements";

const MissedAttendance = (props) => {
  const eventId = props?.openData?.data?._id;

  useEffect(() => {
    document.title = `Missed Attendance - EventHex Portal`;
  }, []);

  const [selectedTab, setSelectedTab] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);

  useEffect(() => {
    getData({ event: eventId }, "ticket").then((response) => {
      const tabItems = response.data.response.map((item) => ({
        key: item._id, // Use _id as key
        title: item.title, // Replace with actual field names in response
      }));

      setTabs(tabItems);

      // Set the first tab as the selected tab by default if tabs are available
      if (tabItems.length > 0) {
        setSelectedTab(tabItems[0].key);
        setLastUpdateDate(new Date());
      }
    });
  }, [eventId]);

  const [attendance] = useState([
    {
      type: "text",
      placeholder: "User",
      name: "fullName",
      collection: "authentication",
      showItem: "fullName",
      validation: "",
      default: "",
      tag: true,
      label: "User",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "text",
      placeholder: "Mobile Number",
      name: "authenticationId",
      collection: "authentication",
      showItem: "authenticationId",
      validation: "",
      default: "",
      tag: true,
      label: "Mobile Number",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "checkbox",
      placeholder: "Is Verified",
      name: "user",
      collection: "authentication",
      showItem: "isVerified",
      validation: "",
      default: null,
      tag: true,
      label: "Is Verified",
      view: true,
      add: true,
      update: true,
      filter: true,
    },
  ]);

  return (
    <ElementContainer className="column">
      <Title line={false} title="Missed Attendance" />
      <Title line={false} title="Tickets" />
      <TabButtons
        selectedTab={selectedTab}
        selectedChange={(value) => {
          props.setLoaderBox(true);
          console.log("Clicked Tab", value);
          setSelectedTab(value);
          setLastUpdateDate(new Date());
          props.setLoaderBox(false);
        }}
        tabs={tabs}
      ></TabButtons>
      {selectedTab && (
        <ListTable
          api={`attendance/missed`}
          key={selectedTab}
          itemTitle={{
            name: "fullName",
            type: "text",
            collection: "user",
          }}
          shortName={`Missed Attendance`}
          formMode={`single`}
          preFilter={{
            event: eventId,
            ticket: selectedTab,
            // scanType: "ticket",
          }}
          bulkUplaod={true}
          delPrivilege={false}
          addPrivilege={false}
          updatePrivilege={false}
          exportPrivilege={true}
          viewMode={"table"}
          name={new Date().toString()}
          {...props}
          attributes={attendance}
          lastUpdateDate={lastUpdateDate}
        ></ListTable>
      )}
    </ElementContainer>
  );
};

export default Layout(MissedAttendance);
