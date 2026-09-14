import { useState } from "react";
import "./ReviewProduct.css";

function ReviewProduct({
  productData,
  onBack,
  onApprove,
}) {
  const [formData, setFormData] = useState({
    title: productData?.title || "",
    description: productData?.description || "",
    category: productData?.category || "",
    material: productData?.material || "",
    tags: Array.isArray(productData?.tags)
      ? productData.tags
      : [],
  });

  const [tagInput, setTagInput] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();

    if (!tag) {
      return;
    }

    setFormData((prev) => {
      const exists = prev.tags.some(
        (existingTag) =>
          existingTag.toLowerCase() ===
          tag.toLowerCase()
      );

      if (exists) {
        return prev;
      }

      return {
        ...prev,
        tags: [...prev.tags, tag],
      };
    });

    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter(
        (tag) => tag !== tagToRemove
      ),
    }));
  };

  const handleTagKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  const handleApprove = () => {
    onApprove({
      ...productData,
      ...formData,
    });
  };

  if (!productData) {
    return (
      <div className="review-page">
        <div className="review-card">
          <button
            type="button"
            className="back-btn"
            onClick={onBack}
          >
            ← Back
          </button>

          <p>
            No AI-generated product data is available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-page">
      <div className="review-card">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="review-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <div className="review-heading">
          <h1>Review your product</h1>

          <p>
            Review and edit the AI-generated information
            before approving it.
          </p>
        </div>

        <div className="review-form">
          <div className="form-group">
            <label htmlFor="product-title">
              Product Title
            </label>

            <input
              id="product-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-description">
              Description
            </label>

            <textarea
              id="product-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-category">
              Category
            </label>

            <input
              id="product-category"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-material">
              Material
            </label>

            <input
              id="product-material"
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
            />
          </div>

          <div className="form-group tags-form-group">
            <label htmlFor="product-tag-input">
              Product Tags
            </label>

            <div className="tag-editor">
              {formData.tags.length > 0 && (
                <div className="tag-list">
                  {formData.tags.map((tag) => (
                    <span
                      className="tag-chip"
                      key={tag}
                    >
                      <span>{tag}</span>

                      <button
                        type="button"
                        className="tag-remove-btn"
                        onClick={() =>
                          removeTag(tag)
                        }
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="tag-input-row">
                <input
                  id="product-tag-input"
                  type="text"
                  value={tagInput}
                  onChange={(event) =>
                    setTagInput(event.target.value)
                  }
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag"
                />

                <button
                  type="button"
                  className="add-tag-btn"
                  onClick={addTag}
                >
                  + Add
                </button>
              </div>
            </div>

            <small className="tags-help">
              Add keywords that help customers discover
              your product. Press Enter or click Add.
            </small>
          </div>
        </div>

        <div className="review-note">
          AI-generated information should be reviewed by
          the artisan before approval.
        </div>

        <button
          type="button"
          className="approve-btn"
          onClick={handleApprove}
        >
          Approve Product →
        </button>
      </div>
    </div>
  );
}

export default ReviewProduct;