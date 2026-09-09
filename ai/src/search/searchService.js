/**
 * ARTISAN AI
 * Search Service
 *
 * Responsibility:
 * - Search only within the catalogue supplied by the caller
 * - Apply validated search filters
 * - Rank matching products by relevance
 *
 * IMPORTANT:
 * - No Prisma
 * - No PostgreSQL
 * - No database access
 * - No product creation
 * - No invented products
 */

const {
  validateSearchFilters,
  normalizeSearchFilters,
} = require("./searchValidator");

/**
 * Safely convert a value into lowercase searchable text.
 */
function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

/**
 * Convert product tags into a searchable string.
 */
function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags
      .filter((tag) => typeof tag === "string")
      .map((tag) => normalizeText(tag))
      .join(" ");
  }

  if (typeof tags === "string") {
    return normalizeText(tags);
  }

  return "";
}

/**
 * Build searchable text for a product.
 *
 * Only fields defined by the ARTISAN AI product contract
 * are used here.
 */
function getSearchableText(product) {
  return [
    product.title,
    product.description,
    product.material,
    product.category,
    normalizeTags(product.tags),
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

/**
 * Calculate relevance score for a product.
 */
function calculateRelevanceScore(product, keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return 0;
  }

  const title = normalizeText(product.title);
  const description = normalizeText(product.description);
  const material = normalizeText(product.material);
  const category = normalizeText(product.category);
  const tags = normalizeTags(product.tags);

  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedKeyword) {
      continue;
    }

    if (title.includes(normalizedKeyword)) {
      score += 5;
    }

    if (category.includes(normalizedKeyword)) {
      score += 4;
    }

    if (tags.includes(normalizedKeyword)) {
      score += 3;
    }

    if (material.includes(normalizedKeyword)) {
      score += 2;
    }

    if (description.includes(normalizedKeyword)) {
      score += 1;
    }
  }

  return score;
}

/**
 * Check whether a product satisfies price filters.
 */
function matchesPrice(product, filters) {
  const price = Number(product.price);

  if (!Number.isFinite(price)) {
    return false;
  }

  if (
    filters.minPrice !== null &&
    price < filters.minPrice
  ) {
    return false;
  }

  if (
    filters.maxPrice !== null &&
    price > filters.maxPrice
  ) {
    return false;
  }

  return true;
}

/**
 * Check whether a product satisfies state filter.
 */
function matchesState(product, filters) {
  if (filters.state === null) {
    return true;
  }

  return (
    typeof product.state === "string" &&
    normalizeText(product.state) === normalizeText(filters.state)
  );
}

/**
 * Check whether a product satisfies category filter.
 */
function matchesCategory(product, filters) {
  if (filters.category === null) {
    return true;
  }

  return (
    typeof product.category === "string" &&
    normalizeText(product.category) ===
      normalizeText(filters.category)
  );
}

/**
 * Check whether a product satisfies keyword filters.
 *
 * MVP behavior:
 * ANY keyword match is sufficient.
 *
 * This is intentional and should not be changed
 * to ALL-keyword matching unless the contract changes.
 */
function matchesKeywords(product, filters) {
  if (
    !Array.isArray(filters.keywords) ||
    filters.keywords.length === 0
  ) {
    return true;
  }

  const searchableText = getSearchableText(product);

  return filters.keywords.some((keyword) =>
    searchableText.includes(normalizeText(keyword))
  );
}

/**
 * Check whether a product matches all structured filters.
 */
function matchesProduct(product, filters) {
  return (
    product &&
    typeof product === "object" &&
    matchesPrice(product, filters) &&
    matchesState(product, filters) &&
    matchesCategory(product, filters) &&
    matchesKeywords(product, filters)
  );
}

/**
 * Search supplied catalogue.
 *
 * @param {Object} filters
 * @param {Array} catalogue
 * @returns {Array}
 */
function searchProducts(filters, catalogue) {
  if (!Array.isArray(catalogue)) {
    throw new TypeError(
      "Catalogue must be an array."
    );
  }

  const normalizedFilters = normalizeSearchFilters(filters);

  if (!validateSearchFilters(normalizedFilters)) {
    throw new Error(
      "Invalid search filters."
    );
  }

  const results = [];

  for (const product of catalogue) {
    if (!matchesProduct(product, normalizedFilters)) {
      continue;
    }

    results.push({
      ...product,
      _relevanceScore: calculateRelevanceScore(
        product,
        normalizedFilters.keywords
      ),
    });
  }

  results.sort((a, b) => {
    if (b._relevanceScore !== a._relevanceScore) {
      return b._relevanceScore - a._relevanceScore;
    }

    return Number(a.price) - Number(b.price);
  });

  return results.map((product) => {
    const { _relevanceScore, ...cleanProduct } = product;

    return cleanProduct;
  });
}

/**
 * Search using a natural-language query and parsed filters.
 *
 * This function does NOT call the database.
 * The backend/controller is responsible for:
 *
 * 1. Receiving AI interpreted filters
 * 2. Querying the real database
 * 3. Supplying the resulting catalogue here
 */
function searchWithFilters(filters, catalogue) {
  return searchProducts(filters, catalogue);
}

module.exports = {
  normalizeText,
  normalizeTags,
  getSearchableText,
  calculateRelevanceScore,
  matchesPrice,
  matchesState,
  matchesCategory,
  matchesKeywords,
  matchesProduct,
  searchProducts,
  searchWithFilters,
};
