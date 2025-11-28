import React, { useState, useEffect } from "react";
import styled from "styled-components";
import EditorNew from "../../../core/editor";
import CustomLabel from "../../../core/input/label";
import { MultiSelect, TextBox } from "../../../core/elements";
import { Line } from "../../../core/input/styles";
import { getData, postData, putData } from "../../../../backend/api";

const FormContainer = styled.div`
  max-width: 1200px;
  padding: 10px;
  background: white;
  border-radius: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &.inline {
    display: flex;
    gap: 20px;
    align-items: flex-start;

    > div:first-child {
      flex: 1;
    }
  }
`;

const AudienceWrapper = styled.div`
  min-width: 200px;
  margin-top: 5px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border: none;
  background: none;
  color: ${(props) => (props.active ? "#4361ee" : "#666")};
  border-bottom: 2px solid ${(props) => (props.active ? "#4361ee" : "transparent")};
  cursor: pointer;
  font-weight: 500;

  &:hover {
    color: #4361ee;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const AudienceCount = styled.div`
  padding: 14px 16px;

  .label {
    font-size: 12px;
    color: #757575;
    margin-bottom: 4px;
  }

  .count {
    font-size: 20px;
    font-weight: 600;
    color: #4361ee;
  }
`;

const DescriptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InsertFieldsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #4361ee;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &::before {
    content: "+";
    font-size: 16px;
    margin-right: 4px;
  }

  &:hover {
    background: rgba(67, 97, 238, 0.1);
  }
`;

const ConfigSection = styled.div`
  margin-bottom: 30px;

  h3 {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 20px;
  }
`;

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 120px;

  ${(props) =>
    props.variant === "primary" &&
    `
    background: #4361ee;
    color: white;
    border: none;
    
    &:hover {
      background: #2541df;
      box-shadow: 0 4px 12px rgba(67, 97, 238, 0.15);
    }
    
    &:active {
      background: #1f38b3;
      box-shadow: none;
    }
  `}

  ${(props) =>
    props.variant === "secondary" &&
    `
    background: transparent;
    color: #4361ee;
    border: .5px solid #4361ee;
    
    &:hover {
      background: rgba(67, 97, 238, 0.05);
      border-color: #2541df;
      color: #2541df;
    }
    
    &:active {
      background: rgba(67, 97, 238, 0.1);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  ${(props) =>
    props.loading &&
    `
    position: relative;
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}
`;

const EmailCampaignForm = (props) => {
  const eventId = props.openData.data._id;
  const [activeTab, setActiveTab] = useState("template");
  const [loading, setLoading] = useState(false);
  const [audiences, setAudiences] = useState([]);
  const [settings, setSettings] = useState(null);
  const [hasConfigChanges, setHasConfigChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState({
    fromName: "",
    fromEmail: "",
    replyToEmail: "",
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    smtpFromEmail: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "email",
    audiences: [],
    audienceCount: 0,
    subject: "",
    description: "",
    status: "draft",
    scheduleTime: null,
    fromName: "",
    fromEmail: "",
    replyToEmail: "",
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    smtpFromEmail: "",
  });

  useEffect(() => {
    const fetchAudiences = async () => {
      try {
        const response = await getData({ event: eventId }, "audience");
        setAudiences(response.data.response);
      } catch (error) {
        console.error("Error fetching audiences:", error);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await getData({ event: eventId }, "settings");
        const settingsData = response.data.response[0];
        setSettings(settingsData);

        // Store original config
        const config = {
          fromName: settingsData.fromName || "",
          fromEmail: settingsData.fromEmail || "",
          replyToEmail: settingsData.replyToEmail || "",
          smtpHost: settingsData.smtpHost || "",
          smtpPort: settingsData.smtpPort || "",
          smtpUsername: settingsData.smtpUsername || "",
          smtpPassword: settingsData.smtpPassword || "",
          smtpFromEmail: settingsData.smtpFromEmail || "",
        };
        setOriginalConfig(config);

        // Update form data
        setFormData((prevData) => ({
          ...prevData,
          ...config,
        }));
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
    fetchAudiences();
  }, [eventId]);

  // Check for changes in config fields
  useEffect(() => {
    const hasChanges = Object.keys(originalConfig).some((key) => originalConfig[key] !== formData[key]);
    setHasConfigChanges(hasChanges);
  }, [formData, originalConfig]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAudienceChange = (selectedAudienceIds) => {
    if (!selectedAudienceIds.length) {
      setFormData((prev) => ({
        ...prev,
        audiences: [],
        audienceCount: 0,
      }));
      return;
    }

    const totalMembers = audiences.filter((audience) => selectedAudienceIds.includes(audience._id)).reduce((sum, audience) => sum + (audience.totalMembers || 0), 0);

    setFormData((prev) => ({
      ...prev,
      audiences: selectedAudienceIds,
      audienceCount: totalMembers,
    }));
  };

  const handleSettingsSubmit = async () => {
    try {
      setLoading(true);
      const updatedSettings = {
        id: settings._id,
        fromName: formData.fromName,
        fromEmail: formData.fromEmail,
        replyToEmail: formData.replyToEmail,
        smtpHost: formData.smtpHost,
        smtpPort: formData.smtpPort,
        smtpUsername: formData.smtpUsername,
        smtpPassword: formData.smtpPassword,
        smtpFromEmail: formData.smtpFromEmail,
        ...settings,
      };

      const response = await putData({ updatedSettings }, "settings");
      if (response.status === 200 || response.status === 201) {
        // Update original config with new values
        setOriginalConfig({
          fromName: formData.fromName,
          fromEmail: formData.fromEmail,
          replyToEmail: formData.replyToEmail,
          smtpHost: formData.smtpHost,
          smtpPort: formData.smtpPort,
          smtpUsername: formData.smtpUsername,
          smtpPassword: formData.smtpPassword,
          smtpFromEmail: formData.smtpFromEmail,
        });
        setHasConfigChanges(false);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      const submissionData = {
        ...formData,
        status: "sending",
        event: eventId,
      };

      const response = await postData(submissionData, "campaign");
      if (response.status === 200 || response.status === 201) {
        setFormData({
          name: "",
          type: "email",
          audiences: [],
          audienceCount: 0,
          subject: "",
          description: "",
          status: "sending",
          scheduleTime: null,
          fromName: originalConfig.fromName,
          fromEmail: originalConfig.fromEmail,
          replyToEmail: originalConfig.replyToEmail,
          smtpHost: originalConfig.smtpHost,
          smtpPort: originalConfig.smtpPort,
          smtpUsername: originalConfig.smtpUsername,
          smtpPassword: originalConfig.smtpPassword,
          smtpFromEmail: originalConfig.smtpFromEmail,
        });
      }
    } catch (error) {
      console.error("Error submitting campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      const draftData = {
        ...formData,
        status: "draft",
        event: eventId,
      };

      const response = await postData(draftData, "campaign");
      if (response.status === 200 || response.status === 201) {
        setFormData({
          name: "",
          type: "email",
          audiences: [],
          audienceCount: 0,
          subject: "",
          description: "",
          status: "draft",
          scheduleTime: null,
          fromName: originalConfig.fromName,
          fromEmail: originalConfig.fromEmail,
          replyToEmail: originalConfig.replyToEmail,
          smtpHost: originalConfig.smtpHost,
          smtpPort: originalConfig.smtpPort,
          smtpUsername: originalConfig.smtpUsername,
          smtpPassword: originalConfig.smtpPassword,
          smtpFromEmail: originalConfig.smtpFromEmail,
        });
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const formattedAudiences = audiences.map((audience) => ({
    id: audience._id,
    value: audience.name,
  }));

  return (
    <FormContainer>
      <form onSubmit={(e) => e.preventDefault()}>
        <FormGroup>
          <TextBox label="Campaign Name" value={formData.name} onChange={(value) => handleInputChange("name", value)} align="left" info="Enter the name of your campaign for internal reference" />
        </FormGroup>
        <FormGroup className="inline">
          <div>
            <MultiSelect
              label="Select Audiences"
              value={formData.audiences}
              selectApi={formattedAudiences}
              onSelect={handleAudienceChange}
              info="Select one audience for your campaign"
              checkBox={true}
              error=""
              align="left"
            />
          </div>
          <AudienceWrapper>
            <AudienceCount>
              <div className="label">SELECTED UNIQUE AUDIENCE</div>
              <div className="count">{formData.audienceCount}</div>
            </AudienceCount>
          </AudienceWrapper>
        </FormGroup>

        <TabContainer>
          <Tab
            type="button"
            active={activeTab === "template"}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("template");
            }}
          >
            Email Template
          </Tab>
          <Tab
            type="button"
            active={activeTab === "config"}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("config");
            }}
          >
            Email Configuration
          </Tab>
        </TabContainer>

        {activeTab === "template" && (
          <>
            <FormGroup>
              <TextBox label="Email Subject" value={formData.subject} onChange={(value) => handleInputChange("subject", value)} align="left" info="Enter the subject line for your email" />
            </FormGroup>

            <FormGroup>
              <DescriptionHeader>
                <CustomLabel label="Description" />
                <InsertFieldsButton type="button">Insert Form Fields</InsertFieldsButton>
              </DescriptionHeader>
              <EditorNew value={formData.description} onChange={(value) => handleInputChange("description", value)} />
            </FormGroup>

            <ButtonGroup>
              <StyledButton
                type="button"
                variant="secondary"
                disabled={loading}
                loading={loading}
                onClick={(e) => {
                  e.preventDefault();
                  handleSaveDraft();
                }}
              >
                Save as Draft
              </StyledButton>
              <StyledButton
                type="button"
                variant="primary"
                disabled={loading}
                loading={loading}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                Send
              </StyledButton>
            </ButtonGroup>
          </>
        )}
        {activeTab === "config" && (
          <>
            <ConfigSection>
              <CustomLabel label="Basic Configuration" />
              <Line />
              <br />
              <FormGroup>
                <TextBox label="From Name" value={formData.fromName} onChange={(value) => handleInputChange("fromName", value)} align="left" />
              </FormGroup>
              <FormGroup>
                <TextBox label="From Email" value={formData.fromEmail} onChange={(value) => handleInputChange("fromEmail", value)} align="left" />
              </FormGroup>
              <FormGroup>
                <TextBox label="Reply to Email" value={formData.replyToEmail} onChange={(value) => handleInputChange("replyToEmail", value)} align="left" />
              </FormGroup>
            </ConfigSection>

            <ConfigSection>
              <CustomLabel label="SMTP Configuration" />
              <Line />
              <br />
              <FormGroup>
                <TextBox label="SMTP Host" value={formData.smtpHost} onChange={(value) => handleInputChange("smtpHost", value)} align="left" disabled={true} />
              </FormGroup>
              <FormGroup>
                <TextBox label="SMTP Port" value={formData.smtpPort} onChange={(value) => handleInputChange("smtpPort", value)} align="left" disabled={true} />
              </FormGroup>
              <FormGroup>
                <TextBox label="SMTP Username" value={formData.smtpUsername} onChange={(value) => handleInputChange("smtpUsername", value)} align="left" disabled={true} />
              </FormGroup>
              <FormGroup>
                <TextBox label="SMTP Password" type="password" value={formData.smtpPassword} onChange={(value) => handleInputChange("smtpPassword", value)} align="left" disabled={true} />
              </FormGroup>
              <FormGroup>
                <TextBox label="SMTP From Email" value={formData.smtpFromEmail} onChange={(value) => handleInputChange("smtpFromEmail", value)} align="left" disabled={true} />
              </FormGroup>
            </ConfigSection>

            {hasConfigChanges && (
              <ButtonGroup>
                <StyledButton type="button" variant="primary" disabled={loading} loading={loading} onClick={handleSettingsSubmit}>
                  Save Configuration
                </StyledButton>
              </ButtonGroup>
            )}
          </>
        )}
      </form>
    </FormContainer>
  );
};

export default EmailCampaignForm;
