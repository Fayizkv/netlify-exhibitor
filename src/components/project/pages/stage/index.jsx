import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Stage = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Stage - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Stage",
      name: "stage",
      validation: "",
      default: "",
      label: "Stage",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "toggle",
      placeholder: "Master Stage",
      name: "masterStage",
      validation: "",
      default: "",
      tag: true,
      label: "Master Stage",
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
        api={`stage`}
        itemTitle={{ name: "stage", type: "text", collection: "" }}
        shortName={`Stage`}
        formMode={`single`}
        viewMode={`table`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Stage);
