const STTProvider = require("./sttProvider");

class MockSTTProvider extends STTProvider {
  async transcribe({ language }) {
    return {
      text: language === "hi" ? "यह एक परीक्षण प्रतिलेखन है" : "This is a test transcription",
      language,
      confidence: 0.5
    };
  }
}

module.exports = MockSTTProvider;