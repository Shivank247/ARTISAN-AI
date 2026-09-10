function normalizeLanguageCode(language) {
  if (!language || typeof language !== "string") return "en";
  const normalized = language.trim().toLowerCase();
  if (normalized === "hi" || normalized === "hindi") return "hi";
  return normalized.startsWith("en") ? "en" : normalized;
}

async function translateText({ text, sourceLanguage, targetLanguage }) {
  const source = normalizeLanguageCode(sourceLanguage);
  const target = normalizeLanguageCode(targetLanguage);

  if (typeof text !== "string" || !text.trim()) {
    return {
      success: false,
      error: {
        code: "INVALID_TEXT",
        message: "Text to translate is required."
      }
    };
  }

  if (source === target) {
    return {
      success: true,
      data: {
        translatedText: text.trim(),
        sourceLanguage: source,
        targetLanguage: target
      }
    };
  }

  return {
    success: true,
    data: {
      translatedText: `[translated:${source}->${target}] ${text.trim()}`,
      sourceLanguage: source,
      targetLanguage: target
    }
  };
}

module.exports = { translateText, normalizeLanguageCode };
