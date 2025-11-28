import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const EventModule = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Event Module - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: "Core Module",
      label: "Type",
      tag: false,
      required: true,
      view: true,
      filter: false,
      add: false,
      update: false,
      apiType: "CSV",
      selectApi: "Add On,Core Module",
    },
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: "",
      label: "Name",
      tag: true,
      required: true,
      view: true,
      customClass: "full",
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      customClass: "full",
      default: "",
      tag: false,
      label: "Description",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Icon",
      name: "icon",
      validation: "",
      default: "",
      label: "Icon",
      customClass: "full",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "menu/select",
      placeholder: "Menu",
      name: "menu",
      validation: "",
      showItem: "label",
      tag: true,
      default: "",
      label: "Menu",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "multiSelect",
      apiType: "API",
      selectApi: "item-pages/menu",
      updateOn: "menu",
      placeholder: "Pages",
      name: "pages",
      validation: "",
      showItem: "title",
      tag: true,
      default: "",
      label: "Pages",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "toggle",
      placeholder: "Is Active",
      name: "isActive",
      validation: "",
      default: true,
      customClass: "full",
      tag: true,
      label: "Is Active",
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
        api={`event-module/module`}
        itemTitle={{ name: "name", type: "text", collection: "" }}
        shortName={`Core Modules`}
        formMode={`single`}
        viewMode={`table`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(EventModule);
