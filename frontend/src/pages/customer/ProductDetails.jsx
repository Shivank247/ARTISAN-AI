import "./ProductDetails.css";

function ProductDetails({ product, onBack, onAddToCart }) {
  if (!product) {
    return (
      <div className="product-details-page">
        <div className="product-details-card">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>

          <div className="empty-product-state">
            <h2>Product not available</h2>
            <p>
              Product information will be displayed here when it is available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const artisan = product.artisan;

  return (
    <div className="product-details-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Marketplace
      </button>

      <div className="product-details-layout">
        <section className="product-image-section">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title || "Product"}
              className="details-product-image"
            />
          ) : (
            <div className="image-unavailable">
              Product image unavailable
            </div>
          )}
        </section>

        <section className="product-info-section">
          <span className="product-category">
            {product.category || "Category not available"}
          </span>

          <h1>{product.title || "Untitled Product"}</h1>

          <p className="product-description">
            {product.description || "Description not available."}
          </p>

          {product.material && (
            <p>
              <strong>Material:</strong> {product.material}
            </p>
          )}

          {product.price !== undefined && product.price !== null && (
            <p className="product-price">₹{product.price}</p>
          )}

          <button
            className="add-cart-btn"
            onClick={() => onAddToCart?.(product)}
          >
            Add to Cart
          </button>
        </section>
      </div>

      {artisan && (
        <section className="meet-artisan-section">
          <h2>Meet the Artisan</h2>

          <div className="artisan-info">
            {artisan.name && (
              <div>
                <span>Name</span>
                <p>{artisan.name}</p>
              </div>
            )}

            {artisan.craftType && (
              <div>
                <span>Craft</span>
                <p>{artisan.craftType}</p>
              </div>
            )}

            {(artisan.city || artisan.state) && (
              <div>
                <span>Location</span>
                <p>
                  {[artisan.city, artisan.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}

            {artisan.story && (
              <div className="artisan-story">
                <span>Artisan Story</span>
                <p>{artisan.story}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetails;