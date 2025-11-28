import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const SubscriptionCoupon = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Subscription Coupon - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Code",
      name: "code",
      validation: "",
      default: "",
      label: "Code",
      // tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      showItem: "",
      validation: "",
      default: "Fixed",
      tag: true,
      label: "Type",
      required: true,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Percentage,Fixed",
    },
    {
      type: "number",
      placeholder: "Value",
      name: "price",
      validation: "",
      default: null,
      tag: true,
      label: "Value",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Min Purchase",
      name: "minPurchase",
      validation: "",
      default: 0,
      tag: true,
      label: "Min Purchase",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Max Discount",
      name: "maxDiscount",
      validation: "",
      default: "",
      tag: true,
      label: "Max Discount",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "date",
      placeholder: "Start Date",
      name: "startDate",
      validation: "",
      default: "",
      tag: true,
      label: "Start Date",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "date",
      placeholder: "End Date",
      name: "endDate",
      validation: "",
      default: "",
      tag: true,
      label: "End Date",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Usage Limit",
      name: "usageLimit",
      validation: "",
      default: 1,
      tag: true,
      label: "Usage Limit",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Used Count",
      name: "usedCount",
      validation: "",
      default: 0,
      tag: true,
      label: "Used Count",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "toggle",
      placeholder: "Is Active",
      name: "isActive",
      validation: "",
      default: true,
      tag: true,
      label: "Is Active",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "subscription-plan/select",
      placeholder: "Subscription Plan",
      name: "package",
      validation: "",
      showItem: "value",
      default: "",
      tag: false,
      label: "Subscription Plan",
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
        api={`subscription-coupon`}
        itemTitle={{ name: "code", type: "text", collection: "" }}
        shortName={`Subscription Coupon`}
        // parentReference={"event"}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(SubscriptionCoupon);
