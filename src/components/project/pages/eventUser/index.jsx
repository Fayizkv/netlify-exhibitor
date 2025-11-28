import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const EventUser = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Event User - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      tag: true,
      default: "",
      label: "Event",
      required: false,
      view: false,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "user/select",
      placeholder: "Registration",
      name: "registration",
      validation: "",
      showItem: "name",
      tag: true,
      default: "",
      label: "Registration",
      required: false,
      view: false,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "date",
      placeholder: "Date",
      name: "date",
      validation: "",
      default: "",
      label: "Date",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`event-user`}
        itemTitle={{ name: "title", type: "text", collection: "event" }}
        shortName={`Event User`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(EventUser);
