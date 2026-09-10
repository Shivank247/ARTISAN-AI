import { useEffect, useState } from "react";
import "./CustomerHome.css";
import { getProducts } from "../../services/api";

function CustomerHome({ onProductClick }) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async (searchQuery = "", category = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await getProducts({
        search: searchQuery,
        category,
      });

      setProducts(response.data || []);
    } catch (err) {
      setError(
        err.message || "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Product fetching is intentionally triggered when search/category filters change.
    // loadProducts manages the loading, error, and product state for this API request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts(search, selectedCategory);
  }, [search, selectedCategory]);

  const handleCategoryClick = (category) => {
    setSelectedCategory((currentCategory) =>
      currentCategory === category ? "" : category
    );
  };

  return (
    <div className="customer-home">
      {/* Header */}
      <header className="customer-header">
        <div className="customer-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <nav>
          <button type="button">Home</button>
          <button type="button">Explore</button>
          <button type="button">Categories</button>
        </nav>

        <button type="button" className="customer-login">
          Login
        </button>
      </header>

      {/* Hero */}
      <section className="customer-hero">
        <div className="hero-content">
          <p className="hero-tag">Discover India's Craftsmanship ✨</p>

          <h1>
            Discover Handmade
            <span> Stories & Crafts</span>
          </h1>

          <p>
            Explore unique handmade products created by talented artisans
            from across India.
          </p>

          <div className="search-box">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search for products or crafts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products or crafts"
            />
          </div>
        </div>

        <div className="hero-art">🎨</div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <h2>Explore by Craft</h2>

        <div className="categories">
          {["Handloom", "Pottery", "Jewellery", "Woodwork", "Painting"].map(
            (category) => (
              <button
                type="button"
                key={category}
                className={
                  selectedCategory === category ? "selected-category" : ""
                }
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            )
          )}
        </div>
      </section>

      {/* Products */}
      <section className="products-section">
        <div className="section-heading">
          <div>
            <p>HANDPICKED FOR YOU</p>
            <h2>Featured Products</h2>
          </div>

          <button type="button" className="view-all">
            View All →
          </button>
        </div>

        {loading && (
          <div className="products-loading" role="status">
            Loading products...
          </div>
        )}

        {error && (
          <div className="products-error" role="alert">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => loadProducts(search, selectedCategory)}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <article
                  className="product-card"
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onProductClick?.(product)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onProductClick?.(product);
                    }
                  }}
                >
                  <div className="product-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title || "Product"}
                      />
                    ) : (
                      <span>Image unavailable</span>
                    )}
                  </div>

                  <div className="product-info">
                    <span className="product-craft">
                      {product.category || "Uncategorized"}
                    </span>

                    <h3>{product.title || "Untitled Product"}</h3>

                    {product.artisan?.name && (
                      <p>By {product.artisan.name}</p>
                    )}

                    <div className="product-bottom">
                      <strong>
                        {typeof product.price === "number"
                          ? `₹${product.price}`
                          : "Price unavailable"}
                      </strong>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onProductClick?.(product);
                        }}
                      >
                        View →
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="no-products">No products found.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default CustomerHome;