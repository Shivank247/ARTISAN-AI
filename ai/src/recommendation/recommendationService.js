/**
 * ARTISAN AI
 * Recommendation Service
 *
 * Ownership:
 * Shivani — AI Search + Pricing
 *
 * Status:
 * P2 / If time permits
 *
 * Architecture:
 *
 * Customer query
 *      ↓
 * Input validation
 *      ↓
 * Supplied catalogue
 *      ↓
 * Shared AI provider
 *      ↓
 * Output validation
 *      ↓
 * Existing product IDs
 *
 * IMPORTANT:
 * - No PostgreSQL.
 * - No Prisma.
 * - No database access.
 * - No product creation.
 * - No fake product IDs.
 * - No duplicate AI provider.
 */

const {
  RECOMMENDATION_SYSTEM_PROMPT,
  buildRecommendationUserPrompt,
} = require("./recommendationPrompt");

const {
  validateRecommendationInput,
  validateRecommendationOutput,
  normalizeRecommendationOutput,
} = require("./recommendationValidator");

function createRecommendationError(
  code,
  message
) {
  return {
    success: false,
    error: {
      code,
      message,
    },
    recommendations: [],
  };
}

function validateProvider(provider) {
  return (
    provider &&
    typeof provider.generateStructuredJSON === "function"
  );
}

async function getRecommendations(
  provider,
  query,
  catalogue,
  limit = 5
) {
  if (!validateProvider(provider)) {
    return createRecommendationError(
      "INVALID_PROVIDER",
      "A valid shared AI provider is required."
    );
  }

  if (
    !validateRecommendationInput(
      query,
      catalogue,
      limit
    )
  ) {
    return createRecommendationError(
      "INVALID_RECOMMENDATION_INPUT",
      "Invalid recommendation input."
    );
  }

  /*
   * Empty catalogue means there is nothing valid to recommend.
   * This avoids unnecessary AI calls and guarantees that no
   * product can be invented.
   */
  if (catalogue.length === 0) {
    return {
      success: true,
      recommendations: [],
    };
  }

  /*
   * Copy the catalogue array so this service does not mutate
   * the caller's array.
   */
  const catalogueSnapshot = catalogue.map(
    (product) => product
  );

  let rawOutput;

  try {
    rawOutput =
      await provider.generateStructuredJSON({
        systemPrompt:
          RECOMMENDATION_SYSTEM_PROMPT,

        userPrompt:
          buildRecommendationUserPrompt(
            query,
            catalogueSnapshot,
            limit
          ),

        input: {
          query,
          catalogue: catalogueSnapshot,
          limit,
        },
      });
  } catch (error) {
    /*
     * Preserve known provider errors.
     */
    if (
      error &&
      typeof error.code === "string"
    ) {
      return createRecommendationError(
        error.code,
        error.message ||
          "AI recommendation is temporarily unavailable."
      );
    }

    return createRecommendationError(
      "AI_PROVIDER_ERROR",
      "AI recommendation is temporarily unavailable."
    );
  }

  /*
   * Critical anti-hallucination barrier.
   *
   * The AI output is accepted only if every productId
   * exists in the supplied catalogue.
   */
  if (
    !validateRecommendationOutput(
      rawOutput,
      catalogueSnapshot,
      limit
    )
  ) {
    return createRecommendationError(
      "INVALID_AI_RECOMMENDATION_OUTPUT",
      "AI returned an invalid recommendation."
    );
  }

  const normalized =
    normalizeRecommendationOutput(
      rawOutput
    );

  if (!normalized) {
    return createRecommendationError(
      "INVALID_AI_RECOMMENDATION_OUTPUT",
      "AI returned an invalid recommendation."
    );
  }

  return {
    success: true,
    recommendations:
      normalized.recommendations,
  };
}

module.exports = {
  getRecommendations,
  createRecommendationError,
  validateProvider,
};
