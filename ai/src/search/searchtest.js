const { parseSearchQuery } = require("./searchParser");
const {
  filterProducts,
  buildSearchResponse
} = require("./searchService");

/*
 * Demo catalogue ONLY for local testing.
 *
 * These are not AI-generated results.
 * They represent products that already exist
 * in a catalogue/database.
 */

const products = [
  {
    id: 1,
    title: "Traditional Madhubani Painting",
    state: "Bihar",
    category: "painting",
    price: 899,
    material: "Handmade paper",
    description: "Traditional handmade Madhubani art",
    tags: ["traditional", "handmade", "art", "gift"]
  },
  {
    id: 2,
    title: "Handmade Clay Pot",
    state: "Bihar",
    category: "pottery",
    price: 450,
    material: "Clay",
    description: "Handmade traditional pottery",
    tags: ["handmade", "traditional", "home decor"]
  },
  {
    id: 3,
    title: "Handwoven Textile",
    state: "West Bengal",
    category: "textile",
    price: 1200,
    material: "Cotton",
    description: "Traditional handwoven textile",
    tags: ["handwoven", "traditional"]
  }
];

/*
 * Test query
 */
const query =
  "Show me traditional handmade gifts from Bihar under ₹1000";

/*
 * Step 1:
 * Convert natural language into filters.
 */
const parsed = parseSearchQuery(query);

console.log("\n========== PARSED QUERY ==========\n");

console.log(JSON.stringify(parsed, null, 2));

if (!parsed.success) {
  console.error("Search parsing failed.");
  process.exit(1);
}

/*
 * Step 2:
 * Use the filters against REAL catalogue data.
 */
const matchingProducts = filterProducts(
  products,
  parsed.filters
);

/*
 * Step 3:
 * Build final response.
 */
const response = buildSearchResponse(
  parsed.filters,
  matchingProducts
);

console.log("\n========== SEARCH RESULTS ==========\n");

console.log(JSON.stringify(response, null, 2));
console.log("\n========== ADDITIONAL SEARCH TESTS ==========\n");

const testQueries = [
  "handmade products from Bihar under ₹500",
  "traditional paintings from Bihar",
  "pottery above ₹300",
  "handmade products between ₹400 and ₹1000",
  "show me textile products from West Bengal",
  "find traditional gifts under Rs 1500"
];

for (const testQuery of testQueries) {
  console.log("\n----------------------------------------");
  console.log("QUERY:", testQuery);
  console.log("----------------------------------------");

  const result = parseSearchQuery(testQuery);

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (result.success) {
    const matches = filterProducts(
      products,
      result.filters
    );

    console.log("MATCHING PRODUCTS:", matches.length);

    for (const product of matches) {
      console.log(
        `- ${product.title} | ₹${product.price}`
      );
    }
  }
}