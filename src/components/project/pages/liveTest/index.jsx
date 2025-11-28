import React, { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import { ButtonPanel } from "../../../core/list/styles";
import { Button } from "../../../core/elements";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { logo } from "../../../../images";

import Loader from "../../../core/loader";
import Message from "../../../core/message";
import NoDataFound from "../../../core/list/nodata";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons";
import { getData, postData, putData } from "../../../../backend/api";
import CustomSelect from "../../../core/select";
import SpeakingComponent from "./SpeakingComponent";

// Import hooks and utilities
import useTranscriptionService from "./hooks/useTranscriptionService";
import useSoundCheckService from "./hooks/useSoundCheckService";
import {
  SUPPORTED_LANGUAGES,
  convertLanguageNameToCode,
  convertLanguageCodeToName,
  isNovaSupported,
  getNovaModelForLanguage,
  mapLanguageToCode,
  getAvailableLanguages,
  getCombinedLanguagesForUI,
  getProviderForLanguage,
  isLanguageSupported,
} from "./utils/languageUtils";

// Utility function for class names
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Status Indicator Component
function StatusIndicator({ status }) {
  const statusConfig = {
    disconnected: { color: 'bg-gray-400', text: 'Disconnected', pulse: false },
    connecting: { color: 'bg-amber-500', text: 'Connecting…', pulse: true },
    connected: { color: 'bg-green-500', text: 'Connected & Recording', pulse: true },
    error: { color: 'bg-red-500', text: 'Connection Error', pulse: false },
  }
  const config = statusConfig[status]
  return (
    ''
    // <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg">
    //   <div aria-hidden className={cn('w-3 h-3 rounded-full', config.color, config.pulse ? 'animate-pulse' : '')} />
    //   <span className="text-sm font-medium text-slate-600">{config.text}</span>
    // </div>
  )
}


const LiveTest = (props) => {
  console.log("props", props);
  const { onCloseModal, onAudioSaved, onRecordingStatusChange } = props; // Extract callback props
  const [eventId, setEventId] = useState(null);
  const [translationLanguages, setTranslationLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(props.selectedSession);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState(props.sessionTitle);
  const [sessionType, setSessionType] = useState(props.sessionType);
  const [eventTitle, setEventTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Translation feature state
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [translationSocket, setTranslationSocket] = useState(null);
  const [translationSocketConnected, setTranslationSocketConnected] = useState(false);
  const [availableTranslationLanguages, setAvailableTranslationLanguages] = useState([]);

  // Gemini Translation feature state
  const [geminiTranslationSocket, setGeminiTranslationSocket] = useState(null);
  const [geminiTranslationSocketConnected, setGeminiTranslationSocketConnected] = useState(false);
  const [geminiTargetLanguages, setGeminiTargetLanguages] = useState([]);

  // New state variables for recording functionality
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingChunks, setRecordingChunks] = useState([]);
  const [mediaRecorderInstance, setMediaRecorderInstance] = useState(null);

  // Sound check state variables
  const [isSoundCheckActive, setIsSoundCheckActive] = useState(false);
  const [soundCheckResults, setSoundCheckResults] = useState([]);
  const [soundCheckInterimText, setSoundCheckInterimText] = useState("");
  const [soundCheckConnectionStatus, setSoundCheckConnectionStatus] = useState("disconnected");

  // Go Live loader state
  const [isStartingRecording, setIsStartingRecording] = useState(false);

  const toast = useToast();

  // Initialize Socket.IO connection
  useEffect(() => {
    console.log("Creating socket connection");
    // Use local server for testing, fallback to environment variable
    const baseurl = import.meta.env.VITE_LIVE_TRANSCRIPTION_SERVER_URL || "http://localhost:3002";
    const newSocket = io(baseurl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setSocketConnected(true);

      // Join room if sessionId is available
      if (selectedSessionId) {
        console.log("Joining room with session ID:", selectedSessionId);
        newSocket.emit("join-room", selectedSessionId);
        console.log("Joined room:", selectedSessionId);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setSocketConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      setSocketConnected(false);
    });

    // Auto-reconnect logic
    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setSocketConnected(false);
    });

    return () => {
      console.log("🧹 Cleaning up main socket connection");
      newSocket.disconnect();
      newSocket.close();
    };
  }, []); // Only create socket once

  // Initialize Translation Socket.IO connection (OLD - Commented out for Gemini integration)
  // useEffect(() => {
  //   console.log("Translation socket useEffect triggered:", {
  //     translationEnabled,
  //   });

  //   if (!translationEnabled) {
  //     // Clean up translation socket if translation is disabled
  //     if (translationSocket) {
  //       console.log("Cleaning up translation socket - translation disabled");
  //       translationSocket.close();
  //       setTranslationSocket(null);
  //       setTranslationSocketConnected(false);
  //     }
  //     return;
  //   }

  //   console.log("Creating translation socket connection");
  //   // Use translation server URL, fallback to environment variable
  //   const translationServerUrl = import.meta.env.VITE_TRANSLATION_SERVER_URL || "http://localhost:3003";
  //   console.log("Translation server URL:", translationServerUrl);

  //   const newTranslationSocket = io(translationServerUrl, {
  //     transports: ["websocket", "polling"],
  //     timeout: 20000,
  //   });
  //   setTranslationSocket(newTranslationSocket);

  //   newTranslationSocket.on("connect", () => {
  //     console.log("Connected to translation server");
  //     setTranslationSocketConnected(true);

  //     // Join translation room if sessionId is available
  //     if (selectedSessionId) {
  //       const translationRoomId = `${selectedSessionId}+translation`;
  //       console.log("Joining translation room:", translationRoomId);
  //       newTranslationSocket.emit("join-room", translationRoomId);
  //       console.log("Joined translation room:", translationRoomId);
  //     } else {
  //       console.log("No sessionId available for translation room");
  //     }
  //   });

  //   newTranslationSocket.on("disconnect", () => {
  //     console.log("Disconnected from translation server");
  //     setTranslationSocketConnected(false);
  //   });

  //   newTranslationSocket.on("error", (error) => {
  //     console.error("Translation socket error:", error);
  //     setTranslationSocketConnected(false);
  //   });

  //   newTranslationSocket.on("connect_error", (error) => {
  //     console.error("Translation connection error:", error);
  //     console.error("Translation connection error details:", {
  //       message: error.message,
  //       type: error.type,
  //       description: error.description,
  //     });
  //     setTranslationSocketConnected(false);
  //   });

  //   // Handle available languages from translation server
  //   newTranslationSocket.on("available-languages", (languages) => {
  //     console.log("Received available translation languages:", languages);
  //     setAvailableTranslationLanguages(languages);
  //   });

  //   return () => {
  //     newTranslationSocket.close();
  //   };
  // }, [translationEnabled, selectedSessionId]); // Recreate when translation is enabled/disabled

  // Initialize Gemini Translation Socket.IO connection (NEW)
  useEffect(() => {
    console.log("Gemini translation socket useEffect triggered:", {
      translationEnabled,
      selectedSessionId,
    });

    if (!translationEnabled) {
      // Clean up gemini translation socket if translation is disabled
      if (geminiTranslationSocket) {
        console.log("Cleaning up gemini translation socket - translation disabled");
        geminiTranslationSocket.close();
        setGeminiTranslationSocket(null);
        setGeminiTranslationSocketConnected(false);
      }
      return;
    }

    console.log("Creating Gemini translation socket connection");
    // Use gemini translation server URL, fallback to environment variable
    const geminiTranslationServerUrl = import.meta.env.VITE_GEMINI_TRANSLATION_SERVER_URL || "https://gemini-live-translator-laf2b.ondigitalocean.app";
    console.log("Gemini translation server URL:", geminiTranslationServerUrl);

    const newGeminiTranslationSocket = io(geminiTranslationServerUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    });
    setGeminiTranslationSocket(newGeminiTranslationSocket);

    newGeminiTranslationSocket.on("connect", () => {
      console.log("✅ Connected to Gemini translation server");
      setGeminiTranslationSocketConnected(true);
    });

    newGeminiTranslationSocket.on("disconnect", () => {
      console.log("❌ Disconnected from Gemini translation server");
      setGeminiTranslationSocketConnected(false);
    });

    newGeminiTranslationSocket.on("error", (error) => {
      console.error("❌ Gemini translation socket error:", error);
      setGeminiTranslationSocketConnected(false);
    });

    newGeminiTranslationSocket.on("connect_error", (error) => {
      console.error("❌ Gemini translation connection error:", error);
      setGeminiTranslationSocketConnected(false);
    });

    // Handle translation started confirmation
    newGeminiTranslationSocket.on("translation-started", (data) => {
      console.log("✅ Translation started:", data);
      // //toast.success(`Translation started for ${data.languages.join(", ")}`);
    });

    // Handle translation errors
    newGeminiTranslationSocket.on("translation-error", (data) => {
      console.error("❌ Translation error:", data);
      toast.error(`Translation error: ${data.error}`);
    });

    // Handle translation stopped confirmation
    newGeminiTranslationSocket.on("translation-stopped", (data) => {
      console.log("🛑 Translation stopped:", data);
    });

    return () => {
      console.log("🧹 Cleaning up Gemini translation socket connection");
      newGeminiTranslationSocket.disconnect();
      newGeminiTranslationSocket.close();
    };
  }, [translationEnabled, selectedSessionId]);

  // Join translation room when sessionId changes
  useEffect(() => {
    if (translationSocket && translationSocketConnected && selectedSessionId) {
      const translationRoomId = `${selectedSessionId}+translation`;
      console.log("Joining translation room with session ID:", translationRoomId);
      translationSocket.emit("join-room", translationRoomId);
      console.log("Joined translation room:", translationRoomId);
    }
  }, [translationSocket, translationSocketConnected, selectedSessionId]);

  // Join room when sessionId changes
  useEffect(() => {
    if (socket && selectedSessionId) {
      console.log("Joining room with session ID:", selectedSessionId);
      socket.emit("join-room", selectedSessionId);
      console.log("Joined room:", selectedSessionId);
    } else {
      console.log("Cannot join room:", {
        socket: !!socket,
        selectedSessionId,
        socketConnected,
      });
    }
  }, [socket, selectedSessionId, socketConnected]);

  // Initialize component
  useEffect(() => {
    console.log("LiveTest props:", props);

    if (props.openData && props.openData.data && props.openData.data._id) {
      setEventId(props.openData.data._id);
    }
  }, [props]);

  // Fetch event data and translation languages
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const response = await getData({ event: eventId }, "instarecap-setting");

        if (response.status === 200 && response.data.response && response.data.response.length > 0) {
          const eventData = response.data.response[0];
          const allTranslationLanguages = eventData.translationLanguages || [];
          setTranslationLanguages(allTranslationLanguages);
          // Capture event title if present
          try {
            setEventTitle( eventData.title || eventData.name || null);
          } catch {}

          // Get first 4 target languages for Gemini translation
          const first4Languages = allTranslationLanguages.slice(0, 4);
          console.log("🎯 First 4 target languages for Gemini:", first4Languages);
          
          // Convert language names to codes for Gemini
          const geminiLanguageCodes = first4Languages
            .filter((lang) => lang && lang.trim() !== "")
            .map((lang) => {
              // Map common language names to codes that gemini service expects
              const languageCodeMap = {
                'Hindi': 'hindi',
                'Malayalam': 'malayalam',
                'Tamil': 'tamil',
                'Telugu': 'telugu',
                'Kannada': 'kannada',
                'Bengali': 'bengali',
                'Marathi': 'marathi',
                'Gujarati': 'gujarati'
              };
              return languageCodeMap[lang] || lang.toLowerCase();
            });
          
          setGeminiTargetLanguages(geminiLanguageCodes);
          console.log("🎯 Gemini target language codes:", geminiLanguageCodes);

          // Set initial language
          const availableLanguagesForInit = getAvailableLanguages();
          if (availableLanguagesForInit.length > 0) {
            setSelectedLanguage(availableLanguagesForInit[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        setError("Failed to fetch event data");
        toast.error("Failed to fetch event data");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Auto-connect when component mounts or when session changes
  useEffect(() => {
    if (selectedLanguage && (eventId || selectedSessionId)) {
      // Auto-connect logic can be added here if needed
      console.log("Auto-connect triggered:", {
        selectedLanguage,
        eventId,
        selectedSessionId,
      });
    }
  }, [selectedLanguage, eventId, selectedSessionId]);

  // Handle recording completion - defined before useTranscriptionService
  const handleRecordingComplete = (recordingBlob) => {
    console.log("Recording completed, blob size:", recordingBlob.size);
    setRecordingBlob(recordingBlob);
    setShowSaveModal(true);
  };

  // Use transcription service
  console.log("Calling useTranscriptionService with:", {
    language: selectedLanguage?.code || "en-US",
    eventId,
    selectedSessionId,
    socket: !!socket,
    translationEnabled,
    translationSocket: !!translationSocket,
    translationSocketConnected,
  });

  // Debug translation state
  console.log("Translation state in main component:", {
    translationEnabled,
    translationSocket: !!translationSocket,
    translationSocketConnected,
    selectedSessionId,
  });

  // Get target languages for translation - use only languages from recap settings
  const availableLanguagesForTranslation = translationLanguages && translationLanguages.length > 0
    ? translationLanguages
        .filter((lang) => lang && lang.trim() !== "") // Filter out empty strings
        .map((lang) => {
          const code = convertLanguageNameToCode(lang);
          return code ? { code, name: lang } : null;
        })
        .filter((lang) => lang !== null) // Remove any failed conversions
    : []; // No fallback to hardcoded languages - only use recap settings

  console.log("Translation language sources:", {
    fromEventData: translationLanguages,
    finalSelected: availableLanguagesForTranslation,
    languageConversion:
      translationLanguages && translationLanguages.length > 0
        ? translationLanguages.map((lang) => ({
            original: lang,
            converted: convertLanguageNameToCode(lang),
          }))
        : "No event languages",
  });

  const targetLanguagesForTranslation = availableLanguagesForTranslation
    .filter((lang) => lang.code !== (selectedLanguage?.code || "en-US").split("-")[0]) // Exclude source language
    .map((lang) => lang.code);

  console.log("Translation target languages:", {
    availableLanguages: availableLanguagesForTranslation,
    targetLanguages: targetLanguagesForTranslation,
    selectedLanguage: selectedLanguage?.code,
    translationEnabled,
    source: "Recap Settings Only",
  });

  const {
    isRecording,
    connectionStatus,
    transcriptionResults,
    interimText,
    error: transcriptionError,
    startTranscription,
    stopTranscription,
    clearTranscription,
    serviceProvider,
    isNovaSupported: currentLanguageSupported,
    currentRoomId,
  } = useTranscriptionService(
    selectedLanguage?.code || "en-US",
    eventId,
    selectedSessionId,
    socket,
    setSocketConnected,
    handleRecordingComplete,
    translationEnabled,
    translationSocket, // OLD - keep for compatibility
    translationSocketConnected, // OLD - keep for compatibility
    getNovaModelForLanguage(selectedLanguage?.code || "en-US"),
    targetLanguagesForTranslation, // OLD - keep for compatibility
    geminiTranslationSocket, // NEW - Gemini translation socket
    geminiTranslationSocketConnected, // NEW - Gemini connection status
    geminiTargetLanguages, // NEW - First 4 target languages
    {
      sessionId: selectedSessionId,
      sessionTitle: selectedSessionTitle,
      sessionType: sessionType,
      eventId: eventId,
      eventTitle: eventTitle,
      targetLanguages: geminiTargetLanguages,
      // Optional extras that can help translation quality
      // You can extend these when available in props/openData
      // speakers: props.speakers,
      // agenda: props.agenda,
      // domain: props.domain,
    }
  );

  // Sound check service
  const {
    isRecording: isSoundCheckRecording,
    connectionStatus: soundCheckServiceConnectionStatus,
    transcriptionResults: soundCheckServiceResults,
    interimText: soundCheckServiceInterimText,
    error: soundCheckError,
    startSoundCheck,
    stopSoundCheck,
    clearSoundCheck,
  } = useSoundCheckService(
    selectedLanguage?.code || "en-US",
    getNovaModelForLanguage(selectedLanguage?.code || "en-US")
  );

  // Debug: Log the room ID being used
  useEffect(() => {
    console.log("LiveTest - Current room ID:", currentRoomId);
    console.log("LiveTest - Selected session ID:", selectedSessionId);
    console.log("LiveTest - Event ID:", eventId);
    console.log("LiveTest - Hook parameters:", {
      language: selectedLanguage?.code || "en-US",
      eventId: eventId,
      selectedSessionId: selectedSessionId,
    });
  }, [currentRoomId, selectedSessionId, eventId, selectedLanguage]);

  // Notify parent when recording status changes
  useEffect(() => {
    if (onRecordingStatusChange && typeof onRecordingStatusChange === 'function') {
      onRecordingStatusChange(isRecording);
    }
  }, [isRecording, onRecordingStatusChange]);

  // Comprehensive cleanup on component unmount
  useEffect(() => {
    // Store refs to current values for cleanup
    const cleanupRefs = {
      isRecording,
      isSoundCheckRecording,
      stopTranscription,
      stopSoundCheck,
      socket,
      geminiTranslationSocket,
      translationSocket,
    };
    
    return () => {
      console.log("🧹 LiveTest component unmounting - cleaning up all resources");
      
      // Stop any active recording
      if (cleanupRefs.isRecording && cleanupRefs.stopTranscription) {
        console.log("🛑 Stopping active recording");
        try {
          cleanupRefs.stopTranscription();
        } catch (error) {
          console.error("Error stopping transcription:", error);
        }
      }
      
      // Stop any active sound check
      if (cleanupRefs.isSoundCheckRecording && cleanupRefs.stopSoundCheck) {
        console.log("🛑 Stopping active sound check");
        try {
          cleanupRefs.stopSoundCheck();
        } catch (error) {
          console.error("Error stopping sound check:", error);
        }
      }
      
      // Disconnect main socket
      if (cleanupRefs.socket && cleanupRefs.socket.connected) {
        console.log("🔌 Disconnecting main socket");
        try {
          cleanupRefs.socket.disconnect();
        } catch (error) {
          console.error("Error disconnecting main socket:", error);
        }
      }
      
      // Disconnect Gemini translation socket
      if (cleanupRefs.geminiTranslationSocket && cleanupRefs.geminiTranslationSocket.connected) {
        console.log("🔌 Disconnecting Gemini translation socket");
        try {
          cleanupRefs.geminiTranslationSocket.disconnect();
        } catch (error) {
          console.error("Error disconnecting Gemini translation socket:", error);
        }
      }
      
      // Disconnect old translation socket (if still exists)
      if (cleanupRefs.translationSocket && cleanupRefs.translationSocket.connected) {
        console.log("🔌 Disconnecting translation socket");
        try {
          cleanupRefs.translationSocket.disconnect();
        } catch (error) {
          console.error("Error disconnecting translation socket:", error);
        }
      }
      
      console.log("✅ Cleanup complete - all resources released");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  // Handle language selection
  const handleLanguageSelect = (option) => {
    const selected = availableLanguagesForUI.find((lang) => lang.code === option.id);
    setSelectedLanguage(selected);
    if (isRecording) {
      stopTranscription();
    }
  };

  // Handle session selection
  const handleSessionSelect = (option) => {
    console.log("Session selected:", option);
    console.log("Setting session ID to:", option?.id || option?.value || option);
    setSelectedSessionId(option?.id || option?.value || option);
    // The room ID will be updated automatically via the useEffect
  };

  // Handle start recording
  const handleStartRecording = async () => {
    console.log("Start recording clicked");
    console.log("Selected language:", selectedLanguage);
    console.log("Current language supported:", currentLanguageSupported);
    console.log("Current room ID:", currentRoomId);

    if (!selectedLanguage) {
      toast.error("Please select a language first");
      return;
    }

    if (!currentLanguageSupported) {
      setMessage({
        type: 1,
        content: `Language "${selectedLanguage.name}" is not supported. Please select a supported language.`,
        icon: "warning",
        title: "Language Not Supported",
      });
      return;
    }

    try {
      setIsStartingRecording(true);
      console.log("Starting transcription...");

      // Update session live status
      if (selectedSessionId) {
        try {
          await putData(
            {
              id: selectedSessionId,
              isLive: true,
              liveMethod: "Nova",
            },
            "sessions"
          );
          console.log("Session live status updated to true");
        } catch (error) {
          console.error("Failed to update session live status:", error);
          // Continue with recording even if session update fails
        }
      }

      await startTranscription();
      console.log("Transcription started successfully");
      // //toast.success("Recording started successfully");
    } catch (error) {
      console.error("Failed to start transcription:", error);
      toast.error("Failed to start recording");
    } finally {
      setIsStartingRecording(false);
    }
  };

  // Handle stop recording with confirmation
  const handleStopRecording = () => {
    setMessage({
      type: 2,
      content: "Are you sure you want to end the live session? This will stop recording and close the session.",
      proceed: "End Live Session",
      okay: "Cancel",
      onProceed: async () => {
        try {
          // Update session live status
          if (selectedSessionId) {
            try {
              await putData(
                {
                  id: selectedSessionId,
                  isLive: false,
                },
                "sessions"
              );
              console.log("Session live status updated to false");
            } catch (error) {
              console.error("Failed to update session live status:", error);
              // Continue with stopping recording even if session update fails
            }
          }

          stopTranscription();
          //toast.success("Recording stopped");
          return true; // Close modal after successful action
        } catch (error) {
          console.error("Failed to stop recording:", error);
          toast.error("Failed to stop recording");
          return false; // Keep modal open on error
        }
      },
      onClose: async () => {
        // Optional callback when user cancels
        return true; // Close modal after cancel
      }
    });
  };

  // Handle clear transcription
  const handleClearTranscription = () => {
    clearTranscription();
    //toast.success("Transcription cleared");
  };

  // Handle start sound check
  const handleStartSoundCheck = async () => {
    console.log("Start sound check clicked");
    console.log("Selected language:", selectedLanguage);

    if (!selectedLanguage) {
      toast.error("Please select a language first");
      return;
    }

    if (!currentLanguageSupported) {
      setMessage({
        type: 1,
        content: `Language "${selectedLanguage.name}" is not supported. Please select a supported language.`,
        icon: "warning",
        title: "Language Not Supported",
      });
      return;
    }

    try {
      console.log("Starting sound check...");
      setIsSoundCheckActive(true);
      await startSoundCheck();
      console.log("Sound check started successfully");
      //toast.success("Sound check started");
    } catch (error) {
      console.error("Failed to start sound check:", error);
      toast.error("Failed to start sound check");
      setIsSoundCheckActive(false);
    }
  };

  // Handle stop sound check
  const handleStopSoundCheck = () => {
    console.log("Stopping sound check");
    stopSoundCheck();
    setIsSoundCheckActive(false);
    //toast.success("Sound check stopped");
  };

  // Handle clear sound check
  const handleClearSoundCheck = () => {
    clearSoundCheck();
    //toast.success("Sound check results cleared");
  };

  // Handle save recording
  const handleSaveRecording = async () => {
    if (!recordingBlob) {
      toast.error("No recording available to save");
      return;
    }

    setIsUploadingRecording(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      const audioFile = new File([recordingBlob], `live-recording-${Date.now()}.wav`, { type: "audio/wav" });
      formData.append("audio", audioFile);
      formData.append("event", eventId);
      // formData.append("freeUpload", true);
      formData.append("session", selectedSessionId);

      const API_BASE_URL = import.meta.env.VITE_INSTARECAP_API || "https://instarecap-app.ambitiousforest-1ab41110.centralindia.azurecontainerapps.io/api";

      const response = await axios.post(`${API_BASE_URL}/upload-audio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        //toast.success("Recording saved successfully!");
        setShowSaveModal(false);
        setRecordingBlob(null);
        setUploadProgress(0);
        
        // Notify parent that audio was saved successfully
        if (onAudioSaved && typeof onAudioSaved === 'function') {
          onAudioSaved();
        }
        
        // Close the main PopupView modal after successful save
        if (onCloseModal && typeof onCloseModal === 'function') {
          onCloseModal();
        }
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error saving recording:", error);
      const errorMessage = error.response?.data?.message || "Error saving recording";
      toast.error(errorMessage);
    } finally {
      setIsUploadingRecording(false);
      setUploadProgress(0);
    }
  };

  // Handle discard recording
  const handleDiscardRecording = () => {
    setShowSaveModal(false);
    setRecordingBlob(null);
    toast.info("Recording discarded");
  };

  const availableLanguagesForUI = getCombinedLanguagesForUI();
  const languageOptions = availableLanguagesForUI.map((lang) => ({
    id: lang.code,
    value: `${lang.name}`,
  })).sort((a, b) => a.value.localeCompare(b.value));

  if (loading) {
    return (
      <RowContainer className="data-layout">
        <Loader message="Loading event data..." />
      </RowContainer>
    );
  }

  if (error) {
    return (
      <RowContainer className="data-layout">
        <div className="text-center py-8">
          <GetIcon icon="alert" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-main mb-2">Error Loading Event</h3>
          <p className="text-text-sub">{error}</p>
        </div>
      </RowContainer>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      {/* <div className="border-b border-[#e2e4e9] px-4 sm:px-8 lg:px-[143px] py-[16.565px]">
        <div className="flex items-center justify-between max-w-[1440px] mx-auto">
          <div className="flex items-center gap-[14.494px]">
            <img
              src={logo}
              alt="EventHex Logo"
              width={170}
              height={35}
              className="h-[35px] w-auto"
            />
          </div>
          <div className="hidden sm:flex items-center gap-3">
         
          </div>
         
          <div className="sm:hidden">
            <button className="bg-white border border-[#e2e4e9] rounded-[8px] p-[6px]">
              <svg className="w-5 h-5 text-[#525866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div> */}

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2">
            {/* Additional header elements can go here */}
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            {/* Available Translation Languages */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-sub">Translation Languages:</span>
              <div className="flex flex-wrap gap-1">
                {translationLanguages && translationLanguages.length > 0 ? (
                  translationLanguages.slice(0, 8).map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-bg-white text-text-sub border border-stroke-sub"
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-soft italic">No translation languages configured</span>
                )}
                {translationLanguages && translationLanguages.length > 8 && (
                  <span className="text-xs text-text-soft">
                    +{translationLanguages.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <div className="w-52">
                <CustomSelect
                  apiType="JSON" 
                  selectApi={languageOptions} 
                  value={selectedLanguage?.code} 
                  onSelect={handleLanguageSelect} 
                  placeholder="Select language" 
                  disabled={isRecording}
                  className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Speaking Component */}
        <SpeakingComponent 
          isRecording={isRecording || connectionStatus === 'connected'} 
          interimText={interimText}
          transcriptionResults={transcriptionResults}
          // Sound check mode
          isSoundCheckMode={isSoundCheckActive}
          soundCheckInterimText={soundCheckServiceInterimText}
          soundCheckResults={soundCheckServiceResults}
        />
        
        {/* Recording Controls */}
        <div className="w-full flex flex-col items-center justify-center gap-4 px-4 py-6">
          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl px-4">
            {/* Sound Check Button - Only show when not live recording */}
            {connectionStatus !== 'connected' && (
              <button
                onClick={isSoundCheckActive ? handleStopSoundCheck : handleStartSoundCheck}
                disabled={!selectedLanguage}
                className={`inline-flex items-center gap-3 rounded-xl px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-200 w-full sm:w-auto sm:min-w-[160px] justify-center touch-manipulation ${
                  isSoundCheckActive
                    ? 'bg-red-500 hover:bg-red-600 active:scale-95' 
                    : 'bg-blue-500 hover:bg-blue-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                aria-label={isSoundCheckActive ? "Stop sound check" : "Start sound check"}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="whitespace-nowrap">
                  {isSoundCheckActive ? 'Stop Sound Check' : 'Sound Check'}
                </span>
              </button>
            )}

            {/* Go Live / Stop Recording Button */}
            {connectionStatus !== 'connected' ? (
              <button
                onClick={handleStartRecording}
                disabled={!selectedSessionId || !selectedLanguage || isSoundCheckActive || isStartingRecording}
                className="inline-flex items-center gap-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-200 w-full sm:w-auto sm:min-w-[160px] justify-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                aria-label="Start live recording"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="whitespace-nowrap">Go Live</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="inline-flex items-center gap-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-200 w-full sm:w-auto sm:min-w-[160px] justify-center touch-manipulation"
                aria-label="Stop live recording"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                <span className="whitespace-nowrap">Stop Recording</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="my-6 sm:my-8">
          <div className=''>
            <div className="space-y-3">
              <StatusIndicator status={isSoundCheckActive ? soundCheckServiceConnectionStatus : connectionStatus} />
              {isSoundCheckActive && (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-medium text-blue-700">Sound Check Mode</span>
                  </div>
                  {soundCheckServiceResults.length > 0 && (
                    <button
                      onClick={handleClearSoundCheck}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Results
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {/* {(transcriptionError || soundCheckError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <GetIcon icon="alert" />
              <span className="text-sm font-medium">
                Error: {isSoundCheckActive ? soundCheckError : transcriptionError}
              </span>
            </div>
          </div>
        )} */}

        {/* Message Component */}
        {message && (
          <Message 
            message={message}
            closeMessage={() => setMessage(null)}
            showMessage={true}
            setLoaderBox={() => {}}
          />
        )}

        {/* Save Recording Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-black/5 mx-4">
              <h3 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-slate-800">Save Recording</h3>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base text-slate-600 leading-relaxed">Your recording has been completed successfully. Would you like to save it to the event's audio library for future reference?</p>
              {isUploadingRecording && (
                <div className="mb-4 sm:mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">Uploading to library…</span>
                    <span className="text-xs sm:text-sm font-mono text-slate-500">{uploadProgress}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200 shadow-inner">
                    <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button 
                  onClick={handleDiscardRecording} 
                  disabled={isUploadingRecording} 
                  className={`order-2 sm:order-1 rounded-xl border-0 bg-slate-100 px-4 sm:px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-all hover:bg-slate-200 hover:shadow-xl ${isUploadingRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Discard
                </button>
                <button 
                  onClick={handleSaveRecording} 
                  disabled={isUploadingRecording} 
                  className={`order-1 sm:order-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl ${isUploadingRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploadingRecording ? 'Saving…' : 'Save Recording'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full-screen loader overlay */}
        {isStartingRecording && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <Loader message="Starting live recording..." />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default LiveTest;
