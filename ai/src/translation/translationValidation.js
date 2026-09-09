const SUPPORTED_LANGUAGES = new Set(["en", "hi"]);

function validateTranslationInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Translation input is required");
  }

  if (typeof input.text !== "string" || !input.text.trim()) {
    throw new Error("text is required");
  }

  if (!SUPPORTED_LANGUAGES.has(input.sourceLanguage) || !SUPPORTED_LANGUAGES.has(input.targetLanguage)) {
    throw new Error("Unsupported language");
  }

  if (input.sourceLanguage === input.targetLanguage) {
    throw new Error("Source and target languages must differ");
  }
}

function validateTranslationOutput(output) {
  if (!output || typeof output.translatedText !== "string" || !output.translatedText.trim()) {
    throw new Error("Translation returned invalid text");
  }

  if (!SUPPORTED_LANGUAGES.has(output.sourceLanguage) || !SUPPORTED_LANGUAGES.has(output.targetLanguage)) {
    throw new Error("Translation returned invalid language");
  }
}

module.exports = { validateTranslationInput, validateTranslationOutput };