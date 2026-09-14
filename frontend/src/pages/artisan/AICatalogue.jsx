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
      /*
       * The transcript comes directly from the
       * real browser speech-recognition flow
       * in UploadProduct.jsx.
       */
      const voiceTranscript =
        productData?.inputText ||
        productData?.transcript ||
        "";

      /*
       * Send the real image + real voice transcript
       * to the backend AI service.
       */
      const response = await generateProduct({
        imageUrl:
          productData?.image?.imageUrl || "",

        inputText: voiceTranscript,

        language:
          productData?.language || "en-IN",

        artisanAnswers: {
          name:
            productData?.artisan?.name || "",

          craft:
            productData?.artisan?.craft || "",

          location:
            productData?.artisan?.location || "",
        },
      });

      setResult(response.data);

      if (onGenerated) {
        onGenerated(response.data);
      }
    } catch (err) {
      console.error(
        "AI catalogue generation error:",
        err
      );

      setError(
        err.message ||
          "Unable to generate catalogue. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /*
   * Convert language code into a readable label.
   */
  const getLanguageLabel = () => {
    const currentLanguage =
      productData?.language || "";

    if (
      currentLanguage === "hi-IN" ||
      currentLanguage === "hi" ||
      currentLanguage === "Hindi"
    ) {
      return "Hindi";
    }

    return "English";
  };

  const voiceTranscript =
    productData?.inputText ||
    productData?.transcript ||
    "";

  return (
    <div className="catalogue-page">
      <div className="catalogue-card">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
          disabled={isGenerating}
        >
          ← Back
        </button>

        <div className="catalogue-heading">
          <h1>AI Product Catalogue</h1>

          <p>
            Let AI understand your product,
            image, and voice description to
            create a professional catalogue
            listing.
          </p>
        </div>

        {/* PRODUCT IMAGE */}
        {productData?.image?.imageUrl && (
          <div className="catalogue-image-preview">
            <img
              src={`data:${
                productData.image.mimeType ||
                "image/jpeg"
              };base64,${
                productData.image.imageUrl
              }`}
              alt="Uploaded artisan product"
            />
          </div>
        )}

        {/* VOICE TRANSCRIPT */}
        {voiceTranscript && (
          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              padding: "16px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <strong>
                🎤 Artisan's voice description
              </strong>

              <span
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                {getLanguageLabel()}
              </span>
            </div>

            <p
              style={{
                margin: 0,
                lineHeight: 1.6,
                color: "#334155",
              }}
            >
              {voiceTranscript}
            </p>
          </div>
        )}

        {/* NO VOICE DESCRIPTION WARNING */}
        {!voiceTranscript && (
          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              padding: "14px",
              borderRadius: "12px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
            }}
          >
            <strong>
              No voice description provided.
            </strong>

            <p
              style={{
                margin:
                  "6px 0 0 0",
                fontSize: "14px",
              }}
            >
              AI can still analyze the image,
              but adding a voice description
              gives the AI more information about
              your product.
            </p>
          </div>
        )}

        {/* GENERATE BUTTON */}
        {!result && (
          <button
            type="button"
            className="generate-btn"
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              !productData?.image?.imageUrl
            }
          >
            {isGenerating
              ? "AI is analyzing your product..."
              : "Generate with AI ✨"}
          </button>
        )}

        {/* ERROR */}
        {error && (
          <div
            className="catalogue-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* AI RESULT */}
        {result && (
          <div className="catalogue-result">
            <h2>
              {result.title ||
                "AI Generated Product"}
            </h2>

            {result.description && (
              <p>
                {result.description}
              </p>
            )}

            {result.category && (
              <div>
                <strong>
                  Category:
                </strong>{" "}
                {result.category}
              </div>
            )}

            {result.material && (
              <div>
                <strong>
                  Material:
                </strong>{" "}
                {result.material}
              </div>
            )}

            {Array.isArray(result.tags) &&
              result.tags.length > 0 && (
                <div>
                  <strong>
                    Tags:
                  </strong>{" "}
                  {result.tags.join(", ")}
                </div>
              )}

            {result.suggestedPrice != null && (
              <div>
                <strong>
                  Suggested Price:
                </strong>{" "}
                ₹{result.suggestedPrice}
              </div>
            )}

            {result.priceRange && (
              <div>
                <strong>
                  Price Range:
                </strong>{" "}
                ₹{result.priceRange.min} - ₹
                {result.priceRange.max}
              </div>
            )}

            {result.confidence != null && (
              <div>
                <strong>
                  AI Confidence:
                </strong>{" "}
                {Math.round(
                  result.confidence * 100
                )}
                %
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AICatalogue;