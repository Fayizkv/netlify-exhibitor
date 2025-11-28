import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { getData, postData, deleteData, putData } from "../../../../backend/api";
import AutoForm from "../../../../components/core/autoform/AutoForm";
import { dateFormat, timeFormat } from "../../../core/functions/date";
import { PageHeader, SubPageHeader } from "../../../core/input/heading";
import { AddButton, Filter } from "../../../core/list/styles";
import { Button, TextArea, IconButton, TabButtons } from "../../../core/elements";
import { Input } from "../../../core/input/styles";
import { DateInput } from "../../../core/input/date";
import FormInput from "../../../core/input";
import { AddIcon, GetIcon } from "../../../../icons";
import Search from "../../../core/search";
import NoDataFound from "../../../core/list/nodata";
import { TrView, TdView } from "../../../core/list/styles";
import moment from "moment";
import { X, Plus, Trash2, ShieldCheck, SearchCheck } from "lucide-react";
import { SimpleShimmer } from "../../../core/loader/shimmer";
import PollAnalyticsDashboard from "./poll";
import ListTable from "../../../core/list/list";
import PopupView from "../../../core/popupview";

// Poll functionality - integrated into main component
const usePollManagement = (eventId, sessionId, setMessage) => {
  const [polls, setPolls] = useState([]);
  const [showAddPoll, setShowAddPoll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
  });

  // Fetch existing polls
  const fetchPolls = async () => {
    try {
      // Build filter object - include session filter only if sessionId exists
      const filter = { event: eventId };
      if (sessionId) {
        filter.session = sessionId;
      }

      const response = await getData(filter, "poll");
      if (response.status === 200) {
        // Handle different response structures
        let pollsData = [];
        if (Array.isArray(response.data)) {
          pollsData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          pollsData = response.data.data;
        } else if (response.data && Array.isArray(response.data.response)) {
          pollsData = response.data.response;
        }
        setPolls(pollsData);
        // console.log("Polls set to state:", pollsData);
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
      setPolls([]);
    }
  };

  useEffect(() => {
    // Fetch existing polls when component loads
    // console.log("PollDashboard useEffect - eventId:", eventId, "sessionId:", sessionId);
    if (eventId) {
      // If we have a sessionId, fetch polls for that session
      // If not, fetch all polls for the event
      fetchPolls();
    } else {
      console.log("PollDashboard: Missing eventId, not fetching polls");
    }
  }, [eventId, sessionId]);

  const handleAddOption = () => {
    setNewPoll((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const handleRemoveOption = (index) => {
    if (newPoll.options.length > 2) {
      setNewPoll((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const handleSavePoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.some((opt) => !opt.trim())) {
      if (setMessage) {
        setMessage({
          type: 1,
          content: "Please fill in all fields",
          icon: "error",
          title: "Validation Error",
        });
      }
      return;
    }

    setLoading(true);

    try {
      const pollData = {
        question: newPoll.question,
        session: sessionId,
        pollNumber: (Array.isArray(polls) ? polls.length : 0) + 1,
        event: eventId,
        options: newPoll.options.map((text) => ({ text, votes: 0 })),
        active: true,
      };

      console.log("Sending poll data:", pollData);

      // Save poll to database
      const response = await postData(pollData, "poll");

      console.log("Poll creation response:", response);

      if (response.status === 200 || response.status === 201) {
        // Reset form and hide the form
        setNewPoll({ question: "", options: ["", ""] });
        setShowAddPoll(false);

        // Refresh polls list from database
        await fetchPolls();

        // Refresh dashboard data when a poll is created
        // This will be handled by the parent component

        // Show success message
        if (setMessage) {
          setMessage({
            type: 1,
            content: "Poll created successfully!",
            icon: "success",
            title: "Success",
          });
        }
      } else {
        if (setMessage) {
          setMessage({
            type: 1,
            content: "Failed to create poll. Please try again.",
            icon: "error",
            title: "Error",
          });
        }
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      if (setMessage) {
        setMessage({
          type: 1,
          content: "Error creating poll. Please try again.",
          icon: "error",
          title: "Error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (setMessage) {
      setMessage({
        type: 2,
        content: "Are you sure you want to delete this poll?",
        proceed: "Delete",
        okay: "Cancel",
        onProceed: async () => {
          try {
            // Delete poll from database
            const response = await deleteData(`poll/${pollId}`);

            if (response.status === 200) {
              // Refresh polls list from database
              await fetchPolls();

              // Refresh dashboard data when a poll is deleted
              // This will be handled by the parent component

              if (setMessage) {
                setMessage({
                  type: 1,
                  content: "Poll deleted successfully!",
                  icon: "success",
                  title: "Success",
                });
              }
              return true; // Close modal
            } else {
              if (setMessage) {
                setMessage({
                  type: 1,
                  content: "Failed to delete poll. Please try again.",
                  icon: "error",
                  title: "Error",
                });
              }
              return false; // Keep modal open
            }
          } catch (error) {
            console.error("Error deleting poll:", error);
            if (setMessage) {
              setMessage({
                type: 1,
                content: "Error deleting poll. Please try again.",
                icon: "error",
                title: "Error",
              });
            }
            return false; // Keep modal open
          }
        },
      });
    } else {
      // Fallback to window.confirm if setMessage is not available
      if (window.confirm("Are you sure you want to delete this poll?")) {
        try {
          // Delete poll from database
          const response = await deleteData(`poll/${pollId}`);

          if (response.status === 200) {
            // Refresh polls list from database
            await fetchPolls();

            // Refresh dashboard data when a poll is deleted
            // This will be handled by the parent component

            if (setMessage) {
              setMessage({
                type: 1,
                content: "Poll deleted successfully!",
                icon: "success",
                title: "Success",
              });
            }
          } else {
            if (setMessage) {
              setMessage({
                type: 1,
                content: "Failed to delete poll. Please try again.",
                icon: "error",
                title: "Error",
              });
            }
          }
        } catch (error) {
          console.error("Error deleting poll:", error);
          if (setMessage) {
            setMessage({
              type: 1,
              content: "Error deleting poll. Please try again.",
              icon: "error",
              title: "Error",
            });
          }
        }
      }
    }
  };

  const getProgressBarColor = (index) => {
    const colors = ["bg-green-500", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-teal-500"];
    return colors[index % colors.length];
  };

  return {
    polls,
    showAddPoll,
    loading,
    newPoll,
    fetchPolls,
    handleAddOption,
    handleRemoveOption,
    handleOptionChange,
    handleSavePoll,
    handleDeletePoll,
    getProgressBarColor,
    setShowAddPoll,
    setNewPoll,
  };
};

// Custom Shimmer Component for Sessions Page
const SessionsShimmer = () => (
  <div className="">
    <div className="mx-auto">
      {/* Header Shimmer */}
      <div className="animate-pulse mb-6">
        <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded"></div>
      </div>

      {/* Action Bar Shimmer */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 mt-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="animate-pulse">
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-10 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-start md:self-center mr-0 ml-auto">
          <div className="animate-pulse">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Sessions Shimmer */}
      <div className="space-y-8">
        {/* Day Group Shimmer */}
        <div>
          <div className="animate-pulse mb-4">
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between">
                    <div className="flex items-center md:items-start mb-3 md:mb-0">
                      <div className="w-20 text-left md:text-center mr-4 md:mr-6 flex-shrink-0">
                        <div className="animate-pulse">
                          <div className="h-4 w-12 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 w-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="w-px bg-gray-200 self-stretch hidden md:block md:mr-6"></div>
                      <div className="flex-grow">
                        <div className="animate-pulse">
                          <div className="h-5 w-64 bg-gray-200 rounded mb-2"></div>
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-auto md:ml-4 mt-4 md:mt-0">
                      <div className="animate-pulse">
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      </div>
                      <div className="animate-pulse">
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="animate-pulse">
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:pl-28">
                    <div className="animate-pulse">
                      <div className="flex items-center">
                        <div className="flex items-center -space-x-2 md:space-x-0">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-4 w-32 bg-gray-200 rounded ml-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const imageCDN = import.meta.env.VITE_CDN;
const Sessions = (props) => {
  const [currentGrouping, setCurrentGrouping] = useState("day");
  const [activeFilters, setActiveFilters] = useState({ types: [], speakers: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [eventId, setEventId] = useState(props.openData.data._id);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [openAddSessionModal, setOpenAddSessionModal] = useState(false);
  const [openEditSessionModal, setOpenEditSessionModal] = useState(false);
  const [openAddSubSessionModal, setOpenAddSubSessionModal] = useState(false);
  const [openEventDashboard, setOpenEventDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState("feedback");
  const themeColors = useSelector((state) => state.themeColors);

  // Hide AI sparkle FAB when Add Session modal is open
  useEffect(() => {
    if (openAddSessionModal) {
      document.body.classList.add("eh-hide-ai-fab");
    } else {
      document.body.classList.remove("eh-hide-ai-fab");
    }
    return () => {
      document.body.classList.remove("eh-hide-ai-fab");
    };
  }, [openAddSessionModal]);

  // Tabs configuration array
  const tabs = [
    { id: "feedback", label: "Feedback", textSize: "text-[12px]" },
    { id: "poll", label: "Poll", textSize: "text-sm" },
    { id: "questions", label: "Questions", textSize: "text-sm" },
    // { id: "attendees", label: "Attendees", textSize: "text-sm" },
    // { id: "rsvp", label: "RSVP Settings", textSize: "text-sm" },
  ];

  const [selectedSession, setSelectedSession] = useState(null);

  // Poll management hook - moved after selectedSession declaration
  const pollManagement = usePollManagement(eventId, selectedSession?._id || selectedSession?.id, props.setMessage);

  // Override the handleSavePoll and handleDeletePoll to refresh dashboard data
  const originalHandleSavePoll = pollManagement.handleSavePoll;
  const originalHandleDeletePoll = pollManagement.handleDeletePoll;

  pollManagement.handleSavePoll = async () => {
    await originalHandleSavePoll();
    // Refresh dashboard data when a poll is created
    if (selectedSession?._id || selectedSession?.id) {
      fetchDashboardData(selectedSession?._id || selectedSession?.id);
    }
  };

  pollManagement.handleDeletePoll = async (pollId) => {
    await originalHandleDeletePoll(pollId);
    // Refresh dashboard data when a poll is deleted
    if (selectedSession?._id || selectedSession?.id) {
      fetchDashboardData(selectedSession?._id || selectedSession?.id);
    }
  };
  const [editSessionData, setEditSessionData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Event Dashboard Dynamic Data States
  const [dashboardData, setDashboardData] = useState({
    feedback: [],
    polls: [],
    questions: [],
    attendees: [],
    rsvpSettings: {},
  });
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [pollCount, setPollCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({});

  // Compute feedback stats for distribution and summary
  const reactionOrder = ["LOVE", "HAPPY", "SMILE", "NEUTRAL", "SAD"]; // display order
  const emojiFor = (reaction) => {
    switch ((reaction || "").toUpperCase()) {
      case "LOVE":
        return "😍";
      case "HAPPY":
        return "😊";
      case "SMILE":
        return "🙂";
      case "NEUTRAL":
        return "😐";
      case "SAD":
        return "☹️";
      default:
        return "🙂";
    }
  };
  const getFeedbackStats = (list) => {
    const counts = { LOVE: 0, HAPPY: 0, SMILE: 0, NEUTRAL: 0, SAD: 0 };
    (list || []).forEach((f) => {
      const key = (f?.reaction || "").toUpperCase();
      if (counts[key] !== undefined) counts[key] += 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const distribution = reactionOrder.map((key) => ({ key, count: counts[key], percent: total ? (counts[key] / total) * 100 : 0 }));
    const weights = { SAD: 1, NEUTRAL: 2, SMILE: 3, HAPPY: 4, LOVE: 5 };
    const score = total ? (reactionOrder.reduce((acc, k) => acc + counts[k] * weights[k], 0) / total).toFixed(1) : "0.0";
    return { total, distribution, score };
  };

  // Reset serial number counters when session or tab changes
  useEffect(() => {
    const sessionId = selectedSession?._id || selectedSession?.id;

    // Reset feedback serial number counter
    const feedbackChanged = serialNumberRef.current.lastSessionId !== sessionId || serialNumberRef.current.lastEventId !== eventId;

    if (feedbackChanged && activeTab === "feedback") {
      serialNumberRef.current.counter = 0;
      serialNumberRef.current.rowMap = new WeakMap();
      serialNumberRef.current.lastSessionId = sessionId;
      serialNumberRef.current.lastEventId = eventId;
    }

    // Reset question serial number counter
    const questionsChanged = questionSerialNumberRef.current.lastSessionId !== sessionId || questionSerialNumberRef.current.lastEventId !== eventId;

    if (questionsChanged && activeTab === "questions") {
      questionSerialNumberRef.current.counter = 0;
      questionSerialNumberRef.current.rowMap = new WeakMap();
      questionSerialNumberRef.current.lastSessionId = sessionId;
      questionSerialNumberRef.current.lastEventId = eventId;
    }
  }, [activeTab, selectedSession?._id, selectedSession?.id, eventId]);

  // Rating Distribution labels for MetricTile (like order counts)
  const getRatingDistributionLabels = useCallback(() => {
    return [
      {
        key: "LOVE",
        title: "LOVE",
        icon: "heart",
        backgroundColor: "rgba(236, 72, 153, 0.15)",
        color: "#ec4899",
      },
      {
        key: "HAPPY",
        title: "HAPPY",
        icon: "smile",
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        color: "#22c55e",
      },
      {
        key: "SMILE",
        title: "SMILE",
        icon: "smile",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        color: "#3b82f6",
      },
      {
        key: "NEUTRAL",
        title: "NEUTRAL",
        icon: "meh",
        backgroundColor: "rgba(156, 163, 175, 0.15)",
        color: "#9ca3af",
      },
      {
        key: "SAD",
        title: "SAD",
        icon: "frown",
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        color: "#ef4444",
      },
    ];
  }, []);

  // Fetch rating counts from backend API
  const fetchRatingCounts = useCallback(
    async (sessionId = null) => {
      try {
        const filter = { event: eventId };
        if (sessionId) {
          filter.session = sessionId;
        }
        const response = await getData(filter, "feedback-session/rating-counts");
        if (response.status === 200 && response.data?.data?.counts) {
          setRatingCounts(response.data.data.counts);
        } else if (response.status === 200 && response.data?.counts) {
          // Fallback for different response structure
          setRatingCounts(response.data.counts);
        }
      } catch (error) {
        console.error("Error fetching rating counts:", error);
        setRatingCounts({});
      }
    },
    [eventId]
  );

  // Poll form fields configuration
  const [pollFields] = useState([
    // {
    //   type: "select",
    //   apiType: "API",
    //   selectApi: "mobile/sessions/select",
    //   placeholder: "Select session",
    //   name: "session",
    //   showItem: "value",
    //   label: "Session",
    //   required: true,
    //   view: true,
    //   add: true,
    //   update: true,
    //   filter: true,
    // },
    {
      type: "number",
      placeholder: "Poll number",
      name: "pollNumber",
      label: "Poll Number",
      required: false,
      view: true,
      add: true,
      update: true,
      min: 1,
      default: 1,
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Poll Options",
      name: "pollOptions",
      add: true,
      update: true,
      info: "Add multiple options for the poll",
    },
    {
      type: "text",
      placeholder: "Option 1",
      name: "option1",
      label: "Option 1",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Option 2",
      name: "option2",
      label: "Option 2",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Option 3 (optional)",
      name: "option3",
      label: "Option 3",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Option 4 (optional)",
      name: "option4",
      label: "Option 4",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  // Use useRef to track serial numbers based on row order
  const serialNumberRef = useRef({ rowMap: new WeakMap(), counter: 0, lastSessionId: null, lastEventId: null });

  // Create a unique key based on session/event to reset counter
  const feedbackTableKey = useMemo(() => {
    return `feedback-${selectedSession?._id || selectedSession?.id || "all"}-${eventId}-${activeTab}`;
  }, [selectedSession?._id, selectedSession?.id, eventId, activeTab]);

  const createSerialNumberRender = useCallback(() => {
    // Always reset when creating new render function
    serialNumberRef.current.counter = 0;
    serialNumberRef.current.rowMap = new WeakMap();

    return (value, data, attribute) => {
      const ref = serialNumberRef.current;

      // Assign serial number based on order of appearance
      if (!ref.rowMap.has(data)) {
        ref.counter++;
        ref.rowMap.set(data, ref.counter);
      }

      const serialNo = ref.rowMap.get(data);
      return <div>{serialNo}</div>;
    };
  }, []);

  // Use useMemo to recreate attributes when key changes, ensuring counter resets
  const feedbackAttributes = useMemo(() => {
    // Force reset counter before creating new render function
    serialNumberRef.current.counter = 0;
    serialNumberRef.current.rowMap = new WeakMap();
    const serialNumberRender = createSerialNumberRender();

    return [
      {
        type: "number",
        name: "serialNumber",
        label: "Sl No.",
        validation: "",
        default: null,
        view: true,
        add: false,
        update: false,
        tag: true,
        required: false,
        render: serialNumberRender,
      },
      {
        type: "text",
        name: "reaction",
        label: "Rating",
        validation: "",
        default: "",
        view: true,
        add: false,
        update: false,
        tag: false,
        required: false,
        customClass: "quarter",
        render: (value) => {
          return (
            <div className="text-2xl" aria-hidden>
              {emojiFor(value)}
            </div>
          );
        },
      },
      {
        type: "text",
        name: "user",
        label: "Attendee",
        validation: "",
        default: "",
        view: true,
        add: false,
        update: false,
        tag: true,
        required: false,
        collection: "user",
        showItem: "value",
      },
      {
        type: "textarea",
        name: "feedback",
        placeholder: "Feedback",
        label: "Feedback",
        validation: "",
        default: "",
        tag: true,
        required: false,
        view: true,
        add: false,
        update: false,
      },
      {
        type: "select",
        apiType: "API",
        selectApi: "ticket-registration/select",
        placeholder: "User",
        name: "user",
        validation: "",
        default: "",
        label: "User",
        required: true,
        view: false,
        add: true,
        update: true,
        tag: false,
        collection: "user",
        showItem: "value",
      },
      {
        type: "select",
        apiType: "API",
        selectApi: "event/select",
        placeholder: "Event",
        name: "event",
        validation: "",
        default: "",
        label: "Event",
        required: true,
        view: false,
        add: true,
        update: true,
        collection: "event",
        showItem: "value",
      },
      {
        type: "select",
        apiType: "API",
        selectApi: "session/select",
        placeholder: "Session",
        name: "session",
        validation: "",
        default: "",
        label: "Session",
        required: true,
        view: false,
        add: true,
        update: true,
        tag: false,
        collection: "session",
        showItem: "value",
      },
    ];
  }, [feedbackTableKey, createSerialNumberRender]);

  // Serial number render for Questions (similar to feedback)
  const questionSerialNumberRef = useRef({ rowMap: new WeakMap(), counter: 0, lastSessionId: null, lastEventId: null });

  // Create a unique key based on session/event to reset counter
  const questionsTableKey = useMemo(() => {
    return `questions-${selectedSession?._id || selectedSession?.id || "all"}-${eventId}-${activeTab}`;
  }, [selectedSession?._id, selectedSession?.id, eventId, activeTab]);

  // Reset question serial number counter when session, tab, or event changes
  useEffect(() => {
    const sessionId = selectedSession?._id || selectedSession?.id;
    const hasChanged = questionSerialNumberRef.current.lastSessionId !== sessionId || questionSerialNumberRef.current.lastEventId !== eventId;

    if (hasChanged && activeTab === "questions") {
      questionSerialNumberRef.current.counter = 0;
      questionSerialNumberRef.current.rowMap = new WeakMap();
      questionSerialNumberRef.current.lastSessionId = sessionId;
      questionSerialNumberRef.current.lastEventId = eventId;
    }
  }, [activeTab, selectedSession?._id, selectedSession?.id, eventId]);

  const createQuestionSerialNumberRender = useCallback(() => {
    // Always reset when creating new render function
    questionSerialNumberRef.current.counter = 0;
    questionSerialNumberRef.current.rowMap = new WeakMap();

    return (value, data, attribute) => {
      const ref = questionSerialNumberRef.current;

      if (!ref.rowMap.has(data)) {
        ref.counter++;
        ref.rowMap.set(data, ref.counter);
      }

      const serialNo = ref.rowMap.get(data);
      return <div>{serialNo}</div>;
    };
  }, []);

  // Use useMemo to recreate attributes when key changes, ensuring counter resets
  const askQuestionAttributes = useMemo(() => {
    // Force reset counter before creating new render function
    questionSerialNumberRef.current.counter = 0;
    questionSerialNumberRef.current.rowMap = new WeakMap();
    const questionSerialNumberRender = createQuestionSerialNumberRender();

    return [
      {
        type: "number",
        name: "serialNumber",
        label: "Sl No.",
        validation: "",
        default: null,
        view: true,
        add: false,
        update: false,
        tag: true,
        required: false,
        render: questionSerialNumberRender,
      },
      {
        type: "text",
        name: "question",
        placeholder: "Question",
        label: "Question",
        validation: "",
        default: "",
        tag: true,
        required: true,
        view: true,
        add: false,
        update: false,
      },
      {
        type: "text",
        name: "user",
        label: "Attendee",
        validation: "",
        default: "",
        view: true,
        add: false,
        update: false,
        tag: true,
        required: false,
        showItem: "value",
      },
      // Hidden fields for form submission
      {
        type: "select",
        apiType: "API",
        selectApi: "ticket-registration/select",
        placeholder: "User",
        name: "user",
        validation: "",
        default: "",
        label: "User",
        required: true,
        view: false,
        add: true,
        update: true,
        tag: false,
        collection: "user",
        showItem: "value",
      },
      {
        type: "select",
        apiType: "API",
        selectApi: "event/select",
        placeholder: "Event",
        name: "event",
        validation: "",
        default: "",
        label: "Event",
        required: true,
        view: false,
        add: true,
        update: true,
        collection: "event",
        showItem: "value",
      },
      {
        type: "select",
        apiType: "API",
        selectApi: "session/select",
        placeholder: "Session",
        name: "session",
        validation: "",
        default: "",
        label: "Session",
        required: true,
        view: false,
        add: true,
        update: true,
        tag: false,
        collection: "session",
        showItem: "value",
      },
    ];
  }, [questionsTableKey, createQuestionSerialNumberRender]);

  const [sessionFields] = useState([
    {
      type: "text",
      placeholder: "Give your session a clear, descriptive name",
      name: "title",
      validation: "",
      default: "",
      label: "Session Title",
      icon: "session",
      tag: false,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "session-type/master/select",
      placeholder: "Select a session format",
      name: "sessiontype",
      validation: "",
      showItem: "value",
      default: "",
      icon: "session-input",
      tag: true,
      addNew: {
        attributes: [
          {
            type: "text",
            placeholder: "Enter Session Type",
            name: "sessionType",
            validation: "",
            default: "",
            label: "Add a session format",
            required: true,
            view: true,
            add: true,
            update: true,
            icon: "session",
          },
        ],
        api: "session-type",
        submitButtonText: "Create",
      },
      highlight: true,
      label: "Session Type",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "datetime",
      placeholder: "Start Time",
      split: true,
      name: "startTime",
      validation: "",
      icon: "time",
      default: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate(), // Tomorrow 9 AM,
      minDate: moment().add(-1, "month").startOf("day").toDate(), // Cannot select before tomorrow 12 AM
      tag: true,
      label: "Start Time",
      required: false,
      view: true,
      add: true,
      update: true,
      customClass: "half",
    },
    {
      type: "datetime",
      placeholder: "End Time",
      split: true,
      name: "endTime",
      icon: "time",
      validation: "",
      default: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate(), // Tomorrow 9 AM,
      minDate: moment().add(-1, "month").startOf("day").toDate(), // Cannot select before tomorrow 12 AM
      tag: true,
      label: "End Time",
      required: false,
      view: true,
      add: true,
      update: true,
      customClass: "half",
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "stage/master/select",
      placeholder: "Enter session location",
      name: "stage",
      validation: "",
      showItem: "value",
      default: "",
      icon: "stage",
      addNew: {
        label: "Add stage or hall",
        attributes: [
          {
            type: "text",
            placeholder: "Enter session location",
            name: "stage",
            validation: "",
            default: "",
            label: "Stage or Hall",
            required: true,
            view: true,
            add: true,
            update: true,
          },
        ],
        api: "stage",
        submitButtonText: "Create",
      },
      label: "Stage or Hall",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "multiSelect",
      apiType: "API",
      // selectApi: `speakers/speaker-event?event=${props.openData.data._id}`,
      selectApi: `speakers/speaker-event`,
      placeholder: "Select speaker for this session",
      // updateOn: "event",
      name: "speakers",
      validation: "",
      showItem: "value",
      icon: "speakers",
      addNew: {
        label: "Add speaker",
        attributes: [
          {
            type: "text",
            placeholder: "Title",
            name: "name",
            validation: "",
            default: "",
            label: "Add a speaker",
            required: true,
            view: true,
            add: true,
            update: true,
            icon: "speakers",
          },
          {
            type: "text",
            placeholder: "Organization or Affiliation",
            name: "company",
            validation: "",
            default: "",
            label: "Company",
            tag: true,
            required: false,
            view: true,
            add: true,
            update: true,
            icon: "company",
          },
          {
            type: "text",
            placeholder: "Marketing Manager",
            name: "designation",
            validation: "",
            default: "",
            label: "Designation",
            tag: true,
            required: false,
            view: true,
            add: true,
            update: true,
            icon: "user-group",
          },
          {
            type: "image",
            placeholder: "Image",
            name: "photo",
            validation: "",
            default: "false",
            tag: false,
            label: "Profile Picture",
            sublabel: "Optional",
            required: false,
            view: true,
            add: true,
            update: true,
          },
        ],
        api: "speakers",
        submitButtonText: "Create",
      },
      default: "",
      tag: false,
      label: "Speakers",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: true,
      search: true,
      footnote: "Speakers can be assigned to this session after it is created",
    },
    {
      type: "textarea",
      placeholder: "Describe session content and benefits",
      name: "description",
      validation: "",
      default: "",
      label: "Session Description",
      sublabel: "Optional",
      customClass: "full",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
      icon: "description",
    },
    {
      type: "select",
      placeholder: "Applicable Tickets",
      name: "ticketType",
      validation: "",
      tag: false,
      editable: true,
      label: "Who Can Attend?",
      sublabel: "",
      showItem: "",
      required: false,
      customClass: "full",
      filter: false,
      view: true,
      add: true,
      update: true,
      apiType: "JSON",
      selectType: "card",
      selectApi: [
        { value: "All Tickets", id: 0, description: "Everyone with any ticket type can join" },
        { value: "Selected Tickets & Participant types", id: 1, description: "Limit access to specific ticket types only" },
      ],
    },
    {
      type: "multiSelect",
      placeholder: "Select Tickets",
      name: "ticket",
      condition: {
        item: "ticketType",
        if: 1,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      tag: false,
      editable: true,
      label: "Select Tickets",
      showItem: "",
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      updateOn: "event",
      apiType: "API",
      selectApi: "ticket/event-ticket",
    },
    {
      type: "toggle",
      placeholder: "Limit Number Of Attendees",
      name: "limitNumOfAttendees",
      validation: "",
      default: "",
      label: "Limit Number Of Attendees",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Number Of Bookings",
      name: "numOfBookings",
      validation: "",
      default: 0,
      label: "Number Of Bookings",
      condition: {
        item: "limitNumOfAttendees",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Video URL",
      name: "videoUrl",
      validation: "",
      default: "",
      label: "Video URL",
      customClass: "half",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Break & Intermission",
      name: "breakSession",
      add: true,
      update: true,
      info: "Mark this session as a break (e.g., coffee break, lunch break, networking break, etc.)",
    },
    {
      type: "checkbox",
      placeholder: "Is Break",
      name: "isBreak",
      validation: "",
      default: "",
      label: "This is a Break",
      customClass: "half",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  useEffect(() => {
    setSkip(0);
    setSessions([]);
    setHasMore(true);
  }, [props.openData.data._id]);

  // Format duration in a user-friendly way
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (remainingMinutes === 0) {
        return `${hours} hr`;
      } else {
        return `${hours} hr ${remainingMinutes} min`;
      }
    }
  };

  // Transform real session data to match expected format
  const transformSessionData = (rawSessions) => {
    // console.log("rawSessions", rawSessions);
    return rawSessions.map((session) => {
      console.log("session", session);
      const startDate = new Date(session.startTime);
      const endDate = new Date(session.endTime);
      const durationMinutes = Math.round((endDate - startDate) / (1000 * 60)); // duration in minutes

      // Custom time formatter without timezone suffix
      const formatTimeWithoutTimezone = (date) => {
        if (!moment(date).isValid()) return "--";
        return moment(date).format("hh:mm A");
      };

      return {
        id: session._id,
        title: session.title,
        day: session.day?.value || "Day 1", // Keep original day field for reference
        date: dateFormat(startDate),
        weekday: startDate.toLocaleDateString("en-US", { weekday: "long" }),
        startTime: formatTimeWithoutTimezone(startDate),
        duration: formatDuration(durationMinutes),
        stage: session.stage?.stage || "Main Stage", // Use dummy data if missing
        type: session.sessiontype?.value || "Session", // Use dummy data if missing
        speakers: session.speakers || [],
        subPrograms: [], // Will be populated by subsessions
        description: session.description || "",
        startDateTime: startDate, // Keep original date object for sorting
        dateKey: startDate.toISOString().split("T")[0], // YYYY-MM-DD format for grouping
        isSubSession: session.isSubSession || false,
        parentSession: session.parentSession || null,
        rawData: session, // Keep raw data for editing
        limitNumOfAttendees: session.limitNumOfAttendees || false,
        numOfBookings: session.numOfBookings || 0,
      };
    });
  };

  useEffect(() => {
    const fetchSessions = async () => {
      if (eventId) {
        setLoading(true);
        try {
          const response = await getData({ event: eventId }, "sessions", { limit, skip });

          const transformedSessions = transformSessionData(response.data.response);

          // Separate main sessions and subsessions
          const mainSessions = transformedSessions.filter((session) => !session.isSubSession);
          const subSessions = transformedSessions.filter((session) => session.isSubSession);

          // Attach subsessions to their parent sessions
          mainSessions.forEach((mainSession) => {
            mainSession.subPrograms = subSessions
              .filter((subSession) => subSession.parentSession === mainSession.id)
              .map((subSession) => ({
                id: subSession.id,
                title: subSession.title,
                startTime: subSession.startTime,
                duration: subSession.duration,
                type: subSession.type,
                speakers: subSession.speakers,
                rawData: subSession.rawData,
              }));
          });

          if (skip === 0) {
            setSessions(mainSessions);
          } else {
            setSessions((prev) => [...prev, ...mainSessions]);
          }

          // Check if there are more sessions to load
          setHasMore(response.data.response.length === limit);
        } catch (error) {
          console.error("Error fetching sessions:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSessions();
  }, [eventId, skip]);

  const allTypes = [...new Set(sessions.map((s) => s.type))];
  const allSpeakers = [
    ...new Map(sessions.flatMap((s) => [...s.speakers, ...(s.subPrograms || []).flatMap((sp) => sp.speakers || [])]).map((speaker) => [speaker._id || speaker.id, speaker])).values(),
  ];

  const speakerImage = useCallback(
    (speaker) => {
      if (speaker.photo && speaker.photo !== "false") {
        return `${imageCDN}${speaker.photo}`;
      }
      return null;
    },
    [imageCDN]
  );

  // Get speaker initials from name
  const getSpeakerInitials = useCallback((speaker) => {
    const name = speaker.value || speaker.name || "Unknown";
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, []);

  // Generate consistent color based on speaker name
  const getSpeakerColor = useCallback((speaker) => {
    const name = speaker.value || speaker.name || "Unknown";
    const colors = ["bg-primary-base", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);

  const generateSpeakerHTML = useCallback(
    (speakers) => {
      if (!speakers || speakers.length === 0) return null;

      const avatars = speakers.slice(0, 3).map((speaker, index) => {
        const speakerName = speaker.value || speaker.name || "Unknown";
        const imageUrl = speakerImage(speaker);
        const avatarKey = speaker._id || speaker.id || index;
        const avatarClass = `w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold ${index > 0 ? "md:-ml-3" : ""}`;

        if (imageUrl) {
          return <img key={avatarKey} className={avatarClass} src={imageUrl} alt={speakerName} />;
        } else {
          // Fallback avatar with initials
          const initials = getSpeakerInitials(speaker);
          const bgColor = getSpeakerColor(speaker);
          return (
            <div key={avatarKey} className={`${avatarClass} ${bgColor}`} title={speakerName}>
              {initials}
            </div>
          );
        }
      });

      const names =
        speakers.length > 2
          ? `${speakers
              .slice(0, 2)
              .map((s) => s.value || s.name)
              .join(", ")}, and others`
          : speakers.map((s) => s.value || s.name).join(" & ");

      return (
        <div className="flex items-center mt-3">
          <div className="flex items-center -space-x-2 md:space-x-0">{avatars}</div>
          <span className="text-sm font-medium text-gray-800 ml-2">{names}</span>
        </div>
      );
    },
    [speakerImage, getSpeakerInitials, getSpeakerColor]
  );

  const handleEditSession = (session) => {
    setSelectedSession(session);
    const eventTimezone = session?.rawData?.event?.timezone || "Asia/Kolkata";
    // Convert stored event-local times to UTC ISO for Date/Time inputs
    const startTimeUtc = session?.rawData?.startTime ? moment.tz(session.rawData.startTime, eventTimezone).utc().toISOString() : undefined;
    const endTimeUtc = session?.rawData?.endTime ? moment.tz(session.rawData.endTime, eventTimezone).utc().toISOString() : undefined;
    const formattedData = {
      ...session.rawData,
      startTime: startTimeUtc ?? session.rawData.startTime,
      endTime: endTimeUtc ?? session.rawData.endTime,
      stage: session.rawData.stage?._id || session.rawData.stage,
      sessiontype: session.rawData.sessiontype?._id || session.rawData.sessiontype,
      speakers: session.rawData.speakers?.map((speaker) => (typeof speaker === "object" ? speaker._id || speaker.id : speaker)) || [],
      ticket: session.rawData.ticket?.map((ticket) => (typeof ticket === "object" ? ticket._id || ticket.id : ticket)) || [],
    };

    setEditSessionData(formattedData);
    setOpenEditSessionModal(true);
  };

  const handleDeleteSession = async (sessionId, isSubSession = false) => {
    try {
      const response = await deleteData({ id: sessionId }, `mobile/sessions`);
      if (response.data.success) {
        if (isSubSession) {
          // Remove subsession from parent session
          setSessions((prevSessions) =>
            prevSessions.map((session) => ({
              ...session,
              subPrograms: session.subPrograms.filter((sub) => sub.id !== sessionId),
            }))
          );

          // Show success notification for sub-session deletion
          if (props.setMessage) {
            props.setMessage({
              type: 1,
              content: "Sub program deleted successfully!",
              proceed: "Okay",
              icon: "success",
            });
          }
        } else {
          // Remove main session from the state
          setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));

          // Show success notification for deletion
          if (props.setMessage) {
            props.setMessage({
              type: 1,
              content: "Session deleted successfully!",
              proceed: "Okay",
              icon: "success",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      if (props.setMessage) {
        props.setMessage("Error deleting session");
      }
    }
  };

  const showDeleteConfirmation = (session, isSubSession = false) => {
    setSessionToDelete({ session, isSubSession });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      await handleDeleteSession(sessionToDelete.session.id, sessionToDelete.isSubSession);
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };

  const handleAddSubSession = (session) => {
    setSelectedSession(session);
    setOpenAddSubSessionModal(true);
  };

  // Handle session details view - opens dashboard with session-specific data
  const handleSessionDetails = (session) => {
    setSelectedSession(session);
    setActiveTab("feedback"); // Default to feedback tab
    setOpenEventDashboard(true);
    fetchDashboardData(session.id); // Pass session ID to filter data
    fetchRatingCounts(session.id); // Fetch rating counts for the session
  };

  const generateSubProgramHTML = useCallback(
    (subProgram) => (
      <div key={subProgram.id} className="flex items-start justify-between">
        <div className="flex items-start flex-grow">
          <div className="w-[100px] text-center mr-4 md:mr-6 flex-shrink-0">
            <p className="text-sm font-semibold text-gray-700">{subProgram.startTime}</p>
            <p className="text-xs text-gray-500">{subProgram.duration}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800">{subProgram.title}</h4>
            <div className="chip bg-gray-100 border-gray-200 text-gray-700 mt-1.5">{subProgram.type}</div>
            {generateSpeakerHTML(subProgram.speakers)}
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2 md:ml-4">
          <button className="secondary-button text-xs py-1 px-3" onClick={() => handleEditSession({ ...subProgram, isSubSession: true })}>
            Edit
          </button>
          <button className="secondary-button text-xs py-1 px-3 text-red-600 hover:text-red-700" onClick={() => showDeleteConfirmation(subProgram, true)}>
            Delete
          </button>
        </div>
      </div>
    ),
    [generateSpeakerHTML]
  );

  const generateSessionHTML = useCallback(
    (session) => {
      const allSessionSpeakers = [...session.speakers, ...(session.subPrograms || []).flatMap((sp) => sp.speakers || [])];

      return (
        <div key={session.id} className="session-card" data-session-id={session.id} data-type={session.type} data-speakers={JSON.stringify(allSessionSpeakers)}>
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between">
              <div className="flex items-center md:items-start mb-3 md:mb-0">
                <div className="w-20 text-left md:text-center mr-4 md:mr-6 flex-shrink-0">
                  <p className="text-sm font-semibold text-primary-blue">{session.startTime}</p>
                  <p className="text-xs text-gray-500">{session.duration}</p>
                </div>
                <div className="w-px bg-gray-200 self-stretch hidden md:block md:mr-6"></div>
                <div className="flex-grow">
                  <h3 className="text-base font-semibold text-gray-900">{session.title}</h3>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>{session.stage}</span>
                    </div>
                    <div className="chip bg-purple-50 border-purple-200 text-purple-700">{session.type}</div>
                    {session.limitNumOfAttendees && <div className="chip bg-green-50 border-green-200 text-green-700">Booking Enabled ({session.numOfBookings})</div>}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-auto md:ml-4 mt-4 md:mt-0">
                <button className="secondary-button text-xs py-1 px-3" onClick={() => handleSessionDetails(session)}>
                  <svg className="w-4 h-4 mr-0 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                  <span className="hidden md:inline">View Details</span>
                </button>
                <button className="secondary-button text-xs py-1 px-3" onClick={() => handleAddSubSession(session)}>
                  <svg className="w-4 h-4 mr-0 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span className="hidden md:inline">Add Sub Program</span>
                </button>
                <button className="secondary-button text-xs py-1 px-3" onClick={() => handleEditSession(session)}>
                  Edit
                </button>
                <button className="secondary-button text-xs py-1 px-3 text-red-600 hover:text-red-700" onClick={() => showDeleteConfirmation(session, false)}>
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-4 md:pl-28">{generateSpeakerHTML(session.speakers)}</div>
          </div>
          {session.subPrograms.length > 0 && (
            <div className="pl-4 pr-4 pb-4 md:pl-12 md:pr-4 md:pb-4">
              <div className="border-t border-gray-200 pt-4 mt-4 md:ml-12 space-y-4">{session.subPrograms.map(generateSubProgramHTML)}</div>
            </div>
          )}
        </div>
      );
    },
    [generateSpeakerHTML, generateSubProgramHTML]
  );

  const renderSessions = useCallback(() => {
    let groups = {};

    const sessionsToRender = filteredSessions.length > 0 || activeFilters.types.length > 0 || activeFilters.speakers.length > 0 || searchTerm ? filteredSessions : sessions;

    if (currentGrouping === "day") {
      groups = sessionsToRender.reduce((acc, session) => {
        const key = session.dateKey;
        if (!acc[key]) {
          acc[key] = {
            meta: {
              weekday: session.weekday,
              date: session.date,
              sortDate: session.startDateTime,
            },
            sessions: [],
          };
        }
        acc[key].sessions.push(session);
        return acc;
      }, {});
    } else if (currentGrouping === "stage") {
      groups = sessionsToRender.reduce((acc, session) => {
        if (!acc[session.stage]) {
          acc[session.stage] = { sessions: [] };
        }
        acc[session.stage].sessions.push(session);
        return acc;
      }, {});
    }

    const sortedGroups = Object.entries(groups);
    if (currentGrouping === "day") {
      sortedGroups.sort(([, a], [, b]) => {
        return new Date(a.meta.sortDate) - new Date(b.meta.sortDate);
      });
    }

    return sortedGroups.map(([groupKey, groupData]) => {
      let dayNumber = 1;
      if (currentGrouping === "day") {
        const allDates = sortedGroups.map(([, data]) => data.meta.sortDate);
        const sortedDates = [...allDates].sort((a, b) => new Date(a) - new Date(b));
        dayNumber = sortedDates.findIndex((date) => date.getTime() === groupData.meta.sortDate.getTime()) + 1;
      }

      return (
        <div key={groupKey}>
          <SubPageHeader title={currentGrouping === "day" ? `Day ${dayNumber}` : groupKey} description="" />
          {props.openData.data.timezone && (
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-500">{currentGrouping === "day" ? `${groupData.meta.weekday}, ${groupData.meta.date}` : ""}</div>
              <div className="text-sm text-gray-500">Timezone: {props.openData.data.timezone}</div>
            </div>
          )}
          <div className="space-y-5 mt-4">{groupData.sessions.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)).map(generateSessionHTML)}</div>
        </div>
      );
    });
  }, [currentGrouping, generateSessionHTML, sessions, filteredSessions, activeFilters, searchTerm]);

  const applyActiveFiltersAndSearch = useCallback(() => {
    const filtered = sessions.filter((session) => {
      const allSessionSpeakers = [...session.speakers, ...(session.subPrograms || []).flatMap((sp) => sp.speakers || [])];

      const typeMatch = activeFilters.types.length === 0 || activeFilters.types.includes(session.type);
      const speakerMatch = activeFilters.speakers.length === 0 || activeFilters.speakers.some((speakerId) => allSessionSpeakers.some((speaker) => (speaker._id || speaker.id) === speakerId));
      const searchMatch = searchTerm === "" || session.title.toLowerCase().includes(searchTerm.toLowerCase());

      return typeMatch && speakerMatch && searchMatch;
    });

    setFilteredSessions(filtered);
  }, [activeFilters, searchTerm, sessions]);

  const loadMoreSessions = () => {
    if (!loading && hasMore) {
      setSkip((prev) => prev + limit);
    }
  };

  useEffect(() => {
    applyActiveFiltersAndSearch();
  }, [applyActiveFiltersAndSearch]);

  const handleGroupByChange = (group) => {
    setCurrentGrouping(group);
  };

  const toggleFilterPanel = (open) => {
    setIsFilterPanelOpen(open);
  };

  const handleApplyFilters = () => {
    const typeCheckboxes = document.querySelectorAll("#type-filters input:checked");
    const speakerCheckboxes = document.querySelectorAll("#speaker-filters input:checked");

    const types = Array.from(typeCheckboxes).map((el) => el.value);
    const speakers = Array.from(speakerCheckboxes).map((el) => el.value);

    setActiveFilters({ types, speakers });
    toggleFilterPanel(false);
  };

  const handleFormSubmit = async (data, isSubSession = false) => {
    try {
      const submitData = {
        event: eventId,
        ...data,
      };

      if (isSubSession && selectedSession) {
        submitData.isSubSession = true;
        submitData.parentSession = selectedSession.id;
      }

      const response = await postData(submitData, "mobile/sessions");

      if (response.data.success) {
        if (!response.data.data) {
          if (props.setMessage) {
            props.setMessage("Invalid response from server");
          }
          return;
        }

        const newSession = transformSessionData([response.data.data])[0];

        if (!newSession || !newSession.id) {
          if (props.setMessage) {
            props.setMessage("Failed to process session data");
          }
          return;
        }

        if (isSubSession && selectedSession) {
          setSessions((prevSessions) =>
            prevSessions.map((session) =>
              session.id === selectedSession.id
                ? {
                    ...session,
                    subPrograms: [
                      ...session.subPrograms,
                      {
                        id: newSession.id,
                        title: newSession.title,
                        startTime: newSession.startTime,
                        duration: newSession.duration,
                        type: newSession.type,
                        speakers: newSession.speakers,
                        rawData: newSession,
                      },
                    ],
                  }
                : session
            )
          );
          setOpenAddSubSessionModal(false);
          setSelectedSession(null);

          if (props.setMessage) {
            props.setMessage({
              type: 1,
              content: "Sub program added successfully!",
              proceed: "Okay",
              icon: "success",
            });
          }
        } else {
          setSessions((prevSessions) => [newSession, ...prevSessions]);
          setOpenAddSessionModal(false);

          if (props.setMessage) {
            props.setMessage({
              type: 1,
              content: "Session added successfully!",
              proceed: "Okay",
              icon: "success",
            });
          }
        }
      } else {
        if (props.setMessage) {
          props.setMessage("Failed to save session");
        }
      }
    } catch (error) {
      if (props.setMessage) {
        props.setMessage("Error submitting form");
      }
    }
  };

  const handleEditFormSubmit = async (data) => {
    try {
      if (data.speakers && Array.isArray(data.speakers)) {
        data.speakers = data.speakers.map((speaker) => {
          if (typeof speaker === "object" && (speaker._id || speaker.id)) {
            return speaker._id || speaker.id;
          }
          return speaker;
        });
      }

      const submitData = {
        id: selectedSession.id,
        event: eventId,
        ...data,
      };

      const response = await putData(submitData, `mobile/sessions`);

      if (response.data.success) {
        if (!response.data.data) {
          if (props.setMessage) {
            props.setMessage("Invalid response from server");
          }
          return;
        }

        const updatedSession = transformSessionData([response.data.data])[0];

        if (!updatedSession || !updatedSession.id) {
          if (props.setMessage) {
            props.setMessage("Failed to process updated session data");
          }
          return;
        }

        if (selectedSession.isSubSession) {
          setSessions((prevSessions) =>
            prevSessions.map((session) => ({
              ...session,
              subPrograms: session.subPrograms.map((sub) =>
                sub.id === selectedSession.id
                  ? {
                      id: updatedSession.id,
                      title: updatedSession.title,
                      startTime: updatedSession.startTime,
                      duration: updatedSession.duration,
                      type: updatedSession.type,
                      speakers: updatedSession.speakers,
                      rawData: updatedSession.rawData,
                    }
                  : sub
              ),
            }))
          );
        } else {
          setSessions((prevSessions) => prevSessions.map((session) => (session.id === selectedSession.id ? { ...updatedSession, subPrograms: session.subPrograms } : session)));
        }

        setOpenEditSessionModal(false);
        setSelectedSession(null);

        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: selectedSession.isSubSession ? "Sub program updated successfully!" : "Sub program updated successfully!",
            proceed: "Okay",
            icon: "success",
          });
        }
      } else {
        if (props.setMessage) {
          props.setMessage("Failed to update session");
        }
      }
    } catch (error) {
      if (props.setMessage) {
        props.setMessage("Error updating session");
      }
    }
  };

  // Fetch dynamic dashboard data
  const fetchDashboardData = async (sessionId = null) => {
    if (!eventId) return;

    setDashboardLoading(true);
    try {
      // Build filter object - include session filter if viewing specific session
      const feedbackFilter = { event: eventId };
      const pollsFilter = { event: eventId };
      const questionsFilter = { event: eventId };

      if (sessionId) {
        feedbackFilter.session = sessionId;
        pollsFilter.session = sessionId;
        questionsFilter.session = sessionId;
      }

      // Fetch feedback data using correct endpoint
      const feedbackResponse = await getData(feedbackFilter, "feedback-session");
      const feedbackData = feedbackResponse?.data?.response || [];
      setFeedbackCount(feedbackData.length);

      // Fetch rating counts from backend API
      await fetchRatingCounts(sessionId);

      // Fetch polls data using correct endpoint
      const pollsResponse = await getData(pollsFilter, "poll");
      const pollsData = pollsResponse?.data?.response || [];
      setPollCount(pollsData.length);

      // Fetch questions data using correct endpoint
      const questionsResponse = await getData(questionsFilter, "ask-question");
      const questionsData = questionsResponse?.data?.response || [];
      setQuestionCount(questionsData.length);

      // Fetch attendees data using form-registration endpoint (not session-specific)
      const attendeesResponse = await getData({ event: eventId }, "form-registration");
      const attendeesData = attendeesResponse?.data?.response || [];
      setAttendeeCount(attendeesData.length);

      // For RSVP settings, we'll use a default structure since no specific endpoint exists
      const rsvpData = {
        description: "You are cordially invited to attend our event. Please confirm your attendance by clicking the link below.",
        deadline: new Date().toISOString().split("T")[0],
        link: `https://events.eventhex.ai/rsvp/${eventId}`,
      };

      setDashboardData({
        feedback: feedbackData,
        polls: pollsData,
        questions: questionsData,
        attendees: attendeesData,
        rsvpSettings: rsvpData,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set default data if API calls fail
      setDashboardData({
        feedback: [],
        polls: [],
        questions: [],
        attendees: [],
        rsvpSettings: {
          description: "You are cordially invited to attend our event. Please confirm your attendance by clicking the link below.",
          deadline: new Date().toISOString().split("T")[0],
          link: `https://events.eventhex.ai/rsvp/${eventId}`,
        },
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  // Handle dashboard modal open
  const handleDashboardOpen = () => {
    setSelectedSession(null); // Clear any selected session for general event view
    setOpenEventDashboard(true);
    fetchDashboardData();
    fetchRatingCounts(); // Fetch rating counts for the event
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const response = await deleteData({ id: feedbackId }, "feedback-session");
      if (response.data.success) {
        setDashboardData((prev) => ({
          ...prev,
          feedback: prev.feedback.filter((f) => f._id !== feedbackId),
        }));
        setFeedbackCount((prev) => prev - 1);
        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "Feedback deleted successfully!",
            proceed: "Okay",
            icon: "success",
          });
        }
      } else {
        if (props.setMessage) {
          props.setMessage("Error deleting feedback");
        }
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      if (props.setMessage) {
        props.setMessage("Error deleting feedback");
      }
    }
  };

  const handleDeletePoll = async (pollId) => {
    try {
      const response = await deleteData({ id: pollId }, "poll");
      if (response.data.success) {
        setDashboardData((prev) => ({
          ...prev,
          polls: prev.polls.filter((p) => p._id !== pollId),
        }));
        setPollCount((prev) => prev - 1);
        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "Poll deleted successfully!",
            proceed: "Okay",
            icon: "success",
          });
        }
      } else {
        if (props.setMessage) {
          props.setMessage("Error deleting poll");
        }
      }
    } catch (error) {
      console.error("Error deleting poll:", error);
      if (props.setMessage) {
        props.setMessage("Error deleting poll");
      }
    }
  };

  // Handle poll form submission
  const handlePollFormSubmit = async (formData) => {
    try {
      // Transform form data to match poll model structure
      const pollData = {
        session: formData.session,
        pollNumber: formData.pollNumber || 1,
        event: eventId,
        user: props.user?._id || props.user?.id,
        options: [
          { text: formData.option1, votes: 0 },
          { text: formData.option2, votes: 0 },
          ...(formData.option3 ? [{ text: formData.option3, votes: 0 }] : []),
          ...(formData.option4 ? [{ text: formData.option4, votes: 0 }] : []),
        ],
        active: true,
      };

      const response = await postData(pollData, "poll");
      if (response.data.success) {
        // Refresh dashboard data
        await fetchDashboardData();
        setOpenAddPollModal(false);

        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "Poll created successfully!",
            proceed: "Okay",
            icon: "success",
          });
        }
      } else {
        if (props.setMessage) {
          props.setMessage("Error creating poll");
        }
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      if (props.setMessage) {
        props.setMessage("Error creating poll");
      }
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const response = await deleteData({ id: questionId }, "ask-question");
      if (response.data.success) {
        setDashboardData((prev) => ({
          ...prev,
          questions: prev.questions.filter((q) => q._id !== questionId),
        }));
        setQuestionCount((prev) => prev - 1);
        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "Question deleted successfully!",
            proceed: "Okay",
            icon: "success",
          });
        }
      } else {
        if (props.setMessage) {
          props.setMessage("Error deleting question");
        }
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      if (props.setMessage) {
        props.setMessage("Error deleting question");
      }
    }
  };

  const handleViewAttendee = (attendee) => {
    // Show attendee details in a modal or navigate to attendee page
    if (props.setMessage) {
      props.setMessage({
        type: 1,
        content: `Viewing details for ${attendee.fullName || attendee.name || "Unknown User"}`,
        proceed: "Okay",
        icon: "info",
      });
    }
  };

  const handleDeleteAttendee = async (attendeeId) => {
    try {
      const response = await deleteData({ id: attendeeId }, "form-registration");
      if (response.data.success) {
        setDashboardData((prev) => ({
          ...prev,
          attendees: prev.attendees.filter((a) => a._id !== attendeeId),
        }));
        setAttendeeCount((prev) => prev - 1);
        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "Attendee deleted successfully!",
            proceed: "Okay",
            icon: "success",
          });
        }
      } else {
        if (props.setMessage) {
          props.setMessage("Error deleting attendee");
        }
      }
    } catch (error) {
      console.error("Error deleting attendee:", error);
      if (props.setMessage) {
        props.setMessage("Error deleting attendee");
      }
    }
  };

  const handleCopyRSVPLink = (link) => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "RSVP link copied to clipboard!",
            proceed: "Okay",
            icon: "success",
          });
        }
      })
      .catch(() => {
        if (props.setMessage) {
          props.setMessage("Failed to copy link to clipboard");
        }
      });
  };

  const handleGenerateNewRSVPLink = async () => {
    try {
      const newLink = `https://events.eventhex.ai/rsvp/${eventId}-${Date.now()}`;

      // Since we don't have an rsvp-settings API, just update local state
      setDashboardData((prev) => ({
        ...prev,
        rsvpSettings: {
          ...prev.rsvpSettings,
          link: newLink,
        },
      }));

      if (props.setMessage) {
        props.setMessage({
          type: 1,
          content: "New RSVP link generated successfully!",
          proceed: "Okay",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error generating new RSVP link:", error);
      if (props.setMessage) {
        props.setMessage("Error generating new RSVP link");
      }
    }
  };

  const handleViewPollDetails = (poll) => {
    // Show poll details in a modal
    if (props.setMessage) {
      const totalVotes = poll.totalResponses || poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
      const optionsText =
        poll.options
          ?.map((option, index) => {
            const percentage = totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
            return `${option.text}: ${option.votes || 0} votes (${percentage}%)`;
          })
          .join("\n") || "No options available";

      props.setMessage({
        type: 1,
        content: `Poll: ${poll.question}\n\nOptions:\n${optionsText}\n\nTotal Responses: ${totalVotes}`,
        proceed: "Close",
        icon: "info",
        title: "Poll Details",
      });
    }
  };

  return (
    <>
      <style>
        {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                    
                    :root {
                        --primary-blue: #4F46E5;
                        --primary-blue-hover: #4338CA;
                        --danger-red: #EF4444;
                        --danger-red-hover: #DC2626;
                        --gray-50: #F9FAFB;
                        --gray-100: #F3F4F6;
                        --gray-200: #E5E7EB;
                        --gray-300: #D1D5DB;
                        --gray-400: #9CA3AF;
                        --gray-600: #4B5563;
                        --gray-900: #111827;
                        --white: #FFFFFF;
                    }
                    
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        background-color: #FFFFFF;
                    }
                    
                    .primary-button {
                        background-color: var(--primary-blue);
                        color: white;
                        padding: 10px 16px;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        display: inline-flex;
                        align-items: center;
                        cursor: pointer;
                        transition: background-color 0.2s;
                        justify-content: center;
                        border: none;
                    }
                    .primary-button:hover {
                        background-color: var(--primary-blue-hover);
                    }

                    .secondary-button {
                        background-color: white;
                        color: var(--gray-900);
                        padding: 8px 14px;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        border: 1px solid var(--gray-200);
                        display: inline-flex;
                        align-items: center;
                        cursor: pointer;
                        transition: background-color 0.2s, border-color 0.2s;
                        justify-content: center;
                    }
                    .secondary-button:hover {
                        background-color: var(--gray-50);
                    }
                    .secondary-button.active {
                        background-color: var(--gray-100);
                        border-color: var(--gray-300);
                    }

                    .danger-button {
                        background-color: var(--danger-red);
                        color: var(--white);
                        padding: 8px 16px;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        border: 1px solid transparent;
                        transition: background-color 0.2s;
                    }
                    .danger-button:hover {
                        background-color: var(--danger-red-hover);
                    }
                    .secondary-button.text-red-600:hover {
                        background-color: #FEF2F2;
                        border-color: #FCA5A5;
                    }

                    .chip {
                        display: inline-flex;
                        align-items: center;
                        padding: 4px 10px;
                        border-radius: 16px;
                        font-weight: 500;
                        font-size: 12px;
                        border: 1px solid;
                        flex-shrink: 0;
                    }
                    
                    .session-card {
                         background-color: #FFFFFF;
                         border: 1px solid var(--gray-200);
                         border-radius: 8px;
                         box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07);
                         transition: opacity 0.3s, transform 0.3s;
                    }
                    .session-card.hidden {
                        display: none;
                    }

                    /* Filter Panel Styles */
                    #filter-panel {
                        transition: transform 0.3s ease-in-out;
                        transform: translateX(100%);
                    }
                    #filter-panel.open {
                        transform: translateX(0);
                    }
                    .filter-overlay {
                        transition: opacity 0.3s ease-in-out;
                    }

                    /* Focus styles for accessibility */
                    .primary-button:focus,
                    .secondary-button:focus {
                        outline: 2px solid var(--primary-blue);
                        outline-offset: 2px;
                    }

                    input:focus {
                        outline: 2px solid var(--primary-blue);
                        outline-offset: 2px;
                    }

                    /* Loading spinner animation */
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    .animate-spin {
                        animation: spin 1s linear infinite;
                    }

                    /* Responsive adjustments */
                    @media (max-width: 768px) {
                        .session-card {
                            margin-bottom: 1rem;
                        }
                        
                        .primary-button,
                        .secondary-button {
                            width: 100%;
                            justify-content: center;
                        }
                    }
                `}
      </style>
      <div className="">
        <div className=" mx-auto">
          <PageHeader line={false} dynamicClass="sub inner" title="Agenda & Sessions" description="Organize your event's schedule by adding sessions, workshops, and keynotes." />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 mt-4">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter
                className={"filter-button" + (isFilterPanelOpen ? "active" : "")}
                onClick={() => {
                  toggleFilterPanel(true);
                }}
              >
                <div className="flex items-center gap-2  justify-end">
                  <GetIcon icon={"filter"} />
                  <span className="text-sm">Filter</span>
                </div>
              </Filter>
              <Search title={"Search"} placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2 self-start md:self-center mr-0 ml-auto">
              <span className="text-sm font-medium text-gray-600">Group by:</span>
              <button className={`secondary-button p-2 group-by-btn ${currentGrouping === "day" ? "active" : ""}`} onClick={() => handleGroupByChange("day")}>
                Day
              </button>
              <button className={`secondary-button px-2 group-by-btn ${currentGrouping === "stage" ? "active" : ""}`} onClick={() => handleGroupByChange("stage")}>
                Stage
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <AddButton onClick={() => setOpenAddSessionModal(true)}>
                <AddIcon></AddIcon>
                <span>Add Session</span>
              </AddButton>
            </div>
          </div>

          {/* Sessions Container */}
          <div className="space-y-8">{renderSessions()}</div>

          {/* Load More / Loader */}
          {sessions.length > 0 && (
            <div className="mt-8 text-center">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3">
                    <div className="animate-pulse">
                      <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <span className="text-gray-600">Loading more sessions...</span>
                  </div>
                </div>
              ) : hasMore ? (
                <button onClick={loadMoreSessions} className="primary-button">
                  Load More Sessions
                </button>
              ) : (
                <p className="text-gray-500">No more sessions to load</p>
              )}
            </div>
          )}

          {/* Initial Loading State */}
          {sessions.length === 0 && loading && <SessionsShimmer />}

          {/* No Sessions Message */}
          {sessions.length === 0 && !loading && (
            // <div className="text-center py-12">
            //   <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            //   </svg>
            //   <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions</h3>
            //   <p className="mt-1 text-sm text-gray-500">Get started by creating your first session.</p>
            // </div>
            <NoDataFound
              shortName={"Sessions"}
              icon={"session"}
              addPrivilege={true}
              addLabel={"Add Session"}
              isCreatingHandler={() => setOpenAddSessionModal(true)}
              className="white-list"
              description={"Get started by creating your first session."}
            ></NoDataFound>
          )}
        </div>

        {/* Filter Panel */}
        <div className={`fixed inset-0 z-40 overflow-hidden ${isFilterPanelOpen ? "" : "pointer-events-none"}`}>
          <div
            className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isFilterPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => toggleFilterPanel(false)}
          ></div>
          <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ${isFilterPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filter Sessions</h2>
                <button className="p-2 -mr-2 text-gray-500 hover:text-gray-800" onClick={() => toggleFilterPanel(false)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              {/* Filters */}
              <div className="p-6 flex-grow overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-500 mb-2">SESSION TYPE</h3>
                <div id="type-filters" className="space-y-2">
                  {allTypes.map((type) => (
                    <label key={type} className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" value={type} className="h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue" defaultChecked={activeFilters.types.includes(type)} />
                      <span className="text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>

                <h3 className="text-sm font-medium text-gray-500 mt-6 mb-2">SPEAKERS</h3>
                <div id="speaker-filters" className="space-y-2">
                  {allSpeakers.map((speaker) => {
                    const speakerId = speaker._id || speaker.id;
                    const speakerName = speaker.value || speaker.name || "Unknown";
                    const imageUrl = speakerImage(speaker);
                    return (
                      <label key={speakerId} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value={speakerId}
                          className="h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                          defaultChecked={activeFilters.speakers.includes(speakerId)}
                        />
                        {imageUrl ? (
                          <img className="w-6 h-6 rounded-full" src={imageUrl} alt={speakerName} />
                        ) : (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getSpeakerColor(speaker)}`} title={speakerName}>
                            {getSpeakerInitials(speaker)}
                          </div>
                        )}
                        <span className="text-gray-700">{speakerName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <button className="w-full primary-button justify-center" onClick={handleApplyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Session Modal */}
        {openAddSessionModal && (
          <div className="z-[9999999]">
            <AutoForm
              header="Add Session"
              api="mobile/sessions"
              formType="post"
              formInput={sessionFields}
              formMode="single"
              isOpenHandler={() => setOpenAddSessionModal(false)}
              setLoaderBox={props.setLoaderBox}
              setMessage={props.setMessage}
              parentReference={"event"}
              referenceId={props.openData.data._id}
              onClose={() => setOpenAddSessionModal(false)}
              onCancel={() => setOpenAddSessionModal(false)}
              submitHandler={handleFormSubmit}
              // disabled={isSubmitting}
            />
          </div>
        )}

        {/* Edit Session Modal */}
        {openEditSessionModal && selectedSession && (
          <AutoForm
            header="Edit Session"
            api="mobile/sessions"
            formType="put"
            formInput={sessionFields}
            formMode="single"
            formValues={editSessionData}
            isOpenHandler={() => {
              setOpenEditSessionModal(false);
              setSelectedSession(null);
            }}
            setLoaderBox={props.setLoaderBox}
            setMessage={props.setMessage}
            parentReference={"event"}
            referenceId={props.openData.data._id}
            onClose={() => {
              setOpenEditSessionModal(false);
              setSelectedSession(null);
            }}
            onCancel={() => {
              setOpenEditSessionModal(false);
              setSelectedSession(null);
            }}
            submitHandler={handleEditFormSubmit}
          />
        )}

        {/* Add Sub-Session Modal */}
        {openAddSubSessionModal && selectedSession && (
          <AutoForm
            header="Add Sub-Session"
            api="mobile/sessions"
            formType="post"
            formInput={sessionFields}
            formMode="single"
            isOpenHandler={() => {
              setOpenAddSubSessionModal(false);
              setSelectedSession(null);
            }}
            setLoaderBox={props.setLoaderBox}
            setMessage={props.setMessage}
            parentReference={"event"}
            referenceId={props.openData.data._id}
            onClose={() => {
              setOpenAddSubSessionModal(false);
              setSelectedSession(null);
            }}
            onCancel={() => {
              setOpenAddSubSessionModal(false);
              setSelectedSession(null);
            }}
            submitHandler={(data) => handleFormSubmit(data, true)}
          />
        )}

        {/* Delete Confirmation Modal */}
        <div
          className={`panel-container fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 p-4 ${
            isDeleteModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className={`bg-white rounded-lg shadow-xl w-full max-w-md p-4 md:p-6 transform transition-transform duration-200 ${isDeleteModalOpen ? "scale-100" : "scale-95"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-3 md:mb-4">
              <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Delete {sessionToDelete?.isSubSession ? "Sub Program" : "Session"}</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                Are you sure you want to delete <span className="font-medium">{sessionToDelete?.session?.title}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="secondary-button text-xs md:text-sm">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="danger-button text-xs md:text-sm">
                Delete {sessionToDelete?.isSubSession ? "Sub Program" : "Session"}
              </button>
            </div>
          </div>
        </div>

        {/* Event Management Dashboard - Full Page View */}
        {openEventDashboard && selectedSession && (
          <>
            <style>
              {`
                .eh-session-details-header .popup-child > .custom {
                  border-bottom: none !important;
                }
              `}
            </style>
            <PopupView
              popupData={
                <div className="flex flex-col h-full">
                  {/* Tab Navigation (Core TabButtons) */}
                  <div className="px-6 py-3 bg-white border-stroke-soft">
                    <TabButtons
                      tabs={[
                        { key: "feedback", title: "Feedback" },
                        { key: "poll", title: "Poll" },
                        { key: "questions", title: "Questions" },
                      ]}
                      selectedTab={activeTab}
                      selectedChange={(key) => setActiveTab(key)}
                      design="underline"
                    />
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {/* Feedback Tab */}
                    {activeTab === "feedback" && (
                      <div className="px-3 md:px-6">
                        {dashboardLoading ? (
                          <SimpleShimmer />
                        ) : (
                          <>
                            {/* Title */}
                            {/* <SubPageHeader title="Session Feedback" description="All feedback from attendees" line={false} /> */}
                            {/* Rating Distribution Widget - Rendered separately (not using ListTable's built-in counts) */}
                            {(() => {
                              const labels = getRatingDistributionLabels();
                              // Custom MetricTile render to show emojis instead of icons (dynamic design)
                              return (
                                <div className="border border-stroke-soft rounded-[16px] p-4 mb-4 mt-6">
                                  <div className="flex gap-5 flex-wrap">
                                    {labels.map((label, index) => {
                                      const metricData = ratingCounts?.[label.key] ?? {};
                                      const emoji = emojiFor(label.key);
                                      return (
                                        <div key={label.key || index} className="flex items-center gap-4 flex-1 min-w-[140px] border-r border-stroke-soft last:border-r-0 pr-5 last:pr-0">
                                          {/* Emoji in circular background (like MetricTile icon) */}
                                          <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: label.backgroundColor }}>
                                            <span className="text-xl" aria-hidden>
                                              {emoji}
                                            </span>
                                          </div>
                                          {/* Label and Count - matching MetricTile structure */}
                                          <div className="flex flex-col gap-1">
                                            <div className="text-[11px] font-medium text-text-soft leading-[12px] uppercase">{label.title}</div>
                                            <div className="text-base font-medium text-text-main leading-[19.36px]">{metricData?.count || "0%"}</div>
                                            {metricData?.total !== undefined && (
                                              <div className="text-xs text-text-sub mt-0.5">
                                                {metricData.total}
                                                {metricData?.suffix || (metricData.total === 1 ? " response" : " responses")}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                            {(() => {
                              const stats = getFeedbackStats(dashboardData.feedback);
                              return (
                                <div className="flex justify-end mb-2">
                                  <div className="flex flex-col items-end">
                                    <div className="text-text-main text-base font-semibold">{stats.score}/5</div>
                                    <div className="text-text-sub text-xs">Based on {stats.total} responses</div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Feedback list - ListTable */}
                            <div className="mt-6">
                              <ListTable
                                key={feedbackTableKey}
                                api="feedback-session"
                                shortName="Feedback"
                                attributes={feedbackAttributes}
                                formMode="single"
                                viewMode="table"
                                addPrivilege={false}
                                updatePrivilege={false}
                                delPrivilege={false}
                                showTitle={false}
                                preFilter={{
                                  event: eventId,
                                  ...(selectedSession?._id || selectedSession?.id ? { session: selectedSession._id || selectedSession.id } : {}),
                                }}
                                defaultSort={{ field: "createdAt", order: "desc" }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Poll Tab */}
                    {activeTab === "poll" && (
                      <div className="h-full">
                        <PollAnalyticsDashboard eventId={eventId} sessionId={selectedSession?._id || selectedSession?.id} sessionMeta={selectedSession} setMessage={props.setMessage} />
                      </div>
                    )}

                    {/* Questions Tab */}
                    {activeTab === "questions" && (
                      <div className="px-3 md:px-6">
                        {/* Questions list - ListTable */}
                        <ListTable
                          key={questionsTableKey}
                          api="ask-question"
                          shortName="Questions"
                          attributes={askQuestionAttributes}
                          formMode="single"
                          viewMode="table"
                          addPrivilege={false}
                          updatePrivilege={false}
                          delPrivilege={false}
                          showTitle={false}
                          preFilter={{
                            event: eventId,
                            ...(selectedSession?._id || selectedSession?.id ? { session: selectedSession._id || selectedSession.id } : {}),
                          }}
                          defaultSort={{ field: "createdAt", order: "desc" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              }
              themeColors={themeColors}
              closeModal={() => {
                setOpenEventDashboard(false);
                setSelectedSession(null);
              }}
              customClass="full-page eh-session-details-header"
              itemTitle={{
                name: "title",
                type: "text",
                collection: "",
                render: (value, rowData) => (
                  <div className="px-6 pt-6 pb-4">
                    <SubPageHeader
                      title={`Session Details: ${selectedSession?.title || ""}`}
                      description={`${selectedSession?.startTime || ""} • ${selectedSession?.duration || ""} • ${selectedSession?.stage || ""}`}
                      line={false}
                      dynamicClass="custom"
                    />
                  </div>
                ),
              }}
              description=""
              openData={{
                data: {
                  _id: selectedSession?._id || selectedSession?.id || "session-details",
                  title: `Session Details: ${selectedSession?.title || ""}`,
                },
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Sessions;
