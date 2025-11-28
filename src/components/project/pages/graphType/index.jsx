import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const GraphType = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Graph Type - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Graph Type",
      name: "name",
      validation: "",
      default: "",
      tag: true,
      label: "Graph Type",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Graph Key",
      name: "key",
      validation: "",
      default: "",
      tag: true,
      label: "Graph Key",
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
        api={`graph-type`}
        // itemTitle={`label`}
        itemTitle={{
          name: "name",
          type: "text",
          collection: "",
        }}
        shortName={`Graph Type`}
        formMode={`single`}
        attributes={attributes}
        viewMode={"table"}
        {...props}
      ></ListTable>
    </Container>
  );
};

export default Layout(GraphType);
