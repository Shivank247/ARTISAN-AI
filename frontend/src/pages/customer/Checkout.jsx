import { useMemo, useState } from "react";
import "./Checkout.css";
import { createOrder } from "../../services/api";

function Checkout({
  cartItems = [],
  onBack,
  onOrderPlaced,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price =
        typeof item.price === "number"
          ? item.price
          : Number(item.price) || 0;

      const quantity =
        Number(item.quantity) || 0;

      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const address = [
      formData.address.trim(),
      formData.city.trim(),
      formData.pincode.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!address) {
      setError("Please enter your delivery address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: name,
        phone,
        address,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: Number(item.quantity),
        })),
      };

      const response = await createOrder(orderData);

      setOrder(response.data);
    } catch (err) {
      console.error("Place order error:", err);

      setError(
        err.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewOrders = () => {
    if (typeof onOrderPlaced === "function") {
      onOrderPlaced(order);
      return;
    }

    if (typeof onBack === "function") {
      onBack();
    }
  };

  if (order) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-success">
            <div className="result-icon">
              ✓
            </div>

            <h1>
              Order Placed Successfully!
            </h1>

            <p>
              Thank you for supporting our artisans.
            </p>

            {order.id && (
              <p>
                <strong>Order ID:</strong>{" "}
                {order.id}
              </p>
            )}

            {order.status && (
              <p>
                <strong>Status:</strong>{" "}
                {order.status}
              </p>
            )}

            {order.totalAmount !== undefined && (
              <p>
                <strong>Total:</strong> ₹
                {order.totalAmount}
              </p>
            )}

            <button
              type="button"
              className="place-order-btn"
              onClick={handleViewOrders}
            >
              View My Orders →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button
          type="button"
          className="checkout-back-btn"
          onClick={onBack}
          disabled={isSubmitting}
        >
          ← Back to Cart
        </button>

        <div className="checkout-heading">
          <h1>Checkout</h1>

          <p>
            Enter your delivery details and review
            your order.
          </p>
        </div>

        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >
            <h2>Delivery Details</h2>

            <div className="checkout-input">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="checkout-input">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="checkout-input">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="checkout-input">
              <label htmlFor="address">
                Delivery Address
              </label>

              <textarea
                id="address"
                name="address"
                rows="4"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="checkout-row">
              <div className="checkout-input">
                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="checkout-input">
                <label htmlFor="pincode">
                  Pincode
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error && (
              <p
                className="checkout-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="place-order-btn"
              disabled={
                cartItems.length === 0 ||
                isSubmitting
              }
            >
              {isSubmitting
                ? "Placing Order..."
                : "Place Order →"}
            </button>

            <p className="checkout-note">
              Your order will be securely recorded
              in the application's backend.
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
                  {cartItems.map((item) => {
                    const price =
                      typeof item.price === "number"
                        ? item.price
                        : Number(item.price) || 0;

                    return (
                      <div
                        className="checkout-product"
                        key={item.id}
                      >
                        <div>
                          <h3>
                            {item.title ||
                              "Untitled Product"}
                          </h3>

                          <p>
                            Quantity:{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <strong>
                          ₹
                          {price *
                            Number(
                              item.quantity
                            )}
                        </strong>
                      </div>
                    );
                  })}
                </div>

                <div className="checkout-total">
                  <span>Total</span>
                  <strong>
                    ₹{subtotal}
                  </strong>
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