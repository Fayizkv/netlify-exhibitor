import React, { useEffect, useState } from "react";
import Layout from "../../../../core/layout";
import ListTable from "../../../../core/list/list";
import { getData } from "../../../../../backend/api";
import { ElementContainer, TabButtons, Title } from "../../../../core/elements";

const InstanceAttendance = (props) => {
  const eventId = props?.openData?.data?._id;

  useEffect(() => {
    document.title = `Instance Attendance - EventHex Portal`;
  }, []);

  const [selectedTab, setSelectedTab] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);

  useEffect(() => {
    getData({ event: eventId }, "instance").then((response) => {
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
      collection: "user",
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
      collection: "user",
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
      collection: "user",
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
    {
      type: "datetime",
      placeholder: "Checkin Time",
      name: "createdAt",
      validation: "",
      default: "",
      label: "Checkin Time",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ]);

  return (
    <ElementContainer className="column">
      <Title line={false} title="Attendance" />
      <Title line={false} title="Instance" />
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
          api={`attendance`}
          key={selectedTab}
          itemTitle={{
            name: "fullName",
            type: "text",
            collection: "user",
          }}
          shortName={`Instance Attendance`}
          formMode={`single`}
          preFilter={{
            event: eventId,
            instance: selectedTab,
            scanType: "instance",
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

export default Layout(InstanceAttendance);
