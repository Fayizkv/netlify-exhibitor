# Live Audio Transcription - Simplified Implementation

## Overview

This implementation provides real-time audio transcription using two services:

1. **Deepgram Nova-3 (via backend socket)** - For supported languages (40+ languages)
2. **Backend Socket (Google Speech)** - For all other languages via Google Cloud Speech-to-Text

## Architecture

```
AudioTranscriber.jsx
└── useBackendSocket() - Backend WebSocket for all languages
    ├── endpoint: 'deepgram-speech' (for Nova-supported languages)
    └── endpoint: 'google-speech' (for other languages)
    └── googleTranscriptions/
        └── translationHandler.js - Google Translate integration
```

## Service Selection Logic

The system automatically selects the appropriate service based on language support:

- **Nova-3 Supported Languages**: Use backend WebSocket with Deepgram Nova-3
- **Other Languages**: Use backend WebSocket with Google Cloud Speech-to-Text

## Nova-3 Supported Languages

The following languages are supported by Deepgram Nova-3:

- Bulgarian, Catalan, Chinese (Cantonese & Mandarin), Czech, Danish
- Dutch, English (multiple variants), Estonian, Finnish, French
- German, Hindi, Hungarian, Indonesian, Italian, Japanese, Korean
- Latvian, Lithuanian, Malay, Modern Greek, Norwegian, Polish
- Portuguese, Romanian, Russian, Slovak, Spanish, Swedish
- Tamasheq, Tamil, Thai, Turkish, Ukrainian, Vietnamese

## Environment Variables Required

### For Deepgram Service (backend):

Set your Deepgram API key in the backend environment.

### For Translation Service (Optional):

```bash
VITE_GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
```

## Backend Requirements

The backend must have the following WebSocket endpoints:

- **WebSocket URL**: `/api/v1/deepgram-speech` (for Deepgram)
- **WebSocket URL**: `/api/v1/google-speech` (for Google Speech)
- **Message Format**: JSON with `type`, `languageCode`, and `audio` fields
- **Response Format**: JSON with `type`, `transcript`, and `isFinal` fields

## Features

- **Real-time transcription** with interim and final results
- **Automatic language detection** and translation
- **Service switching** based on language support
- **Error handling** and connection retry logic
- **Audio format fallback** for browser compatibility
- **Translation support** for unsupported languages
- **Room management and broadcasting** for all languages

## Usage

```jsx
import { AudioTranscriptor } from "./AudioTranscriber";

function App() {
  const translationLanguages = ["English", "Spanish", "French", "German"];

  return <AudioTranscriptor translationLanguages={translationLanguages} />;
}
```

## File Structure

```
recapLive/
├── AudioTranscriber.jsx          # Main component
├── index.jsx                     # Entry point
├── README.md                     # This file
└── googleTranscriptions/
    └── translationHandler.js     # Translation utilities
```

## Cleanup Summary

The following files were removed during cleanup:

- `googleTranscriptions/backendGoogleSpeech.js`
- `googleTranscriptions/languageMapping.js`
- `googleTranscriptions/audioProcessor.js`
- `googleTranscriptions/authHelper.js`
- `googleTranscriptions/index.js`
- `googleTranscriptions/realGoogleSpeech.js`
- `googleTranscriptions/simpleAuth.js`
- `googleTranscriptions/config.js`
- `ISSUES_AND_FIXES.md`
- `GOOGLE_TRANSCRIPTION_PLAN.md`

## Benefits of Simplified Implementation

1. **Reduced Complexity**: Single file for each service type
2. **Better Performance**: No unnecessary service checks
3. **Easier Maintenance**: Clear separation of concerns
4. **Production Ready**: Uses backend WebSocket for all languages
5. **Automatic Fallback**: Seamless switching between services
