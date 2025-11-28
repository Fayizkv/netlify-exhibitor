import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const PageSection = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Page Section - EventHex Portal`;
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
    {
      type: "text",
      placeholder: "Icon",
      name: "icon",
      validation: "",
      default: "",
      label: "Icon",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const [sectionTheme] = useState([
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

  const [actions] = useState([
    {
      element: "button",
      type: "subList",
      id: "section-theme",
      title: "Section Theme",
      icon: "section-theme",
      attributes: sectionTheme,
      params: {
        api: `section-theme`,
        parentReference: "pageSection",
        itemTitle: {
          name: "title",
          type: "text",
          collection: "",
        },
        shortName: "Section Theme",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "medium",
        formMode: "single",
        viewMode: "table",
      },
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        actions={actions}
        api={`page-section`}
        // itemTitle={`label`}
        itemTitle={{
          name: "title",
          type: "text",
          collection: "",
        }}
        shortName={`Page Section`}
        formMode={`single`}
        attributes={attributes}
        viewMode={"table"}
        {...props}
      ></ListTable>
    </Container>
  );
};

export default Layout(PageSection);
