import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const ListingPages = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Listing Pages - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Page",
      name: "page",
      validation: "required",
      default: "",
      label: "Page",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "text",
      placeholder: "Component ID",
      name: "component_id",
      validation: "required",
      default: "",
      label: "Component ID",
      required: true,
      view: true,
      tag: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "text",
      placeholder: "Child",
      name: "child",
      validation: "",
      default: "",
      label: "Child",
      required: false,
      view: true,
      tag: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "text",
      placeholder: "Parent",
      name: "parent",
      validation: "",
      default: "",
      label: "Parent",
      required: false,
      view: true,
      tag: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "text",
      placeholder: "Grandparent",
      name: "grandparent",
      validation: "",
      default: "",
      label: "Grandparent",
      required: false,
      view: true,
      tag: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "date",
      placeholder: "Created At",
      name: "createdAt",
      validation: "",
      default: "",
      label: "Created At",
      required: false,
      view: true,
      tag: true,
      add: false,
      update: false,
      filter: true,
    },
    {
      type: "date",
      placeholder: "Updated At",
      name: "updatedAt",
      validation: "",
      default: "",
      label: "Updated At",
      required: false,
      view: true,
      add: false,
      update: false,
      filter: true,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable api={`listing-page`} itemTitle={{ name: "page", type: "text", collection: "" }} shortName={`Listing Page`} formMode={`single`} viewMode={"table"} {...props} attributes={attributes} />
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(ListingPages);
