const SUPPORTED_LANGUAGES = new Set(["en", "hi"]);

function validateVoiceInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Voice input is required");
  }

  if (typeof input.audioUrl !== "string" || !input.audioUrl.trim()) {
    throw new Error("audioUrl is required");
  }

  try {
    new URL(input.audioUrl);
  } catch (error) {
    throw new Error("audioUrl must be a valid URL");
  }

  if (!SUPPORTED_LANGUAGES.has(input.language)) {
    throw new Error("Unsupported language");
  }
}

function validateVoiceOutput(output) {
  if (!output || typeof output.text !== "string" || !output.text.trim()) {
    throw new Error("Speech recognition returned invalid text");
  }

  if (!SUPPORTED_LANGUAGES.has(output.language)) {
    throw new Error("Speech recognition returned invalid language");
  }

  if (typeof output.confidence !== "number" || output.confidence < 0 || output.confidence > 1) {
    throw new Error("Speech recognition returned invalid confidence");
  }
}

module.exports = { validateVoiceInput, validateVoiceOutput };