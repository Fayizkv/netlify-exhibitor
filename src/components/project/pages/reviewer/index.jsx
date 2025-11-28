import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import { reviewersAttributes } from "../event/attributes/reviewers";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Reviewers = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Reviewers - EventHex Portal`;
  }, []);

  // Get event ID from props (multiple fallback methods)
  const eventId = props?.openData?.data?._id || props?.data?._id || props?.eventId || props?.event?._id || new URLSearchParams(window.location.search).get("event");

  const [attributes] = useState([
    {
      type: "hidden",
      placeholder: "event",
      name: "event",
      default: eventId,
      validation: "",
      label: "event",
      required: true,
      view: false,
      add: true,
      update: false,
    },
    ...reviewersAttributes,
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`reviewer`}
        itemTitle={{ name: "name", type: "text", collection: "" }}
        shortName={`Reviewers`}
        formMode={`single`}
        {...props}
        attributes={attributes}
        addPrivilege={true}
        delPrivilege={true}
        updatePrivilege={true}
        viewPrivilege={true}
        editPrivilege={true}
        deletePrivilege={true}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Reviewers);
