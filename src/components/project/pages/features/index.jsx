import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Features = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Features - EventHex Portal`;
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
      required: true,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "features,keyfeatures",
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
      tag: true,
      label: "Event",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "number",
      placeholder: "Sequence",
      name: "sequence",
      validation: "",
      default: "",
      label: "Sequence",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      tag: true,
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
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "icon",
      validation: "",
      default: "false",
      tag: true,
      label: "Image",
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
        api={`features`}
        itemTitle={{ name: "type", type: "text", collection: "" }}
        shortName={`Features`}
        formMode={`double`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Features);
