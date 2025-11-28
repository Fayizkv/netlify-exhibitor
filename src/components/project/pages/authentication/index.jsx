import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Authentication = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Authentication - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "First Name",
      name: "firstName",
      validation: "",
      default: "",
      label: "First Name",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Last Name",
      name: "lastName",
      validation: "",
      default: "",
      label: "Last Name",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Full Name",
      name: "fullName",
      validation: "",
      default: "",
      label: "Full Name",
      // tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Authentication Type",
      name: "authenticationType",
      validation: "",
      default: "",
      tag: true,
      label: "Authentication Type",
      showItem: "Authentication Type",
      required: true,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "gmail,apple,Whatsapp,mobile,email",
    },
    {
      type: "text",
      placeholder: "Authentication Id",
      name: "authenticationId",
      validation: "",
      default: "",
      label: "Authentication Id",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Authenticated Token",
      name: "authenticatedToken",
      validation: "",
      default: "",
      label: "Authenticated Token",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Session Token",
      name: "sessionToken",
      validation: "",
      default: "",
      label: "Session Token",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Is Verified",
      name: "isVerified",
      validation: "",
      default: null,
      tag: true,
      label: "Is Verified",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "One Time Password",
      name: "oneTimePassword",
      validation: "",
      default: "",
      label: "One Time Password",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
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
      selectApi: "franchise/select",
      placeholder: "Franchise",
      name: "franchise",
      validation: "",
      showItem: "name",
      default: "",
      label: "Franchise",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`authentication`}
        itemTitle={{ name: "fullName", type: "text", collection: "" }}
        shortName={`Authentication`}
        formMode={`double`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Authentication);
