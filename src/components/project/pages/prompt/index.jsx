import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Prompt = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Prompt - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: "",
      label: "Name",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Prompt",
      name: "prompt",
      validation: "",
      default: "",
      label: "Prompt",
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
      tag: false,
      required: false,
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
      label: "Is Active",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // {
    //   type: "datetime",
    //   placeholder: "Last Updated",
    //   name: "lastUpdated",
    //   validation: "",
    //   default: "",
    //   label: "Last Updated",
    //   tag: false,
    //   required: false,
    //   view: true,
    //   add: true,
    //   update: true,
    // },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`prompt`}
        itemTitle={{ name: "name", type: "text", collection: "" }}
        shortName={`Prompt`}
        // formMode={`single`}
        // viewMode={`table`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Prompt);
