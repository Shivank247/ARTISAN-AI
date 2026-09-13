import { useState } from "react";
import "./Onboarding.css";
import translations from "../../i18n/translations";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Onboarding({ language, onComplete }) {
  const t = translations[language] || translations.English;

  const [formData, setFormData] = useState({
    name: "",
    craft: "",
    location: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.craft) {
      alert(t.alert);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/artisans/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          craftType: formData.craft,
          city: formData.location,
          story: formData.description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error?.message || "Failed to save artisan profile."
        );
      }

      onComplete(formData);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <div className="onboarding-heading">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t.name}</label>
            <input
              type="text"
              name="name"
              placeholder={t.namePlaceholder}
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{t.craft}</label>
            <select
              name="craft"
              value={formData.craft}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">{t.selectCraft}</option>
              <option value="Handloom">{t.crafts.Handloom}</option>
              <option value="Pottery">{t.crafts.Pottery}</option>
              <option value="Jewellery">{t.crafts.Jewellery}</option>
              <option value="Woodwork">{t.crafts.Woodwork}</option>
              <option value="Painting">{t.crafts.Painting}</option>
              <option value="Other">{t.crafts.Other}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t.location}</label>
            <input
              type="text"
              name="location"
              placeholder={t.locationPlaceholder}
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{t.description}</label>
            <textarea
              name="description"
              placeholder={t.descriptionPlaceholder}
              value={formData.description}
              onChange={handleChange}
              rows="4"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="start-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : t.continue}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;