import "./Cart.css";

function Cart({
  cartItems = [],
  onBack,
  onRemove,
  onQuantityChange,
  onCheckout,
}) {
  const getPrice = (product) => {
    return typeof product.price === "number" ? product.price : 0;
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + getPrice(item) * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <div className="cart-container">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
        >
          ← Continue Shopping
        </button>

        <div className="cart-heading">
          <h1>Your Cart</h1>
          <p>Review the products you want to purchase.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add a product from the marketplace to continue.</p>

            <button
              type="button"
              className="continue-shopping-btn"
              onClick={onBack}
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-product-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title || "Product"}
                      />
                    ) : (
                      <span>Image unavailable</span>
                    )}
                  </div>

                  <div className="cart-product-info">
                    <span>
                      {item.category || "Uncategorized"}
                    </span>

                    <h3>
                      {item.title || "Untitled Product"}
                    </h3>

                    {item.artisan?.name && (
                      <p>By {item.artisan.name}</p>
                    )}

                    <strong>
                      ₹{getPrice(item)}
                    </strong>
                  </div>

                  <div className="cart-actions">
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() =>
                          onQuantityChange(
                            item.id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          onQuantityChange(
                            item.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => onRemove(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="order-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="summary-row total-row">
                <span>Total</span>
                <strong>₹{subtotal}</strong>
              </div>

              <button
                type="button"
                className="checkout-btn"
                onClick={onCheckout}
              >
                Proceed to Checkout →
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;