import { useState } from "react";
import "./Dashboard.css";
import VoiceInput from "./VoiceInput";
import AICatalogue from "./AICatalogue";

function Dashboard({
  artisanData,
  onUpload,
  onPriceRecommendation,
}) {
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Voice Input page
  if (currentPage === "voice") {
    return (
      <VoiceInput
        onBack={() => setCurrentPage("dashboard")}
        onContinue={() => setCurrentPage("dashboard")}
      />
    );
  }

  // AI Catalogue page
  if (currentPage === "catalogue") {
    return (
      <AICatalogue
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand">
          <span>✦</span>
          <h2>Karigar AI</h2>
        </div>

        <div className="profile-name">
          👋 {artisanData?.name || "Artisan"}
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-banner">
          <div>
            <p>Welcome back</p>
            <h1>{artisanData?.name || "Artisan"}! 👋</h1>
            <span>
              Let's digitize your craft and reach more customers.
            </span>
          </div>

          <div className="craft-badge">
            {artisanData?.craft || "Your Craft"}
          </div>
        </section>

        <section className="dashboard-grid">
          {/* Add Product */}
          <div className="dashboard-card primary-card">
            <div className="card-icon">📸</div>
            <h3>Add a Product</h3>
            <p>
              Upload a photo and let AI help create your product catalogue.
            </p>
            <button onClick={onUpload}>Upload Product →</button>
          </div>

          {/* Voice Input */}
          <div className="dashboard-card">
            <div className="card-icon">🎙️</div>
            <h3>Voice Input</h3>
            <p>Describe your product using your voice.</p>

            <button onClick={() => setCurrentPage("voice")}>
              Start Speaking →
            </button>
          </div>

          {/* AI Catalogue */}
          <div className="dashboard-card">
            <div className="card-icon">✨</div>
            <h3>AI Catalogue</h3>
            <p>Generate product titles and descriptions using AI.</p>

            <button onClick={() => setCurrentPage("catalogue")}>
              Generate →
            </button>
          </div>

          {/* AI Price Recommendation */}
          <div className="dashboard-card">
            <div className="card-icon">💰</div>
            <h3>AI Price Recommendation</h3>
            <p>Get an estimated price recommendation for your product.</p>

            <button onClick={onPriceRecommendation}>
              Get Price →
            </button>
          </div>
        </section>

        <section className="quick-info">
          <h2>Your Artisan Profile</h2>

          <div className="profile-details">
            <div>
              <span>Craft</span>
              <strong>{artisanData?.craft || "Not added"}</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>{artisanData?.location || "Not added"}</strong>
            </div>

            <div>
              <span>Products</span>
              <strong>0</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;