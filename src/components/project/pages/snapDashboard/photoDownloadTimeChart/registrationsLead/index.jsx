import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const RegistrationsLead = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `RegistrationsLead - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "exhibitor/select",
      placeholder: "Exhibitor",
      name: "exhibitor",
      showItem: "name",
      validation: "",
      default: "",
      //   tag: true,
      label: "Exhibitor",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "registration/select",
      placeholder: "Registration",
      name: "registration",
      showItem: "name",
      validation: "",
      default: "",
      tag: true,
      label: "Registration",
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
        api={`registrationsLead`}
        itemTitle={{ name: "name", type: "text", collection: "exhibitor" }}
        shortName={`RegistrationsLead`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(RegistrationsLead);
