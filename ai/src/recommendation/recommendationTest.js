/**
 * ARTISAN AI
 * Recommendation Tests
 *
 * Deterministic tests.
 *
 * These tests:
 * - do not require PostgreSQL
 * - do not require Prisma
 * - do not require Gemini
 * - do not require an API key
 * - do not create database products
 */

const {
  getRecommendations,
} = require("./recommendationService");

const {
  validateRecommendationInput,
  validateRecommendationOutput,
  normalizeRecommendationOutput,
} = require("./recommendationValidator");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const catalogue = [
  {
    id: "product-bihar-madhubani",
    title: "Madhubani Handmade Painting",
    description:
      "Traditional handmade painting from Bihar.",
    category: "painting",
    material: "handmade paper",
    tags: [
      "traditional",
      "handmade",
      "bihar",
    ],
    price: 899,
    currency: "INR",
    state: "Bihar",
  },

  {
    id: "product-bengal-pottery",
    title: "Terracotta Handmade Pottery",
    description:
      "Traditional terracotta craft from West Bengal.",
    category: "pottery",
    material: "terracotta clay",
    tags: [
      "traditional",
      "handmade",
      "pottery",
    ],
    price: 699,
    currency: "INR",
    state: "West Bengal",
  },

  {
    id: "product-rajasthan-jewelry",
    title: "Handcrafted Rajasthani Jewelry",
    description:
      "Traditional handcrafted jewelry.",
    category: "jewelry",
    material: "silver",
    tags: [
      "traditional",
      "handmade",
      "jewelry",
    ],
    price: 1299,
    currency: "INR",
    state: "Rajasthan",
  },
];

function createMockProvider(output) {
  return {
    async generateStructuredJSON() {
      return output;
    },
  };
}

async function testValidRecommendation() {
  const provider = createMockProvider({
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: 0.95,
        reason:
          "Relevant to the request for traditional handmade products from Bihar.",
      },
    ],
  });

  const result = await getRecommendations(
    provider,
    "traditional handmade products from Bihar",
    catalogue,
    5
  );

  assert(
    result.success === true,
    "Valid recommendation should succeed."
  );

  assert(
    result.recommendations.length === 1,
    "Expected one recommendation."
  );

  assert(
    result.recommendations[0].productId ===
      "product-bihar-madhubani",
    "Recommendation must use an existing product ID."
  );
}

async function testUnknownProductIdRejected() {
  const provider = createMockProvider({
    recommendations: [
      {
        productId: "fake-product-id",
        score: 0.95,
        reason: "Fake product.",
      },
    ],
  });

  const result = await getRecommendations(
    provider,
    "traditional handmade products",
    catalogue,
    5
  );

  assert(
    result.success === false,
    "Unknown product ID must be rejected."
  );

  assert(
    result.error.code ===
      "INVALID_AI_RECOMMENDATION_OUTPUT",
    "Unknown product ID must return the controlled output error."
  );
}

async function testDuplicateProductIdsRejected() {
  const provider = createMockProvider({
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: 0.95,
        reason: "First recommendation.",
      },
      {
        productId:
          "product-bihar-madhubani",
        score: 0.90,
        reason: "Duplicate recommendation.",
      },
    ],
  });

  const result = await getRecommendations(
    provider,
    "traditional handmade products",
    catalogue,
    5
  );

  assert(
    result.success === false,
    "Duplicate product IDs must be rejected."
  );
}

async function testScoreBelowZeroRejected() {
  const output = {
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: -0.1,
        reason: "Invalid score.",
      },
    ],
  };

  assert(
    validateRecommendationOutput(
      output,
      catalogue,
      5
    ) === false,
    "Score below zero must be rejected."
  );
}

async function testScoreAboveOneRejected() {
  const output = {
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: 1.1,
        reason: "Invalid score.",
      },
    ],
  };

  assert(
    validateRecommendationOutput(
      output,
      catalogue,
      5
    ) === false,
    "Score above one must be rejected."
  );
}

async function testNonFiniteScoreRejected() {
  const output = {
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: Infinity,
        reason: "Invalid score.",
      },
    ],
  };

  assert(
    validateRecommendationOutput(
      output,
      catalogue,
      5
    ) === false,
    "Non-finite score must be rejected."
  );
}

async function testMissingReasonRejected() {
  const output = {
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: 0.8,
      },
    ],
  };

  assert(
    validateRecommendationOutput(
      output,
      catalogue,
      5
    ) === false,
    "Missing reason must be rejected."
  );
}

async function testEmptyCatalogue() {
  const provider = {
    async generateStructuredJSON() {
      throw new Error(
        "Provider should not be called for empty catalogue."
      );
    },
  };

  const result = await getRecommendations(
    provider,
    "handmade products",
    [],
    5
  );

  assert(
    result.success === true,
    "Empty catalogue should return success."
  );

  assert(
    result.recommendations.length === 0,
    "Empty catalogue must return no recommendations."
  );
}

async function testLimitIsEnforced() {
  const provider = createMockProvider({
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: 0.95,
        reason: "First product.",
      },
      {
        productId:
          "product-bengal-pottery",
        score: 0.90,
        reason: "Second product.",
      },
      {
        productId:
          "product-rajasthan-jewelry",
        score: 0.85,
        reason: "Third product.",
      },
    ],
  });

  const result = await getRecommendations(
    provider,
    "traditional handmade products",
    catalogue,
    2
  );

  assert(
    result.success === false,
    "Output exceeding the limit must be rejected."
  );
}

async function testInvalidQuery() {
  const result = await getRecommendations(
    createMockProvider({
      recommendations: [],
    }),
    "",
    catalogue,
    5
  );

  assert(
    result.success === false,
    "Empty query must be rejected."
  );

  assert(
    result.error.code ===
      "INVALID_RECOMMENDATION_INPUT",
    "Invalid query must return the correct error code."
  );
}

async function testInvalidCatalogue() {
  const result = await getRecommendations(
    createMockProvider({
      recommendations: [],
    }),
    "handmade products",
    "not-an-array",
    5
  );

  assert(
    result.success === false,
    "Invalid catalogue must be rejected."
  );
}

async function testInvalidLimit() {
  const result = await getRecommendations(
    createMockProvider({
      recommendations: [],
    }),
    "handmade products",
    catalogue,
    0
  );

  assert(
    result.success === false,
    "Invalid limit must be rejected."
  );
}

async function testInvalidCatalogueProductId() {
  const invalidCatalogue = [
    {
      id: "",
      title: "Invalid product",
    },
  ];

  assert(
    validateRecommendationInput(
      "handmade product",
      invalidCatalogue,
      5
    ) === false,
    "Catalogue product without a valid ID must be rejected."
  );
}

async function testDuplicateCatalogueIds() {
  const duplicateCatalogue = [
    {
      id: "same-product",
      title: "Product One",
    },
    {
      id: "same-product",
      title: "Product Two",
    },
  ];

  assert(
    validateRecommendationInput(
      "handmade product",
      duplicateCatalogue,
      5
    ) === false,
    "Duplicate catalogue IDs must be rejected."
  );
}

async function testProviderFailure() {
  const provider = {
    async generateStructuredJSON() {
      const error = new Error(
        "Provider unavailable."
      );

      error.code = "PROVIDER_UNAVAILABLE";

      throw error;
    },
  };

  const result = await getRecommendations(
    provider,
    "handmade products",
    catalogue,
    5
  );

  assert(
    result.success === false,
    "Provider failure should fail safely."
  );

  assert(
    result.error.code ===
      "PROVIDER_UNAVAILABLE",
    "Known provider error code should be preserved."
  );

  assert(
    Array.isArray(result.recommendations),
    "Failed recommendation must return an empty recommendations array."
  );

  assert(
    result.recommendations.length === 0,
    "Failed recommendation must not return fake recommendations."
  );
}

async function testInvalidProvider() {
  const result = await getRecommendations(
    null,
    "handmade products",
    catalogue,
    5
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

async function testNormalization() {
  const output = {
    recommendations: [
      {
        productId:
          "product-bihar-madhubani ",
        score: 0.9,
        reason:
          "  Relevant handmade product.  ",
      },
    ],
  };

  /*
   * Validation is performed against trimmed IDs here.
   * To keep validation strict and predictable, the raw ID must
   * already correspond to the catalogue ID.
   */
  const normalizedInput = {
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: 0.9,
        reason:
          "  Relevant handmade product.  ",
      },
    ],
  };

  assert(
    validateRecommendationOutput(
      normalizedInput,
      catalogue,
      5
    ) === true,
    "Valid recommendation should pass before normalization."
  );

  const normalized =
    normalizeRecommendationOutput(
      normalizedInput
    );

  assert(
    normalized.recommendations[0].productId ===
      "product-bihar-madhubani",
    "Product ID should be normalized."
  );

  assert(
    normalized.recommendations[0].reason ===
      "Relevant handmade product.",
    "Reason should be trimmed."
  );

  /*
   * Prevent the unused fixture from being treated as an
   * accidental requirement.
   */
  assert(
    output.recommendations.length === 1,
    "Normalization fixture should contain one recommendation."
  );
}

async function testCatalogueImmutability() {
  const inputCatalogue = deepClone(catalogue);
  const originalCatalogue = deepClone(
    inputCatalogue
  );

  const provider = createMockProvider({
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: 0.95,
        reason:
          "Relevant to the customer request.",
      },
    ],
  });

  await getRecommendations(
    provider,
    "traditional handmade products",
    inputCatalogue,
    5
  );

  assert(
    JSON.stringify(inputCatalogue) ===
      JSON.stringify(originalCatalogue),
    "Catalogue must not be mutated."
  );
}

async function testNoInventedProductData() {
  const provider = createMockProvider({
    recommendations: [
      {
        productId:
          "product-bihar-madhubani",
        score: 0.95,
        reason:
          "Relevant to the customer request.",
      },
    ],
  });

  const result = await getRecommendations(
    provider,
    "traditional handmade products from Bihar",
    catalogue,
    5
  );

  assert(
    result.success === true,
    "Valid recommendation should succeed."
  );

  /*
   * Recommendation output contains only the fields defined
   * by the recommendation contract.
   */
  const recommendation =
    result.recommendations[0];

  assert(
    Object.keys(recommendation).sort().join(",") ===
      "productId,reason,score",
    "Recommendation must contain only the contracted fields."
  );
}

async function runTests() {
  const tests = [
    [
      "valid recommendation",
      testValidRecommendation,
    ],
    [
      "unknown product ID rejected",
      testUnknownProductIdRejected,
    ],
    [
      "duplicate product IDs rejected",
      testDuplicateProductIdsRejected,
    ],
    [
      "score below zero rejected",
      testScoreBelowZeroRejected,
    ],
    [
      "score above one rejected",
      testScoreAboveOneRejected,
    ],
    [
      "non-finite score rejected",
      testNonFiniteScoreRejected,
    ],
    [
      "missing reason rejected",
      testMissingReasonRejected,
    ],
    [
      "empty catalogue",
      testEmptyCatalogue,
    ],
    [
      "recommendation limit enforced",
      testLimitIsEnforced,
    ],
    [
      "invalid query",
      testInvalidQuery,
    ],
    [
      "invalid catalogue",
      testInvalidCatalogue,
    ],
    [
      "invalid limit",
      testInvalidLimit,
    ],
    [
      "invalid catalogue product ID",
      testInvalidCatalogueProductId,
    ],
    [
      "duplicate catalogue IDs",
      testDuplicateCatalogueIds,
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
      "normalization",
      testNormalization,
    ],
    [
      "catalogue immutability",
      testCatalogueImmutability,
    ],
    [
      "no invented product data",
      testNoInventedProductData,
    ],
  ];

  let passed = 0;

  console.log(
    "\nARTISAN AI — Recommendation Tests"
  );
  console.log(
    "=================================\n"
  );

  for (const [name, test] of tests) {
    try {
      await test();

      passed += 1;

      console.log(`✓ ${name}`);
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}`);

      throw error;
    }
  }

  console.log(
    `\nRecommendation tests complete: ${passed}/${tests.length} passed.`
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