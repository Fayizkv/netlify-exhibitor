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
  justify-content: space-around;
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

const Elements = ({ onBackClick, event, setMessage }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements] = useState([
    { id: "badge", icon: "Badge", value: "Badge" },
    { id: "certificate", icon: "Certificate", value: "Certificate" },
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
      type: "select",
      placeholder: "Layer Type",
      name: "layerType",
      validation: "",
      default: "",
      label: "Layer Type",
      showItem: "Layer Type",
      tag: true,
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "BackgroundImage,BackgroundGradient,Text,Image,Qr",
    },
    {
      type: "select",
      placeholder: "Source",
      name: "source",
      condition: {
        item: "layerType",
        if: "BackgroundImage",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Source",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "BackgroundImageUrl",
    },
    {
      type: "select",
      placeholder: "Position",
      name: "position",
      condition: {
        item: "layerType",
        if: "BackgroundImage",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Position",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "cover,contain",
    },
    {
      type: "select",
      placeholder: "Source",
      name: "source",
      condition: {
        item: "layerType",
        if: "BackgroundGradient",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Source",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "ColourPicker",
    },
    {
      type: "select",
      placeholder: "Source",
      name: "source",
      condition: {
        item: "layerType",
        if: "Text",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Source",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "FieldName",
    },
    {
      type: "text",
      placeholder: "Top",
      name: "top",
      condition: {
        item: "layerType",
        if: "Text",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Top",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Bottom",
      name: "bottom",
      condition: {
        item: "layerType",
        if: "Text",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Bottom",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Left",
      name: "left",
      condition: {
        item: "layerType",
        if: "Text",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "auto",
      tag: true,
      label: "Left",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Right",
      name: "right",
      condition: {
        item: "layerType",
        if: "Text",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Right",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Alignment",
      name: "textAlignment",
      condition: {
        item: "layerType",
        if: "Text",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Alignment",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Left,Right,Justify,Center",
    },
    {
      type: "select",
      placeholder: "Alignment",
      name: "textAlignment",
      condition: {
        item: "layerType",
        if: "Image",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Alignment",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Left,Right,Justify,Center",
    },
    {
      type: "text",
      placeholder: "Top",
      name: "top",
      condition: {
        item: "layerType",
        if: "Image",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Top",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Bottom",
      name: "bottom",
      condition: {
        item: "layerType",
        if: "Image",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Bottom",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Left",
      name: "left",
      condition: {
        item: "layerType",
        if: "Image",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "auto",
      tag: true,
      label: "Left",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Right",
      name: "right",
      condition: {
        item: "layerType",
        if: "Image",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Right",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Position",
      name: "position",
      condition: {
        item: "layerType",
        if: "Image",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Position",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "cover,contain",
    },
    {
      type: "select",
      placeholder: "Shape",
      name: "shape",
      condition: {
        item: "layerType",
        if: "Image",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Shape",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "round,square,curved",
    },
    {
      type: "select",
      placeholder: "Alignment",
      name: "textAlignment",
      condition: {
        item: "layerType",
        if: "Qr",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Alignment",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Left,Right,Justify,Center",
    },
    {
      type: "text",
      placeholder: "Top",
      name: "top",
      condition: {
        item: "layerType",
        if: "Qr",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Top",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Bottom",
      name: "bottom",
      condition: {
        item: "layerType",
        if: "Qr",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Bottom",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Left",
      name: "left",
      condition: {
        item: "layerType",
        if: "Qr",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "auto",
      tag: true,
      label: "Left",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Right",
      name: "right",
      condition: {
        item: "layerType",
        if: "Qr",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Right",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Source",
      name: "source",
      condition: {
        item: "layerType",
        if: "Qr",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Source",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "FieldName",
    },
    {
      type: "text",
      placeholder: "Prefix",
      name: "prefix",
      condition: {
        item: "layerType",
        if: "Qr",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Prefix",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Suffix",
      name: "suffix",
      condition: {
        item: "layerType",
        if: "Qr",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: true,
      label: "Suffix",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Height",
      name: "height",
      condition: {
        item: "layerType",
        if: "Text",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Height",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Width",
      name: "width",
      condition: {
        item: "layerType",
        if: "Text",
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "10px",
      tag: true,
      label: "Width",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ];

  //   if (
  //     selectedElement?.id === "select" ||
  //     selectedElement?.id === "multiSelect"
  //   ) {
  //     // Define the additional form inputs
  //     const additionalInputs = [
  //       {
  //         type: "select",
  //         placeholder: "Api Type",
  //         name: "apiType",
  //         showItem: "",
  //         validation: "",
  //         default: "",
  //         label: "Api Type",
  //         required: true,
  //         add: true,
  //         apiType: "CSV",
  //         selectApi: "CSV,json",
  //       },
  //       {
  //         type: "textarea",
  //         placeholder: "Select Api",
  //         name: "selectApi",
  //         showItem: "",
  //         validation: "",
  //         default: "",
  //         label: "Select Api",
  //         required: true,
  //         add: true,
  //       },
  //     ];

  //     // Splice the additional form inputs into the fourth position
  //     formInput.splice(4, 0, ...additionalInputs);
  //   }

  const isCreatingHandler = (value, callback) => {};
  const submitChange = async (post) => {
    postData({ type: selectedElement?.id, ...post }, "certification-data").then((response) => {
      console.log(response, "response");
      if (response.data.success === true) {
        setMessage({
          type: 1,
          content: `${selectedElement?.value} Created Successfully`,
          okay: "Okay",
        });
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
              // header={"IPH REPORT 2023-24"}
              // description={
              //   "2023 ഏപ്രിൽ മുതൽ 2024 മാറ്ച്ച് 31 വരെയുള്ള റിപ്പോറ്ട്ട് നൽകുക"
              // }
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
