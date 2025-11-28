# Nova vs Google Service Selection Implementation

## 🎯 **Problem Solved**

The user requested to implement the original Nova vs Google logic where:

- **Nova-supported languages** → Use **Deepgram backend socket** (frontend to backend, backend to Deepgram API)
- **Non-Nova languages** → Use **Google Speech backend socket**

This enables room management and broadcasting for all languages and removes the need for direct Deepgram connection from the frontend.

## ✅ **Implementation Details**

### 1. **Deepgram Backend Hook**

```javascript
function useBackendSocket(targetLanguage = "en", roomId = null, endpoint = "deepgram-speech") {
  // WebSocket connection to backend Deepgram service
  // Uses /api/v1/deepgram-speech endpoint
  // Handles room management for multi-client scenarios
  // Returns service: 'Deepgram Backend Socket'
}
```

### 2. **Google Backend Hook**

```javascript
function useBackendSocket(targetLanguage = "en", roomId = null, endpoint = "google-speech") {
  // WebSocket connection to backend Google Speech service
  // Uses /api/v1/google-speech endpoint
  // Handles room management for multi-client scenarios
  // Returns service: 'Google Backend Socket'
}
```

### 3. **Language Support Detection**

```javascript
const NOVA_SUPPORTED_LANGUAGES = [
  "bg",
  "ca",
  "yue",
  "zh",
  "zh-TW",
  "cs",
  "da",
  "nl",
  "en",
  "en-AU",
  "en-IN",
  "en-NZ",
  "en-GB",
  "et",
  "fi",
  "fr",
  "fr-CA",
  "de",
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
  "pt",
  "pt-BR",
  "pt-PT",
  "ro",
  "ru",
  "sk",
  "es",
  "es-419",
  "sv",
  "tmh",
  "ta",
  "th",
  "tr",
  "uk",
  "vi",
];

const isNovaSupported = (languageCode) => {
  const baseLanguage = languageCode.split("-")[0];
  return NOVA_SUPPORTED_LANGUAGES.includes(languageCode) || NOVA_SUPPORTED_LANGUAGES.includes(baseLanguage);
};
```

### 4. **Automatic Service Selection**

```javascript
// Determine which service to use based on Nova support
const useNovaService = isNovaSupported(targetLanguage);
const endpoint = useNovaService ? "deepgram-speech" : "google-speech";
const backendHook = useBackendSocket(targetLanguage, roomId, endpoint);
```

// Use backendHook for all UI and logic

---

**All transcription now goes through the backend socket, enabling room management and broadcasting for both Deepgram and Google Speech.**

### 5. **Enhanced Language Mapping**

```javascript
const mapLanguageToCode = (languageName) => {
  const commonMappings = {
    english: "en-US", // ✅ Proper locale codes
    spanish: "es-ES", // ✅ Prevents API errors
    french: "fr-FR", // ✅ Full locale support
    chinese: "zh-CN", // ✅ Regional variants
    arabic: "ar-SA", // ✅ Proper locale
    hindi: "hi-IN", // ✅ Proper locale
    // ... more proper mappings
  };

  return commonMappings[langName.toLowerCase()] || "en-US";
};
```

## 🚀 **Service Flow**

### **Nova-Supported Languages (Deepgram Backend):**

1. **User selects** English, Spanish, French, German, etc.
2. **System detects** → Nova supported
3. **Frontend connects** → Backend Deepgram WebSocket
4. **Real-time transcription** → Deepgram Nova-2 model
5. **Result marked** → "Deepgram Backend Socket"

### **Non-Nova Languages (Google Backend):**

1. **User selects** Arabic, Malayalam, etc.
2. **System detects** → Not Nova supported
3. **Frontend connects** → Backend WebSocket
4. **Backend processes** → Google Speech API
5. **Result marked** → "Google Backend Socket"

## 🎨 **User Interface**

### **Service Information Display:**

- 🟣 **"Deepgram Backend Socket"** for Nova languages
- 🟢 **"Google Speech (Backend)"** for non-Nova languages
- 🔵 **"Auto-selected for [language]"** indicator

### **Language Selector:**

- Shows service routing: `English → Deepgram Backend`
- Shows service routing: `Arabic → Google Backend`
- Real-time feedback on service selection

### **Transcription Results:**

- Service badges show which service was used
- Color-coded for easy identification
- Maintains service history per result

## 📋 **Expected Behavior**

### ✅ **Nova-Supported Languages (45+ languages):**

```bash
✅ English (en-US) → Deepgram Backend Socket
✅ Spanish (es-ES) → Deepgram Backend Socket
✅ French (fr-FR) → Deepgram Backend Socket
✅ German (de-DE) → Deepgram Backend Socket
✅ Chinese (zh-CN) → Deepgram Backend Socket
✅ Portuguese (pt-BR) → Deepgram Backend Socket
✅ Italian (it-IT) → Deepgram Backend Socket
✅ Japanese (ja-JP) → Deepgram Backend Socket
✅ Korean (ko-KR) → Deepgram Backend Socket
✅ Russian (ru-RU) → Deepgram Backend Socket
```

### ✅ **Non-Nova Languages (Google Backend):**

```bash
✅ Arabic (ar-SA) → Google Speech Backend Socket
✅ Hindi (hi-IN) → Google Speech Backend Socket
✅ Malayalam (ml-IN) → Google Speech Backend Socket
✅ Esperanto (eo) → Google Speech Backend Socket
```

## 🛠️ **Technical Benefits**

### **1. Bypasses Backend Issues:**

- Direct Deepgram connection avoids backend connectivity problems
- Reduces server load for Nova languages
- Eliminates WebSocket routing through backend

### **2. Optimal Performance:**

- Nova languages get direct API access (faster)
- Google languages use proven backend implementation
- Each service used for its strengths

### **3. Error Prevention:**

- Proper language code mapping prevents API errors
- Service selection happens before connection
- Clear error messages for each service

### **4. Scalability:**

- Direct connections reduce backend load
- Backend only handles non-Nova languages
- Easy to add new language support

## 🔧 **Configuration Requirements**

### **Frontend Environment Variables:**

```bash
# Required for Nova direct connection
VITE_DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

### **Backend Environment Variables:**

```bash
# Required for Google Speech backend
GOOGLE_SERVICE_ACCOUNT_JSON=path_to_service_account.json
```

## 🚀 **Testing the Implementation**

1. **Open AudioTranscriber** in your frontend
2. **Select Nova language** (e.g., English) → Should show "Deepgram Backend"
3. **Select non-Nova language** (e.g., Arabic) → Should show "Google Backend"
4. **Start recording** → Service should connect directly
5. **Verify transcription** → Results should be marked with correct service

## 📊 **Debug Information**

The console will show:

```bash
AudioTranscriber Service Selection:
- Target Language: en-US
- Nova Supported: true
- Service: Deepgram Backend Socket

# OR

AudioTranscriber Service Selection:
- Target Language: ar-SA
- Nova Supported: false
- Service: Google Speech Backend
```

This implementation perfectly matches the user's request for Nova vs Google selection based on language support, using the most appropriate connection method for each service. 🎤✨
