import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Feedback = (props) => {
  console.log("[Feedback] Component rendered", props);
  //to update the page title
  useEffect(() => {
    document.title = `Feedback - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Overall",
      name: "overall",
      validation: "",
      default: "",
      label: "Overall",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Sessions",
      name: "sessions",
      validation: "",
      default: "",
      label: "Sessions",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
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
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`mobile/feedback?event=${props.openData?.data?._id}`}
        itemTitle={{ name: "overall", type: "text", collection: "" }}
        shortName={`Feedback`}
        formMode={`single`}
        {...props}
        // parentReference={props.openData?.data?._id}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Feedback);
