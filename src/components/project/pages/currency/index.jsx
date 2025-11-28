import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Currency = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Currencies - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      tag: true,
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Short Name",
      name: "shortName",
      validation: "",
      default: "",
      tag: true,
      label: "Short Name",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Logo",
      name: "logo",
      validation: "",
      default: "",
      tag: true,
      label: "Logo",
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
        api={`currency`}
        itemTitle={{ name: "title", type: "text", collection: "" }}
        shortName={`Currencies`}
        formMode={`single`}
        {...props}
        viewMode={"table"}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Currency);
