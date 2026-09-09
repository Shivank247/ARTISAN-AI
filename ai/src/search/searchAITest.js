/**
 * ARTISAN AI
 * AI Search Tests
 *
 * Deterministic tests.
 *
 * No:
 * - PostgreSQL
 * - Prisma
 * - external network
 * - Gemini
 */

const {
  parseSearchQueryWithAI,
  aiSearch,
} = require("./searchAIService");

const {
  validateSearchFilters,
} = require("./searchValidator");

function assert(
  condition,
  message
) {
  if (!condition) {
    throw new Error(message);
  }
}

function createMockProvider(
  output
) {
  return {
    async generateStructuredJSON() {
      return output;
    },
  };
}

async function testValidAIOutput() {
  const provider =
    createMockProvider({
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: [
        "traditional",
        "handmade",
        "gifts",
      ],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "traditional handmade gifts from Bihar under ₹1000"
    );

  assert(
    result.success === true,
    "Valid AI output should succeed."
  );

  assert(
    result.filters.state ===
      "Bihar",
    "State should be Bihar."
  );

  assert(
    result.filters.maxPrice ===
      1000,
    "Maximum price should be 1000."
  );

  assert(
    result.filters.keywords.length ===
      3,
    "Expected three keywords."
  );
}

async function testMissingRequiredField() {
  const provider =
    createMockProvider({
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: 1000,
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "handmade gifts from Bihar under ₹1000"
    );

  assert(
    result.success === false,
    "Missing keywords must fail."
  );

  assert(
    result.error.code ===
      "INVALID_AI_SEARCH_OUTPUT",
    "Missing required field must return INVALID_AI_SEARCH_OUTPUT."
  );
}

async function testInvalidMinPrice() {
  const provider =
    createMockProvider({
      state: null,
      category: "pottery",
      minPrice: -100,
      maxPrice: 1000,
      keywords: [],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "pottery"
    );

  assert(
    result.success === false,
    "Negative minPrice must fail."
  );
}

async function testInvalidMaxPrice() {
  const provider =
    createMockProvider({
      state: null,
      category: "pottery",
      minPrice: null,
      maxPrice: NaN,
      keywords: [],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "pottery"
    );

  assert(
    result.success === false,
    "NaN maxPrice must fail."
  );
}

async function testInfiniteMinPrice() {
  const provider =
    createMockProvider({
      state: null,
      category: null,
      minPrice: Infinity,
      maxPrice: null,
      keywords: [],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "products"
    );

  assert(
    result.success === false,
    "Infinity minPrice must fail."
  );
}

async function testInvalidKeyword() {
  const provider =
    createMockProvider({
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: [
        "handmade",
        "",
      ],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "handmade products from Bihar"
    );

  assert(
    result.success === false,
    "Empty keyword must fail."
  );
}

async function testDuplicateKeywords() {
  const provider =
    createMockProvider({
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: [
        "handmade",
        "handmade",
      ],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "handmade products from Bihar"
    );

  assert(
    result.success === false,
    "Duplicate keywords must fail."
  );
}

async function testReversedPriceRangeIsNormalized() {
  const provider =
    createMockProvider({
      state: null,
      category: "jewelry",
      minPrice: 1500,
      maxPrice: 500,
      keywords: [],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "jewelry between ₹1500 and ₹500"
    );

  assert(
    result.success === true,
    "Reversed price range should be normalized and accepted."
  );

  assert(
    result.filters.minPrice ===
      500,
    "Normalized minPrice should be 500."
  );

  assert(
    result.filters.maxPrice ===
      1500,
    "Normalized maxPrice should be 1500."
  );
}

async function testInvalidStateType() {
  const provider =
    createMockProvider({
      state: 123,
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: [],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "products under ₹1000"
    );

  assert(
    result.success === false,
    "Invalid state type must fail."
  );
}

async function testInvalidCategoryType() {
  const provider =
    createMockProvider({
      state: null,
      category: 123,
      minPrice: null,
      maxPrice: null,
      keywords: [],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "products"
    );

  assert(
    result.success === false,
    "Invalid category type must fail."
  );
}

async function testInvalidStateValue() {
  const provider =
    createMockProvider({
      state: "Atlantis",
      category: null,
      minPrice: null,
      maxPrice: null,
      keywords: [],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "products"
    );

  assert(
    result.success === false,
    "Unknown state must fail."
  );
}

async function testInvalidCategoryValue() {
  const provider =
    createMockProvider({
      state: null,
      category: "dragon crafts",
      minPrice: null,
      maxPrice: null,
      keywords: [],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "products"
    );

  assert(
    result.success === false,
    "Unknown category must fail."
  );
}

async function testCaseInsensitiveCanonicalization() {
  const provider =
    createMockProvider({
      state: "bihar",
      category: "JEWELRY",
      minPrice: null,
      maxPrice: null,
      keywords: [
        "Handmade",
      ],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "handmade jewelry from Bihar"
    );

  assert(
    result.success === true,
    "Canonical values should be normalized."
  );

  assert(
    result.filters.state ===
      "Bihar",
    "State should be normalized to Bihar."
  );

  assert(
    result.filters.category ===
      "jewelry",
    "Category should be normalized to jewelry."
  );

  assert(
    result.filters.keywords[0] ===
      "handmade",
    "Keywords should be normalized to lowercase."
  );
}

async function testUnexpectedProductIdsAreRejected() {
  const provider =
    createMockProvider({
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: [],
      productIds: [
        "fake-product-id",
      ],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "products from Bihar under ₹1000"
    );

  assert(
    result.success === false,
    "AI output containing productIds must be rejected."
  );
}

async function testUnexpectedProductsAreRejected() {
  const provider =
    createMockProvider({
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: [],
      products: [
        {
          id: "fake-product",
        },
      ],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      "products from Bihar under ₹1000"
    );

  assert(
    result.success === false,
    "AI output containing products must be rejected."
  );
}

async function testProviderFailure() {
  const provider = {
    async generateStructuredJSON() {
      const error =
        new Error(
          "Provider unavailable."
        );

      error.code =
        "PROVIDER_UNAVAILABLE";

      throw error;
    },
  };

  const result =
    await parseSearchQueryWithAI(
      provider,
      "handmade products from Bihar"
    );

  assert(
    result.success === false,
    "Provider failure must fail safely."
  );

  assert(
    result.error.code ===
      "PROVIDER_UNAVAILABLE",
    "Known provider error must be preserved."
  );

  assert(
    result.filters === null,
    "Failed search must not return filters."
  );
}

async function testInvalidProvider() {
  const result =
    await parseSearchQueryWithAI(
      null,
      "handmade products"
    );

  assert(
    result.success === false,
    "Invalid provider must fail."
  );

  assert(
    result.error.code ===
      "INVALID_PROVIDER",
    "Invalid provider must return INVALID_PROVIDER."
  );
}

async function testEmptyQuery() {
  const provider =
    createMockProvider({
      state: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      keywords: [],
    });

  const result =
    await parseSearchQueryWithAI(
      provider,
      ""
    );

  assert(
    result.success === false,
    "Empty query must fail."
  );

  assert(
    result.error.code ===
      "INVALID_SEARCH_QUERY",
    "Empty query must return INVALID_SEARCH_QUERY."
  );
}

async function testStructuredFilterValidation() {
  assert(
    validateSearchFilters({
      state: "Bihar",
      category: null,
      minPrice: null,
      maxPrice: 1000,
      keywords: [
        "traditional",
        "handmade",
      ],
    }) === true,
    "Valid structured filters should pass."
  );
}

async function runTests() {
  const tests = [
    [
      "valid AI output",
      testValidAIOutput,
    ],
    [
      "missing required field",
      testMissingRequiredField,
    ],
    [
      "invalid minPrice",
      testInvalidMinPrice,
    ],
    [
      "invalid maxPrice",
      testInvalidMaxPrice,
    ],
    [
      "infinite minPrice",
      testInfiniteMinPrice,
    ],
    [
      "invalid keyword",
      testInvalidKeyword,
    ],
    [
      "duplicate keywords",
      testDuplicateKeywords,
    ],
    [
      "reversed price range normalized",
      testReversedPriceRangeIsNormalized,
    ],
    [
      "invalid state type",
      testInvalidStateType,
    ],
    [
      "invalid category type",
      testInvalidCategoryType,
    ],
    [
      "invalid state value",
      testInvalidStateValue,
    ],
    [
      "invalid category value",
      testInvalidCategoryValue,
    ],
    [
      "canonicalization",
      testCaseInsensitiveCanonicalization,
    ],
    [
      "unexpected productIds rejected",
      testUnexpectedProductIdsAreRejected,
    ],
    [
      "unexpected products rejected",
      testUnexpectedProductsAreRejected,
    ],
    [
      "provider failure",
      testProviderFailure,
    ],
    [
      "invalid provider",
      testInvalidProvider,
    ],
    [
      "empty query",
      testEmptyQuery,
    ],
    [
      "structured filter validation",
      testStructuredFilterValidation,
    ],
  ];

  let passed = 0;

  console.log(
    "\nARTISAN AI — AI Search Tests"
  );

  console.log(
    "============================\n"
  );

  for (
    const [name, test] of tests
  ) {
    try {
      await test();

      passed += 1;

      console.log(
        `✓ ${name}`
      );
    } catch (error) {
      console.error(
        `✗ ${name}`
      );

      console.error(
        `  ${error.message}`
      );

      throw error;
    }
  }

  console.log(
    `\nAI Search tests complete: ${passed}/${tests.length} passed.`
  );
}

if (require.main === module) {
  runTests().catch(() => {
    process.exitCode = 1;
  });
}

module.exports = {
  runTests,
};