import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const ExhibitorCategory = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Exhibitor Package - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Category Name",
      name: "categoryName",
      validation: "",
      default: "",
      tag: true,
      label: "Category Name",
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
      tag: true,
      label: "Price",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "boolean",
      placeholder: "Is Paid",
      name: "isPaid",
      validation: "",
      default: "",
      tag: true,
      label: "Is Paid",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "boolean",
      placeholder: "Lead Capture",
      name: "leadCapture",
      validation: "",
      default: "",
      tag: true,
      label: "Lead Capture",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Exhibitor Passes",
      name: "exhibitorPasses",
      validation: "",
      default: "",
      tag: true,
      label: "Exhibitor Passes",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "boolean",
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
    {
      type: "text",
      placeholder: "Booth Details",
      name: "boothDetails",
      validation: "",
      default: "",
      tag: true,
      label: "Booth Details",
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
        api={`exhibitorCategory`}
        itemTitle={{ name: "categoryName", type: "text", collection: "" }}
        shortName={`ExhibitorCategory`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(ExhibitorCategory);
