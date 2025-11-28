import styled from "styled-components";
import { appTheme } from "../../../brand/project";

export const ContentContainer = styled.div`
  /* margin-top: 60px; */
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid ${appTheme.stroke.soft};
  // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;
export const FieldContainer = styled.div`
  margin: 0px;
  max-height: calc(100vh - 80px);
  overflow: auto;
  flex-wrap: wrap;
  padding: 20px;
  padding-bottom: 100px;
  display: flex;
  gap: 10px;
  margin-bottom: auto;
`;
export const Header = styled.div`
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
      margin: 0 0 0 0; /* Adjust the margin as needed */
      padding: 0; /* Remove the default padding */
      font-weight: 300;
      font-size: 14px;
      text-align: start;
    }
  }
`;
export const FormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  opacity: ${(props) => (props.disabled ? 0.75 : 1)};

  & > * {
    flex: 1 1 calc(50% - 16px);
    box-sizing: border-box;
  }
  display: grid;
  grid-template-columns: repeat(12, 1fr);
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 10px 0px 15px;
  border-radius: 10px;
  border: 1px solid transparent;
  background-color: ${(props) => (props?.isActive ? "#F6F8FA" : "#ffffff")};
  border-color: ${(props) => (props?.isActive ? "#EBF1FF" : "transparent")};
  transition:
    background-color 0.3s,
    border-color 0.3s;
  img {
    display: none;
  }
  img.contain {
    display: block;
  }
  &.title {
    flex: 1 1 calc(100% - 16px);
  }
  &:hover {
    cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
    img {
      display: flex;
    }
  }

  ${(props) =>
    props.disabled &&
    `pointer-events: none;
    padding: 10px;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 10px;
    }
  `}
  &.small {
    grid-column: span 3;
  }
  &.half {
    grid-column: span 6;
  }
  &.large {
    grid-column: span 9;
  }
  &.full {
    grid-column: span 12;
  }
`;

export const DeleteButton = styled.img`
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 15px;
  height: 20px;
`;

export const Icon = styled.img`
  cursor: grab;
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  height: 10px;
`;
export const UserDetails = styled.div`
  margin-bottom: 10px;
  border-radius: 0px;
  overflow: hidden;
  display: grid;
  border: 1px solid #d3d3d3;
  // box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 8px 2px;
  &.double {
    display: grid;
    grid-template-columns: 1fr repeat(auto-fill, minmax(50%, 1fr));
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  article {
    border-bottom: 1px solid rgb(227 227 227);
  }
  article:last-child {
    border-bottom: 0px;
  }
`;

export const Details = styled.article`
  display: flex;
  margin: 0px;
  padding: 10px;
  font-size: 12px;
  &.head {
    color: black;
    font-weight: 600;
    padding: 10px;
    border-radius: 10px 0 0;
    cursor: pointer;
    font-size: 14px;
    &.true {
      background-color: #4b4b4b;
      color: white;
    }
  }
  > div {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }
  div:nth-child(2),
  .second {
    font-size: 13px;
    font-weight: bold;
    justify-content: right;
    text-align: right;
  }
  .second {
    font-weight: bold;
    gap: 5px;
    text-align: left;
    justify-content: right;
  }
  .second div {
    border: 1px solid;
    border-radius: 6px;
    padding: 2px 5px;
    font-size: 12px;
  }
  .second div:first-child {
    border: 0px solid;
    border-radius: 6px;
    padding: 2px 0px;
    font-size: 12px;
    width: 100%;
    font-weight: normal;
  }
  > div > span {
    display: flex;
    margin-right: 1px;
  }
  > div > span::after {
    content: " \u2022"; /* Unicode character for round dot */
  }
  > div > span:last-child::after {
    content: ""; /* Empty content for the last span */
  }
  button {
    background-color: transparent;
    outline: none;
    border: 0;
    cursor: pointer;
  }
`;

export const quickFields = [
  {
    label: "Name",
    icon: "team",
    value: "Name",
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    label: "Email",
    icon: "email",
    value: "Email",
    type: "email",
    placeholder: "youremail@email.com",
  },
  {
    label: "Phone",
    icon: "whatsapp",
    value: "Phone",
    type: "mobilenumber",
    placeholder: "1234567890",
  },
  {
    label: "Website",
    icon: "website",
    value: "Website",
    type: "text",
    placeholder: "https://www.example.com",
  },
  {
    label: "Company",
    icon: "sponsors",
    value: "Company",
    type: "text",
    placeholder: "Enter your company name",
  },
  {
    label: "Designation",
    icon: "news",
    value: "Designation",
    type: "text",
    placeholder: "Enter your job title",
  },
  {
    label: "Country",
    icon: "location",
    value: "Country",
    type: "select",
    placeholder: "Select your country",
  },
  // {
  //   label: "Voice Response",
  //   icon: "whatsapp",
  //   value: "Voice Response",
  //   type: "voice",
  //   placeholder: "Click to record your voice",
  // },
  {
    label: "Profile Picture",
    icon: "image",
    value: "Profile Picture",
    type: "image",
    placeholder: "Click to upload a profile picture",
  },
];

export const customFields = [
  {
    label: "Text Input",
    icon: "short",
    value: "Text Input",
    type: "text",
    placeholder: "Enter your text here",
  },
  {
    label: "Text Area",
    icon: "paragraph",
    value: "Text Area",
    type: "textarea",
    placeholder: "Enter your long text here...",
  },
  // {
  //   label: "Title",
  //   icon: "short",
  //   value: "Title",
  //   type: "text",
  //   placeholder: "Enter your text here",
  // },
  {
    label: "Html Editor",
    icon: "paragraph",
    value: "Html Editor",
    type: "htmleditor",
    placeholder: "Enter your long text here...",
  },
  {
    label: "Number",
    icon: "Number",
    value: "Number",
    type: "number",
    placeholder: "Enter a number",
  },
  // {
  //   label: "Password",
  //   icon: "password",
  //   value: "Password",
  //   type: "password",
  //   placeholder: "Enter a password",
  // },
  {
    label: "Select",
    icon: "Select",
    value: "Select",
    type: "select",
    placeholder: "Select one option",
  },
  {
    label: "Multi Select",
    icon: "MultiSelect",
    value: "Multi Select",
    type: "multiSelect",
    placeholder: "Select one or more options",
  },
  // {
  //   label: "Dropdown",
  //   icon: "DropDown",
  //   value: "Dropdown",
  //   type: "select",
  //   placeholder: "Choose from the dropdown",
  // },
  {
    label: "Line",
    icon: "line",
    value: "Line",
    type: "line",
    placeholder: "Enter a line here",
  },
  {
    label: "Date",
    icon: "date",
    value: "Date",
    type: "date",
    placeholder: "Select a date",
  },
  {
    label: "Time",
    icon: "Time",
    value: "Time",
    type: "time",
    placeholder: "Select a time",
  },
  // {
  //   label: "Slider",
  //   icon: "logout",
  //   value: "Slider",
  //   type: "range",
  //   placeholder: "Slide to select a value",
  // },
  // {
  //   label: "Rating",
  //   icon: "star",
  //   value: "Rating",
  //   type: "rating",
  //   placeholder: "Rate from 1 to 5 stars",
  // },
  {
    label: "File Upload",
    icon: "fileUpload",
    value: "File Upload",
    type: "file",
    placeholder: "Click to upload a file",
  },
  {
    label: "Info",
    icon: "info",
    value: "Info",
    type: "info",
    content: "Add your info here",
  },
  {
    label: "Check Box",
    icon: "checkbox",
    value: "Check Box",
    type: "checkbox",
    content: "Click to enable field",
  },
];
