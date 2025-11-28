import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const TicketRegistration = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Ticket Registration - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "ticket/select",
      placeholder: "Ticket",
      name: "ticket",
      validation: "",
      showItem: "title",
      // tag: true,
      default: "",
      label: "Ticket",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "authentication/select",
      placeholder: "Authentication",
      name: "authentication",
      validation: "",
      showItem: "fullName",
      tag: true,
      default: "",
      label: "Authentication",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    // {
    //     type: "select",
    //     apiType: "API",
    //     selectApi: "event/select",
    //     placeholder: "Event",
    //     name: "event",
    //     validation: "",
    //     showItem: "title",
    //     // tag: true,
    //     default: "",
    //     label: "Event",
    //     required: true,
    //     view: true,
    //     add: true,
    //     update: true,
    //     filter: true,
    //   },
    {
      type: "text",
      placeholder: "Form Data",
      name: "formData",
      validation: "",
      default: "",
      label: "Form Data",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "date",
      placeholder: "Registration",
      name: "registration",
      validation: "",
      default: "",
      label: "Registration",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "time",
      placeholder: "Time",
      name: "time",
      validation: "",
      default: "",
      label: "Time",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "IP",
      name: "ip",
      validation: "",
      default: "",
      label: "IP",
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
        api={`ticket-registration`}
        itemTitle={{
          name: "title",
          type: "text",
          collection: "ticket",
        }}
        shortName={`Ticket Registration`}
        formMode={`double`}
        attributes={attributes}
        {...props}
      ></ListTable>
    </Container>
  );
};

export default Layout(TicketRegistration);
