# AudioTranscriber Implementation Guide

## Overview

The AudioTranscriber component has been completely rewritten to implement direct WebSocket connections to transcription servers, removing the dependency on backend sockets. The system now supports both Deepgram Nova-2 and Google Cloud Speech-to-Text services with automatic service selection based on language support.

## Key Features

### 🔧 Smart Service Selection

- **Deepgram Nova-2**: Used for Nova-supported languages (direct connection)
- **Google Cloud Speech**: Used for other languages (direct connection)
- Automatic selection based on language code mapping

### 🎯 Session Management

- Session ID from CustomSelect becomes the room ID when selected
- Fallback to event ID if no session is selected
- Dynamic room creation with unique identifiers

### 🌐 Environment Configuration

- `VITE_DEEPGRAM_URL`: Deepgram WebSocket server URL
- `VITE_GOOGLE_URL`: Google Cloud WebSocket server URL
- Environment-based service selection

### 🔄 Robust Error Handling

- Connection timeout handling
- Automatic reconnection logic
- Comprehensive error messages
- Graceful cleanup on component unmount

## Implementation Details

### Service Selection Logic

```javascript
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

const provider = isNovaSupported(targetLanguage) ? "deepgram" : "google";
```

### WebSocket URL Generation

```javascript
const getWebSocketUrl = (provider, roomId, language) => {
  const baseUrl = provider === "deepgram" ? import.meta.env.VITE_DEEPGRAM_URL : import.meta.env.VITE_GOOGLE_URL;

  if (!baseUrl) {
    throw new Error(`${provider === "deepgram" ? "VITE_DEEPGRAM_URL" : "VITE_GOOGLE_URL"} environment variable is not set`);
  }

  const url = new URL(baseUrl);
  url.searchParams.set("roomId", roomId);
  url.searchParams.set("language", language);
  url.searchParams.set("provider", provider);

  return url.toString();
};
```

### Audio Configuration

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 16000,
    channelCount: 1,
    autoGainControl: true,
  },
});

const mediaRecorder = new MediaRecorder(stream, {
  mimeType: "audio/webm;codecs=opus",
});
```

## Setup Requirements

### 1. Environment Variables

Add these to your `.env` file:

```env
# Deepgram WebSocket Server URL
VITE_DEEPGRAM_URL=wss://your-deepgram-server.com

# Google Cloud WebSocket Server URL
VITE_GOOGLE_URL=wss://your-google-server.com
```

### 2. Transcription Servers

You need to run the transcription servers from the `test_transcription` folder:

#### Deepgram Server

```bash
cd test_transcription/deepgram-socket
npm install
npm start
```

#### Google Cloud Server

```bash
cd test_transcription/gc-transcription-socket
npm install
npm start
```

### 3. Server Configuration

#### Deepgram Server Requirements

- `DEEPGRAM_API_KEY` environment variable
- Nova-3 model support
- WebSocket server on port 3000 (default)

#### Google Cloud Server Requirements

- Google Cloud Speech-to-Text API credentials
- Service account JSON or environment credentials
- WebSocket server on port 3001 (default)

## Usage Flow

### 1. Component Initialization

```jsx
<AudioTranscriptor translationLanguages={translationLanguage} roomId={eventId} />
```

### 2. Language Processing

- Translation languages are mapped to proper language codes
- Service selection is determined automatically
- UI shows which service will be used for each language

### 3. Session Selection

- User selects a session from the dropdown
- Session ID becomes the room ID for transcription
- Room information is displayed in the UI

### 4. Recording Process

1. User clicks "Start Recording"
2. Microphone access is requested
3. WebSocket connection is established to appropriate server
4. Audio streaming begins (250ms intervals)
5. Real-time transcription results are displayed

### 5. Results Display

- **Interim Results**: Gray text showing live transcription
- **Final Results**: Saved transcripts with timestamps and metadata
- **Service Indicators**: Shows which service processed each transcript

## Error Handling

### Connection Errors

- Timeout handling (10 seconds)
- Automatic reconnection attempts
- Clear error messages to users

### Audio Errors

- Microphone permission handling
- Audio format fallbacks
- Stream cleanup on errors

### WebSocket Errors

- Connection state monitoring
- Graceful disconnection handling
- Resource cleanup

## Data Flow

```
User Action → Language Selection → Service Detection → WebSocket Connection → Audio Streaming → Transcription Results
     ↓              ↓                    ↓                    ↓                    ↓                    ↓
Session Select → Room ID Set → Provider URL → Connection Open → MediaRecorder Start → Results Display
```

## API Integration

### Session API

```javascript
// Fetch sessions for the event
selectApi={`sessions/select?event=${roomId}`}
```

### Transcription Results Format

```javascript
{
  text: "Transcribed text",
  isFinal: true,
  timestamp: new Date(),
  service: "deepgram" | "google",
  roomId: "session_id_or_room_id",
  sessionId: "session_id_if_available",
  metadata: {
    provider: "deepgram" | "google",
    language: "en-US",
    confidence: 0.9
  }
}
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Error: "VITE_DEEPGRAM_URL environment variable is not set"
   - Solution: Add environment variables to .env file

2. **WebSocket Connection Failed**
   - Error: "Connection error to deepgram/google server"
   - Solution: Ensure transcription servers are running

3. **Microphone Access Denied**
   - Error: "Microphone access denied"
   - Solution: Allow microphone access in browser

4. **Audio Format Not Supported**
   - Fallback: Automatic fallback to WebM/Opus format
   - Solution: Check browser compatibility

### Debug Information

The component provides comprehensive debug logging:

- Service selection logic
- WebSocket connection details
- Audio configuration
- Transcription results

Check browser console for detailed information.

## Performance Considerations

### Audio Optimization

- 16kHz sample rate for optimal performance
- Mono channel for reduced bandwidth
- 250ms intervals for real-time feel

### Memory Management

- Automatic cleanup on component unmount
- Stream and WebSocket cleanup
- Reconnection timeout management

### Error Recovery

- Graceful degradation on errors
- Automatic resource cleanup
- User-friendly error messages

## Security Considerations

### WebSocket Security

- Use WSS (secure WebSocket) in production
- Validate server URLs
- Handle connection timeouts

### Audio Privacy

- Local audio processing only
- No audio data stored permanently
- Clear audio streams on stop

## Future Enhancements

1. **Multi-language Support**: Support for multiple simultaneous languages
2. **Translation Integration**: Real-time translation between languages
3. **Recording Export**: Save transcriptions to files
4. **Advanced Analytics**: Transcription accuracy metrics
5. **Custom Models**: Support for custom speech models

## Testing

### Manual Testing Checklist

- [ ] Environment variables configured
- [ ] Transcription servers running
- [ ] Microphone permissions granted
- [ ] Language selection working
- [ ] Session selection working
- [ ] Recording start/stop functionality
- [ ] Error handling working
- [ ] Cleanup on component unmount

### Automated Testing

- Unit tests for service selection logic
- Integration tests for WebSocket connections
- E2E tests for complete transcription flow

This implementation provides a robust, scalable solution for real-time audio transcription with automatic service selection and comprehensive error handling.
