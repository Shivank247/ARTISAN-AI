/**
 * ARTISAN AI
 * Search Service
 *
 * Purpose:
 * Search ONLY within a catalogue supplied by the application.
 *
 * IMPORTANT:
 * - No PostgreSQL.
 * - No Prisma.
 * - No database access.
 * - No product creation.
 * - No fake product IDs.
 *
 * The backend remains responsible for the actual database query.
 */

const {
  validateSearchFilters,
  normalizeSearchFilters,
} = require("./searchValidator");

function normalizeProductText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item))
      .join(" ")
      .toLowerCase();
  }

  return String(value).toLowerCase();
}

function productMatchesFilters(product, filters) {
  if (
    filters.state &&
    normalizeProductText(product.state) !==
      filters.state.toLowerCase()
  ) {
    return false;
  }

  if (
    filters.category &&
    normalizeProductText(product.category) !==
      filters.category.toLowerCase()
  ) {
    return false;
  }

  if (
    filters.minPrice !== null &&
    (
      typeof product.price !== "number" ||
      product.price < filters.minPrice
    )
  ) {
    return false;
  }

  if (
    filters.maxPrice !== null &&
    (
      typeof product.price !== "number" ||
      product.price > filters.maxPrice
    )
  ) {
    return false;
  }

  if (filters.keywords.length > 0) {
    const searchableText = [
      product.title,
      product.name,
      product.description,
      product.material,
      product.category,
      product.tags,
    ]
      .map(normalizeProductText)
      .join(" ");

    /*
     * MVP behavior:
     * A product matches when at least one requested keyword
     * is present in the supplied product information.
     */
    const hasKeywordMatch =
      filters.keywords.some((keyword) =>
        searchableText.includes(
          keyword.toLowerCase()
        )
      );

    if (!hasKeywordMatch) {
      return false;
    }
  }

  return true;
}

function calculateRelevanceScore(
  product,
  filters
) {
  let score = 0;

  const title = normalizeProductText(
    product.title
  );

  const name = normalizeProductText(
    product.name
  );

  const description = normalizeProductText(
    product.description
  );

  const material = normalizeProductText(
    product.material
  );

  const category = normalizeProductText(
    product.category
  );

  const tags = normalizeProductText(
    product.tags
  );

  for (const keyword of filters.keywords) {
    const normalizedKeyword =
      keyword.toLowerCase();

    if (
      title.includes(normalizedKeyword) ||
      name.includes(normalizedKeyword)
    ) {
      score += 4;
    } else if (
      tags.includes(normalizedKeyword)
    ) {
      score += 3;
    } else if (
      description.includes(normalizedKeyword) ||
      material.includes(normalizedKeyword)
    ) {
      score += 2;
    } else if (
      category.includes(normalizedKeyword)
    ) {
      score += 1;
    }
  }

  if (
    filters.category &&
    category === filters.category.toLowerCase()
  ) {
    score += 3;
  }

  if (
    filters.state &&
    normalizeProductText(product.state) ===
      filters.state.toLowerCase()
  ) {
    score += 3;
  }

  return score;
}

function searchProducts(
  catalogue,
  filters
) {
  if (!Array.isArray(catalogue)) {
    throw new Error(
      "Search catalogue must be an array."
    );
  }

  if (!validateSearchFilters(filters)) {
    throw new Error(
      "Invalid search filters."
    );
  }

  const normalizedFilters =
    normalizeSearchFilters(filters);

  if (!normalizedFilters) {
    throw new Error(
      "Invalid search filters."
    );
  }

  return catalogue
    .filter((product) =>
      productMatchesFilters(
        product,
        normalizedFilters
      )
    )
    .map((product, index) => ({
      product,
      relevanceScore:
        calculateRelevanceScore(
          product,
          normalizedFilters
        ),
      originalIndex: index,
    }))
    .sort((a, b) => {
      if (
        b.relevanceScore !==
        a.relevanceScore
      ) {
        return (
          b.relevanceScore -
          a.relevanceScore
        );
      }

      return (
        a.originalIndex -
        b.originalIndex
      );
    })
    .map((item) => item.product);
}

module.exports = {
  normalizeProductText,
  productMatchesFilters,
  calculateRelevanceScore,
  searchProducts,
};