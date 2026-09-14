import { useState } from "react";
import "./PriceRecommendation.css";
import { updateProduct } from "../../services/api";

function PriceRecommendation({
  onBack,
  productData,
  onPriceSaved,
}) {
  /*
   * AI/API responses can sometimes contain numeric
   * values as strings. Normalize them safely.
   */
  const toNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : null;
  };

  const suggestedPrice = toNumber(
    productData?.suggestedPrice
  );

  const minPrice = toNumber(
    productData?.priceRange?.min
  );

  const maxPrice = toNumber(
    productData?.priceRange?.max
  );

  const productId = productData?.id;

  /*
   * If AI gives a suggested price but doesn't
   * provide a range, use the suggested price
   * as a safe display fallback.
   *
   * This does NOT change the database price.
   */
  const displayMinPrice =
    minPrice !== null
      ? minPrice
      : suggestedPrice;

  const displayMaxPrice =
    maxPrice !== null
      ? maxPrice
      : suggestedPrice;

  const [finalPrice, setFinalPrice] =
    useState(
      suggestedPrice !== null
        ? String(suggestedPrice)
        : ""
    );

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] =
    useState(false);
  const [success, setSuccess] =
    useState("");

  /*
   * Use AI recommended price.
   */
  const handleUseRecommendation = () => {
    if (suggestedPrice !== null) {
      setFinalPrice(
        String(suggestedPrice)
      );

      setError("");
      setSuccess("");
    }
  };

  /*
   * Save final price and publish the product.
   */
  const handleContinue = async () => {
    const numericPrice = Number(
      finalPrice
    );

    if (
      !finalPrice ||
      Number.isNaN(numericPrice) ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      setError(
        "Please enter a valid final price."
      );
      return;
    }

    if (!Number.isInteger(numericPrice)) {
      setError(
        "Final price must be a whole number."
      );
      return;
    }

    if (!productId) {
      setError(
        "Product has not been saved yet. Please go back and try again."
      );
      return;
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      /*
       * Update the REAL product already created
       * in PostgreSQL.
       */
      const response =
        await updateProduct(
          productId,
          {
            price: numericPrice,
            status: "PUBLISHED",
          }
        );

      /*
       * api.js returns the backend `data`
       * object as response.data.
       */
      const updatedProduct =
        response?.data || {};

      setSuccess(
        "Final price saved and product published successfully! ✓"
      );

      if (
        typeof onPriceSaved ===
        "function"
      ) {
        onPriceSaved({
          ...productData,
          ...updatedProduct,
          price: numericPrice,
          status: "PUBLISHED",
        });
      }
    } catch (err) {
      console.error(
        "Price update error:",
        err
      );

      setError(
        err.message ||
          "Unable to save the final price and publish the product. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * Only show unavailable state when there
   * is genuinely no usable AI price.
   */
  if (suggestedPrice === null) {
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
            <h1>
              AI Price Recommendation
            </h1>

            <p>
              Generate the product catalogue
              first to receive an AI price
              recommendation.
            </p>
          </div>

          <div
            className="price-error"
            role="alert"
          >
            Price recommendation data is not
            available yet.
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
          disabled={isSaving}
        >
          ← Back
        </button>

        <div className="price-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <div className="price-heading">
          <h1>
            AI Price Recommendation 💰
          </h1>

          <p>
            AI has suggested a price based on
            your product information. You
            choose the final selling price.
          </p>
        </div>

        <div className="price-result">
          <div className="result-icon">
            ✨
          </div>

          <h2>
            AI Recommended Price
          </h2>

          <div className="recommended-price">
            ₹{suggestedPrice}
          </div>

          {displayMinPrice !== null &&
            displayMaxPrice !== null && (
              <p className="price-range">
                Suggested range: ₹
                {displayMinPrice} – ₹
                {displayMaxPrice}
              </p>
            )}

          <div className="price-note">
            This is an AI recommendation, not
            your final price. You can use it or
            choose your own price.
          </div>

          <button
            type="button"
            className="recommend-btn"
            onClick={
              handleUseRecommendation
            }
            disabled={isSaving}
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
              step="1"
              value={finalPrice}
              onChange={(event) => {
                setFinalPrice(
                  event.target.value
                );

                setError("");
                setSuccess("");
              }}
              placeholder="Enter your final selling price"
              disabled={isSaving}
            />
          </div>

          {error && (
            <p
              className="price-error"
              role="alert"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              className="price-success"
              role="status"
            >
              {success}
            </p>
          )}

          <button
            type="button"
            className="again-btn"
            onClick={handleContinue}
            disabled={isSaving}
          >
            {isSaving
              ? "Publishing..."
              : "Save Final Price & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriceRecommendation;