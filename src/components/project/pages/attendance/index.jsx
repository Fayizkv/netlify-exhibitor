import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import { getData } from "../../../../backend/api";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Attendance = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Attendance - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      apiType: "API",
      placeholder: "User",
      name: "user",
      showItem: "name",
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
      type: "select",
      apiType: "API",
      placeholder: "Email",
      name: "user",
      showItem: "email",
      validation: "",
      default: "",
      tag: true,
      label: "Email",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      placeholder: "Mobile Number",
      name: "user",
      showItem: "mobileNumber",
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
      type: "select",
      apiType: "API",
      placeholder: "Whatsapp Number",
      name: "user",
      showItem: "whatsapp",
      validation: "",
      default: "",
      tag: true,
      label: "Whatsapp Number",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      placeholder: "Palce",
      name: "user",
      showItem: "place",
      validation: "",
      default: "",
      tag: true,
      label: "Place",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      placeholder: "District",
      name: "user",
      showItem: "district",
      validation: "",
      default: "",
      tag: true,
      label: "District",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      placeholder: "Institution",
      name: "user",
      showItem: "institution",
      validation: "",
      default: "",
      tag: true,
      label: "Institution",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "date",
      placeholder: "Date",
      name: "date",
      validation: "",
      default: "",
      label: "Date",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const [actions] = useState([
    {
      element: "button",
      type: "callback",
      callback: (item, data, refreshView) => {
        // Set the data for the clicked item and open the SetupMenu popup
        console.log(data);
        // setUserId(data._id)
        getApproved(data._id, refreshView);
      },
      itemTitle: {
        name: "user",
        type: "text",
        collection: "",
      },
      icon: "checked",
      title: "Approve",
      params: {
        api: ``,
        parentReference: "",
        itemTitle: {
          name: "user",
          type: "text",
          collection: "",
        },
        shortName: "Approve",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "medium",
      },
    },
  ]);

  const getApproved = (userId, refreshView) => {
    props.setLoaderBox(true);
    getData({ userId }, "approved")
      .then((response) => {
        props.setLoaderBox(false);
        console.log(response);
        if (response.data) {
          props.setMessage({ content: response.data.message });
          refreshView();
        } else {
          // Handle the case where response.data is undefined
          console.error("Response data is undefined.");
        }
      })
      .catch((error) => {
        props.setLoaderBox(false);
        // Handle any errors that occur during the API request
        console.error("API request error:", error);
      });
  };

  return (
    <Container className="noshadow">
      <ListTable
        actions={actions}
        api={`attendance`}
        itemTitle={{ name: "name", type: "text", collection: "user" }}
        shortName={`Attendance`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Attendance);
