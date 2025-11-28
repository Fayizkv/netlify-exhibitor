import React, { useEffect, useState } from "react";
import Layout from "../../../../../core/layout";
import styled from "styled-components";
import { deleteData, getData } from "../../../../../../backend/api";
import { ElementContainer } from "../../../../../core/elements";
// import AutoForm from "../../../../../core/autoform/AutoForm";
import draggable from "../../../../../../images/public/draggable.png";
import vector from "../../../../../../images/public/Vector.png";
import threeDot from "../../../../../../images/public/more-2-line.png";

const ItemContainer = styled.div`
  padding: 10px 30px 10px 5px;
  margin: 0px 0;
  display: flex;
  /* flex-wrap: wrap; */
  flex-direction: column;
  align-items: center;
  // justify-content: space-between;
  gap: 10px;
  overflow-y: auto; /* Enable vertical scrolling */
  height: 100%;
`;

const Element = styled.div`
  position: relative;
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

const Item = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: space-between;
  gap: 10px;
  background-color: none;
  font-size: 16px;
`;

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

// const Button = styled.div`
//   margin: 0;
//   padding: 0;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   background-color: transparent;
//   border: none;
// `;
const IconImage = styled.img`
  width: 20px;
  height: 20px;
  &.vector {
    width: 12px;
    height: 12px;
  }
`;

// Styles for the popup
const PopupMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0px;
  width: 120px;
  background-color: white;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e4e9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  text-align: left;
  z-index: 1000;
  font-size: 13px;
`;

const floatingAnimation = `
  @keyframes float {
    0% {
      transform: translateX(0px);
    }
    50% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0px);
    }
  }
`;

const PopupItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &.delete {
    color: red;
  }

  &:hover {
    background-color: #e2e4e9;
    /* Apply the floating effect on hover */
    animation: float 1s ease-in-out infinite;
  }

  /* Adding the keyframe animation to make it float */
  ${floatingAnimation}
`;

const BlackButton = styled.button`
  background-color: black;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 10px;
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: #333;
  }
`;

const ActiveList = ({ onBackClick, event, setMessage, onRefreshIframeChange, refresh, onElementClick, onAddSection }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState([]);
  // const [selectedTheme, setSelectedTheme] = useState(null);
  const [reload, setReload] = useState(false);
  // const [pageSections, setPageSections] = useState([]);
  const [showPopup, setShowPopup] = useState(null);

  // useEffect(() => {
  //   if (showPopup) {
  //     document.addEventListener("click", handleOutsideClick);
  //   } else {
  //     document.removeEventListener("click", handleOutsideClick);
  //   }

  //   // Cleanup event listener on unmount or when showPopup changes
  //   return () => {
  //     document.removeEventListener("click", handleOutsideClick);
  //   };
  // }, [showPopup]);

  useEffect(() => {
    getData({ event }, "landing-page-config").then((response) => {
      const landingPageConfigData = response?.data?.response;
      const promises = landingPageConfigData?.map((item) => {
        return getData({ key: item?.type }, "page-section").then((pagesectionResponse) => {
          item.icon = pagesectionResponse?.data?.response[0];
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
      // setPageSections(response?.data?.response);
    });
  }, [selectedElement]);
  const handleButtonClick = () => {
    // Pass true to the parent component to trigger the section list rendering
    onAddSection();
  };

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
          deleteData({ id: element?._id }, "landing-page-config").then((response) => {
            if (response.status === 200) {
              setMessage({
                type: 1,
                content: `${element?.title} Deleted Successfully`,
                okay: "Okay",
              });
              // onRefreshIframeChange(true);
              setReload((prevReload) => !prevReload);
            }
          });
          return false;
        } catch (error) {}
      },
    });
  };

  // const handleElementUp = async (element) => {
  //   const index = elements.findIndex((el) => el._id === element._id);
  //   if (index > 0) {
  //     const updatedElements = [...elements];
  //     // Swap the orderId with the previous element
  //     const temp = updatedElements[index - 1].sequence;
  //     const temp2 = updatedElements[index].sequence;
  //     updatedElements[index - 1].sequence = temp2;
  //     updatedElements[index].sequence = temp;
  //     setElements(updatedElements);
  //     if (updatedElements[index]?.type) {
  //       putData(
  //         {
  //           id: updatedElements[index]._id,
  //           sequence: temp,
  //           type: updatedElements[index].type,
  //           theme: updatedElements[index].theme,
  //           event: updatedElements[index].event,
  //           title: updatedElements[index].title,
  //           description: updatedElements[index].description,
  //           menuTitle: updatedElements[index].menuTitle,
  //           deskTopScrolling: updatedElements[index].deskTopScrolling,
  //           mobileScrolling: updatedElements[index].mobileScrolling,
  //           numberOfItemToShow: updatedElements[index].numberOfItemToShow,
  //           showInMenu: updatedElements[index].showInMenu,
  //           status: updatedElements[index].status,
  //         },
  //         "landingPageConfig"
  //       );
  //     }
  //     if (updatedElements[index - 1]) {
  //       putData(
  //         {
  //           id: updatedElements[index - 1]._id,
  //           sequence: temp2,
  //           type: updatedElements[index - 1].type,
  //           theme: updatedElements[index - 1].theme,
  //           event: updatedElements[index - 1].event,
  //           title: updatedElements[index - 1].title,
  //           description: updatedElements[index - 1].description,
  //           menuTitle: updatedElements[index - 1].menuTitle,
  //           deskTopScrolling: updatedElements[index - 1].deskTopScrolling,
  //           mobileScrolling: updatedElements[index - 1].mobileScrolling,
  //           numberOfItemToShow: updatedElements[index - 1].numberOfItemToShow,
  //           showInMenu: updatedElements[index - 1].showInMenu,
  //           status: updatedElements[index - 1].status,
  //         },
  //         "landingPageConfig"
  //       );
  //     }
  //     setMessage({
  //       type: 1,
  //       content: `${updatedElements[index].type} swapped Successfully`,
  //       okay: "Okay",
  //     });
  //     onRefreshIframeChange(true);
  //     setReload((prevReload) => !prevReload);
  //   }
  // };

  // const handleElementDown = async (element) => {
  //   const index = elements.findIndex((el) => el._id === element._id);
  //   if (index < elements.length - 1) {
  //     const updatedElements = [...elements];
  //     // Swap the orderId with the next element
  //     const temp = updatedElements[index + 1].sequence;
  //     const temp2 = updatedElements[index].sequence;
  //     updatedElements[index + 1].sequence = temp2;
  //     updatedElements[index].sequence = temp;
  //     setElements(updatedElements);

  //     if (updatedElements[index]?.type) {
  //       putData(
  //         {
  //           id: updatedElements[index]._id,
  //           sequence: temp,
  //           type: updatedElements[index].type,
  //           theme: updatedElements[index].theme,
  //           event: updatedElements[index].event,
  //           title: updatedElements[index].title,
  //           description: updatedElements[index].description,
  //           menuTitle: updatedElements[index].menuTitle,
  //           deskTopScrolling: updatedElements[index].deskTopScrolling,
  //           mobileScrolling: updatedElements[index].mobileScrolling,
  //           numberOfItemToShow: updatedElements[index].numberOfItemToShow,
  //           showInMenu: updatedElements[index].showInMenu,
  //           status: updatedElements[index].status,
  //         },
  //         "landingPageConfig"
  //       );
  //     }
  //     if (updatedElements[index + 1]) {
  //       putData(
  //         {
  //           id: updatedElements[index + 1]._id,
  //           sequence: temp2,
  //           type: updatedElements[index + 1].type,
  //           theme: updatedElements[index + 1].theme,
  //           event: updatedElements[index + 1].event,
  //           title: updatedElements[index + 1].title,
  //           description: updatedElements[index + 1].description,
  //           menuTitle: updatedElements[index + 1].menuTitle,
  //           deskTopScrolling: updatedElements[index + 1].deskTopScrolling,
  //           mobileScrolling: updatedElements[index + 1].mobileScrolling,
  //           numberOfItemToShow: updatedElements[index + 1].numberOfItemToShow,
  //           showInMenu: updatedElements[index + 1].showInMenu,
  //           status: updatedElements[index + 1].status,
  //         },
  //         "landingPageConfig"
  //       );
  //     }
  //     setMessage({
  //       type: 1,
  //       content: `${updatedElements[index].type} swapped Successfully`,
  //       okay: "Okay",
  //     });

  //     onRefreshIframeChange(true);
  //     setReload((prevReload) => !prevReload);
  //   }
  // };

  // const handleBackClick = () => {
  //   setSelectedTheme(null);
  //   onBackClick();
  // };
  const handleThreeDotClick = (event, element) => {
    event.stopPropagation();
    setShowPopup(element);
  };

  // const handleOutsideClick = (event) => {
  //   if (
  //     showPopup &&
  //     !event.target.closest(".popup-trigger") &&
  //     !event.target.closest(".popup-menu")
  //   ) {
  //     setShowPopup(null);
  //   }
  // };

  return (
    <ElementContainer className="column" style={{ height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <BlackButton onClick={handleButtonClick}>+ Add Section</BlackButton>
      </div>
      <ItemContainer>
        {elements &&
          elements
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
                    <IconImage src={draggable} />
                    {element.type}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "12px",
                    }}
                  >
                    <IconImage src={vector} className="vector" onClick={() => handleElementEdit(element)} />
                    <IconImage src={threeDot} onClick={(event) => handleThreeDotClick(event, element)} />
                  </div>
                  {showPopup === element && (
                    <PopupMenu>
                      <PopupItem>Show/Hide</PopupItem>
                      <PopupItem>Duplicate</PopupItem>
                      <PopupItem className="delete" onClick={() => handleElementDelete(element)}>
                        Delete
                      </PopupItem>
                    </PopupMenu>
                  )}
                </Item>
              </Element>
            ))}
      </ItemContainer>
    </ElementContainer>
  );
};
export default Layout(ActiveList);
