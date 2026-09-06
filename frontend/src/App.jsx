import { useState } from "react";
import "./App.css";

import Onboarding from "./pages/artisan/Onboarding";
import Dashboard from "./pages/artisan/Dashboard";

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentPage, setCurrentPage] = useState("language");
  const [artisanData, setArtisanData] = useState(null);

  const languages = [
    { name: "English", native: "English", icon: "🇬🇧" },
    { name: "Hindi", native: "हिंदी", icon: "🇮🇳" },
    { name: "Bengali", native: "বাংলা", icon: "🇮🇳" },
    { name: "Tamil", native: "தமிழ்", icon: "🇮🇳" },
    { name: "Telugu", native: "తెలుగు", icon: "🇮🇳" },
    { name: "Marathi", native: "मराठी", icon: "🇮🇳" },
  ];

  const handleLanguageContinue = () => {
    if (selectedLanguage) {
      setCurrentPage("onboarding");
    }
  };

  const handleOnboardingComplete = (data) => {
    setArtisanData(data);
    setCurrentPage("dashboard");
  };

  if (currentPage === "onboarding") {
    return (
      <Onboarding
        language={selectedLanguage}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (currentPage === "dashboard") {
    return <Dashboard artisanData={artisanData} />;
  }

  return (
    <div className="app">
      <div className="language-card">
        <div className="logo">
          <span>✦</span>
          <h1>Karigar AI</h1>
        </div>

        <div className="welcome-section">
          <h2>Welcome! 👋</h2>
          <p>Select your preferred language to continue</p>
        </div>

        <div className="language-grid">
          {languages.map((language) => (
            <button
              key={language.name}
              className={`language-btn ${
                selectedLanguage === language.name ? "selected" : ""
              }`}
              onClick={() => setSelectedLanguage(language.name)}
            >
              <span className="flag">{language.icon}</span>

              <div className="language-text">
                <strong>{language.native}</strong>
                <small>{language.name}</small>
              </div>
            </button>
          ))}
        </div>

        <button
          className="continue-btn"
          disabled={!selectedLanguage}
          onClick={handleLanguageContinue}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

export default App;