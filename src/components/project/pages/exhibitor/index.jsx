import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Exhibitor = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Exhibitor - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "exhibitorCategory/select",
      placeholder: "Category",
      name: "category",
      showItem: "name",
      validation: "",
      default: "",
      tag: true,
      label: "Category",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "number",
      placeholder: "Booth Number",
      name: "boothNumber",
      validation: "",
      default: "",
      label: "Booth Number",
      // tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Company Name",
      name: "companyName",
      validation: "",
      default: "",
      tag: true,
      label: "Company Name",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Website",
      name: "website",
      validation: "",
      default: "",
      tag: true,
      label: "Website",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Logo",
      name: "logo",
      validation: "",
      default: "",
      tag: true,
      label: "Logo",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "First Name",
      name: "firstName",
      validation: "",
      default: "",
      tag: true,
      label: "First Name",
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
      tag: true,
      label: "Last Name",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Email",
      name: "email",
      validation: "",
      default: "",
      tag: true,
      label: "Email",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Phone",
      name: "phone",
      validation: "",
      default: "",
      tag: true,
      label: "Phone",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Designation",
      name: "designation",
      validation: "",
      default: "",
      tag: true,
      label: "Designation",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Password",
      name: "password",
      validation: "",
      default: "",
      tag: true,
      label: "Password",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Country",
      name: "country",
      validation: "",
      default: "",
      tag: true,
      label: "Country",
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
      tag: true,
      label: "Email",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`exhibitor`}
        itemTitle={{ name: "name", type: "text", collection: "category" }}
        shortName={`Exhibitor`}
        formMode={`double`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Exhibitor);
