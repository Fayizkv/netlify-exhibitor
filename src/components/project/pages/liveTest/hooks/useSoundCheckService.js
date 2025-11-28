/**
 * useSoundCheckService.js
 * 
 * Hook for managing sound check functionality
 * Uses Deepgram for testing audio without server communication
 */

import { useState, useRef, useCallback, useEffect } from "react";
import DeepgramService from "../services/DeepgramService";

/**
 * Custom hook for sound check service (Deepgram only, no server communication)
 * @param {string} targetLanguage - Target language code (default: "en-US")
 * @param {string} novaModel - Nova model to use (default: "nova-3")
 * @returns {Object} Sound check service state and methods
 */
function useSoundCheckService(targetLanguage = "en-US", novaModel = "nova-3") {
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const deepgramServiceRef = useRef(null);

  /**
   * Add transcription result to the list
   */
  const addSoundCheckResult = useCallback(
    (text, isFinal) => {
      console.log("Adding sound check result:", { text, isFinal });

      if (text.trim() === "") {
        return;
      }

      // Always update interim text for real-time display
      if (!isFinal) {
        setInterimText(text);
      }

      if (isFinal) {
        const result = {
          text: text,
          isFinal,
          timestamp: new Date(),
          language: targetLanguage,
          novaModel: novaModel,
        };

        setTranscriptionResults((prev) => [result, ...prev]);
        setInterimText(""); // Clear interim when final arrives
      }
    },
    [targetLanguage, novaModel]
  );

  /**
   * Start sound check
   */
  const startSoundCheck = useCallback(async () => {
    console.log("Starting sound check with Deepgram only");
    console.log("Target language:", targetLanguage);
    console.log("Nova model:", novaModel);

    try {
      setError(null);
      setConnectionStatus("connecting");

      // Check if Deepgram API key is available
      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;

      if (!apiKey) {
        throw new Error("Deepgram API key not found. Please set VITE_DEEPGRAM_API_KEY environment variable.");
      }

      // Get user microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      // Initialize Deepgram service
      const deepgramService = new DeepgramService();
      deepgramServiceRef.current = deepgramService;

      // Setup Deepgram event listeners
      deepgramService.on({
        onOpen: () => {
          console.log("Sound check Deepgram connection opened successfully");
          setConnectionStatus("connected");

          // Start MediaRecorder
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            console.log("Sound check MediaRecorder data available:", {
              size: event.data.size,
              readyState: deepgramService.getReadyState(),
            });
            if (event.data.size > 0 && deepgramService.getReadyState() === 1) {
              deepgramService.sendAudioData(event.data);
              console.log("Sent audio data to Deepgram for sound check");
            }
          };

          mediaRecorder.onerror = (event) => {
            console.error("Sound check MediaRecorder error:", event);
            setError("MediaRecorder error occurred during sound check");
            setConnectionStatus("error");
          };

          mediaRecorder.start(100); // Send data every 100ms
          setIsRecording(true);
        },
        onTranscript: (transcript, isFinal) => {
          console.log("Sound check Deepgram transcript received:", {
            transcript,
            isFinal,
          });

          if (transcript) {
            addSoundCheckResult(transcript, isFinal);
          }
        },
        onError: (errorMsg) => {
          console.error("Sound check Deepgram error:", errorMsg);
          setError(`Sound check connection failed: ${errorMsg}`);
          setConnectionStatus("error");
        },
        onClose: () => {
          console.log("Sound check Deepgram connection closed");
          setConnectionStatus("disconnected");
          setIsRecording(false);
        },
      });

      // Initialize Deepgram connection
      await deepgramService.initialize({
        apiKey,
        model: novaModel,
        language: targetLanguage,
        interimResults: true,
        punctuate: true,
        smartFormat: true,
      });

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (deepgramService.getReadyState() !== 1) {
          console.error("Sound check connection timeout - WebSocket failed to open");
          setError("Connection timeout. Please check your internet connection and try again.");
          setConnectionStatus("error");
          deepgramService.close();
        }
      }, 10000);

      // Clear timeout on successful connection (handled in onOpen listener)
    } catch (err) {
      console.error("Error starting sound check:", err);
      setError(err.message || "Failed to start sound check");
      setConnectionStatus("error");

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [targetLanguage, novaModel, addSoundCheckResult]);

  /**
   * Stop sound check
   */
  const stopSoundCheck = useCallback(() => {
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

    setIsRecording(false);
    setConnectionStatus("disconnected");
    setInterimText("");
  }, [isRecording]);

  /**
   * Clear sound check results
   */
  const clearSoundCheck = useCallback(() => {
    setTranscriptionResults([]);
    setInterimText("");
    setError(null);
  }, []);

  /**
   * Cleanup effect - ensure resources are released on unmount
   */
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up useSoundCheckService resources");
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log("🛑 Stopping sound check media recorder");
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.error("Error stopping sound check media recorder:", error);
        }
        mediaRecorderRef.current = null;
      }
      
      // Stop all media stream tracks
      if (streamRef.current) {
        console.log("🎤 Stopping sound check media stream tracks");
        streamRef.current.getTracks().forEach((track) => {
          console.log(`Stopping sound check track: ${track.kind} - ${track.label}`);
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Close Deepgram service
      if (deepgramServiceRef.current) {
        console.log("🔌 Closing sound check Deepgram service");
        try {
          deepgramServiceRef.current.close();
        } catch (error) {
          console.error("Error closing sound check Deepgram service:", error);
        }
        deepgramServiceRef.current = null;
      }
      
      console.log("✅ useSoundCheckService cleanup complete");
    };
  }, []);

  return {
    isRecording,
    connectionStatus,
    transcriptionResults,
    interimText,
    error,
    startSoundCheck,
    stopSoundCheck,
    clearSoundCheck,
  };
}

export default useSoundCheckService;

