const GeminiProvider = require("../providers/geminiProvider");
const MockProvider = require("../providers/mockProvider");
const { validateProductOutput } = require("../validation/productSchema");
const { generateQuestions } = require("./questionGenerator");

function getProvider() {
  const providerName = process.env.AI_PROVIDER;
  if (providerName === "gemini") {
    return new GeminiProvider(process.env.AI_API_KEY);
  }
  if (providerName === "mock" && process.env.NODE_ENV !== "production") {
    return new MockProvider();
  }
  throw Object.assign(new Error("AI_PROVIDER must be configured as gemini or mock."), { code: "AI_CONFIGURATION_ERROR" });
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
  const normalizedInput = normalizeInput(input);

  let rawOutput;
  try {
    const provider = getProvider();
    rawOutput = await provider.generateProduct(normalizedInput);
  } catch (err) {
    if (err.code === "AI_CONFIGURATION_ERROR") {
      return {
        success: false,
        error: {
          code: err.code,
          message: err.message
        }
      };
    }
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