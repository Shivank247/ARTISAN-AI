const STTProvider = require("./sttProvider");

const LANGUAGE_CODES = {
  en: "en-IN",
  hi: "hi-IN"
};

class GoogleSTTProvider extends STTProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async transcribe({ audioUrl, language }) {
    if (!this.apiKey) {
      throw new Error("STT_API_KEY is not configured");
    }

    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Audio download failed with status ${audioResponse.status}`);
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    if (audioBuffer.length === 0) {
      throw new Error("Audio is empty");
    }

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(this.apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS",
            languageCode: LANGUAGE_CODES[language],
            enableAutomaticPunctuation: true
          },
          audio: {
            content: audioBuffer.toString("base64")
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Speech recognition failed with status ${response.status}`);
    }

    const result = await response.json();
    const alternatives = result.results?.flatMap((item) => item.alternatives || []) || [];
    const bestResult = alternatives[0];

    if (!bestResult?.transcript) {
      throw new Error("Speech recognition returned no transcript");
    }

    return {
      text: bestResult.transcript,
      language,
      confidence: typeof bestResult.confidence === "number" ? bestResult.confidence : 0
    };
  }
}

module.exports = GoogleSTTProvider;