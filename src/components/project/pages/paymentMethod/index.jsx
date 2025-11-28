import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
// import { getData } from "../../../../backend/api";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const PaymentMethod = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Payment Method - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      placeholder: "Gateways",
      name: "gateways",
      validation: "",
      default: "",
      tag: true,
      label: "Gateways",
      showItem: "Gateways",
      required: true,
      view: false,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Eventhex, Other",
    },
    {
      type: "select",
      placeholder: "Method",
      name: "method",
      validation: "",
      default: "",
      tag: true,
      label: "Method",
      showItem: "Method",
      required: true,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Eventhex, Offline Payment, Razorpay, Stripe",
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`payment-method`}
        itemTitle={{ name: "method", type: "text", collection: "" }}
        shortName={`Payment Method`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(PaymentMethod);
