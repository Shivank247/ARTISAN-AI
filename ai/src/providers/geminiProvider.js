const { GoogleGenerativeAI } = require("@google/generative-ai");
const AIProvider = require("./aiProvider");

class GeminiProvider extends AIProvider {
  constructor(apiKey) {
    super();
    if (!apiKey) throw Object.assign(new Error("AI_API_KEY must be configured."), { code: "AI_CONFIGURATION_ERROR" });
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.6-flash" });
  }

  async generateProduct({ image, transcript, language, artisanAnswers }) {
    const prompt = `
You are assisting an artisan with product cataloguing for an e-commerce listing.
You are given a product image and a transcript of the artisan describing it.

Transcript: "${transcript || "none provided"}"
Language: ${language || "unknown"}
Artisan answers so far: ${JSON.stringify(artisanAnswers || {})}

Rules:
- Only use facts supported by the image or the transcript.
- Never invent material, origin, certifications, awards, or history.
- If no transcript is provided, treat the image as visually suggestive only, not confirmed.
- Do NOT assert a specific material (e.g. "terracotta", "cotton", "teak wood") unless the transcript or artisan answers confirm it. If only the image is available and material is not visually unambiguous, set material to null.
- Do NOT state production methods (e.g. "made on a potter's wheel", "hand-stitched") unless confirmed by the transcript or artisan answers.
- Lower confidence (below 0.6) when material or method claims rely on image alone without transcript confirmation.
- If a field is not clearly supported, set it to null.
{
  "title": "string",
  "description": "string",
  "category": "string or null",
  "material": "string or null",
  "tags": ["string"],
  "suggestedPrice": number or null,
  "priceRange": { "min": number, "max": number } or null,
  "confidence": number between 0 and 1
}
    `.trim();

    const parts = [{ text: prompt }];

    if (image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image
        }
      });
    }

    const result = await this.model.generateContent(parts);
    const rawText = result.response.text();

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

module.exports = GeminiProvider;