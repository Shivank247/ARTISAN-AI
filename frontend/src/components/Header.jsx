import { BRAND_NAME } from "../config/brand";
import "./Header.css";

const languageNames = {
  English: "English",
  Hindi: "हिंदी",
  Bengali: "বাংলা",
  Tamil: "தமிழ்",
  Telugu: "తెలుగు",
  Marathi: "मराठी",
};

function Header({ language = "English", onHome }) {
  const brand = (
    <>
      <span className="header-logo-icon" aria-hidden="true">
        ✦
      </span>

      <span className="header-logo-text">{BRAND_NAME}</span>
    </>
  );

  return (
    <header className="app-header">
      {onHome ? (
        <button
          type="button"
          className="header-logo header-logo-button"
          onClick={onHome}
          aria-label={`${BRAND_NAME} — back to home`}
        >
          {brand}
        </button>
      ) : (
        <div className="header-logo">{brand}</div>
      )}

      <div className="header-language">
        <span className="header-language-icon" aria-hidden="true">
          🌐
        </span>

        <span>
          {languageNames[language] || "English"}
        </span>
      </div>
    </header>
  );
}

export default Header;
