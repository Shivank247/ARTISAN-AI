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
 * - Real UTF-8 ₹ currency input
 * - Comma-formatted prices
 * - Multi-word Indian states
 * - Price filters
 * - Price ranges
 * - Category filters
 * - Search filtering
 * - Empty results
 * - No fictional products
 * - Catalogue immutability
 * - Supplied catalogue isolation
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
      `PASS: ${name}`
    );

    passed++;
  } catch (error) {
    console.error(
      `FAIL: ${name}`
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
 * Actual ₹1000 input
 * ============================================================
 */

test(
  "Products under ₹1000 should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "products under ₹1000"
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
 * TEST 2
 * Actual comma-formatted ₹1,000
 * ============================================================
 */

test(
  "Products under ₹1,000 should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "products under ₹1,000"
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
 * TEST 3
 * Below ₹1000
 * ============================================================
 */

test(
  "Products below ₹1000 should set maxPrice",
  () => {
    const filters =
      parseSearchQuery(
        "products below ₹1000"
      );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 4
 * Less than ₹1000
 * ============================================================
 */

test(
  "Products less than ₹1000 should set maxPrice",
  () => {
    const filters =
      parseSearchQuery(
        "products less than ₹1000"
      );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 5
 * Up to ₹1000
 * ============================================================
 */

test(
  "Products up to ₹1000 should set maxPrice",
  () => {
    const filters =
      parseSearchQuery(
        "products up to ₹1000"
      );

    assert.strictEqual(
      filters.maxPrice,
      1000
    );
  }
);

/*
 * ============================================================
 * TEST 6
 * Above ₹500
 * ============================================================
 */

test(
  "Products above ₹500 should set minPrice",
  () => {
    const filters =
      parseSearchQuery(
        "products above ₹500"
      );

    assert.strictEqual(
      filters.minPrice,
      500
    );

    assert.strictEqual(
      filters.maxPrice,
      null
    );
  }
);

/*
 * ============================================================
 * TEST 7
 * Over ₹500
 * ============================================================
 */

test(
  "Products over ₹500 should set minPrice",
  () => {
    const filters =
      parseSearchQuery(
        "products over ₹500"
      );

    assert.strictEqual(
      filters.minPrice,
      500
    );
  }
);

/*
 * ============================================================
 * TEST 8
 * More than ₹500
 * ============================================================
 */

test(
  "Products more than ₹500 should set minPrice",
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
 * TEST 9
 * Between ₹500 and ₹1000
 * ============================================================
 */

test(
  "Products between ₹500 and ₹1000 should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "products between ₹500 and ₹1000"
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
 * TEST 10
 * Between ₹500 and ₹1,000
 * ============================================================
 */

test(
  "Products between ₹500 and ₹1,000 should parse correctly",
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
 * TEST 11
 * From ₹500 to ₹1000
 * ============================================================
 */

test(
  "Products from ₹500 to ₹1000 should parse correctly",
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
 * TEST 12
 * From ₹500 to ₹1,000
 * ============================================================
 */

test(
  "Products from ₹500 to ₹1,000 should parse correctly",
  () => {
    const filters =
      parseSearchQuery(
        "products from ₹500 to ₹1,000"
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
 * Under ₹5,000
 * ============================================================
 */

test(
  "Products under ₹5,000 should parse correctly",
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
 * TEST 14
 * Under ₹10,000
 * ============================================================
 */

test(
  "Products under ₹10,000 should parse correctly",
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
 * TEST 15
 * Rs 1000
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
 * TEST 16
 * INR 1000
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
 * TEST 17
 * Reversed range
 * ============================================================
 */

test(
  "Reversed price range should normalize correctly",
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
 * TEST 18
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
          product.price <=
            1000
      )
    );
  }
);

/*
 * ============================================================
 * TEST 19
 * Combined query with comma-formatted price
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

    assert(
      results.every(
        product =>
          product.state ===
            "Bihar" &&
          product.price <=
            1000
      )
    );

    assert(
      results.every(
        product =>
          products.includes(
            product
          )
      )
    );
  }
);

/*
 * ============================================================
 * TEST 20
 * West Bengal
 * ============================================================
 */

test(
  "West Bengal must remain one state",
  () => {
    const filters =
      parseSearchQuery(
        "products from West Bengal"
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
 * TEST 21
 * Uttar Pradesh
 * ============================================================
 */

test(
  "Uttar Pradesh must remain one state",
  () => {
    const filters =
      parseSearchQuery(
        "products from Uttar Pradesh"
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
 * TEST 22
 * Madhya Pradesh
 * ============================================================
 */

test(
  "Madhya Pradesh must remain one state",
  () => {
    const filters =
      parseSearchQuery(
        "products from Madhya Pradesh"
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
 * TEST 23
 * Other multi-word states
 * ============================================================
 */

test(
  "Other multi-word Indian states must remain intact",
  () => {
    const states = [
      "Himachal Pradesh",
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Tamil Nadu"
    ];

    for (const state of states) {
      const filters =
        parseSearchQuery(
          `products from ${state}`
        );

      assert.strictEqual(
        filters.state,
        state
      );

      const stateWords =
        state.toLowerCase().split(" ");

      for (const word of stateWords) {
        assert(
          !filters.keywords.includes(
            word
          )
        );
      }
    }
  }
);

/*
 * ============================================================
 * TEST 24
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
 * TEST 25
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
 * TEST 26
 * No matching products
 * ============================================================
 */

test(
  "No matching products should return empty result",
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

    assert.deepStrictEqual(
      results,
      []
    );
  }
);

/*
 * ============================================================
 * TEST 27
 * Catalogue immutability
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
 * TEST 28
 * Only supplied products
 * ============================================================
 */

test(
  "Search must only return supplied products",
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

    assert(
      suppliedProducts.includes(
        results[0]
      )
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
    "FAIL: Some search tests failed."
  );
} else {
  console.log(
    "ALL TESTS PASSED"
  );
}