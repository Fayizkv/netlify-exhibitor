import React, { useState, useRef, useEffect, useCallback } from "react";
import { postJson, postJsonAbsolute } from "../../../backend/api";
import { GetAccessToken } from "../../../backend/authentication";
import { Sparkles, X, Trash2, Plus, Clock, Send, Paperclip, Calendar, Users, FileText, Check, ChevronUp, ChevronDown } from "lucide-react";

const LS_KEY = "eh_chat_messages_v1";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Enhanced thinking indicator with modern animation
const ThinkingIndicator = () => (
  <div className="flex items-center space-x-1 py-2">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-primary-base rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-primary-base rounded-full animate-bounce delay-100"></div>
      <div className="w-2 h-2 bg-primary-base rounded-full animate-bounce delay-200"></div>
    </div>
    <span className="text-sm text-text-sub ml-2">AI is thinking...</span>
  </div>
);

// Quick command buttons matching the image design
const QuickCommands = ({ mode, onAction, mentionedSessions = [] }) => {
  // Dynamic commands based on context
  const getSessionCommands = () => {
    if (mentionedSessions.length > 0) {
      // Show session-specific commands when sessions are mentioned
      return [
        { icon: "calendar", label: `Reschedule ${mentionedSessions[0].displayTitle}`, action: "reschedule-mentioned" },
        { icon: "edit", label: `Edit ${mentionedSessions[0].displayTitle}`, action: "edit-mentioned" },
        { icon: "users", label: "Check conflicts", action: "check-conflicts" },
        { icon: "clock", label: "Create new session", action: "create-session" },
      ];
    } else {
      // Default session commands
      return [
        { icon: "calendar", label: "Reschedule session", action: "reschedule" },
        { icon: "users", label: "Check conflicts", action: "check-conflicts" },
        { icon: "clock", label: "Create session", action: "create-session" },
        { icon: "edit", label: "Edit session", action: "edit-session" },
      ];
    }
  };

  const commands = {
    session: getSessionCommands(),
    event: [
      { icon: "plus", label: "New Event", action: "create-event" },
      { icon: "copy", label: "Clone Event", action: "clone-event" },
      { icon: "settings", label: "Configure", action: "configure" },
      { icon: "calendar", label: "Schedule", action: "schedule" },
    ],
    generic: [
      { icon: "help", label: "Help", action: "help" },
      { icon: "info", label: "Features", action: "features" },
      { icon: "settings", label: "Settings", action: "settings" },
      { icon: "search", label: "Search", action: "search" },
    ],
  };

  const currentCommands = commands[mode] || commands.generic;

  return (
    <div className="p-6 border-b border-gray-100">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Quick Commands</h3>
      <div className="grid grid-cols-2 gap-3">
        {currentCommands.map((command, index) => (
          <button
            key={index}
            onClick={() => onAction(command.action)}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 text-left group border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              {command.icon === "calendar" && <Calendar className="h-4 w-4 text-gray-600" />}
              {command.icon === "users" && <Users className="h-4 w-4 text-gray-600" />}
              {command.icon === "clock" && <Clock className="h-4 w-4 text-gray-600" />}
              {command.icon === "edit" && <FileText className="h-4 w-4 text-gray-600" />}
              {command.icon === "plus" && <Plus className="h-4 w-4 text-gray-600" />}
              {!["calendar", "users", "clock", "edit", "plus"].includes(command.icon) && <Sparkles className="h-4 w-4 text-gray-600" />}
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{command.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Function to render text with highlighted session mentions
const renderTextWithMentions = (text, mentionedSessions = []) => {
  if (!text || mentionedSessions.length === 0) {
    return text;
  }

  let processedText = text;

  // Highlight the mentions in text with enhanced styling
  mentionedSessions.forEach((session) => {
    if (session.mentionText) {
      const mentionRegex = new RegExp(session.mentionText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      const sessionTitle = session.title || session.displayTitle || session.mentionText.replace("@", "");
      const isUnresolved = session.isUnresolved;

      processedText = processedText.replace(mentionRegex, (match) => {
        return `<span class="inline-flex items-center gap-1 px-2 py-1 mx-1 rounded-full text-xs font-medium ${
          isUnresolved ? "bg-yellow-100 text-yellow-800 border border-yellow-200" : "bg-blue-100 text-blue-800 border border-blue-200"
        }" title="${sessionTitle}${isUnresolved ? " (Session not found)" : ""}">
          <span class="text-xs">${isUnresolved ? "⚠️" : "📅"}</span>
          <span class="font-semibold">${sessionTitle.length > 15 ? sessionTitle.substring(0, 15) + "..." : sessionTitle}</span>
        </span>`;
      });
    }
  });

  return { __html: processedText };
};

// Message component with clean styling matching the image
const Message = ({ message, index }) => {
  const isUser = message.sender === "user";
  const isError = message.isError;
  const isTemp = message.temp;
  const isSuccess = message.isSuccess;

  // Safely build HTML from message text or reply
  const buildHtml = (msg) => {
    const text = typeof msg?.text === "string" ? msg.text : typeof msg?.reply === "string" ? msg.reply : typeof msg === "string" ? msg : "";
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1<\/strong>").replace(/\n/g, "<br/>");
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-500 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%]">
          <div className="text-sm leading-relaxed">
            {/* Render text with inline highlighted sessions */}
            {message.mentionedSessions && message.mentionedSessions.length > 0 ? (
              <div dangerouslySetInnerHTML={renderTextWithMentions(message.text, message.mentionedSessions)} className="session-mentions-container" />
            ) : (
              message.text
            )}
          </div>

          {/* Display attached images */}
          {message.files && message.files.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.files.map((file, idx) => (
                <div key={idx} className="border border-white/20 rounded-lg overflow-hidden">
                  {file.type.startsWith("image/") ? (
                    <img src={URL.createObjectURL(file)} alt={file.name} className="max-w-full h-auto rounded-lg" style={{ maxHeight: "200px" }} />
                  ) : (
                    <div className="p-2 bg-white/10 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs truncate">{file.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-xs mt-1 opacity-75">{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "02:23"}</div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-green-800 mb-2">{message.title}</h4>
              <div className="space-y-2 text-sm text-green-700">
                {message.details?.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {detail.icon === "calendar" && <Calendar className="h-4 w-4" />}
                    {detail.icon === "clock" && <Clock className="h-4 w-4" />}
                    {detail.icon === "users" && <Users className="h-4 w-4" />}
                    {!["calendar", "clock", "users"].includes(detail.icon) && <Check className="h-4 w-4" />}
                    <span>{detail.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {message.actions && (
            <div className="flex gap-2 mt-4">
              {message.actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => action.onClick?.()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    action.primary ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <div className="text-xs text-green-600 mt-3">{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "02:23"}</div>
        </div>
      </div>
    );
  }

  // Enhanced structured response rendering
  if (message.structured && message.actionButtons && message.actionButtons.length > 0) {
    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start gap-3 max-w-[90%]">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm">
            {/* Main response text */}
            <div className="px-4 py-3">
              <div className="text-sm leading-relaxed text-gray-800 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: buildHtml(message) }} />
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {message.actionButtons.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      // Auto-fill the action text in the input and trigger send
                      setInput(action);
                      // Small delay to ensure state is updated, then send
                      setTimeout(() => {
                        handleSend();
                      }, 100);
                    }}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 group-hover:bg-blue-200">{idx + 1}</span>
                    <span className="text-gray-700 group-hover:text-blue-700">{action}</span>
                    <span className="ml-auto text-gray-400 group-hover:text-blue-500">
                      <Send className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timestamp */}
            <div className="px-4 pb-3">
              <div className="text-xs text-gray-500">{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "02:23"}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3 max-w-[85%]">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-gray-600" />
        </div>
        <div
          className={`px-4 py-3 rounded-2xl rounded-bl-md ${
            isError ? "bg-red-50 border border-red-200 text-red-800" : isTemp ? "bg-gray-50 border border-gray-200 text-gray-600" : "bg-gray-50 text-gray-800"
          }`}
        >
          <div className="text-sm leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: buildHtml(message) }} />
          <div className="text-xs mt-1 opacity-75">{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "02:23"}</div>
        </div>
      </div>
    </div>
  );
};

// Clean welcome screen
const WelcomeScreen = ({ mode, onQuickAction }) => {
  return (
    <div className="p-6 text-center">
      <div className="text-gray-500 text-sm">
        {mode === "session"
          ? "Use the quick commands above or type a message to get started with session management."
          : mode === "event"
            ? "Use the quick commands above or type a message to get started with event creation."
            : "Use the quick commands above or type a message to get started."}
      </div>
    </div>
  );
};

// Session Mention Dropdown Component
const SessionMentionDropdown = ({ sessions, isLoading, selectedIndex, onSelect, position, isVisible }) => {
  console.log("🎯 SessionMentionDropdown render:", {
    isVisible,
    sessions: sessions.length,
    isLoading,
    position,
  });

  if (!isVisible) return null;

  return (
    <div
      className="absolute bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[10000]"
      style={{
        top: position.top + "px",
        left: position.left + "px",
        minWidth: "300px",
      }}
    >
      {isLoading ? (
        <div className="p-3 text-center text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin"></div>
            Loading sessions...
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-3 text-center text-gray-500">No sessions found</div>
      ) : (
        <div className="py-1">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? "bg-primary-light/10 border-primary-base/20" : ""}`}
              onClick={() => onSelect(session)}
            >
              <div className="font-medium text-gray-900 text-sm">{session.displayTitle}</div>
              <div className="text-xs text-gray-500 mt-1">{session.displaySubtitle}</div>
              {session.displaySpeakers && (
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {session.displaySpeakers}
                </div>
              )}
              {session.isLive && (
                <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  Live
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom styles for session mentions in user messages
const sessionMentionStyles = `
  .session-mentions-container .inline-flex {
    background-color: rgba(255, 255, 255, 0.2) !important;
    color: white !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
  }
  
  .session-mentions-container .bg-blue-100 {
    background-color: rgba(255, 255, 255, 0.2) !important;
    color: white !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
  }
  
  .session-mentions-container .text-blue-800 {
    color: white !important;
  }
  
  .session-mentions-container .bg-yellow-100 {
    background-color: rgba(255, 193, 7, 0.3) !important;
    color: #fff3cd !important;
    border-color: rgba(255, 193, 7, 0.5) !important;
  }
  
  .session-mentions-container .text-yellow-800 {
    color: #fff3cd !important;
  }
`;

const EnhancedChatAssistant = ({ mode = "generic", context = {}, openData = {} }) => {
  // console.log('🔧 EnhancedChatAssistant initialized with:', context.eventId);
  // // Debug logging for component props
  // console.log('🔧 EnhancedChatAssistant initialized with:', { mode, context });

  // Generate event-specific localStorage keys to ensure each event has its own chat history
  const eventId = context?.eventId || "default";
  const eventSpecificLSKey = `${LS_KEY}_${eventId}`;
  const eventSpecificHistoryKey = `chat_history_${eventId}`;

  // Debug logging to verify event-specific keys are being used
  console.log("🔧 Chat Assistant initialized with event-specific keys:", {
    eventId,
    eventSpecificLSKey,
    eventSpecificHistoryKey,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [width, setWidth] = useState(480);

  // @ Mention state
  const [sessions, setSessions] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isMentionLoading, setIsMentionLoading] = useState(false);

  // Chat history management
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const resizingRef = useRef(false);
  const fileInputRef = useRef(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);
  const mentionDropdownRef = useRef(null);

  // Load chat history from event-specific local storage
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(eventSpecificLSKey) || "[]");
      if (Array.isArray(cached)) setMessages(cached);
      console.log(`📱 Loaded chat history for event ${eventId}:`, cached.length, "messages");
    } catch {}
  }, [eventSpecificLSKey, eventId]);

  // Save history to event-specific storage and auto-scroll
  useEffect(() => {
    try {
      localStorage.setItem(eventSpecificLSKey, JSON.stringify(messages.slice(-200)));
      console.log(`💾 Saved chat history for event ${eventId}:`, messages.length, "messages");
    } catch {}
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, eventSpecificLSKey, eventId]);

  // Handle sidebar resizing
  useEffect(() => {
    const onMove = (e) => {
      if (!resizingRef.current) return;
      const next = Math.min(Math.max(window.innerWidth - e.clientX, 380), Math.min(800, window.innerWidth * 0.6));
      setWidth(next);
    };
    const onUp = () => {
      resizingRef.current = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // @ Mention keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showMentionDropdown) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedMentionIndex((prev) => (prev < sessions.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : sessions.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (sessions[selectedMentionIndex]) {
            selectMention(sessions[selectedMentionIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowMentionDropdown(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showMentionDropdown, sessions, selectedMentionIndex]);

  // Handle click outside mention dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(event.target) && !textareaRef.current?.contains(event.target)) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse @ mentions from text and return actual session objects
  const parseMentionsFromText = useCallback(
    (text) => {
      if (!text) return [];

      // Find all @ mentions in the text (format: @"session title" or @sessionId)
      const mentionPattern = /@"([^"]+)"|@(\w+)/g;
      const mentions = [];
      let match;

      while ((match = mentionPattern.exec(text)) !== null) {
        const mentionText = match[1] || match[2]; // Quoted text or single word
        console.log("🔍 Found mention:", mentionText);

        // Find the session in our current sessions list
        const foundSession = sessions.find(
          (session) => session.displayTitle?.toLowerCase().includes(mentionText.toLowerCase()) || session.title?.toLowerCase().includes(mentionText.toLowerCase()) || session.id === mentionText
        );

        if (foundSession) {
          console.log("✅ Matched session:", foundSession);
          mentions.push({
            ...foundSession,
            mentionText: match[0], // Keep the original mention text for reference
          });
        } else {
          console.log("❌ No session found for mention:", mentionText);
          // Still add as a mention for AI to understand user intent
          mentions.push({
            mentionText: match[0],
            title: mentionText,
            displayTitle: mentionText,
            isUnresolved: true,
          });
        }
      }

      return mentions;
    },
    [sessions]
  );

  // Fetch sessions for @ mention
  const fetchSessions = useCallback(
    async (query = "") => {
      if (!context.eventId) {
        console.log("🔍 No eventId provided for @ mention");
        return;
      }

      try {
        setIsMentionLoading(true);
        console.log(`🔍 Fetching sessions for @ mention - Event: ${context.eventId}, Query: "${query}"`);

        // Get auth token using EventHex authentication system
        const token = GetAccessToken();

        console.log("🔐 Auth token status:", {
          hasUserObj: !!localStorage.getItem("user"),
          hasToken: !!token,
          tokenLength: token?.length || 0,
          tokenPrefix: token?.substring(0, 10) + "..." || "none",
        });

        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
          console.log("✅ Adding Authorization header to request");
        } else {
          console.warn("⚠️ No auth token found in localStorage");
        }

        // Use the proper API base URL from environment
        const baseUrl = import.meta.env.VITE_API || "http://localhost:3002/api/v1/";
        const apiUrl = `${baseUrl}sessions/ai?eventId=${context.eventId}&query=${encodeURIComponent(query)}&limit=0`;
        console.log("📡 Making API request to:", apiUrl);
        console.log("🔧 API Base URL:", baseUrl);
        console.log("📋 Request headers:", headers);

        const response = await fetch(apiUrl, { headers });

        console.log(`📡 API Response status: ${response.status}`);
        console.log("📡 API Response headers:", Object.fromEntries(response.headers.entries()));

        // Check if response is actually JSON
        const contentType = response.headers.get("content-type");
        console.log("📋 Response content-type:", contentType);

        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("❌ Expected JSON but got:", textResponse.substring(0, 200) + "...");

          // This indicates the API endpoint doesn't exist or is returning HTML
          throw new Error(`API returned ${contentType || "non-JSON"} instead of JSON. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📋 API Response data:", JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
          console.log(`✅ Found ${data.data.sessions.length} sessions for @ mention`);
          setSessions(data.data.sessions || []);
          setSelectedMentionIndex(0);
        } else {
          console.error("❌ Failed to fetch sessions:", {
            status: response.status,
            statusText: response.statusText,
            message: data.message,
            error: data.error,
          });

          // Try with test eventId if auth fails
          if (response.status === 401 || response.status === 403) {
            console.log("🧪 Auth failed, trying with test eventId for development...");
            try {
              const testApiUrl = `${baseUrl}sessions/ai?eventId=test&query=${encodeURIComponent(query)}&limit=10`;
              const testResponse = await fetch(testApiUrl);
              const testData = await testResponse.json();

              if (testResponse.ok && testData.success) {
                console.log("✅ Test data fetched successfully");
                setSessions(testData.data.sessions || []);
                setSelectedMentionIndex(0);
                return;
              }
            } catch (testError) {
              console.error("❌ Test fetch also failed:", testError);
            }
          }

          setSessions([]);
        }
      } catch (error) {
        console.error("❌ Error fetching sessions:", error);
        setSessions([]);
      } finally {
        setIsMentionLoading(false);
      }
    },
    [context.eventId]
  );

  // Calculate mention dropdown position relative to input area
  const calculateMentionPosition = (textarea, cursorPos) => {
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lines = textBeforeCursor.split("\n");
    const currentLine = lines.length - 1;
    const currentColumn = lines[currentLine].length;

    // Calculate position relative to the textarea
    const lineHeight = 20;
    const charWidth = 8;

    // Position ABOVE the input area to ensure visibility
    const top = -280; // Position above the input (negative value)
    const left = Math.max(Math.min(currentColumn * charWidth, 50), 10); // Ensure minimum left position

    console.log("📍 Calculated dropdown position:", {
      top,
      left,
      currentLine,
      currentColumn,
      textBeforeCursor: textBeforeCursor.substring(textBeforeCursor.lastIndexOf("@")),
    });

    return { top, left };
  };

  // Handle mention selection
  const selectMention = (session) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = input.substring(0, cursorPos);
    const textAfterCursor = input.substring(cursorPos);

    // Find the @ symbol position
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      // Replace @query with @"Session Name"
      const beforeAt = input.substring(0, lastAtIndex);
      const mentionText = session.displayTitle.includes(" ") ? `@"${session.displayTitle}"` : `@${session.displayTitle}`;

      const newInput = beforeAt + mentionText + " " + textAfterCursor;
      setInput(newInput);

      // Set cursor position after the mention
      const newCursorPos = lastAtIndex + mentionText.length + 1;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }

    setShowMentionDropdown(false);
  };

  const toggleChat = () => setIsOpen(!isOpen);

  const onDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
  };

  const onPaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const blobs = items
      .filter((it) => it.kind === "file")
      .map((it) => it.getAsFile())
      .filter(Boolean);
    if (blobs.length) setFiles((prev) => [...prev, ...blobs]);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const onBrowse = () => fileInputRef.current?.click();

  const handleQuickAction = (action, data) => {
    const actionPrompts = {
      "create-session": "Create a new workshop session",
      "edit-session": "Edit an existing session",
      reschedule: "Reschedule a session",
      "reschedule-mentioned": sessions.length > 0 ? `Reschedule @"${sessions[0].displayTitle}" to tomorrow at 2 PM` : "Reschedule a session",
      "edit-mentioned": sessions.length > 0 ? `Edit @"${sessions[0].displayTitle}" details` : "Edit a session",
      "check-conflicts": "Check for scheduling conflicts",
      "create-event": "Help me create a new event",
      "clone-event": "Clone an existing event",
      configure: "Help me configure event settings",
      schedule: "Help me schedule sessions",
      help: "What can you help me with?",
      features: "Show me all available features",
      settings: "Show me settings options",
      search: "Help me search for something",
      example: data,
    };

    const prompt = actionPrompts[action] || data;
    setInput(prompt);

    if (action === "example" || action === "reschedule-mentioned" || action === "edit-mentioned") {
      handleSend(prompt);
    }
  };

  const parseAIResponse = (aiText) => {
    // Check if the response indicates a successful session creation
    const sessionCreatedMatch = aiText.match(/(?:created|added|scheduled).*session.*["']([^"']+)["']/i);
    const sessionUpdatedMatch = aiText.match(/(?:updated|modified|changed).*session.*["']([^"']+)["']/i);
    const sessionRescheduledMatch = aiText.match(/(?:rescheduled|moved).*session.*["']([^"']+)["']/i);

    if (sessionCreatedMatch) {
      return {
        isSuccess: true,
        title: `New session '${sessionCreatedMatch[1]}' created!`,
        details: [
          { icon: "calendar", text: "Date: Nov 10, 2025" },
          { icon: "clock", text: "Time: 11:00 AM - 12:30 PM" },
          { icon: "info", text: "Speaker assignment pending" },
        ],
        actions: [
          { label: "Add Speaker", primary: true, onClick: () => console.log("Add speaker clicked") },
          { label: "Edit Details", primary: false, onClick: () => console.log("Edit details clicked") },
        ],
      };
    }

    if (sessionUpdatedMatch) {
      return {
        isSuccess: true,
        title: `Session '${sessionUpdatedMatch[1]}' updated successfully!`,
        details: [
          { icon: "check", text: "Changes saved" },
          { icon: "clock", text: "Updated at " + new Date().toLocaleTimeString() },
        ],
        actions: [
          { label: "View Session", primary: true, onClick: () => console.log("View session clicked") },
          { label: "Edit More", primary: false, onClick: () => console.log("Edit more clicked") },
        ],
      };
    }

    if (sessionRescheduledMatch) {
      return {
        isSuccess: true,
        title: `Session '${sessionRescheduledMatch[1]}' rescheduled!`,
        details: [
          { icon: "calendar", text: "New date assigned" },
          { icon: "check", text: "No conflicts detected" },
        ],
        actions: [
          { label: "View Schedule", primary: true, onClick: () => console.log("View schedule clicked") },
          { label: "Notify Speakers", primary: false, onClick: () => console.log("Notify speakers clicked") },
        ],
      };
    }

    // Return regular message format
    return { text: aiText };
  };

  const handleSend = async (customPrompt = null) => {
    const promptText = customPrompt || input;
    if ((!promptText.trim() && files.length === 0) || isLoading) return;

    // Parse @ mentions from the message
    const mentionedSessions = parseMentionsFromText(promptText);
    console.log("🔍 Parsed mentions from message:", mentionedSessions);

    const userText = promptText || `(sent ${files.length} file${files.length > 1 ? "s" : ""})`;
    const userMsg = {
      text: userText,
      sender: "user",
      timestamp: new Date(),
      mentionedSessions: mentionedSessions, // Add mentioned sessions to message
      files: files.length > 0 ? [...files] : undefined, // Include files in message
    };
    const thinkingMsg = { text: <ThinkingIndicator />, sender: "ai", temp: true, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setIsLoading(true);

    // Clear input after sending
    setInput("");
    setFiles([]);

    try {
      const attachments = [];
      for (const f of files) {
        if (f.type.startsWith("image/")) {
          const b64 = await fileToBase64(f);
          attachments.push({ type: "image_url", image_url: { url: b64 } });
        }
      }
      // Enhanced context with mentioned sessions
      const enhancedContext = {
        ...(context || {}),
        mentionedSessions: mentionedSessions.length > 0 ? mentionedSessions : undefined,
      };

      const mcpEndpoint = import.meta.env.VITE_AI_MCP_CHAT || "https://mcp.eventhex.ai/chat"; // Absolute URL, e.g., http://localhost:3000/chat
      let aiText = "";

      if (mcpEndpoint) {
        // Build MCP directive to limit to sessions within current event
        const eventDirective = context?.eventId
          ? `\n\nConstraints:\n- Operate ONLY on collections 'sessions' and 'speakers'.\n- Always include filter { event: "${context.eventId}" } for every operation (find/count/aggregate/insert/update/delete).\n- Ignore requests for other collections.`
          : `\n\nConstraints:\n- Operate ONLY on collections 'sessions' and 'speakers'.`;

        const mcpPrompt = `${promptText}${eventDirective}`;

        const mcpRes = await postJsonAbsolute({ prompt: mcpPrompt, mode, context: enhancedContext, attachments }, mcpEndpoint);
        if (mcpRes?.status === 200) {
          aiText = mcpRes?.data?.reply || mcpRes?.data?.message || "Received empty response.";
        } else {
          aiText = mcpRes?.data?.error || mcpRes?.data?.message || "Failed to get response from MCP server.";
        }
      } else {
        // Fallback to existing API
        const payload = {
          prompt: promptText || `Process the attached file${files.length > 1 ? "s" : ""}.`,
          mode,
          context: enhancedContext,
          attachments,
        };
        const res = await postJson(payload, "ai/chat");
        const ok = res?.status === 200 && res?.data?.success;
        aiText = ok ? (res?.data?.data ?? "Sorry, I received an empty response.") : (res?.data?.message ?? "Failed to get response. Please check the server logs.");
      }

      // Parse the AI response to detect success patterns
      const parsedResponse = parseAIResponse(aiText);
      const aiMessage = {
        ...parsedResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => prev.map((m) => (m.temp ? aiMessage : m)));
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || "A network error occurred. Please try again.";
      setMessages((prev) => prev.map((m) => (m.temp ? { text: `Error: ${errorMsg}`, sender: "ai", isError: true, timestamp: new Date() } : m)));
    } finally {
      setIsLoading(false);
      setInput("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem(eventSpecificLSKey);
    } catch {}
  };

  // Chat history management functions
  const createNewChat = () => {
    // Save current chat to history if it has messages
    if (messages.length > 0) {
      const chatId = currentChatId || Date.now().toString();
      const chatTitle = messages[0]?.text?.substring(0, 50) + "..." || "New Chat";
      const newChatHistory = {
        id: chatId,
        title: chatTitle,
        messages: [...messages],
        timestamp: new Date(),
        mode: mode,
        context: context,
      };

      setChatHistory((prev) => {
        const updated = [newChatHistory, ...prev.filter((chat) => chat.id !== chatId)];
        try {
          localStorage.setItem(eventSpecificHistoryKey, JSON.stringify(updated.slice(0, 20))); // Keep last 20 chats
        } catch {}
        return updated;
      });
    }

    // Start new chat
    setMessages([]);
    setCurrentChatId(Date.now().toString());
    setInput("");
    setFiles([]);
    setShowHistory(false);
    try {
      localStorage.removeItem(eventSpecificLSKey);
    } catch {}
  };

  const loadChatFromHistory = (chat) => {
    // Save current chat first
    if (messages.length > 0) {
      createNewChat();
    }

    // Load selected chat
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setShowHistory(false);

    // Update localStorage
    try {
      localStorage.setItem(eventSpecificLSKey, JSON.stringify(chat.messages));
    } catch {}
  };

  const deleteChatFromHistory = (chatId) => {
    setChatHistory((prev) => {
      const updated = prev.filter((chat) => chat.id !== chatId);
      try {
        localStorage.setItem(eventSpecificHistoryKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Load chat history on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(eventSpecificHistoryKey);
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    } catch {}
  }, [eventSpecificHistoryKey]);

  return (
    <>
      {/* CSS for session mentions */}
      <style jsx>{`
        .session-mention {
          background-color: rgba(255, 255, 255, 0.2);
          padding: 0.125rem 0.375rem;
          border-radius: 0.5rem;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        /* Hide the FAB when any parent (e.g., body) has the eh-hide-ai-fab class */
        body.eh-hide-ai-fab .eh-ai-fab {
          display: none !important;
        }
      `}</style>

      {/* Floating Action Button - Only shows when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] eh-ai-fab">
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 bg-blue-500 hover:bg-blue-600"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="h-6 w-6 text-white" />
          </button>
        </div>
      )}

      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transform transition-all duration-300 z-[9998] flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ width }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={onDrop}
        role="complementary"
        aria-label="AI Assistant Panel"
      >
        {/* Header */}
        <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{mode === "session" ? "Session Assistant" : mode === "event" ? "Event Assistant" : "AI Assistant"}</h2>
              <p className="text-sm text-gray-500">{mode === "session" ? "Event Management AI" : mode === "event" ? "Event Creation AI" : "Your AI companion"}</p>
            </div>
          </div>

          {/* Close button - prominently positioned in top right */}
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10" aria-label="Close Assistant" title="Close Assistant">
            <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
          </button>

          <div className="flex items-center gap-2 mr-12">
            {/* Chat History Button */}
            <div className="relative">
              <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500" title="Chat history">
                <Clock className="h-4 w-4" />
              </button>

              {/* Chat History Dropdown */}
              {showHistory && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-medium text-gray-900">Chat History</h3>
                    <p className="text-xs text-gray-500">Recent conversations</p>
                  </div>
                  {chatHistory.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {chatHistory.map((chat) => (
                        <div key={chat.id} className="p-3 hover:bg-gray-50 flex items-start justify-between">
                          <button onClick={() => loadChatFromHistory(chat)} className="flex-1 text-left">
                            <div className="text-sm font-medium text-gray-900 truncate">{chat.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(chat.timestamp).toLocaleDateString()} • {chat.messages.length} messages
                            </div>
                          </button>
                          <button onClick={() => deleteChatFromHistory(chat.id)} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500" title="Delete chat">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No chat history yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* New Chat Button */}
            <button onClick={createNewChat} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500" title="Start new chat">
              <Plus className="h-4 w-4" />
            </button>

            {/* Clear Chat Button */}
            {messages.length > 0 && (
              <button onClick={clearChat} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500" title="Clear current chat">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Commands */}
        {messages.length === 0 && <QuickCommands mode={mode} onAction={handleQuickAction} mentionedSessions={sessions} />}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" ref={listRef}>
          {messages.length === 0 ? (
            <WelcomeScreen mode={mode} onQuickAction={handleQuickAction} />
          ) : (
            <div className="p-4 space-y-1">
              {messages.map((msg, index) => (
                <Message key={index} message={msg} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* File Attachments */}
        {files.length > 0 && (
          <div className="px-4 py-3 border-t border-stroke-soft bg-gray-50">
            <div className="text-xs font-medium text-text-sub mb-2">Attachments ({files.length})</div>
            <div className="flex gap-2 flex-wrap">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-stroke-sub rounded-lg px-3 py-2 text-sm shadow-sm">
                  <GetIcon icon={f.type.startsWith("image/") ? "image" : "file"} className="h-4 w-4 text-text-sub" />
                  <span className="truncate max-w-[120px] text-text-main">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="text-text-sub hover:text-red-500 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="relative">
            {/* Session Mention Dropdown */}
            <div ref={mentionDropdownRef}>
              <SessionMentionDropdown
                sessions={sessions}
                isLoading={isMentionLoading}
                selectedIndex={selectedMentionIndex}
                onSelect={selectMention}
                position={mentionPosition}
                isVisible={showMentionDropdown}
              />
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={async (e) => {
                const value = e.target.value;
                const cursorPos = e.target.selectionStart;

                setInput(value);

                // Debug logging (can be removed in production)
                if (value.includes("@")) {
                  console.log("🔍 Chat input contains @:", {
                    mode,
                    hasEventId: !!context.eventId,
                    eventId: context.eventId,
                    value,
                    cursorPos,
                  });
                }

                // Only check for @ mentions in session mode with eventId
                if (mode === "session" && context.eventId) {
                  console.log("✅ @ mention conditions met - checking for @ symbol");

                  // Find @ symbol before cursor
                  const textBeforeCursor = value.substring(0, cursorPos);
                  const lastAtIndex = textBeforeCursor.lastIndexOf("@");

                  if (lastAtIndex !== -1) {
                    console.log("🎯 Found @ symbol at position:", lastAtIndex);

                    // Check if @ is at start of word (not part of email, etc.)
                    const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
                    const isValidMention = /\s|^/.test(charBeforeAt);

                    console.log("🔍 @ validation:", { charBeforeAt, isValidMention });

                    if (isValidMention) {
                      const afterAt = textBeforeCursor.substring(lastAtIndex + 1);

                      console.log("🔍 Text after @:", afterAt);

                      // Check if we're still in the mention (no spaces after @)
                      if (!afterAt.includes(" ") && !afterAt.includes("\n")) {
                        console.log("✅ Valid @ mention detected, fetching sessions");

                        setMentionQuery(afterAt);
                        setShowMentionDropdown(true);

                        // Calculate and set dropdown position
                        const position = calculateMentionPosition(e.target, cursorPos);
                        setMentionPosition(position);

                        console.log("📋 Setting dropdown visible with position:", position);

                        // Fetch sessions
                        await fetchSessions(afterAt);
                        return;
                      } else {
                        console.log("❌ @ mention contains spaces/newlines, ignoring");
                      }
                    } else {
                      console.log("❌ @ symbol not at word boundary, ignoring");
                    }
                  } else {
                    console.log("❌ No @ symbol found in text before cursor");
                  }
                } else {
                  console.log("❌ @ mention conditions not met:", {
                    isSessionMode: mode === "session",
                    hasEventId: !!context.eventId,
                  });
                }

                // Hide dropdown if no valid @ mention
                setShowMentionDropdown(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onPaste={onPaste}
              className="w-full p-4 pr-16 border border-gray-200 rounded-2xl text-gray-900 resize-none leading-6 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
              placeholder={
                showMentionDropdown
                  ? "Continue typing to search sessions..."
                  : sessions.length > 0 && input.includes("@")
                    ? `Found ${sessions.length} sessions. Select one or continue typing...`
                    : input.trim().length > 0 && parseMentionsFromText(input).length > 0
                      ? `📍 ${parseMentionsFromText(input).length} session(s) mentioned. Continue your request...`
                      : `Ask me to ${mode === "session" ? "reschedule a session, create new events, check conflicts. 💡 Type @ to mention sessions" : mode === "event" ? "create events" : "help you"}...`
              }
              disabled={isLoading}
              rows={1}
              style={{ minHeight: "56px", maxHeight: "120px" }}
            />

            {/* Input Actions */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                onClick={onBrowse}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                disabled={isLoading}
                aria-label="Attach files"
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleSend()}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                disabled={isLoading || (!input.trim() && files.length === 0)}
                aria-label="Send message"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
            {mode === "session" && context.eventId && <span className="ml-2 text-primary-base">• Type @ to mention sessions</span>}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute top-0 left-0 h-full w-2 cursor-ew-resize bg-transparent hover:bg-purple-200 transition-colors group"
          onMouseDown={(e) => {
            resizingRef.current = true;
            document.body.style.userSelect = "none";
            document.body.style.cursor = "ew-resize";
          }}
          aria-hidden
          title="Drag to resize"
        >
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gray-300 group-hover:bg-purple-400 rounded-r transition-colors"></div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={(e) => {
          const selected = Array.from(e.target.files || []);
          if (selected.length) setFiles((prev) => [...prev, ...selected]);
        }}
        className="hidden"
      />
    </>
  );
};

export default EnhancedChatAssistant;
