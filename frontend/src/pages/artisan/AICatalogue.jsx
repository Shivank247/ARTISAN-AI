import { useState } from "react";
import "./AICatalogue.css";

function AICatalogue({ onBack }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerated(false);

    // Frontend demo loading
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  return (
    <div className="catalogue-page">
      <div className="catalogue-card">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <div className="catalogue-logo">
          ✨ <span>Karigar AI</span>
        </div>

        <div className="catalogue-heading">
          <h1>AI Product Catalogue</h1>
          <p>
            Generate a professional product title and description for your
            handmade product.
          </p>
        </div>

        {!generated ? (
          <div className="generate-section">
            <div className="ai-icon">✨</div>

            <h2>Ready to generate your catalogue?</h2>

            <p>
              Our AI will help create product information that can later be
              shown to customers.
            </p>

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
              <h2>Handcrafted Traditional Artisan Product</h2>
            </div>

            <div className="result-box">
              <span>PRODUCT DESCRIPTION</span>

              <p>
                Beautifully handcrafted by skilled artisans using traditional
                techniques. Each product is unique and reflects the rich
                heritage of Indian craftsmanship.
              </p>
            </div>

            <button
              className="generate-btn"
              onClick={handleGenerate}
            >
              Generate Again ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AICatalogue;