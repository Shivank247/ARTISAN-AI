/**
 * ARTISAN AI
 * Search Evaluation Dataset
 *
 * Purpose:
 * - Evaluate natural-language search parsing
 * - Verify structured filter extraction
 * - Ensure price, state, category and keyword handling
 * - Ensure AI search does not invent products
 */

const SEARCH_EVALUATION_DATASET = [
  {
    id: "SEARCH-001",
    query: "traditional handmade gifts from Bihar under 1000",
    expected: {
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: ["traditional", "handmade", "gifts"],
    },
  },

  {
    id: "SEARCH-002",
    query: "handmade products above 1000 from Rajasthan",
    expected: {
      state: "Rajasthan",
      category: null,
      minPrice: 1000,
      maxPrice: null,
      keywords: ["handmade", "products"],
    },
  },

  {
    id: "SEARCH-003",
    query: "jewelry from Rajasthan between ₹1000 and ₹3000",
    expected: {
      state: "Rajasthan",
      category: "jewelry",
      minPrice: 1000,
      maxPrice: 3000,
      keywords: [],
    },
  },

  {
    id: "SEARCH-004",
    query: "pottery from Uttar Pradesh",
    expected: {
      state: "Uttar Pradesh",
      category: "pottery",
      minPrice: null,
      maxPrice: null,
      keywords: [],
    },
  },

  {
    id: "SEARCH-005",
    query: "handmade textiles from West Bengal",
    expected: {
      state: "West Bengal",
      category: "textiles",
      minPrice: null,
      maxPrice: null,
      keywords: ["handmade"],
    },
  },

  {
    id: "SEARCH-006",
    query: "woodwork under Rs 2000",
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
    query: "products under INR 1500",
    expected: {
      state: null,
      category: null,
      minPrice: null,
      maxPrice: 1500,
      keywords: [],
    },
  },

  {
    id: "SEARCH-008",
    query: "paintings above ₹5000",
    expected: {
      state: null,
      category: "painting",
      minPrice: 5000,
      maxPrice: null,
      keywords: [],
    },
  },

  {
    id: "SEARCH-009",
    query: "metal handicrafts from Odisha under 3000",
    expected: {
      state: "Odisha",
      category: "metalwork",
      minPrice: null,
      maxPrice: 3000,
      keywords: ["metal", "handicrafts"],
    },
  },

  {
    id: "SEARCH-010",
    query: "traditional home decor from Gujarat",
    expected: {
      state: "Gujarat",
      category: "home decor",
      minPrice: null,
      maxPrice: null,
      keywords: ["traditional"],
    },
  },

  {
    id: "SEARCH-011",
    query: "accessories from Maharashtra below 2500",
    expected: {
      state: "Maharashtra",
      category: "accessories",
      minPrice: null,
      maxPrice: 2500,
      keywords: [],
    },
  },

  {
    id: "SEARCH-012",
    query: "handmade jewelry",
    expected: {
      state: null,
      category: "jewelry",
      minPrice: null,
      maxPrice: null,
      keywords: ["handmade"],
    },
  },

  {
    id: "SEARCH-013",
    query: "products between 1000 and 5000",
    expected: {
      state: null,
      category: null,
      minPrice: 1000,
      maxPrice: 5000,
      keywords: [],
    },
  },

  {
    id: "SEARCH-014",
    query: "cheap pottery gifts",
    expected: {
      state: null,
      category: "pottery",
      minPrice: null,
      maxPrice: null,
      keywords: ["cheap", "gifts"],
    },
  },

  {
    id: "SEARCH-015",
    query: "traditional handmade gifts from Bihar",
    expected: {
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: null,
      keywords: ["traditional", "handmade", "gifts"],
    },
  },

  // ---------------------------------------------------------
  // UTF-8 / REAL CURRENCY TEST CASES
  // ---------------------------------------------------------

  {
    id: "SEARCH-016",
    query: "handmade gifts under ₹1000",
    expected: {
      state: null,
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: ["handmade", "gifts"],
    },
  },

  {
    id: "SEARCH-017",
    query: "handmade gifts under ₹1,000",
    expected: {
      state: null,
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: ["handmade", "gifts"],
    },
  },

  {
    id: "SEARCH-018",
    query: "jewelry between ₹1000 and ₹3000",
    expected: {
      state: null,
      category: "jewelry",
      minPrice: 1000,
      maxPrice: 3000,
      keywords: [],
    },
  },

  {
    id: "SEARCH-019",
    query: "jewelry between ₹1,000 and ₹3,000",
    expected: {
      state: null,
      category: "jewelry",
      minPrice: 1000,
      maxPrice: 3000,
      keywords: [],
    },
  },

  {
    id: "SEARCH-020",
    query: "woodwork under Rs 2000",
    expected: {
      state: null,
      category: "woodwork",
      minPrice: null,
      maxPrice: 2000,
      keywords: [],
    },
  },

  {
    id: "SEARCH-021",
    query: "products under INR 1500",
    expected: {
      state: null,
      category: null,
      minPrice: null,
      maxPrice: 1500,
      keywords: [],
    },
  },
];

/**
 * Validate the complete evaluation dataset.
 */
function validateSearchEvaluationDataset() {
  if (!Array.isArray(SEARCH_EVALUATION_DATASET)) {
    throw new Error("Search evaluation dataset must be an array.");
  }

  if (SEARCH_EVALUATION_DATASET.length !== 21) {
    throw new Error(
      `Expected 21 search evaluation cases, found ${SEARCH_EVALUATION_DATASET.length}.`
    );
  }

  for (const testCase of SEARCH_EVALUATION_DATASET) {
    if (!testCase.id) {
      throw new Error("Every search evaluation case must have an id.");
    }

    if (typeof testCase.query !== "string" || !testCase.query.trim()) {
      throw new Error(
        `Invalid query in search evaluation case: ${testCase.id}`
      );
    }

    if (!testCase.expected || typeof testCase.expected !== "object") {
      throw new Error(
        `Missing expected result in search evaluation case: ${testCase.id}`
      );
    }

    const {
      state,
      category,
      minPrice,
      maxPrice,
      keywords,
    } = testCase.expected;

    if (state !== null && typeof state !== "string") {
      throw new Error(
        `Invalid state in search evaluation case: ${testCase.id}`
      );
    }

    if (category !== null && typeof category !== "string") {
      throw new Error(
        `Invalid category in search evaluation case: ${testCase.id}`
      );
    }

    if (
      minPrice !== null &&
      (typeof minPrice !== "number" || !Number.isFinite(minPrice))
    ) {
      throw new Error(
        `Invalid minPrice in search evaluation case: ${testCase.id}`
      );
    }

    if (
      maxPrice !== null &&
      (typeof maxPrice !== "number" || !Number.isFinite(maxPrice))
    ) {
      throw new Error(
        `Invalid maxPrice in search evaluation case: ${testCase.id}`
      );
    }

    if (
      minPrice !== null &&
      maxPrice !== null &&
      minPrice > maxPrice
    ) {
      throw new Error(
        `Invalid price range in search evaluation case: ${testCase.id}`
      );
    }

    if (!Array.isArray(keywords)) {
      throw new Error(
        `Keywords must be an array in search evaluation case: ${testCase.id}`
      );
    }
  }

  return true;
}

validateSearchEvaluationDataset();

module.exports = {
  SEARCH_EVALUATION_DATASET,
  validateSearchEvaluationDataset,
};