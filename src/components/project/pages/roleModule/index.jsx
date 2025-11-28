import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const ItemPagesRole = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Page Role - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Pages",
      name: "pages",
      validation: "",
      default: "",
      tag: true,
      label: "Pages",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Permission",
      name: "permission",
      validation: "",
      default: "",
      label: "Permission",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Role",
      name: "role",
      validation: "",
      default: "",
      label: "Role",
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
        api={`item-pages-role`}
        itemTitle={{ name: "pages", type: "text", collection: "" }}
        shortName={`Page Role`}
        formMode={`single`}
        viewMode={"table"}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(ItemPagesRole);
