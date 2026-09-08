/**
 * ARTISAN AI
 * Natural Language Search Parser
 *
 * Ownership:
 * Shivani — AI Search + Pricing
 *
 * Purpose:
 * Convert a customer's natural-language search
 * query into structured search filters.
 *
 * IMPORTANT:
 * - No PostgreSQL access
 * - No Prisma access
 * - No database access
 * - No AI provider access
 * - No product creation
 * - No product IDs
 * - No fake products
 *
 * Backend/database is responsible for querying
 * real Product records.
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

/*
 * Words that should not become search keywords.
 *
 * IMPORTANT:
 * "handmade", "traditional", and "gifts"
 * are intentionally NOT stop words because
 * they are meaningful search intent.
 */
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "be",
  "by",
  "for",
  "from",
  "in",
  "me",
  "of",
  "on",
  "please",
  "the",
  "to",
  "under",
  "over",
  "above",
  "below",
  "between",
  "with",
  "show",
  "find",
  "looking",
  "want",
  "give",
  "some",
  "product",
  "products",
  "item",
  "items",
  "price",
  "prices",
  "range",
  "maximum",
  "minimum",
  "max",
  "min",
  "less",
  "more",
  "than",
  "up",
  "starting",
]);

/**
 * Normalize user input.
 */
function normalizeText(query) {
  return String(query || "")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Escape characters that have special meaning
 * inside a regular expression.
 */
function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

/**
 * Normalize price text.
 *
 * Examples:
 *
 * ₹1000
 * Rs 1000
 * Rs. 1000
 * INR 1000
 *
 * become numeric-searchable text.
 */
function normalizePriceText(query) {
  return normalizeText(query)
    .replace(/₹/g, " ")
    .replace(/\bRs\.?\b/gi, " ")
    .replace(/\bINR\b/gi, " ")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract price filters.
 *
 * Supported:
 *
 * under 1000
 * below 1000
 * less than 1000
 * up to 1000
 *
 * above 1000
 * over 1000
 * more than 1000
 * starting from 1000
 *
 * between 500 and 1500
 * between ₹500 and ₹1500
 * between Rs 500 and Rs 1500
 * between INR 500 and INR 1500
 *
 * from 500 to 1500
 * from ₹500 to ₹1500
 */
function extractPriceFilters(query) {
  const text = normalizePriceText(query);

  let minPrice = null;
  let maxPrice = null;

  /*
   * -------------------------------------------------------
   * RANGE
   * -------------------------------------------------------
   *
   * Example:
   *
   * jewelry from Rajasthan between ₹1000 and ₹3000
   *
   * After currency normalization:
   *
   * jewelry from Rajasthan between 1000 and 3000
   */
  const rangeMatch = text.match(
    /\b(?:between|from)\s+(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:\.\d+)?)\b/i
  );

  if (rangeMatch) {
    minPrice = Number(rangeMatch[1]);
    maxPrice = Number(rangeMatch[2]);
  }

  /*
   * -------------------------------------------------------
   * MAXIMUM PRICE
   * -------------------------------------------------------
   */
  const maxMatch = text.match(
    /\b(?:under|below|less\s+than|up\s+to|max(?:imum)?(?:\s+price)?)\s+(\d+(?:\.\d+)?)\b/i
  );

  if (maxMatch) {
    maxPrice = Number(maxMatch[1]);
  }

  /*
   * -------------------------------------------------------
   * MINIMUM PRICE
   * -------------------------------------------------------
   */
  const minMatch = text.match(
    /\b(?:above|over|more\s+than|starting\s+from|minimum(?:\s+price)?)\s+(\d+(?:\.\d+)?)\b/i
  );

  if (minMatch) {
    minPrice = Number(minMatch[1]);
  }

  /*
   * Validate minimum price.
   */
  if (
    minPrice !== null &&
    (
      !Number.isFinite(minPrice) ||
      minPrice < 0
    )
  ) {
    minPrice = null;
  }

  /*
   * Validate maximum price.
   */
  if (
    maxPrice !== null &&
    (
      !Number.isFinite(maxPrice) ||
      maxPrice < 0
    )
  ) {
    maxPrice = null;
  }

  /*
   * Normalize reversed ranges.
   *
   * Example:
   *
   * between 3000 and 1000
   *
   * becomes:
   *
   * minPrice = 1000
   * maxPrice = 3000
   */
  if (
    minPrice !== null &&
    maxPrice !== null &&
    minPrice > maxPrice
  ) {
    const temp = minPrice;

    minPrice = maxPrice;
    maxPrice = temp;
  }

  return {
    minPrice,
    maxPrice,
  };
}

/**
 * Extract an Indian state from the query.
 */
function extractState(query) {
  const normalizedQuery =
    normalizeText(query).toLowerCase();

  /*
   * Longer names first.
   *
   * Example:
   * "Uttar Pradesh"
   * should be checked before "Uttar".
   */
  const sortedStates = [
    ...INDIAN_STATES,
  ].sort(
    (a, b) => b.length - a.length
  );

  for (const state of sortedStates) {
    const pattern = new RegExp(
      `\\b${escapeRegex(
        state.toLowerCase()
      )}\\b`,
      "i"
    );

    if (pattern.test(normalizedQuery)) {
      return state;
    }
  }

  return null;
}

/**
 * Extract a product category.
 */
function extractCategory(query) {
  const normalizedQuery =
    normalizeText(query).toLowerCase();

  /*
   * Longer categories first.
   *
   * Example:
   * "home decor"
   * should be detected as one category.
   */
  const sortedCategories = [
    ...PRODUCT_CATEGORIES,
  ].sort(
    (a, b) => b.length - a.length
  );

  for (const category of sortedCategories) {
    const pattern = new RegExp(
      `\\b${escapeRegex(
        category.toLowerCase()
      )}\\b`,
      "i"
    );

    if (pattern.test(normalizedQuery)) {
      return category;
    }
  }

  return null;
}

/**
 * Extract meaningful search keywords.
 *
 * Example:
 *
 * traditional handmade gifts from Bihar
 *
 * becomes:
 *
 * ["traditional", "handmade", "gifts"]
 *
 * State/category/filter words are removed.
 */
function extractKeywords(
  query,
  state,
  category
) {
  let cleaned =
    normalizeText(query).toLowerCase();

  /*
   * Remove currency symbols.
   */
  cleaned = cleaned.replace(
    /₹/g,
    " "
  );

  /*
   * Remove currency names.
   */
  cleaned = cleaned.replace(
    /\b(?:rs|inr)\.?\b/gi,
    " "
  );

  /*
   * Remove numeric values.
   */
  cleaned = cleaned.replace(
    /\d+(?:\.\d+)?/g,
    " "
  );

  /*
   * Remove price/filter words.
   */
  const filterWords = [
    "under",
    "below",
    "less",
    "than",
    "above",
    "over",
    "more",
    "between",
    "from",
    "and",
    "to",
    "up",
    "maximum",
    "max",
    "minimum",
    "min",
    "price",
    "prices",
    "starting",
    "range",
  ];

  for (const word of filterWords) {
    cleaned = cleaned.replace(
      new RegExp(
        `\\b${escapeRegex(word)}\\b`,
        "gi"
      ),
      " "
    );
  }

  /*
   * Remove detected state.
   */
  if (state) {
    cleaned = cleaned.replace(
      new RegExp(
        `\\b${escapeRegex(
          state.toLowerCase()
        )}\\b`,
        "gi"
      ),
      " "
    );
  }

  /*
   * Remove detected category.
   */
  if (category) {
    cleaned = cleaned.replace(
      new RegExp(
        `\\b${escapeRegex(
          category.toLowerCase()
        )}\\b`,
        "gi"
      ),
      " "
    );
  }

  /*
   * Split remaining text into words.
   */
  const words = cleaned
    .split(/[^a-zA-Z0-9]+/)
    .map(
      (word) => word.trim()
    )
    .filter(Boolean)
    .filter(
      (word) =>
        !STOP_WORDS.has(word)
    )
    .filter(
      (word) =>
        word.length > 1
    );

  /*
   * Remove duplicates while preserving order.
   */
  return [
    ...new Set(words),
  ];
}

/**
 * Main search parser.
 *
 * Output:
 *
 * {
 *   state: string | null,
 *   category: string | null,
 *   minPrice: number | null,
 *   maxPrice: number | null,
 *   keywords: string[]
 * }
 */
function parseSearchQuery(query) {
  const normalizedQuery =
    normalizeText(query);

  /*
   * Empty query.
   */
  if (!normalizedQuery) {
    return {
      state: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      keywords: [],
    };
  }

  const state =
    extractState(
      normalizedQuery
    );

  const category =
    extractCategory(
      normalizedQuery
    );

  const {
    minPrice,
    maxPrice,
  } = extractPriceFilters(
    normalizedQuery
  );

  const keywords =
    extractKeywords(
      normalizedQuery,
      state,
      category
    );

  return {
    state,
    category,
    minPrice,
    maxPrice,
    keywords,
  };
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  INDIAN_STATES,
  PRODUCT_CATEGORIES,
  STOP_WORDS,

  normalizeText,
  escapeRegex,
  normalizePriceText,

  extractPriceFilters,
  extractState,
  extractCategory,
  extractKeywords,

  parseSearchQuery,
};