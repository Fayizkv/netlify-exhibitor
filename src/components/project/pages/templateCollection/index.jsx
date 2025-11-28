import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const TemplateCollection = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Template Collection - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Name",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: "email",
      label: "Type",
      showItem: "Type",
      tag: true,
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "email,notification,sms",
    },
    {
      type: "select",
      placeholder: "Category",
      name: "category",
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Category",
      required: true,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Master Templates,User Templates",
    },
    {
      type: "textarea",
      placeholder: "Subject",
      name: "subject",
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Subject",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Content",
      name: "content",
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Content",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Variables",
      name: "variables",
      validation: "",
      default: "",
      label: "Variables",
      showItem: "",
      tag: true,
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "event_name,attendee_name,event_date,organizer_name",
    },
    {
      type: "toggle",
      placeholder: "Is Default",
      name: "isDefault",
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Is Default",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Usage Count",
      name: "usageCount",
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Usage Count",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "date",
      placeholder: "Last Used",
      name: "lastUsed",
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Last Used",
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
        api={`template-collection`}
        itemTitle={{ name: "name", type: "text", collection: "" }}
        shortName={`Template Collection`}
        formMode={`single`}
        {...props}
        attributes={attributes}
        viewMode={"table"}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(TemplateCollection);
