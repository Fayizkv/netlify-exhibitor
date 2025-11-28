import React, { useState, useEffect, useCallback, useRef } from "react";
import { getData, postData, deleteData, putData } from "../../../../backend/api";
import AutoForm from "../../../core/autoform/AutoForm";
import { dateFormat, timeFormat } from "../../../core/functions/date";
import { PageHeader, SubPageHeader } from "../../../core/input/heading";
import { AddButton, Filter } from "../../../core/list/styles";
import { AddIcon, GetIcon } from "../../../../icons";
import Search from "../../../core/search";
import NoDataFound from "../../../core/list/nodata";
import moment from "moment";
import UploadAudio from "../event/uploadAudio";
import PopupView from "../../../core/popupview";
import LiveTest from "../liveTest";
import Message from "../../../core/message";
import { SessionHeader } from "../../../core/header";
import { Calendar } from "lucide-react";
import Checkbox from "../../../core/checkbox";
import { Button } from "../../../core/elements";
import CustomLabel from "../../../core/input/label";

// Audio Process Loader Component
const AudioProcessLoader = ({ status }) => {
  const getProgressPercentage = (status) => {
    switch (status) {
      case "queued":
        return 10;
      case "converting":
        return 20;
      case "converted":
        return 30;
      case "transcribing":
        return 50;
      case "summarizing":
        return 80;
      // case "translating": return 90;
      case "failed":
        return 0;
      default:
        return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "failed":
        return "bg-state-error";
      case "queued":
        return "bg-green-500";
      case "converting":
        return "bg-green-700";
      case "converted":
        return "bg-green-700";
      case "transcribing":
        return "bg-green-700";
      case "summarizing":
        return "bg-green-700";
      // case "translating": return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "queued":
        return "Queued";
      case "converting":
        return "Converting";
      case "converted":
        return "Converted";
      case "transcribing":
        return "Transcribing";
      case "summarizing":
        return "Summarizing";
      case "translating":
        return "Translating";
      case "failed":
        return "Failed";
      default:
        return "Processing";
    }
  };

  const progress = getProgressPercentage(status);
  const colorClass = getStatusColor(status);
  const statusText = getStatusText(status);

  if (status === "failed") {
    return (
      <button className="secondary-button text-xs py-1 px-3 bg-state-error text-white hover:bg-red-600">
        <svg className="w-4 h-4 mr-0 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="hidden md:inline">{statusText}</span>
      </button>
    );
  }

  return (
    <button className="secondary-button text-xs py-1 px-3 bg-bg-weak text-text-main hover:bg-bg-soft relative overflow-hidden">
      {/* Progress bar background */}
      <div className="absolute inset-0 bg-gray-200"></div>

      {/* Progress bar fill */}
      <div className={`absolute inset-0 ${colorClass} transition-all duration-500 ease-out`} style={{ width: `${progress}%` }}></div>

      {/* Content */}
      <div className="relative flex items-center">
        <svg className="w-4 h-4 mr-0 md:mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="hidden md:inline">{statusText}</span>
      </div>
    </button>
  );
};

// Custom Shimmer Component for Sessions Transcripts Page
const SessionsTranscriptsShimmer = () => (
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
                            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-auto md:ml-4 mt-4 md:mt-0">
                      <div className="animate-pulse">
                        <div className="h-8 w-24 bg-gray-200 rounded"></div>
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
  const [activeFilters, setActiveFilters] = useState({ types: [], speakers: [], transcribedAudios: false });
  const [filterState, setFilterState] = useState({ types: [], speakers: [], transcribedAudios: false });
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
  const [openAudioUploadModal, setOpenAudioUploadModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState(null);
  const [editSessionData, setEditSessionData] = useState(null);

  // Function to generate session URL
  const generateSessionUrl = (sessionId) => {
    // Helper function to extract default eventhex domain
    const extractDefaultEventhexDomain = (domains) => {
      if (!Array.isArray(domains)) return null;
      const match = domains.find((d) => (d?.appType === "eventhex" || d?.route === "eventhex") && d?.isDefault === true && typeof d?.domain === "string" && d?.domain?.length > 0);
      return match ? match.domain : null;
    };

    // Helper function to get cached domain
    const getCachedEventDomain = (eventId) => {
      try {
        return localStorage.getItem(`eventhex:domain:${eventId}`);
      } catch (e) {
        return null;
      }
    };

    // Helper function to cache domain
    const cacheEventDomain = (eventId, domain) => {
      try {
        if (eventId && domain) {
          localStorage.setItem(`eventhex:domain:${eventId}`, domain);
        }
      } catch (e) {}
    };

    // Check cache first
    const cachedDomain = getCachedEventDomain(eventId);
    if (cachedDomain) {
      const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
      return sessionId ? `${websiteUrl}/instarecap/sessions/${sessionId}` : `${websiteUrl}/instarecap/sessions/sessionId`;
    }

    // If not cached, fetch and cache for future use
    getData({ event: eventId }, "whitelisted-domains").then((domainRes) => {
      if (domainRes?.status === 200) {
        const defaultDomain = extractDefaultEventhexDomain(domainRes?.data?.response || []);
        if (defaultDomain) {
          cacheEventDomain(eventId, defaultDomain);
        } else {
          // Fallback to regular website URL if no default domain is set
          getData({ id: eventId }, "event/website").then((res) => {
            if (res?.status === 200 && res?.data?.data) {
              const websiteUrl = res.data.data.includes("http") ? res.data.data : `https://${res.data.data}`;
              cacheEventDomain(eventId, websiteUrl);
            }
          });
        }
      }
    });

    // Return fallback URL while fetching
    return sessionId ? `example.com/instarecap/sessions/${sessionId}` : "example.com/instarecap/sessions/sessionId";
  };
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
    // {
    //   type: "text",
    //   name: "audioProcess",
    //   label: "Audio Process",
    //   view: true,
    //   add: false,
    //   update: true,
    //   default: "",
    //   tag: false,
    //   required: false,
    //   view: true,
    //   add: true,
    //   update: true,
    // },
  ]);
  const [avCode, setAvCode] = useState(null);
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [audioSavedSuccessfully, setAudioSavedSuccessfully] = useState(false);
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [translatedLanguages, setTranslatedLanguages] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({});
  const loadMoreRef = useRef(null);

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

  // Format audio length from seconds to MM:SS format
  const formatAudioLength = (seconds) => {
    if (!seconds || seconds === 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Function to reload sessions data
  const reloadSessions = useCallback(async () => {
    if (eventId) {
      setLoading(true);
      try {
        // Reset pagination
        setSkip(0);
        setSessions([]);
        setHasMore(true);

        const response = await getData({ event: eventId, limit, skip: 0 }, "sessions");
        const transformedSessions = transformSessionData(response.data.response);
        const mainSessions = transformedSessions.filter((session) => !session.isSubSession);

        setSessions(mainSessions);
        setHasMore(response.data.response.length === 10);
      } catch (error) {
        console.error("Error reloading sessions:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [eventId]);

  // Function to fetch audio status for all sessions
  const fetchAudioStatus = useCallback(async () => {
    if (eventId && sessions.length > 0) {
      try {
        const response = await getData({ event: eventId }, "sessions/audio-status");
        if (response.data.success) {
          const audioStatus = response.data.data;

          // Update sessions with new audio status
          setSessions((prevSessions) =>
            prevSessions.map((session) => {
              const sessionId = session.id;
              if (audioStatus[sessionId]) {
                console.log("audioStatus[sessionId]", audioStatus[sessionId]);
                return {
                  ...session,
                  audioProcess: audioStatus[sessionId].audioProcess || null,
                  isLive: audioStatus[sessionId].isLive || false,
                };
              }
              return session;
            })
          );
        }
      } catch (error) {
        console.error("Error fetching audio status:", error);
        // Don't show error toast for status updates to avoid spam
      }
    }
  }, [eventId, sessions.length]);

  // Transform real session data to match expected format
  const transformSessionData = (rawSessions) => {
    return rawSessions.map((session) => {
      const startDate = new Date(session.startTime);
      const endDate = new Date(session.endTime);
      const durationMinutes = Math.round((endDate - startDate) / (1000 * 60)); // duration in minutes

      // Custom time formatter without timezone suffix
      const formatTimeWithoutTimezone = (date) => {
        if (!moment(date).isValid()) return "--";
        return moment(date).format("hh:mm A");
      };

      const mainSession = {
        id: session._id,
        title: session.title,
        type: session.sessiontype?.value || "General",
        startTime: formatTimeWithoutTimezone(session.startTime),
        duration: formatDuration(durationMinutes),
        // Ensure stage is always a string for rendering
        stage: session.stage?.stage || session.stage?.value || (typeof session.stage === "string" ? session.stage : "Main Stage"),
        speakers: session.speakers || [],
        audioProcess: session.audioProcess, // Preserve audioProcess field
        audioLength: session.audioLength || 0, // Preserve audioLength field
        // Add missing properties for grouping and sorting
        startDateTime: startDate,
        date: dateFormat(startDate),
        weekday: startDate.toLocaleDateString("en-US", { weekday: "long" }),
        sortDate: startDate,
        dateKey: startDate.toISOString().split("T")[0], // YYYY-MM-DD format for grouping
        rawData: session, // Keep raw data for editing
        isLive: session.isLive,
      };

      // Debug: Log the audioProcess value
      console.log(`Session ${session.title}: audioProcess = ${session.audioProcess}, transformed = ${mainSession.audioProcess}`);

      return mainSession;
    });
  };

  useEffect(() => {
    const fetchSessions = async () => {
      if (eventId) {
        setLoading(true);
        try {
          const response = await getData({ event: eventId, limit, skip }, "sessions");

          const transformedSessions = transformSessionData(response.data.response);

          const mainSessions = transformedSessions.filter((session) => !session.isSubSession);

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

  useEffect(() => {
    const fetchAvCode = async () => {
      setAvCode([]);
      // const response = await getData({ event: eventId }, "av-code");
      // setAvCode(response.data.response);
      // console.log("response", response);
    };

    // console.log("eventId", eventId);
    if (eventId) {
      fetchAvCode();
    }
  }, [eventId]);

  useEffect(() => {
    const fetchTranslatedLanguages = async () => {
      try {
        const response = await getData({ event: eventId }, "instarecap-setting");
        if (response.data.success) {
          console.log("Translated languages:", response.data.response[0].translationLanguages);
          setTranslatedLanguages(response.data.response[0].translationLanguages);
        }
      } catch (error) {
        console.error("Error fetching translated languages:", error);
        toast.error("Error fetching translated languages, error: " + error);
      }
    };
    fetchTranslatedLanguages();
  }, [eventId]);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      if (props.setMessage) {
        props.setMessage({ type: 1, content: "AV code copied to clipboard", icon: "success" });
      }
    } catch (e) {
      if (props.setMessage) {
        props.setMessage({ type: 1, content: "Failed to copy code", icon: "error" });
      }
    }
  };

  const allTypes = [...new Set(sessions.map((s) => s.type))];
  const allSpeakers = [...new Map(sessions.flatMap((s) => [...s.speakers]).map((speaker) => [speaker._id || speaker.id, speaker])).values()];

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

  // const handleEditSession = (session) => {
  //   setSelectedSession(session);
  //   const formattedData = {
  //     ...session.rawData,
  //     stage: session.rawData.stage?._id || session.rawData.stage,
  //     sessiontype: session.rawData.sessiontype?._id || session.rawData.sessiontype,
  //     speakers: session.rawData.speakers?.map((speaker) => (typeof speaker === "object" ? speaker._id || speaker.id : speaker)) || [],
  //     ticket: session.rawData.ticket?.map((ticket) => (typeof ticket === "object" ? ticket._id || ticket.id : ticket)) || [],
  //   };
  //   setEditSessionData(formattedData);
  //   setOpenEditSessionModal(true);
  // };

  const handleDeleteSession = async (sessionId) => {
    try {
      const response = await deleteData({ id: sessionId }, `sessions`);
      if (response.data.success) {
        // Show success notification for deletion
        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "Session deleted successfully!",
            proceed: "Okay",
            icon: "success",
          });
        }

        // Reload sessions to get the latest data
        reloadSessions();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      if (props.setMessage) {
        props.setMessage("Error deleting session");
      }
    }
  };

  const handleUploadAudio = (session) => {
    // console.log("session", session);
    const formattedSession = {
      ...session,
      _id: session._id,
    };
    setSelectedSession(formattedSession);
    setOpenAudioUploadModal(true);
  };

  const handleEndLiveClick = (session) => {
    setMessage({
      type: 2,
      title: "End Live Session",
      content: `Are you sure you want to end the live session for <strong>"${session.title}"</strong>? This action will stop the live streaming and cannot be undone.`,
      icon: "warning",
      proceed: "End Live",
      okay: "Cancel",
      onProceed: async () => {
        try {
          const response = await putData({ id: session.id, isLive: false }, "sessions");
          if (response.data.success) {
            // Show success notification
            if (props.setMessage) {
              props.setMessage({
                type: 1,
                content: "Session ended live successfully!",
                icon: "success",
                title: "Success",
              });
            }

            // Update local state
            setSessions((prevSessions) => prevSessions.map((s) => (s.id === session.id ? { ...s, isLive: false } : s)));

            return true; // Close modal
          }
        } catch (error) {
          console.error("Error ending live session:", error);
          if (props.setMessage) {
            props.setMessage({
              type: 1,
              content: "Failed to end live session. Please try again.",
              icon: "error",
              title: "Error",
            });
          }
          return false; // Keep modal open
        }
      },
      onClose: () => {
        // Optional callback when user cancels
      },
      data: session,
    });
    setShowMessage(true);
  };

  const closeMessage = () => {
    setShowMessage(false);
    setMessage({});
  };

  const generateSessionHTML = useCallback(
    (session) => {
      const allSessionSpeakers = [...session.speakers];
      // console.log("avCode", avCode);
      // console.log("session", session);
      const sessionAvCodes = Array.isArray(avCode)
        ? Array.from(new Set(avCode.filter((item) => Array.isArray(item.assignerSessions) && item.assignerSessions.some((s) => String(s._id || s.id) === String(session.id))).map((item) => item.code)))
        : [];
      // console.log("sessionAvCodes", sessionAvCodes);

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
                    {(session.audioProcess === "processed" || session.audioProcess === "translating") && (
                      <div className="chip bg-green-50 border-green-200 text-green-700 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          ></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Transcripted</span>
                      </div>
                    )}
                    {/* {sessionAvCodes.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {sessionAvCodes.map((code) => (
                          <button key={code} type="button" className="chip border-gray-300 text-gray-700" onClick={() => handleCopyCode(code)} title="Copy AV code">
                            <span className="mr-2">AV CODE: {code}</span>
                            <GetIcon icon="copy" />
                          </button>
                        ))}
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-auto md:ml-4 mt-4 md:mt-0">
                {(session.audioProcess === "processed" || session.audioProcess === "translating") && (
                  <div className="flex flex-col items-center">
                    <button className="secondary-button text-xs py-1 px-3" onClick={() => handleUploadAudio(session)}>
                      <GetIcon icon="eye" />
                      <span className="hidden md:inline ml-2">View Transcript</span>
                    </button>
                    <div className="flex items-center mt-1.5">
                      <svg className="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        ></path>
                      </svg>
                      <span className="text-xs text-gray-600">{formatAudioLength(session.audioLength || 0)}</span>
                    </div>
                  </div>
                )}

                {!session.audioProcess && (
                  <>
                    {session.isLive === false && (
                      <button className="secondary-button text-xs py-1 px-3" onClick={() => handleUploadAudio(session)}>
                        <GetIcon icon="upload" />
                        <span className="hidden md:inline ml-2">Upload Audio</span>
                      </button>
                    )}
                    {session.isLive === false ? (
                      <button
                        className="secondary-button text-xs py-1 px-3"
                        onClick={() => {
                          setGoLiveOpen(true);
                          setSelectedSession(session.id);
                          setSelectedSessionTitle(session.title);
                          setAudioSavedSuccessfully(false); // Reset audio saved status when opening modal
                          setIsLiveRecording(false); // Reset recording status when opening modal
                        }}
                      >
                        <GetIcon icon="play" />
                        <span className="hidden md:inline ml-2">Go Live</span>
                      </button>
                    ) : (
                      <button className="secondary-button text-xs py-1 px-3" onClick={() => handleEndLiveClick(session)}>
                        <GetIcon icon="pause" />
                        <span className="hidden md:inline ml-2 text-green-500">On Live</span>
                      </button>
                    )}
                  </>
                )}

                {session.audioProcess && session.audioProcess !== "processed" && session.audioProcess !== "translating" && <AudioProcessLoader status={session.audioProcess} />}
                {/* <button className="secondary-button text-xs py-1 px-3" onClick={() => handleEditSession(session)}>
                  Edit
                </button>
                <button className="secondary-button text-xs py-1 px-3 text-red-600 hover:text-red-700" onClick={() => handleDeleteSession(session.id)}>
                  Delete
                </button> */}
              </div>
            </div>
            <div className="mt-4 md:pl-28">{generateSpeakerHTML(session.speakers)}</div>
          </div>
        </div>
      );
    },
    [generateSpeakerHTML, avCode, formatAudioLength]
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
      const allSessionSpeakers = [...session.speakers];

      const typeMatch = activeFilters.types.length === 0 || activeFilters.types.includes(session.type);
      const speakerMatch = activeFilters.speakers.length === 0 || activeFilters.speakers.some((speakerId) => allSessionSpeakers.some((speaker) => (speaker._id || speaker.id) === speakerId));
      const searchMatch = searchTerm === "" || session.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter for transcribed audios (processed or translating)
      const transcribedMatch = !activeFilters.transcribedAudios || session.audioProcess === "processed" || session.audioProcess === "translating";

      return typeMatch && speakerMatch && searchMatch && transcribedMatch;
    });

    setFilteredSessions(filtered);
  }, [activeFilters, searchTerm, sessions]);

  const loadMoreSessions = useCallback(() => {
    if (!loading && hasMore) {
      setSkip((prev) => prev + limit);
    }
  }, [loading, hasMore, limit]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !loading && hasMore) {
          loadMoreSessions();
        }
      },
      {
        root: null,
        rootMargin: "100px", // Start loading 100px before reaching the bottom
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loading, hasMore, loadMoreSessions]);

  useEffect(() => {
    applyActiveFiltersAndSearch();
  }, [applyActiveFiltersAndSearch]);

  // Periodic audio status fetching
  useEffect(() => {
    // Only start periodic fetching if we have sessions
    if (sessions.length > 0) {
      // Initial fetch
      fetchAudioStatus();

      // Set up interval to fetch every 30 seconds
      const intervalId = setInterval(fetchAudioStatus, 30000);

      // Cleanup function to clear interval
      return () => clearInterval(intervalId);
    }
  }, [sessions.length, fetchAudioStatus]);

  // Update filtered sessions when sessions change
  useEffect(() => {
    const filtered = sessions.filter((session) => {
      const allSessionSpeakers = [...session.speakers];

      const typeMatch = activeFilters.types.length === 0 || activeFilters.types.includes(session.type);
      const speakerMatch = activeFilters.speakers.length === 0 || activeFilters.speakers.some((speakerId) => allSessionSpeakers.some((speaker) => (speaker._id || speaker.id) === speakerId));
      const searchMatch = searchTerm === "" || session.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter for transcribed audios (processed or translating)
      const transcribedMatch = !activeFilters.transcribedAudios || session.audioProcess === "processed" || session.audioProcess === "translating";

      return typeMatch && speakerMatch && searchMatch && transcribedMatch;
    });

    setFilteredSessions(filtered);
  }, [sessions, activeFilters, searchTerm]);

  const handleGroupByChange = (group) => {
    setCurrentGrouping(group);
  };

  const toggleFilterPanel = (open) => {
    setIsFilterPanelOpen(open);
  };

  const handleApplyFilters = () => {
    setActiveFilters({ ...filterState });
    toggleFilterPanel(false);
  };

  const handleTypeToggle = (type) => {
    setFilterState((prev) => ({
      ...prev,
      types: prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [...prev.types, type],
    }));
  };

  const handleSpeakerToggle = (speakerId) => {
    setFilterState((prev) => ({
      ...prev,
      speakers: prev.speakers.includes(speakerId) ? prev.speakers.filter((id) => id !== speakerId) : [...prev.speakers, speakerId],
    }));
  };

  const handleTranscribedToggle = (e) => {
    setFilterState((prev) => ({
      ...prev,
      transcribedAudios: e.target.checked,
    }));
  };

  // Initialize filter state when panel opens
  useEffect(() => {
    if (isFilterPanelOpen) {
      setFilterState({ ...activeFilters });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFilterPanelOpen]);
  const formatTimeWithoutTimezone = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const handleFormSubmit = async (data, isSubSession = false) => {
    try {
      const sessionData = {
        ...data,
        event: eventId,
        speakers: data.speakers || [],
      };
      console.log("sessionData", sessionData);
      // if (isSubSession) {
      //   // This functionality is no longer needed since we're using audio upload instead
      //   console.log("Sub-session creation is deprecated, use audio upload instead");
      //   return;
      // }

      const response = await postData(sessionData, "sessions");
      if (response.data.success) {
        setOpenAddSessionModal(false);

        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "Session created successfully!",
            proceed: "Okay",
            icon: "success",
          });
        }

        // Reload sessions to get the latest data
        reloadSessions();
      }
    } catch (error) {
      console.error("Error creating session:", error);
      if (props.setMessage) {
        props.setMessage("Error creating session");
      }
    }
  };

  const handleEditFormSubmit = async (data) => {
    try {
      const response = await putData(data, `sessions`);
      if (response.data.success) {
        setOpenEditSessionModal(false);
        setSelectedSession(null);

        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "Session updated successfully!",
            proceed: "Okay",
            icon: "success",
          });
        }

        // Reload sessions to get the latest data
        reloadSessions();
      }
    } catch (error) {
      console.error("Error updating session:", error);
      if (props.setMessage) {
        props.setMessage("Error updating session");
      }
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
                        --gray-50: #F9FAFB;
                        --gray-100: #F3F4F6;
                        --gray-200: #E5E7EB;
                        --gray-300: #D1D5DB;
                        --gray-400: #9CA3AF;
                        --gray-600: #4B5563;
                        --gray-900: #111827;
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
            <AddButton onClick={() => setOpenAddSessionModal(true)}>
              <AddIcon></AddIcon>
              <span>Add Session</span>
            </AddButton>
          </div>

          {/* Sessions Container */}
          <div className="space-y-8">{renderSessions()}</div>

          {/* Load More Sentinel / Loader */}
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
                <div ref={loadMoreRef} className="py-4" />
              ) : (
                <p className="text-gray-500 py-4">No more sessions to load</p>
              )}
            </div>
          )}

          {/* Initial Loading State */}
          {sessions.length === 0 && loading && <SessionsTranscriptsShimmer />}

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
        {isFilterPanelOpen && (
          <PopupView
            popupData={
              <div className="flex flex-col h-full">
                {/* Filters Content */}
                <div className="p-6 flex-grow overflow-y-auto">
                  <div className="space-y-6">
                    {/* Transcribed Audios Filter */}
                    <div>
                      <CustomLabel label="TRANSCRIBED AUDIOS" className="text-xs font-medium text-text-sub mb-3" />
                      <div className="space-y-2">
                        <div
                          onClick={() => {
                            handleTranscribedToggle({ target: { checked: !filterState.transcribedAudios } });
                          }}
                          className="cursor-pointer"
                          style={{ position: "relative", zIndex: 1 }}
                        >
                          <Checkbox name="transcribedAudios" label="Show only transcribed sessions" checked={filterState.transcribedAudios} onChange={() => {}} className="checkbox" />
                        </div>
                      </div>
                    </div>

                    {/* Session Type Filter */}
                    <div>
                      <CustomLabel label="SESSION TYPE" className="text-xs font-medium text-text-sub mb-3" />
                      <div className="space-y-2">
                        {allTypes.map((type) => (
                          <div
                            key={type}
                            onClick={() => {
                              handleTypeToggle(type);
                            }}
                            className="cursor-pointer"
                            style={{ position: "relative", zIndex: 1 }}
                          >
                            <Checkbox name={`type-${type}`} label={type} checked={filterState.types.includes(type)} onChange={() => {}} className="checkbox" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Speakers Filter */}
                    <div>
                      <CustomLabel label="SPEAKERS" className="text-xs font-medium text-text-sub mb-3" />
                      <div className="space-y-2">
                        {allSpeakers.map((speaker) => {
                          const speakerId = speaker._id || speaker.id;
                          const speakerName = speaker.value || speaker.name || "Unknown";
                          const imageUrl = speakerImage(speaker);
                          return (
                            <div
                              key={speakerId}
                              className="flex items-center gap-3 cursor-pointer"
                              onClick={() => {
                                handleSpeakerToggle(speakerId);
                              }}
                              style={{ position: "relative", zIndex: 1 }}
                            >
                              <Checkbox name={`speaker-${speakerId}`} label="" checked={filterState.speakers.includes(speakerId)} onChange={() => {}} className="checkbox" />
                              {imageUrl ? (
                                <img className="w-6 h-6 rounded-full" src={imageUrl} alt={speakerName} />
                              ) : (
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getSpeakerColor(speaker)}`} title={speakerName}>
                                  {getSpeakerInitials(speaker)}
                                </div>
                              )}
                              <span className="text-text-main">{speakerName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div className="p-4 border-t border-stroke-soft bg-bg-weak">
                  <Button ClickEvent={handleApplyFilters} value="Apply Filters" type="primary" />
                </div>
              </div>
            }
            closeModal={() => toggleFilterPanel(false)}
            itemTitle={{ name: "title", type: "text", collection: "" }}
            openData={{
              data: {
                _id: "filter_panel",
                title: "Filter Sessions",
              },
            }}
            customClass="small"
          />
        )}

        {/* Add Session Modal */}
        {openAddSessionModal && (
          <AutoForm
            header="Add Session"
            api="sessions"
            formType="post"
            formInput={sessionFields}
            formMode="single"
            isOpenHandler={() => {
              setOpenAddSessionModal(false);
              reloadSessions();
            }}
            setLoaderBox={props.setLoaderBox}
            setMessage={props.setMessage}
            parentReference={"event"}
            referenceId={props.openData.data._id}
            onClose={() => {
              setOpenAddSessionModal(false);
              reloadSessions();
            }}
            onCancel={() => {
              setOpenAddSessionModal(false);
              reloadSessions();
            }}
            submitHandler={handleFormSubmit}
            // disabled={isSubmitting}
          />
        )}

        {/* Edit Session Modal */}
        {/* {openEditSessionModal && selectedSession && (
          <AutoForm
            header="Edit Session"
            api="sessions"
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
        )} */}

        {/* Upload Audio Modal */}
        {/* {openAudioUploadModal && selectedSession && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Upload Audio for: {selectedSession.title}
                  </h3>
                  <button
                    onClick={() => {
                      setOpenAudioUploadModal(false);
                      setSelectedSession(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <UploadAudio
                  data={{
                    _id: selectedSession.id,
                    id: selectedSession._id,
                    title: selectedSession.title,
                    type: selectedSession.type,
                    startTime: selectedSession.startTime,
                    duration: selectedSession.duration,
                    stage: selectedSession.stage,
                    speakers: selectedSession.speakers,
                    startDateTime: selectedSession.startDateTime,
                    date: selectedSession.date,
                    weekday: selectedSession.weekday,
                    sortDate: selectedSession.sortDate,
                    dateKey: selectedSession.dateKey,
                    rawData: selectedSession.rawData
                  }}
                  translatedLanguages={translatedLanguages}
                  user={props.user}
                  closeModal={() => {
                    setOpenAudioUploadModal(false);
                    setSelectedSession(null);
                  }}
                  setMessage={props.setMessage}
                  selectedAudio={null}
                />
              </div>
            </div>
          </div>
        )} */}

        {/* Live Test Modal */}
        {goLiveOpen && (
          <PopupView
            popupData={
              <LiveTest
                selectedSession={selectedSession}
                openData={props.openData}
                translatedLanguages={translatedLanguages}
                sessionTitle={selectedSessionTitle}
                onCloseModal={() => {
                  if (audioSavedSuccessfully) {
                    // Directly close the modal if audio was saved successfully
                    setGoLiveOpen(false);
                    setAudioSavedSuccessfully(false);
                    setIsLiveRecording(false);
                    reloadSessions();
                  } else if (isLiveRecording) {
                    // Show leave confirmation only if live recording is active
                    setShowLeaveConfirmation(true);
                  } else {
                    // Directly close the modal if not recording
                    setGoLiveOpen(false);
                    setIsLiveRecording(false);
                    reloadSessions();
                  }
                }}
                onAudioSaved={() => {
                  setAudioSavedSuccessfully(true);
                }}
                onRecordingStatusChange={(isRecording) => {
                  setIsLiveRecording(isRecording);
                }}
              />
            }
            // themeColors={themeColors}
            closeModal={() => {
              if (audioSavedSuccessfully) {
                // Directly close the modal if audio was saved successfully
                setGoLiveOpen(false);
                setAudioSavedSuccessfully(false);
                setIsLiveRecording(false);
                reloadSessions();
              } else if (isLiveRecording) {
                // Show leave confirmation only if live recording is active
                setShowLeaveConfirmation(true);
              } else {
                // Directly close the modal if not recording
                setGoLiveOpen(false);
                setIsLiveRecording(false);
                reloadSessions();
              }
            }}
            itemTitle={{
              name: "title",
              type: "text",
              collection: "",
              render: (value, rowData) => (
                <SessionHeader
                  title={selectedSessionTitle || "Session Title"}
                  sessionUrl={generateSessionUrl(selectedSession)}
                  showUrlActions={true}
                  icon={Calendar}
                  onOpenUrl={() => {
                    const url = generateSessionUrl(selectedSession);
                    if (url && url !== "example.com/instarecap/sessions/sessionId") {
                      window.open(url, "_blank", "noopener,noreferrer");
                    }
                  }}
                />
              ),
            }}
            // selectedSession={selectedSession}
            customClass={"full-page"}
            openData={{
              data: {
                _id: "live_page",
                title: selectedSessionTitle,
              },
            }}
          ></PopupView>
        )}
        {/* Upload Audio Modal */}

        {openAudioUploadModal && selectedSession && (
          <PopupView
            itemTitle={{ name: "title", type: "text", collection: "" }}
            popupData={<UploadAudio {...props} data={{ title: selectedSession.title, _id: selectedSession.id }} translatedLanguages={translatedLanguages} />}
            openData={{
              data: {
                _id: "upload_audio",
                title: "Upload Audio / " + selectedSession?.title,
              },
            }}
            customClass={"large"}
            closeModal={() => {
              setOpenAudioUploadModal(false);
              reloadSessions();
            }}
          ></PopupView>
        )}

        {/* Custom Leave Confirmation Modal */}
        {showLeaveConfirmation && (
          <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Close Button - Top Right */}
              <button
                onClick={() => setShowLeaveConfirmation(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg transition-colors duration-200 z-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                <GetIcon icon="close" className="w-4 h-4" />
              </button>

              {/* Modal Content Section */}
              <div className="px-6 pt-6 pb-5">
                <div className="flex items-start gap-4">
                  {/* Icon Section - Left Aligned */}
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full flex-shrink-0">
                    <GetIcon icon="pause" className="w-6 h-6 text-orange-600" />
                  </div>

                  {/* Text Section */}
                  <div className="flex-1 pt-1 pr-8">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">Leave Live Session?</h3>

                    {/* Description */}
                    <div className="text-gray-600 text-sm leading-relaxed">Are you sure you want to leave the live session? This will stop recording and close the session.</div>
                  </div>
                </div>
              </div>

              {/* Divider Line */}
              <div className="border-t border-gray-200"></div>

              {/* Button Section */}
              <div className="px-6 py-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLeaveConfirmation(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg transition-colors duration-200 focus:outline-none text-gray-700 bg-white hover:bg-gray-50 border-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Stay
                  </button>
                  <button
                    onClick={async () => {
                      console.log("selectedSession", selectedSession);
                      setGoLiveOpen(false);
                      setShowLeaveConfirmation(false);
                      setSessions((prevSessions) => prevSessions.map((session) => (session._id === selectedSession ? { ...session, isLive: false } : session)));
                      putData({ id: selectedSession, isLive: false }, "sessions");
                      console.log("updated sessions");
                      console.log("sessions", sessions);
                      reloadSessions();
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Leave Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* End Live Confirmation Modal */}
        <Message showMessage={showMessage} message={message} closeMessage={closeMessage} />
      </div>
    </>
  );
};

export default Sessions;
