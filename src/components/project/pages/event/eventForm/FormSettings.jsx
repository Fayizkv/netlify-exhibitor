import React, { useEffect, useState } from "react";
import { ElementContainer } from "../../../../core/elements";
import styled from "styled-components";
import AutoForm from "../../../../core/autoform/AutoForm";
import Accordion from "../../../../core/accordian";
import { Footer } from "../../../../core/list/create/styles";
import FormInput from "../../../../core/input";
import { putData } from "../../../../../backend/api";
import { useToast } from "../../../../core/toast";
// import { putData } from "../../../../../backend/api";

export const BadgeSettings = styled.div`
  margin-bottom: 10px;
  border-radius: 0px;
  overflow: hidden;
  display: grid;
  padding: 0 10px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 2px 2px;
  &.double {
    display: grid;
    grid-template-columns: 1fr repeat(auto-fill, minmax(50%, 1fr));
    gap: 10px;
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

export const Expansion = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  height: auto;
  margin: 0 0 50px 0;
`;

export const DetailHead = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const FormSettings = ({ data }) => {
  const toast = useToast();
  const [informationData] = useState([
    {
      type: "text",
      placeholder: "Feedback Form",
      name: "title",
      validation: "",
      default: "",
      label: "Form Title",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "a brief description",
      name: "description",
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Description",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "",
      name: "status",
      showItem: "Open",
      validation: "",
      default: "",
      tag: false,
      label: "Visibility",
      required: true,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "Open,Closed, Sold Out",
      footnote: "Only published form will be accessible to users",
    },
  ]);

  const [submissionsData] = useState([
    {
      type: "htmleditor",
      placeholder: "Success Message",
      name: "onsuccessfullMessage",
      showItem: "",
      validation: "",
      default: "Successfully Submitted.",
      tag: false,
      label: "Thank you for submitting",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "toggle",
      placeholder: "Notify via Email",
      name: "enableEmail",
      validation: "",
      default: "",
      label: "Notify via Email",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
      footnote: "Gives user a unique url to update their submission",
    },
    {
      type: "htmleditor",
      placeholder: "Mail Content",
      name: "emailTemplate",
      condition: {
        item: "enableEmail",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "Successfully Submitted.",
      tag: false,
      label: "Thank you for submitting",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Attach Badge",
      name: "attachBadgeEmail",
      condition: {
        item: "enableEmail",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Attach Badge",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "toggle",
      placeholder: "Notify via Whatsapp",
      name: "enableWhatsapp",
      validation: "",
      default: "",
      label: "Notify via Whatsapp",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
      footnote: "Gives user a unique url to update their submission",
    },
    {
      type: "textarea",
      placeholder: "Message",
      name: "whatsappTemplate",
      condition: {
        item: "enableWhatsapp",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "Successfully Submitted.",
      tag: false,
      label: "Thank you for submitting",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Attach Badge",
      name: "attachBadgeWhatsapp",
      condition: {
        item: "enableWhatsapp",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Attach Badge",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const [approvalData] = useState([
    {
      type: "toggle",
      placeholder: "Enable Approval",
      name: "needsApproval",
      validation: "",
      default: "",
      label: "Enable Approval",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
      footnote: "This will enable approval for the corresponding ticket",
    },
    {
      type: "toggle",
      placeholder: "Notify via Email",
      name: "approvalEmail",
      condition: {
        item: "needsApproval",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Notify via Email",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
      footnote: "Notifies approval status to their user via email",
    },
    {
      type: "htmleditor",
      placeholder: "Mail Content",
      name: "approvalEmailTemplate",
      condition: {
        item: "approvalEmail",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "Successfully Submitted.",
      tag: false,
      label: "Thank you for submitting",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Attach Badge",
      name: "attachBadgeEmailOnApproval",
      condition: {
        item: "approvalEmail",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Attach Badge",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    //whatsapp
    {
      type: "toggle",
      placeholder: "Notify via Whatsapp",
      name: "approvalWhatsapp",
      condition: {
        item: "needsApproval",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Notify via Whatsapp",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
      footnote: "Notifies approval status to their user via whatsapp",
    },
    {
      type: "textarea",
      placeholder: "Message",
      name: "approvalWhatsappTemplate",
      condition: {
        item: "approvalWhatsapp",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Message",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Attach Badge",
      name: "attachBadgeWhatsappOnApproval",
      condition: {
        item: "approvalWhatsapp",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Attach Badge",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const [rejectionData] = useState([
    {
      type: "htmleditor",
      placeholder: "Mail Content",
      name: "rejectionEmailTemplate",
      showItem: "",
      validation: "",
      default: "Successfully Submitted.",
      tag: false,
      label: "Thank you for submitting",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    //whatsapp
    {
      type: "textarea",
      placeholder: "Message",
      name: "rejectionWhatsappTemplate",
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Message",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const [securityData] = useState([
    {
      type: "toggle",
      placeholder: "Protect form with a Captcha",
      name: "enableCaptcha",
      validation: "",
      default: "",
      label: "Protect form with a Captcha",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
      footnote: "If enabled we will make sure respondent is a human",
    },
    {
      type: "toggle",
      placeholder: "Consent",
      name: "consent",
      validation: "",
      default: "",
      label: "Consent",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
      footnote: "This field will be placed near the primary action button",
    },
    {
      type: "textarea",
      placeholder: "Consent Message",
      name: "consentLetter",
      condition: {
        item: "consent",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "I consent to the use of my data, which has been submitted here, in order to get the possible event experience",
      tag: false,
      label: "Consent Message",
      required: false,
      view: true,
      add: true,
      update: true,
      footnote: "Add the text to the linked inside the [] brackets and the URL in () brackets",
    },
    {
      type: "toggle",
      placeholder: "Terms and Policies",
      name: "termsAndPolicy",
      validation: "",
      default: false,
      label: "Terms & Policies",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
      footnote: "Terms and Policies not configured in the event",
    },
    {
      type: "text",
      placeholder: "",
      name: "termsAndPolicyMessage",
      condition: {
        item: "termsAndPolicy",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Terms & Policy",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [dataChanged, setDataChanged] = useState(false);
  const submitChange = async (post, key) => {
    if (!formError) {
      const updatedData = Object.entries(formData).reduce((acc, [key, value]) => {
        return {
          ...acc,
          ...value, // Spread existing values for this key
        };
      }, {});
      // Uncomment and implement your API call here
      putData({ id: data._id, ...updatedData }, "ticket").then((response) => {
        if (response?.data?.success === true) {
          toast.success("Form has been updated");
        }
      });
    } else {
      toast.error("Form has errors!");
    }
  };

  const submit = (key, data, status) => {
    setSubmissionStatus((prev) => ({ ...prev, [key]: status }));
    setDataChanged(true);
    if (status) {
      setFormData((prevData) => ({
        ...prevData,
        [key]: data, // Store submitted data
      }));
    }
  };

  useEffect(() => {
    const status = Object.values(submissionStatus).some((item) => !item);
    setFormError(status);
  }, [submissionStatus]);
  const [formNo, setFormNo] = useState(1);
  const renderAutoForm = (key, formInput, submitKey) => (
    <AutoForm
      autoUpdate={true}
      useCaptcha={false}
      key={`${formNo}-${key}`}
      formType={"put"}
      description={""}
      formInput={formInput}
      formValues={data}
      submitHandler={(data, status) => {
        submit(submitKey, data, status);
      }}
      button={"Save"}
      plainForm={true}
      formMode={"single"}
      customClass={""}
      css="plain accordion head-hide"
    />
  );

  const sections = [
    {
      key: "information",
      label: "Information",
      icon: "info",
      content: renderAutoForm("elements", informationData, "ticket"),
    },
    {
      key: "submissions",
      label: "Submissions",
      icon: "submissions",
      content: renderAutoForm("elements", submissionsData, "submissions"),
    },
    {
      key: "approvalMessaging",
      label: "Approval Messaging",
      icon: "approvalmessaging",
      content: renderAutoForm("elements", approvalData, "approvalMessaging"),
    },
    {
      key: "rejectionMessaging",
      label: "Rejection Messaging",
      icon: "rejectionmessaging",
      content: renderAutoForm("elements", rejectionData, "rejectionMessaging"),
    },
    {
      key: "security",
      label: "Security & Privacy",
      icon: "securityprivacy",
      content: renderAutoForm("elements", securityData, "security"),
    },
  ];

  return (
    <ElementContainer className="form-builder-3">
      {/* <pre>
        <code>{JSON.stringify(formData, null, 2)}</code>
      </pre> */}
      <Accordion items={sections}></Accordion>
      {/* <Button
        value={`Error ${formError ? "Yes" : "No"}`}
        isDisabled={formError ? "disabled" : ""}
        ClickEvent={() => {
          submitChange();
        }}
      ></Button> */}
      {dataChanged && (
        <Footer className={`bottom ${formError ? "disabled" : ""}`}>
          <FormInput
            type="close"
            value={"Discard"}
            onChange={() => {
              setFormNo((prev) => prev + 1);
              setDataChanged(false);
            }}
          />
          <FormInput css={""} disabled={formError ? true : false} type="submit" name="submit" value={"Save Changes"} onChange={submitChange} />
        </Footer>
      )}
    </ElementContainer>
  );
};

export default FormSettings;
