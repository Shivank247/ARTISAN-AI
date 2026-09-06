import { useState } from "react";
import "./PriceRecommendation.css";

function PriceRecommendation({ onBack }) {
  const [productName, setProductName] = useState("");
  const [material, setMaterial] = useState("");
  const [hours, setHours] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRecommendPrice = () => {
    if (!productName || !material || !hours) {
      alert("Please fill all the details.");
      return;
    }

    setLoading(true);

    // Temporary frontend demo
    setTimeout(() => {
      setResult({
        min: 800,
        recommended: 1200,
        max: 1600,
      });

      setLoading(false);
    }, 1200);
  };

  return (
    <div className="price-page">
      <div className="price-card">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <div className="price-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <div className="price-heading">
          <h1>AI Price Recommendation 💰</h1>
          <p>
            Enter your product details and get an estimated price recommendation.
          </p>
        </div>

        {!result ? (
          <div className="price-form">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="Example: Handmade Terracotta Vase"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Material Used</label>
              <input
                type="text"
                placeholder="Example: Clay, Cotton, Wood"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Hours Taken to Create</label>
              <input
                type="number"
                placeholder="Example: 5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>

            <button
              className="recommend-btn"
              onClick={handleRecommendPrice}
              disabled={loading}
            >
              {loading ? "AI is analysing... ✨" : "Get AI Recommendation ✨"}
            </button>
          </div>
        ) : (
          <div className="price-result">
            <div className="result-icon">✨</div>

            <h2>Recommended Price</h2>

            <div className="recommended-price">
              ₹{result.recommended}
            </div>

            <p className="price-range">
              Suggested range: ₹{result.min} – ₹{result.max}
            </p>

            <div className="price-note">
              This recommendation is based on product details and estimated
              effort.
            </div>

            <button
              className="again-btn"
              onClick={() => setResult(null)}
            >
              Check Another Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceRecommendation;