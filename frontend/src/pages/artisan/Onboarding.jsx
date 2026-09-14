import { useState } from "react";
import "./Onboarding.css";
import translations from "../../i18n/translations";
import apiRequest from "../../services/api";

function Onboarding({ language, onComplete }) {
  const t = translations[language] || translations.English;

  const [formData, setFormData] = useState({
    name: "",
    craft: "",
    location: "",
    description: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleContinue = async () => {
    const data = {
      name: formData.name.trim(),
      craft: formData.craft.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
    };

    if (!data.name) {
      alert("Please enter your name.");
      return;
    }

    if (!data.craft) {
      alert("Please select what you create.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const locationParts = data.location
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      const city = locationParts[0] || null;
      const state = locationParts[1] || null;

      const response = await apiRequest("/artisans/me", {
        method: "PUT",
        body: JSON.stringify({
          craftType: data.craft,
          city,
          state,
          story: data.description || null,
          latitude: null,
          longitude: null,
        }),
      });

      console.log("ARTISAN PROFILE SAVED:", response.data);

      if (typeof onComplete === "function") {
        onComplete({
          ...data,
          artisanProfile: response.data,
        });
      }
    } catch (err) {
      console.error("ONBOARDING SAVE ERROR:", err);

      setError(
        err.message ||
          "Unable to save your artisan profile. Please try again."
      );
    } finally {
      setIsSaving(false);
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

        <div className="form-group">
          <label>{t.name}</label>

          <input
            type="text"
            name="name"
            placeholder={t.namePlaceholder}
            value={formData.name}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label>{t.craft}</label>

          <select
            name="craft"
            value={formData.craft}
            onChange={handleChange}
            disabled={isSaving}
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
            disabled={isSaving}
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
            disabled={isSaving}
          />
        </div>

        {error && (
          <div className="onboarding-error" role="alert">
            {error}
          </div>
        )}

        <button
          type="button"
          className="start-btn"
          onClick={handleContinue}
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : t.continue || "Continue →"}
        </button>
      </div>
    </div>
  );
}

export default Onboarding;