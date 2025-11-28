import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Fpackage = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Franchise Package - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "date",
      placeholder: "Subscription Date",
      name: "subscriptionDate",
      validation: "",
      default: "",
      tag: true,
      label: "Subscription Date",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "package/select",
      placeholder: "Package",
      name: "package",
      validation: "",
      showItem: "title",
      tag: true,
      default: "",
      label: "Package",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "franchise/select",
      placeholder: "Franchise",
      name: "franchise",
      validation: "",
      showItem: "name",
      tag: true,
      default: "",
      label: "Franchise",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`franchise-package`}
        itemTitle={{ name: "", type: "text", collection: "" }}
        shortName={`Franchise Package`}
        formMode={`single`}
        viewMode={"table"}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Fpackage);
