import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import video from "../images/video.png";
import sparkling from "../images/sparkling.png";
import share from "../images/share.png";
import { Navigation, Round } from "../../../landing/event/checkout/styles";
import { GetIcon } from "../../../../../../icons";
import { useDispatch, useSelector } from "react-redux";
import AutoForm from "../../../../../core/autoform/AutoForm";
import SectionList from "../../landingPage/sectionList";
import ActiveList from "../../landingPage/activeList";
import { getData, postData, putData } from "../../../../../../backend/api";
// import FormInput from "../../../../../core/input";
// import Search from "../../../../../core/search";
// import ListTable from "../../../../../core/list/list";
import PopupView from "../../../../../core/popupview";
import ContentDetails from "../contentDetails";

const Description = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.006em;
  text-align: center;
  margin: 2px 0; /* Reduce margin */
  color: #525866;
`;

const NewContentContainer = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
`;

const TitleH5 = styled.p`
  font-family: "Inter Display", sans-serif;
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  margin-bottom: 5px; /* Reduce the space below the heading */
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: flex-start; /* Align cards to the left */
  gap: 50px;
  margin: 20px 0;
`;

const Card = styled.div`
  width: 300px;
  height: 170px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: start;
  border-radius: 10px;
  border: 1px solid #e2e4e9;
  padding: 10px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const IconHead = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Subheading2XSmall = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 12px;
  letter-spacing: 0.02em;
  text-align: left;
  margin: 0;
`;

const CardButton = styled.button`
  background-color: #ffdac2;
  color: black;
  padding: 2px 8px;
  font-size: 9px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const CardMainContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%; /* Ensure the content takes the full width of the card */
  align-items: flex-start;
  margin: 15px 0;
`;

const H6Title = styled.p`
  font-family: "Inter Display", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 28px;
  margin: 1px 0;
`;

const XSmallParagraph = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: #525866;
  margin: 1px 0;
  display: flex;
  text-align: left;
`;

const ProceedButton = styled.button`
  padding: 8px 16px;
  font-size: 12px;
  border: none;
  border-radius: 5px;
  align-self: flex-end; /* Align the button to the rightmost end */
  margin-top: auto; /* Push the button to the bottom if necessary */
  background-color: ${(props) => (props.isSelected ? "#20232d" : "#f6f8fa")};
  color: ${(props) => (props.isSelected ? "#ffffff" : "#cdd0d5")};
  cursor: ${(props) => (props.isSelected ? "pointer" : "not-allowed")};
`;

const LabelSmall = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 16.94px;
  letter-spacing: -0.006em;
  color: #2f4ebd;
  cursor: pointer;
`;
const EventTypeContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ContentLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
  height: 100%;
  iframe {
    width: 90%;
    // bottom: 0;
    // top: 0;
    margin-right: 10px;
    height: 100vh;
    padding: 10px;
    position: absolute;
    border: 0;
  }
  &.fullscreen {
    position: fixed;
    inset: 0px;
    width: 100%;
    padding: 0px;
    background-color: white;
    overflow: auto;
  }
`;

const FirstRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 50%;
  padding: 30px;
`;

const SecondRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
`;

const CenterImage = styled.img`
  max-width: 100%;
  height: auto;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: auto; /* Push buttons to the bottom */
`;

const Button = styled.button`
  background-color: #20232d;
  color: #fff;
  padding: 10px 10px;
  font-size: 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: "Inter", sans-serif;

  &:first-of-type {
    background-color: #fff;
    color: #20232d;
  }
`;

const SideMenu = styled.div`
  display: flex;
  flex-direction: column; /* Arrange icons vertically */
  justify-content: flex-start;
  align-items: center;
  width: 95px; /* Width of the side menu */
  padding: 10px;
  position: relative;
`;

const SideMenuIcon = styled.div`
  margin-bottom: 20px; /* Space between icons */
  cursor: pointer;
  position: relative;
  border-radius: 5px;
  padding: 5px;

  &:hover .tooltip {
    visibility: visible; /* Show tooltip on hover */
    opacity: 1;
  }
  &:hover {
    background-color: #e2e4e9;
  }
`;

const Tooltip = styled.div`
  visibility: hidden; /* Initially hidden */
  opacity: 0;
  position: absolute;
  left: 110%; /* Move it to the right side of the icon */
  top: 50%;
  transform: translateY(-50%); /* Center it vertically */
  background-color: black;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  white-space: nowrap; /* Prevent line breaks in the tooltip */
  transition: opacity 0.3s ease; /* Smooth transition for visibility */
  font-size: 10px;
`;

const VerticalSeparator = styled.div`
  width: 1px;
  background-color: #e2e4e9; /* Light gray separator */
  height: 80vh; /* Full height of the container */
  margin-right: 20px; /* Space between separator and content */
`;

const HorizontalLine = styled.div`
  width: 100%;
  height: 1px; /* Adjust the thickness of the line */
  background-color: #e2e4e9; /* Customize the line color */
  border: none; /* Remove default border */
  margin: 0; /* Optional: Adjust margin */
  padding: 0; /* Optional: Adjust padding */
  margin-bottom: 3px;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export const Content = styled.div`
  width: 100%;
  // width: calc(100% - 300px);
  // border: 1px solid #E2E4E9;
  // max-height: calc(100vh - 0px);
  overflow: auto;
  position: relative;
  iframe {
    width: 100%;
    bottom: 0;
    top: 0;
    margin-right: 10px;
    height: 100%;
    padding: 10px;
    position: absolute;
    border: 0;
  }
  &.fullscreen {
    position: fixed;
    inset: 0px;
    width: 100%;
    padding: 0px;
    background-color: white;
    overflow: auto;
  }
`;

const SidebarModal = styled.div`
  position: fixed;
  top: 80px;
  left: 95px;
  width: 250px; /* Adjust this to the desired width */
  height: 100%;
  background-color: white;
  z-index: 1000;
  transition: transform 0.3s ease-in-out;
  transform: ${({ isOpen }) => (isOpen ? "translateX(0)" : "translateX(-250px)")}; /* Slide from the left */
  border-right: 1px solid #ccc;
  margin-top: 10px;
  padding-right: 5px;
  &.edit {
    border-right: none; /* Remove right border */
    border-left: 1px solid #ccc; /* Add left border */
    padding-left: 5px;
    left: auto; /* Reset left to auto */
    right: 0; /* Align the sidebar to the right end */
    transform: ${({ isOpen }) => (isOpen ? "translateX(0)" : "translateX(250px)")}; /* Slide from the right */
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: none;
  z-index: 999;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
`;
const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between; /* Space between title and close button */
  align-items: center; /* Center vertically */
  padding: 10px 15px; /* Padding for the header */
  border-bottom: 1px solid #e0e0e0; /* Optional: Add a bottom border */
`;

const SidebarTitle = styled.p`
  font-size: 14px; /* Adjust font size as needed */
  margin: 0; /* Remove default margin */
`;

const CloseButton = styled.div`
  display: flex; /* Center the close symbol */
  align-items: center;
  justify-content: center;
  background-color: white;
  cursor: pointer;
`;

const WebsitePopup = (props) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isProceedClicked, setIsProceedClicked] = useState(false); // New state for Proceed button
  // const [disableContinue, setDisableContinue] = useState(true);
  const [isTemplateChosen, setIsTemplateChosen] = useState(false);
  const themeColors = useSelector((state) => state.themeColors);
  const [showSections, setShowSections] = useState(false);
  const [data, setData] = useState(null);
  const [config, setConfig] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(null);
  const [refreshIframe] = useState(false);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [elements, setElements] = useState(false);
  const [activeElement, setActiveElement] = useState({});
  const [selectedElements, setSelectedElements] = useState({});
  const [selectedTheme] = useState(null);
  const [activeTab, setActiveTab] = useState("Insert");
  const { setMessage } = props;
  const [isEdit, setIsEdit] = useState(false);

  // const [form, setForm] = useState();
  const event = props?.openData?.data?._id;

  const dispatch = useDispatch();
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;

  const [stages] = useState([
    { id: 1, label: "Event Type" },
    { id: 2, label: "Info" },
    { id: 3, label: "Features" },
  ]);

  const [activeStages, setActiveStages] = useState(1);
  const [formData, setFormData] = useState([]);
  const [stageOne] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      placeholder: "Search for your event type",
      name: "eventCategory",
      showItem: "eventCategory",
      validation: "",
      default: "",
      tag: false,
      label: "Please select your event",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
      Search: true,
    },
  ]);

  const [stageTwo] = useState([
    {
      type: "text",
      placeholder: "Event Name",
      name: "eventName",
      showItem: "eventName",
      validation: "",
      default: "",
      tag: false,
      label: "Event Name",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
      Search: true,
    },
    {
      type: "textarea",
      placeholder: "Event description",
      name: "eventDescription",
      showItem: "eventDescription",
      validation: "",
      default: "",
      tag: false,
      label: "Describe your event",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: false,
      Search: true,
    },
  ]);

  useEffect(() => {
    if (activeStages === 1) {
      setFormData(stageOne);
    } else if (activeStages === 2) {
      setFormData(stageTwo);
    } else if (activeStages === 3) {
      setFormData(stageTwo);
    }
  }, [activeStages, stageOne, stageTwo]);

  const handlePhaseChange = () => {
    switch (activeStages) {
      case 1:
        setActiveStages(2);
        // setDisableContinue(true);
        break;
      case 2:
        setActiveStages(3);
        // setDisableContinue(true);
        break;
      case 3:
        // submitForm();
        setActiveStages(4);
        // setDisableContinue(true);
        setIsTemplateChosen(true);
        setShowSections(true);
        break;
      default:
        break;
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card); // Set the clicked card as selected
  };

  const handleProceedClick = () => {
    setIsProceedClicked(true);
  };

  const handleBackClick = () => {
    setActiveStages(1);
  };

  const SubmitEvent = () => {
    console.log("idd");
  };
  const closeRightSidebar = useCallback(() => {
    setIsRightMenuOpen(false);
    setActiveTab("");
  }, []);

  const openRightSidebar = (tab) => {
    setActiveTab(tab); // Set the active tab
    setIsRightMenuOpen(true); // Open sidebar
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setIsEdit(false);
  };

  const handleEditClick = (selectedElement) => {
    setIsEdit(true);
    setActiveElement(selectedElement);
  };

  useEffect(() => {
    const getCurrentDomain = async () => {
      if (isLoading || isWhitelisted !== null) {
        return;
      }
      setisLoading(true);
      try {
        const response = await getData({ event: props?.openData?.data?._id }, "whitelisted-domains/check-domain");
        setIsWhitelisted(response.data.isWhitelisted);
        if (response.data.response) {
          setData(response.data.response);
          setConfig(response.data.configs ?? []);
        }
      } catch (error) {
        setIsWhitelisted(null);
      }
    };
    if (isLoading || isWhitelisted !== null) {
      return;
    } else {
      getCurrentDomain();
    }
  }, [dispatch, isLoading, themeColors, isWhitelisted, props]);

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
      default: "",
      label: "Title",
      required: true,
      add: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "",
      label: "Description",
      required: false,
      add: true,
    },
    {
      type: "text",
      placeholder: "Menu Title",
      name: "menuTitle",
      validation: "",
      default: "",
      label: "Menu Title",
      required: true,
      add: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "image",
      validation: "",
      default: "false",
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
      default: "",
      label: "Sequence",
      required: true,
      add: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "section-theme/particularSelect",
      params: [{ name: "pageSection", value: selectedElements?._id }],
      placeholder: "Theme",
      name: "theme",
      validation: "",
      showItem: "title",
      default: "",
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
      default: "",
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
      default: "",
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
      default: "",
      label: "Items to Show",
      required: false,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Show in menu",
      name: "showInMenu",
      validation: "",
      default: "",
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
      default: "",
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
      default: "",
      label: "Title",
      required: true,
      add: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "",
      label: "Title",
      required: false,
      add: true,
    },
    {
      type: "date",
      placeholder: "Date",
      name: "date",
      validation: "",
      default: "",
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
      default: "",
      label: "Title",
      required: true,
      add: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "image",
      validation: "",
      default: "false",
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
      default: "",
      label: "Sequence",
      required: true,
      add: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "section-theme/particularSelect",
      params: [{ name: "pageSection", value: selectedElements?._id }],
      placeholder: "Theme",
      name: "theme",
      validation: "",
      showItem: "title",
      default: "",
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
      default: "",
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
      default: "",
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
      default: "",
      label: "Items to Show",
      required: false,
      add: true,
    },
    {
      type: "checkbox",
      placeholder: "Show in menu",
      name: "showInMenu",
      validation: "",
      default: "",
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
      default: "",
      tag: false,
      label: "Status",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ];

  const handleAddSection = () => {
    setActiveTab("Insert");
  };

  const submitChange = async (post) => {
    if (selectedElements?.title === "Social Media") {
      putData(
        {
          id: event,
          ...post,
        },
        "event"
      ).then((response) => {
        if (response.data.success === true) {
          // onSubmitSuccess();
          setMessage({
            type: 1,
            content: "Social Media Updated Successfully",
            okay: "Okay",
          });
          // handleBackClick();
          // onRefreshIframeChange(true);
          closeSidebar();
        }
      });
    } else {
      const type = selectedElements?.key;
      const theme = selectedTheme?.key;

      postData({ type, event, theme, ...post }, "landing-page-config").then((response) => {
        console.log("response", response);
        if (response?.data?.success === true) {
          // onSubmitSuccess();
          setMessage({
            type: 1,
            content: `${selectedElements?.title} Created Successfully`,
            okay: "Okay",
          });
          // handleBackClick();
          // onRefreshIframeChange(true);
          closeSidebar();
        }
      });
    }
  };

  useEffect(() => {
    getData({}, "page-section").then((response) => {
      // setElements(response?.data?.response);
    });
  }, []);

  const handleElementClick = useCallback((element) => {
    setIsSidebarOpen(true);
    setSelectedElements(element);
    // Set the form based on the clicked element
    // changeForm(element?.title);
  }, []);
  const closeModal = () => {
    setIsEdit(false);
  };

  return (
    <NewContentContainer>
      <HorizontalLine />
      <MainContent>
        <SideMenu>
          {(isTemplateChosen || showSections) && (
            <>
              <SideMenuIcon onClick={() => openRightSidebar("Insert")}>
                <GetIcon icon={"add"} />
                <Tooltip className="tooltip">Insert</Tooltip>
              </SideMenuIcon>
              <SideMenuIcon onClick={() => openRightSidebar("Sections")}>
                <GetIcon icon={"website"} />
                <Tooltip className="tooltip">Sections</Tooltip>
              </SideMenuIcon>
              <SideMenuIcon>
                <GetIcon icon={"image"} />
                <Tooltip className="tooltip">Assets</Tooltip>
              </SideMenuIcon>
            </>
          )}
        </SideMenu>

        <VerticalSeparator />
        {!isProceedClicked ? (
          <ContentArea>
            <TitleH5>What do you want to do?</TitleH5>
            <Description>Choose how you want to proceed, and we'll help you get started. Simply follow the steps below.</Description>
            <CardContainer>
              <Card onClick={() => handleCardClick("Generate")}>
                <CardHeader>
                  <IconHead>
                    <Subheading2XSmall>
                      Generate <img src={sparkling} width={15} height={15} alt="Generate Icon" />
                    </Subheading2XSmall>
                  </IconHead>
                </CardHeader>
                <CardMainContent>
                  <H6Title>Create a website with AI</H6Title>
                  <XSmallParagraph style={{ textAlign: "left" }}>Our AI tool will generate tailored content & images.</XSmallParagraph>
                </CardMainContent>
                <ProceedButton
                  isSelected={selectedCard === "Generate"}
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent the card's onClick from being triggered
                    if (selectedCard === "Generate") {
                      handleProceedClick();
                    }
                  }}
                >
                  Proceed
                </ProceedButton>
              </Card>

              <Card onClick={() => handleCardClick("Redirect")}>
                <CardHeader>
                  <IconHead>
                    <Subheading2XSmall>
                      Redirect <img src={share} width={15} height={15} alt="Redirect Icon" />
                    </Subheading2XSmall>
                    <CardButton>COMING SOON</CardButton>
                  </IconHead>
                </CardHeader>
                <CardMainContent>
                  <H6Title>Already have an event website?</H6Title>
                  <XSmallParagraph style={{ textAlign: "left" }}>Embed eventhex widgets to your website and other details.</XSmallParagraph>
                </CardMainContent>
                <ProceedButton
                  isSelected={selectedCard === "Redirect"}
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent the card's onClick from being triggered
                    if (selectedCard === "Redirect") {
                      handleProceedClick();
                    }
                  }}
                >
                  Proceed
                </ProceedButton>
              </Card>
            </CardContainer>
            <LabelSmall>Or create manually from templates &gt;</LabelSmall>
          </ContentArea>
        ) : null}
        <ContentLayout isRightMenuOpen={isRightMenuOpen}>
          {isProceedClicked && !showSections && selectedCard && (
            <>
              <FirstRow>
                <Navigation>
                  {stages.map((stage, index) => {
                    const isActive = activeStages === stage.id;
                    const isDone = activeStages > stage.id;
                    const statusClass = isActive ? "active" : isDone ? "done" : "upcoming";

                    return (
                      <React.Fragment key={stage.id}>
                        {index > 0 && <GetIcon icon={"arrowRight"} />}
                        <Round className={statusClass}>{isDone ? <GetIcon icon={"tick"} /> : stage.id}</Round>
                        <span className={statusClass}>{stage.label}</span>
                      </React.Fragment>
                    );
                  })}
                </Navigation>
                <EventTypeContent>
                  {formData && (
                    <AutoForm
                      autoUpdate={true}
                      useCaptcha={false}
                      key={formData}
                      formType={"post"}
                      description={""}
                      formInput={formData}
                      formValues={""}
                      submitHandler={SubmitEvent}
                      plainForm={true}
                      formMode={"single"}
                      customClass={""}
                      css="plain accordion head-hide"
                    />
                  )}
                </EventTypeContent>

                <ButtonsContainer>
                  <Button onClick={handleBackClick}>Back</Button>
                  <Button onClick={handlePhaseChange}>Next</Button>
                </ButtonsContainer>
              </FirstRow>
              <SecondRow>
                <CenterImage src={video} alt="Centered Image" />
              </SecondRow>
            </>
          )}
          {showSections && isTemplateChosen && data && config ? (
            <iframe
              referrerPolicy="no-referrer"
              sandbox="allow-same-origin allow-scripts allow-storage-access-by-user-activation"
              title="Demo Event"
              src={`${protocol}//${hostname}${port ? `:${port}` : ""}/landing-page/${props?.openData?.data?._id}`}
              key={refreshIframe ? "refreshed" : "not-refreshed"} // Add a unique key to trigger iframe refresh
            />
          ) : // <Event config={config} data={data} theme={selectedTheme?.key} desktopScrolling={desktopScrolling}></Event>
          null}

          {isRightMenuOpen && (
            <>
              <Overlay isOpen={isRightMenuOpen} onClick={closeSidebar} />
              <SidebarModal isOpen={isRightMenuOpen}>
                <SidebarHeader>
                  {activeTab === "Insert" && <SidebarTitle>Add Sections</SidebarTitle>}
                  {activeTab === "Sections" && <SidebarTitle>Sections & Pages</SidebarTitle>}
                  <CloseButton onClick={closeRightSidebar}>&times;</CloseButton>
                </SidebarHeader>

                {activeTab === "Insert" && <SectionList onElementClick={handleElementClick} />}
                {activeTab === "Sections" && <ActiveList event={event} {...props} onElementClick={handleEditClick} onAddSection={handleAddSection} />}
              </SidebarModal>
            </>
          )}

          {isSidebarOpen && !isEdit && (
            <AutoForm
              useCaptcha={false}
              key={"elements"}
              formType={"post"}
              header={"Add Sections"}
              description={""}
              // customClass={"embed"}
              // css="plain embed head-hide"
              formInput={selectedElements?.title === "Social Media" ? socialmediaInput : selectedElements?.title === "Countdown" ? countdownInput : formInput}
              submitHandler={submitChange}
              button={"Save"}
              isOpenHandler={closeSidebar}
              isOpen={true}
              plainForm={true}
              formMode={"single"}
            ></AutoForm>
          )}
          {isEdit && (
            <PopupView
              customClass={"side"}
              popupData={<ContentDetails activeElement={activeElement} />}
              themeColors={themeColors}
              closeModal={closeModal}
              itemTitle={{
                name: "title",
                type: "text",
                collection: "",
              }}
              openData={{ data: { _id: "", title: "Edit section" } }}
            ></PopupView>
          )}
        </ContentLayout>
      </MainContent>
    </NewContentContainer>
  );
};

export default WebsitePopup;
