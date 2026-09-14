import { useEffect, useState } from "react";
import "./Dashboard.css";

import { getMyProducts } from "../../services/api";

function Dashboard({
  artisanData,
  onUpload,
  onPriceRecommendation,
}) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProductHistory() {
      setLoadingProducts(true);
      setProductsError("");

      try {
        const response = await getMyProducts();

        if (!mounted) {
          return;
        }

        setProducts(response?.data?.products || []);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setProductsError(
          error?.message ||
            "Unable to load your product history."
        );
      } finally {
        if (mounted) {
          setLoadingProducts(false);
        }
      }
    }

    loadProductHistory();

    return () => {
      mounted = false;
    };
  }, []);

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatPrice(price) {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "Price not set";
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return "Price not set";
    }

    return `₹${numericPrice.toLocaleString("en-IN")}`;
  }

  function getStatusClass(status) {
    return status === "PUBLISHED"
      ? "product-status published"
      : "product-status draft";
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
        {/* Welcome Section */}
        <section className="welcome-banner">
          <div>
            <p>Welcome back</p>

            <h1>
              {artisanData?.name || "Artisan"}! 👋
            </h1>

            <span>
              Let's digitize your craft and reach more
              customers.
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
              Upload a photo of your handmade product and
              continue with catalogue generation.
            </p>

            <button
              type="button"
              onClick={onUpload}
            >
              Upload Product →
            </button>
          </div>

          {/* Price Recommendation */}
          <div className="dashboard-card">
            <div className="card-icon">💰</div>

            <h3>AI Price Recommendation</h3>

            <p>
              View the price recommendation generated for
              your product.
            </p>

            <button
              type="button"
              onClick={onPriceRecommendation}
            >
              View Price →
            </button>
          </div>
        </section>

        {/* Product History */}
        <section className="product-history">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">
                Your Products
              </p>

              <h2>Product History</h2>

              <span>
                All products you have created using Karigar
                AI.
              </span>
            </div>

            {!loadingProducts &&
              !productsError && (
                <div className="product-count">
                  {products.length}{" "}
                  {products.length === 1
                    ? "Product"
                    : "Products"}
                </div>
              )}
          </div>

          {loadingProducts && (
            <div className="history-state">
              <div className="history-loader">
                Loading your products...
              </div>
            </div>
          )}

          {!loadingProducts && productsError && (
            <div className="history-state error-state">
              <div className="history-state-icon">
                ⚠️
              </div>

              <h3>Unable to load product history</h3>

              <p>{productsError}</p>
            </div>
          )}

          {!loadingProducts &&
            !productsError &&
            products.length === 0 && (
              <div className="history-state">
                <div className="history-state-icon">
                  📦
                </div>

                <h3>No products yet</h3>

                <p>
                  Upload your first handmade product to
                  start building your digital catalogue.
                </p>

                <button
                  type="button"
                  onClick={onUpload}
                >
                  Upload Your First Product
                </button>
              </div>
            )}

          {!loadingProducts &&
            !productsError &&
            products.length > 0 && (
              <div className="product-history-grid">
                {products.map((product) => (
                  <article
                    className="history-product-card"
                    key={product.id}
                  >
                    <div className="history-product-image">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={
                            product.title ||
                            "Artisan product"
                          }
                        />
                      ) : (
                        <div className="no-product-image">
                          <span>🖼️</span>
                          <small>
                            Image unavailable
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="history-product-content">
                      <div className="history-product-top">
                        <span
                          className={getStatusClass(
                            product.status
                          )}
                        >
                          {product.status ===
                          "PUBLISHED"
                            ? "Published"
                            : "Draft"}
                        </span>

                        <span className="product-date">
                          {formatDate(
                            product.createdAt
                          )}
                        </span>
                      </div>

                      <h3>
                        {product.title ||
                          "Untitled Product"}
                      </h3>

                      <p className="product-category">
                        {product.category ||
                          "Category not set"}
                      </p>

                      {product.description && (
                        <p className="product-description">
                          {product.description}
                        </p>
                      )}

                      <div className="history-product-bottom">
                        <strong>
                          {formatPrice(product.price)}
                        </strong>

                        {product.material && (
                          <span>
                            {product.material}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
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