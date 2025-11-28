/**
 * GeminiTranslationService.js
 * 
 * Service for handling Gemini translation socket communication and sentence buffering
 * Sends 2 completed sentences at a time to the Gemini translation server
 */

class GeminiTranslationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.incompleteSentence = "";
    this.completeSentenceBuffer = []; // Buffer to hold complete sentences
    this.sessionId = null;
    this.sourceLanguage = null;
    this.targetLanguages = [];
    this.sessionContext = null;
  }

  /**
   * Initialize Gemini translation service with socket connection
   * @param {Object} socket - Socket.IO instance
   * @param {string} sessionId - Session ID (used as room ID)
   * @param {string} sourceLanguage - Source language code
   * @param {Array<string>} targetLanguages - Array of target language codes (first 4)
   */
  initialize(socket, sessionId, sourceLanguage, targetLanguages = []) {
    console.log("🎯 GeminiTranslationService: Initializing", {
      socket: !!socket,
      sessionId,
      sourceLanguage,
      targetLanguages,
    });

    this.socket = socket;
    this.sessionId = sessionId;
    this.sourceLanguage = sourceLanguage;
    this.targetLanguages = targetLanguages;
    this.isConnected = socket?.connected || false;

    // Setup socket event listeners
    this.setupSocketListeners();
  }

  /**
   * Setup socket event listeners
   */
  setupSocketListeners() {
    if (!this.socket) {
      return;
    }

    this.socket.on("connect", () => {
      console.log("🎯 GeminiTranslationService: Socket connected");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("🎯 GeminiTranslationService: Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("error", (error) => {
      console.error("❌ GeminiTranslationService: Socket error:", error);
      this.isConnected = false;
    });

    // Listen for translation updates
    this.socket.on("translation-update", (data) => {
      console.log("📨 Received translation update:", data);
    });
  }

  /**
   * Update configuration
   * @param {Object} config - Configuration to update
   * @param {string} config.sessionId - Session ID
   * @param {string} config.sourceLanguage - Source language code
   * @param {Array<string>} config.targetLanguages - Array of target language codes
   */
  updateConfig(config) {
    if (config.sessionId !== undefined) {
      this.sessionId = config.sessionId;
    }
    if (config.sourceLanguage !== undefined) {
      this.sourceLanguage = config.sourceLanguage;
    }
    if (config.targetLanguages !== undefined) {
      this.targetLanguages = config.targetLanguages;
    }
    if (config.sessionContext !== undefined) {
      this.sessionContext = config.sessionContext;
    }

    console.log("🎯 GeminiTranslationService: Config updated", {
      sessionId: this.sessionId,
      sourceLanguage: this.sourceLanguage,
      targetLanguages: this.targetLanguages,
      hasSessionContext: !!this.sessionContext,
    });
  }

  /**
   * Process text and separate complete sentences from incomplete ones
   * @param {string} text - Text to process
   * @returns {Object} Object containing complete sentences and incomplete sentence
   */
  processSentences(text) {
    // Combine previous incomplete sentence with new text
    const combinedText = this.incompleteSentence + text;

    // Regex to identify sentence endings across scripts (., !, ?, …, Devanagari danda, Arabic question/period)
    // Includes: . ! ? … \u0964 (।) \u0965 (॥) \u06D4 (۔) \u061F (؟)
    const sentenceEndRegex = /(?:[.!?…]|[\u0964\u0965\u06D4\u061F])+(?:["'’”)\]]*\s+|$)/g;

    // Split text into sentences
    const sentences = combinedText.split(sentenceEndRegex);
    const separators = combinedText.match(sentenceEndRegex) || [];

    const completeSentences = [];
    let incompleteSentence = "";

    // Process each sentence
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();

      if (sentence) {
        if (i < separators.length) {
          // This sentence has an ending punctuation, it's complete
          completeSentences.push(sentence + separators[i]);
        } else {
          // This is the last part and has no ending punctuation, it's incomplete
          incompleteSentence = sentence;
        }
      }
    }

    // Update the incomplete sentence buffer
    this.incompleteSentence = incompleteSentence;

    console.log("🎯 GeminiTranslationService: Sentence processing:", {
      inputText: text.substring(0, 50) + "...",
      completeSentences: completeSentences.length,
      incompleteSentence: incompleteSentence.substring(0, 30) + "...",
    });

    return {
      completeSentences,
      incompleteSentence,
    };
  }

  /**
   * Send transcription for translation (sends 2 sentences at a time)
   * @param {string} text - Text to translate
   * @param {boolean} isFinal - Whether this is a final transcription
   * @returns {boolean} Success status
   */
  sendForTranslation(text, isFinal = true) {
    if (!this.isConnected || !this.socket || !this.sessionId) {
      console.warn("⚠️ GeminiTranslationService: Cannot send translation - service not ready", {
        isConnected: this.isConnected,
        socket: !!this.socket,
        sessionId: this.sessionId,
      });
      return false;
    }

    // Only process final transcriptions
    if (!isFinal) {
      return false;
    }

    // Validate target languages
    if (this.targetLanguages.length === 0) {
      console.log("⚠️ GeminiTranslationService: No target languages configured");
      return false;
    }

    // Process sentences to separate complete from incomplete
    const { completeSentences } = this.processSentences(text);

    // Add complete sentences to buffer
    if (completeSentences.length > 0) {
      this.completeSentenceBuffer.push(...completeSentences);
      console.log(`📝 Added ${completeSentences.length} sentences to buffer. Total: ${this.completeSentenceBuffer.length}`);
    }

    // Send 2 sentences at a time when buffer has at least 2
    while (this.completeSentenceBuffer.length >= 2) {
      const twoSentences = this.completeSentenceBuffer.splice(0, 2);
      const textToSend = twoSentences.join(" ").trim();

      console.log("🚀 GeminiTranslationService: Sending 2 sentences for translation:", {
        sessionId: this.sessionId,
        text: textToSend.substring(0, 100) + "...",
        targetLanguages: this.targetLanguages,
      });

      // Send to Gemini translation server with target languages
      this.socket.emit("start-translation", {
        text: textToSend,
        sessionId: this.sessionId,
        targetLanguages: this.targetLanguages, // Include target languages
        sessionContext: this.sessionContext || undefined,
      });
    }

    return true;
  }

  /**
   * Flush any remaining sentences in buffer
   * Call this when stopping transcription to send remaining text
   * @returns {boolean} Success status
   */
  flushBuffer() {
    // Flush incomplete sentence first
    if (this.incompleteSentence.trim()) {
      this.completeSentenceBuffer.push(this.incompleteSentence);
      this.incompleteSentence = "";
    }

    // Send all remaining sentences
    if (this.completeSentenceBuffer.length > 0) {
      const remainingText = this.completeSentenceBuffer.join(" ").trim();
      
      console.log("🔄 GeminiTranslationService: Flushing remaining sentences:", {
        sessionId: this.sessionId,
        sentenceCount: this.completeSentenceBuffer.length,
        text: remainingText.substring(0, 100) + "...",
      });

      if (this.isConnected && this.socket && this.sessionId) {
        this.socket.emit("start-translation", {
          text: remainingText,
          sessionId: this.sessionId,
          targetLanguages: this.targetLanguages, // Include target languages
          sessionContext: this.sessionContext || undefined,
        });
      }

      this.completeSentenceBuffer = [];
      return true;
    }

    return false;
  }

  /**
   * Clear all buffers
   */
  clearBuffer() {
    this.incompleteSentence = "";
    this.completeSentenceBuffer = [];
    console.log("🧹 GeminiTranslationService: Buffers cleared");
  }

  /**
   * Stop all active translations for this session
   */
  stopTranslation() {
    if (this.isConnected && this.socket && this.sessionId) {
      console.log("🛑 GeminiTranslationService: Stopping translation for session:", this.sessionId);
      this.socket.emit("stop-translation", {
        sessionId: this.sessionId,
      });
    }
  }

  /**
   * Close Gemini translation service
   */
  close() {
    // Flush any remaining sentences before closing
    this.flushBuffer();
    
    // Stop translation
    this.stopTranslation();
    
    this.socket = null;
    this.isConnected = false;
    this.incompleteSentence = "";
    this.completeSentenceBuffer = [];
    
    console.log("🔌 GeminiTranslationService: Service closed");
  }

  /**
   * Check if service is ready
   * @returns {boolean} Ready status
   */
  isReady() {
    return this.isConnected && this.socket && this.sessionId && this.targetLanguages.length > 0;
  }
}

export default GeminiTranslationService;
