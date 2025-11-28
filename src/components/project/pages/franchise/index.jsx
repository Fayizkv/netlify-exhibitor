import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import { allCountries } from "../event/attributes/countries";
import { postData } from "../../../../backend/api";
import { useToast } from "../../../core/toast";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Franchise = (props) => {
  const toast = useToast();

  //to update the page title
  useEffect(() => {
    document.title = `Organization - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Organization Name",
      name: "name",
      validation: "",
      default: "",
      label: "Organization Name",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Primary Contact",
      name: "primaryContact",
      add: true,
      update: true,
      view: true,
    },
    {
      type: "text",
      placeholder: "Email",
      name: "email",
      validation: "",
      default: "",
      tag: true,
      label: "Email",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "mobilenumber",
      placeholder: "Phone Number",
      name: "phone",
      validation: "",
      default: "",
      tag: true,
      label: "Phone Number",
      required: true,
      view: true,
      add: true,
      update: true,
      countries: allCountries,
    },
    {
      type: "password",
      placeholder: "Password",
      name: "password",
      validation: "",
      default: "",
      // tag: true,
      label: "Password",
      required: false,
      view: true,
      add: true,
      update: false,
    },
    {
      type: "image",
      placeholder: "Logo",
      name: "logo",
      validation: "",
      default: "",
      tag: true,
      label: "Logo",
      required: false,
      view: true,
      add: true,
      update: true,
      multiple: false,
      maxFiles: 3,
      aspectHeight: 2,
      aspectWidth: 5,
    },
    {
      type: "toggle",
      placeholder: "Enable whiteLabelling",
      name: "whiteLabelEnabled",
      label: "Enable whiteLabelling",
      required: false,
      view: true,
      add: true,
      update: true,
      tag: false,
      export: false,
      default: false,
    },
  ]);

  const [franchiseAdmin] = useState([
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: "",
      tag: true,
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
      type: "text",
      placeholder: "Mobile",
      name: "mobile",
      validation: "",
      default: "",
      tag: true,
      label: "Mobile",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // {
    //   type: "text",
    //   placeholder: "District",
    //   name: "district",
    //   validation: "",
    //   default: "",
    //   tag: true,
    //   label: "District",
    //   required: false,
    //   view: true,
    //   add: true,
    //   update: true,
    // },
    {
      type: "password",
      placeholder: "Password",
      name: "password",
      validation: "",
      default: "",
      // tag: true,
      label: "Password",
      required: false,
      view: true,
      add: true,
      update: false,
    },
    // {
    //   type: "image",
    //   placeholder: "Image",
    //   name: "image",
    //   validation: "",
    //   default: "",
    //   tag: true,
    //   label: "Image",
    //   required: false,
    //   view: true,
    //   add: true,
    //   update: true,
    // },
  ]);

  const [actions] = useState([
    {
      element: "button",
      type: "subList",
      id: "user/franchiseAdmin",
      icon: "franchise",
      title: "Organization Admin",
      attributes: franchiseAdmin,
      params: {
        api: `user/franchiseAdmin`,
        parentReference: "franchise",
        itemTitle: { name: "title", type: "text", collection: "" },
        shortName: "Organization Admin",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "medium",
        formMode: "single",
        exportPrivilege: true,
      },
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        actions={actions}
        api={`franchise`}
        // itemTitle={`label`}
        itemTitle={{ name: "name", type: "text", collection: "" }}
        shortName={`Organization`}
        formMode={`single`}
        attributes={attributes}
        viewMode={"table"}
        {...props}
      ></ListTable>
    </Container>
  );
};

export default Layout(Franchise);
