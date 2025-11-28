import React, { useState, useEffect } from "react";
import { Mail, CheckCircle } from "lucide-react";
import EditorNew from "../../../../core/editor";
import IphoneMockup from "./iphoneMockup";
import { TabButtons } from "../../../../core/elements";
import { Button, IconButton } from "../../../../core/elements";
import FormInput from "../../../../core/input";
import { PageHeader } from "../../../../core/input/heading";
import { Overlay, Page, Header, Footer } from "../../../../core/list/create/styles";
import { getData } from "../../../../../backend/api";

const SubmissionsModal = ({
  isOpen,
  onClose,
  isSaving, // Add isSaving prop for saving state indicator
  emailSubject,
  emailMessage,
  whatsappMessage,
  websiteMessage,
  onEmailSubjectChange,
  onEmailMessageChange,
  onWhatsappMessageChange,
  onWebsiteMessageChange,
  onSave,
  replaceVariables,
  // Add missing props for badge functionality
  enableEmail,
  enableWhatsapp,
  attachBadgeEmail,
  attachBadgeWhatsapp,
  enableEmailCalendar, // Add enableEmailCalendar prop
  onEnableEmailChange,
  onEnableWhatsappChange,
  onAttachBadgeEmailChange,
  onAttachBadgeWhatsappChange,
  onEnableEmailCalendarChange, // Add handler for calendar toggle
  // Add props for event and ticket data
  eventId,
  ticketId,
  eventData,
  // Add props for event settings and hidden tabs
  eventSettings,
  hiddenTabs = [],
}) => {
  const [activeSubmissionTab, setActiveSubmissionTab] = useState("email");
  const [emailEditor, setEmailEditor] = useState(null);
  const [websiteEditor, setWebsiteEditor] = useState(null);

  // Available tabs - always show all tabs, but hide message configuration for hidden tabs
  const availableTabs = [
    { key: "email", title: "Email", icon: "email" },
    { key: "whatsapp", title: "WhatsApp", icon: "whatsapp" },
    { key: "website", title: "Website", icon: "globe" },
  ];

  // State for registration data
  const [registrationData, setRegistrationData] = useState(null);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(false);
  const [fullEventData, setFullEventData] = useState(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);

  // Helper function to generate fallback email from firstName
  const generateFallbackEmail = (firstName) => {
    if (!firstName) return "user@gmail.com";
    const cleanFirstName = firstName.replace(/\s+/g, ""); // Remove all spaces
    return `${cleanFirstName}@gmail.com`;
  };

  // Helper function to set placeholder registration data
  const setPlaceholderRegistrationData = () => {
    setRegistrationData({
      emailId: "{firstName}@gmail.com",
      firstName: "{firstName}",
    });
  };

  // Fetch full event data for banner
  const fetchFullEventData = async () => {
    if (!eventId) {
      return;
    }

    setIsLoadingEvent(true);
    try {
      const response = await getData({ id: eventId }, "event");

      if (response.status === 200 && response.data?.success) {
        const eventData = response.data.response;
        setFullEventData(eventData);
      } else {
        setFullEventData(null);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      setFullEventData(null);
    } finally {
      setIsLoadingEvent(false);
    }
  };

  // Fetch first registration data for preview
  const fetchFirstRegistration = async () => {
    if (!eventId || !ticketId) {
      return;
    }

    setIsLoadingRegistration(true);
    try {
      // Only search for registrations for the specific ticket
      const response = await getData(
        {
          ticket: ticketId,
          event: eventId,
          type: "Ticket",
          limit: 1,
          skip: 0,
        },
        "ticket-registration"
      );

      if (response.status === 200 && response.data?.success) {
        const registrations = response.data.response || [];
        if (registrations.length > 0) {
          const registration = registrations[0];
          // Validate that the registration actually belongs to the correct ticket
          const registrationTicketId = registration.ticket?._id || registration.ticket;
          if (registrationTicketId !== ticketId) {
            setPlaceholderRegistrationData();
            return;
          }
          // Generate fallback email if emailId is empty
          let emailId = registration.emailId;
          if (!emailId || emailId.trim() === "") {
            emailId = generateFallbackEmail(registration.firstName);
          }
          setRegistrationData({
            ...registration,
            emailId: emailId,
          });
        } else {
          // No registrations found, use placeholder format
          setPlaceholderRegistrationData();
        }
      } else {
        // Fallback to placeholder format
        setPlaceholderRegistrationData();
      }
    } catch (error) {
      console.error("Error fetching registration data:", error);
      // Fallback to placeholder format
      setPlaceholderRegistrationData();
    } finally {
      setIsLoadingRegistration(false);
    }
  };

  // Fetch registration data when modal opens and we have the required IDs
  useEffect(() => {
    if (isOpen && eventId && ticketId) {
      // Clear previous registration data when switching tickets
      setRegistrationData(null);
      fetchFirstRegistration();
    }
  }, [isOpen, eventId, ticketId]);

  // Fetch full event data when modal opens and we have the eventId
  useEffect(() => {
    if (isOpen && eventId) {
      fetchFullEventData();
    }
  }, [isOpen, eventId]);

  // Available variables
  const availableVariables = [
    { key: "firstName", label: "{firstName}" },
    { key: "event", label: "{event}" },
    { key: "ticket", label: "{ticket}" },
    { key: "formTitle", label: "{formTitle}" },
  ];

  // Function to insert variable into message at cursor position
  const insertVariable = (variable, messageType) => {
    const variableText = variable; // Use the variable directly since it already includes the curly braces
    switch (messageType) {
      case "email":
        if (emailEditor && emailEditor.commands) {
          // Use Tiptap editor API to insert bold variable at cursor position
          emailEditor.commands.insertContent(`<strong>${variableText}</strong>`);
        } else {
          // Fallback: append to end with bold formatting
          const currentEmailContent = emailMessage || "";
          const newEmailContent = currentEmailContent + (currentEmailContent ? " " : "") + `<strong>${variableText}</strong>`;
          onEmailMessageChange({ target: { value: newEmailContent } });
        }
        break;
      case "whatsapp":
        // For textarea, insert at cursor position with bold formatting
        const whatsappTextarea = document.querySelector('textarea[name="whatsapp-message"]');
        const boldVariableText = `*${variableText}*`; // WhatsApp uses * for bold
        if (whatsappTextarea) {
          const start = whatsappTextarea.selectionStart;
          const end = whatsappTextarea.selectionEnd;
          const text = whatsappTextarea.value;
          const before = text.substring(0, start);
          const after = text.substring(end, text.length);
          const newText = before + boldVariableText + after;

          onWhatsappMessageChange({
            target: { value: newText },
          });

          // Restore cursor position after the inserted variable
          setTimeout(() => {
            whatsappTextarea.focus();
            whatsappTextarea.setSelectionRange(start + boldVariableText.length, start + boldVariableText.length);
          }, 0);
        } else {
          // Fallback to append if textarea not found
          onWhatsappMessageChange({
            target: {
              value: whatsappMessage + (whatsappMessage ? " " : "") + boldVariableText,
            },
          });
        }
        break;
      case "website":
        if (websiteEditor && websiteEditor.commands) {
          // Use Tiptap editor API to insert bold variable at cursor position
          websiteEditor.commands.insertContent(`<strong>${variableText}</strong>`);
        } else {
          // Fallback: append to end with bold formatting
          const currentWebsiteContent = websiteMessage || "";
          const newWebsiteContent = currentWebsiteContent + (currentWebsiteContent ? " " : "") + `<strong>${variableText}</strong>`;
          onWebsiteMessageChange({ target: { value: newWebsiteContent } });
        }
        break;
      default:
        break;
    }
  };

  // Variable button component
  const VariableButton = ({ variable, messageType, onClick }) => (
    <button
      type="button"
      onClick={() => insertVariable(variable, messageType)}
      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors duration-200"
      title={`Click to insert ${variable}`}
    >
      {variable}
    </button>
  );

  if (!isOpen) return null;

  return (
    <Overlay className="center" onClick={onClose}>
      <Page className="center double" style={{ width: "900px" }} onClick={(e) => e.stopPropagation()}>
        <Header className="custom">
          <div className="flex items-center justify-between w-full">
            <div className="text-left pl-8 pt-5 pb-0 mb-0">
              <PageHeader title="Submission Settings" description="Configure the message shown to users immediately after they submit the form." line={false} />
            </div>
            <div className="text-right pr-8 py-5 mb-0 pb-0">
              <IconButton icon="back" ClickEvent={onClose} aria-label="Close settings" />
            </div>
          </div>
        </Header>

        <div className="px-8 py-4">
          {/* Tab Navigation */}
          <div className="mb-6">
            <TabButtons tabs={availableTabs} selectedTab={activeSubmissionTab} selectedChange={setActiveSubmissionTab} design="underline" />
          </div>

          <div className="bg-bg-white border border-stroke-soft rounded-lg p-4 shadow-sm">
            <div className="grid gap-6 h-[400px]" style={{ gridTemplateColumns: "3fr 2fr" }}>
              {/* Configuration Panel */}
              <div className="overflow-y-auto pr-2">
                {activeSubmissionTab === "email" && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-3">Email Configuration</h4>
                    <div className="mb-4">
                      <FormInput
                        type="toggle"
                        name="enable-email"
                        label="Send confirmation email"
                        value={enableEmail}
                        onChange={(checked) => onEnableEmailChange({ target: { checked } })}
                        customClass="full"
                      />
                    </div>
                    <div className="mb-3">
                      <FormInput
                        type="toggle"
                        name="attach-badge-email"
                        label="Attach badge/ticket"
                        value={attachBadgeEmail}
                        onChange={(checked) => onAttachBadgeEmailChange({ target: { checked } })}
                        customClass="full"
                      />
                    </div>

                    <div className="mb-3">
                      <FormInput
                        type="toggle"
                        name="enable-email-calendar"
                        label="Attach calendar invite (.ics)"
                        value={enableEmailCalendar}
                        onChange={(checked) => onEnableEmailCalendarChange({ target: { checked } })}
                        customClass="full"
                      />
                    </div>

                    {enableEmail && (
                      <div className="space-y-3">
                        <div>
                          <FormInput type="text" name="email-subject" label="Email Subject" value={emailSubject} onChange={onEmailSubjectChange} customClass="full" />
                        </div>
                        <div>
                          {/* Sync website message with email editor changes */}
                          <EditorNew
                            value={emailMessage}
                            placeholder="Email Message"
                            customClass="full"
                            data-testid="email-editor"
                            onChange={(content) => {
                              onEmailMessageChange({ target: { value: content } });
                            }}
                            onEditorReady={setEmailEditor}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Available variables:{" "}
                          {availableVariables.map((variable, index) => (
                            <span key={variable.key}>
                              <VariableButton variable={variable.label} messageType="email" />
                              {index < availableVariables.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSubmissionTab === "whatsapp" && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-3">WhatsApp Configuration</h4>
                    <div className="mb-4">
                      <FormInput
                        type="toggle"
                        name="enable-whatsapp"
                        label="Send confirmation WhatsApp"
                        value={enableWhatsapp}
                        onChange={(checked) => onEnableWhatsappChange({ target: { checked } })}
                        customClass="full"
                      />
                    </div>

                    <div className="mb-3">
                      <FormInput
                        type="toggle"
                        name="attach-badge-whatsapp"
                        label="Attach badge/ticket"
                        value={attachBadgeWhatsapp}
                        onChange={(checked) => onAttachBadgeWhatsappChange({ target: { checked } })}
                        customClass="full"
                      />
                    </div>

                    {hiddenTabs.includes("whatsapp") ? (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-gray-600">
                          <p className="text-sm font-medium mb-2">Using Default EventHex WhatsApp Template</p>
                          <p className="text-xs text-gray-500">
                            The message content is managed by EventHex Business Account. To customize the WhatsApp message, please update your event settings to use a custom WhatsApp configuration.
                          </p>
                        </div>
                      </div>
                    ) : (
                      enableWhatsapp && (
                        <div className="space-y-3">
                          <div>
                            <FormInput type="textarea" name="whatsapp-message" label="WhatsApp Message" value={whatsappMessage} onChange={onWhatsappMessageChange} customClass="full" size="large" />
                          </div>
                          <div className="text-xs text-gray-500">
                            Available variables:{" "}
                            {availableVariables.map((variable, index) => (
                              <span key={variable.key}>
                                <VariableButton variable={variable.label} messageType="whatsapp" />
                                {index < availableVariables.length - 1 && ", "}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {activeSubmissionTab === "website" && (
                  <div>
                    <div className="space-y-3">
                      <div>
                        <EditorNew
                          value={websiteMessage}
                          placeholder="Confirmation Message"
                          customClass="full"
                          data-testid="website-editor"
                          onChange={(content) => onWebsiteMessageChange({ target: { value: content } })}
                          onEditorReady={setWebsiteEditor}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Available variables:{" "}
                        {availableVariables.map((variable, index) => (
                          <span key={variable.key}>
                            <VariableButton variable={variable.label} messageType="website" />
                            {index < availableVariables.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              <div className="overflow-y-auto pl-2">
                {activeSubmissionTab === "email" && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Email Confirmation</span>
                    </div>
                    {enableEmail ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">To:</span>{" "}
                          {isLoadingRegistration ? (
                            <span className="text-gray-400 italic">Loading...</span>
                          ) : (
                            <span className={registrationData?.emailId && registrationData.emailId !== "{firstName}@gmail.com" ? "text-gray-900" : "text-gray-500 italic"}>
                              {registrationData?.emailId || "{firstName}@gmail.com"}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Subject:</span> {replaceVariables(emailSubject)}
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded text-gray-700">
                          {/* Event Banner inside email message */}
                          {isLoadingEvent ? (
                            <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-500 text-center">Loading event banner...</div>
                          ) : fullEventData?.banner ? (
                            <div className="mb-4">
                              <img
                                src={`${import.meta.env.VITE_CDN}${fullEventData.banner}`}
                                alt={fullEventData.title || "Event Banner"}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  console.error("Banner image failed to load:", e.target.src);
                                  e.target.style.display = "none";
                                }}
                                onLoad={() => {
                                  console.log("Banner image loaded successfully:", `${import.meta.env.VITE_CDN}${fullEventData.banner}`);
                                }}
                              />
                            </div>
                          ) : null}

                          {/* Render rich HTML exactly as authored in the editor (images, line breaks, formatting) */}
                          <div
                            className="prose prose-sm max-w-none"
                            style={{
                              lineHeight: "1.6",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: replaceVariables(emailMessage)
                                .replace(/\{firstName\}/g, registrationData?.firstName || "{firstName}")
                                .replace(/\{\{firstName\}\}/g, registrationData?.firstName || "{firstName}")
                                .replace(/Participant/g, registrationData?.firstName || "{firstName}"),
                            }}
                          />
                        </div>
                        {attachBadgeEmail && <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs">📎 Badge will be attached to this email</div>}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">Email notifications are disabled</div>
                    )}
                  </div>
                )}

                {activeSubmissionTab === "whatsapp" && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="max-w-sm mx-auto">
                      {hiddenTabs.includes("whatsapp") ? (
                        <>
                          <IphoneMockup
                            messageText={`Dear ${registrationData?.firstName || "{firstName}"},\n\nYour registration for "${replaceVariables("{ticket}")}, ${replaceVariables("{event}")}" has been completed successfully.\n\nThis message is sent from EventHex Business Account`}
                            sender="EventHex.ai"
                          />
                          <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs text-center">
                            <span className="font-medium">Note:</span> This is the default EventHex template. Badge/ticket will be attached automatically.
                          </div>
                        </>
                      ) : enableWhatsapp ? (
                        <>
                          <IphoneMockup
                            messageText={replaceVariables(whatsappMessage)
                              .replace(/<[^>]*>/g, "")
                              .replace(/<br\s*\/?>/gi, "\n")
                              .replace(/\{firstName\}/g, registrationData?.firstName || "Participant")
                              .replace(/\{\{firstName\}\}/g, registrationData?.firstName || "Participant")
                              .replace(/Participant/g, registrationData?.firstName || "Participant")}
                            sender="EventHex.ai"
                          />
                          {attachBadgeWhatsapp && <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs text-center">📎 Badge will be attached to this WhatsApp message</div>}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 italic text-center">WhatsApp notifications are disabled</div>
                      )}
                    </div>
                  </div>
                )}

                {activeSubmissionTab === "website" && (
                  <div className="border border-gray-200 rounded-lg p-6 bg-white text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission Successful!</h3>
                    <p className="text-sm text-gray-600 mb-4">Form submitted successfully</p>

                    <div className="text-sm text-gray-800 mb-6 text-left">
                      {/* Render rich HTML exactly as authored in the editor (images, line breaks, formatting) */}
                      <div
                        className="prose prose-sm max-w-none"
                        style={{
                          lineHeight: "1.6",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: replaceVariables(websiteMessage || "")
                            .replace(/\{firstName\}/g, registrationData?.firstName || "Participant")
                            .replace(/\{\{firstName\}\}/g, registrationData?.firstName || "Participant")
                            .replace(/Participant/g, registrationData?.firstName || "Participant"),
                        }}
                      />
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button value="Submit Another" type="primary" ClickEvent={() => {}} />
                      <Button value="Download" type="secondary" ClickEvent={() => {}} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer className="popup plain">
          <div className="flex items-center justify-between w-full">
            {/* Saving indicator */}
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-primary-base">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </div>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <Button type="secondary" value="Cancel" ClickEvent={onClose} disabled={isSaving} />
              <Button
                type="primary"
                value={isSaving ? "Saving..." : "Save & Close"}
                disabled={isSaving}
                ClickEvent={async () => {
                  try {
                    const saveResult = await onSave?.();
                    if (saveResult !== false) {
                      onClose?.();
                    }
                  } catch (e) {
                    console.error("Error during save:", e);
                  }
                }}
              />
            </div>
          </div>
        </Footer>
      </Page>
    </Overlay>
  );
};

export default SubmissionsModal;
