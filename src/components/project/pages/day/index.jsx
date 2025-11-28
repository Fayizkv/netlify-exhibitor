import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Day = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Day - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Day",
      name: "day",
      validation: "",
      default: "",
      label: "Day",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "toggle",
      placeholder: "Master Day",
      name: "masterDay",
      validation: "",
      default: "",
      tag: true,
      label: "Master Day",
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
        api={`day`}
        itemTitle={{ name: "day", type: "text", collection: "" }}
        shortName={`Day`}
        formMode={`single`}
        viewMode={`table`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Day);
