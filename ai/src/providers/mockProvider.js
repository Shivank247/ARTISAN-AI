const AIProvider = require("./aiProvider");

class MockProvider extends AIProvider {
  async generateProduct({ artisanAnswers }) {
    const suggestedPrice = Number.isFinite(Number(artisanAnswers && artisanAnswers.suggestedPrice))
      ? Number(artisanAnswers.suggestedPrice)
      : null;
    return {
      title: "Mock Handmade Product",
      description: "This is a mock description generated without calling a real AI provider.",
      category: null,
      material: null,
      tags: ["handmade", "mock"],
      suggestedPrice,
      priceRange: null,
      confidence: 0.5
    };
  }
}

module.exports = MockProvider;