import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Layout from "../../../core/layout";
import { Search, Send, Circle, Menu, X, MessageSquare } from "lucide-react";
import { getData, postData } from "../../../../backend/api";
import { useChat, createOrGetChatSession } from "e2ee-chat";
import axios from "axios";

const SERVER_URL = "https://datahex-chat-server.azurewebsites.net";

const AnalyseChat = (props) => {
  console.log({ props });
  const [chatSessions, setChatSessions] = useState([]);
  const [userData, setUserData] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // This will store roomId instead of sessionId
  const [messageInput, setMessageInput] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const messagesEndRef = useRef(null);

  // Add scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Find current chat using roomId instead of sessionId
  const currentChat = filteredChats.find((chat) => chat.roomId === activeChat);
  const receiverId = currentChat?.participantId; // Use participantId for the receiver

  // Add function to update unread counts
  const updateChatUnreadCount = (roomId, senderId) => {
    if (senderId !== props.user?.user?._id) {
      setFilteredChats((prev) =>
        prev.map((chat) =>
          chat.roomId === roomId
            ? {
                ...chat,
                unreadCount: (chat.unreadCount || 0) + 1,
              }
            : chat
        )
      );
    }
  };

  // Memoize the fetch unread counts function
  const fetchUnreadCountsData = useCallback(async () => {
    if (chatSessions.length > 0 && props.user?.user?._id) {
      try {
        const timestamp = Date.now();
        const response = await fetch(`${SERVER_URL}/unread-counts/${props.user?.user?._id}?apiKey=eventhex-secret&_t=${timestamp}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            "If-None-Match": "",
          },
        });
        const data = await response.json();

        if (data && typeof data === "object") {
          setFilteredChats((prev) =>
            prev.map((chat) => ({
              ...chat,
              unreadCount: chat.roomId ? data[chat.roomId] || 0 : 0,
            }))
          );

          setChatSessions((prev) =>
            prev.map((session) => ({
              ...session,
              unreadCount: session.roomId ? data[session.roomId] || 0 : 0,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    }
  }, [chatSessions, props.user?.user?._id]);

  // Memoize the handleNewMessage callback
  const handleNewMessage = useCallback(
    (msg) => {
      if (msg.senderId !== props.user?.user?._id) {
        setFilteredChats((prev) => prev.map((chat) => (chat.roomId === msg.roomId ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 } : chat)));
        setChatSessions((prev) => prev.map((session) => (session.roomId === msg.roomId ? { ...session, unreadCount: (session.unreadCount || 0) + 1 } : session)));
      }
    },
    [props.user?.user?._id]
  );

  // Initialize useChat hook
  const { messages, sendMessage, joined, unreadCount, markMessagesAsRead, fetchUnreadCounts } = useChat({
    roomId: currentRoomId,
    userId: props.user?.user?._id,
    receiverId: receiverId,
    userType: props.user?.user?.userType?.role,
    apiKey: "eventhex-secret",
    secretKey: "shared-secret-123",
    serverUrl: SERVER_URL,
    onMessage: handleNewMessage,
  });

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (currentRoomId && props.user?.user?._id && joined) {
      markMessagesAsRead();
    }
  }, [currentRoomId, props.user?.user?._id, joined]);

  // Scroll when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Add pagination states
  const [userPage, setUserPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const USERS_PER_PAGE = 10;

  // Add new state for search
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchResults, setSearchResults] = useState({
    chats: [],
    users: [],
    combined: [],
  });

  // Add state to track avatar image errors
  const [avatarErrorIds, setAvatarErrorIds] = useState([]);

  // Handler for image error
  const handleAvatarError = (id) => {
    setAvatarErrorIds((prev) => [...prev, id]);
  };

  // Function to fetch TicketRegistration data with pagination
  const fetchUserData = async (page = 0, isSearch = false) => {
    try {
      setIsLoadingUsers(true);

      const response = await getData(
        {
          skip: page * USERS_PER_PAGE,
          limit: USERS_PER_PAGE,
          searchkey: searchQuery,
        },
        "ticketRegistration/chat-search"
      );

      if (response.data && response.data.success) {
        const newUsers = response.data.response.map((user) => ({
          id: user._id,
          participantId: user._id, // Add participantId for receiver identification
          name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User",
          avatar: (user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "U")
            .split(" ")
            .map((n) => n[0])
            .join(""),
          lastMessage: "Start a conversation",
          time: "Just now",
          status: user.attendance ? "active" : "inactive",
          unreadCount: 0,
          userImage: user.profileImage || user.companyLogo,
          email: user.emailId,
          mobile: user.mobile,
          type: "user",
          userType: user.userType || "eventhex",
          designation: user.designation,
          companyName: user.companyName,
          ticketNumber: user.ticketNumber,
          formattedTicketNumber: user.formattedTicketNumber,
          event: user.event,
          isParentExhibitor: user.isParentExhibitor,
          parentExhibitor: user.parentExhibitor,
        }));

        setUserData((prev) => (isSearch ? newUsers : [...prev, ...newUsers]));
        setHasMoreUsers(newUsers.length === USERS_PER_PAGE);
        setUserPage(page);
      } else {
        setUserData([]);
        setHasMoreUsers(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData([]);
      setHasMoreUsers(false);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Enhanced search function
  const performSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        // Reset to initial state when search is cleared
        const mappedChats = chatSessions
          .map((session) => {
            if (!session.participants || !Array.isArray(session.participants) || session.participants.length === 0) {
              return null;
            }
            const participant = session.participants[0];
            if (!participant || !participant.fullName) {
              return null;
            }
            return {
              id: session.sessionId,
              roomId: session.roomId, // Include roomId
              participantId: participant._id, // Add participantId
              name: participant.fullName,
              avatar: participant.fullName
                .split(" ")
                .map((n) => n[0])
                .join(""),
              lastMessage: session.lastMessage || "Start a conversation",
              time: session.lastMessageTime || "Just now",
              status: (participant.status || "inactive").toLowerCase(),
              unreadCount: session.unreadCount || 0,
              userImage: participant.userImage,
            };
          })
          .filter(Boolean);

        setFilteredChats(mappedChats);
        setSearchResults({ chats: [], users: [], combined: [] });
        setUserData([]);
        setUserPage(0);
        setHasMoreUsers(true);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // Search in existing chat sessions
        const chatResults = chatSessions
          .filter((session) => {
            if (!session.participants || !Array.isArray(session.participants) || session.participants.length === 0) {
              return false;
            }
            const participant = session.participants[0];
            if (!participant || !participant.fullName) {
              return false;
            }
            const searchFields = [participant.fullName, participant.email, participant.mobile].filter(Boolean);
            return searchFields.some((field) => field.toLowerCase().includes(query.toLowerCase()));
          })
          .map((session) => {
            const participant = session.participants[0];
            return {
              id: session.sessionId,
              roomId: session.roomId, // Include roomId
              participantId: participant._id, // Add participantId
              name: participant.fullName,
              avatar: participant.fullName
                .split(" ")
                .map((n) => n[0])
                .join(""),
              lastMessage: session.lastMessage || "Start a conversation",
              time: session.lastMessageTime || "Just now",
              status: (participant.status || "inactive").toLowerCase(),
              unreadCount: session.unreadCount || 0,
              userImage: participant.userImage,
              type: "chat",
            };
          });

        setSearchResults((prev) => ({
          ...prev,
          chats: chatResults,
          combined: chatResults,
        }));
        setFilteredChats(chatResults);

        // Search for new TicketRegistration users
        const response = await getData(
          {
            skip: 0,
            limit: USERS_PER_PAGE,
            searchkey: query,
          },
          "ticketRegistration/chat-search"
        );

        let userResults = [];

        if (response.data && response.data.success) {
          const users = response.data.response.map((user) => ({
            id: user._id,
            participantId: user._id, // Add participantId
            name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User",
            avatar: (user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "U")
              .split(" ")
              .map((n) => n[0])
              .join(""),
            lastMessage: "Start a conversation",
            time: "Just now",
            status: user.attendance ? "active" : "inactive",
            unreadCount: 0,
            userImage: user.profileImage || user.companyLogo,
            email: user.emailId,
            mobile: user.mobile,
            type: "user",
            userType: user.userType || "eventhex",
            designation: user.designation,
            companyName: user.companyName,
            ticketNumber: user.ticketNumber,
            formattedTicketNumber: user.formattedTicketNumber,
            event: user.event,
            isParentExhibitor: user.isParentExhibitor,
            parentExhibitor: user.parentExhibitor,
          }));
          userResults = [...userResults, ...users];
        }

        // Combine results without duplicates
        const combinedResults = [...chatResults];
        userResults.forEach((userResult) => {
          const isDuplicate = combinedResults.some((chat) => chat.name === userResult.name || chat.participantId === userResult.participantId);
          if (!isDuplicate) {
            combinedResults.push(userResult);
          }
        });

        setSearchResults({
          chats: chatResults,
          users: userResults,
          combined: combinedResults,
        });
        setFilteredChats(combinedResults);
        setUserData(userResults);
        setHasMoreUsers(userResults.length === USERS_PER_PAGE);
        setUserPage(0);
      } catch (error) {
        console.error("Error performing search:", error);
        setSearchResults({ chats: [], users: [], combined: [] });
        setFilteredChats([]);
        setUserData([]);
      } finally {
        setIsSearching(false);
      }
    },
    [chatSessions]
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim()) {
      setIsSearching(true);
    }

    const timeout = setTimeout(() => {
      performSearch(query);
    }, 300);

    setSearchTimeout(timeout);
  };

  // Scroll handler for pagination
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (searchQuery.trim() && scrollHeight - scrollTop - clientHeight < 100 && !isLoadingUsers && hasMoreUsers && !isSearching) {
        fetchUserData(userPage + 1);
      }
    },
    [userPage, isLoadingUsers, hasMoreUsers, searchQuery, isSearching]
  );

  // Fetch chat data on component mount
  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await getData({}, "chat");

        if (!response?.data?.success || !Array.isArray(response.data.response)) {
          setFilteredChats([]);
          return;
        }

        setChatSessions(response.data.response);

        // Map the API response with unique identifiers
        const mappedChats = response.data.response
          .map((session) => {
            if (!session.participants || !Array.isArray(session.participants) || session.participants.length === 0) {
              return null;
            }

            const participant = session.participants[0];
            if (!participant || !participant.fullName) {
              return null;
            }

            return {
              id: session.sessionId,
              roomId: session.roomId, // Use roomId as unique identifier
              participantId: participant._id, // Store participant ID for receiver identification
              name: participant.fullName,
              avatar: participant.fullName
                .split(" ")
                .map((n) => n[0])
                .join(""),
              lastMessage: session.lastMessage || "Start a conversation",
              time: session.lastMessageTime || "Just now",
              status: (participant.status || "inactive").toLowerCase(),
              unreadCount: session.unreadCount || 0,
              userImage: participant.userImage,
            };
          })
          .filter(Boolean);

        setFilteredChats(mappedChats);
      } catch (error) {
        console.error("Error fetching chat data:", error);
        setFilteredChats([]);
        setChatSessions([]);
      }
    };
    getUserData();
  }, []);

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setActiveChat(null);
        setCurrentRoomId(null); // Also reset currentRoomId
        if (document.activeElement && typeof document.activeElement.blur === "function") {
          document.activeElement.blur();
        }
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessage(messageInput, receiverId);
    setMessageInput("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "urgent":
        return "text-red-500";
      case "active":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const handleSaveNote = () => {
    if (notes.trim()) {
      const newNote = {
        id: Date.now(),
        content: notes,
        timestamp: new Date().toLocaleString(),
      };
      setSavedNotes([newNote, ...savedNotes]);
      setNotes("");
      setShowNotesModal(false);
    }
  };

  // Fetch unread counts on mount
  useEffect(() => {
    if (props.user?.user?._id) {
      fetchUnreadCountsData();
    }
  }, [props.user?.user?._id, fetchUnreadCountsData]);

  // Visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadCountsData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchUnreadCountsData]);

  // FIXED: Handle chat click with proper room switching
  const handleChatClick = async (chat) => {
    console.log("=== Chat Click Debug ===");
    console.log("1. Chat object clicked:", chat);
    console.log("2. Current user ID:", props.user?.user?._id);

    const currentUserId = props.user?.user?._id;
    let selectedUserId;
    let roomIdToUse;

    if (chat.type === "user") {
      // New user from search - need to create/get session
      selectedUserId = chat.participantId || chat.id;

      try {
        // Create or get chat session using the new API endpoint
        const sessionResponse = await postData(
          {
            participantIds: [selectedUserId],
            eventId: chat.event,
            sessionType: "one-to-one",
          },
          "chat/session"
        );

        if (sessionResponse.data && sessionResponse.data.success) {
          roomIdToUse = sessionResponse.data.response.roomId;

          // Add to chat sessions if not already present
          const existingChat = chatSessions.find((s) => s.roomId === sessionResponse.data.response.roomId);
          if (!existingChat) {
            const newSessionData = {
              sessionId: chat.id,
              roomId: sessionResponse.data.response.roomId,
              participants: [
                {
                  _id: selectedUserId,
                  fullName: chat.name,
                  status: "active",
                  userImage: chat.userImage,
                },
              ],
              lastMessage: "Start a conversation",
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
            };

            setChatSessions((prev) => [...prev, newSessionData]);

            // Update filtered chats
            const newChatData = {
              id: chat.id,
              roomId: sessionResponse.data.response.roomId,
              participantId: selectedUserId,
              name: chat.name,
              avatar: chat.avatar,
              lastMessage: "Start a conversation",
              time: "Just now",
              status: "active",
              unreadCount: 0,
              userImage: chat.userImage,
            };

            setFilteredChats((prev) => {
              const filtered = prev.filter((c) => c.roomId !== sessionResponse.data.response.roomId);
              return [newChatData, ...filtered];
            });
          }
        } else {
          console.error("Failed to create/get chat session:", sessionResponse);
          return;
        }
      } catch (err) {
        console.error("Failed to create/get chat session:", err);
        return;
      }
    } else {
      // Existing chat - use existing roomId
      roomIdToUse = chat.roomId;
      selectedUserId = chat.participantId;
    }

    // Fetch user details
    try {
      const userDetailsResponse = await getData({ id: selectedUserId }, "ticketRegistration");
      if (userDetailsResponse.data && userDetailsResponse.data.success) {
        setUserDetails(userDetailsResponse.data.response);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }

    // IMPORTANT: Set both activeChat and currentRoomId to ensure proper room switching
    setActiveChat(roomIdToUse); // Use roomId as the active chat identifier
    setCurrentRoomId(roomIdToUse); // This triggers the useChat hook to switch rooms

    // Reset unread count for this chat
    setFilteredChats((prev) => prev.map((c) => (c.roomId === roomIdToUse ? { ...c, unreadCount: 0 } : c)));

    // Fetch updated unread counts
    fetchUnreadCountsData();
  };

  // Create userProfile object based on userDetails
  const userProfile = userDetails
    ? {
        id: userDetails.formattedTicketNumber || userDetails.ticketNumber || "N/A",
        name: userDetails.fullName || `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim() || "N/A",
        status: userDetails.attendance ? "active" : "inactive",
        details: {
          email: userDetails.emailId || "N/A",
          phone: userDetails.mobile ? `+${userDetails.phoneCode || "91"} ${userDetails.mobile}` : "N/A",
          designation: userDetails.designation || "N/A",
          companyName: userDetails.companyName || "N/A",
          ticketNumber: userDetails.formattedTicketNumber || userDetails.ticketNumber || "N/A",
          userType: userDetails.userType || "eventhex",
        },
        eventInfo: {
          event: userDetails.event || "N/A",
          isParentExhibitor: userDetails.isParentExhibitor || false,
          parentExhibitor: userDetails.parentExhibitor || null,
        },
        registrationInfo: {
          paymentStatus: userDetails.paymentStatus || false,
          approve: userDetails.approve || false,
          reject: userDetails.reject || false,
          attendance: userDetails.attendance || false,
          attendanceDate: userDetails.attendanceDate ? new Date(userDetails.attendanceDate).toLocaleDateString() : "N/A",
          registrationDate: userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : "N/A",
        },
      }
    : null;

  // Render chat list function
  const renderChatList = () => {
    return filteredChats && filteredChats.length > 0 ? (
      filteredChats.map((chat) => (
        <button
          key={chat.roomId} // Use roomId as key for uniqueness
          onClick={() => handleChatClick(chat)}
          className={`flex items-center w-full p-3 hover:bg-gray-50/50 transition-all relative ${activeChat === chat.roomId ? "bg-gray-50" : ""}`}
        >
          {activeChat === chat.roomId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#38823C] rounded-r"></div>}
          <div className="relative flex-shrink-0">
            {!chat.userImage || avatarErrorIds.includes(chat.roomId) ? (
              <div className="w-10 h-10 rounded-lg bg-[#38823C] flex items-center justify-center text-white font-medium">{chat.name.substring(0, 2).toUpperCase()}</div>
            ) : (
              <img src={chat.userImage} alt={chat.name} className="w-10 h-10 rounded-lg object-cover" onError={() => handleAvatarError(chat.roomId)} />
            )}
            {chat.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-green-500 text-white text-xs flex items-center justify-center rounded-full px-1 border-2 border-white shadow-sm">
                {chat.unreadCount}
              </div>
            )}
          </div>
          <div className="ml-3 flex-1 overflow-hidden text-left">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-900 truncate">{chat.name}</p>
              <p className="text-xs text-gray-400">{chat.time}</p>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{chat.lastMessage}</p>
          </div>
        </button>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageSquare className="h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-400">{searchQuery.trim() ? "No results found" : "No chats found"}</p>
      </div>
    );
  };

  return (
    <>
      <div className="flex h-[calc(100vh-64px)] w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white pb-5">
        {/* Left Sidebar - Chat List */}
        <div className={`w-80 border-r border-gray-100 bg-white/80 backdrop-blur-sm flex flex-col md:flex ${showMobileSidebar ? "fixed inset-y-0 left-0 z-50" : "hidden"} md:relative md:z-0`}>
          <div className="flex-none p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-800 tracking-tight">Messages</h3>
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setShowMobileSidebar(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search messages..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg 
                  focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-transparent 
                  transition-all text-sm"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0" onScroll={handleScroll}>
            <div className="py-2">
              {renderChatList()}
              {isLoadingUsers && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        {activeChat ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Header */}
            <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center">
                <button className="mr-3 md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setShowMobileSidebar(true)}>
                  <Menu className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-gray-600 font-medium">
                  {filteredChats.find((c) => c.roomId === activeChat)?.avatar}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{filteredChats.find((c) => c.roomId === activeChat)?.name}</h3>
                  <div className="flex items-center mt-0.5">
                    <Circle className={`h-2 w-2 ${getStatusColor(filteredChats.find((c) => c.roomId === activeChat)?.status)} mr-1.5`} fill="currentColor" />
                    <span className="text-xs text-gray-500 capitalize">{filteredChats.find((c) => c.roomId === activeChat)?.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="md:hidden px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" onClick={() => setShowMobileProfile(!showMobileProfile)}>
                  Profile
                </button>
                <button className="hidden md:flex px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 items-center transition-colors" onClick={() => setShowNotesModal(true)}>
                  Notes
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 bg-gradient-to-br from-gray-50/50 to-white">
              <div className="flex flex-col gap-1">
                {joined ? (
                  messages.map((message, idx) => {
                    const isUser = message.senderId === props.user?.user?._id;
                    const showAvatar = idx === 0 || messages[idx - 1].senderId !== message.senderId;

                    return (
                      <div key={`${message.timestamp}-${idx}`} className={`flex w-full mb-1 ${isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`flex flex-col max-w-[60%] ${isUser ? "items-end" : "items-start"}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl shadow text-base leading-relaxed break-words
                              ${isUser ? "bg-green-100 text-green-900 rounded-br-md rounded-tr-2xl" : "bg-gray-200 text-gray-900 border border-gray-200 rounded-bl-md rounded-tl-2xl"}
                            `}
                          >
                            {message.decryptedText}
                          </div>
                          <span className={`text-xs mt-1 ${isUser ? "text-right text-gray-400" : "text-left text-gray-400"}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-sm text-gray-400 py-4">Connecting to chat...</div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="flex-none p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      aria-label="Message input"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-lg py-2.5 px-4 
                        focus:outline-none focus:ring-2 focus:ring-[#38823C]/20 focus:border-[#38823C]
                        placeholder:text-gray-400 placeholder:transition-opacity placeholder:duration-200
                        hover:border-gray-300 transition-all text-sm"
                    />
                    {messageInput.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMessageInput("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                          transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label="Clear message"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="bg-[#38823C] hover:bg-[#38823A] disabled:bg-gray-300 disabled:cursor-not-allowed
                      text-white p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center
                      min-w-[40px] min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#38823C]/20"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white min-h-0">
            <div className="flex flex-col items-center w-full">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <MessageSquare className="h-7 w-7 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-1">No conversation selected</h3>
              <p className="text-sm text-gray-400">Please select a chat from the list to view messages.</p>
            </div>
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl w-full max-w-md mx-4 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between p-4 border-b border-gray-100/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-gray-800">Add Notes</h3>
                </div>
                <button onClick={() => setShowNotesModal(false)} className="p-1.5 hover:bg-gray-100/80 rounded-lg transition-colors">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type your notes here..."
                  className="w-full h-28 p-3 bg-gray-50/50 border border-gray-200/50 rounded-lg 
                    focus:outline-none focus:ring-1 focus:ring-[#38823C]/20 focus:border-[#38823C]/50 
                    placeholder:text-gray-400 text-sm resize-none transition-all"
                />
                {savedNotes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Previous Notes</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {savedNotes.map((note) => (
                        <div key={note.id} className="p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                          <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                          <p className="text-xs text-gray-400 mt-1.5">{note.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-gray-100/50">
                <button onClick={() => setShowNotesModal(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100/80 rounded-lg transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!notes.trim()}
                  className="px-3 py-1.5 text-sm bg-[#38823C] text-white rounded-lg 
                    hover:bg-[#38823A] disabled:bg-gray-200 disabled:text-gray-400 
                    disabled:cursor-not-allowed transition-all duration-200"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Layout(AnalyseChat);
