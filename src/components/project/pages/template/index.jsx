import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Template = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Template - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Name",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Orientation",
      name: "orientation",
      validation: "",
      default: "",
      label: "Orientation",
      showItem: "",
      tag: true,
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Portrait,Landscape",
    },
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: "",
      label: "Type",
      showItem: "Type",
      tag: true,
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Badge,Certificate,Insta QR",
    },
    {
      type: "number",
      placeholder: "Length",
      name: "length",
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Length",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Width",
      name: "width",
      showItem: "",
      validation: "",
      default: "auto",
      tag: true,
      label: "Width",
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
        api={`template`}
        itemTitle={{ name: "name", type: "text", collection: "" }}
        shortName={`Template`}
        formMode={`single`}
        {...props}
        attributes={attributes}
        viewMode={"table"}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Template);
