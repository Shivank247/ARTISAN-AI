const GeminiTranslationProvider = require("../providers/geminiTranslationProvider");
const MockTranslationProvider = require("../providers/mockTranslationProvider");
const {
  validateTranslationInput,
  validateTranslationOutput
} = require("./translationValidation");

function getProvider() {
  const providerName = process.env.TRANSLATION_PROVIDER || process.env.AI_PROVIDER;
  if (providerName === "gemini" && process.env.AI_API_KEY) {
    return new GeminiTranslationProvider(process.env.AI_API_KEY);
  }

  return new MockTranslationProvider();
}

async function translateText(input, provider = getProvider()) {
  try {
    validateTranslationInput(input);
    const result = await provider.translate(input);
    validateTranslationOutput(result);

    return { success: true, data: result };
  } catch (error) {
    console.error("TRANSLATION PROVIDER ERROR:", error);
    return {
      success: false,
      error: {
        code: "TRANSLATION_ERROR",
        message: "We couldn't translate that. Please try again."
      }
    };
  }
}

module.exports = { translateText };