import { useState } from "react";
import "./Onboarding.css";
import translations from "../../i18n/translations";

function Onboarding({ language, onComplete }) {
  const t = translations[language] || translations.English;

  const [formData, setFormData] = useState({
    name: "",
    craft: "",
    location: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleContinue = () => {
    // Get the latest values
    const data = {
      ...formData,
      name: formData.name.trim(),
      craft: formData.craft.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
    };

    // Required fields
    if (!data.name) {
      alert("Please enter your name.");
      return;
    }

    if (!data.craft) {
      alert("Please select what you create.");
      return;
    }

    console.log("ONBOARDING COMPLETE:", data);

    // Send data back to App.jsx
    if (typeof onComplete === "function") {
      onComplete(data);
    } else {
      console.error("onComplete function is missing");
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
          />
        </div>

        <div className="form-group">
          <label>{t.craft}</label>

          <select
            name="craft"
            value={formData.craft}
            onChange={handleChange}
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
          />
        </div>

        <button
          type="button"
          className="start-btn"
          onClick={handleContinue}
        >
          {t.continue || "Continue →"}
        </button>

      </div>
    </div>
  );
}

export default Onboarding;