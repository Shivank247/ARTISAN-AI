function normalizeVoiceInput(input = {}) {
  const trimmed = typeof input.audio === "string" ? input.audio.trim() : input.audio;
  const language = typeof input.language === "string" ? input.language.toLowerCase() : "en";

  if (!trimmed) {
    return {
      success: false,
      error: {
        code: "NO_AUDIO",
        message: "No audio was provided for transcription."
      }
    };
  }

  return {
    success: true,
    data: {
      audio: trimmed,
      language
    }
  };
}

async function transcribeAudio(input = {}) {
  const normalized = normalizeVoiceInput(input);
  if (!normalized.success) {
    return normalized;
  }

  return {
    success: false,
    error: {
      code: "STT_UNAVAILABLE",
      message: "Speech transcription is not configured."
    }
  };
}

module.exports = { transcribeAudio, normalizeVoiceInput };
