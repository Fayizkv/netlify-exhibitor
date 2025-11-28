import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Country = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Countries - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      tag: true,
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Country Code",
      name: "countryCode",
      validation: "",
      default: "",
      tag: true,
      label: "Country Code",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Phone Code",
      name: "phoneCode",
      validation: "",
      default: "",
      tag: true,
      label: "Phone Code",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Phone Number Length",
      name: "PhoneNumberLength",
      validation: "",
      default: "",
      label: "Phone Number Length",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "currency/select",
      placeholder: "Currency",
      name: "currency",
      showItem: "value",
      validation: "",
      default: "",
      tag: true,
      label: "Currency",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      placeholder: "Tax Type",
      name: "taxType",
      validation: "",
      default: "",
      label: "Tax Type",
      showItem: "Tax Type",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "VAT,GST",
    },
    {
      type: "number",
      placeholder: "Tax Percentage",
      name: "taxPercentage",
      validation: "",
      default: "",
      label: "Tax Percentage",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Language",
      name: "language",
      validation: "",
      default: "",
      tag: true,
      label: "Language",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Flag",
      name: "flag",
      validation: "",
      default: "",
      tag: true,
      label: "Flag",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`country`}
        itemTitle={{ name: "title", type: "text", collection: "" }}
        shortName={`Countries`}
        formMode={`single`}
        viewMode={"table"}
        {...props}
        clonePrivilege={true}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Country);
