/**
 * Search Parser
 *
 * Deterministic parser for natural-language search queries.
 *
 * IMPORTANT:
 * - This parser does NOT access the database.
 * - This parser does NOT create products.
 * - This parser does NOT call an AI provider.
 * - It can be used as a deterministic/fallback layer
 *   when AI interpretation is unavailable.
 */

const STOP_WORDS = new Set([
  "show",
  "me",
  "find",
  "give",
  "get",
  "want",
  "need",
  "some",
  "the",
  "a",
  "an",
  "from",
  "in",
  "under",
  "below",
  "above",
  "over",
  "between",
  "and",
  "to",
  "with",
  "for",
  "of",
  "on",
  "please",
  "products",
  "product",
  "items",
  "item"
]);

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
  "West Bengal"
];

const PRODUCT_CATEGORIES = [
  "painting",
  "pottery",
  "textile",
  "jewellery",
  "jewelry",
  "handicraft",
  "handicrafts",
  "woodwork",
  "basket",
  "baskets",
  "ceramic",
  "clothing",
  "decor",
  "decoration",
  "home decor",
  "craft",
  "crafts"
];

/**
 * Normalize user query.
 *
 * Currency commas are removed so values such as
 * ₹1,000 become 1000 before price parsing.
 */
function normalizeQuery(query) {
  if (typeof query !== "string") {
    return "";
  }

  return query
    .toLowerCase()
    .replace(/[₹,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Escape special regex characters.
 */
function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

/**
 * Extract price filters.
 *
 * Supported examples:
 * - under ₹1000
 * - below ₹1000
 * - less than ₹1000
 * - up to ₹1000
 * - above ₹500
 * - over ₹500
 * - more than ₹500
 * - between ₹500 and ₹1000
 * - from ₹500 to ₹1000
 *
 * normalizeQuery() removes the ₹ symbol and
 * thousands separators before these expressions
 * are evaluated.
 */
function extractPriceFilters(query) {
  const normalized = normalizeQuery(query);

  const filters = {
    minPrice: null,
    maxPrice: null
  };

  /**
   * Between X and Y / From X to Y
   */
  const betweenMatch = normalized.match(
    /(?:between|from)\s+(?:rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s+(?:and|to|-)\s+(?:rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i
  );

  if (betweenMatch) {
    const first = Number(
      betweenMatch[1]
    );

    const second = Number(
      betweenMatch[2]
    );

    filters.minPrice = Math.min(
      first,
      second
    );

    filters.maxPrice = Math.max(
      first,
      second
    );

    return filters;
  }

  /**
   * Maximum price
   */
  const maxMatch = normalized.match(
    /(?:under|below|less than|up to|upto)\s+(?:rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i
  );

  if (maxMatch) {
    filters.maxPrice = Number(
      maxMatch[1]
    );
  }

  /**
   * Minimum price
   */
  const minMatch = normalized.match(
    /(?:over|above|more than)\s+(?:rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i
  );

  if (minMatch) {
    filters.minPrice = Number(
      minMatch[1]
    );
  }

  return filters;
}

/**
 * Extract an Indian state.
 *
 * Multi-word states are matched as complete phrases.
 */
function extractState(query) {
  const normalized = normalizeQuery(query);

  /**
   * Longest states first.
   *
   * This ensures multi-word states are considered
   * before shorter possibilities.
   */
  const states = [
    ...INDIAN_STATES
  ].sort(
    (a, b) => b.length - a.length
  );

  for (const state of states) {
    const stateRegex = new RegExp(
      `\\b${escapeRegExp(
        state.toLowerCase()
      )}\\b`,
      "i"
    );

    if (
      stateRegex.test(normalized)
    ) {
      return state;
    }
  }

  return null;
}

/**
 * Remove complete Indian state phrases
 * before extracting keywords.
 */
function removeStateFromQuery(query) {
  let result = normalizeQuery(query);

  const states = [
    ...INDIAN_STATES
  ].sort(
    (a, b) => b.length - a.length
  );

  for (const state of states) {
    const stateRegex = new RegExp(
      `\\b${escapeRegExp(
        state.toLowerCase()
      )}\\b`,
      "gi"
    );

    result = result.replace(
      stateRegex,
      " "
    );
  }

  return result
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract product category.
 */
function extractCategory(query) {
  const normalized = normalizeQuery(query);

  const categories = [
    ...PRODUCT_CATEGORIES
  ].sort(
    (a, b) => b.length - a.length
  );

  for (const category of categories) {
    const categoryRegex = new RegExp(
      `\\b${escapeRegExp(
        category
      )}\\b`,
      "i"
    );

    if (
      categoryRegex.test(normalized)
    ) {
      return category;
    }
  }

  return null;
}

/**
 * Extract keywords.
 *
 * State phrases are removed BEFORE splitting
 * the query into keywords.
 */
function extractKeywords(query) {
  let cleanedQuery =
    removeStateFromQuery(query);

  /**
   * Remove categories from keywords.
   */
  const categories = [
    ...PRODUCT_CATEGORIES
  ].sort(
    (a, b) => b.length - a.length
  );

  for (const category of categories) {
    const categoryRegex = new RegExp(
      `\\b${escapeRegExp(
        category
      )}\\b`,
      "gi"
    );

    cleanedQuery =
      cleanedQuery.replace(
        categoryRegex,
        " "
      );
  }

  /**
   * Remove price expressions.
   */
  cleanedQuery = cleanedQuery
    .replace(
      /(?:under|below|less than|up to|upto|over|above|more than|between|from)\s+(?:rs\.?|inr|₹)?\s*\d+(?:\.\d+)?/gi,
      " "
    )
    .replace(
      /(?:rs\.?|inr|₹)\s*\d+(?:\.\d+)?/gi,
      " "
    )
    .replace(
      /\d+(?:\.\d+)?/g,
      " "
    );

  const words = cleanedQuery
    .split(/\s+/)
    .map(word => word.trim())
    .filter(Boolean)
    .filter(
      word => !STOP_WORDS.has(word)
    )
    .filter(
      word => word.length > 1
    );

  return [
    ...new Set(words)
  ];
}

/**
 * Parse a natural-language search query
 * into structured filters.
 */
function parseSearchQuery(query) {
  const normalizedQuery =
    normalizeQuery(query);

  const priceFilters =
    extractPriceFilters(
      normalizedQuery
    );

  const state =
    extractState(
      normalizedQuery
    );

  const category =
    extractCategory(
      normalizedQuery
    );

  const keywords =
    extractKeywords(
      normalizedQuery
    );

  return {
    state,
    minPrice:
      priceFilters.minPrice,
    maxPrice:
      priceFilters.maxPrice,
    keywords,
    category
  };
}

export {
  parseSearchQuery,
  normalizeQuery,
  extractPriceFilters,
  extractState,
  extractCategory,
  extractKeywords,
  INDIAN_STATES,
  PRODUCT_CATEGORIES
};