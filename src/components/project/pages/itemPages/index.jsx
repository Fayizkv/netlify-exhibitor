import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const ItemPages = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Item Pages - EventHex Portal`;
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
      placeholder: "Key",
      name: "key",
      validation: "",
      default: "",
      label: "Key",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "menu/select",
      placeholder: "Menu",
      name: "menu",
      validation: "",
      showItem: "value",
      tag: true,
      default: "",
      label: "Menu",
      required: true,
      view: false,
      add: true,
      update: true,
      filter: false,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`item-pages`}
        itemTitle={{ name: "title", type: "text", collection: "" }}
        shortName={`Item Pages`}
        formMode={`single`}
        viewMode={"table"}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(ItemPages);
