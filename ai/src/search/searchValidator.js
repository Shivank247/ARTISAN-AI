/**
 * ARTISAN AI
 * Search Validator
 *
 * Purpose:
 * Validate structured search filters before they are consumed
 * by the backend or search service.
 *
 * IMPORTANT:
 * - No PostgreSQL access.
 * - No Prisma access.
 * - No database access.
 * - No product creation.
 * - No product IDs.
 * - No fake products.
 *
 * Canonical state/category values are enforced here so that
 * arbitrary AI-generated values cannot silently become filters.
 */

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const PRODUCT_CATEGORIES = [
  "textiles",
  "jewelry",
  "pottery",
  "woodwork",
  "metalwork",
  "painting",
  "handicrafts",
  "home decor",
  "accessories",
];

const SEARCH_FILTER_KEYS = [
  "state",
  "category",
  "minPrice",
  "maxPrice",
  "keywords",
];

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isNullableString(value) {
  return (
    value === null ||
    value === undefined ||
    (
      typeof value === "string" &&
      value.trim().length > 0
    )
  );
}

function findCanonicalValue(value, allowedValues) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return (
    allowedValues.find(
      (allowedValue) =>
        allowedValue.toLowerCase() === normalized
    ) || null
  );
}

/**
 * Strict validation.
 *
 * Reversed ranges are intentionally rejected here.
 * A normalization layer must run BEFORE this validator.
 */
function validateSearchFilters(filters) {
  if (!isPlainObject(filters)) {
    return false;
  }

  const actualKeys = Object.keys(filters).sort();
  const expectedKeys = [...SEARCH_FILTER_KEYS].sort();

  if (
    JSON.stringify(actualKeys) !==
    JSON.stringify(expectedKeys)
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

  /*
   * STATE
   */
  if (!isNullableString(state)) {
    return false;
  }

  if (
    state !== null &&
    state !== undefined &&
    !INDIAN_STATES.includes(state)
  ) {
    return false;
  }

  /*
   * CATEGORY
   */
  if (!isNullableString(category)) {
    return false;
  }

  if (
    category !== null &&
    category !== undefined &&
    !PRODUCT_CATEGORIES.includes(category)
  ) {
    return false;
  }

  /*
   * MIN PRICE
   */
  if (
    minPrice !== null &&
    minPrice !== undefined
  ) {
    if (
      typeof minPrice !== "number" ||
      !Number.isFinite(minPrice) ||
      minPrice < 0
    ) {
      return false;
    }
  }

  /*
   * MAX PRICE
   */
  if (
    maxPrice !== null &&
    maxPrice !== undefined
  ) {
    if (
      typeof maxPrice !== "number" ||
      !Number.isFinite(maxPrice) ||
      maxPrice < 0
    ) {
      return false;
    }
  }

  /*
   * PRICE ORDER
   *
   * At this point the values must already be normalized.
   */
  if (
    minPrice !== null &&
    minPrice !== undefined &&
    maxPrice !== null &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    return false;
  }

  /*
   * KEYWORDS
   */
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

    const normalizedKeyword =
      keyword.trim().toLowerCase();

    if (
      normalizedKeywords.has(normalizedKeyword)
    ) {
      return false;
    }

    normalizedKeywords.add(normalizedKeyword);
  }

  return true;
}

/**
 * Normalize AI output before strict validation.
 *
 * Responsibilities:
 * - canonicalize state
 * - canonicalize category
 * - normalize reversed price ranges
 * - normalize keywords
 *
 * This is the single normalization step between
 * untrusted AI output and strict validation.
 */
function normalizeSearchFilters(filters) {
  if (!isPlainObject(filters)) {
    return null;
  }

  const actualKeys = Object.keys(filters).sort();
  const expectedKeys = [...SEARCH_FILTER_KEYS].sort();

  /*
   * Reject unexpected AI fields such as:
   * productIds
   * products
   */
  if (
    JSON.stringify(actualKeys) !==
    JSON.stringify(expectedKeys)
  ) {
    return null;
  }

  const {
    state,
    category,
    minPrice,
    maxPrice,
    keywords,
  } = filters;

  if (!isNullableString(state)) {
    return null;
  }

  if (!isNullableString(category)) {
    return null;
  }

  if (!Array.isArray(keywords)) {
    return null;
  }

  const normalizedState =
    findCanonicalValue(
      state,
      INDIAN_STATES
    );

  if (
    state !== null &&
    state !== undefined &&
    normalizedState === null
  ) {
    return null;
  }

  const normalizedCategory =
    findCanonicalValue(
      category,
      PRODUCT_CATEGORIES
    );

  if (
    category !== null &&
    category !== undefined &&
    normalizedCategory === null
  ) {
    return null;
  }

  let normalizedMinPrice =
    minPrice === undefined ||
    minPrice === null
      ? null
      : minPrice;

  let normalizedMaxPrice =
    maxPrice === undefined ||
    maxPrice === null
      ? null
      : maxPrice;

  if (
    normalizedMinPrice !== null &&
    (
      typeof normalizedMinPrice !== "number" ||
      !Number.isFinite(normalizedMinPrice) ||
      normalizedMinPrice < 0
    )
  ) {
    return null;
  }

  if (
    normalizedMaxPrice !== null &&
    (
      typeof normalizedMaxPrice !== "number" ||
      !Number.isFinite(normalizedMaxPrice) ||
      normalizedMaxPrice < 0
    )
  ) {
    return null;
  }

  /*
   * Normalize reversed range.
   *
   * Example:
   * minPrice = 1500
   * maxPrice = 500
   *
   * becomes:
   * minPrice = 500
   * maxPrice = 1500
   */
  if (
    normalizedMinPrice !== null &&
    normalizedMaxPrice !== null &&
    normalizedMinPrice > normalizedMaxPrice
  ) {
    const temporary =
      normalizedMinPrice;

    normalizedMinPrice =
      normalizedMaxPrice;

    normalizedMaxPrice =
      temporary;
  }

  const normalizedKeywords = [];

  for (const keyword of keywords) {
    if (
      typeof keyword !== "string" ||
      keyword.trim().length === 0
    ) {
      return null;
    }

    const normalizedKeyword =
      keyword.trim().toLowerCase();

    if (
      normalizedKeywords.includes(
        normalizedKeyword
      )
    ) {
      return null;
    }

    normalizedKeywords.push(
      normalizedKeyword
    );
  }

  const normalizedFilters = {
    state: normalizedState,
    category: normalizedCategory,
    minPrice: normalizedMinPrice,
    maxPrice: normalizedMaxPrice,
    keywords: normalizedKeywords,
  };

  if (
    !validateSearchFilters(
      normalizedFilters
    )
  ) {
    return null;
  }

  return normalizedFilters;
}

module.exports = {
  INDIAN_STATES,
  PRODUCT_CATEGORIES,
  SEARCH_FILTER_KEYS,
  isPlainObject,
  validateSearchFilters,
  normalizeSearchFilters,
};
