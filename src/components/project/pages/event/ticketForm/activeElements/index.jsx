import React, { useEffect, useState } from "react";
import Layout from "../../../../../core/layout";
import styled from "styled-components";
import { deleteData, getData, putData } from "../../../../../../backend/api";
import AutoForm from "../../../../../core/autoform/AutoForm";
import { ElementContainer } from "../../../../../core/elements";
import { GetIcon } from "../../../../../../icons";

const ItemContainer = styled.div`
  padding: 10px 30px 10px 5px;
  margin: 0px 0;
  display: flex;
  // flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  overflow-y: auto; /* Enable vertical scrolling */
`;

const Element = styled.div`
  margin: 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  padding: 10px;
  border-radius: 13px;
  background-color: white;
  box-shadow: 0px 1.6px 11.67px -3.15px rgba(0, 0, 0, 0.25);
  cursor: pointer;
`;

const Item = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: space-between;
  gap: 10px;
  background-color: white;
  font-size: 16px;
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

const Button = styled.div`
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: transparent;
  border: none;
`;

const ActiveElements = ({ onBackClick, ticket, setMessage, onRefreshLandingChange, refresh, onElementClick }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState([]);
  const [reload, setReload] = useState(false);
  const [icons] = useState([
    { id: "select", icon: "Select" },
    { id: "multiSelect", icon: "MultiSelect" },
    { id: "text", icon: "Text" },
    { id: "textarea", icon: "paragraph" },
    { id: "image", icon: "image" },
    { id: "checkbox", icon: "checkBox" },
    { id: "date", icon: "date" },
    { id: "datetime", icon: "DateTime" },
    { id: "number", icon: "Number" },
    { id: "email", icon: "email" },
    { id: "password", icon: "password" },
  ]);

  const handleBackClick = () => {
    setSelectedElement(null);
    onBackClick();
  };

  let formInput = [
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: selectedElement?.name || "",
      label: "Name",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Place Holder",
      name: "placeHolder",
      validation: "",
      default: selectedElement?.placeHolder || "",
      label: "Place Holder",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Label",
      name: "label",
      validation: "",
      default: selectedElement?.label || "",
      label: "Label",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Order Id",
      name: "orderId",
      validation: "",
      default: selectedElement?.orderId || "",
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
      default: selectedElement?.default || "",
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
      default: selectedElement?.required || null,
      label: "Required",
      required: true,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Add",
      name: "add",
      validation: "",
      default: selectedElement?.add || null,
      label: "Add",
      required: true,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Update",
      name: "update",
      validation: "",
      default: selectedElement?.update || null,
      label: "Update",
      required: true,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Filter",
      name: "filter",
      validation: "",
      default: selectedElement?.filter || null,
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
      default: selectedElement?.conditionEnabled || "false",
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
      default: selectedElement?.conditionWhenField || "",
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
      default: selectedElement?.conditionCheckMatch || "",
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
      default: selectedElement?.conditionIfMatch || "",
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

  if (selectedElement?.type === "select" || selectedElement?.type === "multiSelect") {
    // Define the additional form inputs
    const additionalInputs = [
      {
        type: "select",
        placeholder: "Api Type",
        name: "apiType",
        showItem: "",
        validation: "",
        default: selectedElement?.apiType || "",
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
        default: selectedElement?.selectApi || "",
        label: "Select Api",
        required: true,
        add: true,
      },
    ];

    // Splice the additional form inputs into the fourth position
    formInput.splice(4, 0, ...additionalInputs);
  } else if (selectedElement?.type === "email") {
    const additionalInputs = [
      {
        type: "text",
        placeholder: "Validation",
        name: "validation",
        validation: "",
        default: selectedElement?.validation || "",
        label: "Validation",
        required: true,
        add: true,
      },
    ];
    formInput.splice(4, 0, ...additionalInputs);
  } else if (
    selectedElement?.type !== "select" &&
    selectedElement?.type !== "multiSelect" &&
    selectedElement?.type !== "image" &&
    selectedElement?.type !== "date" &&
    selectedElement?.type !== "datetime" &&
    selectedElement?.type !== "checkbox"
  ) {
    const additionalInputs = [
      {
        type: "text",
        placeholder: "Minimum Letters",
        name: "minimum",
        validation: "",
        default: selectedElement?.minimum || "",
        label: "Minimum Letters",
        required: false,
        add: true,
      },
      {
        type: "text",
        placeholder: "Maximum Letters",
        name: "maximum",
        validation: "",
        default: selectedElement?.maximum || "",
        label: "Maximum Letters",
        required: false,
        add: true,
      },
    ];
    formInput.splice(4, 0, ...additionalInputs);
  }

  const isCreatingHandler = (value, callback) => {};
  const submitChange = async (post) => {
    if (selectedElement?.type) {
      putData(
        {
          type: selectedElement?.type,
          ticket,
          EventOrTicket: "Ticket",
          // filter: true,
          view: true,
          tag: true,
          id: selectedElement?._id,
          ...post,
        },
        "ticket-form-data"
      ).then((response) => {
        if (response.data.success === true) {
          setMessage({
            type: 1,
            content: `${selectedElement?.type} Updated Successfully`,
            okay: "Okay",
          });
          handleBackClick();
          onRefreshLandingChange(true);
          setReload((prevReload) => !prevReload);
        }
      });
    }
  };

  useEffect(() => {
    getData({ ticket }, "ticket-form-data").then((response) => {
      const landingPageConfigData = response?.data?.response;
      const promises = landingPageConfigData.map((item) => {
        return getData({ key: item.type }, "page-section").then((pagesectionResponse) => {
          item.icon = pagesectionResponse.data.response[0];
          return item;
        });
      });
      // Wait for all promises to resolve and update the elements state
      Promise.all(promises).then((updatedElements) => {
        setElements(updatedElements);
      });
      //------------------------------------------------------------------------------------------
      // code for sorting the items based on sequence field

      //     // Wait for all promises to resolve
      // Promise.all(promises).then((updatedElements) => {
      //   // Sort updatedElements based on the sequence field
      //   updatedElements.sort((a, b) => a.sequence - b.sequence);

      //   // Update the elements state
      //   setElements(updatedElements);
      // });
      //------------------------------------------------------------------------------------------
    });
  }, [ticket, refresh, reload]);

  const handleElementEdit = (element) => {
    setSelectedElement(element);
    onElementClick(element);
  };

  const handleElementDelete = (element) => {
    setMessage({
      type: 2,
      content: "Are You Sure You Want To Delete?",
      proceed: "Yes",
      okay: "No",
      onProceed: async () => {
        try {
          deleteData({ id: element?._id }, "ticket-form-data").then((response) => {
            if (response.status === 200) {
              setMessage({
                type: 1,
                content: `${element?.name} Deleted Successfully`,
                okay: "Okay",
              });
              onRefreshLandingChange(true);
              setReload((prevReload) => !prevReload);
            }
          });
          return false;
        } catch (error) {}
      },
    });
  };

  const handleElementUp = (element) => {
    const index = elements.findIndex((el) => el._id === element._id);
    if (index > 0) {
      const updatedElements = [...elements];
      // Swap the orderId with the previous element
      const temp = updatedElements[index - 1].orderId;
      const temp2 = updatedElements[index].orderId;
      updatedElements[index - 1].orderId = updatedElements[index].orderId;
      updatedElements[index].orderId = temp;
      setElements(updatedElements);
      if (updatedElements[index]?.type) {
        putData(
          {
            type: updatedElements[index]?.type,
            ticket,
            EventOrTicket: "Ticket",
            // filter: true,
            view: true,
            tag: true,
            id: updatedElements[index]?._id,
            orderId: temp,
          },
          "ticket-form-data"
        ).then((response) => {
          if (response.data.success === true) {
            setMessage({
              type: 1,
              content: `${updatedElements[index]?.type} swaped Successfully`,
              okay: "Okay",
            });
          }
        });
      }
      if (updatedElements[index - 1]?.type) {
        putData(
          {
            type: updatedElements[index - 1]?.type,
            ticket,
            EventOrTicket: "Ticket",
            // filter: true,
            view: true,
            tag: true,
            id: updatedElements[index - 1]?._id,
            orderId: temp2,
          },
          "ticket-form-data"
        ).then((response) => {
          if (response.data.success === true) {
          }
        });
      }
      handleBackClick();
      onRefreshLandingChange(true);
      setReload((prevReload) => !prevReload);
    }
  };

  const handleElementDown = (element) => {
    const index = elements.findIndex((el) => el._id === element._id);
    if (index < elements.length - 1) {
      const updatedElements = [...elements];
      // Swap the orderId with the next element
      const temp = updatedElements[index + 1].orderId;
      const temp2 = updatedElements[index].orderId;
      updatedElements[index + 1].orderId = updatedElements[index].orderId;
      updatedElements[index].orderId = temp;

      // Update the state
      setElements(updatedElements);
      if (updatedElements[index]?.type) {
        putData(
          {
            type: updatedElements[index]?.type,
            ticket,
            EventOrTicket: "Ticket",
            // filter: true,
            view: true,
            tag: true,
            id: updatedElements[index]?._id,
            orderId: temp,
          },
          "ticket-form-data"
        ).then((response) => {
          if (response.data.success === true) {
            setMessage({
              type: 1,
              content: `${updatedElements[index]?.type} swaped Successfully`,
              okay: "Okay",
            });
          }
        });
      }
      if (updatedElements[index + 1]?.type) {
        putData(
          {
            type: updatedElements[index + 1]?.type,
            ticket,
            EventOrTicket: "Ticket",
            // filter: true,
            view: true,
            tag: true,
            id: updatedElements[index + 1]?._id,
            orderId: temp2,
          },
          "ticket-form-data"
        ).then((response) => {
          if (response.data.success === true) {
          }
        });
      }
      handleBackClick();
      onRefreshLandingChange(true);
      setReload((prevReload) => !prevReload);
    }
  };

  return (
    <ElementContainer className="column">
      {!selectedElement ? (
        <ItemContainer>
          {elements
            .sort((a, b) => a.orderId - b.orderId)
            .map((element, index) => (
              <Element key={index}>
                <Item>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <GetIcon icon={(icons.find((icon) => icon.id === element.type) || {}).icon || "defaultIcon"} />
                    {element.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "12px",
                    }}
                  >
                    <Button onClick={() => handleElementUp(element)}>
                      <GetIcon icon={"up"} />
                    </Button>
                    <Button onClick={() => handleElementDown(element)}>
                      <GetIcon icon={"down"} />
                    </Button>
                    <Button onClick={() => handleElementEdit(element)}>
                      <GetIcon icon={"edit"} />
                    </Button>
                    <Button onClick={() => handleElementDelete(element)}>
                      <GetIcon icon={"delete"} />
                    </Button>
                  </div>
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
              button={"Update"}
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
export default Layout(ActiveElements);
