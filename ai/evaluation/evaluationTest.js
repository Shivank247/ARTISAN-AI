/**
 * ARTISAN AI
 * Evaluation Test Suite
 *
 * Validates:
 * - Search evaluation dataset
 * - Pricing evaluation dataset
 */

const {
  SEARCH_EVALUATION_DATASET,
  validateSearchEvaluationDataset,
} = require("./searchEvaluationDataset");

const {
  PRICING_EVALUATION_DATASET,
  validatePricingEvaluationDataset,
} = require("./pricingEvaluationDataset");

const {
  validatePricingRecommendation,
} = require("../src/pricing/priceValidator");

// ---------------------------------------------------------
// Test helper
// ---------------------------------------------------------

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// ---------------------------------------------------------
// Search evaluation dataset tests
// ---------------------------------------------------------

function testSearchDatasetExists() {
  assert(
    Array.isArray(SEARCH_EVALUATION_DATASET),
    "Search evaluation dataset must be an array."
  );
}

function testSearchDatasetCount() {
  assert(
    SEARCH_EVALUATION_DATASET.length === 21,
    `Expected 21 search evaluation cases, found ${SEARCH_EVALUATION_DATASET.length}.`
  );
}

function testSearchDatasetValidation() {
  assert(
    validateSearchEvaluationDataset() === true,
    "Search evaluation dataset validation failed."
  );
}

function testSearchDatasetIds() {
  const ids = SEARCH_EVALUATION_DATASET.map((testCase) => testCase.id);

  const uniqueIds = new Set(ids);

  assert(
    uniqueIds.size === ids.length,
    "Search evaluation dataset contains duplicate IDs."
  );
}

function testSearchDatasetQueries() {
  for (const testCase of SEARCH_EVALUATION_DATASET) {
    assert(
      typeof testCase.query === "string" &&
        testCase.query.trim().length > 0,
      `Invalid search query in ${testCase.id}.`
    );
  }
}

function testSearchExpectedStructure() {
  const requiredFields = [
    "state",
    "category",
    "minPrice",
    "maxPrice",
    "keywords",
  ];

  for (const testCase of SEARCH_EVALUATION_DATASET) {
    for (const field of requiredFields) {
      assert(
        Object.prototype.hasOwnProperty.call(testCase.expected, field),
        `${testCase.id} is missing expected field: ${field}`
      );
    }
  }
}

// ---------------------------------------------------------
// UTF-8 / currency evaluation tests
// ---------------------------------------------------------

function testIndianRupeeCases() {
  const rupeeCases = SEARCH_EVALUATION_DATASET.filter((testCase) =>
    testCase.query.includes("\u20B9")
  );

  assert(
    rupeeCases.length >= 4,
    `Expected at least 4 \u20B9 test cases, found ${rupeeCases.length}.`
  );

  for (const testCase of rupeeCases) {
    assert(
      !testCase.query.includes("\u0393\u00E9\u2563"),
      `${testCase.id} contains corrupted UTF-8 characters.`
    );
  }
}

function testRsCase() {
  const testCase = SEARCH_EVALUATION_DATASET.find(
    (item) => item.id === "SEARCH-020"
  );

  assert(testCase, "SEARCH-020 is missing.");

  assert(
    testCase.query === "woodwork under Rs 2000",
    "SEARCH-020 query is incorrect."
  );

  assert(
    testCase.expected.maxPrice === 2000,
    "SEARCH-020 maxPrice must be 2000."
  );
}

function testINRCase() {
  const testCase = SEARCH_EVALUATION_DATASET.find(
    (item) => item.id === "SEARCH-021"
  );

  assert(testCase, "SEARCH-021 is missing.");

  assert(
    testCase.query === "products under INR 1500",
    "SEARCH-021 query is incorrect."
  );

  assert(
    testCase.expected.maxPrice === 1500,
    "SEARCH-021 maxPrice must be 1500."
  );
}

// ---------------------------------------------------------
// Pricing evaluation dataset tests
// ---------------------------------------------------------

function testPricingDatasetExists() {
  assert(
    Array.isArray(PRICING_EVALUATION_DATASET),
    "Pricing evaluation dataset must be an array."
  );
}

function testPricingDatasetValidation() {
  assert(
    validatePricingEvaluationDataset() === true,
    "Pricing evaluation dataset validation failed."
  );
}

function testPricingDatasetIds() {
  const ids = PRICING_EVALUATION_DATASET.map((testCase) => testCase.id);

  const uniqueIds = new Set(ids);

  assert(
    uniqueIds.size === ids.length,
    "Pricing evaluation dataset contains duplicate IDs."
  );
}

// ---------------------------------------------------------
// Pricing recommendation validation
// ---------------------------------------------------------

function testValidPricingRecommendation() {
  const recommendation = {
    suggestedPrice: 899,
    priceRange: {
      min: 799,
      max: 999,
    },
    confidence: 0.8,
    reason: "Based on comparable handmade products and material costs.",
  };

  const result = validatePricingRecommendation(recommendation);

  assert(
    result === true,
    "Valid pricing recommendation should pass validation."
  );
}

// ---------------------------------------------------------
// Run all tests
// ---------------------------------------------------------

const tests = [
  ["Search dataset exists", testSearchDatasetExists],
  ["Search dataset count", testSearchDatasetCount],
  ["Search dataset validation", testSearchDatasetValidation],
  ["Search dataset IDs", testSearchDatasetIds],
  ["Search dataset queries", testSearchDatasetQueries],
  ["Search expected structure", testSearchExpectedStructure],

  ["UTF-8 \u20B9 cases", testIndianRupeeCases],
  ["Rs currency case", testRsCase],
  ["INR currency case", testINRCase],

  ["Pricing dataset exists", testPricingDatasetExists],
  ["Pricing dataset validation", testPricingDatasetValidation],
  ["Pricing dataset IDs", testPricingDatasetIds],
  ["Pricing recommendation validation", testValidPricingRecommendation],
];

let passed = 0;
let failed = 0;

console.log("\n========================================");
console.log("ARTISAN AI \u2014 EVALUATION TESTS");
console.log("========================================\n");

for (const [name, test] of tests) {
  try {
    test();
    console.log(`\u2713 ${name}`);
    passed++;
  } catch (error) {
    console.error(`\u2717 ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

console.log("\n========================================");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log("========================================\n");

if (failed > 0) {
  process.exit(1);
}

console.log("All evaluation tests passed.");