import React, { useEffect, useState } from "react";
import Layout from "../../../../../core/layout";
import styled from "styled-components";
import { GetIcon } from "../../../../../../icons";
import { deleteData, getData, putData } from "../../../../../../backend/api";
import { ElementContainer } from "../../../../../core/elements";
import AutoForm from "../../../../../core/autoform/AutoForm";

const ItemContainer = styled.div`
  padding: 10px 30px 10px 5px;
  margin: 0px 0;
  display: flex;
  /* flex-wrap: wrap; */
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

const ActiveElements = ({ onElementClick, onBackClick, event, setMessage, onRefreshIframeChange, refresh }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [reload, setReload] = useState(false);
  const [pageSections, setPageSections] = useState([]);
  const [selectedPageSection, setSelectedPageSection] = useState(null);

  useEffect(() => {
    if (selectedElement) {
      const matchingSection = pageSections?.find((section) => section?.key === selectedElement?.type);
      const pageSectionId = matchingSection?._id;
      setSelectedPageSection(pageSectionId);
    }
  }, [selectedElement, pageSections]);

  const socialmediaInput = [
    {
      type: "text",
      placeholder: "Facebook",
      name: "facebook",
      validation: "",
      default: "",
      label: "Facebook",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Instagram",
      name: "insta",
      validation: "",
      default: "",
      label: "Instagram",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "X Social",
      name: "xSocial",
      validation: "",
      default: "",
      label: "X Social",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Linkedin",
      name: "linkedin",
      validation: "",
      default: "",
      label: "Linkedin",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Youtube",
      name: "youtube",
      validation: "",
      default: "",
      label: "Youtube",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Whatsapp",
      name: "whatsapp",
      validation: "",
      default: "",
      label: "Whatsapp",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Sharechat",
      name: "sharechat",
      validation: "",
      default: "",
      label: "Sharechat",
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Thread",
      name: "threads",
      validation: "",
      default: "",
      label: "Thread",
      required: true,
      add: true,
    },
  ];

  const formInput = [
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: selectedElement?.title || "",
      label: "Title",
      required: true,
      add: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: selectedElement?.description || "",
      label: "Title",
      required: false,
      add: true,
    },
    {
      type: "text",
      placeholder: "Menu Title",
      name: "menuTitle",
      validation: "",
      default: selectedElement?.menuTitle || "",
      label: "Title",
      required: true,
      add: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "image",
      validation: "",
      default: selectedElement?.image || "false",
      tag: true,
      label: "Image",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Sequence",
      name: "sequence",
      validation: "",
      default: selectedElement?.sequence || "",
      label: "Sequence",
      required: true,
      add: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "section-theme/particularSelect",
      params: [{ name: "pageSection", value: selectedPageSection }],
      placeholder: "Theme",
      name: "theme",
      validation: "",
      showItem: "",
      default: selectedElement?.theme || "",
      tag: false,
      label: "Theme",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "select",
      placeholder: "Desktop Scrolling",
      name: "deskTopScrolling",
      collection: "",
      showItem: "",
      validation: "",
      default: selectedElement?.deskTopScrolling || "",
      tag: true,
      label: "Desktop Scrolling",
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Horizontal,Vertical",
    },
    {
      type: "select",
      placeholder: "Mobile Scrolling",
      name: "mobileScrolling",
      collection: "",
      showItem: "",
      validation: "",
      default: selectedElement?.mobileScrolling || "",
      tag: true,
      label: "Mobile Scrolling",
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Horizontal,Vertical",
    },
    {
      type: "text",
      placeholder: "Items to Show",
      name: "numberOfItemToShow",
      validation: "",
      default: selectedElement?.numberOfItemToShow || "",
      label: "Items to Show",
      required: false,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Show in menu",
      name: "showInMenu",
      validation: "",
      default: selectedElement?.showInMenu || null,
      tag: false,
      label: "Show in menu",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Status",
      name: "status",
      validation: "",
      default: selectedElement?.status || null,
      tag: false,
      label: "Status",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ];

  const countdownInput = [
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: selectedElement?.title || "",
      label: "Title",
      required: true,
      add: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: selectedElement?.description || "",
      label: "Title",
      required: false,
      add: true,
    },
    {
      type: "date",
      placeholder: "Date",
      name: "date",
      validation: "",
      default: selectedElement?.date || "",
      label: "Target date",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Menu Title",
      name: "menuTitle",
      validation: "",
      default: selectedElement?.menuTitle || "",
      label: "Title",
      required: true,
      add: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "image",
      validation: "",
      default: selectedElement?.image || "false",
      tag: true,
      label: "Image",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Sequence",
      name: "sequence",
      validation: "",
      default: selectedElement?.sequence || "",
      label: "Sequence",
      required: true,
      add: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "section-theme/particularSelect",
      params: [{ name: "pageSection", value: selectedPageSection }],
      placeholder: "Theme",
      name: "theme",
      validation: "",
      showItem: "",
      default: selectedElement?.theme,
      tag: false,
      label: "Theme",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "select",
      placeholder: "Desktop Scrolling",
      name: "deskTopScrolling",
      collection: "",
      showItem: "",
      validation: "",
      default: selectedElement?.deskTopScrolling || "",
      tag: true,
      label: "Desktop Scrolling",
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Horizontal,Vertical",
    },
    {
      type: "select",
      placeholder: "Mobile Scrolling",
      name: "mobileScrolling",
      collection: "",
      showItem: "",
      validation: "",
      default: selectedElement?.mobileScrolling || "",
      tag: true,
      label: "Mobile Scrolling",
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Horizontal,Vertical",
    },
    {
      type: "text",
      placeholder: "Items to Show",
      name: "numberOfItemToShow",
      validation: "",
      default: selectedElement?.numberOfItemToShow || "",
      label: "Items to Show",
      required: false,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Show in menu",
      name: "showInMenu",
      validation: "",
      default: selectedElement?.showInMenu || null,
      tag: false,
      label: "Show in menu",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Status",
      name: "status",
      validation: "",
      default: selectedElement?.status || null,
      tag: false,
      label: "Status",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ];

  const isCreatingHandler = (value, callback) => {};
  const submitChange = async (post) => {
    if (selectedElement?.title === "Social Media") {
      putData(
        {
          id: event,
          ...post,
        },
        "event"
      ).then((response) => {
        if (response.data.success === true) {
          setMessage({
            type: 1,
            content: "Social Media Updated Successfully",
            okay: "Okay",
          });
          handleBackClick();
          onRefreshIframeChange(true);
          setReload((prevReload) => !prevReload);
        }
      });
    } else {
      const type = selectedElement?.type;
      const theme = selectedTheme?.value;
      const id = selectedElement?._id;
      const payload = { id, type, event, theme, ...post };
      putData(payload, "landingPageConfig").then((response) => {
        if (response.data.success === true) {
          setMessage({
            type: 1,
            content: `${selectedElement?.title} Updated Successfully`,
            okay: "Okay",
          });
          handleBackClick();
          onRefreshIframeChange(true);
          setReload((prevReload) => !prevReload);
        }
      });
    }
  };

  useEffect(() => {
    getData({ event }, "landingPageConfig").then((response) => {
      const landingPageConfigData = response?.data?.response;
      const promises = landingPageConfigData?.map((item) => {
        return getData({ key: item.type }, "page-section").then((pagesectionResponse) => {
          item.icon = pagesectionResponse.data.response[0];
          return item;
        });
      });
      if (promises) {
        // Wait for all promises to resolve and update the elements state
        Promise.all(promises).then((updatedElements) => {
          setElements(updatedElements);
        });
      }
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
  }, [event, reload, refresh]);

  useEffect(() => {
    getData({}, "page-section").then((response) => {
      setPageSections(response?.data?.response);
    });
  }, [selectedElement]);

  const handleElementEdit = (element) => {
    setSelectedElement(element);
    onElementClick(element);
    setSelectedTheme(element?.theme);
  };

  const handleElementDelete = (element) => {
    setMessage({
      type: 2,
      content: "Are You Sure You Want To Delete?",
      proceed: "Yes",
      okay: "No",
      onProceed: async () => {
        try {
          deleteData({ id: element?._id }, "landingPageConfig").then((response) => {
            if (response.status === 200) {
              setMessage({
                type: 1,
                content: `${element?.title} Deleted Successfully`,
                okay: "Okay",
              });
              onRefreshIframeChange(true);
              setReload((prevReload) => !prevReload);
            }
          });
          return false;
        } catch (error) {}
      },
    });
  };

  const handleElementUp = async (element) => {
    const index = elements.findIndex((el) => el._id === element._id);
    if (index > 0) {
      const updatedElements = [...elements];
      // Swap the orderId with the previous element
      const temp = updatedElements[index - 1].sequence;
      const temp2 = updatedElements[index].sequence;
      updatedElements[index - 1].sequence = temp2;
      updatedElements[index].sequence = temp;
      setElements(updatedElements);
      if (updatedElements[index]?.type) {
        putData(
          {
            id: updatedElements[index]._id,
            sequence: temp,
            type: updatedElements[index].type,
            theme: updatedElements[index].theme,
            event: updatedElements[index].event,
            title: updatedElements[index].title,
            description: updatedElements[index].description,
            menuTitle: updatedElements[index].menuTitle,
            deskTopScrolling: updatedElements[index].deskTopScrolling,
            mobileScrolling: updatedElements[index].mobileScrolling,
            numberOfItemToShow: updatedElements[index].numberOfItemToShow,
            showInMenu: updatedElements[index].showInMenu,
            status: updatedElements[index].status,
          },
          "landingPageConfig"
        );
      }
      if (updatedElements[index - 1]) {
        putData(
          {
            id: updatedElements[index - 1]._id,
            sequence: temp2,
            type: updatedElements[index - 1].type,
            theme: updatedElements[index - 1].theme,
            event: updatedElements[index - 1].event,
            title: updatedElements[index - 1].title,
            description: updatedElements[index - 1].description,
            menuTitle: updatedElements[index - 1].menuTitle,
            deskTopScrolling: updatedElements[index - 1].deskTopScrolling,
            mobileScrolling: updatedElements[index - 1].mobileScrolling,
            numberOfItemToShow: updatedElements[index - 1].numberOfItemToShow,
            showInMenu: updatedElements[index - 1].showInMenu,
            status: updatedElements[index - 1].status,
          },
          "landingPageConfig"
        );
      }
      setMessage({
        type: 1,
        content: `${updatedElements[index].type} swapped Successfully`,
        okay: "Okay",
      });
      onRefreshIframeChange(true);
      setReload((prevReload) => !prevReload);
    }
  };

  const handleElementDown = async (element) => {
    const index = elements.findIndex((el) => el._id === element._id);
    if (index < elements.length - 1) {
      const updatedElements = [...elements];
      // Swap the orderId with the next element
      const temp = updatedElements[index + 1].sequence;
      const temp2 = updatedElements[index].sequence;
      updatedElements[index + 1].sequence = temp2;
      updatedElements[index].sequence = temp;
      setElements(updatedElements);

      if (updatedElements[index]?.type) {
        putData(
          {
            id: updatedElements[index]._id,
            sequence: temp,
            type: updatedElements[index].type,
            theme: updatedElements[index].theme,
            event: updatedElements[index].event,
            title: updatedElements[index].title,
            description: updatedElements[index].description,
            menuTitle: updatedElements[index].menuTitle,
            deskTopScrolling: updatedElements[index].deskTopScrolling,
            mobileScrolling: updatedElements[index].mobileScrolling,
            numberOfItemToShow: updatedElements[index].numberOfItemToShow,
            showInMenu: updatedElements[index].showInMenu,
            status: updatedElements[index].status,
          },
          "landingPageConfig"
        );
      }
      if (updatedElements[index + 1]) {
        putData(
          {
            id: updatedElements[index + 1]._id,
            sequence: temp2,
            type: updatedElements[index + 1].type,
            theme: updatedElements[index + 1].theme,
            event: updatedElements[index + 1].event,
            title: updatedElements[index + 1].title,
            description: updatedElements[index + 1].description,
            menuTitle: updatedElements[index + 1].menuTitle,
            deskTopScrolling: updatedElements[index + 1].deskTopScrolling,
            mobileScrolling: updatedElements[index + 1].mobileScrolling,
            numberOfItemToShow: updatedElements[index + 1].numberOfItemToShow,
            showInMenu: updatedElements[index + 1].showInMenu,
            status: updatedElements[index + 1].status,
          },
          "landingPageConfig"
        );
      }
      setMessage({
        type: 1,
        content: `${updatedElements[index].type} swapped Successfully`,
        okay: "Okay",
      });

      onRefreshIframeChange(true);
      setReload((prevReload) => !prevReload);
    }
  };

  const handleBackClick = () => {
    setSelectedElement(null);
    setSelectedTheme(null);
    onBackClick();
  };

  return (
    <ElementContainer className="column">
      {!selectedElement ? (
        <ItemContainer>
          {elements
            .sort((a, b) => a.sequence - b.sequence)
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
                    <GetIcon icon={element.icon?.icon} />
                    {element.title}
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
            {selectedElement.title}
          </ElementDetails>
          <Items>
            {selectedElement && selectedPageSection && (
              <AutoForm
                useCaptcha={false}
                key={"elements"}
                formType={"post"}
                header={"Yes"}
                description={""}
                customClass={"embed"}
                css="plain embed head-hide"
                formInput={selectedElement && (selectedElement.type === "Social Media" ? socialmediaInput : selectedElement.type === "countdown" ? countdownInput : formInput)}
                submitHandler={submitChange}
                button={"Update"}
                isOpenHandler={isCreatingHandler}
                isOpen={true}
                plainForm={true}
                formMode={"single"}
              ></AutoForm>
            )}
          </Items>
        </ElementContainer>
      )}
    </ElementContainer>
  );
};
export default Layout(ActiveElements);
