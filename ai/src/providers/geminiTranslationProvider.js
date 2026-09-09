const { GoogleGenerativeAI } = require("@google/generative-ai");
const TranslationProvider = require("./translationProvider");

class GeminiTranslationProvider extends TranslationProvider {
  constructor(apiKey) {
    super();
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: "gemini-3.6-flash" });
  }

  async translate({ text, sourceLanguage, targetLanguage }) {
    const prompt = `
Translate the following product text from ${sourceLanguage} to ${targetLanguage}.
Preserve the product meaning exactly. Do not add facts, claims, materials, origins,
certifications, or production details that are not present in the source text.
Return only valid JSON with this exact shape:
{
  "translatedText": "string",
  "sourceLanguage": "${sourceLanguage}",
  "targetLanguage": "${targetLanguage}"
}

Text: ${JSON.stringify(text)}
    `.trim();

    const result = await this.model.generateContent(prompt);
    const cleaned = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

module.exports = GeminiTranslationProvider;