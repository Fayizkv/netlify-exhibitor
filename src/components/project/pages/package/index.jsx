import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Packages = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Package - EventHex Portal`;
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
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "",
      label: "Description",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Form Limit",
      name: "formsLimit",
      validation: "",
      default: "",
      label: "Form Limit",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Instance Limit",
      name: "instanceLimit",
      validation: "",
      default: "",
      label: "Instance Limit",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Price",
      name: "price",
      validation: "",
      default: "",
      label: "Price",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "multiSelect",
      apiType: "API",
      selectApi: "event-module/select",
      placeholder: "Core Modules",
      name: "eventModule",
      validation: "",
      showItem: "name",
      tag: true,
      default: "",
      label: "Core Modules",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "checkbox",
      placeholder: "Is Active",
      name: "isActive",
      validation: "",
      default: "",
      label: "Is Active",
      tag: true,
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
        api={`package`}
        itemTitle={{ name: "title", type: "text", collection: "" }}
        shortName={`Package`}
        formMode={`single`}
        viewMode={"table"}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Packages);
