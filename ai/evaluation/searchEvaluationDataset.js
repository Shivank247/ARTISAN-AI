/**
 * ARTISAN AI
 * Search Evaluation Dataset
 *
 * Ownership:
 * Shivani — AI Search + Pricing
 *
 * Purpose:
 * Evaluate natural-language search interpretation.
 *
 * Search AI returns structured intent only.
 *
 * It does NOT:
 * - access PostgreSQL
 * - access Prisma
 * - create products
 * - invent products
 * - invent product IDs
 */

const {
  validateSearchFilters,
} = require("../src/search/searchValidator");

const {
  INDIAN_STATES,
  PRODUCT_CATEGORIES,
} = require("../src/search/searchParser");

const SEARCH_EVALUATION_DATASET = [
  {
    id: "SEARCH-001",
    query:
      "traditional handmade gifts from Bihar under 1000",
    expected: {
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: [
        "traditional",
        "handmade",
        "gifts",
      ],
    },
  },

  {
    id: "SEARCH-002",
    query:
      "handmade pottery from West Bengal",
    expected: {
      state: "West Bengal",
      category: "pottery",
      minPrice: null,
      maxPrice: null,
      keywords: [
        "handmade",
      ],
    },
  },

  {
    id: "SEARCH-003",
    query:
      "traditional jewelry between 500 and 1500",
    expected: {
      state: null,
      category: "jewelry",
      minPrice: 500,
      maxPrice: 1500,
      keywords: [
        "traditional",
      ],
    },
  },

  {
    id: "SEARCH-004",
    query:
      "handmade products above 1000 from Rajasthan",
    expected: {
      state: "Rajasthan",
      category: null,
      minPrice: 1000,
      maxPrice: null,
      keywords: [
        "handmade",
      ],
    },
  },

  {
    id: "SEARCH-005",
    query:
      "Madhubani painting from Bihar",
    expected: {
      state: "Bihar",
      category: "painting",
      minPrice: null,
      maxPrice: null,
      keywords: [
        "madhubani",
      ],
    },
  },

  {
    id: "SEARCH-006",
    query:
      "woodwork under Rs 2000",
    expected: {
      state: null,
      category: "woodwork",
      minPrice: null,
      maxPrice: 2000,
      keywords: [],
    },
  },

  {
    id: "SEARCH-007",
    query:
      "handmade textiles from Uttar Pradesh under INR 1500",
    expected: {
      state: "Uttar Pradesh",
      category: "textiles",
      minPrice: null,
      maxPrice: 1500,
      keywords: [
        "handmade",
      ],
    },
  },

  {
    id: "SEARCH-008",
    query:
      "traditional handicrafts below ₹800",
    expected: {
      state: null,
      category: "handicrafts",
      minPrice: null,
      maxPrice: 800,
      keywords: [
        "traditional",
      ],
    },
  },

  {
    id: "SEARCH-009",
    query:
      "metalwork from Gujarat above 750",
    expected: {
      state: "Gujarat",
      category: "metalwork",
      minPrice: 750,
      maxPrice: null,
      keywords: [],
    },
  },

  {
    id: "SEARCH-010",
    query:
      "handmade home decor between 500 and 2000",
    expected: {
      state: null,
      category: "home decor",
      minPrice: 500,
      maxPrice: 2000,
      keywords: [
        "handmade",
      ],
    },
  },

  {
    id: "SEARCH-011",
    query:
      "traditional accessories from Maharashtra",
    expected: {
      state: "Maharashtra",
      category: "accessories",
      minPrice: null,
      maxPrice: null,
      keywords: [
        "traditional",
      ],
    },
  },

  {
    id: "SEARCH-012",
    query:
      "handmade gifts under 500",
    expected: {
      state: null,
      category: null,
      minPrice: null,
      maxPrice: 500,
      keywords: [
        "handmade",
        "gifts",
      ],
    },
  },

  {
    id: "SEARCH-013",
    query:
      "painting from Madhya Pradesh over 1200",
    expected: {
      state: "Madhya Pradesh",
      category: "painting",
      minPrice: 1200,
      maxPrice: null,
      keywords: [],
    },
  },

  {
    id: "SEARCH-014",
    query:
      "traditional handmade pottery gifts from Bihar",
    expected: {
      state: "Bihar",
      category: "pottery",
      minPrice: null,
      maxPrice: null,
      keywords: [
        "traditional",
        "handmade",
        "gifts",
      ],
    },
  },

  {
    id: "SEARCH-015",
    query:
      "jewelry from Rajasthan between ₹1000 and ₹3000",
    expected: {
      state: "Rajasthan",
      category: "jewelry",
      minPrice: 1000,
      maxPrice: 3000,
      keywords: [],
    },
  },
];

function isValidNullableString(value) {
  return (
    value === null ||
    (
      typeof value === "string" &&
      value.trim().length > 0
    )
  );
}

function isValidPrice(value) {
  return (
    value === null ||
    (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0
    )
  );
}

function validateEvaluationCase(testCase) {
  if (
    !testCase ||
    typeof testCase !== "object" ||
    Array.isArray(testCase)
  ) {
    return false;
  }

  if (
    typeof testCase.id !== "string" ||
    testCase.id.trim().length === 0
  ) {
    return false;
  }

  if (
    typeof testCase.query !== "string" ||
    testCase.query.trim().length === 0
  ) {
    return false;
  }

  if (
    !testCase.expected ||
    typeof testCase.expected !== "object" ||
    Array.isArray(testCase.expected)
  ) {
    return false;
  }

  const {
    state,
    category,
    minPrice,
    maxPrice,
    keywords,
  } = testCase.expected;

  if (!isValidNullableString(state)) {
    return false;
  }

  if (
    state !== null &&
    !INDIAN_STATES.includes(state)
  ) {
    return false;
  }

  if (!isValidNullableString(category)) {
    return false;
  }

  if (
    category !== null &&
    !PRODUCT_CATEGORIES.includes(category)
  ) {
    return false;
  }

  if (!isValidPrice(minPrice)) {
    return false;
  }

  if (!isValidPrice(maxPrice)) {
    return false;
  }

  if (
    minPrice !== null &&
    maxPrice !== null &&
    minPrice > maxPrice
  ) {
    return false;
  }

  if (!Array.isArray(keywords)) {
    return false;
  }

  const keywordSet = new Set();

  for (const keyword of keywords) {
    if (
      typeof keyword !== "string" ||
      keyword.trim().length === 0
    ) {
      return false;
    }

    const normalized =
      keyword.trim().toLowerCase();

    if (keywordSet.has(normalized)) {
      return false;
    }

    keywordSet.add(normalized);
  }

  /*
   * Search evaluation must contain filters only.
   * Product IDs/products must never be supplied
   * as part of the AI search interpretation dataset.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      testCase.expected,
      "productIds"
    )
  ) {
    return false;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      testCase.expected,
      "products"
    )
  ) {
    return false;
  }

  return validateSearchFilters(
    testCase.expected
  );
}

function validateSearchEvaluationDataset(
  dataset = SEARCH_EVALUATION_DATASET
) {
  if (!Array.isArray(dataset)) {
    return false;
  }

  if (dataset.length !== 15) {
    return false;
  }

  const ids = new Set();

  for (const testCase of dataset) {
    if (!validateEvaluationCase(testCase)) {
      return false;
    }

    if (ids.has(testCase.id)) {
      return false;
    }

    ids.add(testCase.id);
  }

  return true;
}

module.exports = {
  SEARCH_EVALUATION_DATASET,
  validateEvaluationCase,
  validateSearchEvaluationDataset,
};