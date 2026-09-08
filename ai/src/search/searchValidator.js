/**
 * ARTISAN AI
 * Search Validator
 *
 * Validates structured search filters.
 *
 * This module does not access the database.
 */

function isNullableString(value) {
  return (
    value === undefined ||
    value === null ||
    (
      typeof value === "string" &&
      value.trim().length > 0
    )
  );
}

function validateSearchFilters(filters) {
  if (
    !filters ||
    typeof filters !== "object" ||
    Array.isArray(filters)
  ) {
    return false;
  }

  const {
    state,
    category,
    minPrice,
    maxPrice,
    keywords,
  } = filters;

  if (!isNullableString(state)) {
    return false;
  }

  if (!isNullableString(category)) {
    return false;
  }

  if (
    minPrice !== undefined &&
    minPrice !== null
  ) {
    if (
      typeof minPrice !== "number" ||
      !Number.isFinite(minPrice) ||
      minPrice < 0
    ) {
      return false;
    }
  }

  if (
    maxPrice !== undefined &&
    maxPrice !== null
  ) {
    if (
      typeof maxPrice !== "number" ||
      !Number.isFinite(maxPrice) ||
      maxPrice < 0
    ) {
      return false;
    }
  }

  if (
    minPrice !== undefined &&
    minPrice !== null &&
    maxPrice !== undefined &&
    maxPrice !== null &&
    minPrice > maxPrice
  ) {
    return false;
  }

  if (!Array.isArray(keywords)) {
    return false;
  }

  const normalizedKeywords = new Set();

  for (const keyword of keywords) {
    if (
      typeof keyword !== "string" ||
      keyword.trim().length === 0
    ) {
      return false;
    }

    const normalized =
      keyword.trim().toLowerCase();

    if (normalizedKeywords.has(normalized)) {
      return false;
    }

    normalizedKeywords.add(normalized);
  }

  return true;
}

function normalizeSearchFilters(filters) {
  if (!validateSearchFilters(filters)) {
    return null;
  }

  return {
    state:
      filters.state === undefined ||
      filters.state === null
        ? null
        : filters.state.trim(),

    category:
      filters.category === undefined ||
      filters.category === null
        ? null
        : filters.category.trim(),

    minPrice:
      filters.minPrice === undefined ||
      filters.minPrice === null
        ? null
        : filters.minPrice,

    maxPrice:
      filters.maxPrice === undefined ||
      filters.maxPrice === null
        ? null
        : filters.maxPrice,

    keywords: filters.keywords.map(
      (keyword) => keyword.trim().toLowerCase()
    ),
  };
}

module.exports = {
  validateSearchFilters,
  normalizeSearchFilters,
};