/**
 * Search Tests
 *
 * IMPORTANT:
 * The products array in this file is TEST DATA ONLY.
 *
 * Production search must receive real products
 * from the backend/database.
 *
 * These tests verify:
 * - Natural-language parsing
 * - Multi-word Indian states
 * - Price filters
 * - Comma-formatted prices
 * - Category filters
 * - Search filtering
 * - Empty results
 * - No fictional products
 * - Catalogue immutability
 * - Real ₹ Unicode input
 * - Rs and INR price formats
 * - Reversed price ranges
 */

import assert from "node:assert";

import {
  parseSearchQuery
} from "./searchParser.js";

import {
  filterProducts
} from "./searchService.js";

/*
 * ============================================================
 * TEST-ONLY PRODUCT CATALOGUE
 * ============================================================
 *
 * DO NOT USE THIS ARRAY IN PRODUCTION.
 */

const products = [
  {
    id: 1,
    title: "Madhubani Painting",
    description:
      "Traditional handmade Madhubani painting",
    material: "Natural colors",
    category: "painting",
    state: "Bihar",
    price: 899,
    tags: [
      "traditional",
      "handmade",
      "madhubani"
    ]
  },

  {
    id: 2,
    title: "Handmade Clay Pot",
    description:
      "Traditional handmade clay pottery",
    material: "Clay",
    category: "pottery",
    state: "Bihar",
    price: 450,
    tags: [
      "traditional",
      "handmade",
      "pottery"
    ]
  },

  {
    id: 3,
    title: "Handwoven Textile",
    description:
      "Traditional handwoven textile",
    material: "Cotton",
    category: "textile",
    state: "West Bengal",
    price: 1200,
    tags: [
      "traditional",
      "handwoven",
      "textile"
    ]
  },

  {
    id: 4,
    title: "Uttar Pradesh Wooden Craft",
    description:
      "Traditional handmade wooden craft",
    material: "Wood",
    category: "handicraft",
    state: "Uttar Pradesh",
    price: 750,
    tags: [
      "traditional",
      "handmade",
      "wood"
    ]
  },

  {
    id: 5,
    title: "Madhya Pradesh Handicraft",
    description:
      "Traditional handmade handicraft",
    material: "Wood",
    category: "handicraft",
    state: "Madhya Pradesh",
    price: 950,
    tags: [
      "traditional",
      "handmade"
    ]
  }
];

/*
 * ============================================================
 * TEST RUNNER
 * ============================================================
 */

let passed = 0;
let failed = 0;

function test(
  name,
  testFunction
) {
  try {
    testFunction();

    console.log(
      `✓ ${name}`
    );

    passed++;
  } catch (error) {
    console.error(
      `✗ ${name}`
    );

    console.error(
      `  ${error.message}`
    );

    failed++;
  }
}

/*
 * ============================================================
 * TEST 1
 * Bihar + under ₹1000
 * ============================================================
 */

test(
  "Bihar products under ₹1000",
  () => {
    const filters =
      parseSearchQuery(
        "Show me traditional handmade products from Bihar under ₹1000"
      );

    assert.strictEqual(
      filters.state,
      "Bihar"
    );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );

    const results =
      filterProducts(
        products,
        filters
      );

    assert.strictEqual(
      results.length,
      2
    );

    assert(
      results.every(
        product =>
          product.state ===
            "Bihar" &&
          product.price <= 1000
      )
    );
  }
);

/*
 * ============================================================
 * TEST 2
 * West Bengal
 * ============================================================
 */

test(
  "West Bengal must be treated as one state",
  () => {
    const filters =
      parseSearchQuery(
        "Show me products from West Bengal"
      );

    assert.strictEqual(
      filters.state,
      "West Bengal"
    );

    assert(
      !filters.keywords.includes(
        "west"
      )
    );

    assert(
      !filters.keywords.includes(
        "bengal"
      )
    );

    const results =
      filterProducts(
        products,
        filters
      );

    assert.strictEqual(
      results.length,
      1
    );

    assert.strictEqual(
      results[0].state,
      "West Bengal"
    );
  }
);

/*
 * ============================================================
 * TEST 3
 * Uttar Pradesh
 * ============================================================
 */

test(
  "Uttar Pradesh must be treated as one state",
  () => {
    const filters =
      parseSearchQuery(
        "handmade products from Uttar Pradesh"
      );

    assert.strictEqual(
      filters.state,
      "Uttar Pradesh"
    );

    assert(
      !filters.keywords.includes(
        "uttar"
      )
    );

    assert(
      !filters.keywords.includes(
        "pradesh"
      )
    );

    const results =
      filterProducts(
        products,
        filters
      );

    assert.strictEqual(
      results.length,
      1
    );

    assert.strictEqual(
      results[0].state,
      "Uttar Pradesh"
    );
  }
);

/*
 * ============================================================
 * TEST 4
 * Madhya Pradesh
 * ============================================================
 */

test(
  "Madhya Pradesh must be treated as one state",
  () => {
    const filters =
      parseSearchQuery(
        "Show me products from Madhya Pradesh"
      );

    assert.strictEqual(
      filters.state,
      "Madhya Pradesh"
    );

    assert(
      !filters.keywords.includes(
        "madhya"
      )
    );

    assert(
      !filters.keywords.includes(
        "pradesh"
      )
    );

    const results =
      filterProducts(
        products,
        filters
      );

    assert.strictEqual(
      results.length,
      1
    );

    assert.strictEqual(
      results[0].state,
      "Madhya Pradesh"
    );
  }
);

/*
 * ============================================================
 * TEST 5
 * Price range
 * ============================================================
 */

test(
  "Between ₹500 and ₹1000 should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "handmade products between ₹500 and ₹1000"
      );

    assert.strictEqual(
      filters.minPrice,
      500
    );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );

    const results =
      filterProducts(
        products,
        filters
      );

    assert(
      results.every(
        product =>
          product.price >=
            500 &&
          product.price <=
            1000
      )
    );
  }
);

/*
 * ============================================================
 * TEST 6
 * Minimum price
 * ============================================================
 */

test(
  "Above ₹800 should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "products above ₹800"
      );

    assert.strictEqual(
      filters.minPrice,
      800
    );

    assert.strictEqual(
      filters.maxPrice,
      null
    );

    const results =
      filterProducts(
        products,
        filters
      );

    assert(
      results.every(
        product =>
          product.price >=
          800
      )
    );
  }
);

/*
 * ============================================================
 * TEST 7
 * Category
 * ============================================================
 */

test(
  "Category filtering should work",
  () => {
    const filters =
      parseSearchQuery(
        "handmade painting from Bihar"
      );

    assert.strictEqual(
      filters.category,
      "painting"
    );

    assert.strictEqual(
      filters.state,
      "Bihar"
    );

    const results =
      filterProducts(
        products,
        filters
      );

    assert.strictEqual(
      results.length,
      1
    );

    assert.strictEqual(
      results[0].category,
      "painting"
    );
  }
);

/*
 * ============================================================
 * TEST 8
 * Rs price format
 * ============================================================
 */

test(
  "Rs 1000 price format should work",
  () => {
    const filters =
      parseSearchQuery(
        "products under Rs 1000"
      );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 9
 * INR price format
 * ============================================================
 */

test(
  "INR 1000 price format should work",
  () => {
    const filters =
      parseSearchQuery(
        "products under INR 1000"
      );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 10
 * Actual ₹1000
 * ============================================================
 */

test(
  "Actual ₹1000 input should work",
  () => {
    const filters =
      parseSearchQuery(
        "products under ₹1000"
      );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 11
 * Comma-formatted ₹1,000
 * ============================================================
 */

test(
  "Comma-formatted ₹1,000 should parse as 1000",
  () => {
    const filters =
      parseSearchQuery(
        "products under ₹1,000"
      );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 12
 * Comma-formatted range
 * ============================================================
 */

test(
  "₹500 to ₹1,000 range should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "products between ₹500 and ₹1,000"
      );

    assert.strictEqual(
      filters.minPrice,
      500
    );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 13
 * Less than ₹1000
 * ============================================================
 */

test(
  "Less than ₹1000 should set maxPrice",
  () => {
    const filters =
      parseSearchQuery(
        "products less than ₹1000"
      );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );

    assert.strictEqual(
      filters.minPrice,
      null
    );
  }
);

/*
 * ============================================================
 * TEST 14
 * Up to ₹1000
 * ============================================================
 */

test(
  "Up to ₹1000 should set maxPrice",
  () => {
    const filters =
      parseSearchQuery(
        "products up to ₹1000"
      );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );

    assert.strictEqual(
      filters.minPrice,
      null
    );
  }
);

/*
 * ============================================================
 * TEST 15
 * Over ₹500
 * ============================================================
 */

test(
  "Over ₹500 should set minPrice to 500",
  () => {
    const filters =
      parseSearchQuery(
        "products over ₹500"
      );

    assert.strictEqual(
      filters.minPrice,
      500
    );

    assert.strictEqual(
      filters.maxPrice,
      null
    );

    const results =
      filterProducts(
        products,
        filters
      );

    assert(
      results.every(
        product =>
          product.price >=
          500
      )
    );
  }
);

/*
 * ============================================================
 * TEST 16
 * Above ₹500
 * ============================================================
 */

test(
  "Above ₹500 should set minPrice",
  () => {
    const filters =
      parseSearchQuery(
        "products above ₹500"
      );

    assert.strictEqual(
      filters.minPrice,
      500
    );
  }
);

/*
 * ============================================================
 * TEST 17
 * More than ₹500
 * ============================================================
 */

test(
  "More than ₹500 should set minPrice",
  () => {
    const filters =
      parseSearchQuery(
        "products more than ₹500"
      );

    assert.strictEqual(
      filters.minPrice,
      500
    );
  }
);

/*
 * ============================================================
 * TEST 18
 * From ₹500 to ₹1000
 * ============================================================
 */

test(
  "From ₹500 to ₹1000 should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "products from ₹500 to ₹1000"
      );

    assert.strictEqual(
      filters.minPrice,
      500
    );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 19
 * Reversed price range
 * ============================================================
 */

test(
  "Reversed range should normalize min and max",
  () => {
    const filters =
      parseSearchQuery(
        "products between ₹1000 and ₹500"
      );

    assert.strictEqual(
      filters.minPrice,
      500
    );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 20
 * ₹5,000
 * ============================================================
 */

test(
  "₹5,000 should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "products under ₹5,000"
      );

    assert.strictEqual(
      filters.maxPrice,
      5000
    );
  }
);

/*
 * ============================================================
 * TEST 21
 * ₹10,000
 * ============================================================
 */

test(
  "₹10,000 should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "products under ₹10,000"
      );

    assert.strictEqual(
      filters.maxPrice,
      10000
    );
  }
);

/*
 * ============================================================
 * TEST 22
 * Combined real-world query
 * ============================================================
 */

test(
  "Traditional handmade Bihar products under ₹1,000",
  () => {
    const filters =
      parseSearchQuery(
        "traditional handmade products from Bihar under ₹1,000"
      );

    assert.strictEqual(
      filters.state,
      "Bihar"
    );

    assert.strictEqual(
      filters.minPrice,
      null
    );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );

    assert(
      !filters.keywords.includes(
        "bihar"
      )
    );

    const results =
      filterProducts(
        products,
        filters
      );

    assert.strictEqual(
      results.length,
      2
    );

    assert(
      results.every(
        product =>
          product.state ===
            "Bihar" &&
          product.price <=
            1000
      )
    );
  }
);

/*
 * ============================================================
 * TEST 23
 * Empty query
 * ============================================================
 */

test(
  "Empty query should return empty filters",
  () => {
    const filters =
      parseSearchQuery("");

    assert.strictEqual(
      filters.state,
      null
    );

    assert.strictEqual(
      filters.category,
      null
    );

    assert.strictEqual(
      filters.minPrice,
      null
    );

    assert.strictEqual(
      filters.maxPrice,
      null
    );

    assert.deepStrictEqual(
      filters.keywords,
      []
    );
  }
);

/*
 * ============================================================
 * TEST 24
 * No matching products
 * ============================================================
 */

test(
  "No matching products should return an empty result",
  () => {
    const filters =
      parseSearchQuery(
        "handmade products from Rajasthan"
      );

    const results =
      filterProducts(
        products,
        filters
      );

    assert.strictEqual(
      results.length,
      0
    );

    /*
     * No fictional Rajasthan product
     * should be generated.
     */
    assert.deepStrictEqual(
      results,
      []
    );
  }
);

/*
 * ============================================================
 * TEST 25
 * Search must not modify catalogue
 * ============================================================
 */

test(
  "Search must not modify the product catalogue",
  () => {
    const originalProducts =
      JSON.parse(
        JSON.stringify(
          products
        )
      );

    const filters =
      parseSearchQuery(
        "traditional products from Bihar under ₹1000"
      );

    filterProducts(
      products,
      filters
    );

    assert.deepStrictEqual(
      products,
      originalProducts
    );
  }
);

/*
 * ============================================================
 * TEST 26
 * Search only supplied products
 * ============================================================
 */

test(
  "Search must only return products supplied by caller",
  () => {
    const suppliedProducts = [
      products[0]
    ];

    const filters =
      parseSearchQuery(
        "products from Bihar"
      );

    const results =
      filterProducts(
        suppliedProducts,
        filters
      );

    assert.strictEqual(
      results.length,
      1
    );

    assert.strictEqual(
      results[0].id,
      1
    );
  }
);

/*
 * ============================================================
 * FINAL TEST RESULT
 * ============================================================
 */

console.log(
  `\n${passed}/${passed + failed} tests passed.`
);

if (failed > 0) {
  process.exitCode = 1;

  console.error(
    "✗ Some search tests failed."
  );
} else {
  console.log(
    "✓ All search tests passed successfully."
  );
}