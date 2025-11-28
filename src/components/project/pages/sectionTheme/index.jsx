import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const SectionTheme = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Section Theme - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      required: false,
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
        api={`section-theme`}
        // itemTitle={`label`}
        itemTitle={{
          name: "title",
          type: "text",
          collection: "",
        }}
        shortName={`Section Theme`}
        formMode={`single`}
        attributes={attributes}
        {...props}
      ></ListTable>
    </Container>
  );
};

export default Layout(SectionTheme);
