import { useEffect, useState } from "react";
import "./App.css";

import CustomerHome from "./pages/customer/CustomerHome";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Onboarding from "./pages/artisan/Onboarding";
import Dashboard from "./pages/artisan/Dashboard";
import UploadProduct from "./pages/artisan/UploadProduct";
import AICatalogue from "./pages/artisan/AICatalogue";
import PriceRecommendation from "./pages/artisan/PriceRecommendation";
import ReviewProduct from "./pages/artisan/ReviewProduct";

import AdminDashboard from "./pages/admin/AdminDashboard";

import { createProduct } from "./services/api";

function App() {
  const [selectedLanguage, setSelectedLanguage] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState("language");

  const [currentUser, setCurrentUser] =
    useState(null);

  const [artisanData, setArtisanData] =
    useState(null);

  /*
   * Product input from artisan.
   *
   * This stores:
   * - imageUrl
   * - mimeType
   * - inputText (real voice transcript)
   * - language
   */
  const [productImage, setProductImage] =
    useState(null);

  const [generatedProduct, setGeneratedProduct] =
    useState(null);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  /*
   * Persistent customer cart.
   *
   * The actual cart data is stored in localStorage
   * for the currently logged-in customer.
   */
  const [cartItems, setCartItems] =
    useState([]);

  const [isCreatingProduct, setIsCreatingProduct] =
    useState(false);

  const [productError, setProductError] =
    useState("");

  /*
   * Create a unique localStorage key for each customer.
   *
   * This prevents Customer A from seeing
   * Customer B's cart on the same browser.
   */
  const getCartStorageKey = (user) => {
    if (!user) {
      return null;
    }

    const userId =
      user.id ||
      user.userId ||
      user.phone;

    if (!userId) {
      return null;
    }

    return `artisan_ai_cart_${userId}`;
  };

  /*
   * Load the customer's saved cart whenever
   * the logged-in customer changes.
   */
  useEffect(() => {
    if (
      !currentUser ||
      currentUser.role !== "CUSTOMER"
    ) {
      setCartItems([]);
      return;
    }

    const storageKey =
      getCartStorageKey(currentUser);

    if (!storageKey) {
      setCartItems([]);
      return;
    }

    try {
      const savedCart =
        localStorage.getItem(storageKey);

      if (!savedCart) {
        setCartItems([]);
        return;
      }

      const parsedCart =
        JSON.parse(savedCart);

      if (Array.isArray(parsedCart)) {
        setCartItems(parsedCart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error(
        "Unable to load saved cart:",
        error
      );

      setCartItems([]);
    }
  }, [currentUser]);

  /*
   * Save the customer's cart whenever it changes.
   */
  useEffect(() => {
    if (
      !currentUser ||
      currentUser.role !== "CUSTOMER"
    ) {
      return;
    }

    const storageKey =
      getCartStorageKey(currentUser);

    if (!storageKey) {
      return;
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Unable to save cart:",
        error
      );
    }
  }, [cartItems, currentUser]);

  /*
   * LOGIN
   */
  const handleLoginSuccess = (response) => {
    const user = response?.data?.user;

    if (!user) {
      console.error(
        "Login succeeded but user data is missing:",
        response
      );
      return;
    }

    console.log("Logged in user:", user);
    console.log("User role:", user.role);

    setCurrentUser(user);

    /*
     * CUSTOMER
     */
    if (user.role === "CUSTOMER") {
      setCurrentPage("customer");
      return;
    }

    /*
     * ARTISAN
     */
    if (user.role === "ARTISAN") {
      setCurrentPage("onboarding");
      return;
    }

    /*
     * ADMIN
     */
    if (user.role === "ADMIN") {
      setCurrentPage("admin");
      return;
    }

    alert("Unknown user role: " + user.role);
  };

  /*
   * REGISTER
   */
  const handleRegisterSuccess = (response) => {
    const user = response?.data?.user;

    if (user) {
      setCurrentUser(user);
    }

    setCurrentPage("onboarding");
  };

  /*
   * ARTISAN ONBOARDING
   *
   * Onboarding.jsx saves the profile to the backend
   * through PUT /api/artisans/me.
   */
  const handleOnboardingComplete = (data) => {
    const artisanProfile =
      data?.artisanProfile;

    setArtisanData({
      name: data?.name || "",
      craft:
        artisanProfile?.craftType ||
        data?.craft ||
        "",
      location: [
        artisanProfile?.city,
        artisanProfile?.state,
      ]
        .filter(Boolean)
        .join(", "),
      description:
        artisanProfile?.story ||
        data?.description ||
        "",
      ...artisanProfile,
    });

    setCurrentPage("dashboard");
  };

  /*
   * PRODUCT APPROVAL
   *
   * Creates the AI-generated product as a DRAFT
   * before moving to price recommendation.
   */
  const handleProductApproval = async (
    data
  ) => {
    setProductError("");
    setIsCreatingProduct(true);

    try {
      const productPayload = {
        title: data.title,
        description: data.description,
        category: data.category,
        material: data.material,

        tags: Array.isArray(data.tags)
          ? data.tags
          : [],

        /*
         * Image generated/uploaded during the
         * AI catalogue flow.
         */
        imageUrl:
          productImage?.imageUrl || "",

        city:
          artisanData?.city ||
          artisanData?.location ||
          null,

        state:
          artisanData?.state ||
          null,

        productionTimeDays: 1,

        price:
          Number.isInteger(
            data.suggestedPrice
          ) &&
          data.suggestedPrice > 0
            ? data.suggestedPrice
            : 1,

        status: "DRAFT",
      };

      const response =
        await createProduct(
          productPayload
        );

      const savedProduct =
        response.data;

      setGeneratedProduct({
        ...data,
        ...savedProduct,
      });

      setCurrentPage("price");
    } catch (err) {
      setProductError(
        err.message ||
          "Unable to save the product draft. Please try again."
      );
    } finally {
      setIsCreatingProduct(false);
    }
  };

  /*
   * CUSTOMER PRODUCT DETAILS
   */
  const handleProductClick = (
    product
  ) => {
    setSelectedProduct(product);
    setCurrentPage("product-details");
  };

  /*
   * ADD TO CART
   *
   * Updates React state.
   * The useEffect above automatically persists
   * the updated cart into localStorage.
   */
  const handleAddToCart = (
    product
  ) => {
    setCartItems(
      (currentItems) => {
        const existingItem =
          currentItems.find(
            (item) =>
              item.id === product.id
          );

        if (existingItem) {
          return currentItems.map(
            (item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity:
                      item.quantity + 1,
                  }
                : item
          );
        }

        return [
          ...currentItems,
          {
            ...product,
            quantity: 1,
          },
        ];
      }
    );

    setCurrentPage("cart");
  };

  /*
   * REMOVE FROM CART
   */
  const handleRemoveFromCart = (
    productId
  ) => {
    setCartItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== productId
        )
    );
  };

  /*
   * CHANGE CART QUANTITY
   */
  const handleQuantityChange = (
    productId,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      return;
    }

    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.id === productId
              ? {
                  ...item,
                  quantity:
                    newQuantity,
                }
              : item
        )
    );
  };

  /*
   * ORDER PLACED
   *
   * Clear the cart from both React state
   * and persistent localStorage after
   * successful checkout.
   */
  const handleOrderPlaced = () => {
    setCartItems([]);

    if (currentUser) {
      const storageKey =
        getCartStorageKey(
          currentUser
        );

      if (storageKey) {
        localStorage.removeItem(
          storageKey
        );
      }
    }

    setSelectedProduct(null);
    setCurrentPage("customer");
  };

  /*
   * LOGIN PAGE
   */
  if (currentPage === "login") {
    return (
      <Login
        language={selectedLanguage}
        onLoginSuccess={
          handleLoginSuccess
        }
        onShowRegister={() =>
          setCurrentPage(
            "register"
          )
        }
      />
    );
  }

  /*
   * REGISTER PAGE
   */
  if (currentPage === "register") {
    return (
      <Register
        language={selectedLanguage}
        onRegisterSuccess={
          handleRegisterSuccess
        }
        onShowLogin={() =>
          setCurrentPage("login")
        }
      />
    );
  }

  /*
   * ARTISAN ONBOARDING
   */
  if (currentPage === "onboarding") {
    return (
      <Onboarding
        language={selectedLanguage}
        onComplete={
          handleOnboardingComplete
        }
      />
    );
  }

  /*
   * ARTISAN DASHBOARD
   */
  if (currentPage === "dashboard") {
    return (
      <Dashboard
        artisanData={artisanData}
        onUpload={() =>
          setCurrentPage("upload")
        }
        onPriceRecommendation={() =>
          setCurrentPage("price")
        }
      />
    );
  }

  /*
   * ARTISAN PRODUCT UPLOAD
   *
   * UploadProduct returns:
   * {
   *   imageUrl,
   *   mimeType,
   *   inputText,
   *   language
   * }
   */
  if (currentPage === "upload") {
    return (
      <UploadProduct
        onBack={() =>
          setCurrentPage(
            "dashboard"
          )
        }
        onContinue={(
          productInput
        ) => {
          console.log(
            "Product input received:",
            productInput
          );

          setProductImage(
            productInput
          );

          setCurrentPage(
            "catalogue"
          );
        }}
      />
    );
  }

  /*
   * AI CATALOGUE
   *
   * The AI receives:
   * - Product image
   * - Artisan profile
   * - Selected language
   * - Real voice transcript
   */
  if (currentPage === "catalogue") {
    return (
      <AICatalogue
        onBack={() =>
          setCurrentPage("upload")
        }
        productData={{
          image: productImage,

          artisan: artisanData,

          language:
            productImage?.language ||
            selectedLanguage,

          inputText:
            productImage?.inputText ||
            "",

          transcript:
            productImage?.inputText ||
            "",

          mimeType:
            productImage?.mimeType ||
            "image/jpeg",
        }}
        onGenerated={(data) => {
          setGeneratedProduct(
            data
          );
          setCurrentPage(
            "review"
          );
        }}
      />
    );
  }

  /*
   * PRODUCT REVIEW
   */
  if (currentPage === "review") {
    return (
      <>
        <ReviewProduct
          productData={
            generatedProduct
          }
          onBack={() =>
            setCurrentPage(
              "catalogue"
            )
          }
          onApprove={
            handleProductApproval
          }
        />

        {isCreatingProduct && (
          <div className="app-loading-message">
            Saving product draft...
          </div>
        )}

        {productError && (
          <div
            className="app-error-message"
            role="alert"
          >
            {productError}
          </div>
        )}
      </>
    );
  }

  /*
   * PRICE RECOMMENDATION
   */
  if (currentPage === "price") {
    return (
      <PriceRecommendation
        onBack={() =>
          setCurrentPage("review")
        }
        productData={
          generatedProduct
        }
        onPriceSaved={(
          updatedProduct
        ) => {
          setGeneratedProduct(
            updatedProduct
          );

          setCurrentPage(
            "dashboard"
          );
        }}
      />
    );
  }

  /*
   * CUSTOMER MARKETPLACE
   */
  if (currentPage === "customer") {
    return (
      <CustomerHome
        onProductClick={
          handleProductClick
        }
        onCart={() =>
          setCurrentPage("cart")
        }
        cartCount={cartItems.reduce(
          (total, item) =>
            total + (Number(item.quantity) || 0),
          0
        )}
      />
    );
  }

  /*
   * CUSTOMER PRODUCT DETAILS
   */
  if (
    currentPage ===
    "product-details"
  ) {
    return (
      <ProductDetails
        product={
          selectedProduct
        }
        onBack={() =>
          setCurrentPage(
            "customer"
          )
        }
        onAddToCart={
          handleAddToCart
        }
      />
    );
  }

  /*
   * CUSTOMER CART
   */
  if (currentPage === "cart") {
    return (
      <Cart
        cartItems={cartItems}
        onBack={() =>
          setCurrentPage(
            "customer"
          )
        }
        onRemove={
          handleRemoveFromCart
        }
        onQuantityChange={
          handleQuantityChange
        }
        onCheckout={() =>
          setCurrentPage(
            "checkout"
          )
        }
      />
    );
  }

  /*
   * CUSTOMER CHECKOUT
   */
  if (
    currentPage === "checkout"
  ) {
    return (
      <Checkout
        cartItems={cartItems}
        onBack={() =>
          setCurrentPage("cart")
        }
        onOrderPlaced={
          handleOrderPlaced
        }
      />
    );
  }

  /*
   * ADMIN DASHBOARD
   */
  if (currentPage === "admin") {
    return <AdminDashboard />;
  }

  /*
   * LANGUAGE SELECTION
   */
  const languages = [
    {
      name: "English",
      native: "English",
      icon: "🇬🇧",
    },
    {
      name: "Hindi",
      native: "हिंदी",
      icon: "🇮🇳",
    },
    {
      name: "Bengali",
      native: "বাংলা",
      icon: "🇮🇳",
    },
    {
      name: "Tamil",
      native: "தமிழ்",
      icon: "🇮🇳",
    },
    {
      name: "Telugu",
      native: "తెలుగు",
      icon: "🇮🇳",
    },
    {
      name: "Marathi",
      native: "मराठी",
      icon: "🇮🇳",
    },
  ];

  return (
    <div className="app">
      <div className="language-card">
        <div className="logo">
          <span>✦</span>
          <h1>Karigar AI</h1>
        </div>

        <div className="welcome-section">
          <h2>Welcome! 👋</h2>

          <p>
            Select your preferred
            language to continue
          </p>
        </div>

        <div className="language-grid">
          {languages.map(
            (language) => (
              <button
                key={
                  language.name
                }
                type="button"
                className={`language-btn ${
                  selectedLanguage ===
                  language.name
                    ? "selected"
                    : ""
                }`}
                onClick={() => {
                  setSelectedLanguage(
                    language.name
                  );

                  setCurrentPage(
                    "login"
                  );
                }}
              >
                <span className="flag">
                  {language.icon}
                </span>

                <div className="language-text">
                  <strong>
                    {
                      language.native
                    }
                  </strong>

                  <small>
                    {
                      language.name
                    }
                  </small>
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;