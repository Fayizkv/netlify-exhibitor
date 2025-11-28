/**
 * languageUtils.js
 * 
 * Utility functions for language mapping and validation
 */

// Language mapping for translation
export const LANGUAGE_NAME_TO_CODE_MAP = {
  // English variants
  English: "en",
  "English (US)": "en-US",
  "English (UK)": "en-GB",
  "English (Australia)": "en-AU",
  "English (India)": "en-IN",
  "English (New Zealand)": "en-NZ",

  // Spanish variants
  Spanish: "es",
  "Spanish (Spain)": "es-ES",
  "Spanish (Latin America)": "es-419",

  // French variants
  French: "fr",
  "French (France)": "fr-FR",
  "French (Canada)": "fr-CA",

  // German variants
  German: "de",
  "German (Germany)": "de-DE",
  "German (Switzerland)": "de-CH",

  // Portuguese variants
  Portuguese: "pt",
  "Portuguese (Brazil)": "pt-BR",
  "Portuguese (Portugal)": "pt-PT",

  // Chinese variants
  Chinese: "zh",
  "Chinese (Simplified)": "zh",
  "Chinese (Traditional)": "zh-TW",
  "Chinese (Mandarin)": "zh",
  "Chinese (Cantonese)": "yue",

  // Other major languages
  Arabic: "ar",
  Hindi: "hi",
  Japanese: "ja",
  Korean: "ko",
  Russian: "ru",
  Italian: "it",
  Dutch: "nl",
  Polish: "pl",
  Turkish: "tr",
  Swedish: "sv",
  Danish: "da",
  Norwegian: "no",
  Finnish: "fi",
  Czech: "cs",
  Hungarian: "hu",
  Romanian: "ro",
  Bulgarian: "bg",
  Croatian: "hr",
  Slovak: "sk",
  Slovenian: "sl",
  Estonian: "et",
  Latvian: "lv",
  Lithuanian: "lt",
  Maltese: "mt",
  Greek: "el",
  Hebrew: "he",
  Indonesian: "id",
  Malay: "ms",
  Filipino: "tl",
  Bengali: "bn",
  Urdu: "ur",
  Persian: "fa",
  Gujarati: "gu",
  Kannada: "kn",
  Malayalam: "ml",
  Punjabi: "pa",
  Tamil: "ta",
  Telugu: "te",
  Nepali: "ne",
  Sinhala: "si",
  "Myanmar (Burmese)": "my",
  Khmer: "km",
  Lao: "lo",
  Georgian: "ka",
  Amharic: "am",
  Swahili: "sw",
  Zulu: "zu",
  Afrikaans: "af",
  Albanian: "sq",
  Armenian: "hy",
  Azerbaijani: "az",
  Basque: "eu",
  Belarusian: "be",
  Catalan: "ca",
  Welsh: "cy",
  Galician: "gl",
  Icelandic: "is",
  Irish: "ga",
  Macedonian: "mk",
  Mongolian: "mn",
  Serbian: "sr",
  Ukrainian: "uk",
  Yiddish: "yi",
  Thai: "th",
  Vietnamese: "vi",
  Esperanto: "eo",
  Assamese: "as",
  Aymara: "ay",
  Bambara: "bm",
  Bhojpuri: "bho",
  Bosnian: "bs",
  Cebuano: "ceb",
  Chichewa: "ny",
  Corsican: "co",
  Dhivehi: "dv",
  Dogri: "doi",
  Ewe: "ee",
  Frisian: "fy",
  Guarani: "gn",
  Hausa: "ha",
  Hawaiian: "haw",
  Hmong: "hmn",
  Igbo: "ig",
  Ilocano: "ilo",
  Javanese: "jv",
  Kazakh: "kk",
  Kinyarwanda: "rw",
  Konkani: "kok",
  Krio: "kri",
  "Kurdish (Kurmanji)": "ku",
  "Kurdish (Sorani)": "ckb",
  Kyrgyz: "ky",
  Latin: "la",
  Lingala: "ln",
  Luganda: "lg",
  Luxembourgish: "lb",
  Maithili: "mai",
  Malagasy: "mg",
  Maori: "mi",
  Marathi: "mr",
  "Meiteilon (Manipuri)": "mni",
  Mizo: "lus",
  "Odia (Oriya)": "or",
  Oromo: "om",
  Pashto: "ps",
  Quechua: "qu",
  Samoan: "sm",
  Sanskrit: "sa",
  "Scots Gaelic": "gd",
  Sepedi: "nso",
  Sesotho: "st",
  Shona: "sn",
  Sindhi: "sd",
  Somali: "so",
  Sundanese: "su",
  Tagalog: "tl",
  Tajik: "tg",
  Tatar: "tt",
  Tigrinya: "ti",
  Tsonga: "ts",
  Turkmen: "tk",
  Twi: "tw",
  Uyghur: "ug",
  Uzbek: "uz",
  Xhosa: "xh",
  Yoruba: "yo",
};

/**
 * Convert language name to language code
 * @param {string} languageName - Language name to convert
 * @returns {string|null} Language code or null if not found
 */
export const convertLanguageNameToCode = (languageName) => {
  if (!languageName || languageName.trim() === "") return null;

  const normalizedName = languageName.trim();
  const code = LANGUAGE_NAME_TO_CODE_MAP[normalizedName];

  if (code) {
    return code;
  }

  // Try to find partial matches for common variations
  const lowerName = normalizedName.toLowerCase();
  for (const [name, code] of Object.entries(LANGUAGE_NAME_TO_CODE_MAP)) {
    if (name.toLowerCase().includes(lowerName) || lowerName.includes(name.toLowerCase())) {
      return code;
    }
  }

  // Return null if no match found
  return null;
};

/**
 * Convert language code to language name
 * @param {string} languageCode - Language code to convert
 * @returns {string|null} Language name or the code if no name found
 */
export const convertLanguageCodeToName = (languageCode) => {
  if (!languageCode) return null;

  for (const [name, code] of Object.entries(LANGUAGE_NAME_TO_CODE_MAP)) {
    if (code === languageCode) {
      return name;
    }
  }

  return languageCode; // Return the code if no name found
};

// Supported languages with Nova-2 and Nova-3 support
export const SUPPORTED_LANGUAGES = [
  // English variants (default) - Nova-3 support
  { code: "en", name: "English", novaSupport: "nova-3" },
  { code: "en-AU", name: "English (Australia)", novaSupport: "nova-3" },
  { code: "en-GB", name: "English (United Kingdom)", novaSupport: "nova-3" },
  { code: "en-IN", name: "English (India)", novaSupport: "nova-3" },
  { code: "en-NZ", name: "English (New Zealand)", novaSupport: "nova-3" },
  { code: "en-US", name: "English (US)", novaSupport: "nova-3" },

  // Nova-3 supported languages (multilingual support)
  { code: "da", name: "Danish", novaSupport: "nova-3" },
  { code: "da-DK", name: "Danish (Denmark)", novaSupport: "nova-3" },
  { code: "de", name: "German", novaSupport: "nova-3" },
  { code: "es", name: "Spanish", novaSupport: "nova-3" },
  { code: "es-419", name: "Spanish (Latin America)", novaSupport: "nova-3" },
  { code: "fr", name: "French", novaSupport: "nova-3" },
  { code: "fr-CA", name: "French (Canada)", novaSupport: "nova-3" },
  { code: "id", name: "Indonesian", novaSupport: "nova-3" },
  { code: "it", name: "Italian", novaSupport: "nova-3" },
  { code: "ja", name: "Japanese", novaSupport: "nova-3" },
  { code: "nl", name: "Dutch", novaSupport: "nova-3" },
  { code: "no", name: "Norwegian", novaSupport: "nova-3" },
  { code: "pt", name: "Portuguese", novaSupport: "nova-3" },
  { code: "pt-BR", name: "Portuguese (Brazil)", novaSupport: "nova-3" },
  { code: "pt-PT", name: "Portuguese (Portugal)", novaSupport: "nova-3" },
  { code: "ru", name: "Russian", novaSupport: "nova-3" },
  { code: "sv", name: "Swedish", novaSupport: "nova-3" },
  { code: "sv-SE", name: "Swedish (Sweden)", novaSupport: "nova-3" },
  { code: "tr", name: "Turkish", novaSupport: "nova-3" },

  // Nova-2 supported languages (additional languages not in Nova-3)
  { code: "bg", name: "Bulgarian", novaSupport: "nova-2" },
  { code: "ca", name: "Catalan", novaSupport: "nova-2" },
  { code: "cs", name: "Czech", novaSupport: "nova-2" },
  { code: "de-CH", name: "German (Switzerland)", novaSupport: "nova-2" },
  { code: "el", name: "Greek", novaSupport: "nova-2" },
  { code: "et", name: "Estonian", novaSupport: "nova-2" },
  { code: "fi", name: "Finnish", novaSupport: "nova-2" },
  { code: "hi", name: "Hindi", novaSupport: "nova-2" },
  { code: "hu", name: "Hungarian", novaSupport: "nova-2" },
  { code: "ko", name: "Korean", novaSupport: "nova-2" },
  { code: "ko-KR", name: "Korean (South Korea)", novaSupport: "nova-2" },
  { code: "lt", name: "Lithuanian", novaSupport: "nova-2" },
  { code: "lv", name: "Latvian", novaSupport: "nova-2" },
  { code: "ms", name: "Malay", novaSupport: "nova-2" },
  { code: "nl-BE", name: "Flemish", novaSupport: "nova-2" },
  { code: "pl", name: "Polish", novaSupport: "nova-2" },
  { code: "ro", name: "Romanian", novaSupport: "nova-2" },
  { code: "sk", name: "Slovak", novaSupport: "nova-2" },
  { code: "th", name: "Thai", novaSupport: "nova-2" },
  { code: "th-TH", name: "Thai (Thailand)", novaSupport: "nova-2" },
  { code: "uk", name: "Ukrainian", novaSupport: "nova-2" },
  { code: "vi", name: "Vietnamese", novaSupport: "nova-2" },
  { code: "zh", name: "Chinese (Mandarin, Simplified)", novaSupport: "nova-2" },
  { code: "zh-CN", name: "Chinese (Mandarin, Simplified)", novaSupport: "nova-2" },
  { code: "zh-Hans", name: "Chinese (Mandarin, Simplified)", novaSupport: "nova-2" },
  { code: "zh-HK", name: "Chinese (Cantonese, Traditional)", novaSupport: "nova-2" },
  { code: "zh-TW", name: "Chinese (Mandarin, Traditional)", novaSupport: "nova-2" },
  { code: "zh-Hant", name: "Chinese (Mandarin, Traditional)", novaSupport: "nova-2" },
];

/**
 * Check if a language is supported by Nova
 * @param {string} languageCode - Language code to check
 * @returns {boolean} True if supported, false otherwise
 */
export const isNovaSupported = (languageCode) => {
  const languageInfo = SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode);
  return languageInfo ? true : false;
};

/**
 * Get the Nova model for a specific language
 * @param {string} languageCode - Language code to check
 * @returns {string|null} Nova model version (nova-2 or nova-3) or null if not supported
 */
export const getNovaModelForLanguage = (languageCode) => {
  const languageInfo = SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode);
  return languageInfo ? languageInfo.novaSupport : null;
};

/**
 * Map language name to proper language code with common mappings
 * @param {string} languageName - Language name to map
 * @returns {string} Language code (defaults to 'en' if not found)
 */
export const mapLanguageToCode = (languageName) => {
  const exactMatch = SUPPORTED_LANGUAGES.find((lang) => lang.name.toLowerCase() === languageName.toLowerCase());
  if (exactMatch) {
    return exactMatch.code;
  }

  const commonMappings = {
    english: "en",
    "english (us)": "en-US",
    french: "fr",
    spanish: "es",
    german: "de",
    italian: "it",
    portuguese: "pt",
    arabic: "ar-SA",
    malayalam: "ml-IN",
    esperanto: "eo",
    hindi: "hi",
    chinese: "zh",
    mandarin: "zh",
    cantonese: "zh-HK",
    "traditional chinese": "zh-TW",
    "simplified chinese": "zh",
    "portuguese (brazil)": "pt-BR",
    "portuguese (portugal)": "pt-PT",
    "spanish (latin america)": "es-419",
    "english (australia)": "en-AU",
    "english (india)": "en-IN",
    "english (new zealand)": "en-NZ",
    "english (united kingdom)": "en-GB",
    "french (canada)": "fr-CA",
    "german (switzerland)": "de-CH",
    "hindi (latin)": "hi-Latn",
    "modern greek": "el",
    tamasheq: "tmh",
  };

  const normalizedName = languageName.toLowerCase();
  return commonMappings[normalizedName] || "en";
};

/**
 * Get all available languages for UI
 * @returns {Array<Object>} Array of language objects with code, name, and Nova support info
 */
export const getAvailableLanguages = () => {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    name: lang.name,
    code: lang.code,
    originalName: lang.name,
    isNovaSupported: true,
    novaSupport: lang.novaSupport,
  }));
};

/**
 * Speechmatics supported languages (from docs)
 * Source: https://docs.speechmatics.com/speech-to-text/realtime/quickstart
 */
export const SPEECHMATICS_LANGUAGES = [
  { code: 'auto', name: 'Automatic (Batch only)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ba', name: 'Bashkir' },
  { code: 'eu', name: 'Basque' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'yue', name: 'Cantonese' },
  { code: 'ca', name: 'Catalan' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'et', name: 'Estonian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'gl', name: 'Galician' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ia', name: 'Interlingua' },
  { code: 'ga', name: 'Irish' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'ms', name: 'Malay' },
  { code: 'en_ms', name: 'Malay & English bilingual' },
  { code: 'mt', name: 'Maltese' },
  { code: 'cmn', name: 'Mandarin' },
  { code: 'cmn_en', name: 'Mandarin & English bilingual' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fa', name: 'Persian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sk', name: 'Slovakian' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'es', name: 'Spanish' },
  // Spanish & English bilingual requires domain='bilingual-en' on same 'es' code
  { code: 'sw', name: 'Swahili' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tl', name: 'Tagalog (Filipino)' },
  { code: 'ta', name: 'Tamil' },
  { code: 'en_ta', name: 'Tamil & English bilingual' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ug', name: 'Uyghur' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'cy', name: 'Welsh' },
];

/**
 * Build combined language list for UI with provider preference
 * Preference: Deepgram/Nova when available; else Speechmatics
 * @returns {Array<{code:string,name:string,provider:'nova'|'speechmatics',novaSupport?:string,domain?:string}>}
 */
export const getCombinedLanguagesForUI = () => {
  const novaCodes = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
  const list = [];

  // First add all Nova languages (preferred)
  for (const lang of SUPPORTED_LANGUAGES) {
    list.push({
      code: lang.code,
      name: lang.name,
      provider: 'nova',
      novaSupport: lang.novaSupport,
    });
  }

  // Then add Speechmatics languages not in Nova
  for (const s of SPEECHMATICS_LANGUAGES) {
    if (!novaCodes.has(s.code)) {
      list.push({
        code: s.code,
        name: s.name,
        provider: 'speechmatics',
      });
    }
  }

  return list;
};

/**
 * Determine provider for a language code
 * @param {string} code
 * @returns {'nova'|'speechmatics'|null}
 */
export const getProviderForLanguage = (code) => {
  if (!code) return null;
  const isNova = !!SUPPORTED_LANGUAGES.find((l) => l.code === code);
  if (isNova) return 'nova';
  const isSm = !!SPEECHMATICS_LANGUAGES.find((l) => l.code === code);
  return isSm ? 'speechmatics' : null;
};

/**
 * Check if a language is supported by any provider (Nova or Speechmatics)
 * @param {string} languageCode - Language code to check
 * @returns {boolean} True if supported by any provider, false otherwise
 */
export const isLanguageSupported = (languageCode) => {
  if (!languageCode) return false;
  const provider = getProviderForLanguage(languageCode);
  return provider !== null;
};


