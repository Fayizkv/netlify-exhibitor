import React, { useState } from "react";
import styled from "styled-components";
import {
  FaPhone,
  FaUser,
  FaEnvelope,
  FaLink,
  FaBuilding,
  FaBriefcase,
  FaFlag,
  FaMicrophone,
  FaHashtag,
  FaStar,
  FaFileSignature,
  FaTimes,
  FaEyeSlash,
  FaEye,
  FaColumns,
  FaRegSquare,
  FaKey,
} from "react-icons/fa";
import { MdTextFields, MdTextFormat, MdRadioButtonChecked, MdCheckBox, MdArrowDropDownCircle, MdDateRange, MdAccessTime, MdLinearScale, MdFileUpload } from "react-icons/md";
// Import images
import frame from "../../../../images/public/Frame 70 (1).png";
import deleteFrame from "../../../../images/public/Frame 71 (1).png";
import FormInput from "../../../core/input";

// const countries = [
//   {
//     name: "United States",
//     code: "us",
//     flag: "https://flagcdn.com/w320/us.png",
//     dialCode: "+1",
//     PhoneNumberLength: 10, // Added phone number length
//   },
//   {
//     name: "Canada",
//     code: "ca",
//     flag: "https://flagcdn.com/w320/ca.png",
//     dialCode: "+1",
//     PhoneNumberLength: 10, // Added phone number length
//   },
//   {
//     name: "Mexico",
//     code: "mx",
//     flag: "https://flagcdn.com/w320/mx.png",
//     dialCode: "+52",
//     PhoneNumberLength: 10, // Added phone number length
//   },
//   {
//     name: "United Kingdom",
//     code: "gb",
//     flag: "https://flagcdn.com/w320/gb.png",
//     dialCode: "+44",
//     PhoneNumberLength: 10, // Added phone number length
//   },
//   {
//     name: "Germany",
//     code: "de",
//     flag: "https://flagcdn.com/w320/de.png",
//     dialCode: "+49",
//     PhoneNumberLength: 10, // Added phone number length
//   },
//   {
//     name: "France",
//     code: "fr",
//     flag: "https://flagcdn.com/w320/fr.png",
//     dialCode: "+33",
//     PhoneNumberLength: 9, // Added phone number length
//   },
//   {
//     name: "India",
//     code: "in",
//     flag: "https://flagcdn.com/w320/in.png",
//     dialCode: "+91",
//     PhoneNumberLength: 10, // Added phone number length
//   },
//   {
//     name: "China",
//     code: "cn",
//     flag: "https://flagcdn.com/w320/cn.png",
//     dialCode: "+86",
//     PhoneNumberLength: 11, // Added phone number length
//   },
//   {
//     name: "Japan",
//     code: "jp",
//     flag: "https://flagcdn.com/w320/jp.png",
//     dialCode: "+81",
//     PhoneNumberLength: 10, // Added phone number length
//   },
//   {
//     name: "Australia",
//     code: "au",
//     flag: "https://flagcdn.com/w320/au.png",
//     dialCode: "+61",
//     PhoneNumberLength: 9, // Added phone number length
//   },
// ];

const quickFields = [
  { label: "Name", icon: <FaUser />, value: "Name", type: "text" },
  { label: "Email", icon: <FaEnvelope />, value: "Email", type: "text" },
  { label: "Phone", icon: <FaPhone />, value: "Phone", type: "mobilenumber" },
  { label: "Website", icon: <FaLink />, value: "Website", type: "text" },
  { label: "Company", icon: <FaBuilding />, value: "Company", type: "text" },
  {
    label: "Designation",
    icon: <FaBriefcase />,
    value: "Designation",
    type: "text",
  },
  { label: "Country", icon: <FaFlag />, value: "Country", type: "select" },
  {
    label: "Voice Response",
    icon: <FaMicrophone />,
    value: "Voice Response",
    type: "voice",
  },
];

const customFields = [
  {
    label: "Text Input",
    icon: <MdTextFields />,
    value: "Text Input",
    type: "text",
  },
  {
    label: "Text Area",
    icon: <MdTextFormat />,
    value: "Text Area",
    type: "textarea",
  },
  { label: "Number", icon: <FaHashtag />, value: "Number", type: "number" },
  { label: "Password", icon: <FaKey />, value: "Password", type: "password" },
  {
    label: "Select",
    icon: <MdRadioButtonChecked />,
    value: "Select",
    type: "select",
  },
  {
    label: "Multi Select",
    icon: <MdCheckBox />,
    value: "Multi Select",
    type: "multiSelect",
  },
  {
    label: "Dropdown",
    icon: <MdArrowDropDownCircle />,
    value: "Dropdown",
    type: "select",
  },
  { label: "Date", icon: <MdDateRange />, value: "Date", type: "date" },
  { label: "Time", icon: <MdAccessTime />, value: "Time", type: "time" },
  { label: "Slider", icon: <MdLinearScale />, value: "Slider" },
  { label: "Rating", icon: <FaStar />, value: "Rating" },
  {
    label: "File Upload",
    icon: <MdFileUpload />,
    value: "File Upload",
    type: "file",
  },
  {
    label: "Check Box",
    icon: <MdCheckBox />,
    value: "Check Box",
    type: "checkbox",
  },
  {
    label: "E-signature",
    icon: <FaFileSignature />,
    value: "E-signature",
    type: "image",
  },
];

const MainContainer = styled.div`
  padding-left: 40px;
  background-color: #f6f8fa;
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? "calc(100% - 300px)" : "100%")};
  height: auto;
  position: relative;
  padding: 20px;
  transition: width 0.3s ease;
`;

const InsertButton = styled.button`
  position: absolute;
  left: 20px;
  top: 20px;
  padding: 10px 20px;
  background-color: #ffffff; /* White background */
  color: #375dfb; /* Text color */
  border: 1px solid #375dfb; /* Border color */
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0; /* Slightly darker background on hover */
  }
`;

const ContentContainer = styled.div`
  margin-top: 60px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #d3d3d3;
  // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;

  div {
    h2 {
      margin: 0; /* Remove the default margin */
      padding: 0; /* Remove the default padding */
    }
    p {
      margin: 4px 0 0 0; /* Adjust the margin as needed */
      padding: 0; /* Remove the default padding */
      font-weight: 300;
      font-size: 14px;
    }
  }
`;
const VoiceRecorder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  // transition: background-color 0.3s ease;
  font-size: 12px;
`;

const VoiceIcon = styled(FaMicrophone)`
  color: #007bff;
  // margin-right: 10px;
`;

const VoiceIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #375dfb; /* Blue background */
  border-radius: 50%; /* Make the background a circle */

  svg {
    color: #ffffff; /* White icon color */
    font-size: 24px; /* Adjust icon size */
  }
`;
const Sidebar = styled.div`
  position: fixed;
  top: 0;
  right: ${({ isOpen }) => (isOpen ? "0" : "-300px")}; /* Slide in/out */
  width: 300px;
  height: 100vh;
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
  transition: right 0.3s ease-in-out;
  z-index: 10;
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Make the sidebar scrollable */
`;

// const CloseButton = styled.button`
//   align-self: flex-end;
//   padding: 10px;
//   background-color: #007bff;
//   color: #fff;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;

//   &:hover {
//     background-color: #0056b3;
//   }
// `;

// Define Overlay and Modal components
const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 9;
`;

const Modal = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 93%;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const FormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px; /* Adjust gap between items as needed */

  & > * {
    flex: 1 1 calc(50% - 16px); /* 50% width minus the gap size */
    box-sizing: border-box;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 10px;
  padding-bottom: 15px;
  border-radius: 10px;
  border: 1px solid transparent;
  background-color: ${(props) => (props.isActive ? "#F6F8FA" : "#ffffff")};
  border-color: ${(props) => (props.isActive ? "#EBF1FF" : "transparent")};
  transition:
    background-color 0.3s,
    border-color 0.3s;

  &:hover {
    cursor: pointer;
  }
`;

// const Label = styled.label`
//   display: block;
//   margin-bottom: 8px;
//   font-weight: bold;
// `;

const StyledInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
  outline: none;

  &:focus {
    border-color: #375dfb;
  }
`;

const StyledInputArea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
  outline: none;

  &:focus {
    border-color: #375dfb;
  }
`;

const DeleteButton = styled.img`
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 15px;
  height: 20px;
  display: ${(props) => (props.isActive ? "block" : "none")};
`;

const Icon = styled.img`
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  height: 10px;
  display: ${(props) => (props.isActive ? "block" : "none")};
`;

const ModalHeader = styled.h4`
  margin-bottom: 20px;
  text-align: left;
  margin-left: 20px;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f6f8fa;
  padding-left: 20px;
`;

const SectionHeader = styled.h3`
  margin-bottom: 10px;
  font-size: 14px;
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const FieldCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* Adjust the gap between field cards */

  @media (max-width: 768px) {
    align-items: center;
    justify-content: space-around;
  }
`;

const FieldCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px;
  background-color: #f6f8fa;
  border-radius: 10px;
  border: 1px solid #e2e4e9;
  cursor: pointer;
  width: 90px;
  height: 60px;
`;

const FieldIcon = styled.div`
  font-size: 14px;
`;

const FieldLabel = styled.div`
  font-size: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  padding-top: 10px;
  margin-left: 20px;
  margin-right: 20px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  background-color: ${(props) => (props.primary ? "#F6F8FA" : "#ffffff")};
  color: grey;
  border: 1px solid #e2e4e9;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};

  &:hover {
    background-color: #d3d3d3;
  }
`;
// const PhoneInputContainer = styled.div`
//   display: flex;
//   align-items: center;
//   border: 1px solid #ccc;
//   width: 100%;
//   height: 40px;
//   padding: 8px;
//   border: 1px solid #ccc;
//   border-radius: 10px;
//   outline: none;
// `;

// const FlagImg = styled.img`
//   width: 24px;
//   height: 24px;
//   border-radius: 50%;
//   margin-right: 10px;
// `;

// const CountryCodeDropdown = styled.select`
//   border: none;
//   background: transparent;
//   font-size: 16px;
//   margin-right: 10px;
// `;

// const VerticalSeparator = styled.div`
//   width: 1px;
//   height: 100%;
//   background-color: #ccc;
//   margin-right: 10px;
// `;

// const PhoneNumberInput = styled.input`
//   border: none;
//   font-size: 16px;
//   flex: 1;
// `;

const HeaderNew = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
`;

const PropertiesText = styled.div`
  font-size: 16px;
  margin-right: 5px;
`;

const MandatoryField = styled.div`
  background-color: #f8c9d2;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 10px;
  color: #000;
`;

const Content = styled.div`
  padding: 20px;
`;

const LabelWrapper = styled.div`
  margin-bottom: 10px;
`;

const LabelText = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 12px;
`;

const LabelTextSmall = styled.label`
  font-weight: 500;
  font-size: 10px;
`;

// const SwitchWrapper = styled.div`
//   margin-bottom: 20px;
// `;

// const SwitchLabel = styled.div`
//   font-weight: bold;
//   margin-bottom: 5px;
// `;

// const Description = styled.p`
//   font-size: 12px;
//   color: #666;
//   margin-top: 5px;
// `;
const HideButton = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledHideButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #f6f8fa;
  border: none;
  border-radius: 10px;
  color: grey;
  padding: 5px 10px;
  cursor: pointer;

  svg {
    margin-right: 5px;
  }
`;

const StyledSquareButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #fff;
  border: none;
  border-radius: 10px;
  color: #375dfb;
  padding: 5px 5px;
  cursor: pointer;

  svg {
    margin-right: 5px;
  }
`;

const FormBuilder = React.memo((props) => {
  // Early return if no props or data
  if (!props || !props.data) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>No form data available</h3>
        <p>Please select a valid form to edit.</p>
      </div>
    );
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize component
  React.useEffect(() => {
    try {
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    } catch (err) {
      console.error("Initialization error:", err);
      setError(err);
      setIsLoading(false);
    }
  }, []);

  // const [selectedCountry, setSelectedCountry] = useState('India');
  // const selectedCountryData = countries.find(country => country.name === selectedCountry);

  const FieldCardList = ({ fields }) => {
    // Safety check to ensure fields is an array
    if (!fields || !Array.isArray(fields)) {
      console.error("FieldCardList: fields is not an array:", fields);
      return <div>No fields available</div>;
    }

    return (
      <FieldCardContainer>
        {fields.map(({ label, icon, value, type }) => (
          <FieldCard key={value} onClick={() => handleFieldSelection({ label, icon, value, type })}>
            <FieldIcon>{icon}</FieldIcon>
            <FieldLabel>{label}</FieldLabel>
          </FieldCard>
        ))}
      </FieldCardContainer>
    );
  };

  const handleInputClick = (inputName) => {
    setActiveInput(inputName);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const openSidebar = () => {
    // setIsSidebarOpen(true);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setActiveInput(null);
  };

  //   const selectField = (field) => {
  //     setSelectedField(field);
  //   };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addFieldToForm = () => {
    if (selectedField) {
      setFormFields([...formFields, selectedField]);
      setSelectedField(null);
      closeModal();
    }
  };

  const handleDeleteField = (fieldToDelete) => {
    setFormFields(formFields.filter((field) => field.value !== fieldToDelete));
  };

  const handleFieldSelection = (field) => {
    setSelectedField(field);
  };

  const renderInputField = (type, label) => {
    try {
      switch (type) {
        case "text":
        case "select":
        case "mobilenumber":
        case "textarea":
        case "date":
        case "time":
        case "multiSelect":
        case "file":
        case "image":
        case "number":
        case "password":
        case "checkbox":
        case "voice":
          return <FormInput type={type} label={label} placeholder={`Enter ${label}`} />;
        default:
          return (
            <div style={{ padding: "10px", border: "1px dashed #ccc", borderRadius: "5px" }}>
              {label} field (type: {type})
            </div>
          );
      }
    } catch (err) {
      console.error("Error rendering input field:", err);
      return <div style={{ padding: "10px", border: "1px solid red", borderRadius: "5px", color: "red" }}>Error rendering {label} field</div>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>Loading Form Builder...</h3>
      </div>
    );
  }

  // Error boundary
  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <h3>Something went wrong</h3>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  try {
    return (
      <MainContainer isSidebarOpen={isSidebarOpen}>
        <InsertButton onClick={toggleModal}>+ Insert Fields</InsertButton>

        <ContentContainer>
          <Header>
            <div>
              <h2>Feedback Form</h2>
              <p>This is a sample description</p>
            </div>
            <VoiceRecorder>
              <VoiceIconWrapper>
                <VoiceIcon size={20} />
              </VoiceIconWrapper>
              <span>Type using AI</span>
            </VoiceRecorder>
          </Header>

          <FormContainer>
            {Array.isArray(formFields) ? (
              formFields.map((field, index) => (
                <InputWrapper
                  key={index}
                  isActive={activeInput === field.value}
                  onClick={() => {
                    handleInputClick(field.value);
                    openSidebar();
                  }}
                >
                  {/* <Label>{field.label}*</Label> */}
                  {renderInputField(field.type, field.label)}
                  <Icon src={frame} isActive={activeInput === field.value} />
                  <DeleteButton src={deleteFrame} isActive={activeInput === field.value} onClick={() => handleDeleteField(field.value)} />
                </InputWrapper>
              ))
            ) : (
              <div>No form fields available</div>
            )}
          </FormContainer>
        </ContentContainer>

        {isModalOpen && (
          <>
            <Overlay onClick={toggleModal} />
            <Modal>
              <ModalHeader>Insert Fields</ModalHeader>
              <SectionContainer>
                <SectionHeader>Primary Fields</SectionHeader>
                <FieldCardList fields={quickFields} />
              </SectionContainer>
              <SectionContainer style={{ paddingBottom: "10px" }}>
                <SectionHeader>Custom Fields</SectionHeader>
                <FieldCardList fields={customFields} />
              </SectionContainer>
              <ButtonContainer>
                <ModalButton onClick={toggleModal}>Cancel</ModalButton>
                <ModalButton primary disabled={!selectedField} onClick={addFieldToForm}>
                  Insert Field
                </ModalButton>
              </ButtonContainer>
            </Modal>
          </>
        )}

        {/* Sliding Sidebar */}
        <Sidebar isOpen={isSidebarOpen}>
          <HeaderNew>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <PropertiesText>Properties</PropertiesText>
              <MandatoryField>Mandatory Field</MandatoryField>
            </div>
            <FaTimes onClick={closeSidebar} />
          </HeaderNew>

          <Content>
            <LabelWrapper>
              <LabelText>Label*</LabelText>
              <StyledInput />
            </LabelWrapper>
            {/* 
    <SwitchWrapper>
      <SwitchLabel>Required</SwitchLabel> */}
            {/* <Switch> */}
            {/* Your switch component */}
            {/* </Switch> */}
            {/* <Description>Force users to fill out this field.</Description>
    </SwitchWrapper> */}

            <LabelWrapper>
              <LabelText>Field ID*</LabelText>
              <StyledInput />
            </LabelWrapper>

            <LabelWrapper>
              <LabelText>Placeholder</LabelText>
              <StyledInput />
            </LabelWrapper>
            <LabelWrapper>
              <LabelText>Description or Hint</LabelText>
              <StyledInputArea />
            </LabelWrapper>
            <LabelWrapper>
              <LabelText>Character Length*</LabelText>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <LabelTextSmall>Minimum</LabelTextSmall>
                  <StyledInput />
                </div>
                <div style={{ flex: 1 }}>
                  <LabelTextSmall>Maximum</LabelTextSmall>
                  <StyledInput />
                </div>
              </div>
            </LabelWrapper>
            <LabelWrapper>
              <LabelText>Visibility</LabelText>
              <HideButton>
                <StyledHideButton>
                  <FaEyeSlash /> Hide
                </StyledHideButton>
                <StyledHideButton>
                  <FaEye /> Show
                </StyledHideButton>
              </HideButton>
            </LabelWrapper>
            <LabelWrapper>
              <LabelText>Layout</LabelText>
              <HideButton>
                <StyledSquareButton>
                  <FaRegSquare /> One Column
                </StyledSquareButton>
                <StyledSquareButton>
                  <FaColumns /> Two Column
                </StyledSquareButton>
              </HideButton>
            </LabelWrapper>
          </Content>
        </Sidebar>
      </MainContainer>
    );
  } catch (err) {
    console.error("FormBuilder render error:", err);
    setError(err);
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <h3>FormBuilder Error</h3>
        <p>Failed to render the form builder</p>
      </div>
    );
  }
});

export default FormBuilder;
