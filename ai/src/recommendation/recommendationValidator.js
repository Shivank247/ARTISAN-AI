/**
 * ARTISAN AI
 * Recommendation Validator
 *
 * Purpose:
 * - Validate recommendation input.
 * - Validate AI recommendation output.
 * - Prevent hallucinated product IDs.
 * - Prevent duplicate recommendations.
 *
 * This file does NOT:
 * - access PostgreSQL
 * - access Prisma
 * - call an AI provider
 * - create products
 */

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validateRecommendationInput(
  query,
  catalogue,
  limit
) {
  if (
    typeof query !== "string" ||
    query.trim().length === 0
  ) {
    return false;
  }

  if (!Array.isArray(catalogue)) {
    return false;
  }

  if (
    typeof limit !== "number" ||
    !Number.isInteger(limit) ||
    limit < 1
  ) {
    return false;
  }

  const productIds = new Set();

  for (const product of catalogue) {
    if (!isPlainObject(product)) {
      return false;
    }

    if (
      typeof product.id !== "string" ||
      product.id.trim().length === 0
    ) {
      return false;
    }

    if (productIds.has(product.id)) {
      return false;
    }

    productIds.add(product.id);
  }

  return true;
}

function validateRecommendationOutput(
  output,
  catalogue,
  limit
) {
  if (!isPlainObject(output)) {
    return false;
  }

  if (!Array.isArray(output.recommendations)) {
    return false;
  }

  if (output.recommendations.length > limit) {
    return false;
  }

  const catalogueIds = new Set(
    catalogue.map((product) => product.id)
  );

  const recommendationIds = new Set();

  for (const recommendation of output.recommendations) {
    if (!isPlainObject(recommendation)) {
      return false;
    }

    const {
      productId,
      score,
      reason,
    } = recommendation;

    if (
      typeof productId !== "string" ||
      productId.trim().length === 0
    ) {
      return false;
    }

    if (!catalogueIds.has(productId.trim())) {
      return false;
    }

    if (recommendationIds.has(productId.trim())) {
      return false;
    }

    recommendationIds.add(productId.trim());

    if (
      typeof score !== "number" ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 1
    ) {
      return false;
    }

    if (
      typeof reason !== "string" ||
      reason.trim().length === 0
    ) {
      return false;
    }
  }

  return true;
}

function normalizeRecommendationOutput(output) {
  if (!isPlainObject(output)) {
    return null;
  }

  if (!Array.isArray(output.recommendations)) {
    return null;
  }

  return {
    recommendations: output.recommendations.map(
      (recommendation) => ({
        productId: recommendation.productId.trim(),
        score: recommendation.score,
        reason: recommendation.reason.trim(),
      })
    ),
  };
}

module.exports = {
  isPlainObject,
  validateRecommendationInput,
  validateRecommendationOutput,
  normalizeRecommendationOutput,
};