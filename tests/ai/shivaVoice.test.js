const assert = require("node:assert/strict");
const test = require("node:test");

const {
  transcribeAudio,
  generateProductFromVoice
} = require("../../ai/src/voice/voiceService");
const { translateText } = require("../../ai/src/translation/translationService");

const validAudio = { audioUrl: "https://example.com/audio.webm" };

test("transcribes Hindi audio", async () => {
  const result = await transcribeAudio({ ...validAudio, language: "hi" }, {
    async transcribe() {
      return { text: "यह मधुबनी पेंटिंग है", language: "hi", confidence: 0.94 };
    }
  });

  assert.deepEqual(result, {
    success: true,
    data: { text: "यह मधुबनी पेंटिंग है", language: "hi", confidence: 0.94 }
  });
});

test("transcribes English audio", async () => {
  const result = await transcribeAudio({ ...validAudio, language: "en" }, {
    async transcribe() {
      return { text: "This is a handmade pot", language: "en", confidence: 0.91 };
    }
  });

  assert.equal(result.success, true);
  assert.equal(result.data.language, "en");
});

test("rejects empty and invalid audio URLs", async () => {
  const empty = await transcribeAudio({ audioUrl: "", language: "en" });
  const invalid = await transcribeAudio({ audioUrl: "not-a-url", language: "en" });

  assert.equal(empty.error.code, "STT_ERROR");
  assert.equal(invalid.error.code, "STT_ERROR");
});

test("rejects audio with no recognized speech", async () => {
  const result = await transcribeAudio({ ...validAudio, language: "en" }, {
    async transcribe() {
      return { text: "", language: "en", confidence: 0 };
    }
  });

  assert.equal(result.error.code, "STT_ERROR");
});

test("rejects unsupported languages", async () => {
  const result = await transcribeAudio({ ...validAudio, language: "fr" });

  assert.deepEqual(result.error.code, "STT_ERROR");
});

test("maps provider failure to STT_ERROR", async () => {
  const result = await transcribeAudio({ ...validAudio, language: "en" }, {
    async transcribe() {
      throw new Error("provider unavailable");
    }
  });

  assert.equal(result.success, false);
  assert.equal(result.error.code, "STT_ERROR");
});

test("rejects invalid provider responses", async () => {
  const result = await transcribeAudio({ ...validAudio, language: "en" }, {
    async transcribe() {
      return { text: "", language: "en", confidence: 2 };
    }
  });

  assert.equal(result.error.code, "STT_ERROR");
});

test("transcript flows into product generation", async () => {
  const result = await generateProductFromVoice({
    ...validAudio,
    language: "en",
    image: "product-image",
    artisanAnswers: { material: "clay" }
  }, {
    async transcribe() {
      return { text: "This is a clay pot", language: "en", confidence: 0.9 };
    }
  });

  assert.equal(result.success, true);
  assert.equal(result.data.title, "Mock Handmade Product");
});

test("translates English text to Hindi", async () => {
  const result = await translateText({
    text: "Traditional handmade painting",
    sourceLanguage: "en",
    targetLanguage: "hi"
  }, {
    async translate(input) {
      return {
        translatedText: "पारंपरिक हस्तनिर्मित चित्रकला",
        sourceLanguage: input.sourceLanguage,
        targetLanguage: input.targetLanguage
      };
    }
  });

  assert.equal(result.success, true);
  assert.equal(result.data.targetLanguage, "hi");
});

test("maps translation provider failure to TRANSLATION_ERROR", async () => {
  const result = await translateText({
    text: "Handmade painting",
    sourceLanguage: "en",
    targetLanguage: "hi"
  }, {
    async translate() {
      throw new Error("provider unavailable");
    }
  });

  assert.equal(result.error.code, "TRANSLATION_ERROR");
});

test("rejects invalid translation responses", async () => {
  const result = await translateText({
    text: "Handmade painting",
    sourceLanguage: "en",
    targetLanguage: "hi"
  }, {
    async translate() {
      return { translatedText: "", sourceLanguage: "en", targetLanguage: "hi" };
    }
  });

  assert.equal(result.error.code, "TRANSLATION_ERROR");
});