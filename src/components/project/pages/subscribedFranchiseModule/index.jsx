import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const SubscribedFranchiseModule = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Subscribed Franchise Module - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "multiSelect",
      apiType: "API",
      selectApi: "subscription-plan/select",
      placeholder: "Subscription Plan",
      name: "subscriptionPlan",
      validation: "",
      showItem: "value",
      default: "",
      tag: false,
      label: "Subscription Plan",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "multiSelect",
      apiType: "API",
      selectApi: "event-module/select",
      placeholder: "Module",
      name: "module",
      validation: "",
      showItem: "value",
      default: "",
      tag: true,
      label: "Module",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "number",
      placeholder: "Count",
      name: "count",
      validation: "",
      default: 1,
      tag: true,
      label: "Count",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "franchise/select",
      placeholder: "Franchise",
      name: "franchise",
      validation: "",
      showItem: "value",
      default: "",
      tag: false,
      label: "Franchise",
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
        api={`subscribed-franchise-module`}
        itemTitle={{ name: "value", type: "text", collection: "subscriptionPlan" }}
        shortName={`Subscribed Franchise Module`}
        parentReference={"event"}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(SubscribedFranchiseModule);
