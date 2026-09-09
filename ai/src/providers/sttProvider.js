class STTProvider {
  async transcribe({ audioUrl, language }) {
    throw new Error("transcribe() not implemented");
  }
}

module.exports = STTProvider;