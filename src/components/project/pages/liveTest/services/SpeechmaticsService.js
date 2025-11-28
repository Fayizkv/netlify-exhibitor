/**
 * SpeechmaticsService.js
 *
 * Service for handling Speechmatics realtime transcription
 * Uses @speechmatics/real-time-client and @speechmatics/auth
 * Docs: https://docs.speechmatics.com/speech-to-text/realtime/quickstart
 */

class SpeechmaticsService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.listeners = {
      onOpen: null,
      onTranscript: null,
      onError: null,
      onClose: null,
    };
  }

  /**
   * Initialize Speechmatics client and start recognition
   * @param {Object} config
   * @param {string} config.apiKey - Speechmatics API key
   * @param {string} config.language - Language code (e.g., 'en', 'es', 'cmn')
   * @param {string} [config.operatingPoint='enhanced'] - Operating point
   * @param {boolean} [config.enablePartials=true] - Emit partial transcripts
   * @param {number} [config.maxDelay=1.0] - Max delay to trade latency/accuracy
   * @param {string} [config.domain] - Optional domain (e.g., 'bilingual-en')
   */
  async initialize(config) {
    const {
      apiKey,
      language,
      operatingPoint = 'enhanced',
      enablePartials = true,
      maxDelay = 1.0,
      domain,
    } = config || {};

    if (!apiKey) {
      throw new Error('Speechmatics API key is required');
    }
    if (!language) {
      throw new Error('Speechmatics language code is required');
    }

    try {
      const { RealtimeClient } = await import('@speechmatics/real-time-client');
      const { createSpeechmaticsJWT } = await import('@speechmatics/auth');

      const jwt = await createSpeechmaticsJWT({
        type: 'rt',
        apiKey,
        ttl: 60,
      });

      const client = new RealtimeClient();
      this.client = client;

      // Wire up event listener for all messages
      client.addEventListener('receiveMessage', ({ data }) => {
        try {
          if (!data || !data.message) return;
          switch (data.message) {
            case 'AddPartialTranscript': {
              const text = this.extractTranscriptText(data);
              if (text && this.listeners.onTranscript) {
                this.listeners.onTranscript(text, false, data);
              }
              break;
            }
            case 'AddTranscript': {
              const text = this.extractTranscriptText(data);
              if (text && this.listeners.onTranscript) {
                this.listeners.onTranscript(text, true, data);
              }
              break;
            }
            case 'EndOfTranscript': {
              if (this.listeners.onClose) this.listeners.onClose();
              break;
            }
            case 'Error': {
              if (this.listeners.onError) this.listeners.onError(data?.reason || 'Unknown error');
              break;
            }
            default:
              break;
          }
        } catch (err) {
          if (this.listeners.onError) this.listeners.onError(err?.message || 'Speechmatics event error');
        }
      });

      // Start recognition session
      await client.start(jwt, {
        transcription_config: {
          language,
          operating_point: operatingPoint,
          enable_partials: !!enablePartials,
          max_delay: maxDelay,
          ...(domain ? { domain } : {}),
          transcript_filtering_config: {
            remove_disfluencies: true,
          },
        },
      });

      this.isConnected = true;
      if (this.listeners.onOpen) this.listeners.onOpen();
      return client;
    } catch (error) {
      console.error('Error initializing Speechmatics:', error);
      throw new Error(`Failed to initialize Speechmatics: ${error.message}`);
    }
  }

  /**
   * Extract transcript text from Speechmatics message
   * @param {Object} data - Message payload
   * @returns {string|null} transcript text
   */
  extractTranscriptText(data) {
    // Prefer metadata.transcript when available
    if (data?.metadata?.transcript) {
      return data.metadata.transcript;
    }
    // Fallback: build from results
    if (Array.isArray(data?.results)) {
      const parts = [];
      for (const result of data.results) {
        const token = result?.alternatives?.[0]?.content || '';
        parts.push(token);
      }
      const text = parts.join(' ').trim();
      return text || null;
    }
    return null;
  }

  /**
   * Send audio chunk from MediaRecorder to Speechmatics
   * @param {Blob|ArrayBuffer|Uint8Array} audioChunk
   */
  async sendAudioData(audioChunk) {
    if (!this.client || !this.isConnected) {
      return;
    }
    try {
      let payload;
      if (audioChunk instanceof Blob) {
        const buf = await audioChunk.arrayBuffer();
        payload = new Uint8Array(buf);
      } else if (audioChunk instanceof ArrayBuffer) {
        payload = new Uint8Array(audioChunk);
      } else if (audioChunk instanceof Uint8Array) {
        payload = audioChunk;
      } else {
        return;
      }
      this.client.sendAudio(payload);
    } catch (err) {
      if (this.listeners.onError) this.listeners.onError(err?.message || 'Failed to send audio');
    }
  }

  /**
   * Register event listeners
   */
  on(listeners) {
    this.listeners = { ...this.listeners, ...listeners };
  }

  /**
   * Stop recognition and close
   */
  close() {
    try {
      if (this.client) {
        this.client.stopRecognition({ noTimeout: true });
      }
    } catch (e) {
      // ignore
    } finally {
      this.client = null;
      this.isConnected = false;
      if (this.listeners.onClose) this.listeners.onClose();
    }
  }

  /**
   * Ready state approximation
   */
  getReadyState() {
    return this.isConnected ? 1 : 0;
  }

  /**
   * Is service connected
   */
  isServiceConnected() {
    return this.isConnected;
  }
}

export default SpeechmaticsService;


