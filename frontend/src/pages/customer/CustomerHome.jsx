import { useEffect, useState } from "react";
import "./CustomerHome.css";
import {
  getOrders,
  getProducts,
  searchProductsAI,
} from "../../services/api";

function CustomerHome({
  onProductClick,
  onCart,
  cartCount = 0,
}) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [interpretedFilters, setInterpretedFilters] =
    useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] =
    useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Normal marketplace product loading.
   * Used for:
   * - initial homepage
   * - category buttons
   */
  const loadProducts = async (
    searchQuery = "",
    category = ""
  ) => {
    setLoading(true);
    setError("");
    setAiSearchActive(false);
    setInterpretedFilters(null);

    try {
      const effectiveSearch = category
        ? category
        : searchQuery.trim();

      const response = await getProducts({
        search: effectiveSearch,
      });

      const productList = Array.isArray(
        response?.data?.products
      )
        ? response.data.products
        : [];

      setProducts(productList);
    } catch (err) {
      console.error(
        "Customer products error:",
        err
      );

      setProducts([]);

      setError(
        err.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * AI-powered natural language search.
   *
   * Example:
   * "handmade products from Bihar under 1000"
   *
   * Backend interprets:
   * - state
   * - price
   * - category
   * - keywords
   */
  const performAISearch = async (
    searchQuery
  ) => {
    const query = searchQuery.trim();

    if (!query) {
      loadProducts("", selectedCategory);
      return;
    }

    setLoading(true);
    setError("");
    setSelectedCategory("");
    setAiSearchActive(true);

    try {
      const response =
        await searchProductsAI(query);

      const data = response?.data || {};

      const productList = Array.isArray(
        data.products
      )
        ? data.products
        : [];

      setProducts(productList);

      setInterpretedFilters(
        data.interpretedFilters || null
      );
    } catch (err) {
      console.error(
        "AI customer search error:",
        err
      );

      setProducts([]);

      setInterpretedFilters(null);

      setError(
        err.message ||
          "AI search failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    const token =
      localStorage.getItem("authToken");

    if (!token) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    setOrdersError("");

    try {
      const response = await getOrders();

      const orderList = Array.isArray(
        response?.data
      )
        ? response.data
        : [];

      setOrders(orderList);
    } catch (err) {
      console.error(
        "Customer orders error:",
        err
      );

      setOrders([]);

      setOrdersError(
        err.message ||
          "Unable to load your orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  /*
   * Initial products load.
   *
   * Search is intentionally NOT triggered on
   * every keystroke. AI search happens when the
   * customer presses Enter.
   */
  useEffect(() => {
    loadProducts("", "");
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSearchSubmit = async (
    event
  ) => {
    event.preventDefault();

    await performAISearch(search);
  };

  const handleCategoryClick = (category) => {
    setSearch("");

    setSelectedCategory((currentCategory) =>
      currentCategory === category
        ? ""
        : category
    );

    if (
      selectedCategory === category
    ) {
      loadProducts("", "");
    } else {
      loadProducts("", category);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setAiSearchActive(false);
    setInterpretedFilters(null);

    loadProducts("", "");
  };

  const handleHomeClick = () => {
    clearFilters();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleExploreClick = () => {
    document
      .querySelector(".products-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const handleCategoriesClick = () => {
    document
      .querySelector(".categories-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const handleOrdersClick = () => {
    document
      .querySelector(".orders-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const getImageSource = (product) => {
    const imageUrl = product?.imageUrl;

    if (!imageUrl) {
      return null;
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("data:")
    ) {
      return imageUrl;
    }

    return `data:image/jpeg;base64,${imageUrl}`;
  };

  const formatDate = (dateValue) => {
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
  };

  const getStatusClass = (status) => {
    return `order-status order-status-${String(
      status || "PLACED"
    ).toLowerCase()}`;
  };

  const currentOrders = orders.filter(
    (order) =>
      order.status !== "DELIVERED" &&
      order.status !== "CANCELLED"
  );

  return (
    <div className="customer-home">
      {/* Header */}
      <header className="customer-header">
        <button
          type="button"
          className="customer-logo"
          onClick={handleHomeClick}
        >
          ✦ <span>Karigar AI</span>
        </button>

        <nav>
          <button
            type="button"
            onClick={handleHomeClick}
          >
            Home
          </button>

          <button
            type="button"
            onClick={handleExploreClick}
          >
            Explore
          </button>

          <button
            type="button"
            onClick={handleCategoriesClick}
          >
            Categories
          </button>

          <button
            type="button"
            onClick={handleOrdersClick}
          >
            My Orders
          </button>

          <button
            type="button"
            className="customer-cart-button"
            onClick={onCart}
            aria-label={`Open cart with ${cartCount} ${
              cartCount === 1 ? "item" : "items"
            }`}
          >
            🛒 Cart ({cartCount})
          </button>
        </nav>

        <button
          type="button"
          className="customer-login"
          onClick={handleHomeClick}
        >
          Customer
        </button>
      </header>

      {/* Hero */}
      <section className="customer-hero">
        <div className="hero-content">
          <p className="hero-tag">
            Discover India's Craftsmanship ✨
          </p>

          <h1>
            Discover Handmade
            <span> Stories & Crafts</span>
          </h1>

          <p>
            Explore unique handmade products
            created by talented artisans from
            across India.
          </p>

          <form
            className="search-box"
            onSubmit={handleSearchSubmit}
          >
            <span aria-hidden="true">
              🔍
            </span>

            <input
              type="search"
              placeholder="Try: handmade products from Bihar under ₹1000..."
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );
                setSelectedCategory("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  clearFilters();
                }
              }}
              aria-label="AI search products or crafts"
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={clearFilters}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

            <button
              type="submit"
              className="ai-search-button"
              disabled={
                loading ||
                !search.trim()
              }
            >
              {loading && aiSearchActive
                ? "Searching..."
                : "AI Search"}
            </button>
          </form>

          <p className="ai-search-hint">
            💡 Search naturally by craft,
            location, price, or keywords.
          </p>
        </div>

        <div
          className="hero-art"
          aria-hidden="true"
        >
          🎨
        </div>
      </section>

      {/* AI interpretation */}
      {aiSearchActive &&
        interpretedFilters && (
          <section className="ai-search-result-info">
            <div>
              <strong>
                ✨ AI understood your search
              </strong>

              <div className="ai-filter-tags">
                {interpretedFilters.category && (
                  <span>
                    Craft:{" "}
                    {
                      interpretedFilters.category
                    }
                  </span>
                )}

                {interpretedFilters.state && (
                  <span>
                    State:{" "}
                    {
                      interpretedFilters.state
                    }
                  </span>
                )}

                {interpretedFilters.maxPrice !==
                  null &&
                  interpretedFilters.maxPrice !==
                    undefined && (
                    <span>
                      Up to ₹
                      {
                        interpretedFilters.maxPrice
                      }
                    </span>
                  )}

                {interpretedFilters.keywords
                  ?.length > 0 && (
                  <span>
                    Keywords:{" "}
                    {interpretedFilters.keywords.join(
                      ", "
                    )}
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

      {/* Categories */}
      <section className="categories-section">
        <h2>Explore by Craft</h2>

        <div className="categories">
          {[
            "Handloom",
            "Pottery",
            "Jewellery",
            "Woodwork",
            "Painting",
          ].map((category) => (
            <button
              type="button"
              key={category}
              className={
                selectedCategory === category
                  ? "selected-category"
                  : ""
              }
              onClick={() =>
                handleCategoryClick(
                  category
                )
              }
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="products-section">
        <div className="section-heading">
          <div>
            <p>
              {aiSearchActive
                ? "AI-POWERED SEARCH"
                : "HANDPICKED FOR YOU"}
            </p>

            <h2>
              {selectedCategory
                ? `${selectedCategory} Products`
                : aiSearchActive
                ? "AI Search Results"
                : search
                ? "Search Results"
                : "Featured Products"}
            </h2>
          </div>

          {(search ||
            selectedCategory ||
            aiSearchActive) && (
            <button
              type="button"
              className="view-all"
              onClick={clearFilters}
            >
              View All Products
            </button>
          )}
        </div>

        {loading && (
          <div
            className="products-loading"
            role="status"
          >
            {aiSearchActive
              ? "AI is finding the best products..."
              : "Loading products..."}
          </div>
        )}

        {error && !loading && (
          <div
            className="products-error"
            role="alert"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                aiSearchActive
                  ? performAISearch(
                      search
                    )
                  : loadProducts(
                      search,
                      selectedCategory
                    )
              }
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => {
                const imageSource =
                  getImageSource(product);

                return (
                  <article
                    className="product-card"
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      onProductClick?.(
                        product
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                          "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();

                        onProductClick?.(
                          product
                        );
                      }
                    }}
                  >
                    <div className="product-image">
                      {imageSource ? (
                        <img
                          src={imageSource}
                          alt={
                            product.title ||
                            "Artisan product"
                          }
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";

                            const parent =
                              event
                                .currentTarget
                                .parentElement;

                            if (parent) {
                              parent.classList.add(
                                "image-error"
                              );
                            }
                          }}
                        />
                      ) : (
                        <span>
                          Image unavailable
                        </span>
                      )}

                      <span className="image-error-text">
                        Image unavailable
                      </span>
                    </div>

                    <div className="product-info">
                      <span className="product-craft">
                        {product.category ||
                          "Uncategorized"}
                      </span>

                      <h3>
                        {product.title ||
                          "Untitled Product"}
                      </h3>

                      {product.artisan?.name && (
                        <p>
                          By{" "}
                          {
                            product.artisan
                              .name
                          }
                        </p>
                      )}

                      {product.description && (
                        <p className="product-description">
                          {product
                            .description
                            .length > 90
                            ? `${product.description.slice(
                                0,
                                90
                              )}...`
                            : product.description}
                        </p>
                      )}

                      <div className="product-bottom">
                        <strong>
                          {product.price !==
                            undefined &&
                          product.price !==
                            null
                            ? `₹${product.price}`
                            : "Price unavailable"}
                        </strong>

                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            onProductClick?.(
                              product
                            );
                          }}
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="no-products">
                <h3>
                  No products found.
                </h3>

                {search ||
                selectedCategory ? (
                  <>
                    <p>
                      No products match your
                      current search or
                      category.
                    </p>

                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                    >
                      Show All Products
                    </button>
                  </>
                ) : (
                  <p>
                    No published products are
                    available yet.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Orders */}
      <section className="orders-section">
        <div className="section-heading">
          <div>
            <p>YOUR PURCHASES</p>
            <h2>My Orders</h2>
          </div>

          <button
            type="button"
            className="view-all"
            onClick={loadOrders}
          >
            Refresh Orders
          </button>
        </div>

        {ordersLoading && (
          <div
            className="orders-loading"
            role="status"
          >
            Loading your orders...
          </div>
        )}

        {ordersError &&
          !ordersLoading && (
            <div
              className="orders-error"
              role="alert"
            >
              <p>{ordersError}</p>

              <button
                type="button"
                onClick={loadOrders}
              >
                Retry
              </button>
            </div>
          )}

        {!ordersLoading &&
          !ordersError &&
          orders.length === 0 && (
            <div className="no-orders">
              <h3>No orders yet.</h3>

              <p>
                Your placed orders will appear
                here.
              </p>

              <button
                type="button"
                onClick={
                  handleExploreClick
                }
              >
                Explore Products
              </button>
            </div>
          )}

        {!ordersLoading &&
          !ordersError &&
          orders.length > 0 && (
            <>
              {currentOrders.length > 0 && (
                <div className="current-order-block">
                  <div className="order-section-label">
                    Current Order
                  </div>

                  {currentOrders.map(
                    (order) => (
                      <div
                        className="order-card current-order"
                        key={order.id}
                      >
                        <div className="order-card-header">
                          <div>
                            <span className="order-label">
                              Order
                            </span>

                            <strong>
                              #{order.id}
                            </strong>
                          </div>

                          <span
                            className={getStatusClass(
                              order.status
                            )}
                          >
                            {order.status ||
                              "PLACED"}
                          </span>
                        </div>

                        <div className="order-items">
                          {order.items?.map(
                            (item) => {
                              const imageSource =
                                getImageSource(
                                  item.product
                                );

                              return (
                                <div
                                  className="order-item"
                                  key={item.id}
                                >
                                  <div className="order-item-image">
                                    {imageSource ? (
                                      <img
                                        src={
                                          imageSource
                                        }
                                        alt={
                                          item
                                            .product
                                            ?.title ||
                                          "Ordered product"
                                        }
                                      />
                                    ) : (
                                      "🎨"
                                    )}
                                  </div>

                                  <div className="order-item-info">
                                    <strong>
                                      {item
                                        .product
                                        ?.title ||
                                        "Product"}
                                    </strong>

                                    <span>
                                      Qty:{" "}
                                      {
                                        item.quantity
                                      }
                                    </span>
                                  </div>

                                  <strong>
                                    ₹
                                    {item.unitPrice *
                                      item.quantity}
                                  </strong>
                                </div>
                              );
                            }
                          )}
                        </div>

                        <div className="order-card-footer">
                          <span>
                            Placed on{" "}
                            {formatDate(
                              order.createdAt
                            )}
                          </span>

                          <strong>
                            Total: ₹
                            {
                              order.totalAmount
                            }
                          </strong>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {orders.some(
                (order) =>
                  order.status ===
                    "DELIVERED" ||
                  order.status === "CANCELLED"
              ) && (
                <div className="order-history-block">
                  <div className="order-section-label">
                    Order History
                  </div>

                  {orders
                    .filter(
                      (order) =>
                        order.status ===
                          "DELIVERED" ||
                        order.status ===
                          "CANCELLED"
                    )
                    .map((order) => (
                      <div
                        className="order-card"
                        key={order.id}
                      >
                        <div className="order-card-header">
                          <div>
                            <span className="order-label">
                              Order
                            </span>

                            <strong>
                              #{order.id}
                            </strong>
                          </div>

                          <span
                            className={getStatusClass(
                              order.status
                            )}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="order-items">
                          {order.items?.map(
                            (item) => (
                              <div
                                className="order-item"
                                key={item.id}
                              >
                                <div className="order-item-image">
                                  {getImageSource(
                                    item.product
                                  ) ? (
                                    <img
                                      src={getImageSource(
                                        item.product
                                      )}
                                      alt={
                                        item
                                          .product
                                          ?.title ||
                                        "Ordered product"
                                      }
                                    />
                                  ) : (
                                    "🎨"
                                  )}
                                </div>

                                <div className="order-item-info">
                                  <strong>
                                    {item
                                      .product
                                      ?.title ||
                                      "Product"}
                                  </strong>

                                  <span>
                                    Qty:{" "}
                                    {
                                      item.quantity
                                    }
                                  </span>
                                </div>

                                <strong>
                                  ₹
                                  {item.unitPrice *
                                    item.quantity}
                                </strong>
                              </div>
                            )
                          )}
                        </div>

                        <div className="order-card-footer">
                          <span>
                            {formatDate(
                              order.createdAt
                            )}
                          </span>

                          <strong>
                            Total: ₹
                            {
                              order.totalAmount
                            }
                          </strong>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
      </section>
    </div>
  );
}

export default CustomerHome;