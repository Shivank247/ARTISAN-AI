import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import env from "../config/env.js";
import { httpError } from "../utils/httpError.js";
import { listProducts } from "./productService.js";
import prisma from "../utils/prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const aiRequire = createRequire(path.resolve(__dirname, "../../../ai/package.json"));

function aiModule() {
  try {
    return {
      product: aiRequire("./src/product/productService.js"),
      voice: aiRequire("./src/voice/voiceService.js"),
      translation: aiRequire("./src/translation/translationService.js"),
      search: aiRequire("./src/search/searchService.js"),
      pricing: aiRequire("./src/pricing/pricingService.js"),
    };
  } catch {
    throw httpError(503, "AI_SERVICE_UNAVAILABLE", "AI service is not available.");
  }
}

async function unwrap(result) {
  if (!result?.success) throw httpError(503, result?.error?.code || "AI_SERVICE_UNAVAILABLE", result?.error?.message || "AI service failed.");
  return result.data ? { ...result.data, ...(result.questions ? { questions: result.questions } : {}) } : result;
}

export async function generateProduct(userId, input) {
  if (env.aiServiceUrl) throw httpError(503, "AI_SERVICE_UNAVAILABLE", "Remote AI service integration is not configured yet.");
  const result = await unwrap(await aiModule().product.generateProduct({ image: input.imageUrl, transcript: input.inputText, language: input.language, artisanAnswers: input.artisanAnswers }));
  const artisan = await prisma.artisan.findUnique({ where: { userId } });
  if (artisan) {
    await prisma.aIGeneration.create({
      data: {
        artisanId: artisan.id,
        userId,
        type: "GENERATE_PRODUCT",
        inputLanguage: input.language || "en",
        inputText: input.inputText || null,
        outputJson: result,
        model: process.env.AI_PROVIDER || "local",
        status: "SUCCESS",
      },
    });
  }
  return result;
}
export async function recommendPrice(input) { return unwrap(await aiModule().pricing.recommendPrice(input)); }
export async function transcribeAudio(input) { return unwrap(await aiModule().voice.transcribeAudio({ audio: input.audioUrl, language: input.language })); }
export async function translateText(input) { return unwrap(await aiModule().translation.translateText(input)); }
export async function searchProducts(input) {
  const parsed = await unwrap(await aiModule().search.parseSearchQuery(input.query));
  const filters = {
    state: parsed.state || undefined,
    maxPrice: parsed.maxPrice || undefined,
    category: parsed.category || undefined,
    search: parsed.keywords?.join(" ") || undefined,
  };
  const results = await listProducts(filters);
  return { interpretedFilters: parsed, productIds: results.products.map((product) => product.id) };
}
