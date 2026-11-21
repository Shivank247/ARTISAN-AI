import { BRAND_NAME } from "../../config/brand";
import "./LanguageSelect.css";

/*
 * Language identifiers (`name`) are unchanged from the original
 * App.jsx. They are passed to Login / Register / Onboarding and
 * must keep matching the keys in their translation tables.
 */
const LANGUAGES = [
  { name: "English", native: "English", glyph: "Aa" },
  { name: "Hindi", native: "हिंदी", glyph: "अ" },
  { name: "Bengali", native: "বাংলা", glyph: "অ" },
  { name: "Tamil", native: "தமிழ்", glyph: "அ" },
  { name: "Telugu", native: "తెలుగు", glyph: "అ" },
  { name: "Marathi", native: "मराठी", glyph: "अ" },
];

function LanguageSelect({ selectedLanguage = "", onSelect }) {
  return (
    <main className="lang-page">
      <div className="lang-card">
        <div className="lang-brand">
          <span className="lang-brand-mark" aria-hidden="true">
            ✦
          </span>
          <span className="lang-brand-name">{BRAND_NAME}</span>
        </div>

        <div className="lang-intro">
          <h1 id="lang-heading">Welcome</h1>
          <p>Select your preferred language to continue.</p>
        </div>

        <div
          className="lang-grid"
          role="group"
          aria-labelledby="lang-heading"
        >
          {LANGUAGES.map((language) => {
            const isSelected = selectedLanguage === language.name;

            return (
              <button
                key={language.name}
                type="button"
                className={`lang-option${
                  isSelected ? " is-selected" : ""
                }`}
                aria-pressed={isSelected}
                onClick={() => onSelect(language.name)}
              >
                <span className="lang-glyph" aria-hidden="true">
                  {language.glyph}
                </span>

                <span className="lang-labels">
                  <span className="lang-native">
                    {language.native}
                  </span>
                  <span className="lang-english">
                    {language.name}
                  </span>
                </span>

                <span className="lang-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            );
          })}
        </div>

        <p className="lang-note">
          You can change your language later from the home page.
        </p>
      </div>
    </main>
  );
}

export default LanguageSelect;
