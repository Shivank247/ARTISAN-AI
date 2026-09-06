/**
 * Search Validator
 *
 * Validates the structured search filters produced by the AI.
 *
 * The database must only receive validated filters.
 */

function validateSearchFilters(filters) {
  const errors = [];

  if (!filters || typeof filters !== "object") {
    return {
      valid: false,
      errors: ["Search filters must be an object."]
    };
  }

  // state
  if (
    filters.state !== null &&
    filters.state !== undefined &&
    typeof filters.state !== "string"
  ) {
    errors.push("state must be a string or null.");
  }

  // category
  if (
    filters.category !== null &&
    filters.category !== undefined &&
    typeof filters.category !== "string"
  ) {
    errors.push("category must be a string or null.");
  }

  // keywords
  if (!Array.isArray(filters.keywords)) {
    errors.push("keywords must be an array.");
  } else {
    for (const keyword of filters.keywords) {
      if (typeof keyword !== "string") {
        errors.push("Every keyword must be a string.");
        break;
      }
    }
  }

  // maxPrice
  if (
    filters.maxPrice !== null &&
    filters.maxPrice !== undefined &&
    (
      typeof filters.maxPrice !== "number" ||
      !Number.isFinite(filters.maxPrice) ||
      filters.maxPrice < 0
    )
  ) {
    errors.push("maxPrice must be a non-negative number or null.");
  }

  // minPrice
  if (
    filters.minPrice !== null &&
    filters.minPrice !== undefined &&
    (
      typeof filters.minPrice !== "number" ||
      !Number.isFinite(filters.minPrice) ||
      filters.minPrice < 0
    )
  ) {
    errors.push("minPrice must be a non-negative number or null.");
  }

  // minPrice cannot be greater than maxPrice
  if (
    typeof filters.minPrice === "number" &&
    typeof filters.maxPrice === "number" &&
    filters.minPrice > filters.maxPrice
  ) {
    errors.push("minPrice cannot be greater than maxPrice.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateSearchFilters
};