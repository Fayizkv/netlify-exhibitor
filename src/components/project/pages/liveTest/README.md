# Live Transcription - Architecture Documentation

This document explains the refactored architecture of the live transcription system, making it easier to maintain and extend with new transcription providers like Speechmatics.

## 📁 Project Structure

```
liveTest/
├── index.jsx                        # Main component - UI and orchestration
├── SpeakingComponent.jsx           # UI component for displaying transcriptions
├── README.md                       # This file
├── services/                        # External service integrations
│   ├── DeepgramService.js          # Deepgram transcription service
│   └── TranslationService.js       # Translation socket management
├── hooks/                          # React hooks for component logic
│   ├── useTranscriptionService.js  # Main transcription hook
│   └── useSoundCheckService.js     # Sound check hook
└── utils/                          # Utility functions
    └── languageUtils.js            # Language mapping and utilities
```

## 🔧 Architecture Overview

### 1. Services Layer
Independent service classes that handle external integrations:

#### **DeepgramService.js**
- Pure Deepgram WebSocket integration
- No React dependencies
- Can be easily replaced with other providers

```javascript
const deepgramService = new DeepgramService();

// Initialize with configuration
await deepgramService.initialize({
  apiKey: "your-api-key",
  model: "nova-3",
  language: "en-US",
  interimResults: true,
  punctuate: true,
  smartFormat: true,
});

// Register event listeners
deepgramService.on({
  onOpen: () => console.log("Connected"),
  onTranscript: (transcript, isFinal, data) => {
    // Handle transcript
  },
  onError: (errorMsg) => console.error(errorMsg),
  onClose: () => console.log("Closed"),
});

// Send audio data
deepgramService.sendAudioData(audioBlob);

// Close connection
deepgramService.close();
```

#### **TranslationService.js**
- Manages translation socket communication
- Handles sentence buffering for better translation quality
- Validates target languages
- Flushes incomplete sentences when stopping

```javascript
const translationService = new TranslationService();

// Initialize with socket connection
translationService.initialize(
  socket,           // Socket.IO instance
  roomId,          // Room ID for translation
  sourceLanguage,  // Source language code
  targetLanguages  // Array of target language codes
);

// Send transcription for translation
const sent = translationService.sendForTranslation(text, isFinal);

// Flush remaining incomplete sentences
translationService.flushIncompleteSentence();

// Close service
translationService.close();
```

### 2. Hooks Layer
React hooks that orchestrate services and manage component state:

#### **useTranscriptionService.js**
Main hook for live transcription:
- Uses DeepgramService for transcription
- Uses TranslationService for translation
- Manages MediaRecorder for audio capture
- Handles recording save functionality
- Coordinates between transcription and translation servers

```javascript
const {
  isRecording,
  connectionStatus,
  transcriptionResults,
  interimText,
  error,
  startTranscription,
  stopTranscription,
  clearTranscription,
  serviceProvider,
  isNovaSupported,
  currentRoomId,
} = useTranscriptionService(
  targetLanguage,
  roomId,
  sessionId,
  socket,
  setSocketConnected,
  onRecordingComplete,
  translationEnabled,
  translationSocket,
  translationSocketConnected,
  novaModel,
  targetLanguages
);
```

#### **useSoundCheckService.js**
Simplified hook for audio testing:
- Uses DeepgramService without server communication
- Helps users test microphone and audio quality
- Displays transcription results in real-time

```javascript
const {
  isRecording,
  connectionStatus,
  transcriptionResults,
  interimText,
  error,
  startSoundCheck,
  stopSoundCheck,
  clearSoundCheck,
} = useSoundCheckService(
  targetLanguage,
  novaModel
);
```

### 3. Utils Layer
Utility functions and constants:

#### **languageUtils.js**
- Language code mappings
- Nova model support detection
- Language name/code conversion
- Supported languages list

```javascript
import {
  SUPPORTED_LANGUAGES,
  convertLanguageNameToCode,
  convertLanguageCodeToName,
  isNovaSupported,
  getNovaModelForLanguage,
  mapLanguageToCode,
  getAvailableLanguages,
} from "./utils/languageUtils";

// Check if language is supported
const supported = isNovaSupported("en-US"); // true

// Get appropriate Nova model
const model = getNovaModelForLanguage("en-US"); // "nova-3"

// Convert language name to code
const code = convertLanguageNameToCode("English (US)"); // "en-US"

// Get all available languages
const languages = getAvailableLanguages();
```

## 🚀 Adding a New Transcription Service (e.g., Speechmatics)

### Step 1: Create Service Class

Create `services/SpeechmaticsService.js`:

```javascript
/**
 * SpeechmaticsService.js
 * 
 * Service for handling Speechmatics live transcription
 */

class SpeechmaticsService {
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
   * Initialize Speechmatics connection
   */
  async initialize(config) {
    const {
      apiKey,
      language = "en",
      interimResults = true,
    } = config;

    // Initialize Speechmatics WebSocket connection
    // Implementation details here
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Setup Speechmatics-specific event listeners
  }

  /**
   * Send audio data
   */
  sendAudioData(audioData) {
    if (this.connection && this.isConnected) {
      // Send audio to Speechmatics
    }
  }

  /**
   * Register event listeners
   */
  on(listeners) {
    this.listeners = { ...this.listeners, ...listeners };
  }

  /**
   * Close connection
   */
  close() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if service is connected
   */
  isServiceConnected() {
    return this.isConnected;
  }

  /**
   * Get connection ready state
   */
  getReadyState() {
    return this.connection ? this.connection.readyState : 0;
  }
}

export default SpeechmaticsService;
```

### Step 2: Update useTranscriptionService Hook

Modify `hooks/useTranscriptionService.js` to support multiple providers:

```javascript
import DeepgramService from "../services/DeepgramService";
import SpeechmaticsService from "../services/SpeechmaticsService";
import TranslationService from "../services/TranslationService";

function useTranscriptionService(
  targetLanguage = "en-US",
  // ... other parameters
  transcriptionProvider = "deepgram" // Add provider parameter
) {
  // State management
  const [serviceProvider, setServiceProvider] = useState(null);
  const transcriptionServiceRef = useRef(null);

  const startTranscription = useCallback(async () => {
    // Select service based on provider
    let transcriptionService;
    
    if (transcriptionProvider === "speechmatics") {
      transcriptionService = new SpeechmaticsService();
      
      // Initialize with Speechmatics-specific config
      await transcriptionService.initialize({
        apiKey: import.meta.env.VITE_SPEECHMATICS_API_KEY,
        language: targetLanguage,
        interimResults: true,
      });
    } else {
      transcriptionService = new DeepgramService();
      
      // Initialize with Deepgram-specific config
      await transcriptionService.initialize({
        apiKey: import.meta.env.VITE_DEEPGRAM_API_KEY,
        model: novaModel,
        language: targetLanguage,
        interimResults: true,
        punctuate: true,
        smartFormat: true,
      });
    }

    transcriptionServiceRef.current = transcriptionService;
    setServiceProvider(transcriptionProvider);

    // Setup event listeners (same interface for both services)
    transcriptionService.on({
      onOpen: () => {
        // Handle connection open
      },
      onTranscript: (transcript, isFinal, data) => {
        addTranscriptionResult(transcript, isFinal);
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

    // Rest of the transcription logic remains the same
    // ...
  }, [targetLanguage, novaModel, transcriptionProvider]);

  // ... rest of the hook
}
```

### Step 3: Update Main Component

Modify `index.jsx` to support provider selection:

```javascript
const LiveTest = (props) => {
  // State for provider selection
  const [transcriptionProvider, setTranscriptionProvider] = useState("deepgram");

  // Use transcription service with provider
  const {
    isRecording,
    connectionStatus,
    // ... other returns
  } = useTranscriptionService(
    selectedLanguage?.code || "en-US",
    eventId,
    selectedSessionId,
    socket,
    setSocketConnected,
    handleRecordingComplete,
    translationEnabled,
    translationSocket,
    translationSocketConnected,
    getNovaModelForLanguage(selectedLanguage?.code || "en-US"),
    targetLanguagesForTranslation,
    transcriptionProvider // Pass provider
  );

  // Add UI for provider selection
  return (
    <div>
      {/* Provider selection */}
      <select 
        value={transcriptionProvider}
        onChange={(e) => setTranscriptionProvider(e.target.value)}
        disabled={isRecording}
      >
        <option value="deepgram">Deepgram (Nova)</option>
        <option value="speechmatics">Speechmatics</option>
      </select>

      {/* Rest of the UI */}
    </div>
  );
};
```

## 🔄 Data Flow

```
User Audio Input
      ↓
MediaRecorder (Browser API)
      ↓
[Service Layer - DeepgramService/SpeechmaticsService]
      ↓
useTranscriptionService Hook
      ├──→ Socket 1: Transcription Server (stores transcriptions)
      └──→ TranslationService
                ↓
           Socket 2: Translation Server (translates transcriptions)
```

## 🎯 Key Benefits of This Architecture

1. **Modularity**: Each service is independent and can be tested separately
2. **Reusability**: Services can be used in different contexts
3. **Maintainability**: Clear separation of concerns
4. **Extensibility**: Easy to add new transcription providers
5. **Testability**: Services can be mocked for unit testing
6. **No Code Duplication**: Shared utilities are centralized

## 📝 Best Practices

1. **Service Classes**:
   - Keep them provider-specific
   - No React dependencies
   - Consistent interface across providers
   - Handle all provider-specific logic internally

2. **Hooks**:
   - Orchestrate multiple services
   - Manage React state
   - Handle side effects
   - Provide clean API to components

3. **Main Component**:
   - Focus on UI and user interactions
   - Delegate logic to hooks
   - Keep it simple and readable

## 🧪 Testing

Each layer can be tested independently:

```javascript
// Test DeepgramService
describe('DeepgramService', () => {
  it('should initialize with config', async () => {
    const service = new DeepgramService();
    await service.initialize({
      apiKey: 'test-key',
      model: 'nova-3',
      language: 'en-US',
    });
    expect(service.isServiceConnected()).toBe(false); // Not connected until WebSocket opens
  });
});

// Test useTranscriptionService hook
describe('useTranscriptionService', () => {
  it('should start transcription', async () => {
    const { result } = renderHook(() => useTranscriptionService('en-US'));
    await act(async () => {
      await result.current.startTranscription();
    });
    expect(result.current.isRecording).toBe(true);
  });
});
```

## 📚 Additional Resources

- [Deepgram API Documentation](https://developers.deepgram.com/)
- [Speechmatics API Documentation](https://www.speechmatics.com/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

## 🤝 Contributing

When adding new features:

1. Keep services independent and provider-agnostic where possible
2. Update this README with new patterns
3. Add tests for new functionality
4. Follow the existing code style
5. Document complex logic with comments

## 📞 Support

For questions or issues, please contact the development team.
