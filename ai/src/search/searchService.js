/**
 * Search Service
 *
 * This service is responsible ONLY for searching
 * existing catalogue/database products.
 *
 * IMPORTANT:
 * - It does NOT create products.
 * - It does NOT invent products.
 * - It does NOT generate fictional results.
 * - It does NOT interpret natural language.
 * - It does NOT call an AI provider.
 *
 * AI/parser layer:
 *     Natural language
 *          ↓
 *     Structured filters
 *
 * Search service:
 *     Structured filters
 *          ↓
 *     Real catalogue products
 *          ↓
 *     Matching results
 */

const {
  validateSearchFilters
} = require("./searchValidator");

/**
 * Calculate relevance score for an
 * existing catalogue product.
 */
function calculateRelevanceScore(
  product,
  filters
) {
  let score = 0;

  const searchableText = [
    product.title,
    product.name,
    product.description,
    product.material,
    product.category,
    ...(Array.isArray(product.tags)
      ? product.tags
      : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const title = String(
    product.title ||
      product.name ||
      ""
  ).toLowerCase();

  /*
   * Keyword relevance
   */
  for (
    const keyword of
      filters.keywords || []
  ) {
    const normalizedKeyword =
      String(keyword)
        .toLowerCase()
        .trim();

    if (!normalizedKeyword) {
      continue;
    }

    if (
      title.includes(
        normalizedKeyword
      )
    ) {
      score += 5;
    } else if (
      searchableText.includes(
        normalizedKeyword
      )
    ) {
      score += 2;
    }
  }

  /*
   * Category relevance
   */
  if (filters.category) {
    const productCategory =
      String(
        product.category || ""
      ).toLowerCase();

    if (
      productCategory.includes(
        filters.category.toLowerCase()
      )
    ) {
      score += 5;
    }
  }

  /*
   * State relevance
   */
  if (filters.state) {
    const productState =
      String(
        product.state || ""
      ).toLowerCase();

    if (
      productState ===
      filters.state.toLowerCase()
    ) {
      score += 5;
    }
  }

  return score;
}

/**
 * Filter real catalogue/database products.
 *
 * `products` must be supplied by the caller.
 *
 * In production this should come from the
 * backend/database layer.
 */
function filterProducts(
  products,
  filters
) {
  if (!Array.isArray(products)) {
    throw new Error(
      "Products must be an array."
    );
  }

  /*
   * Validate structured filters
   * before searching.
   */
  const validation =
    validateSearchFilters(
      filters
    );

  if (!validation.valid) {
    throw new Error(
      validation.errors.join(" ")
    );
  }

  const state = filters.state
    ? filters.state
        .toLowerCase()
        .trim()
    : null;

  const category =
    filters.category
      ? filters.category
          .toLowerCase()
          .trim()
      : null;

  const keywords =
    Array.isArray(
      filters.keywords
    )
      ? filters.keywords
          .map(keyword =>
            String(keyword)
              .toLowerCase()
              .trim()
          )
          .filter(Boolean)
      : [];

  const minPrice =
    typeof filters.minPrice ===
    "number"
      ? filters.minPrice
      : null;

  const maxPrice =
    typeof filters.maxPrice ===
    "number"
      ? filters.maxPrice
      : null;

  /*
   * Search ONLY the products supplied
   * by the caller.
   */
  const results =
    products.filter(product => {
      if (
        !product ||
        typeof product !== "object"
      ) {
        return false;
      }

      /*
       * State
       */
      if (state) {
        const productState =
          String(
            product.state || ""
          )
            .toLowerCase()
            .trim();

        if (
          productState !== state
        ) {
          return false;
        }
      }

      /*
       * Category
       */
      if (category) {
        const productCategory =
          String(
            product.category || ""
          )
            .toLowerCase()
            .trim();

        if (
          !productCategory.includes(
            category
          )
        ) {
          return false;
        }
      }

      /*
       * Price
       */
      const price = Number(
        product.price
      );

      if (minPrice !== null) {
        if (
          !Number.isFinite(price) ||
          price < minPrice
        ) {
          return false;
        }
      }

      if (maxPrice !== null) {
        if (
          !Number.isFinite(price) ||
          price > maxPrice
        ) {
          return false;
        }
      }

      /*
       * Keywords
       */
      if (keywords.length > 0) {
        const searchableText = [
          product.title,
          product.name,
          product.description,
          product.material,
          product.category,
          ...(Array.isArray(
            product.tags
          )
            ? product.tags
            : [])
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesKeyword =
          keywords.some(keyword =>
            searchableText.includes(
              keyword
            )
          );

        if (!matchesKeyword) {
          return false;
        }
      }

      return true;
    });

  /*
   * Rank the existing matching
   * catalogue products.
   */
  results.sort((a, b) => {
    const scoreA =
      calculateRelevanceScore(
        a,
        filters
      );

    const scoreB =
      calculateRelevanceScore(
        b,
        filters
      );

    return scoreB - scoreA;
  });

  return results;
}

/**
 * Build a search result.
 *
 * IMPORTANT:
 * The backend/API integration must map this
 * into the exact response structure required
 * by API_CONTRACT.md.
 *
 * This function itself does not create products
 * or perform database operations.
 */
function buildSearchResponse(
  filters,
  products
) {
  return {
    success: true,
    filters,
    count: products.length,
    products,
    message:
      products.length === 0
        ? "No matching products found."
        : `${products.length} matching product${
            products.length === 1
              ? ""
              : "s"
          } found.`
  };
}

module.exports = {
  filterProducts,
  buildSearchResponse,
  calculateRelevanceScore
};