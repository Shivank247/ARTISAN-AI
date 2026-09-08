/**
 * ARTISAN AI
 * Search Service Tests
 *
 * Deterministic tests.
 *
 * No:
 * - PostgreSQL
 * - Prisma
 * - network
 * - AI provider
 */

const {
  parseSearchQuery,
} = require("./searchParser");

const {
  searchProducts,
} = require("./searchService");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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
      "gifts",
    ],
    price: 899,
    state: "Bihar",
  },

  {
    id: "product-bihar-pottery",
    title: "Bihar Terracotta Pottery",
    description:
      "Traditional handmade pottery.",
    category: "pottery",
    material: "terracotta clay",
    tags: [
      "traditional",
      "handmade",
    ],
    price: 499,
    state: "Bihar",
  },

  {
    id: "product-bengal-craft",
    title: "West Bengal Handmade Craft",
    description:
      "Handmade traditional craft.",
    category: "handicrafts",
    material: "natural material",
    tags: [
      "handmade",
      "traditional",
    ],
    price: 1299,
    state: "West Bengal",
  },

  {
    id: "product-rajasthan-jewelry",
    title: "Rajasthani Handmade Jewelry",
    description:
      "Traditional handcrafted jewelry.",
    category: "jewelry",
    material: "silver",
    tags: [
      "traditional",
      "handmade",
    ],
    price: 1499,
    state: "Rajasthan",
  },
];

function testBasicSearchParsing() {
  const filters =
    parseSearchQuery(
      "traditional handmade gifts from Bihar under 1000"
    );

  assert(
    filters.state === "Bihar",
    "State should be Bihar."
  );

  assert(
    filters.maxPrice === 1000,
    "Maximum price should be 1000."
  );

  assert(
    filters.keywords.includes(
      "traditional"
    ),
    "traditional should be a keyword."
  );

  assert(
    filters.keywords.includes(
      "handmade"
    ),
    "handmade should be a keyword."
  );

  assert(
    filters.keywords.includes(
      "gifts"
    ),
    "gifts should be a keyword."
  );
}

function testIndianRupeeParsing() {
  const filters =
    parseSearchQuery(
      "handmade gifts under ₹1,000"
    );

  assert(
    filters.maxPrice === 1000,
    "₹1,000 should parse as 1000."
  );
}

function testRsParsing() {
  const filters =
    parseSearchQuery(
      "pottery under Rs 500"
    );

  assert(
    filters.maxPrice === 500,
    "Rs 500 should parse as 500."
  );
}

function testINRParsing() {
  const filters =
    parseSearchQuery(
      "jewelry under INR 1500"
    );

  assert(
    filters.maxPrice === 1500,
    "INR 1500 should parse as 1500."
  );
}

function testPriceRange() {
  const filters =
    parseSearchQuery(
      "jewelry between 500 and 1500"
    );

  assert(
    filters.minPrice === 500,
    "Minimum price should be 500."
  );

  assert(
    filters.maxPrice === 1500,
    "Maximum price should be 1500."
  );
}

function testReversedPriceRange() {
  const filters =
    parseSearchQuery(
      "jewelry between 1500 and 500"
    );

  assert(
    filters.minPrice === 500,
    "Reversed range should normalize minimum to 500."
  );

  assert(
    filters.maxPrice === 1500,
    "Reversed range should normalize maximum to 1500."
  );
}

function testMinimumPrice() {
  const filters =
    parseSearchQuery(
      "woodwork above 1000"
    );

  assert(
    filters.minPrice === 1000,
    "Minimum price should be 1000."
  );
}

function testStateParsing() {
  const filters =
    parseSearchQuery(
      "handmade products from West Bengal"
    );

  assert(
    filters.state === "West Bengal",
    "State should be West Bengal."
  );
}

function testCategoryParsing() {
  const filters =
    parseSearchQuery(
      "traditional pottery"
    );

  assert(
    filters.category === "pottery",
    "Category should be pottery."
  );
}

function testCombinedSearch() {
  const filters =
    parseSearchQuery(
      "traditional pottery from Bihar under 1000"
    );

  assert(
    filters.state === "Bihar",
    "Combined query should detect Bihar."
  );

  assert(
    filters.category === "pottery",
    "Combined query should detect pottery."
  );

  assert(
    filters.maxPrice === 1000,
    "Combined query should detect max price."
  );

  assert(
    filters.keywords.includes(
      "traditional"
    ),
    "Combined query should detect traditional."
  );
}

function testEmptyQuery() {
  const filters =
    parseSearchQuery("");

  assert(
    filters.state === null,
    "Empty query state should be null."
  );

  assert(
    filters.category === null,
    "Empty query category should be null."
  );

  assert(
    filters.minPrice === null,
    "Empty query minPrice should be null."
  );

  assert(
    filters.maxPrice === null,
    "Empty query maxPrice should be null."
  );

  assert(
    Array.isArray(filters.keywords) &&
      filters.keywords.length === 0,
    "Empty query keywords should be empty."
  );
}

function testNoResults() {
  const filters =
    parseSearchQuery(
      "pottery from Rajasthan under 100"
    );

  const results =
    searchProducts(
      catalogue,
      filters
    );

  assert(
    results.length === 0,
    "Expected no results."
  );
}

function testActualCatalogueProductsOnly() {
  const filters =
    parseSearchQuery(
      "handmade products from Bihar"
    );

  const results =
    searchProducts(
      catalogue,
      filters
    );

  const allowedIds =
    new Set(
      catalogue.map(
        (product) => product.id
      )
    );

  for (const product of results) {
    assert(
      allowedIds.has(product.id),
      "Search returned a product outside the supplied catalogue."
    );
  }
}

function testCatalogueImmutability() {
  const original =
    JSON.stringify(catalogue);

  const filters =
    parseSearchQuery(
      "handmade products from Bihar under 1000"
    );

  searchProducts(
    catalogue,
    filters
  );

  assert(
    JSON.stringify(catalogue) ===
      original,
    "Search must not mutate the catalogue."
  );
}

function runTests() {
  const tests = [
    [
      "basic search parsing",
      testBasicSearchParsing,
    ],
    [
      "Indian rupee parsing",
      testIndianRupeeParsing,
    ],
    [
      "Rs parsing",
      testRsParsing,
    ],
    [
      "INR parsing",
      testINRParsing,
    ],
    [
      "price range",
      testPriceRange,
    ],
    [
      "reversed price range",
      testReversedPriceRange,
    ],
    [
      "minimum price",
      testMinimumPrice,
    ],
    [
      "state parsing",
      testStateParsing,
    ],
    [
      "category parsing",
      testCategoryParsing,
    ],
    [
      "combined search",
      testCombinedSearch,
    ],
    [
      "empty query",
      testEmptyQuery,
    ],
    [
      "no results",
      testNoResults,
    ],
    [
      "real catalogue products only",
      testActualCatalogueProductsOnly,
    ],
    [
      "catalogue immutability",
      testCatalogueImmutability,
    ],
  ];

  let passed = 0;

  console.log(
    "\nARTISAN AI — Search Tests"
  );
  console.log(
    "=========================\n"
  );

  for (const [name, test] of tests) {
    try {
      test();
      passed += 1;
      console.log(`✓ ${name}`);
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}`);
      throw error;
    }
  }

  console.log(
    `\nSearch tests complete: ${passed}/${tests.length} passed.`
  );
}

if (require.main === module) {
  try {
    runTests();
  } catch (error) {
    process.exitCode = 1;
  }
}

module.exports = {
  runTests,
};