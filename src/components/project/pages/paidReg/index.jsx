import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import { getData } from "../../../../backend/api";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const PaidReg = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Registration - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: "",
      label: "Name",
      // tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Mobile Number",
      name: "mobileNumber",
      validation: "",
      default: "",
      tag: true,
      label: "Mobile Number",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Whatsapp Number",
      name: "whatsapp",
      validation: "",
      default: "",
      tag: true,
      label: "Whatsapp Number",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "email",
      placeholder: "Email",
      name: "email",
      validation: "",
      default: "",
      label: "Email",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Gender",
      name: "gender",
      validation: "",
      default: "",
      tag: true,
      label: "Gender",
      showItem: "Gender",
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Male,Female",
    },
    {
      type: "text",
      placeholder: "Age",
      name: "age",
      validation: "",
      default: "",
      tag: true,
      label: "Age",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Place",
      name: "place",
      validation: "",
      default: "",
      tag: true,
      label: "Place",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "District",
      name: "district",
      validation: "",
      default: "",
      tag: true,
      label: "District",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Profession",
      name: "profession",
      validation: "",
      default: "",
      tag: true,
      label: "Profession",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "datetime",
      placeholder: "Registration Date",
      name: "createdAt",
      validation: "",
      default: "",
      label: "Registration Date",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Institution",
      name: "institution",
      validation: "",
      default: "",
      tag: true,
      label: "Institution",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Course",
      name: "course",
      validation: "",
      default: "",
      tag: true,
      label: "Course",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "QR Code",
      name: "qrImageUrl",
      validation: "",
      default: "false",
      tag: true,
      label: "QR Code",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Payment Status",
      name: "paymentStatus",
      validation: "",
      default: "",
      tag: true,
      label: "Payment Status",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Payment Screenshot Status",
      name: "paymentScreenshotStatus",
      validation: "",
      default: "",
      tag: true,
      label: "Payment Screenshot Status",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // {
    //   type: "image",
    //   placeholder: "Transaction Image",
    //   name: "transactionImage",
    //   validation: "",
    //   default: "false",
    //   tag: true,
    //   label: "Transaction Image",
    //   required: false,
    //   view: true,
    //   add: true,
    //   update: true,
    // },
    {
      type: "checkbox",
      placeholder: "Approved",
      name: "approved",
      validation: "",
      default: "false",
      tag: true,
      label: "Approved",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Declined",
      name: "declined",
      validation: "",
      default: "false",
      tag: true,
      label: "Declined",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Attended",
      name: "attended",
      validation: "",
      default: "false",
      tag: true,
      label: "Attended",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // {
    //   type: "select",
    //   apiType: "JSON",
    //   selectApi: [
    //     { id: "attended", value: "Attended" },
    //     { id: "notattended", value: "Not Attended" },
    //     { id: "all", value: "All" },
    //   ],
    //   filter: true,
    //   placeholder: "Attendance Status",
    //   name: "attended",
    //   value: "all",
    //   validation: "",
    //   tag: false,
    //   label: "Attendance Status",
    //   required: false,
    //   view: false,
    //   add: false,
    //   update: false,
    // },
    {
      type: "select",
      apiType: "JSON",
      selectApi: [
        { id: "approved", value: "Approved" },
        { id: "notapproved", value: "Not Approved" },
        { id: "all", value: "All" },
      ],
      filter: true,
      placeholder: "Registration Status",
      name: "approved",
      value: "all",
      validation: "",
      tag: false,
      label: "Registration Status",
      required: false,
      view: false,
      add: false,
      update: false,
    },
    {
      type: "select",
      apiType: "JSON",
      selectApi: [
        { id: "declined", value: "Declined" },
        { id: "notdeclined", value: "Not Declined" },
        { id: "all", value: "All" },
      ],
      filter: true,
      placeholder: "Decline Status",
      name: "declined",
      value: "all",
      validation: "",
      tag: false,
      label: "Decline Status",
      required: false,
      view: false,
      add: false,
      update: false,
    },
    {
      type: "select",
      apiType: "JSON",
      selectApi: [
        { id: "all", value: "All" },
        { id: "yes", value: "Yes" },
        { id: "no", value: "No" },
      ],
      filter: true,
      placeholder: "Payment Status",
      name: "paymentStatus",
      value: "all",
      validation: "",
      tag: false,
      label: "Payment Status",
      required: false,
      view: false,
      add: false,
      update: false,
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
    {
      element: "button",
      type: "callback",
      callback: (item, data, refreshView) => {
        // Set the data for the clicked item and open the SetupMenu popup
        console.log(data);
        // setUserId(data._id)
        getDeclined(data._id, refreshView);
      },
      itemTitle: {
        name: "user",
        type: "text",
        collection: "",
      },
      icon: "close",
      title: "Decline",
      params: {
        api: ``,
        parentReference: "",
        itemTitle: {
          name: "user",
          type: "text",
          collection: "",
        },
        shortName: "Decline",
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

  const getDeclined = (userId, refreshView) => {
    props.setLoaderBox(true);
    getData({ userId }, "declined")
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
        api={`paid-reg`}
        itemTitle={{ name: "name", type: "text", collection: "" }}
        shortName={`Registration`}
        formMode={`double`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(PaidReg);
