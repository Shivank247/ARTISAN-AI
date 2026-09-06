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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.craft) {
      alert(t.alert);
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
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="start-btn">
            {t.continue}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;