const GeminiProvider = require("../providers/geminiProvider");
const MockProvider = require("../providers/mockProvider");
const { validateProductOutput } = require("../validation/productSchema");
const { generateQuestions } = require("./questionGenerator");

function getProvider() {
  const providerName = process.env.AI_PROVIDER;
  if (providerName === "gemini") {
    return new GeminiProvider(process.env.AI_API_KEY);
  }
  return new MockProvider();
}

function normalizeInput(input = {}) {
  const artisanAnswers = input.artisanAnswers && typeof input.artisanAnswers === "object"
    ? input.artisanAnswers
    : {};

  return {
    image: input.image || null,
    transcript: typeof input.transcript === "string" ? input.transcript.trim() : "",
    language: typeof input.language === "string" ? input.language.toLowerCase() : "en",
    artisanAnswers
  };
}

async function generateProduct(input) {
  const provider = getProvider();
  const normalizedInput = normalizeInput(input);

  let rawOutput;
  try {
    rawOutput = await provider.generateProduct(normalizedInput);
  } catch (err) {
    console.error("AI PROVIDER ERROR:", err);
    return {
      success: false,
      error: {
        code: "AI_SERVICE_UNAVAILABLE",
        message: "AI service is temporarily unavailable. Please try again."
      }
    };
  }

  if (!rawOutput || typeof rawOutput !== "object") {
    return {
      success: false,
      error: {
        code: "AI_INVALID_OUTPUT",
        message: "AI returned an invalid response."
      }
    };
  }

  const validation = validateProductOutput(rawOutput);
  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: "AI_INVALID_OUTPUT",
        message: "AI returned an invalid response.",
        details: validation.errors
      }
    };
  }

  const questions = generateQuestions(validation.data);
  return { success: true, data: validation.data, questions };
}

module.exports = { generateProduct };