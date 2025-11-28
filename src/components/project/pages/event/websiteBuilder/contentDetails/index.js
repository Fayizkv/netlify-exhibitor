import React, { useState } from "react";
import styled from "styled-components";
import { GetIcon } from "../../../../../../icons";
// import AutoForm from "../../../../../core/autoform/AutoForm";
import FormInput from "../../../../../core/input";
import video from "../images/video.png";
import draggable from "../../../../../../images/public/draggable.png";

const SidebarModal = styled.div`
  position: fixed;
  top: 80px;
  right: 0;
  width: 350px;
  height: 100%;
  background-color: white;
  z-index: 1000;
  padding: 5px;
  font-size: 12px;
  font-family: Inter;
`;

const TabHeader = styled.div`
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid #ccc;
`;

const Tab = styled.div`
  cursor: pointer;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  color: ${({ isActive }) => (isActive ? "#375DFB" : "#555")};
  border-bottom: ${({ isActive }) => (isActive ? "2px solid #375DFB" : "none")};

  svg {
    margin-right: 5px;
  }
`;

const Accordion = styled.div`
  border-bottom: 1px solid #ccc;
`;

const AccordionHeader = styled.div`
  padding: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  gap: 10px;
`;

const AccordionContent = styled.div`
  padding: 10px;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
`;

// const ArrowIcon = styled(FaChevronDown)`
//   margin-right: 10px;
//   transform: ${({ isOpen }) => (isOpen ? "rotate(180deg)" : "rotate(0)")};
//   transition: transform 0.3s ease;
// `;

const ContentWrapper = styled.div``;

const SpeakerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
`;

const SpeakerInfo = styled.div`
  display: flex;
  align-items: center;
`;

const SpeakerImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const SpeakerDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const SpeakerName = styled.span`
  font-weight: bold;
`;

const SpeakerDesignation = styled.span`
  color: #777;
  font-size: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;
const IconImage = styled.img`
  width: 20px;
  height: 20px;
`;
const FormRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const FormColumn = styled.div`
  flex: 1;
`;
const speakers = [
  {
    id: 1,
    name: "Javed Khan",
    designation: "CEO, YEJTT",
    imageUrl: video,
  },
  {
    id: 2,
    name: "Jane Smith",
    designation: "Marketing Manager",
    imageUrl: video,
  },
];

const ContentDetails = ({ activeElement }) => {
  const [activeTab, setActiveTab] = useState("content");
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [isSpeakersOpen, setIsSpeakersOpen] = useState(false);
  const [isHeadingOpen, setIsHeadingOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);

  return (
    <SidebarModal>
      <TabHeader>
        <Tab isActive={activeTab === "content"} onClick={() => setActiveTab("content")}>
          <GetIcon icon="edit" />
          Content
        </Tab>
        <Tab isActive={activeTab === "style"} onClick={() => setActiveTab("style")}>
          <GetIcon icon="image" />
          Style
        </Tab>
        <Tab isActive={activeTab === "advanced"} onClick={() => setActiveTab("advanced")}>
          <GetIcon icon="settings" />
          Advanced
        </Tab>
      </TabHeader>

      <ContentWrapper>
        {activeTab === "content" && (
          <>
            <Accordion>
              <AccordionHeader onClick={() => setIsTextOpen(!isTextOpen)}>
                <GetIcon icon="down-up" isOpen={isTextOpen} />
                Text
              </AccordionHeader>
              <AccordionContent isOpen={isTextOpen}>
                <FormInput type="text" label="Heading" value="heading" />
                <FormInput type="textarea" label="Description" value="description" />
              </AccordionContent>
            </Accordion>

            <Accordion>
              <AccordionHeader onClick={() => setIsSpeakersOpen(!isSpeakersOpen)}>
                <GetIcon icon="down-up" isOpen={isSpeakersOpen} />
                Speakers
              </AccordionHeader>
              <AccordionContent isOpen={isSpeakersOpen}>
                {speakers.map((speaker) => (
                  <SpeakerRow key={speaker.id}>
                    <SpeakerInfo>
                      <IconImage src={draggable} />
                      <SpeakerImage src={speaker.imageUrl} alt={speaker.name} />
                      <SpeakerDetails>
                        <SpeakerName>{speaker.name}</SpeakerName>
                        <SpeakerDesignation>{speaker.designation}</SpeakerDesignation>
                      </SpeakerDetails>
                    </SpeakerInfo>
                    <ActionButtons>
                      <GetIcon icon="edit" style={{ cursor: "pointer" }} />
                      <GetIcon icon="close" style={{ cursor: "pointer" }} />
                    </ActionButtons>
                  </SpeakerRow>
                ))}
              </AccordionContent>
            </Accordion>
          </>
        )}

        {activeTab === "style" && (
          <>
            <Accordion>
              <AccordionHeader onClick={() => setIsHeadingOpen(!isHeadingOpen)}>
                <GetIcon icon="down-up" isOpen={isHeadingOpen} />
                Heading
              </AccordionHeader>
              <AccordionContent isOpen={isHeadingOpen}>
                <FormInput type="text" label="Text Color" value="#4AB6FF" />
                <FormInput type="select" label="Typography" value="Inter" />
                <FormRow>
                  <FormColumn>
                    <FormInput type="select" label="" value="Medium" />
                  </FormColumn>
                  <FormColumn>
                    <FormInput type="number" label="" value="16" />
                  </FormColumn>
                </FormRow>
                <FormRow>
                  <FormColumn>
                    <FormInput type="number" label="" value="20" />
                  </FormColumn>
                  <FormColumn>
                    <FormInput type="number" label="" value="-0.6%" />
                  </FormColumn>
                </FormRow>
              </AccordionContent>
            </Accordion>

            <Accordion>
              <AccordionHeader onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}>
                <GetIcon icon="down-up" isOpen={isDescriptionOpen} />
                Description
              </AccordionHeader>
              <AccordionContent isOpen={isDescriptionOpen}>
                <p>Here you can manage the description styling options.</p>
              </AccordionContent>
            </Accordion>

            <Accordion>
              <AccordionHeader onClick={() => setIsBackgroundOpen(!isBackgroundOpen)}>
                <GetIcon icon="down-up" isOpen={isBackgroundOpen} />
                Background
              </AccordionHeader>
              <AccordionContent isOpen={isBackgroundOpen}>
                <p>Here you can manage background styling options.</p>
              </AccordionContent>
            </Accordion>
          </>
        )}
        {activeTab === "advanced" && (
          <>
            <Accordion>
              <AccordionHeader onClick={() => setIsVisibilityOpen(!isVisibilityOpen)}>
                <GetIcon icon="down-up" isOpen={isVisibilityOpen} />
                Visibility
              </AccordionHeader>
              <AccordionContent isOpen={isVisibilityOpen}>
                {/* You can manage visibility content here */}
                <p>Visibility settings go here.</p>
              </AccordionContent>
            </Accordion>
          </>
        )}
      </ContentWrapper>
    </SidebarModal>
  );
};

export default ContentDetails;
