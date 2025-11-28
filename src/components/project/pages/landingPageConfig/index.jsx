import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const LandingPageConfig = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Landing Page Config - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: "",
      tag: true,
      label: "Type",
      showItem: "Type",
      required: true,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "counts,about,speakers,features,keyfeatures,countdown,newsupdates,testimonial,gallery,socialmedia,footer",
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Show In Menu",
      name: "showInMenu",
      validation: "",
      default: null,
      tag: true,
      label: "Show In Menu",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Sequence",
      name: "sequence",
      validation: "",
      default: "",
      label: "Sequence",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Section",
      name: "section",
      validation: "",
      default: "",
      label: "Section",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "",
      label: "Description",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Number Of Item To Show",
      name: "numberOfItemToShow",
      validation: "",
      default: "",
      label: "Number Of Item To Show",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Status",
      name: "status",
      validation: "",
      default: null,
      tag: true,
      label: "Status",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: "",
      tag: true,
      label: "Event",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`landingPageConfig`}
        itemTitle={{ name: "title", type: "text", collection: "" }}
        shortName={`Landing Page Config`}
        formMode={`double`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(LandingPageConfig);
