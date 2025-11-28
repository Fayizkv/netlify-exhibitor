import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Tax = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Tax - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: "",
      label: "Type",
      showItem: "Type",
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
      placeholder: "Percentage",
      name: "percentage",
      validation: "",
      default: "",
      label: "Percentage",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "toggle",
      placeholder: "Is Active",
      name: "isActive",
      validation: "",
      default: "",
      tag: true,
      label: "Is Active",
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
        api={`tax`}
        itemTitle={{ name: "type", type: "text", collection: "" }}
        shortName={`Tax`}
        formMode={`single`}
        viewMode={"table"}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Tax);
