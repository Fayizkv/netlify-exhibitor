import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";

const SortFilter = (props) => {
  // to update the page title
  useEffect(() => {
    document.title = `Sort Filter - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      placeholder: "Main Type",
      name: "mainType",
      validation: "",
      default: "",
      label: "Main Type",
      showItem: "Main Type",
      required: true,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "sort,filter",
    },
    {
      type: "text",
      placeholder: "Filter",
      name: "filter",
      validation: "",
      default: "",
      label: "Filter",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "attribute/select",
      placeholder: "Attribute Filter",
      name: "attributeFilter",
      validation: "",
      showItem: "title",
      tag: true,
      default: "",
      label: "Attribute Filter",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "model/select",
      placeholder: "Model",
      name: "model",
      validation: "",
      showItem: "modelName",
      tag: true,
      default: "",
      label: "Model",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable api={`sortfilter`} itemTitle={{ name: "mainType", type: "text", collection: "" }} shortName={`Sort Filter`} formMode={`single`} {...props} attributes={attributes}></ListTable>
    </Container>
  );
};

// exporting the page with parent container layout..
export default Layout(SortFilter);
