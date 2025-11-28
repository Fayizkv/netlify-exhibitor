import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Leaderboard = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Leaderboard - EventHex Portal`;
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
      type: "text",
      placeholder: "Title",
      name: "description",
      validation: "",
      default: "",
      tag: true,
      label: "Title",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Points",
      name: "points",
      validation: "",
      default: "",
      label: "Points",
      tag: true,
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
        api={`leaderboard`}
        itemTitle={{ name: "title", type: "text", collection: "" }}
        shortName={`Leaderboard`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Leaderboard);
