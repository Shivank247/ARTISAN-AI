const AIProvider = require("./aiProvider");

class MockProvider extends AIProvider {
  async generateProduct({ image, transcript, language, artisanAnswers }) {
    return {
      title: "Mock Handmade Product",
      description: "This is a mock description generated without calling a real AI provider.",
      category: null,
      material: null,
      tags: ["handmade", "mock"],
      suggestedPrice: null,
      priceRange: null,
      confidence: 0.5
    };
  }
}

module.exports = MockProvider;