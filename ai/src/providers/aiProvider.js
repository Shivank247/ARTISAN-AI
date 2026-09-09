/**
 * ARTISAN AI
 * Shared AI Provider
 *
 * This is the single provider abstraction used by
 * Search, Pricing, Recommendation and other AI modules.
 *
 * IMPORTANT:
 * - Provider/API keys stay server-side.
 * - Feature services must not initialize Gemini directly.
 * - Feature services should receive a provider instance
 *   and call generateStructuredJSON().
 */

class AIProvider {
  constructor() {
    this.providerName = "AIProvider";
  }

  /**
   * Generate structured JSON from the configured AI provider.
   *
   * Subclasses / concrete providers must implement this method.
   *
   * @param {Object} params
   * @param {string} params.systemPrompt
   * @param {string} params.userPrompt
   * @param {Object} params.input
   * @returns {Promise<Object>}
   */
  async generateStructuredJSON({
    systemPrompt,
    userPrompt,
    input,
  }) {
    void systemPrompt;
    void userPrompt;
    void input;

    throw new Error(
      "AIProvider.generateStructuredJSON() must be implemented by the shared provider."
    );
  }

  /**
   * Return provider health/status information.
   */
  getStatus() {
    return {
      provider: this.providerName,
      available: true,
    };
  }
}

module.exports = AIProvider;