import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const TeamMember = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Team Member - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: "",
      tag: false,
      label: "Name",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "email",
      placeholder: "E-Mail",
      name: "email",
      validation: "",
      default: "",
      tag: true,
      label: "E-Mail",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "user-type/select",
      placeholder: "User Type",
      name: "userType",
      validation: "",
      showItem: "role",
      tag: true,
      default: "",
      label: "User Type",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    // {
    //   type: "select",
    //   apiType: "API",
    //   selectApi: "event/select",
    //   condition: {
    //     item: "userType",
    //     if: "65a8b8bec6ecb90dd2d5a1f1",
    //     then: "enabled",
    //     else: "disabled",
    //   },
    //   placeholder: "Event",
    //   name: "event",
    //   showItem: "title",
    //   validation: "",
    //   default: "",
    //   tag: false,
    //   label: "Event",
    //   required: false,
    //   view: true,
    //   add: true,
    //   update: true,
    //   filter: false,
    //   icon: "event",
    // },
    // {
    //   type: "multiSelect",
    //   placeholder: "Select Tickets",
    //   name: "ticket",
    //   validation: "",
    //   tag: false,
    //   editable: true,
    //   label: "Select Tickets",
    //   showItem: "",
    //   required: false,
    //   view: true,
    //   filter: false,
    //   add: true,
    //   update: true,
    //   updateOn: "event",
    //   apiType: "API",
    //   selectApi: "ticket/event-ticket",
    // },
    {
      type: "password",
      placeholder: "Password",
      name: "password",
      validation: "password",
      info: "At least one uppercase letter (A-Z) \n At least one lowercase letter (a-z) \n At least one digit (0-9) \n At least one special character (@, $, !, %, *, ?, &) \n Minimum length of 8 characters",
      minimum: 0,
      maximum: 16,
      default: "",
      // tag: true,
      label: "Password",
      required: true,
      view: true,
      add: true,
      update: false,
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        //p
        api={`user`}
        itemTitle={{ name: "name", type: "text", collection: "" }}
        shortName={`Team Member`}
        formMode={`single`}
        viewMode={`table`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(TeamMember);
