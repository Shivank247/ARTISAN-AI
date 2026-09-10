import "./Header.css";

const languageNames = {
  English: "English",
  Hindi: "हिंदी",
  Bengali: "বাংলা",
  Tamil: "தமிழ்",
  Telugu: "తెలుగు",
  Marathi: "मराठी",
};

function Header({ language = "English" }) {
  return (
    <header className="app-header">
      <div className="header-logo">
        <span className="header-logo-icon">✦</span>

        <span className="header-logo-text">
          Karigar AI
        </span>
      </div>

      <div className="header-language">
        <span className="header-language-icon">🌐</span>

        <span>
          {languageNames[language] || "English"}
        </span>
      </div>
    </header>
  );
}

export default Header;