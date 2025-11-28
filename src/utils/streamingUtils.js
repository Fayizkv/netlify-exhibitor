// Streaming utilities for audio transcription services

/**
 * Get the backend WebSocket URL based on environment
 * @returns {string} WebSocket URL for the backend
 */
export const getBackendWebSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API;
  if (apiUrl) {
    // Convert HTTP URL to WebSocket URL
    return apiUrl.replace(/^https?/, "ws").replace(/\/$/, "");
  }
  return "ws://localhost:3002/api/v1/";
};

/**
 * Create WebSocket connection with proper error handling
 * @param {string} endpoint - The WebSocket endpoint (e.g., 'google-speech', 'deepgram-speech')
 * @param {Function} onOpen - Callback when connection opens
 * @param {Function} onMessage - Callback when message received
 * @param {Function} onError - Callback when error occurs
 * @param {Function} onClose - Callback when connection closes
 * @returns {WebSocket} WebSocket instance
 */
export const createWebSocketConnection = (endpoint, { onOpen, onMessage, onError, onClose }) => {
  const wsUrl = `${getBackendWebSocketUrl()}${endpoint}`;
  console.log(`Creating WebSocket connection to: ${wsUrl}`);

  const websocket = new WebSocket(wsUrl);

  // Add connection timeout
  const connectionTimeout = setTimeout(() => {
    if (websocket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket connection timeout");
      onError(new Error("Connection timeout. Please try again."));
      websocket.close();
    }
  }, 10000); // 10 second timeout

  websocket.onopen = (event) => {
    clearTimeout(connectionTimeout);
    console.log("WebSocket connected successfully");
    onOpen(event);
  };

  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket message:", data);
      onMessage(data);
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
      onError(new Error("Invalid message received from server"));
    }
  };

  websocket.onerror = (error) => {
    clearTimeout(connectionTimeout);
    console.error("WebSocket error:", error);
    onError(new Error("WebSocket connection failed. Check if backend is running."));
  };

  websocket.onclose = (event) => {
    clearTimeout(connectionTimeout);
    console.log("WebSocket closed. Code:", event.code, "Reason:", event.reason);
    onClose(event);
  };

  return websocket;
};

/**
 * Send a message through WebSocket with error handling
 * @param {WebSocket} websocket - WebSocket instance
 * @param {Object} message - Message to send
 * @returns {boolean} Success status
 */
export const sendWebSocketMessage = (websocket, message) => {
  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not open");
    return false;
  }

  try {
    websocket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error("Error sending WebSocket message:", error);
    return false;
  }
};

/**
 * Setup MediaRecorder for audio streaming
 * @param {MediaStream} stream - Audio stream from getUserMedia
 * @param {Function} onDataAvailable - Callback when audio data is available
 * @param {Function} onError - Callback when error occurs
 * @returns {MediaRecorder} MediaRecorder instance
 */
export const createMediaRecorder = (stream, { onDataAvailable, onError }) => {
  // Try to use opus format first, fallback to webm if not supported
  let mimeType = "audio/opus";

  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = "audio/webm;codecs=opus";
    console.log("Opus format not supported, falling back to WebM/Opus");
  } else {
    console.log("Using Opus format for audio recording");
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: mimeType,
  });

  mediaRecorder.ondataavailable = (event) => {
    console.log("MediaRecorder data available, size:", event.data.size);
    if (event.data.size > 0) {
      onDataAvailable(event.data);
    }
  };

  mediaRecorder.onerror = (event) => {
    console.error("MediaRecorder error:", event);
    onError(new Error("MediaRecorder error occurred"));
  };

  mediaRecorder.onstart = () => {
    console.log("MediaRecorder started");
  };

  mediaRecorder.onstop = () => {
    console.log("MediaRecorder stopped");
  };

  return mediaRecorder;
};

/**
 * Convert audio blob to base64 string
 * @param {Blob} audioBlob - Audio data blob
 * @returns {Promise<string>} Base64 encoded audio data
 */
export const audioBlobToBase64 = (audioBlob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result.split(",")[1];
      resolve(base64Audio);
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(error);
    };
    reader.readAsDataURL(audioBlob);
  });
};

/**
 * Get user microphone access
 * @returns {Promise<MediaStream>} Audio stream
 */
export const getUserMicrophone = async () => {
  try {
    console.log("Requesting microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Microphone access granted");
    return stream;
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw new Error("Microphone access denied. Please allow microphone access and try again.");
  }
};

/**
 * Clean up media resources
 * @param {MediaStream} stream - Media stream to clean up
 * @param {MediaRecorder} mediaRecorder - Media recorder to clean up
 * @param {WebSocket} websocket - WebSocket to clean up
 */
export const cleanupMediaResources = (stream, mediaRecorder, websocket) => {
  console.log("Cleaning up media resources...");

  // Stop MediaRecorder
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    try {
      mediaRecorder.stop();
    } catch (error) {
      console.error("Error stopping MediaRecorder:", error);
    }
  }

  // Stop microphone stream
  if (stream) {
    try {
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  }

  // Close WebSocket
  if (websocket) {
    try {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: "stop" }));
      }
      websocket.close(1000, "Cleanup");
    } catch (error) {
      console.error("Error closing WebSocket:", error);
    }
  }
};

/**
 * Room ID generator
 * @param {string} prefix - Prefix for room ID
 * @returns {string} Generated room ID
 */
export const generateRoomId = (prefix = "room") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Service type constants
 */
export const TRANSCRIPTION_SERVICES = {
  GOOGLE: "google",
  DEEPGRAM: "deepgram",
};

/**
 * WebSocket message types
 */
export const MESSAGE_TYPES = {
  JOIN: "join",
  START: "start",
  STOP: "stop",
  AUDIO: "audio",
  JOINED: "joined",
  STARTED: "started",
  STOPPED: "stopped",
  TRANSCRIPT: "transcript",
  ERROR: "error",
};

/**
 * Client types for room management
 */
export const CLIENT_TYPES = {
  SENDER: "sender",
  RECEIVER: "receiver",
};
