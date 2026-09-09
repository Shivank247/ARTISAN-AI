const GoogleSTTProvider = require("../providers/googleSttProvider");
const MockSTTProvider = require("../providers/mockSttProvider");
const { generateProduct } = require("../product/productService");
const { validateVoiceInput, validateVoiceOutput } = require("./voiceValidation");

function getProvider() {
  if (process.env.STT_PROVIDER === "google") {
    return new GoogleSTTProvider(process.env.STT_API_KEY);
  }

  return new MockSTTProvider();
}

async function transcribeAudio(input, provider = getProvider()) {
  try {
    validateVoiceInput(input);
    const result = await provider.transcribe(input);
    validateVoiceOutput(result);

    return { success: true, data: result };
  } catch (error) {
    console.error("STT PROVIDER ERROR:", error);
    return {
      success: false,
      error: {
        code: "STT_ERROR",
        message: "We couldn't understand that. Please try again."
      }
    };
  }
}

async function generateProductFromVoice(input, provider = getProvider()) {
  const transcription = await transcribeAudio(input, provider);
  if (!transcription.success) return transcription;

  return generateProduct({
    image: input.image,
    transcript: transcription.data.text,
    language: input.language,
    artisanAnswers: input.artisanAnswers
  });
}

module.exports = { transcribeAudio, generateProductFromVoice };