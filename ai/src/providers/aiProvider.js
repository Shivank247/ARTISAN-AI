class AIProvider {
  async generateProduct({ image, transcript, language, artisanAnswers }) {
    throw new Error("generateProduct() not implemented");
  }
}

module.exports = AIProvider;