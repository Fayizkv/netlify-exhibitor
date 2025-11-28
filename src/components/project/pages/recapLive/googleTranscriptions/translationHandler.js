// Translation handler for Google Cloud Speech-to-Text integration

import { GOOGLE_CLOUD_CONFIG } from "./config.js";

// Google Translate API endpoint
const GOOGLE_TRANSLATE_API = "https://translation.googleapis.com/language/translate/v2";

// Simple translation using Google Translate API (free tier)
export const translateText = async (text, targetLanguage, sourceLanguage = "auto") => {
  try {
    if (!text || text.trim() === "") {
      return text;
    }

    // Use Google Translate API if available
    if (GOOGLE_CLOUD_CONFIG.translateApiKey) {
      return await translateWithGoogleAPI(text, targetLanguage, sourceLanguage);
    }

    // Fallback to free Google Translate service
    return await translateWithFreeService(text, targetLanguage, sourceLanguage);
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
};

// Translate using Google Translate API (paid service)
export const translateWithGoogleAPI = async (text, targetLanguage, sourceLanguage = "auto") => {
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_API}?key=${GOOGLE_CLOUD_CONFIG.translateApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        source: sourceLanguage,
        format: "text",
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Google Translate API error:", error);
    throw error;
  }
};

// Translate using free Google Translate service
export const translateWithFreeService = async (text, targetLanguage, sourceLanguage = "auto") => {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation service error: ${response.status}`);
    }

    const result = await response.json();
    return result[0]?.[0]?.[0] || text;
  } catch (error) {
    console.error("Free translation service error:", error);
    throw error;
  }
};

// Batch translate multiple texts
export const translateBatch = async (texts, targetLanguage, sourceLanguage = "auto") => {
  try {
    const promises = texts.map((text) => translateText(text, targetLanguage, sourceLanguage));
    return await Promise.all(promises);
  } catch (error) {
    console.error("Batch translation error:", error);
    return texts; // Return original texts if translation fails
  }
};

// Detect language of text
export const detectLanguage = async (text) => {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=ld&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Language detection error: ${response.status}`);
    }

    const result = await response.json();
    return result[2] || "en"; // Return detected language code
  } catch (error) {
    console.error("Language detection error:", error);
    return "en"; // Default to English
  }
};

// Get supported languages for translation
export const getSupportedTranslationLanguages = () => {
  return [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "ta", name: "Tamil" },
    { code: "ml", name: "Malayalam" },
    { code: "th", name: "Thai" },
    { code: "vi", name: "Vietnamese" },
    { code: "tr", name: "Turkish" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "sv", name: "Swedish" },
    { code: "da", name: "Danish" },
    { code: "no", name: "Norwegian" },
    { code: "fi", name: "Finnish" },
    { code: "cs", name: "Czech" },
    { code: "sk", name: "Slovak" },
    { code: "hu", name: "Hungarian" },
    { code: "ro", name: "Romanian" },
    { code: "bg", name: "Bulgarian" },
    { code: "hr", name: "Croatian" },
    { code: "sr", name: "Serbian" },
    { code: "uk", name: "Ukrainian" },
    { code: "el", name: "Greek" },
    { code: "he", name: "Hebrew" },
    { code: "id", name: "Indonesian" },
    { code: "ms", name: "Malay" },
    { code: "fa", name: "Persian" },
    { code: "ur", name: "Urdu" },
    { code: "bn", name: "Bengali" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "te", name: "Telugu" },
    { code: "pa", name: "Punjabi" },
    { code: "mr", name: "Marathi" },
    { code: "ne", name: "Nepali" },
    { code: "si", name: "Sinhala" },
    { code: "my", name: "Burmese" },
    { code: "km", name: "Khmer" },
    { code: "lo", name: "Lao" },
    { code: "eo", name: "Esperanto" },
  ];
};

// Check if language is supported for translation
export const isTranslationSupported = (languageCode) => {
  const supportedLanguages = getSupportedTranslationLanguages();
  return supportedLanguages.some((lang) => lang.code === languageCode);
};

// Create translation result object
export const createTranslationResult = (originalText, translatedText, sourceLanguage, targetLanguage) => {
  return {
    originalText,
    translatedText,
    sourceLanguage,
    targetLanguage,
    isTranslated: originalText !== translatedText,
    timestamp: new Date(),
  };
};

// Handle translation for unsupported languages
export const handleUnsupportedLanguage = async (text, targetLanguage, sourceLanguage = "auto") => {
  try {
    // Check if target language is supported for translation
    if (!isTranslationSupported(targetLanguage)) {
      console.warn(`Language ${targetLanguage} not supported for translation`);
      return {
        text,
        isTranslated: false,
        originalText: text,
        targetLanguage,
        sourceLanguage,
      };
    }

    // Translate the text
    const translatedText = await translateText(text, targetLanguage, sourceLanguage);

    return {
      text: translatedText,
      isTranslated: true,
      originalText: text,
      targetLanguage,
      sourceLanguage,
    };
  } catch (error) {
    console.error("Error handling unsupported language:", error);
    return {
      text,
      isTranslated: false,
      originalText: text,
      targetLanguage,
      sourceLanguage,
      error: error.message,
    };
  }
};

// Rate limiting for translation requests
class TranslationRateLimiter {
  constructor(maxRequests = 100, timeWindow = 60000) {
    // 100 requests per minute
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  }

  addRequest() {
    this.requests.push(Date.now());
  }

  getRemainingRequests() {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.timeWindow);
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

// Global rate limiter instance
export const translationRateLimiter = new TranslationRateLimiter();

// Rate-limited translation function
export const translateWithRateLimit = async (text, targetLanguage, sourceLanguage = "auto") => {
  if (!translationRateLimiter.canMakeRequest()) {
    throw new Error("Translation rate limit exceeded. Please try again later.");
  }

  translationRateLimiter.addRequest();
  return await translateText(text, targetLanguage, sourceLanguage);
};
