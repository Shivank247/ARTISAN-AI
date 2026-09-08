/**
 * ARTISAN AI
 * Pricing Validator
 *
 * Purpose:
 * - Validate pricing input before sending it to the AI provider.
 * - Validate pricing output before it reaches the backend.
 *
 * This file does NOT:
 * - access PostgreSQL
 * - access Prisma
 * - call external AI providers
 * - store prices
 * - choose the artisan's final price
 */

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isOptionalString(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function validatePricingInput(input) {
  if (!isPlainObject(input)) {
    return false;
  }

  if (!isOptionalString(input.material)) {
    return false;
  }

  if (!isOptionalString(input.category)) {
    return false;
  }

  if (!isOptionalString(input.location)) {
    return false;
  }

  if (!isOptionalString(input.productType)) {
    return false;
  }

  if (
    input.productionTimeDays !== undefined &&
    input.productionTimeDays !== null
  ) {
    if (
      typeof input.productionTimeDays !== "number" ||
      !Number.isFinite(input.productionTimeDays) ||
      input.productionTimeDays < 0
    ) {
      return false;
    }
  }

  if (
    input.productAttributes !== undefined &&
    input.productAttributes !== null
  ) {
    if (!isPlainObject(input.productAttributes)) {
      return false;
    }
  }

  if (
    input.artisanInformation !== undefined &&
    input.artisanInformation !== null
  ) {
    if (!isPlainObject(input.artisanInformation)) {
      return false;
    }
  }

  if (
    input.catalogueContext !== undefined &&
    input.catalogueContext !== null
  ) {
    if (!Array.isArray(input.catalogueContext)) {
      return false;
    }
  }

  return true;
}

function validatePriceRange(priceRange) {
  if (!isPlainObject(priceRange)) {
    return false;
  }

  const { min, max } = priceRange;

  if (
    typeof min !== "number" ||
    !Number.isFinite(min) ||
    min < 0
  ) {
    return false;
  }

  if (
    typeof max !== "number" ||
    !Number.isFinite(max) ||
    max < 0
  ) {
    return false;
  }

  if (min > max) {
    return false;
  }

  return true;
}

function validatePricingRecommendation(recommendation) {
  if (!isPlainObject(recommendation)) {
    return false;
  }

  const {
    suggestedPrice,
    priceRange,
    reason,
    confidence,
  } = recommendation;

  if (
    typeof suggestedPrice !== "number" ||
    !Number.isFinite(suggestedPrice) ||
    suggestedPrice < 0
  ) {
    return false;
  }

  if (!validatePriceRange(priceRange)) {
    return false;
  }

  if (
    typeof reason !== "string" ||
    reason.trim().length === 0
  ) {
    return false;
  }

  if (
    typeof confidence !== "number" ||
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1
  ) {
    return false;
  }

  if (
    suggestedPrice < priceRange.min ||
    suggestedPrice > priceRange.max
  ) {
    return false;
  }

  /*
   * The AI recommendation must never become the artisan's
   * final database price.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      recommendation,
      "finalPrice"
    )
  ) {
    return false;
  }

  return true;
}

module.exports = {
  isPlainObject,
  validatePricingInput,
  validatePriceRange,
  validatePricingRecommendation,
};