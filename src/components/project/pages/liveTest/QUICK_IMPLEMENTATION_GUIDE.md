# Live Transcription - Quick Implementation Guide

## 🚀 Quick Start

This guide helps you implement the live transcription sender and receiver in your projects.

---

## 📤 SENDER Implementation

### 1. Dependencies

```bash
npm install socket.io-client @deepgram/sdk
```

### 2. Basic Component Structure

```javascript
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { DeepgramService } from './services/DeepgramService';
import { GeminiTranslationService } from './services/GeminiTranslationService';

const LiveTranscription = () => {
  const [socket, setSocket] = useState(null);
  const [translationSocket, setTranslationSocket] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const deepgramServiceRef = useRef(null);
  const translationServiceRef = useRef(null);
  
  // 1. Initialize sockets
  useEffect(() => {
    // Transcription socket
    const transcriptionSocket = io(TRANSCRIPTION_SERVER_URL);
    transcriptionSocket.on('connect', () => {
      transcriptionSocket.emit('join-room', sessionId);
    });
    setSocket(transcriptionSocket);
    
    // Translation socket
    const transSocket = io(GEMINI_TRANSLATION_SERVER_URL);
    setTranslationSocket(transSocket);
  }, []);
  
  // 2. Start transcription
  const startRecording = async () => {
    // Get microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start(100);
    mediaRecorderRef.current = mediaRecorder;
    
    // Initialize Deepgram
    const deepgram = new DeepgramService();
    deepgram.on({
      onTranscript: (text, isFinal) => {
        handleTranscript(text, isFinal);
      }
    });
    
    await deepgram.initialize({
      apiKey: DEEPGRAM_API_KEY,
      model: 'nova-3',
      language: 'en-US',
      interimResults: true
    });
    
    // Send audio to Deepgram
    mediaRecorder.ondataavailable = (event) => {
      deepgram.sendAudioData(event.data);
    };
    
    deepgramServiceRef.current = deepgram;
    setIsRecording(true);
  };
  
  // 3. Handle transcription results
  const handleTranscript = (text, isFinal) => {
    // Send to transcription socket (all viewers)
    socket.emit('transcription', {
      roomId: sessionId,
      text,
      timestamp: new Date(),
      isFinal
    });
    
    // Send to translation service (only final results)
    if (isFinal && translationServiceRef.current) {
      translationServiceRef.current.sendForTranslation(text, isFinal);
    }
  };
  
  // 4. Stop transcription
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    deepgramServiceRef.current?.close();
    translationServiceRef.current?.flushBuffer();
    setIsRecording(false);
  };
  
  return (
    <div>
      <button onClick={startRecording}>Start</button>
      <button onClick={stopRecording}>Stop</button>
    </div>
  );
};
```

### 3. DeepgramService (Simplified)

```javascript
class DeepgramService {
  async initialize({ apiKey, model, language, interimResults }) {
    const { createClient } = await import('@deepgram/sdk');
    const client = createClient(apiKey);
    const connection = client.listen.live({
      model,
      language,
犯了interim_results: interimResults
    });
    
    connection.on('open', () => this.listeners.onOpen?.());
    connection.on('transcript', (data) => {
      const text = data.channel.alternatives[0].transcript;
      this.listeners.onTranscript?.(text, data.is_final);
    });
    
    this.connection = connection;
  }
  
  sendAudioData(data) {
    this.connection.send(data);
  }
  
  on(listeners) {
    this.listeners = listeners;
  }
  
  close() {
    this.connection.finish();
  }
}
```

### 4. GeminiTranslationService (Simplified)

```javascript
class GeminiTranslationService {
  constructor() {
    this.buffer = [];
    this.incomplete = '';
  }
  
  initialize(socket, sessionId, sourceLanguage, targetLanguages) {
    this.socket = socket;
    this.sessionId = sessionId;
    this.targetLanguages = targetLanguages;
  }
  
  sendForTranslation(text, isFinal) {
    // Process sentences
    const combined = this.incomplete + text;
    const regex = /(?:[.!?])+(?:["')]*\s+|$)/g;
    const sentences = combined.split(regex);
    
    // Add complete sentences to buffer
    this.buffer.push(...sentences.filter(s => s.trim()));
    
    // Send 2 sentences at a time
    while (this.buffer.length >= 2) {
      const twoSentences = this.buffer.splice(0, 2);
      
      this.socket.emit('start-translation', {
        text: twoSentences.join(' '),
        sessionId: this.sessionId,
        targetLanguages: this.targetLanguages
      });
    }
  }
  
  flushBuffer() {
    if (this.buffer.length > 0) {
      this.socket.emit('start-translation', {
        text: this.buffer.join(' '),
        sessionId: this.sessionId,
        targetLanguages: this.targetLanguages
      });
      this.buffer = [];
    }
  }
}
```

---

## 📥 RECEIVER Implementation

### 1. Dependencies

```bash
npm install socket.io-client
```

### 2. Basic Component Structure

```javascript
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const LiveViewer = ({ sessionId }) => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [translations, setTranslations] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  
  useEffect(() => {
    // Connect to transcription socket
    const transcriptionSocket = io(TRANSCRIPTION_SERVER_URL);
    
    transcriptionSocket.on('connect', () => {
      transcriptionSocket.emit('join-room', sessionId);
    });
    
    transcriptionSocket.on('new-transcription', (data) => {
      setTranscriptions(prev => [...prev, data]);
    });
    
    // Connect to translation socket
    const translationSocket = io(GEMINI_TRANSLATION_SERVER_URL);
    
    translationSocket.on('connect', () => {
      translationSocket.emit('subscribe-language', {
        sessionId,
        language: selectedLanguage
      });
    });
    
    translationSocket.on('translation-update', (data) => {
      if (data.type === 'text') {
        setTranslations(prev => ({
          ...prev,
          [data.language]: data.content
        }));
      }
      
      if (data.type === 'audio' && data.playableAudio) {
        playAudio(data.playableAudio);
      }
    });
    
    return () => {
      transcriptionSocket.disconnect();
      translationSocket.disconnect();
    };
  }, [sessionId, selectedLanguage]);
  
  const playAudio = (audioData) => {
    const blob = new Blob([new Uint8Array(audioData)], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };
  
  return (
    <div>
      {/* Display transcriptions */}
      {transcriptions.map((t, i) => (
        <div key={i}>{t.text}</div>
      ))}
      
      {/* Display translations */}
      {translations[selectedLanguage] && (
        <div>{translations[selectedLanguage]}</div>
      )}
      
      {/* Language selector */}
      <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
        <option value="hindi">Hindi</option>
        <option value="malayalam">Malayalam</option>
      </select>
    </div>
  );
};
```

---

## 🔌 Socket Events Reference

### Transcription Socket

**Client → Server:**
- `join-room` - Join session room
- `transcription` - Send transcription result

**Server → Client:**
- `new-transcription` - New transcription received
- `interim-transcription` - Partial transcription
- `room-history` - Past transcriptions when joining

### Translation Socket

**Client → Server:**
- `subscribe-language` - Subscribe to language
- `unsubscribe-language` - Unsubscribe from language

**Server → Client:**
- `translation-update` - Translation update (text, audio, or turn arriving complete)
- `translation-history` - Past translations when subscribing
- `subscription-confirmed` - Subscription success
- `subscription-error` - Subscription error

---

## 📋 Environment Variables

### Sender (.env)

```env
VITE_LIVE_TRANSCRIPTION_SERVER_URL=https://transcription-server.com
VITE_GEMINI_TRANSLATION_SERVER_URL=https://translation-server.com
VITE_DEEPGRAM_API_KEY=your_deepgram_key
VITE_SPEECHMATICS_API_KEY=your_speechmatics_key
```

### Receiver (.env)

```env
NEXT_PUBLIC_TRANSCRIPTION_SERVER_URL=https://transcription-server.com
NEXT_PUBLIC_GEMINI_TRANSLATION_SERVER_URL=https://translation-server.com
```

---

## 🎯 Key Points

### Sender
1. **Two Sockets**: One for transcription broadcast, one for translation
2. **MediaRecorder**: Captures audio in 100ms chunks
3. **Provider Selection**: Choose Deepgram or Speechmatics based on language
4. **Sentence Buffering**: Translation service buffers 2 sentences before sending
5. **Cleanup**: Always stop MediaRecorder and close sockets

### Receiver
1. **Real-time Updates**: Listen for transcription and translation events
2. **Audio Playback**: Queue audio chunks for gapless playback
3. **Language Switching**: Unsubscribe old language, subscribe new one
4. **Memory Management**: Clean up blob URLs after playback
5. **History Loading**: Receive past translations when subscribing

---

## 🐛 Common Issues

### Sender Issues

**No transcription appearing:**
- Check API keys are set
- Verify microphone permission granted
- Check Deepgram connection status

**Translation not working:**
- Verify translation socket connected
- Check target languages configured
- Ensure translation service initialized

### Receiver Issues

**Not receiving transcriptions:**
- Verify join-room event sent
- Check socket connection status
- Ensure correct room ID

**Audio not playing:**
- Check autoplay permissions
- Verify audio blob creation
- Check blob URL cleanup

---

## 📚 Additional Resources

- Full Documentation: `LIVE_TRANSCRIPTION_COMPLETE_DOCUMENTATION.md`
- Deepgram Docs: https://developers.deepgram.com/
- Socket.IO Docs: https://socket.io/docs/v4/
- Complete Implementation: See attached files

---

**Quick Reference Version**: 1.0  
**Last Updated**: January 2025







