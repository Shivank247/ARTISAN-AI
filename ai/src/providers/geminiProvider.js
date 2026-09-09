/**
 * ARTISAN AI
 * Gemini Shared Provider
 *
 * Provider:
 * Google Gemini
 *
 * This module is the shared Gemini adapter.
 *
 * It:
 * - reads the API key from environment variables
 * - sends structured JSON requests
 * - parses the response
 * - returns JavaScript objects
 *
 * It does NOT:
 * - access PostgreSQL
 * - access Prisma
 * - create products
 * - publish products
 * - decide final artisan prices
 * - expose API keys to the frontend
 */

const {
  GoogleGenAI,
} = require("@google/genai");

const DEFAULT_MODEL = "gemini-2.5-flash";

function getGeminiApiKey() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.AI_API_KEY;

  if (
    typeof apiKey !== "string" ||
    apiKey.trim().length === 0
  ) {
    const error = new Error(
      "Gemini API key is not configured."
    );

    error.code = "GEMINI_API_KEY_MISSING";

    throw error;
  }

  return apiKey.trim();
}

function getGeminiModel() {
  const configuredModel =
    process.env.GEMINI_MODEL;

  if (
    typeof configuredModel === "string" &&
    configuredModel.trim().length > 0
  ) {
    return configuredModel.trim();
  }

  return DEFAULT_MODEL;
}

function cleanJsonText(text) {
  if (typeof text !== "string") {
    return text;
  }

  let cleaned = text.trim();

  /*
   * Gemini may occasionally return JSON inside
   * Markdown code fences. Remove only the fences.
   */
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");
    cleaned = cleaned.trim();
  }

  return cleaned;
}

function parseStructuredJSON(text) {
  if (typeof text !== "string") {
    const error = new Error(
      "AI provider returned a non-text response."
    );

    error.code = "AI_INVALID_RESPONSE";

    throw error;
  }

  const cleaned = cleanJsonText(text);

  if (cleaned.length === 0) {
    const error = new Error(
      "AI provider returned an empty response."
    );

    error.code = "AI_EMPTY_RESPONSE";

    throw error;
  }

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    const error = new Error(
      "AI provider returned invalid JSON."
    );

    error.code = "AI_INVALID_JSON";

    error.cause = parseError;

    throw error;
  }
}

function validateGenerationOptions(options) {
  if (
    !options ||
    typeof options !== "object" ||
    Array.isArray(options)
  ) {
    const error = new Error(
      "AI generation options must be an object."
    );

    error.code = "INVALID_PROVIDER_OPTIONS";

    throw error;
  }

  if (
    typeof options.systemPrompt !== "string" ||
    options.systemPrompt.trim().length === 0
  ) {
    const error = new Error(
      "systemPrompt is required."
    );

    error.code = "INVALID_SYSTEM_PROMPT";

    throw error;
  }

  if (
    typeof options.userPrompt !== "string" ||
    options.userPrompt.trim().length === 0
  ) {
    const error = new Error(
      "userPrompt is required."
    );

    error.code = "INVALID_USER_PROMPT";

    throw error;
  }
}

async function generateGeminiStructuredJSON(options) {
  validateGenerationOptions(options);

  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  const ai = new GoogleGenAI({
    apiKey,
  });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: options.userPrompt,
      config: {
        systemInstruction: options.systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response && response.text;

    return parseStructuredJSON(responseText);
  } catch (error) {
    if (
      error &&
      typeof error.code === "string" &&
      error.code.startsWith("AI_")
    ) {
      throw error;
    }

    const providerError = new Error(
      error && error.message
        ? error.message
        : "Gemini AI provider request failed."
    );

    providerError.code = "GEMINI_PROVIDER_ERROR";
    providerError.cause = error;

    throw providerError;
  }
}

module.exports = {
  DEFAULT_MODEL,
  getGeminiApiKey,
  getGeminiModel,
  cleanJsonText,
  parseStructuredJSON,
  validateGenerationOptions,
  generateGeminiStructuredJSON,
};
