import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
// import { getData } from "../../../../backend/api";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Registration = (props) => {
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
      name: "phone_1",
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
      type: "email",
      placeholder: "Email",
      name: "email_1",
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
      type: "password",
      placeholder: "Password",
      name: "password",
      validation: "",
      default: "",
      // tag: true,
      label: "Password",
      required: true,
      view: false,
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
      type: "date",
      placeholder: "Registration Date",
      name: "regDate",
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
      placeholder: "Transaction Id",
      name: "transactionId",
      validation: "",
      default: "",
      tag: true,
      label: "Transaction Id",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Transaction Image",
      name: "transactionImage",
      validation: "",
      default: "false",
      tag: true,
      label: "Transaction Image",
      required: false,
      view: true,
      add: true,
      update: true,
    },
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
  ]);

  // const [actions] = useState([
  //   {
  //     element: "button",
  //     type: "callback",
  //     callback: (item, data, refreshView) => {
  //       // Set the data for the clicked item and open the SetupMenu popup
  //       console.log(data);
  //       // setUserId(data._id)
  //       getApproved(data._id, refreshView);
  //     },
  //     itemTitle: {
  //       name: "user",
  //       type: "text",
  //       collection: "",
  //     },
  //     icon: "info",
  //     title: "Approve",
  //     params: {
  //       api: ``,
  //       parentReference: "",
  //       itemTitle: {
  //         name: "user",
  //         type: "text",
  //         collection: "",
  //       },
  //       shortName: "Approve",
  //       addPrivilege: true,
  //       delPrivilege: true,
  //       updatePrivilege: true,
  //       customClass: "medium",
  //     },
  //   },
  // ]);

  // const getApproved = (userId, refreshView) => {
  //   props.setLoaderBox(true);
  //   getData({ userId }, "approved")
  //     .then((response) => {
  //       props.setLoaderBox(false);
  //       console.log(response);
  //       if (response.data) {
  //         props.setMessage({ content: response.data.message });
  //         refreshView();
  //       } else {
  //         // Handle the case where response.data is undefined
  //         console.error("Response data is undefined.");
  //       }
  //     })
  //     .catch((error) => {
  //       props.setLoaderBox(false);
  //       // Handle any errors that occur during the API request
  //       console.error("API request error:", error);
  //     });
  // };

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`registration`}
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
export default Layout(Registration);
