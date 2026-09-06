/**
 * Search Validator
 *
 * Validates structured search filters produced by:
 * 1. AI-based search interpretation
 * 2. Deterministic parser fallback
 *
 * IMPORTANT:
 * - This file validates filters only.
 * - It does NOT search the database.
 * - It does NOT create products.
 * - It does NOT call an AI provider.
 */

function validateSearchFilters(
  filters
) {
  const errors = [];

  /*
   * ============================================================
   * FILTER OBJECT
   * ============================================================
   */

  if (
    !filters ||
    typeof filters !== "object" ||
    Array.isArray(filters)
  ) {
    return {
      valid: false,
      errors: [
        "Search filters must be an object."
      ]
    };
  }

  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  if (
    filters.state !== null &&
    filters.state !== undefined
  ) {
    if (
      typeof filters.state !==
      "string"
    ) {
      errors.push(
        "state must be a string or null."
      );
    } else if (
      filters.state.trim().length === 0
    ) {
      errors.push(
        "state cannot be an empty string."
      );
    }
  }

  /*
   * ============================================================
   * CATEGORY
   * ============================================================
   */

  if (
    filters.category !== null &&
    filters.category !== undefined
  ) {
    if (
      typeof filters.category !==
      "string"
    ) {
      errors.push(
        "category must be a string or null."
      );
    } else if (
      filters.category.trim().length === 0
    ) {
      errors.push(
        "category cannot be an empty string."
      );
    }
  }

  /*
   * ============================================================
   * KEYWORDS
   * ============================================================
   */

  if (
    !Array.isArray(
      filters.keywords
    )
  ) {
    errors.push(
      "keywords must be an array."
    );
  } else {
    for (
      const keyword of
        filters.keywords
    ) {
      if (
        typeof keyword !== "string"
      ) {
        errors.push(
          "Every keyword must be a string."
        );
        break;
      }

      if (
        keyword.trim().length === 0
      ) {
        errors.push(
          "Keywords cannot contain empty strings."
        );
        break;
      }
    }
  }

  /*
   * ============================================================
   * MAX PRICE
   * ============================================================
   */

  if (
    filters.maxPrice !== null &&
    filters.maxPrice !== undefined
  ) {
    if (
      typeof filters.maxPrice !==
        "number" ||
      !Number.isFinite(
        filters.maxPrice
      ) ||
      filters.maxPrice < 0
    ) {
      errors.push(
        "maxPrice must be a non-negative number or null."
      );
    }
  }

  /*
   * ============================================================
   * MIN PRICE
   * ============================================================
   */

  if (
    filters.minPrice !== null &&
    filters.minPrice !== undefined
  ) {
    if (
      typeof filters.minPrice !==
        "number" ||
      !Number.isFinite(
        filters.minPrice
      ) ||
      filters.minPrice < 0
    ) {
      errors.push(
        "minPrice must be a non-negative number or null."
      );
    }
  }

  /*
   * ============================================================
   * PRICE RANGE
   * ============================================================
   */

  if (
    typeof filters.minPrice ===
      "number" &&
    typeof filters.maxPrice ===
      "number" &&
    filters.minPrice >
      filters.maxPrice
  ) {
    errors.push(
      "minPrice cannot be greater than maxPrice."
    );
  }

  /*
   * ============================================================
   * RESULT
   * ============================================================
   */

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateSearchFilters
};