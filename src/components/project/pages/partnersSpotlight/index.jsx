import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const PartnersSpotlight = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Partners Spotlight - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Partner Name",
      name: "partnerName",
      validation: "",
      default: "",
      tag: false,
      label: "Partner Name",
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
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Link",
      name: "link",
      validation: "",
      default: "",
      tag: true,
      label: "Link",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Clicks",
      name: "clicks",
      validation: "",
      default: "",
      tag: true,
      label: "Clicks",
      required: false,
      view: true,
      add: false,
      update: false,
    },
    {
      type: "number",
      placeholder: "Impressions",
      name: "impressions",
      validation: "",
      default: "",
      tag: true,
      label: "Impressions",
      required: false,
      view: true,
      add: false,
      update: false,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`partners-spotlight`}
        itemTitle={{ name: "partnerName", type: "text", collection: "" }}
        shortName={`Partners Spotlight`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(PartnersSpotlight);
