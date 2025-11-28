import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";

const LayoutComponent = (props) => {
  // to update the page title
  useEffect(() => {
    document.title = `Layout - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Layout Type",
      name: "layoutType",
      validation: "",
      default: "",
      label: "Layout Type",
      required: true,
      view: true,
      tag: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Layout Name",
      name: "layoutName",
      validation: "",
      default: "",
      label: "Layout Name",
      required: true,
      view: true,
      // tag: true,
      add: true,
      update: true,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable api={`layout`} itemTitle={{ name: "layoutName", type: "text", collection: "" }} shortName={`Layout`} formMode={`single`} {...props} attributes={attributes}></ListTable>
    </Container>
  );
};

// exporting the page with parent container layout..
export default Layout(LayoutComponent);
