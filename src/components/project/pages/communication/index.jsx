import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import { PageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import { Button } from "../../../core/elements";
import { useToast } from "../../../core/toast";
import { postData } from "../../../../backend/api";

const Communication = (props) => {
  const toast = useToast();
  const [loadingStates, setLoadingStates] = useState({
    instasnap: false,
    instarecap: false,
  });
  const [currentEventId, setCurrentEventId] = useState(null);

  // Update page title
  useEffect(() => {
    document.title = `Notifications - EventHex Portal`;
  }, []);

  // Get current event ID from props
  useEffect(() => {
    const eventId = props?.openData?.data?._id || props?.data?._id || props?.eventId || new URLSearchParams(window.location.search).get("event");

    if (eventId) {
      setCurrentEventId(eventId);
    } else {
      console.log("No event ID found in props");
    }
  }, [props]);

  // Notification data - only supported types from backend
  const notifications = [
    {
      id: 1,
      title: "Instansnap",
      content: "This will send notification to all registered instasnap user",
      messageType: "instasnap",
    },
    {
      id: 2,
      title: "InstaRecap",
      content: "This will send notification to all registered instarecap user",
      messageType: "instarecap",
    },
  ];

  // Handle send notification
  const handleSendNotification = async (notification) => {
    console.log("Button clicked!", notification);

    if (!currentEventId) {
      console.log("No event ID found:", currentEventId);
      toast.error("Event ID not found. Please refresh the page and try again.");
      return;
    }

    console.log("Starting notification send process...");
    setLoadingStates((prev) => ({ ...prev, [notification.messageType]: true }));

    try {
      const payload = {
        eventId: currentEventId,
        messageType: notification.messageType,
      };

      console.log(`Sending notification: ${notification.title}`, payload);
      console.log("API endpoint: ticket-registration/marketing/bulk");

      const response = await postData(payload, "ticket-registration/marketing/bulk");

      console.log("API Response:", response);

      if (response.status === 200) {
        toast.success(`${notification.title} notification sent successfully!`);
      } else {
        toast.error(`Failed to send ${notification.title} notification. Please try again.`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(`Error sending ${notification.title} notification. Please try again.`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [notification.messageType]: false }));
    }
  };

  return (
    <RowContainer className="data-layout">
      {/* Header Section */}
      <div className="text-center mb-8">
        <PageHeader title="Notifications" description="Send notifications to your audience" line={false} />
      </div>

      {/* Notifications Cards */}
      <div className="max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-bg-white rounded-lg border border-stroke-soft p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Notification Title */}
              <h3 className="text-lg font-semibold text-text-main mb-2">{notification.title}</h3>

              {/* Content Description */}
              <p className="text-sm text-text-sub mb-6">{notification.content}</p>

              {/* Send Button */}
              <div className="flex justify-center">
                <Button
                  ClickEvent={() => handleSendNotification(notification)}
                  isDisabled={loadingStates[notification.messageType] || !currentEventId}
                  className={`px-8 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 ${
                    loadingStates[notification.messageType] || !currentEventId ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-primary-base hover:bg-primary-dark text-white"
                  }`}
                  value={loadingStates[notification.messageType] ? "Sending..." : "Send"}
                  type="primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </RowContainer>
  );
};

export default Layout(Communication);
