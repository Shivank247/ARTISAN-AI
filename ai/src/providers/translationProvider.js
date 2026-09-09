class TranslationProvider {
  async translate({ text, sourceLanguage, targetLanguage }) {
    throw new Error("translate() not implemented");
  }
}

module.exports = TranslationProvider;