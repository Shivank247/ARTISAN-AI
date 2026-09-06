/**
 * Search Service
 *
 * IMPORTANT:
 * This service filters actual catalogue products.
 *
 * AI interprets the customer's query.
 * The catalogue/database decides which products actually exist.
 *
 * Never generate fictional products here.
 */

const { validateSearchFilters } = require("./searchValidator");
function calculateRelevanceScore(product, filters) {
  let score = 0;

  const searchableText = [
    product.title,
    product.name,
    product.description,
    product.material,
    product.category,
    ...(Array.isArray(product.tags) ? product.tags : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const title = String(
    product.title || product.name || ""
  ).toLowerCase();

  // Keyword matching
  for (const keyword of filters.keywords || []) {
    const normalizedKeyword = keyword.toLowerCase();

    if (title.includes(normalizedKeyword)) {
      score += 5;
    } else if (searchableText.includes(normalizedKeyword)) {
      score += 2;
    }
  }

  // Category match
  if (filters.category) {
    if (
      String(product.category || "")
        .toLowerCase()
        .includes(filters.category.toLowerCase())
    ) {
      score += 5;
    }
  }

  // State match
  if (filters.state) {
    if (
      String(product.state || "")
        .toLowerCase() === filters.state.toLowerCase()
    ) {
      score += 5;
    }
  }

  return score;
}
/**
 * Apply structured search filters to real catalogue products.
 *
 * Expected product shape can contain:
 *
 * {
 *   title,
 *   name,
 *   state,
 *   category,
 *   price,
 *   description,
 *   material,
 *   tags
 * }
 */
function filterProducts(products, filters) {
  if (!Array.isArray(products)) {
    throw new Error("Products must be an array.");
  }

  const validation = validateSearchFilters(filters);

  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const state = filters.state
    ? filters.state.toLowerCase()
    : null;

  const category = filters.category
    ? filters.category.toLowerCase()
    : null;

  const keywords = Array.isArray(filters.keywords)
    ? filters.keywords.map(keyword => keyword.toLowerCase())
    : [];

  const minPrice =
    typeof filters.minPrice === "number"
      ? filters.minPrice
      : null;

  const maxPrice =
    typeof filters.maxPrice === "number"
      ? filters.maxPrice
      : null;

  const results = products.filter(product => {
    if (!product || typeof product !== "object") {
      return false;
    }

    /*
     * STATE FILTER
     */
    if (state) {
      const productState = String(product.state || "").toLowerCase();

      if (productState !== state) {
        return false;
      }
    }

    /*
     * CATEGORY FILTER
     */
    if (category) {
      const productCategory = String(
        product.category || ""
      ).toLowerCase();

      if (!productCategory.includes(category)) {
        return false;
      }
    }

    /*
     * PRICE FILTER
     */
    const price = Number(product.price);

    if (minPrice !== null) {
      if (!Number.isFinite(price) || price < minPrice) {
        return false;
      }
    }

    if (maxPrice !== null) {
      if (!Number.isFinite(price) || price > maxPrice) {
        return false;
      }
    }

    /*
     * KEYWORD FILTER
     *
     * Search across:
     * title
     * name
     * description
     * material
     * tags
     * category
     */
    if (keywords.length > 0) {
      const searchableText = [
        product.title,
        product.name,
        product.description,
        product.material,
        product.category,
        ...(Array.isArray(product.tags) ? product.tags : [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword = keywords.some(keyword =>
        searchableText.includes(keyword)
      );

      if (!matchesKeyword) {
        return false;
      }
    }

    return true;
  });
  results.sort((a, b) => {
  const scoreA = calculateRelevanceScore(a, filters);
  const scoreB = calculateRelevanceScore(b, filters);

  return scoreB - scoreA;
});
  return results;
}

/**
 * Search result response.
 *
 * If no products exist, return an empty result.
 * NEVER create fake products.
 */
function buildSearchResponse(filters, products) {
  return {
    success: true,
    filters,
    count: products.length,
    products,
    message:
      products.length === 0
        ? "No matching products found."
        : `${products.length} matching product${
            products.length === 1 ? "" : "s"
          } found.`
  };
}

module.exports = {
  filterProducts,
  buildSearchResponse,
  calculateRelevanceScore
};