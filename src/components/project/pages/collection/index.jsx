import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Collection = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `About Us - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Page",
      name: "page",
      validation: "",
      default: "",
      label: "Page",
      // tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Content",
      name: "content",
      validation: "",
      default: "",
      label: "Content",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },

    {
      type: "text",
      placeholder: "Slug",
      name: "slug",
      validation: "",
      default: "",
      label: "Slug",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Menu Title",
      name: "menuTitle",
      validation: "",
      default: "",
      label: "Menu Title",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "image",
      validation: "",
      default: "false",
      tag: true,
      label: "Image",
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
        api={`about-us`}
        itemTitle={{ name: "vision", type: "text", collection: "" }}
        shortName={`About Us`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Collection);
