/**
 * DeepgramService.js
 * 
 * Service for handling Deepgram live transcription
 * This service can be easily replaced with other providers like Speechmatics
 */

class DeepgramService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.listeners = {
      onOpen: null,
      onTranscript: null,
      onError: null,
      onClose: null,
    };
  }

  /**
   * Initialize Deepgram connection
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Deepgram API key
   * @param {string} config.model - Nova model (nova-2 or nova-3)
   * @param {string} config.language - Target language code
   * @param {boolean} config.interimResults - Enable interim results
   * @param {boolean} config.punctuate - Enable punctuation
   * @param {boolean} config.smartFormat - Enable smart formatting
   * @returns {Promise<Object>} Deepgram connection instance
   */
  async initialize(config) {
    const {
      apiKey,
      model = "nova-3",
      language = "en-US",
      interimResults = true,
      punctuate = true,
      smartFormat = true,
    } = config;

    if (!apiKey) {
      throw new Error("Deepgram API key is required");
    }

    try {
      // Dynamically import Deepgram SDK
      const { createClient, LiveTranscriptionEvents } = await import("@deepgram/sdk");

      const deepgramClient = createClient(apiKey);

      // Setup Deepgram live connection
      const deepgramLive = deepgramClient.listen.live({
        model,
        language,
        interim_results: interimResults,
        punctuate,
        smart_format: smartFormat,
      });

      this.connection = deepgramLive;
      this.LiveTranscriptionEvents = LiveTranscriptionEvents;

      // Setup event listeners
      this.setupEventListeners();

      return deepgramLive;
    } catch (error) {
      console.error("Error initializing Deepgram:", error);
      throw new Error(`Failed to initialize Deepgram: ${error.message}`);
    }
  }

  /**
   * Setup Deepgram event listeners
   */
  setupEventListeners() {
    if (!this.connection || !this.LiveTranscriptionEvents) {
      return;
    }

    // Connection opened
    this.connection.on(this.LiveTranscriptionEvents.Open, () => {
      console.log("DeepgramService: Connection opened");
      this.isConnected = true;
      if (this.listeners.onOpen) {
        this.listeners.onOpen();
      }
    });

    // Transcript received
    this.connection.on(this.LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel?.alternatives?.[0]?.transcript;
      const isFinal = data.is_final || false;

      console.log("DeepgramService: Transcript received:", {
        transcript,
        isFinal,
      });

      if (transcript && this.listeners.onTranscript) {
        this.listeners.onTranscript(transcript, isFinal, data);
      }
    });

    // Error occurred
    this.connection.on(this.LiveTranscriptionEvents.Error, (error) => {
      console.error("DeepgramService: Error occurred:", error);
      this.isConnected = false;
      const errorMsg = error?.error?.message || error?.message || "Unknown connection error";
      
      if (this.listeners.onError) {
        this.listeners.onError(errorMsg);
      }
    });

    // Connection closed
    this.connection.on(this.LiveTranscriptionEvents.Close, () => {
      console.log("DeepgramService: Connection closed");
      this.isConnected = false;
      if (this.listeners.onClose) {
        this.listeners.onClose();
      }
    });
  }

  /**
   * Send audio data to Deepgram
   * @param {Blob} audioData - Audio data to send
   */
  sendAudioData(audioData) {
    if (!this.connection || !this.isConnected) {
      console.warn("DeepgramService: Cannot send audio - connection not ready");
      return;
    }

    if (this.connection.getReadyState() === 1) {
      this.connection.send(audioData);
    }
  }

  /**
   * Get connection ready state
   * @returns {number} WebSocket ready state
   */
  getReadyState() {
    return this.connection ? this.connection.getReadyState() : 0;
  }

  /**
   * Register event listeners
   * @param {Object} listeners - Event listener callbacks
   * @param {Function} listeners.onOpen - Called when connection opens
   * @param {Function} listeners.onTranscript - Called when transcript received
   * @param {Function} listeners.onError - Called on error
   * @param {Function} listeners.onClose - Called when connection closes
   */
  on(listeners) {
    this.listeners = { ...this.listeners, ...listeners };
  }

  /**
   * Close Deepgram connection
   */
  close() {
    if (this.connection) {
      console.log("DeepgramService: Closing connection");
      this.connection.finish();
      this.connection = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if service is connected
   * @returns {boolean} Connection status
   */
  isServiceConnected() {
    return this.isConnected && this.connection && this.getReadyState() === 1;
  }
}

export default DeepgramService;

