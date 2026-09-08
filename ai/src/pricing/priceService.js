/**
 * ARTISAN AI
 * Pricing Service
 *
 * Ownership:
 * Shivani — AI Search + Pricing
 *
 * Architecture:
 *
 * Input
 *   ↓
 * Pricing validation
 *   ↓
 * Shared AI provider
 *   ↓
 * Structured JSON
 *   ↓
 * Recommendation validation
 *   ↓
 * Advisory recommendation
 *
 * IMPORTANT:
 * - No PostgreSQL.
 * - No Prisma.
 * - No direct database access.
 * - No finalPrice.
 * - No product publishing.
 * - Artisan decides the final price.
 */

const {
  PRICE_SYSTEM_PROMPT,
  buildPriceUserPrompt,
} = require("./pricePrompt");

const {
  validatePricingInput,
  validatePricingRecommendation,
} = require("./priceValidator");

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

function validateProvider(provider) {
  return (
    provider &&
    typeof provider.generateStructuredJSON === "function"
  );
}

async function getPriceRecommendation(provider, input) {
  if (!validateProvider(provider)) {
    return createPricingError(
      "INVALID_PROVIDER",
      "A valid shared AI provider is required."
    );
  }

  if (!validatePricingInput(input)) {
    return createPricingError(
      "INVALID_PRICING_INPUT",
      "Invalid pricing input."
    );
  }

  let rawRecommendation;

  try {
    rawRecommendation = await provider.generateStructuredJSON({
      systemPrompt: PRICE_SYSTEM_PROMPT,
      userPrompt: buildPriceUserPrompt(input),
      input,
    });
  } catch (error) {
    return createPricingError(
      error && error.code
        ? error.code
        : "AI_PROVIDER_ERROR",
      error && error.message
        ? error.message
        : "AI price recommendation is temporarily unavailable. Please enter or review the price manually."
    );
  }

  if (!validatePricingRecommendation(rawRecommendation)) {
    return createPricingError(
      "INVALID_AI_PRICING_OUTPUT",
      "AI returned an invalid pricing recommendation."
    );
  }

  /*
   * Return only the advisory recommendation.
   *
   * The backend is responsible for storing the artisan-approved
   * final price.
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
  getPriceRecommendation,
  createPricingError,
  validateProvider,
};