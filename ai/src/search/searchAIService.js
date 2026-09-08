/**
 * ARTISAN AI
 * AI Search Service
 *
 * Architecture:
 *
 * Customer query
 *      ↓
 * Shared AI provider
 *      ↓
 * Structured search filters
 *      ↓
 * Backend
 *      ↓
 * Database
 *      ↓
 * Real products
 *
 * This service does NOT access PostgreSQL or Prisma.
 */

const {
  SEARCH_AI_SYSTEM_PROMPT,
  buildSearchAIUserPrompt,
} = require("./searchAIPrompt");

const {
  validateSearchFilters,
  normalizeSearchFilters,
} = require("./searchValidator");

function createSearchAIError(
  code,
  message
) {
  return {
    success: false,
    error: {
      code,
      message,
    },
    filters: null,
  };
}

function validateProvider(provider) {
  return (
    provider &&
    typeof provider.generateStructuredJSON ===
      "function"
  );
}

async function parseSearchQueryWithAI(
  provider,
  query
) {
  if (!validateProvider(provider)) {
    return createSearchAIError(
      "INVALID_PROVIDER",
      "A valid shared AI provider is required."
    );
  }

  if (
    typeof query !== "string" ||
    query.trim().length === 0
  ) {
    return createSearchAIError(
      "INVALID_SEARCH_QUERY",
      "Search query must be a non-empty string."
    );
  }

  let rawFilters;

  try {
    rawFilters =
      await provider.generateStructuredJSON({
        systemPrompt:
          SEARCH_AI_SYSTEM_PROMPT,

        userPrompt:
          buildSearchAIUserPrompt(query),

        input: {
          query: query.trim(),
        },
      });
  } catch (error) {
    if (
      error &&
      typeof error.code === "string"
    ) {
      return createSearchAIError(
        error.code,
        error.message ||
          "AI search interpretation is temporarily unavailable."
      );
    }

    return createSearchAIError(
      "AI_PROVIDER_ERROR",
      "AI search interpretation is temporarily unavailable."
    );
  }

  if (
    !validateSearchFilters(rawFilters)
  ) {
    return createSearchAIError(
      "INVALID_AI_SEARCH_OUTPUT",
      "AI returned invalid search filters."
    );
  }

  const filters =
    normalizeSearchFilters(
      rawFilters
    );

  if (!filters) {
    return createSearchAIError(
      "INVALID_AI_SEARCH_OUTPUT",
      "AI returned invalid search filters."
    );
  }

  return {
    success: true,
    filters,
  };
}

/**
 * Controlled AI Search response.
 *
 * This function intentionally returns filters only.
 * The backend is responsible for using those filters
 * to query real Product records.
 */
async function aiSearch(
  provider,
  query
) {
  const result =
    await parseSearchQueryWithAI(
      provider,
      query
    );

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    interpretedFilters: result.filters,
  };
}

module.exports = {
  validateProvider,
  parseSearchQueryWithAI,
  aiSearch,
  createSearchAIError,
};