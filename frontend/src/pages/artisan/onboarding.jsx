import { useState } from "react";
import "./Onboarding.css";

function Onboarding({ language, onComplete }) {
  const [formData, setFormData] = useState({
    name: "",
    craft: "",
    location: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.craft) {
      alert("Please enter your name and craft.");
      return;
    }

    onComplete(formData);
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <div className="onboarding-heading">
          <h1>Tell us about yourself</h1>
          <p>
            This helps us create a better digital profile for your products.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>What do you create? *</label>
            <select
              name="craft"
              value={formData.craft}
              onChange={handleChange}
            >
              <option value="">Select your craft</option>
              <option value="Handloom">Handloom</option>
              <option value="Pottery">Pottery</option>
              <option value="Jewellery">Jewellery</option>
              <option value="Woodwork">Woodwork</option>
              <option value="Painting">Painting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location (Optional)</label>
            <input
              type="text"
              name="location"
              placeholder="City / Village / State"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Tell us about your work (Optional)</label>
            <textarea
              name="description"
              placeholder="Tell us something about your craft..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <button type="submit" className="start-btn">
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;