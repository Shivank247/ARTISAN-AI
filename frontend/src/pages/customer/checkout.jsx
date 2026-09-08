import { useMemo, useState } from "react";
import "./Checkout.css";

function Checkout({ cartItems = [], onBack }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price =
        typeof item.price === "number" ? item.price : 0;

      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button
          type="button"
          className="checkout-back-btn"
          onClick={onBack}
        >
          ← Back to Cart
        </button>

        <div className="checkout-heading">
          <h1>Checkout</h1>
          <p>Enter your delivery details and review your order.</p>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Delivery Details</h2>

            <div className="checkout-input">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkout-input">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkout-input">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkout-input">
              <label htmlFor="address">Delivery Address</label>
              <textarea
                id="address"
                name="address"
                rows="4"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkout-row">
              <div className="checkout-input">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-input">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="place-order-btn"
              disabled={cartItems.length === 0}
            >
              Continue to Payment →
            </button>

            <p className="checkout-note">
              Payment and order processing will be handled through the
              application's backend integration.
            </p>
          </form>

          <aside className="checkout-summary">
            <h2>Your Order</h2>

            {cartItems.length === 0 ? (
              <p className="checkout-empty">
                Your cart is empty.
              </p>
            ) : (
              <>
                <div className="checkout-products">
                  {cartItems.map((item) => (
                    <div
                      className="checkout-product"
                      key={item.id}
                    >
                      <div>
                        <h3>
                          {item.title || "Untitled Product"}
                        </h3>

                        <p>
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {typeof item.price === "number"
                          ? item.price * item.quantity
                          : 0}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="checkout-total">
                  <span>Total</span>
                  <strong>₹{subtotal}</strong>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Checkout;