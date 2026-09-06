const GeminiProvider = require("../providers/geminiProvider");
const MockProvider = require("../providers/mockProvider");
const { validateProductOutput } = require("../validation/productSchema");

function getProvider() {
  const providerName = process.env.AI_PROVIDER;
  if (providerName === "gemini") {
    return new GeminiProvider(process.env.AI_API_KEY);
  }
  return new MockProvider();
}

async function generateProduct(input) {
  const provider = getProvider();

  let rawOutput;
    try {
    rawOutput = await provider.generateProduct(input);
  } catch (err) {
    console.error("AI PROVIDER ERROR:", err);
    return {   
      success: false,
      error: {
        code: "AI_SERVICE_UNAVAILABLE",
        message: "AI service is temporarily unavailable. Please try again."
      }
    };
  }

  const validation = validateProductOutput(rawOutput);
  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: "AI_INVALID_OUTPUT",
        message: "AI returned an invalid response.",
        details: validation.errors
      }
    };
  }

  return { success: true, data: validation.data };
}

module.exports = { generateProduct };