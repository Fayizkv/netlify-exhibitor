/**
 * TranslationService.js
 * 
 * Service for handling translation socket communication and sentence buffering
 * Manages translation of transcriptions into multiple target languages
 */

class TranslationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.incompleteSentence = "";
    this.roomId = null;
    this.sourceLanguage = null;
    this.targetLanguages = [];
  }

  /**
   * Initialize translation service with socket connection
   * @param {Object} socket - Socket.IO instance
   * @param {string} roomId - Translation room ID
   * @param {string} sourceLanguage - Source language code
   * @param {Array<string>} targetLanguages - Array of target language codes
   */
  initialize(socket, roomId, sourceLanguage, targetLanguages = []) {
    console.log("TranslationService: Initializing", {
      socket: !!socket,
      roomId,
      sourceLanguage,
      targetLanguages,
    });

    this.socket = socket;
    this.roomId = roomId;
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
      console.log("TranslationService: Socket connected");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("TranslationService: Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("error", (error) => {
      console.error("TranslationService: Socket error:", error);
      this.isConnected = false;
    });
  }

  /**
   * Update configuration
   * @param {Object} config - Configuration to update
   * @param {string} config.roomId - Translation room ID
   * @param {string} config.sourceLanguage - Source language code
   * @param {Array<string>} config.targetLanguages - Array of target language codes
   */
  updateConfig(config) {
    if (config.roomId !== undefined) {
      this.roomId = config.roomId;
    }
    if (config.sourceLanguage !== undefined) {
      this.sourceLanguage = config.sourceLanguage;
    }
    if (config.targetLanguages !== undefined) {
      this.targetLanguages = config.targetLanguages;
    }

    console.log("TranslationService: Config updated", {
      roomId: this.roomId,
      sourceLanguage: this.sourceLanguage,
      targetLanguages: this.targetLanguages,
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

    // Regex to identify sentence endings
    const sentenceEndRegex = /[.!?]+(?:\s|$)/g;

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

    console.log("TranslationService: Sentence processing:", {
      inputText: text,
      combinedText,
      completeSentences,
      incompleteSentence,
      totalComplete: completeSentences.length,
    });

    return {
      completeSentences,
      incompleteSentence,
    };
  }

  /**
   * Send transcription for translation
   * @param {string} text - Text to translate
   * @param {boolean} isFinal - Whether this is a final transcription
   * @returns {boolean} Success status
   */
  sendForTranslation(text, isFinal = true) {
    if (!this.isConnected || !this.socket || !this.roomId) {
      console.warn("TranslationService: Cannot send translation - service not ready", {
        isConnected: this.isConnected,
        socket: !!this.socket,
        roomId: this.roomId,
      });
      return false;
    }

    // Only process final transcriptions
    if (!isFinal) {
      return false;
    }

    // Validate target languages
    const validatedLanguages = this.validateTargetLanguages();

    if (validatedLanguages.length === 0) {
      console.log("TranslationService: No valid target languages configured");
      return false;
    }

    // Process sentences to separate complete from incomplete
    const { completeSentences, incompleteSentence } = this.processSentences(text);

    // Send only complete sentences to translation server
    if (completeSentences.length > 0) {
      const completeText = completeSentences.join(" ").trim();

      console.log("TranslationService: Sending complete sentences:", {
        roomId: this.roomId,
        completeText,
        sentenceCount: completeSentences.length,
        sourceLanguage: this.sourceLanguage,
        targetLanguages: validatedLanguages,
      });

      this.socket.emit("transcription-for-translation", {
        roomId: this.roomId,
        text: completeText,
        timestamp: new Date(),
        sourceLanguage: this.sourceLanguage,
        targetLanguages: validatedLanguages,
      });

      return true;
    } else {
      console.log("TranslationService: No complete sentences to send - buffering incomplete text:", incompleteSentence);
      return false;
    }
  }

  /**
   * Flush any remaining incomplete sentences
   * Call this when stopping transcription to send remaining text
   * @returns {boolean} Success status
   */
  flushIncompleteSentence() {
    if (!this.incompleteSentence.trim()) {
      return false;
    }

    if (!this.isConnected || !this.socket || !this.roomId) {
      console.warn("TranslationService: Cannot flush - service not ready");
      return false;
    }

    const validatedLanguages = this.validateTargetLanguages();

    if (validatedLanguages.length === 0) {
      console.log("TranslationService: No valid target languages configured");
      return false;
    }

    console.log("TranslationService: Flushing incomplete sentence:", {
      roomId: this.roomId,
      text: this.incompleteSentence,
      sourceLanguage: this.sourceLanguage,
      targetLanguages: validatedLanguages,
    });

    this.socket.emit("transcription-for-translation", {
      roomId: this.roomId,
      text: this.incompleteSentence,
      timestamp: new Date(),
      sourceLanguage: this.sourceLanguage,
      targetLanguages: validatedLanguages,
    });

    // Clear the incomplete sentence after sending
    this.incompleteSentence = "";
    return true;
  }

  /**
   * Validate target languages format
   * @returns {Array<string>} Array of validated language codes
   */
  validateTargetLanguages() {
    if (!this.targetLanguages || this.targetLanguages.length === 0) {
      return [];
    }

    // Filter out source language and validate format
    const validatedLanguages = this.targetLanguages
      .filter((lang) => lang !== this.sourceLanguage?.split("-")[0])
      .filter((lang) => {
        // Check if it's a valid language code (2-3 characters, lowercase)
        const isValidCode = /^[a-z]{2,3}(-[A-Z]{2})?$/.test(lang);
        if (!isValidCode) {
          console.warn(`TranslationService: Invalid language code format: ${lang}`);
        }
        return isValidCode;
      });

    return validatedLanguages;
  }

  /**
   * Clear incomplete sentence buffer
   */
  clearBuffer() {
    this.incompleteSentence = "";
    console.log("TranslationService: Buffer cleared");
  }

  /**
   * Close translation service
   */
  close() {
    // Flush any remaining incomplete sentences before closing
    this.flushIncompleteSentence();
    
    this.socket = null;
    this.isConnected = false;
    this.incompleteSentence = "";
    
    console.log("TranslationService: Service closed");
  }

  /**
   * Check if service is ready
   * @returns {boolean} Ready status
   */
  isReady() {
    return this.isConnected && this.socket && this.roomId && this.targetLanguages.length > 0;
  }
}

export default TranslationService;

