/**
 * ARTISAN AI
 * Shared AI Provider Factory
 *
 * Shared layer:
 * ai/src/providers/
 *
 * Primary coordinator:
 * Suraj
 *
 * Used by:
 * - Core AI
 * - Voice/translation
 * - Search
 * - Pricing
 *
 * IMPORTANT:
 * - Do not create another provider architecture.
 * - Provider credentials remain server-side.
 * - AI providers never access PostgreSQL directly.
 */

const {
  generateGeminiStructuredJSON,
} = require("./geminiProvider");

function getProviderName() {
  return (
    process.env.AI_PROVIDER ||
    "gemini"
  ).trim().toLowerCase();
}

function createMockProvider() {
  return {
    async generateStructuredJSON() {
      const error = new Error(
        "Mock AI provider is not implemented for production AI generation."
      );

      error.code = "AI_MOCK_NOT_IMPLEMENTED";

      throw error;
    },
  };
}

function createGeminiProvider() {
  return {
    async generateStructuredJSON(options) {
      return generateGeminiStructuredJSON(options);
    },
  };
}

function createAIProvider(providerName = getProviderName()) {
  const name = String(providerName)
    .trim()
    .toLowerCase();

  switch (name) {
    case "gemini":
      return createGeminiProvider();

    case "mock":
      return createMockProvider();

    default: {
      const error = new Error(
        `Unsupported AI provider: ${name}`
      );

      error.code = "UNSUPPORTED_AI_PROVIDER";

      throw error;
    }
  }
}

const aiProvider = createAIProvider();

module.exports = {
  createAIProvider,
  createGeminiProvider,
  createMockProvider,
  getProviderName,
  aiProvider,
};