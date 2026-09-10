import { useEffect, useState } from "react";
import "./UploadProduct.css";

function UploadProduct({ onBack, onContinue }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleContinue = () => {
    if (image) {
      onContinue(image);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="upload-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <div className="upload-heading">
          <h1>Add your product</h1>

          <p>
            Upload a clear photo of your handmade product. Our AI will help
            understand and create your catalogue.
          </p>
        </div>

        {!preview ? (
          <label className="upload-box">
            <div className="upload-icon">📸</div>

            <h3>Upload Product Photo</h3>

            <p>Click here to select an image</p>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>
        ) : (
          <div className="preview-container">
            <img
              src={preview}
              alt="Selected product preview"
              className="product-preview"
            />

            <label className="change-btn">
              Change Photo

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>
          </div>
        )}

        <button
          type="button"
          className="continue-ai-btn"
          onClick={handleContinue}
          disabled={!image}
        >
          Continue with AI →
        </button>
      </div>
    </div>
  );
}

export default UploadProduct;