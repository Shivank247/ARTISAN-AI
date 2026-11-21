
import { useEffect, useState } from "react";
import "./App.css";

import CustomerHome from "./pages/customer/CustomerHome";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";

import LanguageSelect from "./pages/language/LanguageSelect";
import LandingPage from "./pages/landing/LandingPage";

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
   */
  const [cartItems, setCartItems] =
    useState([]);

  /*
   * Identifies which customer's cart is currently
   * loaded into React state.
   *
   * Prevents one customer's cart from being saved
   * into another customer's localStorage key.
   */
  const [cartOwnerKey, setCartOwnerKey] =
    useState(null);

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
   * Initialize the user session and load the
   * appropriate customer cart.
   *
   * This runs from login/registration event handlers,
   * not from a React effect.
   */
  const initializeUserSession = (user) => {
    if (!user || user.role !== "CUSTOMER") {
      setCartItems([]);
      setCartOwnerKey(null);
      setCurrentUser(user);
      return;
    }

    const storageKey = getCartStorageKey(user);

    if (!storageKey) {
      setCartItems([]);
      setCartOwnerKey(null);
      setCurrentUser(user);
      return;
    }

    try {
      const savedCart =
        localStorage.getItem(storageKey);

      const parsedCart = savedCart
        ? JSON.parse(savedCart)
        : [];

      setCartItems(
        Array.isArray(parsedCart)
          ? parsedCart
          : []
      );

      setCartOwnerKey(storageKey);
    } catch (error) {
      console.error(
        "Unable to load saved cart:",
        error
      );

      setCartItems([]);
      setCartOwnerKey(storageKey);
    }

    setCurrentUser(user);
  };

  /*
   * Save the customer's cart whenever it changes.
   *
   * Only save when the cart belongs to the
   * currently logged-in customer.
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

    if (
      !storageKey ||
      cartOwnerKey !== storageKey
    ) {
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
  }, [cartItems, currentUser, cartOwnerKey]);

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

    initializeUserSession(user);

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
      initializeUserSession(user);
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
  const handleProductApproval = async (data) => {
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
          Number.isInteger(data.suggestedPrice) &&
          data.suggestedPrice > 0
            ? data.suggestedPrice
            : 1,

        status: "DRAFT",
      };

      const response =
        await createProduct(productPayload);

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
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product-details");
  };

  /*
   * ADD TO CART
   */
  const handleAddToCart = (product) => {
    setCartItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) => item.id === product.id
        );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
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
    });

    setCurrentPage("cart");
  };

  /*
   * REMOVE FROM CART
   */
  const handleRemoveFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== productId
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

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );
  };

  /*
   * ORDER PLACED
   *
   * Clear the cart from React state and
   * persistent localStorage after checkout.
   */
  const handleOrderPlaced = () => {
    setCartItems([]);

    if (currentUser) {
      const storageKey =
        getCartStorageKey(currentUser);

      if (storageKey) {
        localStorage.removeItem(storageKey);
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
        onLoginSuccess={handleLoginSuccess}
        onShowRegister={() =>
          setCurrentPage("register")
        }
        onHome={() =>
          setCurrentPage("landing")
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
        onRegisterSuccess={handleRegisterSuccess}
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
        onComplete={handleOnboardingComplete}
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
   */
  if (currentPage === "upload") {
    return (
      <UploadProduct
        onBack={() =>
          setCurrentPage("dashboard")
        }
        onContinue={(productInput) => {
          console.log(
            "Product input received:",
            productInput
          );

          setProductImage(productInput);
          setCurrentPage("catalogue");
        }}
      />
    );
  }

  /*
   * AI CATALOGUE
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
          setGeneratedProduct(data);
          setCurrentPage("review");
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
          productData={generatedProduct}
          onBack={() =>
            setCurrentPage("catalogue")
          }
          onApprove={handleProductApproval}
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
        productData={generatedProduct}
        onPriceSaved={(updatedProduct) => {
          setGeneratedProduct(updatedProduct);
          setCurrentPage("dashboard");
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
        onProductClick={handleProductClick}
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
  if (currentPage === "product-details") {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() =>
          setCurrentPage("customer")
        }
        onAddToCart={handleAddToCart}
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
          setCurrentPage("customer")
        }
        onRemove={handleRemoveFromCart}
        onQuantityChange={handleQuantityChange}
        onCheckout={() =>
          setCurrentPage("checkout")
        }
      />
    );
  }

  /*
   * CUSTOMER CHECKOUT
   */
  if (currentPage === "checkout") {
    return (
      <Checkout
        cartItems={cartItems}
        onBack={() =>
          setCurrentPage("cart")
        }
        onOrderPlaced={handleOrderPlaced}
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
   * PUBLIC LANDING PAGE
   *
   * Flow: Language -> Landing -> Login / Register
   */
  if (currentPage === "landing") {
    return (
      <LandingPage
        language={selectedLanguage}
        onLogin={() =>
          setCurrentPage("login")
        }
        onRegister={() =>
          setCurrentPage("register")
        }
        onChangeLanguage={() =>
          setCurrentPage("language")
        }
      />
    );
  }

  /*
   * LANGUAGE SELECTION (initial page)
   */
  return (
    <LanguageSelect
      selectedLanguage={selectedLanguage}
      onSelect={(languageName) => {
        setSelectedLanguage(languageName);
        setCurrentPage("landing");
      }}
    />
  );
}

export default App;
