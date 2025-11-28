/**
 * Test script for AudioTranscriber implementation
 * Run this in browser console to test the new implementation
 */

// Test environment variables
function testEnvironmentVariables() {
  console.log("🔍 Testing Environment Variables...");

  const deepgramUrl = import.meta.env.VITE_DEEPGRAM_URL;
  const googleUrl = import.meta.env.VITE_GOOGLE_URL;

  console.log("VITE_DEEPGRAM_URL:", deepgramUrl ? "✅ Set" : "❌ Not set");
  console.log("VITE_GOOGLE_URL:", googleUrl ? "✅ Set" : "❌ Not set");

  if (!deepgramUrl || !googleUrl) {
    console.warn("⚠️  Environment variables not configured. Please set VITE_DEEPGRAM_URL and VITE_GOOGLE_URL");
  }

  return { deepgramUrl, googleUrl };
}

// Test language mapping
function testLanguageMapping() {
  console.log("🔍 Testing Language Mapping...");

  const testLanguages = ["English", "French", "Spanish", "German", "Chinese", "Japanese", "Hindi", "Arabic"];

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

  const isNovaSupported = (languageCode) => {
    const baseLanguage = languageCode.split("-")[0];
    return NOVA_SUPPORTED_LANGUAGES.includes(languageCode) || NOVA_SUPPORTED_LANGUAGES.includes(baseLanguage);
  };

  const mapLanguageToCode = (languageName) => {
    const commonMappings = {
      english: "en-US",
      french: "fr-FR",
      spanish: "es-ES",
      german: "de-DE",
      chinese: "zh-CN",
      japanese: "ja-JP",
      hindi: "hi-IN",
      arabic: "ar-SA",
    };

    const normalizedName = languageName.toLowerCase();
    return commonMappings[normalizedName] || "en-US";
  };

  testLanguages.forEach((lang) => {
    const code = mapLanguageToCode(lang);
    const supported = isNovaSupported(code);
    console.log(`${lang} -> ${code} -> ${supported ? "Nova" : "Google"}`);
  });
}

// Test WebSocket URL generation
function testWebSocketUrlGeneration() {
  console.log("🔍 Testing WebSocket URL Generation...");

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

  try {
    const deepgramUrl = getWebSocketUrl("deepgram", "test-room", "en-US");
    console.log("Deepgram URL:", deepgramUrl);
  } catch (error) {
    console.log("Deepgram URL Error:", error.message);
  }

  try {
    const googleUrl = getWebSocketUrl("google", "test-room", "en-US");
    console.log("Google URL:", googleUrl);
  } catch (error) {
    console.log("Google URL Error:", error.message);
  }
}

// Test audio capabilities
async function testAudioCapabilities() {
  console.log("🔍 Testing Audio Capabilities...");

  try {
    // Test microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000,
        channelCount: 1,
        autoGainControl: true,
      },
    });

    console.log("✅ Microphone access granted");
    console.log("Audio tracks:", stream.getAudioTracks().length);

    // Test MediaRecorder
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    console.log("✅ MediaRecorder created successfully");
    console.log("MIME type:", mediaRecorder.mimeType);

    // Clean up
    stream.getTracks().forEach((track) => track.stop());
    console.log("✅ Audio stream cleaned up");
  } catch (error) {
    console.error("❌ Audio test failed:", error.message);
  }
}

// Test WebSocket connection
function testWebSocketConnection() {
  console.log("🔍 Testing WebSocket Connection...");

  const testConnection = (url, provider) => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error(`${provider} connection timeout`));
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        console.log(`✅ ${provider} WebSocket connected`);
        ws.close();
        resolve(true);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.log(`❌ ${provider} WebSocket error:`, error);
        reject(error);
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        console.log(`ℹ️  ${provider} WebSocket closed`);
      };
    });
  };

  // Test Deepgram connection
  if (import.meta.env.VITE_DEEPGRAM_URL) {
    const deepgramUrl = new URL(import.meta.env.VITE_DEEPGRAM_URL);
    deepgramUrl.searchParams.set("roomId", "test-room");
    deepgramUrl.searchParams.set("language", "en-US");
    deepgramUrl.searchParams.set("provider", "deepgram");

    testConnection(deepgramUrl.toString(), "Deepgram")
      .then(() => console.log("✅ Deepgram connection test passed"))
      .catch((error) => console.log("❌ Deepgram connection test failed:", error.message));
  }

  // Test Google connection
  if (import.meta.env.VITE_GOOGLE_URL) {
    const googleUrl = new URL(import.meta.env.VITE_GOOGLE_URL);
    googleUrl.searchParams.set("roomId", "test-room");
    googleUrl.searchParams.set("language", "en-US");
    googleUrl.searchParams.set("provider", "google");

    testConnection(googleUrl.toString(), "Google")
      .then(() => console.log("✅ Google connection test passed"))
      .catch((error) => console.log("❌ Google connection test failed:", error.message));
  }
}

// Run all tests
function runAllTests() {
  console.log("🚀 Starting AudioTranscriber Implementation Tests...\n");

  testEnvironmentVariables();
  console.log("");

  testLanguageMapping();
  console.log("");

  testWebSocketUrlGeneration();
  console.log("");

  testAudioCapabilities();
  console.log("");

  testWebSocketConnection();
  console.log("");

  console.log("✅ All tests completed!");
}

// Export for use in browser console
if (typeof window !== "undefined") {
  window.testAudioTranscriber = {
    testEnvironmentVariables,
    testLanguageMapping,
    testWebSocketUrlGeneration,
    testAudioCapabilities,
    testWebSocketConnection,
    runAllTests,
  };

  console.log("🎤 AudioTranscriber test functions available:");
  console.log("- window.testAudioTranscriber.runAllTests()");
  console.log("- window.testAudioTranscriber.testEnvironmentVariables()");
  console.log("- window.testAudioTranscriber.testLanguageMapping()");
  console.log("- window.testAudioTranscriber.testWebSocketUrlGeneration()");
  console.log("- window.testAudioTranscriber.testAudioCapabilities()");
  console.log("- window.testAudioTranscriber.testWebSocketConnection()");
}

export { testEnvironmentVariables, testLanguageMapping, testWebSocketUrlGeneration, testAudioCapabilities, testWebSocketConnection, runAllTests };
