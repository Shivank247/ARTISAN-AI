/**
 * ARTISAN AI
 * Natural Language Search Parser
 *
 * Ownership:
 * Shivani — AI Search + Pricing
 *
 * Purpose:
 * Convert a customer's natural-language search query
 * into structured search filters.
 *
 * IMPORTANT:
 * - No PostgreSQL access
 * - No Prisma access
 * - No database access
 * - No AI provider access
 * - No product creation
 * - No product IDs
 * - No fake products
 */

const {
  INDIAN_STATES,
  PRODUCT_CATEGORIES,
  normalizeSearchFilters,
  validateSearchFilters,
} = require("./searchValidator");

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

function normalizeText(query) {
  return String(query || "")
    .trim()
    .replace(/\s+/g, " ");
}

function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function normalizePriceText(query) {
  return normalizeText(query)
    .replace(/₹/g, " ")
    .replace(/\bRs\.?/gi, " ")
    .replace(/\bINR\b/gi, " ")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPriceFilters(query) {
  const text =
    normalizePriceText(query);

  let minPrice = null;
  let maxPrice = null;

  /*
   * Examples:
   *
   * between 500 and 1500
   * between ₹500 and ₹1500
   * between Rs 500 and Rs 1500
   * between INR 500 and INR 1500
   *
   * from 500 to 1500
   * from ₹500 to ₹1500
   */
  const rangeMatch = text.match(
    /\b(?:between|from)\s+(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:\.\d+)?)\b/i
  );

  if (rangeMatch) {
    minPrice =
      Number(rangeMatch[1]);

    maxPrice =
      Number(rangeMatch[2]);
  }

  /*
   * Maximum price.
   */
  const maxMatch = text.match(
    /\b(?:under|below|less\s+than|up\s+to|max(?:imum)?(?:\s+price)?)\s+(\d+(?:\.\d+)?)\b/i
  );

  if (maxMatch) {
    maxPrice =
      Number(maxMatch[1]);
  }

  /*
   * Minimum price.
   */
  const minMatch = text.match(
    /\b(?:above|over|more\s+than|starting\s+from|minimum(?:\s+price)?)\s+(\d+(?:\.\d+)?)\b/i
  );

  if (minMatch) {
    minPrice =
      Number(minMatch[1]);
  }

  if (
    minPrice !== null &&
    (
      !Number.isFinite(minPrice) ||
      minPrice < 0
    )
  ) {
    minPrice = null;
  }

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
   * Normalize reversed range.
   */
  if (
    minPrice !== null &&
    maxPrice !== null &&
    minPrice > maxPrice
  ) {
    const temporary = minPrice;

    minPrice =
      maxPrice;

    maxPrice =
      temporary;
  }

  return {
    minPrice,
    maxPrice,
  };
}

function extractState(query) {
  const normalizedQuery =
    normalizeText(query).toLowerCase();

  const sortedStates = [
    ...INDIAN_STATES,
  ].sort(
    (a, b) =>
      b.length - a.length
  );

  for (const state of sortedStates) {
    const pattern =
      new RegExp(
        `\\b${escapeRegex(
          state.toLowerCase()
        )}\\b`,
        "i"
      );

    if (
      pattern.test(
        normalizedQuery
      )
    ) {
      return state;
    }
  }

  return null;
}

function extractCategory(query) {
  const normalizedQuery =
    normalizeText(query).toLowerCase();

  const sortedCategories = [
    ...PRODUCT_CATEGORIES,
  ].sort(
    (a, b) =>
      b.length - a.length
  );

  for (const category of sortedCategories) {
    const pattern =
      new RegExp(
        `\\b${escapeRegex(
          category.toLowerCase()
        )}\\b`,
        "i"
      );

    if (
      pattern.test(
        normalizedQuery
      )
    ) {
      return category;
    }
  }

  return null;
}

function extractKeywords(
  query,
  state,
  category
) {
  let cleaned =
    normalizeText(query)
      .toLowerCase();

  cleaned =
    cleaned.replace(
      /₹/g,
      " "
    );

  cleaned =
    cleaned.replace(
      /\b(?:rs|inr)\.?\b/gi,
      " "
    );

  cleaned =
    cleaned.replace(
      /\d+(?:\.\d+)?/g,
      " "
    );

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
    cleaned =
      cleaned.replace(
        new RegExp(
          `\\b${escapeRegex(word)}\\b`,
          "gi"
        ),
        " "
      );
  }

  if (state) {
    cleaned =
      cleaned.replace(
        new RegExp(
          `\\b${escapeRegex(
            state.toLowerCase()
          )}\\b`,
          "gi"
        ),
        " "
      );
  }

  if (category) {
    cleaned =
      cleaned.replace(
        new RegExp(
          `\\b${escapeRegex(
            category.toLowerCase()
          )}\\b`,
          "gi"
        ),
        " "
      );
  }

  const words =
    cleaned
      .split(/[^a-zA-Z0-9]+/)
      .map(
        (word) =>
          word.trim()
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

  return [
    ...new Set(words),
  ];
}

function parseSearchQuery(query) {
  const normalizedQuery =
    normalizeText(query);

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

  const filters = {
    state,
    category,
    minPrice,
    maxPrice,
    keywords,
  };

  /*
   * The deterministic parser already normalizes
   * the price range. Run the same normalization
   * contract used by AI output.
   */
  const normalizedFilters =
    normalizeSearchFilters(
      filters
    );

  if (
    !normalizedFilters ||
    !validateSearchFilters(
      normalizedFilters
    )
  ) {
    return {
      state: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      keywords: [],
    };
  }

  return normalizedFilters;
}

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
