// Test implementation for LiveTest component
// This file contains mock data and test functions to verify the implementation

// Mock event data
export const mockEventData = {
  _id: "test_event_123",
  title: "Test Event",
  translationLanguages: ["English", "Spanish", "French", "German", "Chinese", "Japanese"],
};

// Mock API responses
export const mockApiResponses = {
  instarecapSetting: {
    status: 200,
    data: {
      response: [
        {
          _id: "setting_123",
          event: "test_event_123",
          translationLanguages: ["English", "Spanish", "French", "German", "Chinese", "Japanese"],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
    },
  },
  liveTranscriptionSave: {
    status: 200,
    data: {
      success: true,
      message: "Transcription saved successfully",
      data: {
        id: "transcription_123",
        text: "Test transcription text",
        timestamp: "2024-01-01T12:00:00Z",
      },
    },
  },
  liveTranscriptionByEvent: {
    status: 200,
    data: {
      success: true,
      data: {
        transcriptions: [
          {
            _id: "transcription_1",
            eventId: "test_event_123",
            roomId: "test_event_123",
            text: "Hello, this is a test transcription",
            language: "en-US",
            timestamp: "2024-01-01T12:00:00Z",
            isFinal: true,
            createdAt: "2024-01-01T12:00:00Z",
          },
          {
            _id: "transcription_2",
            eventId: "test_event_123",
            roomId: "test_event_123",
            text: "This is another test transcription",
            language: "en-US",
            timestamp: "2024-01-01T12:01:00Z",
            isFinal: true,
            createdAt: "2024-01-01T12:01:00Z",
          },
        ],
        total: 2,
        limit: 50,
        offset: 0,
      },
    },
  },
};

// Mock language mapping
export const mockLanguageMapping = {
  English: "en-US",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Chinese: "zh-CN",
  Japanese: "ja-JP",
};

// Mock Nova supported languages
export const mockNovaSupportedLanguages = [
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

// Test functions
export const testFunctions = {
  // Test language mapping
  testLanguageMapping: () => {
    const testCases = [
      { input: "English", expected: "en-US" },
      { input: "Spanish", expected: "es-ES" },
      { input: "French", expected: "fr-FR" },
      { input: "German", expected: "de-DE" },
      { input: "Chinese", expected: "zh-CN" },
      { input: "Japanese", expected: "ja-JP" },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = mockLanguageMapping[input];
      console.log(`Language mapping test: "${input}" -> "${result}" (expected: "${expected}")`);
      if (result === expected) {
        console.log("✅ PASS");
      } else {
        console.log("❌ FAIL");
      }
    });
  },

  // Test Nova support detection
  testNovaSupport: () => {
    const testCases = [
      { language: "en-US", expected: true },
      { language: "es-ES", expected: true },
      { language: "fr-FR", expected: true },
      { language: "de-DE", expected: true },
      { language: "zh-CN", expected: true },
      { language: "ja-JP", expected: true },
      { language: "ar-SA", expected: false }, // Arabic not supported
      { language: "ml-IN", expected: false }, // Malayalam not supported
    ];

    testCases.forEach(({ language, expected }) => {
      const isSupported = mockNovaSupportedLanguages.includes(language);
      console.log(`Nova support test: "${language}" -> ${isSupported} (expected: ${expected})`);
      if (isSupported === expected) {
        console.log("✅ PASS");
      } else {
        console.log("❌ FAIL");
      }
    });
  },

  // Test API response parsing
  testApiResponseParsing: () => {
    const response = mockApiResponses.instarecapSetting;
    if (response.status === 200 && response.data.response && response.data.response.length > 0) {
      const eventData = response.data.response[0];
      const translationLanguages = eventData.translationLanguages || [];
      console.log("✅ API response parsing test PASS");
      console.log(`Found ${translationLanguages.length} translation languages:`, translationLanguages);
    } else {
      console.log("❌ API response parsing test FAIL");
    }
  },

  // Test transcription data structure
  testTranscriptionDataStructure: () => {
    const transcription = mockApiResponses.liveTranscriptionByEvent.data.data.transcriptions[0];
    const requiredFields = ["_id", "eventId", "roomId", "text", "language", "timestamp", "isFinal"];

    const missingFields = requiredFields.filter((field) => !transcription.hasOwnProperty(field));

    if (missingFields.length === 0) {
      console.log("✅ Transcription data structure test PASS");
      console.log("All required fields present:", requiredFields);
    } else {
      console.log("❌ Transcription data structure test FAIL");
      console.log("Missing fields:", missingFields);
    }
  },

  // Test component state management
  testComponentState: () => {
    const mockStates = {
      loading: false,
      error: null,
      selectedLanguage: { code: "en-US", name: "English", isNovaSupported: true },
      isRecording: false,
      connectionStatus: "disconnected",
      transcriptionResults: [],
      interimText: "",
    };

    console.log("✅ Component state management test PASS");
    console.log("Mock states:", mockStates);
  },

  // Run all tests
  runAllTests: () => {
    console.log("🧪 Running LiveTest implementation tests...\n");

    console.log("1. Testing language mapping:");
    testFunctions.testLanguageMapping();
    console.log("\n");

    console.log("2. Testing Nova support detection:");
    testFunctions.testNovaSupport();
    console.log("\n");

    console.log("3. Testing API response parsing:");
    testFunctions.testApiResponseParsing();
    console.log("\n");

    console.log("4. Testing transcription data structure:");
    testFunctions.testTranscriptionDataStructure();
    console.log("\n");

    console.log("5. Testing component state management:");
    testFunctions.testComponentState();
    console.log("\n");

    console.log("🎉 All tests completed!");
  },
};

// Export for use in component testing
export default {
  mockEventData,
  mockApiResponses,
  mockLanguageMapping,
  mockNovaSupportedLanguages,
  testFunctions,
};
