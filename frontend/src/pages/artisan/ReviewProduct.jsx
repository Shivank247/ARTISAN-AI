import { useState } from "react";
import "./ReviewProduct.css";

function ReviewProduct({ productData, onBack, onApprove }) {
  const [formData, setFormData] = useState({
    title: productData?.title || "",
    description: productData?.description || "",
    category: productData?.category || "",
    material: productData?.material || "",
    tags: productData?.tags || [],
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          <button className="back-btn" onClick={onBack}>
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

        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <div className="review-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <div className="review-heading">
          <h1>Review your product</h1>

          <p>
            Review and edit the AI-generated information before approving it.
          </p>
        </div>

        <div className="review-form">

          <div className="form-group">
            <label>Product Title</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Material</label>

            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="review-note">
          AI-generated information should be reviewed by the artisan before approval.
        </div>

        <button
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