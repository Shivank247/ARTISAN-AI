/**
 * ARTISAN AI
 * Price Recommendation Service
 *
 * Responsibility:
 * - Validate pricing input
 * - Request a structured recommendation from the shared AI provider
 * - Validate the AI recommendation
 * - Return an advisory recommendation to the backend
 *
 * IMPORTANT:
 * - This service does NOT access PostgreSQL or Prisma.
 * - This service does NOT decide the artisan's final price.
 * - This service does NOT store prices.
 * - This service must use the shared AI provider supplied by the caller.
 *
 * Integration flow:
 *
 * Product information
 *   ↓
 * priceService
 *   ↓
 * shared AI provider
 *   ↓
 * structured recommendation
 *   ↓
 * validation
 *   ↓
 * artisan reviews recommendation
 *   ↓
 * artisan chooses final price
 *   ↓
 * Mayank's backend/controller stores the artisan-approved final price
 *
 * The backend/controller is responsible for mapping this internal
 * recommendation structure to the locked API response contract.
 */

const {
  validatePricingInput,
  validatePricingRecommendation,
} = require("./priceValidator");

/**
 * Create a controlled pricing-service error.
 */
function createPricingError(code, message) {
  return {
    success: false,
    error: {
      code,
      message,
    },
    recommendation: null,
    artisanDecidesFinalPrice: true,
  };
}

/**
 * Generate an AI-assisted price recommendation.
 *
 * @param {Object} input
 * @param {Object} provider
 * @returns {Promise<Object>}
 */
async function generatePriceRecommendation(input, provider) {
  /**
   * Validate provider before doing any AI work.
   */
  if (
    !provider ||
    typeof provider.generateStructuredJSON !== "function"
  ) {
    return createPricingError(
      "INVALID_PROVIDER",
      "AI price recommendation is temporarily unavailable. Please enter or review the price manually."
    );
  }

  /**
   * Validate pricing input.
   */
  if (!validatePricingInput(input)) {
    return createPricingError(
      "INVALID_PRICING_INPUT",
      "Invalid pricing input."
    );
  }

  /**
   * Keep the AI prompt construction local to the pricing feature.
   *
   * The provider itself remains shared across AI features.
   */
  const {
    buildPricingSystemPrompt,
    buildPricingUserPrompt,
  } = require("./pricePrompt");

  const systemPrompt = buildPricingSystemPrompt();
  const userPrompt = buildPricingUserPrompt(input);

  let rawRecommendation;

  try {
    rawRecommendation =
      await provider.generateStructuredJSON({
        systemPrompt,
        userPrompt,
        input,
      });
  } catch (error) {
    return createPricingError(
      error && error.code
        ? error.code
        : "PROVIDER_ERROR",
      "AI price recommendation is temporarily unavailable. Please enter or review the price manually."
    );
  }

  /**
   * Validate the AI-generated recommendation before
   * returning it to the backend.
   */
  if (!validatePricingRecommendation(rawRecommendation)) {
    return createPricingError(
      "INVALID_AI_RESPONSE",
      "AI price recommendation is temporarily unavailable. Please enter or review the price manually."
    );
  }

  /**
   * AI remains advisory.
   *
   * There is intentionally NO finalPrice here.
   */
  return {
    success: true,
    recommendation: {
      suggestedPrice: rawRecommendation.suggestedPrice,
      priceRange: {
        min: rawRecommendation.priceRange.min,
        max: rawRecommendation.priceRange.max,
      },
      reason: rawRecommendation.reason.trim(),
      confidence: rawRecommendation.confidence,
    },
    isRecommendation: true,
    artisanDecidesFinalPrice: true,
  };
}

module.exports = {
  generatePriceRecommendation,
  createPricingError,
};