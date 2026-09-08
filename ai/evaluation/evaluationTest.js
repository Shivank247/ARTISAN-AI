/**
 * ARTISAN AI
 * Evaluation Test Runner
 *
 * Ownership:
 * Shivani — AI Search + Pricing
 *
 * Purpose:
 * Validate Search and Pricing evaluation datasets.
 *
 * IMPORTANT:
 * - No PostgreSQL
 * - No Prisma
 * - No database access
 * - No network access
 * - No real AI provider
 * - No product creation
 * - No fake product IDs
 *
 * Search:
 * Natural-language query
 *        ↓
 * Structured filters
 *
 * Pricing:
 * Product information
 *        ↓
 * AI price recommendation structure
 *
 * The final product price is always decided
 * by the artisan and stored by the backend.
 */

const {
  parseSearchQuery,
} = require("../src/search/searchParser");

const {
  validateSearchFilters,
} = require("../src/search/searchValidator");

const {
  validatePricingInput,
  validatePriceRange,
  validatePricingRecommendation,
} = require("../src/pricing/priceValidator");

const {
  SEARCH_EVALUATION_DATASET,
  validateSearchEvaluationDataset,
} = require("./searchEvaluationDataset");

const {
  PRICING_EVALUATION_DATASET,
  validatePricingEvaluationDataset,
} = require("./pricingEvaluationDataset");


/* =========================================================
   ASSERTION
========================================================= */

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}


/* =========================================================
   DEEP CLONE
========================================================= */

function deepClone(value) {
  return JSON.parse(
    JSON.stringify(value)
  );
}


/* =========================================================
   SEARCH FILTER COMPARISON
========================================================= */

function compareSearchFilters(
  actual,
  expected,
  testId,
  query
) {
  assert(
    actual &&
      typeof actual === "object" &&
      !Array.isArray(actual),
    `${testId}: Parser did not return a valid object.\nQuery: ${query}`
  );

  /*
   * State
   */
  assert(
    actual.state === expected.state,
    `${testId}: Expected state "${expected.state}", got "${actual.state}".\nQuery: ${query}`
  );

  /*
   * Category
   */
  assert(
    actual.category === expected.category,
    `${testId}: Expected category "${expected.category}", got "${actual.category}".\nQuery: ${query}`
  );

  /*
   * Minimum price
   */
  assert(
    actual.minPrice === expected.minPrice,
    `${testId}: Expected minPrice "${expected.minPrice}", got "${actual.minPrice}".\nQuery: ${query}\nActual: ${JSON.stringify(actual)}`
  );

  /*
   * Maximum price
   */
  assert(
    actual.maxPrice === expected.maxPrice,
    `${testId}: Expected maxPrice "${expected.maxPrice}", got "${actual.maxPrice}".\nQuery: ${query}\nActual: ${JSON.stringify(actual)}`
  );

  /*
   * Keywords
   */
  assert(
    Array.isArray(actual.keywords),
    `${testId}: Actual keywords must be an array.\nQuery: ${query}`
  );

  assert(
    actual.keywords.length ===
      expected.keywords.length,
    `${testId}: Expected ${expected.keywords.length} keywords, got ${actual.keywords.length}.\nQuery: ${query}\nExpected: ${JSON.stringify(expected.keywords)}\nActual: ${JSON.stringify(actual.keywords)}`
  );

  for (
    let index = 0;
    index < expected.keywords.length;
    index += 1
  ) {
    assert(
      actual.keywords[index] ===
        expected.keywords[index],
      `${testId}: Keyword mismatch at index ${index}.\nExpected: "${expected.keywords[index]}"\nActual: "${actual.keywords[index]}"\nQuery: ${query}`
    );
  }
}


/* =========================================================
   SEARCH DATASET STRUCTURE
========================================================= */

function testSearchDatasetStructure() {
  assert(
    validateSearchEvaluationDataset(),
    "Search evaluation dataset is invalid."
  );

  assert(
    SEARCH_EVALUATION_DATASET.length === 15,
    `Expected 15 search evaluation cases, got ${SEARCH_EVALUATION_DATASET.length}.`
  );

  console.log(
    "✓ Search dataset structure"
  );
}


/* =========================================================
   PRICING DATASET STRUCTURE
========================================================= */

function testPricingDatasetStructure() {
  assert(
    validatePricingEvaluationDataset(),
    "Pricing evaluation dataset is invalid."
  );

  assert(
    PRICING_EVALUATION_DATASET.length === 10,
    `Expected 10 pricing evaluation cases, got ${PRICING_EVALUATION_DATASET.length}.`
  );

  console.log(
    "✓ Pricing dataset structure"
  );
}


/* =========================================================
   SEARCH EVALUATION
========================================================= */

function testSearchCases() {
  let passed = 0;

  for (
    const testCase of SEARCH_EVALUATION_DATASET
  ) {
    const actual =
      parseSearchQuery(
        testCase.query
      );

    /*
     * Parser output must satisfy the
     * structured search filter contract.
     */
    assert(
      validateSearchFilters(actual),
      `${testCase.id}: Parser returned invalid search filters.\nQuery: ${testCase.query}\nActual: ${JSON.stringify(actual)}`
    );

    /*
     * Compare against expected evaluation output.
     */
    compareSearchFilters(
      actual,
      testCase.expected,
      testCase.id,
      testCase.query
    );

    console.log(
      `✓ ${testCase.id} — ${testCase.query}`
    );

    passed += 1;
  }

  return passed;
}


/* =========================================================
   SEARCH OUTPUT INTEGRITY
========================================================= */

function testSearchOutputIntegrity() {
  const allowedKeys = [
    "state",
    "category",
    "minPrice",
    "maxPrice",
    "keywords",
  ];

  for (
    const testCase of SEARCH_EVALUATION_DATASET
  ) {
    const actual =
      parseSearchQuery(
        testCase.query
      );

    const actualKeys =
      Object.keys(actual).sort();

    const expectedKeys =
      [...allowedKeys].sort();

    /*
     * Search parser must return only
     * the agreed structured filters.
     */
    assert(
      JSON.stringify(actualKeys) ===
        JSON.stringify(expectedKeys),
      `${testCase.id}: Search parser returned unexpected fields.\nActual fields: ${JSON.stringify(actualKeys)}`
    );

    /*
     * Search parser must never invent
     * product IDs.
     */
    assert(
      !Object.prototype.hasOwnProperty.call(
        actual,
        "productIds"
      ),
      `${testCase.id}: Search parser must not return productIds.`
    );

    /*
     * Search parser must never return
     * invented products.
     */
    assert(
      !Object.prototype.hasOwnProperty.call(
        actual,
        "products"
      ),
      `${testCase.id}: Search parser must not return products.`
    );
  }

  console.log(
    "✓ Search output integrity"
  );
}


/* =========================================================
   SEARCH IMMUTABILITY
========================================================= */

function testSearchParserDoesNotMutateQuery() {
  for (
    const testCase of SEARCH_EVALUATION_DATASET
  ) {
    const original =
      testCase.query;

    parseSearchQuery(
      testCase.query
    );

    assert(
      testCase.query === original,
      `${testCase.id}: Query was unexpectedly mutated.`
    );
  }

  console.log(
    "✓ Search immutability"
  );
}


/* =========================================================
   PRICING INPUT VALIDATION
========================================================= */

function testPricingInputIntegrity() {
  for (
    const testCase of PRICING_EVALUATION_DATASET
  ) {
    const original =
      deepClone(
        testCase.input
      );

    assert(
      validatePricingInput(
        testCase.input
      ),
      `${testCase.id}: Pricing input is invalid.`
    );

    assert(
      JSON.stringify(
        testCase.input
      ) ===
        JSON.stringify(original),
      `${testCase.id}: Pricing input was mutated.`
    );
  }

  console.log(
    "✓ Pricing input validation and integrity"
  );
}


/* =========================================================
   PRICING RANGE VALIDATION
========================================================= */

function testPricingValidationStructures() {
  const validRanges = [
    {
      min: 100,
      max: 500,
    },

    {
      min: 799,
      max: 999,
    },

    {
      min: 1000,
      max: 1000,
    },
  ];

  for (
    const range of validRanges
  ) {
    assert(
      validatePriceRange(range),
      `Valid price range failed: ${JSON.stringify(range)}`
    );
  }

  const invalidRanges = [
    {
      min: -1,
      max: 500,
    },

    {
      min: 500,
      max: 100,
    },

    {
      min: NaN,
      max: 500,
    },

    {
      min: 100,
      max: Infinity,
    },
  ];

  for (
    const range of invalidRanges
  ) {
    assert(
      !validatePriceRange(range),
      `Invalid price range incorrectly passed: ${JSON.stringify(range)}`
    );
  }

  console.log(
    "✓ Pricing range validation"
  );
}


/* =========================================================
   VALID PRICING RECOMMENDATION
========================================================= */

function testValidPricingRecommendation() {
  const recommendation = {
    suggestedPrice: 899,

    priceRange: {
      min: 799,
      max: 999,
    },

    reason:
      "The suggested price reflects the supplied material, category and production details.",

    confidence: 0.8,
  };

  assert(
    validatePricingRecommendation(
      recommendation
    ),
    "Valid pricing recommendation should pass."
  );

  /*
   * Suggested price must be inside
   * the recommended range.
   */
  assert(
    recommendation.suggestedPrice >=
      recommendation.priceRange.min,
    "Suggested price is below the minimum range."
  );

  assert(
    recommendation.suggestedPrice <=
      recommendation.priceRange.max,
    "Suggested price is above the maximum range."
  );

  console.log(
    "✓ Valid pricing recommendation"
  );
}


/* =========================================================
   INVALID PRICING RECOMMENDATIONS
========================================================= */

function testInvalidPricingRecommendations() {
  const invalidRecommendations = [
    {
      suggestedPrice: -10,

      priceRange: {
        min: 100,
        max: 500,
      },

      reason:
        "Invalid price.",

      confidence: 0.8,
    },

    {
      suggestedPrice: 900,

      priceRange: {
        min: 1000,
        max: 1200,
      },

      reason:
        "Price outside range.",

      confidence: 0.8,
    },

    {
      suggestedPrice: 900,

      priceRange: {
        min: 800,
        max: 1000,
      },

      reason:
        "Invalid confidence.",

      confidence: 1.5,
    },

    {
      suggestedPrice: 900,

      priceRange: {
        min: 800,
        max: 1000,
      },

      reason: "",

      confidence: 0.8,
    },
  ];

  for (
    const recommendation of
      invalidRecommendations
  ) {
    assert(
      !validatePricingRecommendation(
        recommendation
      ),
      `Invalid pricing recommendation incorrectly passed: ${JSON.stringify(recommendation)}`
    );
  }

  console.log(
    "✓ Invalid pricing recommendations"
  );
}


/* =========================================================
   PRICING CONTRACT SEMANTICS
========================================================= */

function testPricingContractSemantics() {
  const recommendation = {
    suggestedPrice: 899,

    priceRange: {
      min: 799,
      max: 999,
    },

    reason:
      "Suggested price based on the supplied product information.",

    confidence: 0.8,
  };

  assert(
    validatePricingRecommendation(
      recommendation
    ),
    "Pricing recommendation should be valid."
  );

  /*
   * Locked API/AI contract field.
   */
  assert(
    Object.prototype.hasOwnProperty.call(
      recommendation,
      "suggestedPrice"
    ),
    "Pricing must use suggestedPrice."
  );

  /*
   * Do not silently rename the contract field.
   */
  assert(
    !Object.prototype.hasOwnProperty.call(
      recommendation,
      "recommendedPrice"
    ),
    "Pricing must not rename suggestedPrice to recommendedPrice."
  );

  /*
   * AI recommendation is not the artisan's
   * final database price.
   */
  assert(
    !Object.prototype.hasOwnProperty.call(
      recommendation,
      "finalPrice"
    ),
    "AI pricing recommendation must not contain finalPrice."
  );

  console.log(
    "✓ Pricing contract semantics"
  );
}


/* =========================================================
   DETERMINISTIC PROVIDER
========================================================= */

function createDeterministicProvider() {
  return {
    async generateStructuredJSON({
      input,
    }) {
      /*
       * Deterministic search output.
       *
       * This is only for evaluation and does not
       * access a real AI provider.
       */
      if (
        input &&
        Object.prototype.hasOwnProperty.call(
          input,
          "query"
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

      /*
       * Deterministic pricing output.
       */
      return {
        suggestedPrice: 899,

        priceRange: {
          min: 799,
          max: 999,
        },

        reason:
          "Deterministic evaluation recommendation.",

        confidence: 0.8,
      };
    },
  };
}


/* =========================================================
   DETERMINISTIC PROVIDER TEST
========================================================= */

async function testDeterministicProvider() {
  const provider =
    createDeterministicProvider();

  /*
   * Search provider output.
   */
  const searchResult =
    await provider.generateStructuredJSON({
      input: {
        query:
          "handmade products",
      },
    });

  assert(
    validateSearchFilters(
      searchResult
    ),
    "Deterministic search provider output is invalid."
  );

  /*
   * Pricing provider output.
   */
  const pricingResult =
    await provider.generateStructuredJSON({
      input: {
        material: "wood",
        category: "woodwork",
      },
    });

  assert(
    validatePricingRecommendation(
      pricingResult
    ),
    "Deterministic pricing provider output is invalid."
  );

  console.log(
    "✓ Deterministic provider"
  );
}


/* =========================================================
   MAIN EVALUATION
========================================================= */

async function runEvaluation() {
  console.log(
    "\nARTISAN AI — Evaluation Tests"
  );

  console.log(
    "=============================\n"
  );

  /*
   * -------------------------------------------------------
   * DATASET VALIDATION
   * -------------------------------------------------------
   */

  console.log(
    "Validating evaluation datasets..."
  );

  testSearchDatasetStructure();

  testPricingDatasetStructure();

  /*
   * -------------------------------------------------------
   * SEARCH
   * -------------------------------------------------------
   */

  console.log(
    "\nRunning search evaluation...\n"
  );

  const searchPassed =
    testSearchCases();

  testSearchOutputIntegrity();

  testSearchParserDoesNotMutateQuery();

  console.log(
    `\nSearch evaluation: ${searchPassed}/${SEARCH_EVALUATION_DATASET.length} passed.`
  );

  /*
   * -------------------------------------------------------
   * PRICING
   * -------------------------------------------------------
   */

  console.log(
    "\nRunning pricing evaluation...\n"
  );

  testPricingInputIntegrity();

  testPricingValidationStructures();

  testValidPricingRecommendation();

  testInvalidPricingRecommendations();

  testPricingContractSemantics();

  /*
   * -------------------------------------------------------
   * PROVIDER
   * -------------------------------------------------------
   */

  await testDeterministicProvider();

  /*
   * -------------------------------------------------------
   * SUCCESS
   * -------------------------------------------------------
   */

  console.log(
    "\n================================="
  );

  console.log(
    "ARTISAN AI evaluation completed successfully."
  );

  console.log(
    `Search cases: ${SEARCH_EVALUATION_DATASET.length}`
  );

  console.log(
    `Pricing cases: ${PRICING_EVALUATION_DATASET.length}`
  );

  console.log(
    "Network: NOT USED"
  );

  console.log(
    "Database: NOT USED"
  );

  console.log(
    "Prisma: NOT USED"
  );

  console.log(
    "=================================\n"
  );
}


/* =========================================================
   CLI
========================================================= */

if (
  require.main === module
) {
  runEvaluation()
    .catch(
      (error) => {
        console.error(
          "\n✗ Evaluation failed."
        );

        console.error(
          error.message
        );

        process.exitCode = 1;
      }
    );
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  runEvaluation,
  createDeterministicProvider,
};