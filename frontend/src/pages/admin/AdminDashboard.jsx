import "./AdminDashboard.css";

function AdminDashboard() {
  const metrics = [
    {
      title: "Total Artisans",
      description: "Registered artisan data will appear here",
    },
    {
      title: "Total Products",
      description: "Product data will appear here",
    },
    {
      title: "Published Products",
      description: "Published catalogue data will appear here",
    },
    {
      title: "Orders",
      description: "Order data will appear here",
    },
  ];

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <div className="admin-logo">
            ✦ <span>Karigar AI</span>
          </div>

          <h1>Admin Dashboard</h1>
          <p>Monitor platform activity and overall impact.</p>
        </div>
      </header>

      <main className="admin-content">
        <section className="metrics-grid">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.title}>
              <h3>{metric.title}</h3>

              <div className="metric-value">—</div>

              <p>{metric.description}</p>
            </article>
          ))}
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <h2>Platform Activity</h2>
              <p>
                Recent platform activity will be displayed when data is
                available.
              </p>
            </div>
          </div>

          <div className="empty-state">
            <span>📊</span>
            <h3>No activity data available yet</h3>
            <p>
              Platform activity will appear here after backend integration.
            </p>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <h2>Impact Overview</h2>
              <p>
                Track how the platform is helping artisans and their products.
              </p>
            </div>
          </div>

          <div className="impact-grid">
            <div className="impact-card">
              <h3>Artisan Growth</h3>
              <p>Impact data will appear here.</p>
            </div>

            <div className="