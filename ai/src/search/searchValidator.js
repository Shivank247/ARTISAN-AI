/**
 * Search Validator
 *
 * Validates structured search filters.
 *
 * IMPORTANT:
 * - This validator does NOT access the database.
 * - This validator does NOT create products.
 * - This validator does NOT interpret natural language.
 */

function validateSearchFilters(filters) {
  const errors = [];

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
   * State
   */
  if (
    filters.state !== null &&
    filters.state !== undefined
  ) {
    if (
      typeof filters.state !== "string" ||
      filters.state.trim() === ""
    ) {
      errors.push(
        "State must be a non-empty string or null."
      );
    }
  }

  /*
   * Category
   */
  if (
    filters.category !== null &&
    filters.category !== undefined
  ) {
    if (
      typeof filters.category !== "string" ||
      filters.category.trim() === ""
    ) {
      errors.push(
        "Category must be a non-empty string or null."
      );
    }
  }

  /*
   * Keywords
   */
  if (
    !Array.isArray(filters.keywords)
  ) {
    errors.push(
      "Keywords must be an array."
    );
  } else {
    filters.keywords.forEach(
      (keyword, index) => {
        if (
          typeof keyword !== "string" ||
          keyword.trim() === ""
        ) {
          errors.push(
            `Keyword at index ${index} must be a non-empty string.`
          );
        }
      }
    );
  }

  /*
   * Minimum price
   */
  if (
    filters.minPrice !== null &&
    filters.minPrice !== undefined
  ) {
    if (
      typeof filters.minPrice !== "number" ||
      !Number.isFinite(filters.minPrice) ||
      filters.minPrice < 0
    ) {
      errors.push(
        "Minimum price must be a finite non-negative number or null."
      );
    }
  }

  /*
   * Maximum price
   */
  if (
    filters.maxPrice !== null &&
    filters.maxPrice !== undefined
  ) {
    if (
      typeof filters.maxPrice !== "number" ||
      !Number.isFinite(filters.maxPrice) ||
      filters.maxPrice < 0
    ) {
      errors.push(
        "Maximum price must be a finite non-negative number or null."
      );
    }
  }

  /*
   * Price range
   */
  if (
    typeof filters.minPrice === "number" &&
    typeof filters.maxPrice === "number" &&
    filters.minPrice > filters.maxPrice
  ) {
    errors.push(
      "Minimum price cannot be greater than maximum price."
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export {
  validateSearchFilters
};