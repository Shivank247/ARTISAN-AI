/**
 * Natural Language Search Parser
 *
 * Converts a customer's natural-language query
 * into structured search filters.
 *
 * Example:
 *
 * "Show me traditional handmade gifts from Bihar under ₹1000"
 *
 * becomes:
 *
 * {
 *   state: "Bihar",
 *   maxPrice: 1000,
 *   keywords: ["traditional", "handmade", "gifts"],
 *   category: null
 * }
 */

const { validateSearchFilters } = require("./searchValidator");

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
  "Delhi"
];

const PRODUCT_CATEGORIES = [
  "painting",
  "paintings",
  "pottery",
  "textile",
  "textiles",
  "jewellery",
  "jewelry",
  "handicraft",
  "handicrafts",
  "woodwork",
  "basket",
  "baskets",
  "clothing",
  "decor",
  "decoration",
  "sculpture",
  "sculptures",
  "embroidery",
  "weaving",
  "ceramic",
  "ceramics"
];

/**
 * Clean and normalize the customer query.
 */
function normalizeQuery(query) {
  if (typeof query !== "string") {
    throw new Error("Search query must be a string.");
  }

  return query
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Convert Indian price formats into a number.
 *
 * Examples:
 * ₹1000      -> 1000
 * Rs 1000    -> 1000
 * INR 1000   -> 1000
 * 1,000      -> 1000
 */
function extractPriceValue(value) {
  if (!value) {
    return null;
  }

  const cleaned = String(value)
    .replace(/₹/g, "")
    .replace(/rs\.?/gi, "")
    .replace(/inr/gi, "")
    .replace(/,/g, "")
    .trim();

  const number = Number(cleaned);

  return Number.isFinite(number) && number >= 0
    ? number
    : null;
}
function extractPriceRange(query) {
  const patterns = [
    /between\s*(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(?:and|-|to)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,

    /(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(?:to|-)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);

    if (match) {
      const firstPrice = extractPriceValue(match[1]);
      const secondPrice = extractPriceValue(match[2]);

      if (
        firstPrice !== null &&
        secondPrice !== null
      ) {
        return {
          minPrice: Math.min(firstPrice, secondPrice),
          maxPrice: Math.max(firstPrice, secondPrice)
        };
      }
    }
  }

  return {
    minPrice: null,
    maxPrice: null
  };
}
/**
 * Extract maximum price.
 *
 * Examples:
 * under ₹1000
 * below Rs 500
 * less than 1500
 * within INR 2000
 */
function extractMaxPrice(query) {
  const patterns = [
    /under\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    /below\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    /less\s+than\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    /upto\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    /up\s+to\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    /within\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    /maximum\s*(?:price)?\s*(?:of)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);

    if (match) {
      return extractPriceValue(match[1]);
    }
  }

  return null;
}

/**
 * Extract minimum price.
 *
 * Examples:
 * above ₹500
 * over Rs 1000
 * more than 700
 */
function extractMinPrice(query) {
  const patterns = [
    /above\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    /over\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    /more\s+than\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
    /minimum\s*(?:price)?\s*(?:of)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);

    if (match) {
      return extractPriceValue(match[1]);
    }
  }

  return null;
}

/**
 * Find an Indian state in the query.
 */
function extractState(query) {
  const lowerQuery = query.toLowerCase();

  for (const state of INDIAN_STATES) {
    if (lowerQuery.includes(state.toLowerCase())) {
      return state;
    }
  }

  return null;
}

/**
 * Find a likely product category.
 */
function extractCategory(query) {
  const lowerQuery = query.toLowerCase();

  for (const category of PRODUCT_CATEGORIES) {
    if (lowerQuery.includes(category)) {
      return category;
    }
  }

  return null;
}

/**
 * Extract useful keywords from the customer's query.
 *
 * Common search words such as "show", "me", "from", "under"
 * are removed because they are not useful product keywords.
 */
function extractKeywords(query) {
  const stopWords = new Set([
    "show",
    "me",
    "find",
    "finds",
    "search",
    "searching",
    "for",
    "the",
    "a",
    "an",
    "from",
    "in",
    "at",
    "under",
    "below",
    "above",
    "over",
    "less",
    "than",
    "more",
    "with",
    "and",
    "or",
    "of",
    "to",
    "up",
    "within",
    "price",
    "priced",
    "products",
    "product",
    "items",
    "item",
    "please",
    "can",
    "you",
    "give",
    "want",
    "looking",
    "i",
    "am",
    "is",
    "are",
    "₹"
  ]);

  const words = query
    .toLowerCase()
    .replace(/[₹,!?;.()]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const stateNames = INDIAN_STATES.map(state =>
    state.toLowerCase()
  );

  const categoryNames = PRODUCT_CATEGORIES.map(category =>
    category.toLowerCase()
  );

  const keywords = [];

  for (const word of words) {
    if (stopWords.has(word)) {
      continue;
    }

    if (stateNames.includes(word)) {
      continue;
    }

    if (categoryNames.includes(word)) {
      continue;
    }

    if (/^\d+$/.test(word)) {
      continue;
    }

    if (word.length < 2) {
      continue;
    }

    if (!keywords.includes(word)) {
      keywords.push(word);
    }
  }

  return keywords;
}

/**
 * Main parser.
 */
function parseSearchQuery(query) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return {
      success: false,
      filters: null,
      errors: ["Search query cannot be empty."]
    };
  }

  const priceRange = extractPriceRange(normalizedQuery);

const filters = {
  state: extractState(normalizedQuery),

  minPrice:
    priceRange.minPrice !== null
      ? priceRange.minPrice
      : extractMinPrice(normalizedQuery),

  maxPrice:
    priceRange.maxPrice !== null
      ? priceRange.maxPrice
      : extractMaxPrice(normalizedQuery),

  keywords: extractKeywords(normalizedQuery),

  category: extractCategory(normalizedQuery)
};

  const validation = validateSearchFilters(filters);

  if (!validation.valid) {
    return {
      success: false,
      filters: null,
      errors: validation.errors
    };
  }

  return {
    success: true,
    filters,
    errors: []
  };
}

module.exports = {
  parseSearchQuery,
  normalizeQuery,
  extractPriceRange,
  extractMaxPrice,
  extractMinPrice,
  extractState,
  extractCategory,
  extractKeywords
};