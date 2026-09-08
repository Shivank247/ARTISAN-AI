import "./Dashboard.css";

function Dashboard({ artisanData, onUpload, onPriceRecommendation }) {
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
        {/* Welcome Section */}
        <section className="welcome-banner">
          <div>
            <p>Welcome back</p>

            <h1>{artisanData?.name || "Artisan"}! 👋</h1>

            <span>
              Let's digitize your craft and reach more customers.
            </span>
          </div>

          {artisanData?.craft && (
            <div className="craft-badge">
              {artisanData.craft}
            </div>
          )}
        </section>

        {/* Main Actions */}
        <section className="dashboard-grid">
          {/* Add Product */}
          <div className="dashboard-card primary-card">
            <div className="card-icon">📸</div>

            <h3>Add a Product</h3>

            <p>
              Upload a photo of your handmade product and continue with
              catalogue generation.
            </p>

            <button type="button" onClick={onUpload}>
              Upload Product →
            </button>
          </div>

          {/* Price Recommendation */}
          <div className="dashboard-card">
            <div className="card-icon">💰</div>

            <h3>AI Price Recommendation</h3>

            <p>
              View the price recommendation generated for your product.
            </p>

            <button
              type="button"
              onClick={onPriceRecommendation}
            >
              View Price →
            </button>
          </div>
        </section>

        {/* Artisan Profile */}
        <section className="quick-info">
          <h2>Your Artisan Profile</h2>

          <div className="profile-details">
            <div>
              <span>Craft</span>

              <strong>
                {artisanData?.craft || "Not added"}
              </strong>
            </div>

            <div>
              <span>Location</span>

              <strong>
                {artisanData?.location || "Not added"}
              </strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;