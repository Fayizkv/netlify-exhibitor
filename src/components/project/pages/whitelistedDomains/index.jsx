import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const WhitelistedDomains = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `WhitelistedDomains - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Domain",
      name: "domain",
      validation: "",
      default: "",
      label: "Domain",
      required: true,
      view: false,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Event",
      name: "event",
      validation: "",
      default: "",
      tag: true,
      label: "Event",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Status",
      name: "status",
      validation: "",
      default: "",
      tag: true,
      label: "Status",
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
        api={`whitelisted-Domains`}
        // itemTitle={`label`}
        itemTitle={{
          name: "name",
          type: "text",
          collection: "",
        }}
        shortName={`WhitelistedDomains`}
        formMode={`double`}
        attributes={attributes}
        {...props}
      ></ListTable>
    </Container>
  );
};

export default Layout(WhitelistedDomains);
