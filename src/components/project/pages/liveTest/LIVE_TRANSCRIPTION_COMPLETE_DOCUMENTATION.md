# Live Transcription System - Complete Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Sender Implementation (LiveTest)](#sender-implementation-livetest)
4. [Receiver Implementation (SessionLive)](#receiver-implementation-sessionlive)
5. [Socket Communication Protocol](#socket-communication-protocol)
6. [Implementation Guide](#implementation-guide)
7. [Complete Code Examples](#complete-code-examples)
8. [Best Practices](#best-practices)

---

## 🎯 System Overview

This is a **real-time audio transcription and translation system** that:

1. **Captures** audio from user's microphone
2. **Transcribes** audio to text using Deepgram Nova or Speechmatics
3. **Broadcasts** transcriptions to unlimited viewers via Socket.IO
4. **Translates** transcriptions to multiple languages using Gemini AI
5. **Displays** live transcriptions and translations in real-time

### Key Components

- **Sender (LiveTest)**: Captures audio, transcribes, and sends to sockets
- **Receiver (SessionLive)**: Receives and displays transcriptions/translations
- **Transcription Socket**: Broadcasts transcriptions to all viewers
- **Translation Socket**: Broadcasts translations to subscribed viewers
- **Transcription Services**: Deepgram Nova + Speechmatics
- **Translation Service**: Gemini AI

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SENDER (LiveTest)                          │
│                                                                    │
│  ┌──────────────┐                                                 │
│  │   User Audio │                                                 │
│  │   Microphone  │                                                 │
│  └──────┬───────┘                                                 │
│         │                                                          │
│         ▼                                                          │
│  ┌─────────────────────────┐                                      │
│  │  MediaRecorder (100ms)  │                                      │
│  │  • Captures audio       │                                      │
│  │  • Stores for download  │                                      │
│  └──────┬──────────────────┘                                      │
│         │                                                          │
│         ├──────────────┬───────────────┐                          │
│         │              │               │                          │
│         ▼              ▼               ▼                          │
│  ┌─────────┐   ┌──────────────┐  ┌────────────┐                 │
│  │Deepgram │   │Speechmatics  │  │ Recording  │                 │
│  │  Nova   │   │  Enhanced    │  │   Buffer   │                 │
│  └────┬────┘   └──────┬───────┘  └────────────┘                 │
│       │                │                                          │
│       └────────┬───────┘                                          │
│                ▼                                                   │
│         Transcribed Text                                          │
│                │                                                   │
│       ┌────────┴────────┐                                         │
│       │                 │                                         │
│       ▼                 ▼                                         │
│  ┌──────────────┐  ┌─────────────────────┐                      │
│  │ SOCKET 1:    │  │ SOCKET 2:           │                      │
│  │ Transcription│  │ Translation         │                      │
│  │ Broadcast    │  │ Gemini Service      │                      │
│  └──────┬───────┘  └──────────┬──────────┘                      │)×
│         │                     │                                   │
└─────────┼─────────────────────┼───────────────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────┬───────────────────────────────────┐
│    Socket.IO Broadcast      │   Gemini Translation Server      │
│    • All viewers get        │   • Translates to multiple langs │
│      transcriptions         │   • Broadcasts translations       │
│    • Stores in DB           │   • Context-aware                │
│    • Real-time updates      │   • Sentence buffering (2 at once)│
└─────────────────────────────┴───────────────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RECEIVER (SessionLive)                       │
│                                                                  │
│  ┌──────────────────────┐    ┌──────────────────────┐         │
│  │  Transcription       │    │  Translation         │         │
│  │  Display             │    │  Display             │         │
│  │  • Real-time text    │    │  • Multi-language    │         │
│  │  • Auto-scroll       │    │  • Audio playback    │         │
│  │  • Gradient colors   │    │  • Language selector │         │
│  └──────────────────────┘    └──────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Sender Implementation (LiveTest)

### Component Structure

```
liveTest/
├── index.jsx                    # Main component (orchestrator)
├── hooks/
│   └── useTranscriptionService.js   # Transcription logic
└── services/
    ├── DeepgramService.js            # Deepgram provider
    ├── SpeechmaticsService.js        # Speechmatics provider
    └── GeminiTranslationService.js   # Translation logic
```

### 1. Main Component (`index.jsx`)

**Responsibilities:**
- Manage socket connections (2 sockets)
- Handle user interactions
- Initialize transcription hook
- Display UI/controls

```javascript
const LiveTest = () => {
  // State for socket management
  const [socket, setSocket] = useState(null);                    // Transcription socket
  const [geminiTranslationSocket, setGeminiTranslationSocket] = useState(null); // Translation socket
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [translationEnabled, machine learningTranslationEnabled] = useState(true);
  
  // 1. Initialize Transcription Socket
  useEffect(() => {
    const baseurl = import.meta.env.VITE_LIVE_TRANSCRIPTION_SERVER_URL;
    const newSocket = io(baseurl);
    setSocket(newSocket);
    
    newSocket.on("connect", () => {
      newSocket.emit("join-room", selectedSessionId); // Join session room
    });
  }, []);
  
  // 2. Initialize Translation Socket
  useEffect(() => {
    if (!translationEnabled) return;
    
    const geminiUrl = import.meta.env.VITE_GEMINI_TRANSLATION_SERVER_URL;
    const newGeminiSocket = io(geminiUrl);
    setGeminiTranslationSocket(newGeminiSocket);
  }, [translationEnabled]);
  
  // 3. Use transcription hook
  const {
    isRecording,
    startTranscription,
    stopTranscription,
    // ... other state
  } = useTranscriptionService(
    selectedLanguage?.code,
    eventId,
    selectedSessionId,
    socket,
    setSocketConnected,
    onRecordingComplete,
    translationEnabled,
    geminiTranslationSocket,
    geminiTranslationSocketConnected,
    geminiTargetLanguages,
    sessionContext
  );
  
  return (/* UI */);
};
```

### 2. Transcription Hook (`useTranscriptionService.js`)

**Key Flow:**

```javascript
const useTranscriptionService = (
  targetLanguage,           // Language code (e.g., 'en-US')
  eventId,
  sessionId,
  socket,                   // Transcription socket
  setSocketConnected,
  onRecordingComplete,
  translationEnabled,
  geminiTranslationSocket,  // Translation socket
  geminiTranslationSocketConnected,
  geminiTargetLanguages,    // First 4 target languages
  sessionContext
) => {
  
  // 1. Initialize transcription service based on language
  const startTranscription = async () => {
    // Get user microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create MediaRecorder (captures audio for download)
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start(100); // 100ms chunks
    
    // Select provider based on language
    const provider = getProviderForLanguage(targetLanguage); // 'nova' or 'speechmatics'
    
    if (provider === 'nova') {
      // Initialize Deepgram
      const deepgramService = new DeepgramService();
      deepgramService.on({
        onTranscript: (text, isFinal) => {
          addTranscriptionResult(text, isFinal);
        }
      });
      
      await deepgramService.initialize({
        apiKey: DEEPGRAM_API_KEY,
        model: 'nova-3',
        language: targetLanguage,
        interimResults: true
      });
    }
    
    // Stream audio to provider
    mediaRecorder.ondataavailable = (event) => {
      if (provider === 'nova') {
        deepgramService.sendAudioData(event.data);
      }
    };
  };
  
  // 2. Add transcription result (broadcast to sockets)
  const addTranscriptionResult = async (text, isFinal) => {
    // Send to Transcription Socket (Socket 1)
    if (socket && socket.connected) {
      socket.emit("transcription", {
        roomId: sessionId,
        text: text,
        timestamp: new Date(),
        isFinal: isFinal
      });
    }
    
    // Send to Translation Socket (Socket 2) - only final results
    if (isFinal && translationEnabled && geminiTranslationService) {
      geminiTranslationService.sendForTranslation(text, isFinal);
    }
  };
  
  return { startTranscription, stopTranscription, /* state */ };
};
```

### 3. Translation Service (`GeminiTranslationService.js`)

**Sentence Buffering Strategy:**

```javascript
class GeminiTranslationService {
  constructor() {
    this.incompleteSentence = "";           // Currently building sentence
    this.completeSentenceBuffer = [];       // Completed sentences
  }
  
  // Process text and separate complete/incomplete sentences
  processSentences(text) {
    const combinedText = this.incompleteSentence + text;
    
    // Regex for multiple scripts (Latin, Devanagari, Arabic, etc.)
    const sentenceEndRegex = /(?:[.!?…]|[\u0964今天我\u06D4\u061F])+(?:["''")\]]*\s+|$)/g;
    
    // Split into complete and incomplete sentences
    // ...
    
    return { completeSentences, incompleteSentence };
  }
  
  // Send 2 complete sentences at a time
  sendForTranslation(text, isFinal) {
    const { completeSentences } = this.processSentences(text);
    
    // Add to buffer
    this.completeSentenceBuffer.push(...completeSentences);
    
    // Send 2 sentences at a time
    while (this.completeSentenceBuffer.length >= 2) {
      const twoSentences = this.completeSentenceBuffer.splice(0, 2);
      const textToSend = twoSentences.join(" ");
      
      // Send to Gemini server
      this.socket.emit("start-translation", {
        text: textToSend,
        sessionId: this.sessionId,
        targetLanguages: ['hindi', 'malayalam', 'tamil', 'telugu'],
        sessionContext: { sessionTitle, eventTitle, etc. }
      });
    }
  }
}
```

---

## 📥 Receiver Implementation (SessionLive)

### Component Structure

```
SessionLive.js
├── Socket Connections
│   ├── Transcription Socket (receives transcriptions)
│   └── Translation Socket (receives translations + audio)
├── State Management
│   ├── liveTranscriptions[]
│   ├── translations[]
│   └── audioUrls{}
├── UI Components
│   ├── TranscriptLine (displays text with gradients)
│   ├── TranslationLine (displays translations)
│   └── Language cursors (language selector)
└── Audio Playback
    ├── Audio queue per language
    └── Autoplay management
```

### Key Implementation

```javascript
const SessionLive = ({ sessionId, liveType, eventId }) => {
  // 1. Connect to Transcription Socket
  useEffect(() => {
    const socketUrl = import.meta.env.NEXT_PUBLIC_TRANSCRIPTION_SERVER_URL;
    const newSocket = io(socketUrl);
    
    newSocket.on("connect", () => {
      newSocket.emit("join-room", sessionId); // Join session room
    });
    
    // Receive transcriptions
    newSocket.on("new-transcription", (transcription) => {
      setLiveTranscriptions(prev => [...prev, {
        ...transcription,
        timestamp: new Date(transcription.timestamp)
      }]);
    });
    
    // Receive interim (partial) transcriptions
    newSocket.on("interim-transcription", (transcription) => {
      setInterimText(transcription.text);
    });
    
    // Receive history when joining
    newSocket.on("room-history", (history) => {
      setLiveTranscriptions(history.map(t => ({
        ...t,
        timestamp: new Date(t.timestamp)
      })));
    });
  }, [sessionId]);
  
  // 2. Connect to Translation Socket
  useEffect(() => {
    if (!showTranslations) return;
    
    const geminiUrl = import.meta.env.NEXT_PUBLIC_GEMINI_TRANSLATION_SERVER_URL;
    const newTranslationSocket = io(geminiUrl);
    
    // Subscribe to language
    newTranslationSocket.on("connect", () =>已经有: {
      newTranslationSocket.emit("subscribe-language", {
        sessionId,
        language: selectedLang.code,
        clientType: 'listener'
      });
    });
    
    // Receive translation updates
    newTranslationSocket.on("translation-update", (data) => {
      const { content, language, timestamp, type, playableAudio } = data;
      
      if (type === 'text') {
        // Update translation text (streaming)
        setTranslations(prev => /* update or add translation */);
      }
      
      if (type === 'audio' && playableAudio) {
        // Handle progressive audio chunks
        const wavData = new Uint8Array(playableAudio);
        const blob = new Blob([wavData], { type: 'audio/wav' });
        
        // Add to audio queue and play immediately
        audioQueueRef.current[language].push(blob);
        tryStartPlayback(language);
      }
      
      if (type === 'turn-complete') {
        // Mark streaming text as final
        // Assemble final audio if needed
      }
    });
    
    // Receive translation history when subscribing
    newTranslationSocket.on("translation-history", (payload) => {
      const { language, texts, audioTurns } = payload;
      
      // Load past translations
      setTranslations(prev => [...prev, ...texts.map(t => ({
        targetLanguage: language,
        translatedText: t.text,
        timestamp: new Date(t.timestamp)
      }))]);
      
      // Pre-load audio from history
      audioTurns.forEach(turn => {
        const wavData = new Uint8Array(turn.wav);
        const blob = new Blob([wavData], { type: 'audio/wav' });
        audioQueueRef.current[language].push(blob);
      });
      
      // Start playback if auto-play is enabled
      if (autoplayRef.current) {
        tryStartPlayback(language);
      }
    });
  }, [sessionId, showTranslations, selectedLang]);
  
  // 3. Audio Playback Logic
  const audioQueueRef = useRef({});      // Queue per language
  const isPlayingRef = useRef({});       // Playback state per language
  const autoplayRef = useRef(true);      // Autoplay toggle
  
  const tryStartPlayback = (language) => {
    if (!autoplayRef.current) return;
    if (!audioQueueRef.current[language] || audioQueueRef.current[language].length === 0) return;
    if (isPlayingRef.current[language]) return;
    
    const blob = audioQueueRef.current[language].shift();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    isPlayingRef.current[language] = true;
    
    audio.onended = () => {
      isPlayingRef.current[language] = false;
      URL.revokeObjectURL(url);
      
      // Play next chunk immediately (near-gapless)
      if (audioQueueRef.current[language].length > 0) {
        setTimeout(() => tryStartPlayback(language), 10); // 10ms delay
      }
    };
    
    audio.play();
  };
  
  return (
    <div>
      {/* Display transcriptions */}
      {lines.map(line => (
        <TranscriptLine 
          text={line} 
          isCurrent={true}
          previousText={/* previous text for gradient */}
          currentText={/* current text for gradient */}
        />
      ))}
      
      {/* Display translations with audio control */}
      {filteredTranslations.map(translation => (
        <TranslationLine translation={translation} />
      ))}
      
      {/* Language selector */}
      <button onClick={toggleDropdown}>
        {selectedLang.name}
      </button>
      
      {/* Audio toggle */}
      <button onClick={() => setAudioEnabled(!audioEnabled)}>
        {audioEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  );
};
```

---

## 🔌 Socket Communication Protocol

### Socket 1: Transcription Broadcast

**Sender → Server:**
```javascript
socket.emit("join-room", sessionId);
```

**Sender → Server                       (Transcribe):**
```javascript
socket.emit("transcription", {
  roomId: sessionId,
  text: "Welcome to the event",
  timestamp: new Date(),
  isFinal: true
});
```

**Server → All Receivers:**
```javascript
io.to(sessionId).emit("new-transcription", {
  text: "Welcome to the event",
  timestamp: "2025-01-15T10:30:00Z",
  roomId: sessionId
});
```

### Socket 2: Translation Service

**Receiver → Server (Subscribe):**
```javascript
translationSocket.emit("subscribe-language", {
  sessionId: "session-123",
  language: "hindi",
  clientType: 'listener'
});
```

**Sender → Server (Translation Request):**
```javascript
translationSocket.emit("start-translation", {
  text: "Welcome to the event. Please take your seats.",
  sessionId: "session-123",
  targetLanguages: ['hindi', 'malayalam', 'tamil', 'telugu'],
  sessionContext: {
    sessionTitle: "Keynote",
    eventTitle: "Tech Summit"
  }
});
```

**Server → Receivers (Translation Updates):**
```javascript
// Text update (streaming)
io.to(sessionId).emit("translation-update", {
  type: 'text',
  content: "आयोजन में आपका स्वागत है",
  language: 'hindi',
  timestamp: "2025-01-15T10:30:01Z"
});

// Audio chunk (progressive)
io.to(sessionId).emit("translation-update", {
  type: 'audio',
  content: <base64 audio data>,
  language: 'hindi',
  playableAudio: <WAV bytes>,
  isProgressiveChunk: true,
  sampleRate: 24000,
  channels: 1
});

// Turn complete
io.to(sessionId).emit("translation-update", {
  type: 'turn-complete',
  language: 'hindi',
  sampleRate: 24000,
  channels: 1,
  generationComplete: true
});
```

**Server → Receiver (History):**
```javascript
io.to从不希望socketId).emit("translation-history", {
  language: 'hindi',
  texts: [
    { text: "Translation 1", timestamp: "..." },
    { text: "Translation 2", timestamp: "..." }
  ],
  audioTurns: [
    { wav: <Uint8Array> },
    { wav: <Uint8Array> }
  ]
});
```

---

## 📝 Implementation Guide

### Step 1: Sender Setup

```javascript
// 1. Install dependencies
npm install socket.io-client @deepgram/sdk

// 2. Create transcription hook
// See: hooks/useTranscriptionService.js

// 3. Create service providers
// See: services/DeepgramService.js
// See: services/SpeechmaticsService.js

// 4. Create translation service
// See: services/GeminiTranslationService.js

// 5. Initialize sockets in main component
const socket = io(TRANSCRIPTION_SERVER_URL);
const translationSocket = io(GEMINI_TRANSLATION_SERVER_URL);

// 6. Use hook
const { startTranscription, stopTranscription } = useTranscriptionService(
  language, socket, translationSocket, /* ... */
);
```

### Step 2: Receiver Setup

```javascript
// 1. Install dependencies
npm install socket.io-client

// 2. Connect to sockets
const transcriptionSocket = io(TRANSCRIPTION_SERVER_URL);
transcriptionSocket.emit("join-room", sessionId);

const translationSocket = io(GEMINI_TRANSLATION_SERVER_URL);
translationSocket.emit("subscribe-language", { sessionId, language });

// 3. Listen for updates
transcriptionSocket.on("new-transcription", (data) => {
  // Display transcription
});

translationSocket.on("translation-update", (data) => {
  // Display translation + play audio
});

// 4. Handle audio playback
const audioQueue = [];
const playAudio = (blob) => {
  const audio = new Audio(URL.createObjectURL(blob));
  audio.play();
  audio.onended = () => playNext();
};
```

### Step 3: Server Setup

```javascript
// Transcription Broadcast Server
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('transcription', (data) => {
    // Store in database
    // Broadcast to all in room
    io.to(data.roomId).emit('new-transcription', data);
  });
});

// Translation Server (separate service)
io.on('connection', (socket) => {
  socket.on('subscribe-language', ({ sessionId, language }) => {
    socket.join(`${sessionId}-${language}`);
    // Send history to user
    sendHistory(socket, sessionId, language);
  });
  
  socket.on('start-translation', async (data) => {
    const translations = await translateWithGemini(data);
    
    // Send translations to room
    data.targetLanguages.forEach(lang => {
      io.to(`${data.sessionId}-${lang}`).emit('translation-update', {
        type: 'text',
        content: translations[lang],
        language: lang
      });
      
      // Generate and send audio
      const audio = await generateAudio(translations[lang], lang);
      io.to(`${data.sessionId}-${lang}`).emit('translation-update', {
        type: 'audio',
        playableAudio: audio,
        language: lang
      });
    });
  });
});
```

---

## 💡 Complete Code Examples

See the attached files for complete implementations:

- **Sender**: `eventhex-saas-cms/src/components/project/pages/liveTest/`
- **Receiver**: `instarecap-next/components/instaRecapComponents/SessionLive.js`

---

## ✅ Best Practices

### Sender

1. **Audio Quality**: Use high-quality microphone, minimize background noise
2. **Language Selection**: Always verify language support before starting
3. **Error Handling**: Implement retry logic for connection failures
4. **Cleanup**: Always stop MediaRecorder and close sockets on unmount
5. **Buffer Management**: Flush translation buffers on stop/language change

### Receiver

1. **Reconnection**: Auto-reconnect on disconnect
2. **Memory Management**: Clean up blob URLs after audio playback
3. **Audio Queue**: Use queue system for gapless playback
4. **Language Switching**: Stop all audio before changing language
5. **Error Handling**: Gracefully handle missing translations

### Performance

1. **Debouncing**: Debounce rapid language switches
2. **Cleanup**: Clean up refs and event listeners
3. **Blob URLs**: Always revoke blob URLs to prevent memory leaks
4. **Audio Delay**: Use 10ms delay for near-gapless audio playback

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: EventHex Development Team







