import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const SessionType = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Session Type - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Session Type",
      name: "sessionType",
      validation: "",
      default: "",
      label: "Session Type",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "toggle",
      placeholder: "Master Session",
      name: "masterSession",
      validation: "",
      default: "",
      tag: true,
      label: "Master Session",
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
        api={`session-type`}
        itemTitle={{ name: "sessionType", type: "text", collection: "" }}
        shortName={`Session Type`}
        formMode={`single`}
        viewMode={`table`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(SessionType);
