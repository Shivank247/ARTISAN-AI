/**
 * ARTISAN AI
 * Recommendation Prompt
 *
 * Ownership:
 * Shivani — AI Search + Pricing
 *
 * Status:
 * P2 / If time permits
 *
 * IMPORTANT:
 * - AI may recommend only products supplied by the application.
 * - AI must never invent a product.
 * - AI must never invent a product ID.
 * - AI must never invent price, availability, material,
 *   category, location, or other product information.
 * - The supplied catalogue is the source of truth.
 * - This module does not access PostgreSQL or Prisma.
 */

const RECOMMENDATION_SYSTEM_PROMPT = `
You are the recommendation component of ARTISAN AI.

Your task is to recommend relevant products to a customer based ONLY
on the customer request and the supplied product catalogue.

IMPORTANT RULES:

1. Recommend ONLY products that exist in the supplied catalogue.
2. Never invent products.
3. Never invent product IDs.
4. Never create new product records.
5. Never invent product titles.
6. Never invent prices.
7. Never invent availability.
8. Never invent material, category, location, tags, or other attributes.
9. Use the supplied catalogue as the only product source of truth.
10. The application controls the maximum number of recommendations.
11. If there are no suitable products, return an empty recommendations array.
12. If the catalogue is empty, return an empty recommendations array.
13. Every recommendation must contain:
    - productId
    - score
    - reason
14. score must be a number between 0 and 1.
15. reason must be short and based only on the supplied customer request
    and supplied product information.
16. Do not return products that are not in the supplied catalogue.
17. Do not duplicate a product.
18. Return valid JSON only.

Required output format:

{
  "recommendations": [
    {
      "productId": "existing-product-id",
      "score": 0.85,
      "reason": "Short explanation based only on the customer request and supplied product information."
    }
  ]
}

If no suitable product exists:

{
  "recommendations": []
}
`;

function buildRecommendationUserPrompt(query, catalogue, limit) {
  if (
    typeof query !== "string" ||
    query.trim().length === 0
  ) {
    throw new Error("Recommendation query must be a non-empty string.");
  }

  if (!Array.isArray(catalogue)) {
    throw new Error("Recommendation catalogue must be an array.");
  }

  if (
    typeof limit !== "number" ||
    !Number.isInteger(limit) ||
    limit < 1
  ) {
    throw new Error("Recommendation limit must be a positive integer.");
  }

  return JSON.stringify(
    {
      customerQuery: query.trim(),
      catalogue,
      maximumRecommendations: limit,
      requiredOutput: {
        recommendations: [
          {
            productId: "existing catalogue product ID",
            score: "number between 0 and 1",
            reason: "short explanation",
          },
        ],
      },
      criticalRule:
        "Use only product IDs from the supplied catalogue. Never invent products or product IDs.",
    },
    null,
    2
  );
}

module.exports = {
  RECOMMENDATION_SYSTEM_PROMPT,
  buildRecommendationUserPrompt,
};