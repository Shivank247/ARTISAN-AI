const TranslationProvider = require("./translationProvider");

class MockTranslationProvider extends TranslationProvider {
  async translate({ text, sourceLanguage, targetLanguage }) {
    return {
      translatedText: text,
      sourceLanguage,
      targetLanguage
    };
  }
}

module.exports = MockTranslationProvider;