import React, { useState } from "react";
import Layout from "../../../../../core/layout";
import styled from "styled-components";
import { GetIcon } from "../../../../../../icons";
import { postData } from "../../../../../../backend/api";
import AutoForm from "../../../../../core/autoform/AutoForm";
import { ElementContainer } from "../../../../../core/elements";

const ItemContainer = styled.div`
  padding: 10px 30px 10px 5px;
  margin: 0px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  overflow-y: auto; /* Enable vertical scrolling */
`;

const Element = styled.div`
  margin: 0px;
  height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  padding: 10px;
  border-radius: 13px;
  background-color: white;
  box-shadow: 0px 1.6px 11.67px -3.15px rgba(0, 0, 0, 0.25);
  cursor: pointer;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  gap: 5px;
  background-color: white;
  font-size: 10px;
`;

const BackButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const ElementDetails = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 20px;
  font-weight: bold;
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
  margin-bottom: 60px;
  margin-top: 60px;
  justify-content: center;
  width: 100%;
  margin: auto;
  margin: 0;
  padding: 0px 15px 0px 2px;
  img {
    max-width: 100%;
  }
  @media screen and (max-width: 1200px) and (min-width: 768px) {
    max-width: 768px;
  }
  @media screen and (max-width: 768px) {
    flex: 1 1 100%;
    width: auto;
    padding: 10px;
    margin: 0px auto;
  }
`;

const Elements = ({ onBackClick, ticket, setMessage, onRefreshLandingChange, onSubmitSuccess }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements] = useState([
    { id: "select", icon: "Select", value: "Select" },
    { id: "multiSelect", icon: "MultiSelect", value: "Multi Select" },
    { id: "text", icon: "Text", value: "Text" },
    { id: "textarea", icon: "paragraph", value: "Text Area" },
    { id: "image", icon: "image", value: "Image" },
    { id: "checkbox", icon: "checkBox", value: "Check Box" },
    { id: "date", icon: "date", value: "Date" },
    { id: "datetime", icon: "DateTime", value: "Date & Time" },
    { id: "number", icon: "Number", value: "Number" },
    { id: "email", icon: "email", value: "Email" },
    { id: "password", icon: "password", value: "Password" },
  ]);

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  const handleBackClick = () => {
    setSelectedElement(null);
    onBackClick();
  };

  const handleDragStart = (event, element) => {
    event.dataTransfer.setData("element", JSON.stringify(element));
  };

  let formInput = [
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: "",
      label: "Name",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Place Holder",
      name: "placeHolder",
      validation: "",
      default: "",
      label: "Place Holder",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Label",
      name: "label",
      validation: "",
      default: "",
      label: "Label",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Order Id",
      name: "orderId",
      validation: "",
      default: "",
      label: "Order Id",
      required: true,
      add: true,
    },
    // {
    //   type: "text",
    //   placeholder: "Validation",
    //   name: "validation",
    //   validation: "",
    //   default: "",
    //   label: "Validation",
    //   required: true,
    //   add: true,
    // },
    // {
    //   type: "text",
    //   placeholder: "Collection",
    //   name: "collection",
    //   validation: "",
    //   default: "",
    //   label: "Collection",
    //   required: true,
    //   add: true,
    // },

    // {
    //   type: "text",
    //   placeholder: "Show Item",
    //   name: "showItem",
    //   validation: "",
    //   default: "",
    //   label: "Show Item",
    //   required: true,
    //   add: true,
    // },
    {
      type: "text",
      placeholder: "Default",
      name: "default",
      validation: "",
      default: "",
      label: "Default",
      required: false,
      add: true,
    },
    {
      type: "title",
      title: "Permission Settings",
      name: "sm",
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Required",
      name: "required",
      validation: "",
      default: null,
      label: "Required",
      required: true,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Add",
      name: "add",
      validation: "",
      default: null,
      label: "Add",
      required: true,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Update",
      name: "update",
      validation: "",
      default: null,
      label: "Update",
      required: true,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Filter",
      name: "filter",
      validation: "",
      default: null,
      label: "Filter",
      required: true,
      add: true,
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
  ];

  if (selectedElement?.id === "select" || selectedElement?.id === "multiSelect") {
    // Define the additional form inputs
    const additionalInputs = [
      {
        type: "select",
        placeholder: "Api Type",
        name: "apiType",
        showItem: "",
        validation: "",
        default: "",
        label: "Api Type",
        required: true,
        add: true,
        apiType: "CSV",
        selectApi: "CSV,json",
      },
      {
        type: "textarea",
        placeholder: "Select Api",
        name: "selectApi",
        showItem: "",
        validation: "",
        default: "",
        label: "Select Api",
        required: true,
        add: true,
      },
    ];

    // Splice the additional form inputs into the fourth position
    formInput.splice(4, 0, ...additionalInputs);
  } else if (selectedElement?.id === "email") {
    const additionalInputs = [
      {
        type: "text",
        placeholder: "Validation",
        name: "validation",
        validation: "",
        default: "",
        label: "Validation",
        required: true,
        add: true,
      },
    ];
    formInput.splice(4, 0, ...additionalInputs);
  } else if (
    selectedElement?.id !== "select" &&
    selectedElement?.id !== "multiSelect" &&
    selectedElement?.id !== "image" &&
    selectedElement?.id !== "date" &&
    selectedElement?.id !== "datetime" &&
    selectedElement?.id !== "checkbox"
  ) {
    const additionalInputs = [
      {
        type: "text",
        placeholder: "Minimum Letters",
        name: "minimum",
        validation: "",
        default: "",
        label: "Minimum Letters",
        required: false,
        add: true,
      },
      {
        type: "text",
        placeholder: "Maximum Letters",
        name: "maximum",
        validation: "",
        default: "",
        label: "Maximum Letters",
        required: false,
        add: true,
      },
    ];
    formInput.splice(4, 0, ...additionalInputs);
  }

  const isCreatingHandler = (value, callback) => {};
  const submitChange = async (post) => {
    postData(
      {
        type: selectedElement?.id,
        ticket,
        EventOrTicket: "Ticket",
        // filter: true,
        view: true,
        tag: true,
        ...post,
      },
      "ticket-form-data"
    ).then((response) => {
      console.log(response, "response");
      if (response.data.success === true) {
        onSubmitSuccess();
        setMessage({
          type: 1,
          content: `${selectedElement?.value} Created Successfully`,
          okay: "Okay",
        });
        handleBackClick();
        onRefreshLandingChange(true);
      }
    });
  };

  return (
    <ElementContainer className="column">
      {!selectedElement ? (
        <ItemContainer>
          {elements.map((element, index) => (
            <Element key={index} draggable onClick={() => handleElementClick(element)} onDragStart={(event) => handleDragStart(event, element)}>
              <Item>
                <div style={{ fontSize: "20px" }}>
                  <GetIcon icon={element.icon} />
                </div>
                {element.value}
              </Item>
            </Element>
          ))}
        </ItemContainer>
      ) : (
        <ElementContainer className="column">
          <ElementDetails>
            <BackButton onClick={handleBackClick}>
              <GetIcon icon="previous" />
            </BackButton>
            {selectedElement.value}
          </ElementDetails>
          <Items>
            <AutoForm
              useCaptcha={false}
              key={"elements"}
              formType={"post"}
              header={"Yes"}
              description={""}
              customClass={"embed"}
              css="plain embed head-hide"
              formInput={formInput}
              submitHandler={submitChange}
              button={"Save"}
              isOpenHandler={isCreatingHandler}
              isOpen={true}
              plainForm={true}
              formMode={"single"}
            ></AutoForm>
          </Items>
        </ElementContainer>
      )}
    </ElementContainer>
  );
};
export default Layout(Elements);
