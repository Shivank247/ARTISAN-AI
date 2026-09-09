/**
 * ARTISAN AI
 * Pricing Evaluation Dataset
 *
 * Ownership:
 * Shivani — AI Search + Pricing
 *
 * Purpose:
 * Evaluate AI price recommendation inputs.
 *
 * IMPORTANT:
 * AI pricing is advisory.
 *
 * AI does NOT:
 * - set the final artisan price
 * - publish products
 * - access PostgreSQL
 * - access Prisma
 *
 * The artisan chooses the final price.
 */

const {
  validatePricingInput,
} = require("../src/pricing/priceValidator");

const PRICING_EVALUATION_DATASET = [
  {
    id: "PRICE-001",

    input: {
      material: "Madhubani handmade paper",
      category: "painting",
      location: "Bihar",
      productType: "handmade painting",
      productionTimeDays: 3,

      productAttributes: {
        handmade: true,
        traditional: true,
      },

      artisanInformation: {
        experienceLevel: "experienced",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: true,
      categoryRequired: true,
    },
  },

  {
    id: "PRICE-002",

    input: {
      material: "terracotta clay",
      category: "pottery",
      location: "West Bengal",
      productType: "handmade pottery",
      productionTimeDays: 2,

      productAttributes: {
        handmade: true,
      },

      artisanInformation: {
        experienceLevel: "intermediate",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: true,
      categoryRequired: true,
    },
  },

  {
    id: "PRICE-003",

    input: {
      material: "cotton",
      category: "textiles",
      location: "Uttar Pradesh",
      productType: "handwoven textile",
      productionTimeDays: 5,

      productAttributes: {
        handmade: true,
        handwoven: true,
      },

      artisanInformation: {
        experienceLevel: "experienced",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: true,
      categoryRequired: true,
    },
  },

  {
    id: "PRICE-004",

    input: {
      material: "silver",
      category: "jewelry",
      location: "Rajasthan",
      productType: "handcrafted jewelry",
      productionTimeDays: 4,

      productAttributes: {
        handmade: true,
      },

      artisanInformation: {
        experienceLevel: "experienced",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: true,
      categoryRequired: true,
    },
  },

  {
    id: "PRICE-005",

    input: {
      material: "bamboo",
      category: "handicrafts",
      location: "Assam",
      productType: "bamboo handicraft",
      productionTimeDays: 2,

      productAttributes: {
        handmade: true,
      },

      artisanInformation: {
        experienceLevel: "beginner",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: true,
      categoryRequired: true,
    },
  },

  {
    id: "PRICE-006",

    input: {
      material: "wood",
      category: "woodwork",
      location: "Karnataka",
      productType: "hand-carved wooden decor",
      productionTimeDays: 7,

      productAttributes: {
        handmade: true,
        carved: true,
      },

      artisanInformation: {
        experienceLevel: "experienced",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: true,
      categoryRequired: true,
    },
  },

  {
    id: "PRICE-007",

    input: {
      material: "brass",
      category: "metalwork",
      location: "Gujarat",
      productType: "traditional brass craft",
      productionTimeDays: 6,

      productAttributes: {
        handmade: true,
        traditional: true,
      },

      artisanInformation: {
        experienceLevel: "experienced",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: true,
      categoryRequired: true,
    },
  },

  {
    id: "PRICE-008",

    input: {
      material: "natural fiber",
      category: "home decor",
      location: "Odisha",
      productType: "handmade home decor",
      productionTimeDays: 3,

      productAttributes: {
        handmade: true,
      },

      artisanInformation: {
        experienceLevel: "intermediate",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: true,
      categoryRequired: true,
    },
  },

  {
    id: "PRICE-009",

    input: {
      material: "fabric",
      category: "accessories",
      location: "Maharashtra",
      productType: "handmade accessory",
      productionTimeDays: 2,

      productAttributes: {
        handmade: true,
      },

      artisanInformation: {
        experienceLevel: "intermediate",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: true,
      categoryRequired: true,
    },
  },

  {
    id: "PRICE-010",

    /*
     * Intentionally incomplete material.
     *
     * This verifies that the evaluation layer
     * does not require information that may be
     * unavailable.
     */
    input: {
      material: null,
      category: "painting",
      location: "Bihar",
      productType: "handmade painting",
      productionTimeDays: 3,

      productAttributes: {
        handmade: true,
      },

      artisanInformation: {
        experienceLevel: "beginner",
      },

      catalogueContext: [],
    },

    expectedSignals: {
      shouldRecommendPrice: true,
      materialRequired: false,
      categoryRequired: true,
    },
  },
];

/**
 * Validate one pricing evaluation case.
 */
function validatePricingEvaluationCase(
  testCase
) {
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
    !testCase.input ||
    typeof testCase.input !== "object" ||
    Array.isArray(testCase.input)
  ) {
    return false;
  }

  if (
    !testCase.expectedSignals ||
    typeof testCase.expectedSignals !== "object" ||
    Array.isArray(testCase.expectedSignals)
  ) {
    return false;
  }

  if (
    typeof testCase.expectedSignals.shouldRecommendPrice !==
      "boolean"
  ) {
    return false;
  }

  if (
    typeof testCase.expectedSignals.materialRequired !==
      "boolean"
  ) {
    return false;
  }

  if (
    typeof testCase.expectedSignals.categoryRequired !==
      "boolean"
  ) {
    return false;
  }

  return validatePricingInput(
    testCase.input
  );
}

/**
 * Validate the complete pricing evaluation dataset.
 */
function validatePricingEvaluationDataset(
  dataset = PRICING_EVALUATION_DATASET
) {
  if (!Array.isArray(dataset)) {
    return false;
  }

  if (dataset.length === 0) {
    return false;
  }

  const ids = new Set();

  for (const testCase of dataset) {
    if (
      !validatePricingEvaluationCase(
        testCase
      )
    ) {
      return false;
    }

    if (ids.has(testCase.id)) {
      return false;
    }

    ids.add(testCase.id);
  }

  return true;
}

/**
 * IMPORTANT:
 * These export names must match the imports
 * used by evaluationTest.js.
 */
module.exports = {
  PRICING_EVALUATION_DATASET,
  validatePricingEvaluationCase,
  validatePricingEvaluationDataset,
};
