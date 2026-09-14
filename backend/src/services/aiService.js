import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import env from "../config/env.js";
import { httpError } from "../utils/httpError.js";
import { listProducts } from "./productService.js";
import prisma from "../utils/prisma.js";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const aiRequire = createRequire(
  path.resolve(
    __dirname,
    "../../../ai/package.json"
  )
);

function aiModule() {
  try {
    return {
      product: aiRequire(
        "./src/product/productService.js"
      ),
      voice: aiRequire(
        "./src/voice/voiceService.js"
      ),
      translation: aiRequire(
        "./src/translation/translationService.js"
      ),
      search: aiRequire(
        "./src/search/searchService.js"
      ),
      pricing: aiRequire(
        "./src/pricing/pricingService.js"
      ),
    };
  } catch {
    throw httpError(
      503,
      "AI_SERVICE_UNAVAILABLE",
      "AI service is not available."
    );
  }
}

async function unwrap(result) {
  if (!result?.success) {
    throw httpError(
      503,
      result?.error?.code ||
        "AI_SERVICE_UNAVAILABLE",
      result?.error?.message ||
        "AI service failed."
    );
  }

  return result.data
    ? {
        ...result.data,
        ...(result.questions
          ? {
              questions:
                result.questions,
            }
          : {}),
      }
    : result;
}

/*
 * Generate the AI catalogue and make sure
 * usable price information is available.
 *
 * Gemini remains the primary source.
 * The existing pricing service is used only
 * as a fallback when Gemini does not provide
 * a valid suggested price.
 */
export async function generateProduct(
  userId,
  input
) {
  if (env.aiServiceUrl) {
    throw httpError(
      503,
      "AI_SERVICE_UNAVAILABLE",
      "Remote AI service integration is not configured yet."
    );
  }

  const result = await unwrap(
    await aiModule().product.generateProduct({
      image: input.imageUrl,
      transcript: input.inputText,
      language: input.language,
      artisanAnswers:
        input.artisanAnswers,
    })
  );

  /*
   * If Gemini did not provide a usable price,
   * use the existing deterministic pricing service.
   */
  const suggestedPrice = Number(
    result?.suggestedPrice
  );

  const hasValidSuggestedPrice =
    Number.isFinite(suggestedPrice) &&
    suggestedPrice > 0;

  if (!hasValidSuggestedPrice) {
    try {
      const pricingInput = {
        category:
          result?.category ||
          input?.artisanAnswers?.craft ||
          null,

        material:
          result?.material || null,

        productionTimeDays:
          result?.productionTimeDays ??
          input?.artisanAnswers
            ?.productionTimeDays ??
          1,

        location:
          input?.artisanAnswers?.location ||
          null,
      };

      const pricingResult =
        await aiModule().pricing.recommendPrice(
          pricingInput
        );

      if (pricingResult?.success) {
        const pricingData =
          pricingResult.data;

        if (
          pricingData &&
          Number.isFinite(
            Number(
              pricingData.suggestedPrice
            )
          ) &&
          Number(
            pricingData.suggestedPrice
          ) > 0
        ) {
          result.suggestedPrice =
            Number(
              pricingData.suggestedPrice
            );

          result.priceRange =
            pricingData.priceRange ||
            null;

          /*
           * Keep the original AI confidence
           * when available. Otherwise use the
           * pricing service confidence.
           */
          if (
            result.confidence ===
              null ||
            result.confidence ===
              undefined
          ) {
            result.confidence =
              pricingData.confidence ??
              0.72;
          }

          /*
           * Keep a small internal marker so
           * the stored generation tells us
           * that pricing was completed.
           */
          result.priceSource =
            "pricing-service-fallback";
        }
      }
    } catch (priceError) {
      /*
       * Price fallback should not destroy an
       * otherwise valid catalogue generation.
       *
       * The frontend will still report that
       * price data is unavailable if both
       * Gemini and the pricing service fail.
       */
      console.error(
        "Price recommendation fallback error:",
        priceError?.message ||
          priceError
      );
    }
  } else {
    /*
     * Gemini supplied a usable price.
     */
    result.suggestedPrice =
      suggestedPrice;

    result.priceSource =
      "gemini";
  }

  const artisan =
    await prisma.artisan.findUnique({
      where: { userId },
    });

  if (artisan) {
    await prisma.aIGeneration.create({
      data: {
        artisanId: artisan.id,
        userId,
        type: "GENERATE_PRODUCT",
        inputLanguage:
          input.language || "en",
        inputText:
          input.inputText || null,
        outputJson: result,
        model:
          process.env.AI_PROVIDER ||
          "local",
        status: "SUCCESS",
      },
    });
  }

  return result;
}

export async function recommendPrice(
  input
) {
  return unwrap(
    await aiModule().pricing.recommendPrice(
      input
    )
  );
}

export async function transcribeAudio(
  input
) {
  return unwrap(
    await aiModule().voice.transcribeAudio({
      audio: input.audioUrl,
      language: input.language,
    })
  );
}

export async function translateText(
  input
) {
  return unwrap(
    await aiModule().translation.translateText(
      input
    )
  );
}

/*
 * Convert the broad category understood by
 * AI into terms that actually exist in the
 * marketplace database.
 *
 * IMPORTANT:
 * We do NOT modify normal productService
 * category filtering.
 */
function getSearchTerms(category) {
  const categoryTerms = {
    pottery: [
      "pottery",
      "ceramic",
      "clay",
      "terracotta",
    ],

    textiles: [
      "textile",
      "saree",
      "silk",
      "cotton",
      "weaving",
      "fabric",
      "handloom",
    ],

    jewelry: [
      "jewelry",
      "jewellery",
      "silver",
      "necklace",
      "earring",
      "bracelet",
      "bangle",
    ],

    paintings: [
      "painting",
      "paintings",
      "artwork",
      "madhubani",
      "art",
    ],

    woodwork: [
      "woodwork",
      "wooden",
      "wood carving",
      "wood craft",
    ],

    handicrafts: [
      "handmade",
      "handicraft",
      "craft",
      "traditional",
      "artisan",
    ],
  };

  return categoryTerms[category] || [];
}

export async function searchProducts(
  input
) {
  if (
    !input ||
    typeof input.query !== "string" ||
    !input.query.trim()
  ) {
    throw httpError(
      400,
      "INVALID_SEARCH_QUERY",
      "Search query is required."
    );
  }

  const parsed = await unwrap(
    await aiModule().search.parseSearchQuery(
      input.query
    )
  );

  const searchTerms = getSearchTerms(
    parsed.category
  );

  let results;

  if (searchTerms.length > 0) {
    const combinedSearch = [
      ...searchTerms,
      ...(parsed.keywords || []),
    ]
      .filter(Boolean)
      .join(" ");

    results = await listProducts({
      state:
        parsed.state || undefined,
      maxPrice:
        parsed.maxPrice || undefined,
      search:
        combinedSearch || undefined,
    });

    if (
      results.products.length === 0 &&
      parsed.keywords?.length
    ) {
      results = await listProducts({
        state:
          parsed.state || undefined,
        maxPrice:
          parsed.maxPrice || undefined,
        search:
          parsed.keywords.join(" "),
      });
    }
  } else {
    results = await listProducts({
      state:
        parsed.state || undefined,
      maxPrice:
        parsed.maxPrice || undefined,
      category:
        parsed.category || undefined,
      search:
        parsed.keywords?.join(" ") ||
        undefined,
    });
  }

  return {
    interpretedFilters: parsed,
    products: results.products,
    productIds:
      results.products.map(
        (product) => product.id
      ),
    pagination: results.pagination,
  };
}