import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
// import { getData } from "../../../../backend/api";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const ActivityLog = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Activity Log - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "date",
      placeholder: "Date",
      name: "createdAt",
      validation: "",
      default: "",
      tag: true,
      label: "Date",
      required: true,
      view: true,
      add: true,
      update: true,
      icon: "date",
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "user/select",
      placeholder: "User",
      name: "addedBy",
      validation: "",
      showItem: "displayName", // Changed from "username" to "displayName"
      tag: true,
      default: "",
      label: "User",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
      search: true,
    },
    {
      type: "text",
      placeholder: "IP",
      name: "ip",
      validation: "",
      default: "",
      label: "IP",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "text",
      placeholder: "Activity",
      name: "activity",
      validation: "",
      default: "",
      label: "Activity",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "select",
      placeholder: "Activity Name",
      name: "activityName",
      validation: "",
      default: "",
      label: "Activity Name",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "text",
      placeholder: "Page",
      name: "page",
      validation: "",
      default: "",
      label: "Page",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    // {
    //   type: "datetime",
    //   placeholder: "Date & Time",
    //   name: "datetime",
    //   validation: "",
    //   default: "",
    //   label: "Date & Time",
    //   required: true,
    //   view: true,
    //   add: true,
    //   update: true,
    //   filter: true,
    // },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`activity-log`}
        itemTitle={{ name: "activityName", type: "text" }}
        shortName={`Activity Log`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(ActivityLog);
