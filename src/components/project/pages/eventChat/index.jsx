import React, { useState, useEffect } from "react";
import { RowContainer } from "../../../styles/containers/styles";
import { PageHeader } from "../../../core/input/heading";
import { Button } from "../../../core/elements";
import Loader from "../../../core/loader";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons";
import { getData, putData, postData } from "../../../../backend/api";

const EventChat = (props) => {
  const [eventId] = useState(props.openData.data._id);
  const [eventChatData, setEventChatData] = useState(null);
  const [otherDetails, setOtherDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Test Chat Modal States
  const [isTestChatOpen, setIsTestChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const toast = useToast();

  // Fetch event chat data on component mount
  useEffect(() => {
    fetchEventChatData();
  }, [eventId]);

  // Check for changes when otherDetails changes
  useEffect(() => {
    const originalDetails = eventChatData?.otherDetails || "";
    setHasChanges(otherDetails !== originalDetails);
  }, [otherDetails, eventChatData]);

  const fetchEventChatData = async () => {
    setIsLoading(true);
    try {
      const response = await getData({ eventId }, 'event-connect');
      if (response.status === 200) {
        setEventChatData(response.data.data);
        setOtherDetails(response.data.data?.otherDetails || "");
      } else {
        toast.error(response.data?.customMessage || "Failed to fetch event chat data");
      }
    } catch (error) {
      console.error("Error fetching event chat data:", error);
      toast.error("Failed to fetch event chat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      const response = await putData(
        { 
          id: eventId, 
          otherDetails: { description: otherDetails } 
        }, 
        'event-connect'
      );
      
      if (response.status === 200) {
        toast.success("Event chat description saved successfully!");
        setEventChatData(response.data.data);
        setHasChanges(false);
      } else {
        toast.error(response.data?.customMessage || "Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving event chat data:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const originalDetails = eventChatData?.otherDetails || "";
    setOtherDetails(originalDetails);
    setHasChanges(false);
  };

  // Test Chat Functions
  const openTestChat = () => {
    setIsTestChatOpen(true);
    setChatMessage("");
    setChatResponse("");
  };

  const closeTestChat = () => {
    setIsTestChatOpen(false);
    setChatMessage("");
    setChatResponse("");
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isTestChatOpen) {
        closeTestChat();
      }
    };

    if (isTestChatOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isTestChatOpen]);

  // Clean HTML response from markdown formatting
  const cleanHtmlResponse = (htmlString) => {
    if (!htmlString) return "";
    
    // Remove markdown code blocks
    let cleaned = htmlString
      .replace(/```html\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/```html/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Ensure it starts and ends with proper HTML tags
    if (!cleaned.startsWith('<')) {
      cleaned = `<div>${cleaned}</div>`;
    }
    
    return cleaned;
  };

  const sendTestMessage = async () => {
    if (!chatMessage.trim()) {
      toast.error("Please enter a message to test");
      return;
    }

    setIsChatLoading(true);
    try {
      const response = await postData(
        { 
          prompt: chatMessage,
          event: eventId 
        }, 
        'event-connect/chat'
      );
      
      if (response.status === 200) {
        const cleanedResponse = cleanHtmlResponse(response.data.data.response);
        setChatResponse(cleanedResponse);
        toast.success("Chat response received!");
      } else {
        toast.error(response.data?.customMessage || "Failed to get chat response");
      }
    } catch (error) {
      console.error("Error testing chat:", error);
      toast.error("Failed to test chat functionality");
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <RowContainer className="data-layout">
        <PageHeader 
          title="Event Chat Configuration" 
          description="Configure AI chat settings for your event"
          line={false}
        />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </RowContainer>
    );
  }

  return (
    <RowContainer className="data-layout">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <PageHeader 
          title="Event Chat Configuration" 
          description="Configure AI chat settings and additional information for your event"
          line={false}
        />
        
        {/* Test Chat Button */}
        <Button
          ClickEvent={openTestChat}
          value="Test Chat"
          type="primary"
          icon="eye"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Description Box */}
        <div className="bg-bg-white rounded-lg border border-stroke-soft p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-main mb-2">
              Event Description for AI Chat
            </h3>
            <p className="text-sm text-text-sub">
              Provide additional context and information about your event that will help the AI assistant 
              provide better responses to attendees' questions.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Additional Event Information
              </label>
              <textarea
                value={otherDetails}
                onChange={(e) => setOtherDetails(e.target.value)}
                placeholder="Enter additional information about your event that will help the AI assistant provide better responses. For example: special instructions, venue details, parking information, accessibility features, etc."
                rows={8}
                className="w-full px-4 py-3 border border-stroke-soft rounded-lg text-sm text-text-main bg-bg-white resize-none focus:border-stroke-strong focus:outline-none focus:ring-2 focus:ring-primary-light transition-all duration-200"
                style={{
                  minHeight: '200px',
                  fontFamily: 'inherit'
                }}
              />
              <div className="mt-2 text-xs text-text-soft">
                This information will be used by the AI to provide more accurate and helpful responses to attendees.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-stroke-soft">
              <div className="text-sm text-text-sub">
                {hasChanges && (
                  <span className="text-state-warning flex items-center gap-1">
                    <GetIcon icon="warning" size={16} />
                    You have unsaved changes
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <Button
                    ClickEvent={handleCancel}
                    value="Cancel"
                    type="secondary"
                    icon="close"
                  />
                )}
                
                <Button
                  ClickEvent={handleSave}
                  isDisabled={!hasChanges || isSaving}
                  value={isSaving ? "Saving..." : "Save Changes"}
                  type="primary"
                  icon={isSaving ? "loading" : "save"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-bg-weak rounded-lg border border-stroke-soft p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <GetIcon icon="info" size={16} className="text-primary-base" />
              </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-text-main mb-1">
                How Event Chat Works
              </h4>
              <p className="text-xs text-text-sub leading-relaxed">
                The AI chat feature uses this description along with your event's sessions, speakers, 
                exhibitors, sponsors, and ticket information to provide comprehensive answers to attendees' 
                questions. Make sure to include any special instructions or important details that aren't 
                covered in other sections.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Chat Modal */}
      {isTestChatOpen && (
        <div 
          className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeTestChat();
            }
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-stroke-soft flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                  <GetIcon icon="eye" size={20} className="text-primary-base" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main">Test Event Chat</h3>
                  <p className="text-sm text-text-sub">Test the AI chat functionality for your event</p>
                </div>
              </div>
              <button
                onClick={closeTestChat}
                className="p-2 text-text-soft hover:text-text-main hover:bg-bg-weak rounded-lg transition-colors duration-200 flex-shrink-0"
              >
                <GetIcon icon="close" size={20} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Chat Input */}
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Ask a question about your event
                </label>
                <div className="flex gap-3">
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="e.g., What sessions are available? Who are the speakers? What tickets can I buy?"
                    rows={3}
                    className="flex-1 px-4 py-3 border border-stroke-soft rounded-lg text-sm text-text-main bg-bg-white resize-none focus:border-stroke-strong focus:outline-none focus:ring-2 focus:ring-primary-light transition-all duration-200"
                  />
                  <Button
                    ClickEvent={sendTestMessage}
                    isDisabled={!chatMessage.trim() || isChatLoading}
                    value={isChatLoading ? "Sending..." : "Send"}
                    type="primary"
                    icon={isChatLoading ? "loading" : "send"}
                  />
                </div>
              </div>

              {/* Chat Response */}
              {chatResponse && (
                <div className="bg-bg-weak rounded-lg border border-stroke-soft p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GetIcon icon="bot" size={16} className="text-primary-base" />
                    <span className="text-sm font-medium text-text-main">AI Response</span>
                  </div>
                  <div 
                    className="text-sm text-text-main leading-relaxed prose prose-sm max-w-none max-h-96 overflow-y-auto [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-2 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic"
                    dangerouslySetInnerHTML={{ __html: chatResponse }}
                  />
                </div>
              )}

              {/* Loading State */}
              {isChatLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-text-sub">
                    <GetIcon icon="loading" size={20} className="animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              )}

              {/* Help Text */}
              {!chatResponse && !isChatLoading && (
                <div className="bg-bg-weak rounded-lg border border-stroke-soft p-4">
                  <div className="flex items-start gap-3">
                    <GetIcon icon="info" size={16} className="text-primary-base mt-0.5" />
                    <div className="text-sm text-text-sub">
                      <p className="font-medium text-text-main mb-1">Try asking questions like:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>"What sessions are available today?"</li>
                        <li>"Who are the speakers at this event?"</li>
                        <li>"What tickets can I purchase?"</li>
                        <li>"Tell me about the exhibitors"</li>
                        <li>"What are the event details?"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-stroke-soft bg-bg-weak flex-shrink-0">
              <Button
                ClickEvent={closeTestChat}
                value="Close"
                type="secondary"
                icon="close"
              />
            </div>
          </div>
        </div>
      )}
    </RowContainer>
  );
};

export default EventChat;