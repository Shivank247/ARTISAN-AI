import { useState } from "react";
import "./AICatalogue.css";
import { generateProduct } from "../../services/api";

function AICatalogue({ onBack, productData, onGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const response = await generateProduct(productData);

      setResult(response.data);

      if (onGenerated) {
        onGenerated(response.data);
      }
    } catch (err) {
      setError(
        err.message || "Unable to generate catalogue. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="catalogue-page">
      <div className="catalogue-card">
        <button
          className="back-btn"
          onClick={onBack}
          disabled={isGenerating}
        >
          ← Back
        </button>

        <div className="catalogue-logo">
          ✨ <span>Karigar AI</span>
        </div>

        <div className="catalogue-heading">
          <h1>AI Product Catalogue</h1>
          <p>
            Generate product information for your handmade product using AI.
            Review the result before publishing.
          </p>
        </div>

        {!result ? (
          <div className="generate-section">
            <div className="ai-icon">✨</div>

            <h2>Ready to generate your catalogue?</h2>

            <p>
              AI will generate a draft catalogue. You can review and edit it
              before approval.
            </p>

            {error && (
              <div className="api-error" role="alert">
                <p>{error}</p>

                <button
                  className="retry-btn"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  Retry
                </button>
              </div>
            )}

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating catalogue..."
                : "Generate with AI ✨"}
            </button>
          </div>
        ) : (
          <div className="catalogue-result">
            <div className="result-box">
              <span>PRODUCT TITLE</span>
              <h2>{result.title}</h2>
            </div>

            <div className="result-box">
              <span>PRODUCT DESCRIPTION</span>
              <p>{result.description}</p>
            </div>

            <div className="result-box">
              <span>CATEGORY</span>
              <p>{result.category}</p>
            </div>

            <div className="result-box">
              <span>MATERIAL</span>
              <p>{result.material}</p>
            </div>

            <div className="result-box">
              <span>TAGS</span>
              <p>{result.tags?.join(", ") || "Not provided"}</p>
            </div>

            <div className="result-box">
              <span>SUGGESTED PRICE</span>
              <p>₹{result.suggestedPrice}</p>
            </div>

            {result.priceRange && (
              <div className="result-box">
                <span>AI PRICE RANGE</span>
                <p>
                  ₹{result.priceRange.min} – ₹{result.priceRange.max}
                </p>
              </div>
            )}

            {typeof result.confidence === "number" && (
              <div className="result-box">
                <span>CONFIDENCE</span>
                <p>{Math.round(result.confidence * 100)}%</p>
              </div>
            )}

            <p className="draft-note">
              This AI-generated information is a draft. Review and edit it
              before approving or publishing.
            </p>

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating..."
                : "Generate Again ✨"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AICatalogue;