import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import {
  getAdminDashboard,
  getAdminArtisans,
  getAdminProducts,
  getAdminOrders,
} from "../../services/api";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    artisans: 0,
    products: 0,
    publishedProducts: 0,
    orders: 0,
  });

  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        setError("");

        const [
          dashboardResponse,
          artisansResponse,
          productsResponse,
          ordersResponse,
        ] = await Promise.all([
          getAdminDashboard(),
          getAdminArtisans(),
          getAdminProducts(),
          getAdminOrders(),
        ]);

        setDashboard(
          dashboardResponse?.data || {
            artisans: 0,
            products: 0,
            publishedProducts: 0,
            orders: 0,
          }
        );

        setArtisans(artisansResponse?.data || []);
        setProducts(productsResponse?.data || []);
        setOrders(ordersResponse?.data || []);
      } catch (err) {
        console.error("Admin dashboard error:", err);
        setError(
          err?.message ||
            "Unable to load admin dashboard. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const formatPrice = (value) => {
    const number = Number(value || 0);

    return `₹${number.toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <h2>Loading Admin Dashboard...</h2>
          <p>Fetching platform data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <div className="admin-logo">
            ✦ <span>Karigar AI</span>
          </div>

          <h1>Admin Dashboard</h1>
          <p>
            Monitor artisans, products, orders and platform impact.
          </p>
        </div>
      </header>

      <main className="admin-content">
        {error && (
          <div className="admin-error">
            <strong>Dashboard Error</strong>
            <span>{error}</span>
          </div>
        )}

        {/* ================= METRICS ================= */}

        <section className="metrics-grid">
          <article className="metric-card">
            <div className="metric-icon">👥</div>

            <div>
              <h3>Total Artisans</h3>
              <div className="metric-value">
                {dashboard.artisans}
              </div>
              <p>Registered artisans</p>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon">🛍️</div>

            <div>
              <h3>Total Products</h3>
              <div className="metric-value">
                {dashboard.products}
              </div>
              <p>Products in catalogue</p>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon">✅</div>

            <div>
              <h3>Published Products</h3>
              <div className="metric-value">
                {dashboard.publishedProducts}
              </div>
              <p>Live marketplace products</p>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon">📦</div>

            <div>
              <h3>Total Orders</h3>
              <div className="metric-value">
                {dashboard.orders}
              </div>
              <p>Orders placed</p>
            </div>
          </article>
        </section>

        {/* ================= ARTISANS ================= */}

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <h2>Artisans</h2>
              <p>
                Registered artisans and their marketplace activity.
              </p>
            </div>

            <span className="section-count">
              {artisans.length}
            </span>
          </div>

          {artisans.length === 0 ? (
            <div className="empty-state">
              <span>👤</span>
              <h3>No artisans found</h3>
              <p>
                Artisan profiles will appear here after registration.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Artisan</th>
                    <th>Craft</th>
                    <th>Location</th>
                    <th>Language</th>
                    <th>Products</th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {artisans.map((artisan) => (
                    <tr key={artisan.id}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar">
                            {(
                              artisan.user?.name ||
                              "A"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {artisan.user?.name ||
                                "Unnamed Artisan"}
                            </strong>

                            <small>
                              {artisan.user?.phone || "No phone"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {artisan.craftType || "—"}
                      </td>

                      <td>
                        {[artisan.city, artisan.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>

                      <td>
                        {artisan.user?.language || "—"}
                      </td>

                      <td>
                        {Array.isArray(artisan.products)
                          ? artisan.products.length
                          : 0}
                      </td>

                      <td>
                        {formatDate(artisan.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================= PRODUCTS ================= */}

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <h2>Products</h2>
              <p>
                Monitor products created by artisans.
              </p>
            </div>

            <span className="section-count">
              {products.length}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <span>🛍️</span>
              <h3>No products found</h3>
              <p>
                Products will appear here when artisans create them.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Artisan</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>
                          {product.title || "Untitled Product"}
                        </strong>
                      </td>

                      <td>
                        {product.category || "—"}
                      </td>

                      <td>
                        {formatPrice(product.price)}
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${String(
                            product.status || "UNKNOWN"
                          ).toLowerCase()}`}
                        >
                          {product.status || "UNKNOWN"}
                        </span>
                      </td>

                      <td>
                        {product.artisan?.craftType ||
                          product.artisan?.city ||
                          "—"}
                      </td>

                      <td>
                        {formatDate(product.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================= ORDERS ================= */}

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <h2>Orders</h2>
              <p>
                Monitor marketplace orders placed by customers.
              </p>
            </div>

            <span className="section-count">
              {orders.length}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <span>📦</span>
              <h3>No orders found</h3>
              <p>
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>
                          #{String(order.id).slice(-8)}
                        </strong>
                      </td>

                      <td>
                        <div>
                          <strong>
                            {order.customerName ||
                              "Customer"}
                          </strong>

                          <small className="table-subtext">
                            {order.phone || "No phone"}
                          </small>
                        </div>
                      </td>

                      <td>
                        {Array.isArray(order.items)
                          ? order.items.length
                          : 0}
                      </td>

                      <td>
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${String(
                            order.status || "PLACED"
                          ).toLowerCase()}`}
                        >
                          {order.status || "PLACED"}
                        </span>
                      </td>

                      <td>
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================= IMPACT ================= */}

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <h2>Impact Overview</h2>
              <p>
                Quick view of the platform's current marketplace
                reach.
              </p>
            </div>
          </div>

          <div className="impact-grid">
            <div className="impact-card">
              <span className="impact-icon">🎨</span>

              <div>
                <h3>Artisan Growth</h3>
                <p>
                  {dashboard.artisans} artisans are currently
                  registered on the platform.
                </p>
              </div>
            </div>

            <div className="impact-card">
              <span className="impact-icon">🌐</span>

              <div>
                <h3>Digital Marketplace</h3>
                <p>
                  {dashboard.publishedProducts} products are
                  currently available to customers.
                </p>
              </div>
            </div>

            <div className="impact-card">
              <span className="impact-icon">📈</span>

              <div>
                <h3>Marketplace Activity</h3>
                <p>
                  {dashboard.orders} orders have been placed
                  through the platform.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;