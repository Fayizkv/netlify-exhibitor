/**
 * useTranscriptionService.js
 * 
 * Hook for managing live transcription service
 * Orchestrates Deepgram transcription and translation services
 */

import { useState, useRef, useCallback, useEffect } from "react";
import DeepgramService from "../services/DeepgramService";
import SpeechmaticsService from "../services/SpeechmaticsService";
import TranslationService from "../services/TranslationService";
import GeminiTranslationService from "../services/GeminiTranslationService"; // NEW - Gemini translation service
import { isNovaSupported, getProviderForLanguage, getNovaModelForLanguage, isLanguageSupported } from "../utils/languageUtils";

/**
 * Custom hook for transcription service
 * @param {string} targetLanguage - Target language code
 * @param {string} roomId - Room ID for transcription (not used in current implementation)
 * @param {string} sessionId - Session ID for transcription
 * @param {Object} socket - Socket.IO instance for transcription server
 * @param {Function} setSocketConnected - Function to update socket connection status
 * @param {Function} onRecordingComplete - Callback when recording is complete
 * @param {boolean} translationEnabled - Whether translation is enabled
 * @param {Object} translationSocket - Socket.IO instance for translation server (OLD)
 * @param {boolean} translationSocketConnected - Translation socket connection status (OLD)
 * @param {string} novaModel - Nova model to use (nova-2 or nova-3)
 * @param {Array<string>} targetLanguages - Array of target language codes for translation (OLD)
 * @param {Object} geminiTranslationSocket - Socket.IO instance for Gemini translation server (NEW)
 * @param {boolean} geminiTranslationSocketConnected - Gemini translation socket connection status (NEW)
 * @param {Array<string>} geminiTargetLanguages - Array of target language codes for Gemini translation (NEW)
 * @returns {Object} Transcription service state and methods
 */
function useTranscriptionService(
  targetLanguage = "en-US",
  roomId = null,
  sessionId = null,
  socket = null,
  setSocketConnected = null,
  onRecordingComplete = null,
  translationEnabled = false,
  translationSocket = null,
  translationSocketConnected = false,
  novaModel = "nova-3",
  targetLanguages = [],
  geminiTranslationSocket = null,
  geminiTranslationSocketConnected = false,
  geminiTargetLanguages = [],
  sessionContext = null
) {
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [serviceProvider, setServiceProvider] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const deepgramServiceRef = useRef(null);
  const speechmaticsServiceRef = useRef(null);
  const translationServiceRef = useRef(null);
  const geminiTranslationServiceRef = useRef(null); // NEW - Gemini translation service ref
  const currentSessionIdRef = useRef(sessionId);
  const recordingChunksRef = useRef([]);

  // Use refs to store current translation state to avoid stale closures (OLD)
  const translationEnabledRef = useRef(translationEnabled);
  const translationSocketRef = useRef(translationSocket);
  const translationSocketConnectedRef = useRef(translationSocketConnected);

  // Use refs to store Gemini translation state (NEW)
  const geminiTranslationSocketRef = useRef(geminiTranslationSocket);
  const geminiTranslationSocketConnectedRef = useRef(geminiTranslationSocketConnected);
  const geminiTargetLanguagesRef = useRef(geminiTargetLanguages);
  const sessionContextRef = useRef(sessionContext);

  // Update refs when translation parameters change (OLD)
  useEffect(() => {
    translationEnabledRef.current = translationEnabled;
    translationSocketRef.current = translationSocket;
    translationSocketConnectedRef.current = translationSocketConnected;
    console.log("Translation refs updated:", {
      translationEnabled: translationEnabledRef.current,
      translationSocket: !!translationSocketRef.current,
      translationSocketConnected: translationSocketConnectedRef.current,
    });
  }, [translationEnabled, translationSocket, translationSocketConnected]);

  // Update refs when Gemini translation parameters change (NEW)
  useEffect(() => {
    geminiTranslationSocketRef.current = geminiTranslationSocket;
    geminiTranslationSocketConnectedRef.current = geminiTranslationSocketConnected;
    geminiTargetLanguagesRef.current = geminiTargetLanguages;
    console.log("🎯 Gemini translation refs updated:", {
      geminiTranslationSocket: !!geminiTranslationSocketRef.current,
      geminiTranslationSocketConnected: geminiTranslationSocketConnectedRef.current,
      geminiTargetLanguages: geminiTargetLanguagesRef.current,
    });
  }, [geminiTranslationSocket, geminiTranslationSocketConnected, geminiTargetLanguages]);

  // Update session context ref when it changes
  useEffect(() => {
    sessionContextRef.current = sessionContext;
    if (sessionContextRef.current) {
      console.log("🎯 Session context for translation:", {
        sessionId: sessionContextRef.current?.sessionId,
        sessionTitle: sessionContextRef.current?.sessionTitle,
        sessionType: sessionContextRef.current?.sessionType,
        eventId: sessionContextRef.current?.eventId,
        eventTitle: sessionContextRef.current?.eventTitle,
      });
    }
  }, [sessionContext]);

  // Update currentRoomId when sessionId changes (for display purposes)
  useEffect(() => {
    if (sessionId) {
      console.log("Setting currentRoomId to session ID:", sessionId);
      setCurrentRoomId(sessionId);
    } else {
      console.log("Clearing currentRoomId - no session selected");
      setCurrentRoomId("");
    }
  }, [sessionId]);

  // Debug: Log when sessionId changes in hook
  useEffect(() => {
    console.log("Hook sessionId changed to:", sessionId);
    currentSessionIdRef.current = sessionId;
  }, [sessionId]);

  // Initialize translation service when enabled (OLD - commented out)
  // useEffect(() => {
  //   if (translationEnabled && translationSocket && translationSocketConnected && sessionId) {
  //     const translationRoomId = `${sessionId}+translation`;
  //     
  //     if (!translationServiceRef.current) {
  //       translationServiceRef.current = new TranslationService();
  //     }

  //     translationServiceRef.current.initialize(
  //       translationSocket,
  //       translationRoomId,
  //       targetLanguage,
  //       targetLanguages
  //     );

  //     console.log("Translation service initialized:", {
  //       translationRoomId,
  //       sourceLanguage: targetLanguage,
  //       targetLanguages,
  //     });
  //   }

  //   return () => {
  //     // Cleanup translation service on unmount or when disabled
  //     if (translationServiceRef.current && !translationEnabled) {
  //       translationServiceRef.current.close();
  //       translationServiceRef.current = null;
  //     }
  //   };
  // }, [translationEnabled, translationSocket, translationSocketConnected, sessionId, targetLanguage, targetLanguages]);

  // Initialize Gemini translation service when enabled (NEW)
  useEffect(() => {
    if (translationEnabled && geminiTranslationSocket && geminiTranslationSocketConnected && sessionId) {
      if (!geminiTranslationServiceRef.current) {
        geminiTranslationServiceRef.current = new GeminiTranslationService();
      }

      geminiTranslationServiceRef.current.initialize(
        geminiTranslationSocket,
        sessionId, // Use sessionId directly as room ID
        targetLanguage,
        geminiTargetLanguages
      );

      console.log("🎯 Gemini translation service initialized:", {
        sessionId,
        sourceLanguage: targetLanguage,
        targetLanguages: geminiTargetLanguages,
      });
    }

    return () => {
      // Cleanup Gemini translation service on unmount or when disabled
      if (geminiTranslationServiceRef.current && !translationEnabled) {
        geminiTranslationServiceRef.current.close();
        geminiTranslationServiceRef.current = null;
      }
    };
  }, [translationEnabled, geminiTranslationSocket, geminiTranslationSocketConnected, sessionId, targetLanguage, geminiTargetLanguages]);

  /**
   * Add transcription result
   */
  const addTranscriptionResult = useCallback(
    async (text, isFinal) => {
      console.log("addTranscriptionResult called:", {
        text,
        isFinal,
        currentRoomId,
        sessionId,
        socket: !!socket,
      });

      if (text.trim() === "") {
        console.log("Empty text, returning early");
        return;
      }

      // Always update interim text for real-time display
      if (!isFinal) {
        setInterimText(text);
      }

      const currentSessionId = currentSessionIdRef.current;
      console.log("Checking socket and sessionId for sending:", {
        socket: !!socket,
        sessionId: currentSessionId,
      });

      // Send transcription to main server (both interim and final) - BROADCASTING
      if (socket && currentSessionId && socket.connected) {
        console.log("📡 Broadcasting transcription to server:", {
          roomId: currentSessionId,
          textLength: text.length,
          isFinal: isFinal,
          socketConnected: socket.connected
        });
        
        socket.emit("transcription", {
          roomId: currentSessionId,
          text: text,
          timestamp: new Date(),
          isFinal: isFinal,
        });
        
        console.log("✅ Transcription broadcasted successfully");
      } else {
        console.warn("⚠️ Cannot broadcast transcription - missing requirements:", {
          hasSocket: !!socket,
          hasSessionId: !!currentSessionId,
          socketConnected: socket?.connected || false
        });
      }

      // Handle final transcription
      if (isFinal) {
        const result = {
          text: text,
          isFinal,
          timestamp: new Date(),
          language: targetLanguage,
          roomId: currentRoomId,
          novaModel: novaModel,
        };

        setTranscriptionResults((prev) => [result, ...prev]);
        setInterimText(""); // Clear interim when final arrives

        // Send final transcription to OLD translation service if enabled (COMMENTED OUT)
        // console.log("Checking translation conditions:", {
        //   translationEnabled: translationEnabledRef.current,
        //   translationServiceReady: translationServiceRef.current?.isReady(),
        //   currentSessionId,
        //   isFinal,
        // });

        // if (translationEnabledRef.current && translationServiceRef.current) {
        //   // Update translation service config if needed
        //   translationServiceRef.current.updateConfig({
        //     sourceLanguage: targetLanguage,
        //     targetLanguages: targetLanguages,
        //   });

        //   // Send to translation service
        //   const sent = translationServiceRef.current.sendForTranslation(text, isFinal);
        //   
        //   if (sent) {
        //     console.log("Successfully sent transcription to translation service");
        //   } else {
        //     console.log("Translation service did not send transcription (may be buffering)");
        //   }
        // }

        // Send final transcription to Gemini translation service if enabled (NEW)
        console.log("🎯 Checking Gemini translation conditions:", {
          translationEnabled: translationEnabledRef.current,
          geminiTranslationServiceReady: geminiTranslationServiceRef.current?.isReady(),
          currentSessionId,
          isFinal,
        });

        if (translationEnabledRef.current && geminiTranslationServiceRef.current) {
          // Update Gemini translation service config if needed
          geminiTranslationServiceRef.current.updateConfig({
            sourceLanguage: targetLanguage,
            targetLanguages: geminiTargetLanguagesRef.current,
            sessionContext: sessionContextRef.current,
          });

          // Send to Gemini translation service (buffers and sends 2 sentences at a time)
          const sent = geminiTranslationServiceRef.current.sendForTranslation(text, isFinal);
          
          if (sent) {
            console.log("✅ Successfully sent transcription to Gemini translation service");
          } else {
            console.log("📝 Gemini translation service buffering sentences...");
          }
        }
      }
    },
    [socket, targetLanguage, currentRoomId, novaModel, targetLanguages]
  );

  /**
   * Start transcription
   */
  const startTranscription = useCallback(async () => {
    console.log("startTranscription called");
    console.log("Target language:", targetLanguage);
    console.log("Nova model:", novaModel);
    console.log("Current room ID:", currentRoomId);

    try {
      setError(null);
      setConnectionStatus("connecting");

      // Get user microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      // Decide provider by language support
      const provider = getProviderForLanguage(targetLanguage);
      console.log("Provider decision:", provider);

      // Prepare MediaRecorder and chunk capture
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];

      if (provider === 'nova') {
        // Deepgram path
        const dgKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
        if (!dgKey) {
          throw new Error("Deepgram API key not found. Please set VITE_DEEPGRAM_API_KEY environment variable.");
        }

        const deepgramService = new DeepgramService();
        deepgramServiceRef.current = deepgramService;

        deepgramService.on({
          onOpen: () => {
            setConnectionStatus("connected");
            setServiceProvider("deepgram");
            mediaRecorder.start(100);
            setIsRecording(true);
          },
          onTranscript: (transcript, isFinal) => {
            if (transcript) addTranscriptionResult(transcript, isFinal);
          },
          onError: (errorMsg) => {
            setError(`Connection failed: ${errorMsg}`);
            setConnectionStatus("error");
          },
          onClose: () => {
            setConnectionStatus("disconnected");
            setIsRecording(false);
          },
        });

        await deepgramService.initialize({
          apiKey: dgKey,
          model: getNovaModelForLanguage(targetLanguage) || novaModel,
          language: targetLanguage,
          interimResults: true,
          punctuate: true,
          smartFormat: true,
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && deepgramService.getReadyState() === 1) {
            deepgramService.sendAudioData(event.data);
          }
          if (event.data.size > 0) recordingChunksRef.current.push(event.data);
        };
      } else if (provider === 'speechmatics') {
        // Speechmatics path
        const smKey = import.meta.env.VITE_SPEECHMATICS_API_KEY;
        if (!smKey) {
          throw new Error("Speechmatics API key not found. Please set VITE_SPEECHMATICS_API_KEY environment variable.");
        }

        const speechService = new SpeechmaticsService();
        speechmaticsServiceRef.current = speechService;

        speechService.on({
          onOpen: () => {
            setConnectionStatus('connected');
            setServiceProvider('speechmatics');
            mediaRecorder.start(100);
            setIsRecording(true);
          },
          onTranscript: (transcript, isFinal) => {
            if (transcript) addTranscriptionResult(transcript, isFinal);
          },
          onError: (errorMsg) => {
            setError(`Connection failed: ${errorMsg}`);
            setConnectionStatus('error');
          },
          onClose: () => {
            setConnectionStatus('disconnected');
            setIsRecording(false);
          },
        });

        const smConfig = {
          apiKey: smKey,
          language: targetLanguage,
          operatingPoint: 'enhanced',
          enablePartials: true,
          maxDelay: 1.0,
        };
        if (targetLanguage === 'es' && import.meta.env.VITE_SPEECHMATICS_BILINGUAL_ES_EN === 'true') {
          smConfig.domain = 'bilingual-en';
        }

        await speechService.initialize(smConfig);

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && speechService.getReadyState() === 1) {
            await speechService.sendAudioData(event.data);
          }
          if (event.data.size > 0) recordingChunksRef.current.push(event.data);
        };
      } else {
        throw new Error('Unsupported language/provider');
      }

      mediaRecorder.onstop = () => {
        const recordingBlob = new Blob(recordingChunksRef.current, { type: 'audio/wav' });
        if (onRecordingComplete) onRecordingComplete(recordingBlob);
      };

      mediaRecorder.onerror = (event) => {
        setError('MediaRecorder error occurred');
        setConnectionStatus('error');
      };
    } catch (err) {
      console.error("Error starting transcription:", err);
      setError(err.message || "Failed to start transcription");
      setConnectionStatus("error");

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [targetLanguage, novaModel, currentRoomId, addTranscriptionResult, onRecordingComplete]);

  /**
   * Stop transcription
   */
  const stopTranscription = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (deepgramServiceRef.current) {
      deepgramServiceRef.current.close();
      deepgramServiceRef.current = null;
    }
    if (speechmaticsServiceRef.current) {
      speechmaticsServiceRef.current.close();
      speechmaticsServiceRef.current = null;
    }

    // Flush any remaining incomplete sentences before stopping (OLD - commented out)
    // if (translationServiceRef.current) {
    //   translationServiceRef.current.flushIncompleteSentence();
    // }

    // Flush Gemini translation buffer before stopping (NEW)
    if (geminiTranslationServiceRef.current) {
      console.log("🔄 Flushing Gemini translation buffer...");
      geminiTranslationServiceRef.current.flushBuffer();
    }

    setIsRecording(false);
    setConnectionStatus("disconnected");
    setInterimText("");
  }, [isRecording]);

  /**
   * Clear transcription results
   */
  const clearTranscription = useCallback(() => {
    setTranscriptionResults([]);
    setInterimText("");
    setError(null);
    
    // Clear OLD translation service buffer (COMMENTED OUT)
    // if (translationServiceRef.current) {
    //   translationServiceRef.current.clearBuffer();
    // }

    // Clear Gemini translation service buffer (NEW)
    if (geminiTranslationServiceRef.current) {
      geminiTranslationServiceRef.current.clearBuffer();
    }
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up useTranscriptionService resources");
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log("🛑 Stopping media recorder");
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.error("Error stopping media recorder:", error);
        }
        mediaRecorderRef.current = null;
      }
      
      // Stop all media stream tracks
      if (streamRef.current) {
        console.log("🎤 Stopping media stream tracks");
        streamRef.current.getTracks().forEach((track) => {
          console.log(`Stopping track: ${track.kind} - ${track.label}`);
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Close Deepgram service
      if (deepgramServiceRef.current) {
        console.log("🔌 Closing Deepgram service");
        try {
          deepgramServiceRef.current.close();
        } catch (error) {
          console.error("Error closing Deepgram service:", error);
        }
        deepgramServiceRef.current = null;
      }
      
      // Close Speechmatics service
      if (speechmaticsServiceRef.current) {
        console.log("🔌 Closing Speechmatics service");
        try {
          speechmaticsServiceRef.current.close();
        } catch (error) {
          console.error("Error closing Speechmatics service:", error);
        }
        speechmaticsServiceRef.current = null;
      }
      
      // Flush any remaining incomplete sentences on cleanup (OLD - commented out)
      // if (translationServiceRef.current) {
      //   translationServiceRef.current.flushIncompleteSentence();
      // }

      // Flush Gemini translation buffer on cleanup (NEW)
      if (geminiTranslationServiceRef.current) {
        console.log("🔄 Flushing Gemini translation buffer on cleanup");
        geminiTranslationServiceRef.current.flushBuffer();
      }
      
      console.log("✅ useTranscriptionService cleanup complete");
    };
  }, []);

  return {
    isRecording,
    connectionStatus,
    transcriptionResults,
    interimText,
    error,
    startTranscription,
    stopTranscription,
    clearTranscription,
    serviceProvider,
    isNovaSupported: isLanguageSupported(targetLanguage),
    currentRoomId,
  };
}

export default useTranscriptionService;

