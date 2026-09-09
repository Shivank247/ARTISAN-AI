/**
 * ARTISAN AI
 * Pricing Tests
 *
 * Deterministic unit tests.
 *
 * These tests:
 * - do not require PostgreSQL
 * - do not require Prisma
 * - do not call Gemini
 * - do not require an API key
 * - do not modify database data
 */

const {
  generatePriceRecommendation,
} = require("./priceService");

const {
  validatePricingInput,
  validatePriceRange,
  validatePricingRecommendation,
} = require("./priceValidator");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const validInput = {
  material: "Handwoven cotton",
  category: "textiles",
  location: "Bihar",
  productType: "handmade textile",
  productionTimeDays: 5,
  productAttributes: {
    handmade: true,
    weave: "traditional",
  },
  artisanInformation: {
    experienceYears: 8,
  },
  catalogueContext: [],
};

function createMockProvider(recommendation) {
  return {
    async generateStructuredJSON() {
      return recommendation;
    },
  };
}

async function testValidRecommendation() {
  const input = validInput;

  const provider = createMockProvider({
    suggestedPrice: 899,
    priceRange: {
      min: 799,
      max: 999,
    },
    reason: "Based on the supplied product information.",
    confidence: 0.8,
  });

  const result = await generatePriceRecommendation(
    input,
    provider
  );

  assert(
    result.success === true,
    "Valid recommendation should succeed."
  );

  assert(
    result.recommendation.suggestedPrice === 899,
    "suggestedPrice should be 899."
  );

  assert(
    result.recommendation.priceRange.min === 799,
    "Minimum price should be 799."
  );

  assert(
    result.recommendation.priceRange.max === 999,
    "Maximum price should be 999."
  );

  assert(
    result.recommendation.confidence === 0.8,
    "Confidence should be 0.8."
  );

  assert(
    result.isRecommendation === true,
    "Result must be marked as a recommendation."
  );

  assert(
    result.artisanDecidesFinalPrice === true,
    "Artisan must decide the final price."
  );
}

async function testMissingMaterialIsAllowed() {
  const input = {
    ...validInput,
    material: null,
  };

  assert(
    validatePricingInput(input) === true,
    "Missing material should be allowed."
  );
}

async function testMissingMaterialIsNotInvented() {
  const input = {
    ...validInput,
    material: null,
  };

  const provider = {
    async generateStructuredJSON({ input: providerInput }) {
      assert(
        providerInput.material === null,
        "Provider must receive the missing material as null."
      );

      return {
        suggestedPrice: 899,
        priceRange: {
          min: 799,
          max: 999,
        },
        reason:
          "Recommendation based only on the supplied information.",
        confidence: 0.7,
      };
    },
  };

  const result = await generatePriceRecommendation(
    input,
    provider
  );

  assert(
    result.success === true,
    "Recommendation with missing material should remain valid."
  );
}

async function testNegativeProductionTime() {
  const input = {
    ...validInput,
    productionTimeDays: -1,
  };

  assert(
    validatePricingInput(input) === false,
    "Negative production time must fail validation."
  );
}

async function testStringProductionTime() {
  const input = {
    ...validInput,
    productionTimeDays: "5",
  };

  assert(
    validatePricingInput(input) === false,
    "String production time must fail validation."
  );
}

async function testInvalidConfidence() {
  const recommendation = {
    suggestedPrice: 899,
    priceRange: {
      min: 799,
      max: 999,
    },
    reason: "Valid reason.",
    confidence: 1.5,
  };

  assert(
    validatePricingRecommendation(recommendation) === false,
    "Confidence above 1 must fail validation."
  );
}

async function testNegativeSuggestedPrice() {
  const recommendation = {
    suggestedPrice: -100,
    priceRange: {
      min: 0,
      max: 999,
    },
    reason: "Invalid price.",
    confidence: 0.8,
  };

  assert(
    validatePricingRecommendation(recommendation) === false,
    "Negative suggested price must fail validation."
  );
}

async function testSuggestedPriceOutsideRange() {
  const recommendation = {
    suggestedPrice: 1200,
    priceRange: {
      min: 799,
      max: 999,
    },
    reason: "Suggested price is outside the range.",
    confidence: 0.8,
  };

  assert(
    validatePricingRecommendation(recommendation) === false,
    "Suggested price outside the range must fail validation."
  );
}

async function testInvalidRange() {
  assert(
    validatePriceRange({
      min: 999,
      max: 799,
    }) === false,
    "Reversed price range must fail validation."
  );
}

async function testInvalidReason() {
  const recommendation = {
    suggestedPrice: 899,
    priceRange: {
      min: 799,
      max: 999,
    },
    reason: "",
    confidence: 0.8,
  };

  assert(
    validatePricingRecommendation(recommendation) === false,
    "Empty reason must fail validation."
  );
}

async function testProviderFailure() {
  const provider = {
    async generateStructuredJSON() {
      const error = new Error("Provider unavailable.");
      error.code = "PROVIDER_UNAVAILABLE";
      throw error;
    },
  };

  const result = await generatePriceRecommendation(
    validInput,
    provider
  );

  assert(
    result.success === false,
    "Provider failure should return success=false."
  );

  assert(
    result.error.code === "PROVIDER_UNAVAILABLE",
    "Known provider error code should be preserved."
  );

  assert(
    result.recommendation === null,
    "Failed recommendation must be null."
  );

  assert(
    result.artisanDecidesFinalPrice === true,
    "Artisan decision rule must remain true on failure."
  );
}

async function testInvalidProvider() {
  const result = await generatePriceRecommendation(
    validInput,
    {}
  );

  assert(
    result.success === false,
    "Invalid provider should fail."
  );

  assert(
    result.error.code === "INVALID_PROVIDER",
    "Invalid provider must return INVALID_PROVIDER."
  );
}

async function testInvalidInput() {
  const invalidInput = {
    ...validInput,
    category: 123,
  };

  const result = await generatePriceRecommendation(
    invalidInput,
    createMockProvider({
      suggestedPrice: 899,
      priceRange: {
        min: 799,
        max: 999,
      },
      reason: "Should not be used.",
      confidence: 0.8,
    })
  );

  assert(
    result.success === false,
    "Invalid input must fail."
  );

  assert(
    result.error.code === "INVALID_PRICING_INPUT",
    "Invalid input must return INVALID_PRICING_INPUT."
  );
}

async function testNoFinalPrice() {
  const provider = createMockProvider({
    suggestedPrice: 899,
    priceRange: {
      min: 799,
      max: 999,
    },
    reason: "Valid recommendation.",
    confidence: 0.8,
    finalPrice: 950,
  });

  const result = await generatePriceRecommendation(
    validInput,
    provider
  );

  assert(
    result.success === false,
    "AI output containing finalPrice must be rejected."
  );
}

async function testInputImmutability() {
  const input = deepClone(validInput);
  const original = deepClone(input);

  const provider = createMockProvider({
    suggestedPrice: 899,
    priceRange: {
      min: 799,
      max: 999,
    },
    reason: "Valid recommendation.",
    confidence: 0.8,
  });

  await generatePriceRecommendation(
    input,
    provider
  );

  assert(
    JSON.stringify(input) === JSON.stringify(original),
    "Pricing input must not be mutated."
  );
}

async function testOutputNormalization() {
  const provider = createMockProvider({
    suggestedPrice: 899,
    priceRange: {
      min: 799,
      max: 999,
    },
    reason: "  Valid recommendation.  ",
    confidence: 0.8,
  });

  const result = await generatePriceRecommendation(
    validInput,
    provider
  );

  assert(
    result.success === true,
    "Valid output should succeed."
  );

  assert(
    result.recommendation.reason ===
      "Valid recommendation.",
    "Reason should be trimmed."
  );
}

async function testNonFiniteSuggestedPrice() {
  const recommendation = {
    suggestedPrice: Infinity,
    priceRange: {
      min: 799,
      max: 999,
    },
    reason: "Invalid non-finite price.",
    confidence: 0.8,
  };

  assert(
    validatePricingRecommendation(recommendation) === false,
    "Infinity suggestedPrice must fail validation."
  );
}

async function testNonFiniteConfidence() {
  const recommendation = {
    suggestedPrice: 899,
    priceRange: {
      min: 799,
      max: 999,
    },
    reason: "Invalid non-finite confidence.",
    confidence: NaN,
  };

  assert(
    validatePricingRecommendation(recommendation) === false,
    "NaN confidence must fail validation."
  );
}

async function runTests() {
  const tests = [
    ["valid recommendation", testValidRecommendation],
    ["missing material allowed", testMissingMaterialIsAllowed],
    ["missing material not invented", testMissingMaterialIsNotInvented],
    ["negative production time", testNegativeProductionTime],
    ["string production time", testStringProductionTime],
    ["invalid confidence", testInvalidConfidence],
    ["negative suggested price", testNegativeSuggestedPrice],
    ["suggested price outside range", testSuggestedPriceOutsideRange],
    ["invalid range", testInvalidRange],
    ["invalid reason", testInvalidReason],
    ["provider failure", testProviderFailure],
    ["invalid provider", testInvalidProvider],
    ["invalid input", testInvalidInput],
    ["finalPrice rejected", testNoFinalPrice],
    ["input immutability", testInputImmutability],
    ["output normalization", testOutputNormalization],
    ["non-finite suggested price", testNonFiniteSuggestedPrice],
    ["non-finite confidence", testNonFiniteConfidence],
  ];

  let passed = 0;

  console.log("\nARTISAN AI \u2014 Pricing Tests");
  console.log("==========================\n");

  for (const [name, test] of tests) {
    try {
      await test();
      passed += 1;
      console.log(`âœ“ ${name}`);
    } catch (error) {
      console.error(`âœ— ${name}`);
      console.error(`  ${error.message}`);
      throw error;
    }
  }

  console.log(
    `\nPricing tests complete: ${passed}/${tests.length} passed.`
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