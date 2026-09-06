const { GoogleGenerativeAI } = require("@google/generative-ai");
const AIProvider = require("./aiProvider");

class GeminiProvider extends AIProvider {
  constructor(apiKey) {
    super();
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: "gemini-1.5-flash" });
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
- If a field is not clearly supported, set it to null.
- Return ONLY valid JSON, no extra text, matching exactly this shape:
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