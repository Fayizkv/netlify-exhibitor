import React, { useEffect, useState } from "react";
import Layout from "../../../../core/layout";
import ListTable from "../../../../core/list/list";
import { ElementContainer } from "../../../../core/elements";
import { Content, DragBox } from "../ticketForm/ticketForm.styled";
import { GetIcon } from "../../../../../icons";
import AutoForm from "../../../../core/autoform/AutoForm";
import { getData } from "../../../../../backend/api";

//if you want to write custom style wirte in above file
const TicketFormDemo = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `TicketFormDemo - EventHex Portal`;
  }, []);
  const onChange = (name, updateValue) => {
    const { label } = updateValue;
    updateValue["placeHolder"] = label;
    return updateValue;
  };

  const [formData, setFormData] = useState([]);
  useEffect(() => {
    getData({ ticket: props?.openData?.data?._id }, "ticket-form-data").then((response) => {
      setFormData(response?.data?.response);
    });
  }, [props]);

  const [attributes] = useState([
    {
      type: "hidden",
      placeholder: "Ticket",
      name: "ticket",
      validation: "",
      default: `${props?.openData?.data?._id}`,
      label: "Ticket",
      tag: false,
      required: false,
      view: false,
      add: true,
      update: false,
    },
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: "",
      tag: true,
      label: "Type",
      showItem: "Type",
      required: true,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "JSON",
      selectApi: [
        { id: "select", value: "Select" },
        { id: "multiSelect", value: "MultiSelect" },
        { id: "text", value: "Text" },
        { id: "textarea", value: "Textarea" },
        { id: "image", value: "Image" },
        { id: "checkbox", value: "Checkbox" },
        { id: "date", value: "Date" },
        { id: "datetime", value: "DateTime" },
        { id: "number", value: "Number" },
        { id: "email", value: "Email" },
        { id: "password", value: "Password" },
      ],
    },
    {
      type: "text",
      placeholder: "Label",
      name: "label",
      validation: "",
      default: "",
      label: "Label",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
      onChange: onChange,
    },
    {
      type: "hidden",
      placeholder: "Place Holder",
      name: "placeHolder",
      validation: "",
      default: "",
      label: "Place Holder",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
    },

    {
      type: "number",
      placeholder: "Order Id",
      name: "orderId",
      validation: "",
      default: "",
      label: "Order Id",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Api Type",
      name: "apiType",
      condition: {
        item: "type",
        if: ["select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Api Type",
      required: true,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "CSV,JSON",
    },

    {
      type: "options",
      placeholder: "Add options",
      name: "selectApi",
      condition: {
        item: "type",
        if: "select",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Add options",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Select Api",
      name: "selectApi",
      condition: {
        item: "type",
        if: "multiSelect",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Select Api",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "hidden",
      placeholder: "Validation",
      name: "validation",
      validation: "",
      default: "",
      label: "Validation",
      tag: false,
      // required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "hidden",
      placeholder: "Collection",
      name: "dbcollection",
      validation: "",
      default: "formData",
      label: "Collection",
      tag: false,
      // required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "hidden",
      placeholder: "Show Item",
      name: "showItem",
      validation: "",
      default: "",
      label: "Show Item",
      tag: false,
      // required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Default",
      name: "default",
      validation: "",
      default: "",
      label: "Default",
      tag: false,
      // required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Permission Settings",
      name: "sm",
      add: true,
      update: true,
    },
    {
      type: "hidden",
      placeholder: "Tag",
      name: "tag",
      validation: "",
      default: "true",
      value: true,
      tag: false,
      label: "Tag",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Required",
      name: "required",
      validation: "",
      default: "true",
      tag: true,
      label: "Required",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "hidden",
      value: true,
      placeholder: "View",
      name: "view",
      validation: "",
      tag: false,
      label: "View",
      required: true,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    {
      type: "hidden",
      placeholder: "Add",
      value: true,
      name: "add",
      validation: "",
      tag: false,
      label: "Add",
      required: true,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    {
      type: "hidden",
      value: true,
      placeholder: "Update",
      name: "update",
      validation: "",
      tag: false,
      label: "Update",
      required: true,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    {
      type: "hidden",
      placeholder: "Filter",
      value: true,
      name: "filter",
      validation: "",
      tag: false,
      label: "Filter",
      required: true,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    {
      type: "title",
      title: "Condition Settings",
      name: "sm",
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Enable Condition",
      name: "conditionEnabled",
      validation: "",
      default: "false",
      tag: true,
      label: "Enable Condition",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Condition Checking Field",
      name: "conditionWhenField",
      condition: {
        item: "conditionEnabled",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Condition Checking Field",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Match Values",
      name: "conditionCheckMatch",
      condition: {
        item: "conditionEnabled",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Match Values",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "If Match",
      name: "conditionIfMatch",
      condition: {
        item: "conditionEnabled",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      apiType: "JSON",
      selectApi: [
        { id: "enabled", value: "Show This Filed" },
        { id: "disabled", value: "Hide This Filed" },
      ],
      label: "Check Match Values",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ]);

  return (
    <div
      style={{
        // flexWrap: "wrap",
        gap: "10px",
        display: "flex",
        height: "calc(100vh - 100px)",
      }}
    >
      <div>
        {/* <ElementContainer className="column"> */}
        <ListTable
          // actions={actions}
          preFilter={{ ticket: `${props?.openData?.data?._id}` }}
          api={"ticket-form-data"}
          itemTitle={{ name: "name", type: "text", collection: "" }}
          shortName={`Ticket Form Data`}
          formMode={`double`}
          attributes={attributes}
          {...props}
        ></ListTable>
        {/* </ElementContainer> */}
      </div>

      <Content>
        {formData.length === 0 ? (
          <DragBox>
            <GetIcon icon="circlePlus" />
            Select Elements
          </DragBox>
        ) : (
          <ElementContainer className="dashitem">
            <AutoForm
              useCaptcha={false}
              key={"elements"}
              formType={"post"}
              header={"Yes"}
              description={""}
              customClass={"embed"}
              css="plain embed head-hide"
              // header={"IPH REPORT 2023-24"}
              // description={
              //   "2023 ഏപ്രിൽ മുതൽ 2024 മാറ്ച്ച് 31 വരെയുള്ള റിപ്പോറ്ട്ട് നൽകുക"
              // }
              formInput={formData}
              // submitHandler={submitChange}
              // button={"Save"}
              // isOpenHandler={isCreatingHandler}
              isOpen={true}
              plainForm={true}
              formMode={"single"}
            ></AutoForm>
          </ElementContainer>
        )}
      </Content>
    </div>
  );
};
// exporting the page with parent container layout..
export default Layout(TicketFormDemo);
