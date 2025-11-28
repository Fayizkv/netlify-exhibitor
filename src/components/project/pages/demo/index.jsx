import React, { useEffect, useRef, useState } from "react";
import Layout from "../../../core/layout";
import { Container } from "../../../core/layout/styels";
import { GetIcon } from "../../../../icons";
import {
  ContentBox,
  DropDownIconButton,
  DropdownItem,
  DropdownList,
  FieldBox,
  Frame,
  IconButton,
  IconContainer,
  Input,
  InputContainer,
  Row,
  TabOne,
  TabTwo,
  Title,
  ToggleButton,
  ToggleDown,
} from "./formStyle";

const Demo = (props) => {
  const [inputValue, setInputValue] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isTextSlash, setIsTextSlash] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isStar, setIsStar] = useState(false);
  const [isMore, setIsMore] = useState(false);
  const [inputContainerActive, setInputContainerActive] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const toggleBold = () => {
    setIsBold((prev) => !prev);
    setInputContainerActive(true);
  };

  const toggleItalic = () => {
    setIsItalic((prev) => !prev);
    setInputContainerActive(true);
  };

  const toggleUnderline = () => {
    setIsUnderline((prev) => !prev);
    setInputContainerActive(true);
  };

  const toggleLink = () => {
    setIsLink((prev) => !prev);
    setInputContainerActive(true);
  };
  const toggleTextSlash = () => {
    setIsTextSlash((prev) => !prev);
    setInputContainerActive(true);
  };

  const toggleImage = () => {
    setIsImage((prev) => !prev);
    setInputContainerActive(true);
  };

  const toggleCopy = () => {
    setIsCopy((prev) => !prev);
    setInputContainerActive(true);
  };

  const toggleDelete = () => {
    setIsDelete((prev) => !prev);
    setInputContainerActive(true);
  };
  const toggleStar = () => {
    setIsStar((prev) => !prev);
    setInputContainerActive(true);
  };
  const toggleMore = () => {
    setIsMore((prev) => !prev);
    setInputContainerActive(true);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (option) => {
    console.log("Selected option:", option);
    setSelectedOption(option);
  };

  const options = [
    { key: "shortAnswer", icon: "short", name: "Short Answer" },
    { key: "paragraph", icon: "paragraph", name: "Paragraph" },
    { key: "multipleChoice", icon: "multipleChoice", name: "Multiple Choice" },
    { key: "checkBox", icon: "checkBox", name: "Check Box" },
    { key: "dropDown", icon: "dropDown", name: "Drop Down" },
    { key: "fileUpload", icon: "fileUpload", name: "File Uplload" },
    { key: "time", icon: "time", name: "Time" },
    { key: "date", icon: "dateIcon", name: "Date" },
  ];
  return (
    <Container className="noshadow">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          margin: "10px",

          // justifyContent: "center",
        }}
      >
        <ContentBox>
          <Frame src={"https://images4.alphacoders.com/134/1341419.png"} alt="frame" />
        </ContentBox>
        <FieldBox>
          <Title>Form Title</Title>
          <InputContainer isActive={inputContainerActive}>
            <Input type="text" />
          </InputContainer>
        </FieldBox>
        <FieldBox>
          <Title>Description</Title>
          <InputContainer isActive={inputContainerActive}>
            <IconContainer style={{ borderBottom: "2px solid #ced9e2" }}>
              <TabOne>
                <IconButton active={isBold} onClick={toggleBold}>
                  <GetIcon icon={"bold"} />
                </IconButton>
                <IconButton active={isItalic} onClick={toggleItalic}>
                  <GetIcon icon={"italic"} />
                </IconButton>
                <IconButton active={isUnderline} onClick={toggleUnderline}>
                  <GetIcon icon={"underline"} />
                </IconButton>
                <IconButton active={isLink} onClick={toggleLink}>
                  <GetIcon icon={"link"} />
                </IconButton>
                <IconButton active={isTextSlash} onClick={toggleTextSlash}>
                  <GetIcon icon={"textSlash"} />
                </IconButton>
              </TabOne>
            </IconContainer>
            <Input
              type="text"
              value={inputValue}
              placeholder="The clear and short the better"
              onChange={handleInputChange}
              style={{
                marginTop: "10px",
                marginBottom: "20px",
                fontWeight: isBold ? "bold" : "normal",
                fontStyle: isItalic ? "italic" : "normal",
                textDecoration: isUnderline ? "underline" : "none",
                color: isLink ? "blue" : "#b3bfc9",
              }}
            />
          </InputContainer>
        </FieldBox>
        <FieldBox>
          <Title>Question</Title>
          <InputContainer isActive={inputContainerActive}>
            <IconContainer style={{ borderBottom: "2px solid #ced9e2" }}>
              <TabOne>
                <IconButton active={isBold} onClick={toggleBold}>
                  <GetIcon icon={"bold"} />
                </IconButton>
                <IconButton active={isItalic} onClick={toggleItalic}>
                  <GetIcon icon={"italic"} />
                </IconButton>
                <IconButton active={isUnderline} onClick={toggleUnderline}>
                  <GetIcon icon={"underline"} />
                </IconButton>
                <IconButton active={isLink} onClick={toggleLink}>
                  <GetIcon icon={"link"} />
                </IconButton>
                <IconButton active={isTextSlash} onClick={toggleTextSlash}>
                  <GetIcon icon={"textSlash"} />
                </IconButton>
                <IconButton active={isImage} onClick={toggleImage}>
                  <GetIcon icon={"image"} />
                </IconButton>
              </TabOne>
              <TabTwo>
                <IconButton active={isCopy} onClick={toggleCopy}>
                  <GetIcon icon={"copy"} />
                </IconButton>
                <IconButton active={isDelete} onClick={toggleDelete}>
                  <GetIcon icon={"delete"} />
                </IconButton>
                <IconButton active={isStar} onClick={toggleStar}>
                  <GetIcon icon={"star"} />
                </IconButton>
                <IconButton active={isMore} onClick={toggleMore}>
                  <GetIcon icon={"more"} />
                </IconButton>
              </TabTwo>
            </IconContainer>
            <Input
              type="text"
              value={inputValue}
              placeholder="The clear and short the better"
              onChange={handleInputChange}
              style={{
                marginTop: "10px",
                marginBottom: "20px",
                fontWeight: isBold ? "bold" : "normal",
                fontStyle: isItalic ? "italic" : "normal",
                textDecoration: isUnderline ? "underline" : "none",
                color: isLink ? "blue" : "#b3bfc9",
              }}
            />
            <IconContainer>
              <ToggleDown>
                <ToggleButton onClick={toggleDropdown}>
                  {selectedOption && <GetIcon icon={selectedOption?.icon} />}
                  <GetIcon icon="down" />
                </ToggleButton>
                <DropdownList ref={dropdownRef} isOpen={isOpen}>
                  {options.map(
                    (option, index) =>
                      index % 3 === 0 && (
                        <Row key={index}>
                          {options.slice(index, index + 3).map((option, innerIndex) => (
                            <DropdownItem key={innerIndex} onClick={() => handleItemClick(option)}>
                              <DropDownIconButton key={option?.id}>
                                <GetIcon icon={option?.icon} />
                              </DropDownIconButton>
                              {option?.name}
                            </DropdownItem>
                          ))}
                        </Row>
                      )
                  )}
                </DropdownList>
                {selectedOption && selectedOption?.name}
              </ToggleDown>
            </IconContainer>
          </InputContainer>
        </FieldBox>
      </div>
    </Container>
  );
};

// exporting the page with parent container layout..
export default Layout(Demo);
