import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const ParticipantCategory = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Participant Category - EventHex Portal`;
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
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Display Name",
      name: "displayName",
      validation: "",
      default: "",
      label: "Display Name",
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
        api={`participant-category`}
        // itemTitle={`label`}
        itemTitle={{
          name: "title",
          type: "text",
          collection: "",
        }}
        shortName={`Participant Category`}
        formMode={`single`}
        attributes={attributes}
        viewMode={"table"}
        {...props}
      ></ListTable>
    </Container>
  );
};

export default Layout(ParticipantCategory);
