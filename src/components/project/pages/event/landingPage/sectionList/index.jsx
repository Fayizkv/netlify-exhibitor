import React, { useEffect, useState } from "react";
import Layout from "../../../../../core/layout";
import styled from "styled-components";
import { GetIcon } from "../../../../../../icons";
import { getData } from "../../../../../../backend/api";
import { ElementContainer } from "../../../../../core/elements";

const ItemContainer = styled.div`
  padding: 10px 30px 10px 5px;
  margin: 0px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2px;
  overflow-y: auto; /* Enable vertical scrolling */
`;

const Element = styled.div`
  margin: 0px;
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  cursor: pointer;
  padding: 0 20px;
  box-sizing: border-box;
  transition: background-color 0.3s ease;
  font-size: 14px;
  border-radius: 10px;

  &:hover {
    background-color: #e2e4e9;
  }
`;

const Arrow = styled.div`
  width: 20px;
  height: 20px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;

  &:hover {
    background-color: white; /* Keep the background of the arrow white on hover */
  }
`;

// const Item = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   text-align: center;
//   justify-content: center;
//   gap: 5px;
//   background-color: white;
//   font-size: 10px;
// `;

// const BackButton = styled.button`
//   background-color: transparent;
//   border: none;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
// `;

// const ElementDetails = styled.div`
//   display: flex;
//   align-items: center;
//   width: 100%;
//   gap: 20px;
//   font-weight: bold;
// `;

// const Items = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   width: 40%;
//   margin-bottom: 60px;
//   margin-top: 60px;
//   justify-content: center;
//   width: 100%;
//   margin: auto;
//   margin: 0;
//   padding: 0px 15px 0px 2px;
//   img {
//     max-width: 100%;
//   }
//   @media screen and (max-width: 1200px) and (min-width: 768px) {
//     max-width: 768px;
//   }
//   @media screen and (max-width: 768px) {
//     flex: 1 1 100%;
//     width: auto;
//     padding: 10px;
//     margin: 0px auto;
//   }
// `;

const SectionList = ({
  onElementClick,
  // onBackClick,
  // event,
  // setMessage,
  // onRefreshIframeChange,
  // onSubmitSuccess,
}) => {
  // const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState([]);
  // const [selectedTheme, setSelectedTheme] = useState(null);

  // const socialmediaInput = [
  //   {
  //     type: "text",
  //     placeholder: "Facebook",
  //     name: "facebook",
  //     validation: "",
  //     default: "",
  //     label: "Facebook",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Instagram",
  //     name: "insta",
  //     validation: "",
  //     default: "",
  //     label: "Instagram",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "X Social",
  //     name: "xSocial",
  //     validation: "",
  //     default: "",
  //     label: "X Social",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Linkedin",
  //     name: "linkedin",
  //     validation: "",
  //     default: "",
  //     label: "Linkedin",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Youtube",
  //     name: "youtube",
  //     validation: "",
  //     default: "",
  //     label: "Youtube",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Whatsapp",
  //     name: "whatsapp",
  //     validation: "",
  //     default: "",
  //     label: "Whatsapp",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Sharechat",
  //     name: "sharechat",
  //     validation: "",
  //     default: "",
  //     label: "Sharechat",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Thread",
  //     name: "threads",
  //     validation: "",
  //     default: "",
  //     label: "Thread",
  //     required: true,
  //     add: true,
  //   },
  // ];

  // const formInput = [
  //   {
  //     type: "text",
  //     placeholder: "Title",
  //     name: "title",
  //     validation: "",
  //     default: "",
  //     label: "Title",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "textarea",
  //     placeholder: "Description",
  //     name: "description",
  //     validation: "",
  //     default: "",
  //     label: "Title",
  //     required: false,
  //     add: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Menu Title",
  //     name: "menuTitle",
  //     validation: "",
  //     default: "",
  //     label: "Title",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "image",
  //     placeholder: "Image",
  //     name: "image",
  //     validation: "",
  //     default: "false",
  //     tag: true,
  //     label: "Image",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Sequence",
  //     name: "sequence",
  //     validation: "",
  //     default: "",
  //     label: "Sequence",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "select",
  //     apiType: "API",
  //     selectApi: "section-theme/particularSelect",
  //     params: [{ name: "pageSection", value: selectedElement?._id }],
  //     placeholder: "Theme",
  //     name: "theme",
  //     validation: "",
  //     showItem: "title",
  //     default: "",
  //     tag: false,
  //     label: "Theme",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //     filter: true,
  //   },
  //   {
  //     type: "select",
  //     placeholder: "Desktop Scrolling",
  //     name: "deskTopScrolling",
  //     collection: "",
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: true,
  //     label: "Desktop Scrolling",
  //     required: false,
  //     view: true,
  //     filter: false,
  //     add: true,
  //     update: true,
  //     apiType: "CSV",
  //     selectApi: "Horizontal,Vertical",
  //   },
  //   {
  //     type: "select",
  //     placeholder: "Mobile Scrolling",
  //     name: "mobileScrolling",
  //     collection: "",
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: true,
  //     label: "Mobile Scrolling",
  //     required: false,
  //     view: true,
  //     filter: false,
  //     add: true,
  //     update: true,
  //     apiType: "CSV",
  //     selectApi: "Horizontal,Vertical",
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Items to Show",
  //     name: "numberOfItemToShow",
  //     validation: "",
  //     default: "",
  //     label: "Items to Show",
  //     required: false,
  //     add: true,
  //   },
  //   {
  //     type: "checkbox",
  //     placeholder: "Show in menu",
  //     name: "showInMenu",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Show in menu",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   {
  //     type: "checkbox",
  //     placeholder: "Status",
  //     name: "status",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Status",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  // ];

  // const countdownInput = [
  //   {
  //     type: "text",
  //     placeholder: "Title",
  //     name: "title",
  //     validation: "",
  //     default: "",
  //     label: "Title",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "textarea",
  //     placeholder: "Description",
  //     name: "description",
  //     validation: "",
  //     default: "",
  //     label: "Title",
  //     required: false,
  //     add: true,
  //   },
  //   {
  //     type: "date",
  //     placeholder: "Date",
  //     name: "date",
  //     validation: "",
  //     default: "",
  //     label: "Target date",
  //     tag: true,
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Menu Title",
  //     name: "menuTitle",
  //     validation: "",
  //     default: "",
  //     label: "Title",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "image",
  //     placeholder: "Image",
  //     name: "image",
  //     validation: "",
  //     default: "false",
  //     tag: true,
  //     label: "Image",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Sequence",
  //     name: "sequence",
  //     validation: "",
  //     default: "",
  //     label: "Sequence",
  //     required: true,
  //     add: true,
  //   },
  //   {
  //     type: "select",
  //     apiType: "API",
  //     selectApi: "section-theme/particularSelect",
  //     params: [{ name: "pageSection", value: selectedElement?._id }],
  //     placeholder: "Theme",
  //     name: "theme",
  //     validation: "",
  //     showItem: "title",
  //     default: "",
  //     tag: false,
  //     label: "Theme",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //     filter: true,
  //   },
  //   {
  //     type: "select",
  //     placeholder: "Desktop Scrolling",
  //     name: "deskTopScrolling",
  //     collection: "",
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: true,
  //     label: "Desktop Scrolling",
  //     required: false,
  //     view: true,
  //     filter: false,
  //     add: true,
  //     update: true,
  //     apiType: "CSV",
  //     selectApi: "Horizontal,Vertical",
  //   },
  //   {
  //     type: "select",
  //     placeholder: "Mobile Scrolling",
  //     name: "mobileScrolling",
  //     collection: "",
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: true,
  //     label: "Mobile Scrolling",
  //     required: false,
  //     view: true,
  //     filter: false,
  //     add: true,
  //     update: true,
  //     apiType: "CSV",
  //     selectApi: "Horizontal,Vertical",
  //   },
  //   {
  //     type: "text",
  //     placeholder: "Items to Show",
  //     name: "numberOfItemToShow",
  //     validation: "",
  //     default: "",
  //     label: "Items to Show",
  //     required: false,
  //     add: true,
  //   },
  //   {
  //     type: "checkbox",
  //     placeholder: "Show in menu",
  //     name: "showInMenu",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Show in menu",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   {
  //     type: "checkbox",
  //     placeholder: "Status",
  //     name: "status",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Status",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  // ];

  // const isCreatingHandler = (value, callback) => {};
  // const submitChange = async (post) => {
  //   if (selectedElement?.title === "Social Media") {
  //     putData(
  //       {
  //         id: event,
  //         ...post,
  //       },
  //       "event"
  //     ).then((response) => {
  //       if (response.data.success === true) {
  //         onSubmitSuccess();
  //         setMessage({
  //           type: 1,
  //           content: "Social Media Updated Successfully",
  //           okay: "Okay",
  //         });
  //         handleBackClick();
  //         onRefreshIframeChange(true);
  //       }
  //     });
  //   } else {
  //     const type = selectedElement?.key;
  //     const theme = selectedTheme?.key;

  //     postData({ type, event, theme, ...post }, "landing-page-config").then(
  //       (response) => {
  //         if (response.data.success === true) {
  //           onSubmitSuccess();
  //           setMessage({
  //             type: 1,
  //             content: `${selectedElement?.title} Created Successfully`,
  //             okay: "Okay",
  //           });
  //           handleBackClick();
  //           onRefreshIframeChange(true);
  //         }
  //       }
  //     );
  //   }
  // };

  useEffect(() => {
    getData({}, "page-section").then((response) => {
      setElements(response?.data?.response);
    });
  }, []);

  const handleElementClick = (element) => {
    // setSelectedElement(element);
    onElementClick(element);
  };

  // const handleBackClick = () => {
  //   setSelectedElement(null);
  //   setSelectedTheme(null);
  //   onBackClick();
  // };

  const handleDragStart = (event, element) => {
    event.dataTransfer.setData("element", JSON.stringify(element));
  };

  return (
    <ElementContainer className="column">
      <ItemContainer>
        {elements &&
          elements.map((element, index) => (
            <Element key={index} draggable onClick={() => handleElementClick(element)} onDragStart={(event) => handleDragStart(event, element)}>
              {element.title}
              <Arrow>
                <GetIcon icon={"arrowRight"} />
              </Arrow>
            </Element>
          ))}
      </ItemContainer>
    </ElementContainer>
  );
};
export default Layout(SectionList);
