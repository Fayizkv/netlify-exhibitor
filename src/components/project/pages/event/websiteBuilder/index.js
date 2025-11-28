import React, { useState } from "react";
import styled from "styled-components";
import builder from "./images/builder.png"; // replace with the actual path
import icon from "./images/button-icon.png"; // replace with the actual path
import PopupView from "../../../../core/popupview";
import { useSelector } from "react-redux";
import WebsitePopup from "./websitePopup";

const BuilderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SmallHeading = styled.h1`
  position: absolute;
  top: 10px;
  left: 10px;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 19.36px;
  letter-spacing: -0.011em;
  text-align: left;
  margin: 0;
`;

const CenterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px; /* Add gap to control spacing between elements */
  margin-top: 40px;
`;

const BuilderImage = styled.img`
  max-width: 40%;
  height: auto;
  margin: 0; /* Remove extra margin */
`;

const LargeHeading = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin: 2px 0; /* Reduce margin */
`;

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

const BuildButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #20232d;
  color: #cdd0d5;
  font-size: 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  margin-top: 5px;

  img {
    width: 16px;
    height: 16px;
  }

  svg {
    font-size: 16px;
  }
`;
const WebsiteBuilder = (props) => {
  // const [isBuildClicked, setIsBuildClicked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const themeColors = useSelector((state) => state.themeColors);

  const handleBuildClick = () => {
    // setIsBuildClicked(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <BuilderContainer>
      <SmallHeading>AI website builder</SmallHeading>
      <CenterContent>
        <BuilderImage src={builder} alt="Website Builder" />
        <LargeHeading>AI Website Builder</LargeHeading>
        <Description>Create your website in 1 minute with AI</Description>
        <BuildButton onClick={handleBuildClick}>
          <img src={icon} alt="Icon" />
          Build Your Website
        </BuildButton>
      </CenterContent>
      {isModalOpen && (
        <PopupView
          customClass={"full-page"}
          popupData={<WebsitePopup {...props} />}
          themeColors={themeColors}
          closeModal={closeModal}
          itemTitle={{
            name: "title",
            type: "text",
            collection: "",
          }}
          openData={{ data: { _id: "", title: props?.openData?.data?.title } }}
        ></PopupView>
      )}
    </BuilderContainer>
  );
};

export default WebsiteBuilder;
