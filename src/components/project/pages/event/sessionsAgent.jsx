import React from "react";
import { useParams } from "react-router-dom";
import ChatAssistant from "../../../core/assistant/ChatAssistant";

const SessionsAgent = () => {
  const { slug: eventId, id } = useParams();
  // Some routes may use :id, others :slug; prefer id then slug
  const resolvedEventId = id || eventId;
  return <ChatAssistant mode="session" context={{ eventId: resolvedEventId }} />;
};

export default SessionsAgent;
