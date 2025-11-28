import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const SubscriptionPlanModule = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Subscription Plan Module - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "subscription-plan/select",
      placeholder: "Subscription Plan",
      name: "subscriptionPlan",
      validation: "",
      showItem: "value",
      default: "",
      tag: true,
      label: "Subscription Plan",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "modules/select",
      placeholder: "Module",
      name: "module",
      validation: "",
      showItem: "value",
      tag: true,
      default: "",
      label: "Module",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "multiSelect",
      apiType: "API",
      selectApi: "listing-page/select",
      placeholder: "Listing Page",
      name: "listingPage",
      validation: "",
      showItem: "value",
      default: "",
      tag: true,
      label: "Listing Page",
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
        api={`subscription-plan-module`}
        itemTitle={{ name: "value", type: "text", collection: "subscriptionPlan" }}
        shortName={`Subscription Plan Module`}
        // parentReference={"event"}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(SubscriptionPlanModule);
