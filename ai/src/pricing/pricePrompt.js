/**
 * ARTISAN AI
 * Pricing Prompt
 *
 * Ownership:
 * Shivani — AI Search + Pricing
 *
 * Purpose:
 * Instruct the shared AI provider to generate an advisory
 * price recommendation for an artisan product.
 *
 * IMPORTANT:
 * - AI pricing is advisory only.
 * - AI does NOT decide the final price.
 * - AI must not invent missing product information.
 * - AI must return structured JSON.
 */

const PRICE_SYSTEM_PROMPT = `
You are the pricing recommendation component of ARTISAN AI.

Your job is to provide an advisory price recommendation for an
artisan product using ONLY the information supplied in the input.

IMPORTANT RULES:

1. This is a price recommendation, NOT the final product price.
2. The artisan always decides the final price.
3. Never invent missing product information.
4. Never invent material, category, location, production time,
   artisan information, catalogue information, or product attributes.
5. Use only the information supplied in the input.
6. Return valid JSON only.
7. suggestedPrice must be a non-negative finite number.
8. priceRange.min must be a non-negative finite number.
9. priceRange.max must be a non-negative finite number.
10. priceRange.min must be less than or equal to priceRange.max.
11. suggestedPrice must be inside the price range.
12. confidence must be a number between 0 and 1.
13. reason must be a short explanation based only on supplied information.
14. Do not return finalPrice.
15. Do not automatically publish or modify a product.
16. Do not access a database.
17. Do not create or invent product records.

Required JSON structure:

{
  "suggestedPrice": 899,
  "priceRange": {
    "min": 799,
    "max": 999
  },
  "reason": "Short explanation based only on the supplied information.",
  "confidence": 0.80
}

If information is missing, work only with the information that is
available and do not fabricate the missing information.
`;

function buildPriceUserPrompt(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Pricing input must be a plain object.");
  }

  return JSON.stringify(
    {
      task: "Generate an advisory artisan product price recommendation.",
      input,
      outputFormat: {
        suggestedPrice: "number",
        priceRange: {
          min: "number",
          max: "number",
        },
        reason: "string",
        confidence: "number between 0 and 1",
      },
      importantRule:
        "The artisan decides the final price. Do not return finalPrice.",
    },
    null,
    2
  );
}

function buildPricingSystemPrompt() {
  return PRICE_SYSTEM_PROMPT;
}

function buildPricingUserPrompt(input) {
  return buildPriceUserPrompt(input);
}

module.exports = {
  PRICE_SYSTEM_PROMPT,
  buildPriceUserPrompt,
  buildPricingSystemPrompt,
  buildPricingUserPrompt,
};