import React, { useState, useEffect } from "react";
import styled from "styled-components";
import EditorNew from "../../../core/editor";
import CustomLabel from "../../../core/input/label";
import { MultiSelect, TextBox, Button } from "../../../core/elements";
import { PageHeader } from "../../../core/input/heading";
import { getData, postData } from "../../../../backend/api";

const FormContainer = styled.div`
  max-width: 1200px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const ConfigSection = styled.div`
  margin-bottom: 30px;

  h3 {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 20px;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const INITIAL_FORM_STATE = {
  name: "",
  type: "whatsapp",
  audience: "",
  audienceCount: 0,
  description: "",
  status: "draft",
  scheduleTime: null,
  whatsappUrl: "",
  whatsappAccessToken: "",
  whatsappAccount: "",
  whatsappProvider: "",
};

const WhatsappCampaignForm = ({ onClose, onError }) => {
  const [activeTab, setActiveTab] = useState("template");
  const [loading, setLoading] = useState(false);
  const [audiences, setAudiences] = useState([]);
  const [providers, setProviders] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  const handleError = React.useCallback(
    (message) => {
      onError?.(message);
      setErrors((prev) => ({
        ...prev,
        general: message,
      }));
    },
    [onError]
  );

  const fetchAudiences = React.useCallback(async () => {
    try {
      const response = await getData({}, "audience");
      if (response?.data?.response) {
        setAudiences(response.data.response); // eslint-disable-line no-param-reassign
      }
    } catch (error) {
      console.error("Error fetching audiences:", error);
      throw new Error("Failed to fetch audiences");
    }
  }, []);

  const fetchProviders = React.useCallback(async () => {
    try {
      const response = await getData({}, "whatsapp-providers");
      if (response?.data?.response) {
        setProviders(response.data.response);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      throw new Error("Failed to fetch WhatsApp providers");
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchAudiences(), fetchProviders()]);
        setIsInitialized(true);
      } catch (error) {
        handleError(error.message || "Failed to initialize form data");
      } finally {
        setLoading(false);
      }
    };

    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, handleError, fetchAudiences, fetchProviders]);

  const handleInputChange = React.useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      general: undefined,
    }));
  }, []);

  const handleAudienceChange = React.useCallback(
    (selectedAudiences) => {
      if (!selectedAudiences.length) {
        setFormData((prev) => ({
          ...prev,
          audience: "",
          audienceCount: 0,
        }));
        return;
      }

      const selectedAudienceObj = audiences.find((a) => a._id === selectedAudiences[0]);
      if (selectedAudienceObj) {
        setFormData((prev) => ({
          ...prev,
          audience: selectedAudiences[0],
          audienceCount: selectedAudienceObj.count || 0,
        }));
      }
    },
    [audiences]
  );

  const validateForm = React.useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Campaign name is required";
    if (!formData.audience) newErrors.audience = "Please select an audience";
    if (!formData.description.trim()) newErrors.description = "Message content is required";

    if (activeTab === "config") {
      if (!formData.whatsappProvider) newErrors.whatsappProvider = "WhatsApp provider is required";
      if (!formData.whatsappUrl) newErrors.whatsappUrl = "WhatsApp URL is required";
      if (!formData.whatsappAccessToken) newErrors.whatsappAccessToken = "Access token is required";
      if (!formData.whatsappAccount) newErrors.whatsappAccount = "WhatsApp account is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, activeTab]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      handleError("Please fix all errors before submitting");
      return;
    }

    try {
      setLoading(true);
      const response = await postData(
        {
          ...formData,
          status: "sending",
        },
        "campaign"
      );

      if (response?.data) {
        onClose?.(response.data);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error submitting campaign:", error);
      handleError(error.response?.data?.message || "Failed to submit campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) {
      handleError("Please fix all errors before saving");
      return;
    }

    try {
      setLoading(true);
      const response = await postData(
        {
          ...formData,
          status: "draft",
        },
        "campaign"
      );

      if (response?.data) {
        onClose?.(response.data);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      handleError(error.response?.data?.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return <div>Initializing form...</div>;
  }

  return (
    <FormContainer>
      {loading && (
        <LoadingOverlay>
          <div>Processing...</div>
        </LoadingOverlay>
      )}

      <PageHeader dynamicClass="sub" line={false} title="WhatsApp Campaigns" description="Send WhatsApp messages to registered attendees!" />

      {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <TextBox label="Campaign Name" value={formData.name} onChange={(value) => handleInputChange("name", value)} align="left" info="Enter the name of your campaign for internal reference" />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>

        <FormGroup className="inline">
          <div>
            <MultiSelect
              label="Select Audiences"
              value={formData.audience ? [formData.audience] : []}
              selectApi={audiences.map((a) => ({ id: a._id, value: a.name }))}
              onSelect={handleAudienceChange}
              info="Select one audience for your campaign"
              checkBox={true}
              error={errors.audience}
              align="left"
            />
          </div>
          <AudienceWrapper>
            <AudienceCount>
              <div className="label">SELECTED UNIQUE AUDIENCE</div>
              <div className="count">{formData.audienceCount.toLocaleString()}</div>
            </AudienceCount>
          </AudienceWrapper>
        </FormGroup>

        <TabContainer>
          <Tab active={activeTab === "template"} onClick={() => setActiveTab("template")}>
            WhatsApp Template
          </Tab>
          <Tab active={activeTab === "config"} onClick={() => setActiveTab("config")}>
            WhatsApp Configuration
          </Tab>
        </TabContainer>

        {activeTab === "template" && (
          <>
            <FormGroup key={"tempalate"}>
              <DescriptionHeader>
                <CustomLabel label="Message Content" />
              </DescriptionHeader>
              <EditorNew value={formData.description} onChange={(value) => handleInputChange("description", value)} />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
            </FormGroup>
          </>
        )}

        {activeTab === "config" && (
          <ConfigSection>
            <FormGroup>
              <MultiSelect
                label="WhatsApp Account Provider"
                value={formData.whatsappProvider ? [formData.whatsappProvider] : []}
                selectApi={providers.map((p) => ({ id: p._id, value: p.name }))}
                onSelect={(selected) => handleInputChange("whatsappProvider", selected[0] || "")}
                info="Select your WhatsApp service provider"
                checkBox={true}
                error={errors.whatsappProvider}
                align="left"
              />
            </FormGroup>
            <FormGroup>
              <TextBox label="WhatsApp URL" value={formData.whatsappUrl} onChange={(value) => handleInputChange("whatsappUrl", value)} align="left" />
              {errors.whatsappUrl && <ErrorMessage>{errors.whatsappUrl}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <TextBox label="WhatsApp Access Token" value={formData.whatsappAccessToken} onChange={(value) => handleInputChange("whatsappAccessToken", value)} align="left" type="password" />
              {errors.whatsappAccessToken && <ErrorMessage>{errors.whatsappAccessToken}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <TextBox label="WhatsApp Account" value={formData.whatsappAccount} onChange={(value) => handleInputChange("whatsappAccount", value)} align="left" />
              {errors.whatsappAccount && <ErrorMessage>{errors.whatsappAccount}</ErrorMessage>}
            </FormGroup>
          </ConfigSection>
        )}

        <ButtonGroup>
          <Button value="Save as Draft" type="secondary" isDisabled={loading} ClickEvent={handleSaveDraft} />
          <Button value="Send" type="primary" isDisabled={loading} ClickEvent={handleSubmit} />
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default WhatsappCampaignForm;
