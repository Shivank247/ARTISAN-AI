import { useState } from "react";
import "./PriceRecommendation.css";

function PriceRecommendation({ onBack, productData }) {
  const suggestedPrice = productData?.suggestedPrice;
  const minPrice = productData?.priceRange?.min;
  const maxPrice = productData?.priceRange?.max;

  const [finalPrice, setFinalPrice] = useState(
    typeof suggestedPrice === "number" ? String(suggestedPrice) : ""
  );

  const [error, setError] = useState("");

  const handleUseRecommendation = () => {
    if (typeof suggestedPrice === "number") {
      setFinalPrice(String(suggestedPrice));
      setError("");
    }
  };

  const handleContinue = () => {
    const numericPrice = Number(finalPrice);

    if (!finalPrice || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid final price.");
      return;
    }

    setError("");

    /*
      The artisan's final price is selected here.
      It will be sent to the backend during the
      draft review / approval / publish flow once
      the agreed backend endpoint is available.
    */
  };

  if (
    typeof suggestedPrice !== "number" ||
    typeof minPrice !== "number" ||
    typeof maxPrice !== "number"
  ) {
    return (
      <div className="price-page">
        <div className="price-card">
          <button
            type="button"
            className="back-btn"
            onClick={onBack}
          >
            ← Back
          </button>

          <div className="price-logo">
            ✦ <span>Karigar AI</span>
          </div>

          <div className="price-heading">
            <h1>AI Price Recommendation</h1>

            <p>
              Generate the product catalogue first to receive an AI price
              recommendation.
            </p>
          </div>

          <div className="price-error" role="alert">
            Price recommendation data is not available yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="price-page">
      <div className="price-card">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="price-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <div className="price-heading">
          <h1>AI Price Recommendation 💰</h1>

          <p>
            AI has suggested a price based on your product information. You
            choose the final selling price.
          </p>
        </div>

        <div className="price-result">
          <div className="result-icon">✨</div>

          <h2>AI Recommended Price</h2>

          <div className="recommended-price">
            ₹{suggestedPrice}
          </div>

          <p className="price-range">
            Suggested range: ₹{minPrice} – ₹{maxPrice}
          </p>

          <div className="price-note">
            This is an AI recommendation, not your final price. You can use
            it or choose your own price.
          </div>

          <button
            type="button"
            className="recommend-btn"
            onClick={handleUseRecommendation}
          >
            Use AI Recommendation
          </button>

          <div className="form-group final-price-group">
            <label htmlFor="final-price">
              Your Final Price
            </label>

            <input
              id="final-price"
              type="number"
              min="1"
              value={finalPrice}
              onChange={(event) => {
                setFinalPrice(event.target.value);
                setError("");
              }}
              placeholder="Enter your final selling price"
            />
          </div>

          {error && (
            <p className="price-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className="again-btn"
            onClick={handleContinue}
          >
            Save Final Price
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriceRecommendation;