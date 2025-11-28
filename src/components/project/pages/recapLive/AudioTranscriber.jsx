import React, { useState, useRef, useCallback, useEffect } from "react";
import CustomSelect from "../../../core/select";

// Utility function for class names
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Status Indicator Component
function StatusIndicator({ status }) {
  const statusConfig = {
    disconnected: {
      color: "bg-gray-400",
      text: "Disconnected",
      icon: "AlertCircle",
      pulse: false,
    },
    connecting: {
      color: "bg-amber-500",
      text: "Connecting...",
      icon: "Loader2",
      pulse: true,
    },
    connected: {
      color: "bg-green-500",
      text: "Connected & Recording",
      icon: "CheckCircle",
      pulse: true,
    },
    error: {
      color: "bg-red-500",
      text: "Connection Error",
      icon: "AlertCircle",
      pulse: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg">
      <div className="flex items-center gap-2">
        <div className={cn("w-3 h-3 rounded-full", config.color, config.pulse ? "animate-pulse" : "")} />
        <span className="text-sm font-medium text-slate-600">{config.text}</span>
      </div>
    </div>
  );
}

// Custom Hook for Direct Transcription Services
function useTranscriptionService(targetLanguage = "en-US", roomId = null, sessionId = null) {
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [serviceProvider, setServiceProvider] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const websocketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Determine service provider based on language support
  const isNovaSupported = (languageCode) => {
    const NOVA_SUPPORTED_LANGUAGES = [
      "bg",
      "ca",
      "yue",
      "zh",
      "zh-TW",
      "cs",
      "da",
      "nl",
      "en-US",
      "en-AU",
      "en-IN",
      "en-NZ",
      "en-GB",
      "et",
      "fi",
      "fr-FR",
      "fr-CA",
      "de-DE",
      "de-CH",
      "hi",
      "hi-Latn",
      "hu",
      "id",
      "it",
      "ja",
      "ko",
      "lv",
      "lt",
      "ms",
      "el",
      "no",
      "pl",
      "pt-PT",
      "pt-BR",
      "ro",
      "ru",
      "sk",
      "es-ES",
      "es-419",
      "sv",
      "tmh",
      "ta",
      "th",
      "tr",
      "uk",
      "vi",
    ];

    const baseLanguage = languageCode.split("-")[0];
    return NOVA_SUPPORTED_LANGUAGES.includes(languageCode) || NOVA_SUPPORTED_LANGUAGES.includes(baseLanguage);
  };

  // Get WebSocket URL based on provider
  const getWebSocketUrl = (provider, roomId, language) => {
    // Use the same environment variable names as the working transcription client
    const baseUrl = provider === "deepgram" ? import.meta.env.VITE_DEEPGRAM_URL : import.meta.env.VITE_GOOGLE_URL;

    if (!baseUrl) {
      throw new Error(`${provider === "deepgram" ? "REACT_APP_DEEPGRAM_URL/VITE_DEEPGRAM_URL" : "REACT_APP_GOOGLE_URL/VITE_GOOGLE_URL"} environment variable is not set`);
    }

    // Construct URL the same way as the working transcription client
    const url = new URL(baseUrl);
    url.searchParams.set("roomId", roomId);
    url.searchParams.set("language", language);
    url.searchParams.set("provider", provider);

    return url.toString();
  };

  // Add transcription result
  const addTranscriptionResult = useCallback(
    async (text, isFinal, metadata = {}) => {
      console.log("addTranscriptionResult called with:", { text, isFinal, metadata });

      if (text.trim() === "") {
        console.log("Skipping empty transcript");
        return;
      }

      if (isFinal) {
        console.log("Adding final transcript:", text);
        setTranscriptionResults((prev) => [
          ...prev,
          {
            text: text,
            isFinal: true,
            timestamp: new Date(),
            service: serviceProvider,
            roomId: currentRoomId,
            sessionId: currentSessionId,
            metadata: metadata,
          },
        ]);
        setInterimText("");
      } else {
        console.log("Setting interim text:", text);
        setInterimText(text);
      }
    },
    [currentRoomId, currentSessionId, serviceProvider]
  );

  // Connect to server (separate from recording)
  const connectToServer = useCallback(() => {
    try {
      setError(null);
      setConnectionStatus("connecting");

      // Use session ID as room ID if available, otherwise use provided room ID
      const finalRoomId = sessionId || roomId || `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentRoomId(finalRoomId);
      setCurrentSessionId(sessionId);

      // Determine service provider
      const provider = isNovaSupported(targetLanguage) ? "deepgram" : "google";
      setServiceProvider(provider);

      console.log(`Connecting to ${provider} transcription server in room ${finalRoomId}`);

      // Create WebSocket connection
      const wsUrl = getWebSocketUrl(provider, finalRoomId, targetLanguage);
      console.log(`Connecting to WebSocket: ${wsUrl}`);

      const websocket = new WebSocket(wsUrl);
      websocketRef.current = websocket;

      // WebSocket event handlers - match the working client exactly
      websocket.onopen = () => {
        console.log(`Connected to ${provider} transcription server in room ${finalRoomId}`);
        setConnectionStatus("connected");
        setIsInRoom(true);
      };

      websocket.onmessage = (event) => {
        console.log("Received WebSocket message:", event.data);
        if (event.data === "") return;

        try {
          const data = JSON.parse(event.data);
          console.log("Parsed message data:", data);

          if (data.type === "connection") {
            console.log("Connection confirmed:", data.message);
            return;
          }

          // Handle transcript data exactly like the working client
          if (data.channel?.alternatives?.[0]?.transcript) {
            const transcriptText = data.channel.alternatives[0].transcript;
            console.log("Received transcript:", transcriptText);

            // Always update live transcript for faster feedback
            setInterimText(transcriptText);

            // Only update final transcript if it's marked as final
            if (data.is_final) {
              addTranscriptionResult(transcriptText, true, {
                provider: provider,
                language: targetLanguage,
                confidence: data.channel.alternatives[0].confidence || 0.9,
              });
            }
          } else {
            console.log("No transcript found in data:", data);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      websocket.onclose = (event) => {
        console.log(`Disconnected from ${provider} transcription server. Code: ${event.code}`);
        setConnectionStatus("disconnected");
        setIsRecording(false);
        setIsInRoom(false);

        // If closed unexpectedly, show error
        if (event.code !== 1000 && event.code !== 1001) {
          setError(`Connection lost unexpectedly (code: ${event.code})`);
        }
      };

      websocket.onerror = (error) => {
        console.error(`WebSocket error for ${provider}:`, error);
        setError(`Connection error to ${provider} server`);
        setConnectionStatus("error");
      };
    } catch (error) {
      console.error("Error connecting to server:", error);
      setError(error.message);
      setConnectionStatus("error");
    }
  }, [targetLanguage, roomId, sessionId]);

  // Start recording (separate from connection)
  const startRecording = useCallback(async () => {
    try {
      console.log("Starting microphone...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0 && websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(event.data);
        }
      });

      mediaRecorder.start(250); // Send data every 250ms for faster results
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Error accessing microphone. Please check permissions.");
    }
  }, []);

  // Stop transcription
  const stopTranscription = useCallback(() => {
    try {
      console.log("Stopping transcription...");

      // Stop MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      // Stop microphone stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setIsRecording(false);
    } catch (error) {
      console.error("Error stopping transcription:", error);
      setError("Error stopping transcription");
    }
  }, []);

  // Disconnect from server
  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close(1000, "User disconnected");
    }
    stopTranscription();
    setIsInRoom(false);
  }, [stopTranscription]);

  // Clear transcription results
  const clearTranscription = useCallback(() => {
    setTranscriptionResults([]);
    setInterimText("");
    setError(null);
  }, []);

  // Cleanup function for component unmount
  const cleanup = useCallback(() => {
    console.log("Cleaning up transcription service...");
    disconnect();
  }, [disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    connectionStatus,
    transcriptionResults,
    interimText,
    error,
    connectToServer,
    startRecording,
    stopTranscription,
    disconnect,
    clearTranscription,
    currentRoomId,
    currentSessionId,
    serviceProvider,
    isInRoom,
  };
}

// Main AudioTranscriptor Component
export function AudioTranscriptor({ translationLanguages = [], roomId = null }) {
  // Define all language-related constants and functions first
  const SUPPORTED_LANGUAGES = [
    { code: "bg", name: "Bulgarian" },
    { code: "ca", name: "Catalan" },
    { code: "yue", name: "Chinese (Cantonese, Hong Kong)" },
    { code: "zh", name: "Chinese (Mandarin, Mainland)" },
    { code: "zh-TW", name: "Chinese (Traditional, Taiwan)" },
    { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" },
    { code: "nl", name: "Dutch" },
    { code: "en-US", name: "English" },
    { code: "en-AU", name: "English (Australia)" },
    { code: "en-IN", name: "English (India)" },
    { code: "en-NZ", name: "English (New Zealand)" },
    { code: "en-GB", name: "English (United Kingdom)" },
    { code: "et", name: "Estonian" },
    { code: "fi", name: "Finnish" },
    { code: "fr-FR", name: "French" },
    { code: "fr-CA", name: "French (Canada)" },
    { code: "de-DE", name: "German" },
    { code: "de-CH", name: "German (Switzerland)" },
    { code: "hi", name: "Hindi" },
    { code: "hi-Latn", name: "Hindi (Latin)" },
    { code: "hu", name: "Hungarian" },
    { code: "id", name: "Indonesian" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "lv", name: "Latvian" },
    { code: "lt", name: "Lithuanian" },
    { code: "ms", name: "Malay" },
    { code: "el", name: "Modern Greek" },
    { code: "no", name: "Norwegian" },
    { code: "pl", name: "Polish" },
    { code: "pt-PT", name: "Portuguese" },
    { code: "pt-BR", name: "Portuguese (Brazil)" },
    { code: "pt-PT", name: "Portuguese (Portugal)" },
    { code: "ro", name: "Romanian" },
    { code: "ru", name: "Russian" },
    { code: "sk", name: "Slovak" },
    { code: "es-ES", name: "Spanish" },
    { code: "es-419", name: "Spanish (Latin America and the Caribbean)" },
    { code: "sv", name: "Swedish" },
    { code: "tmh", name: "Tamasheq" },
    { code: "ta", name: "Tamil" },
    { code: "th", name: "Thai" },
    { code: "tr", name: "Turkish" },
    { code: "uk", name: "Ukrainian" },
    { code: "vi", name: "Vietnamese" },
  ];

  // Function to map language names to proper language codes
  const mapLanguageToCode = (languageName) => {
    // First, try to find exact match in supported languages
    const exactMatch = SUPPORTED_LANGUAGES.find((lang) => lang.name.toLowerCase() === languageName.toLowerCase());
    if (exactMatch) {
      return exactMatch.code;
    }

    // Common language name mappings with proper locale codes
    const commonMappings = {
      english: "en-US",
      french: "fr-FR",
      spanish: "es-ES",
      german: "de-DE",
      italian: "it-IT",
      portuguese: "pt-PT",
      arabic: "ar-SA",
      malayalam: "ml-IN",
      esperanto: "eo",
      hindi: "hi-IN",
      chinese: "zh-CN",
      mandarin: "zh-CN",
      cantonese: "yue",
      "traditional chinese": "zh-TW",
      "simplified chinese": "zh-CN",
      "portuguese (brazil)": "pt-BR",
      "portuguese (portugal)": "pt-PT",
      "spanish (latin america)": "es-419",
      "english (australia)": "en-AU",
      "english (india)": "en-IN",
      "english (new zealand)": "en-NZ",
      "english (united kingdom)": "en-GB",
      "french (canada)": "fr-CA",
      "german (switzerland)": "de-CH",
      "hindi (latin)": "hi-Latn",
      "modern greek": "el",
      tamasheq: "tmh",
    };

    const normalizedName = languageName.toLowerCase();
    return commonMappings[normalizedName] || "en-US"; // Default to English
  };

  // Deepgram Nova-2 supported languages (for direct Deepgram connection)
  const NOVA_SUPPORTED_LANGUAGES = [
    "bg",
    "ca",
    "yue",
    "zh",
    "zh-TW",
    "cs",
    "da",
    "nl",
    "en-US",
    "en-AU",
    "en-IN",
    "en-NZ",
    "en-GB",
    "et",
    "fi",
    "fr-FR",
    "fr-CA",
    "de-DE",
    "de-CH",
    "hi",
    "hi-Latn",
    "hu",
    "id",
    "it",
    "ja",
    "ko",
    "lv",
    "lt",
    "ms",
    "el",
    "no",
    "pl",
    "pt-PT",
    "pt-BR",
    "ro",
    "ru",
    "sk",
    "es-ES",
    "es-419",
    "sv",
    "tmh",
    "ta",
    "th",
    "tr",
    "uk",
    "vi",
  ];

  const isNovaSupported = (languageCode) => {
    // Check both full code and base language
    const baseLanguage = languageCode.split("-")[0];
    return NOVA_SUPPORTED_LANGUAGES.includes(languageCode) || NOVA_SUPPORTED_LANGUAGES.includes(baseLanguage);
  };

  const getAvailableLanguages = () => {
    if (!translationLanguages || translationLanguages.length === 0) {
      console.log("No translation languages provided, using all supported languages");
      return SUPPORTED_LANGUAGES; // Fallback to all languages
    }

    console.log("Processing translation languages:", translationLanguages);

    return translationLanguages.map((langName) => {
      const code = mapLanguageToCode(langName);
      const isSupported = isNovaSupported(code);

      console.log(`Language mapping: "${langName}" -> Code: "${code}" -> Nova Supported: ${isSupported}`);

      return {
        name: langName,
        code: code,
        originalName: langName,
        isNovaSupported: isSupported,
      };
    });
  };

  const availableLanguages = getAvailableLanguages();

  // Set initial targetLanguage to the first available language
  const [targetLanguage, setTargetLanguage] = useState(availableLanguages.length > 0 ? availableLanguages[0].code : "en-US");
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Debug logging for initial state
  console.log("AudioTranscriber Debug Info:");
  console.log("- Initial targetLanguage:", targetLanguage);
  console.log("- Available languages:", availableLanguages);
  console.log("- Room ID:", roomId);
  console.log("- Selected Session ID:", selectedSessionId);

  // Determine which service to use based on Nova support
  const useNovaService = isNovaSupported(targetLanguage);

  // Debug logging for service selection
  console.log(`AudioTranscriber Service Selection:`);
  console.log(`- Target Language: ${targetLanguage}`);
  console.log(`- Nova Supported: ${useNovaService}`);
  console.log(`- Service: ${useNovaService ? "Direct Deepgram Nova-2" : "Google Speech"}`);

  // Use the transcription service hook
  const {
    isRecording,
    connectionStatus,
    transcriptionResults,
    interimText,
    error,
    connectToServer,
    startRecording,
    stopTranscription,
    disconnect,
    clearTranscription,
    currentRoomId,
    currentSessionId,
    serviceProvider,
    isInRoom,
  } = useTranscriptionService(targetLanguage, roomId, selectedSessionId);

  // Handle session selection
  const handleSessionSelect = (option) => {
    console.log("Session selected:", option);
    setSelectedSessionId(option.id);
  };

  // Auto-connect when component mounts or when session changes
  useEffect(() => {
    if (targetLanguage && (roomId || selectedSessionId)) {
      connectToServer();
    }
  }, [targetLanguage, roomId, selectedSessionId, connectToServer]);

  return (
    <>
      {/* Controls Panel */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {/* Service Information */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Active Service:</span>
              <span className={`px-2 py-1 rounded ${useNovaService ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}>
                {useNovaService ? "Deepgram Nova-2 (Direct)" : "Google Speech (Direct)"}
              </span>
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">Auto-selected for {targetLanguage}</span>
            </div>

            {/* Debug Information */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Debug:</span>
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">{/* REACT_APP_DEEPGRAM_URL: {process.env.REACT_APP_DEEPGRAM_URL ? 'Set' : 'Not Set'} */}</span>
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">VITE_DEEPGRAM_URL: {import.meta.env.VITE_DEEPGRAM_URL ? "Set" : "Not Set"}</span>
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">{/* REACT_APP_GOOGLE_URL: {process.env.REACT_APP_GOOGLE_URL ? 'Set' : 'Not Set'} */}</span>
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">VITE_GOOGLE_URL: {import.meta.env.VITE_GOOGLE_URL ? "Set" : "Not Set"}</span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Translate to:</span>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={isRecording}
                className="w-80 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableLanguages.map((lang) => {
                  const serviceIndicator = lang.isNovaSupported ? " → Nova Direct" : " → Google Direct";

                  return (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                      {serviceIndicator}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Session Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Session:</span>
              <div className="w-80">
                <CustomSelect
                  label="Session"
                  value={selectedSessionId || ""}
                  placeholder="Select Session"
                  onSelect={handleSessionSelect}
                  apiType="API"
                  selectApi={`sessions/select?event=${roomId}`}
                  selectName="sessionId"
                  selectLabel="Session"
                  selectPlaceholder="Select Session"
                  selectOptions={[]}
                  disabled={isRecording}
                />
              </div>
            </div>

            {/* Room/Session Information */}
            {(currentRoomId || currentSessionId) && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Active Room:</span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-800">{currentSessionId || currentRoomId}</span>
                {currentSessionId && <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">Session-based</span>}
                {isInRoom && <span className="px-2 py-1 rounded bg-green-100 text-green-800">Connected</span>}
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Control Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={connectToServer}
                  disabled={isInRoom}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium",
                    isInRoom && "opacity-50 cursor-not-allowed"
                  )}
                >
                  🔗 Connect
                </button>

                <button
                  onClick={startRecording}
                  disabled={isRecording || !isInRoom}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium",
                    (isRecording || !isInRoom) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  🎤 Start Recording
                </button>

                <button
                  onClick={stopTranscription}
                  disabled={!isRecording}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium",
                    !isRecording && "opacity-50 cursor-not-allowed"
                  )}
                >
                  ⏹️ Stop Recording
                </button>

                <button onClick={disconnect} className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium">
                  🔌 Disconnect
                </button>

                <button onClick={clearTranscription} className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium">
                  🗑️ Clear
                </button>
              </div>

              {/* Status Indicator */}
              <StatusIndicator status={connectionStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Output */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="bg-slate-50 border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">⚡ Live Transcription</h3>
          <p className="text-sm text-slate-600">Interim results appear in gray, final results are saved below</p>
        </div>

        {/* Interim Results */}
        <div className="px-6 py-4 border-b bg-slate-25 min-h-[80px] flex items-center">
          <div className="w-full">
            <div className="text-xs text-slate-500 font-medium mb-2">Interim Results:</div>
            <div className="text-slate-400 italic font-mono text-sm leading-relaxed min-h-[20px]">{interimText || (isRecording ? "Listening..." : "")}</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-4 border-b bg-red-50">
            <div className="flex items-center gap-2 text-red-800">
              ⚠️ <span className="text-sm font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Final Transcription Results */}
        <div className="p-6 max-h-[calc(100vh-400px)] overflow-y-auto space-y-4">
          {transcriptionResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎤</div>
              <h3 className="text-xl font-medium text-slate-600 mb-3">Ready to Transcribe</h3>
              <p className="text-slate-500 max-w-lg mx-auto text-base">Click "Start Recording" to begin live transcription. Make sure to allow microphone access when prompted.</p>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md max-w-lg mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Smart Service Selection:</strong> Nova-supported languages use direct Deepgram connection, others use Google Speech.
                  <br />
                  <span className="text-blue-600">Configure VITE_DEEPGRAM_URL and VITE_GOOGLE_URL environment variables.</span>
                </p>
              </div>
            </div>
          ) : (
            transcriptionResults.map((result, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 font-medium">{result.timestamp.toLocaleTimeString()}</span>
                    {result.metadata?.language && result.metadata.language !== "en" && (
                      <span className="px-3 py-1 text-xs border border-slate-300 rounded font-medium">{result.metadata.language.toUpperCase()}</span>
                    )}
                    {result.service && (
                      <span
                        className={`px-3 py-1 text-xs rounded font-medium ${
                          result.service === "deepgram" ? "bg-purple-100 text-purple-800" : result.service === "google" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {result.service === "deepgram" ? "Deepgram Nova-2" : result.service === "google" ? "Google Speech" : "Unknown"}
                      </span>
                    )}
                  </div>
                  <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded font-medium">Final</span>
                </div>
                {result.originalText && result.isTranslated && <div className="mb-3 p-3 bg-slate-50 rounded text-sm text-slate-600 italic">Original: "{result.originalText}"</div>}
                <p className="text-slate-700 leading-relaxed text-base">{result.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
