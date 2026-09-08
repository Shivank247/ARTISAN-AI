import { useState } from "react";
import "./App.css";

import CustomerHome from "./pages/customer/CustomerHome";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";

import Onboarding from "./pages/artisan/Onboarding";
import Dashboard from "./pages/artisan/Dashboard";
import UploadProduct from "./pages/artisan/UploadProduct";
import AICatalogue from "./pages/artisan/AICatalogue";
import PriceRecommendation from "./pages/artisan/PriceRecommendation";
import ReviewProduct from "./pages/artisan/ReviewProduct";

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentPage, setCurrentPage] = useState("language");

  const [artisanData, setArtisanData] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [generatedProduct, setGeneratedProduct] = useState(null);

  // Customer-side frontend state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const languages = [
    { name: "English", native: "English", icon: "🇬🇧" },
    { name: "Hindi", native: "हिंदी", icon: "🇮🇳" },
    { name: "Bengali", native: "বাংলা", icon: "🇮🇳" },
    { name: "Tamil", native: "தமிழ்", icon: "🇮🇳" },
    { name: "Telugu", native: "తెలుగు", icon: "🇮🇳" },
    { name: "Marathi", native: "मराठी", icon: "🇮🇳" },
  ];

  const handleLanguageContinue = () => {
    if (selectedLanguage) {
      setCurrentPage("onboarding");
    }
  };

  const handleOnboardingComplete = (data) => {
    setArtisanData(data);
    setCurrentPage("dashboard");
  };

  // Customer-side functions

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product-details");
  };

  const handleAddToCart = (product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
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

  const handleRemoveFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId)
    );
  };

  const handleQuantityChange = (productId, newQuantity) => {
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

  // Artisan onboarding
  if (currentPage === "onboarding") {
    return (
      <Onboarding
        language={selectedLanguage}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Upload product
  if (currentPage === "upload") {
    return (
      <UploadProduct
        onBack={() => setCurrentPage("dashboard")}
        onContinue={(image) => {
          setProductImage(image);
          setCurrentPage("catalogue");
        }}
      />
    );
  }

  // AI catalogue
  if (currentPage === "catalogue") {
    return (
      <AICatalogue
        onBack={() => setCurrentPage("upload")}
        productData={{
          image: productImage,
          artisan: artisanData,
          language: selectedLanguage,
        }}
        onGenerated={(data) => {
          setGeneratedProduct(data);
          setCurrentPage("review");
        }}
      />
    );
  }

  // Review product
  if (currentPage === "review") {
    return (
      <ReviewProduct
        productData={generatedProduct}
        onBack={() => setCurrentPage("catalogue")}
        onApprove={(data) => {
          setGeneratedProduct(data);
          setCurrentPage("price");
        }}
      />
    );
  }

  // Price recommendation
  if (currentPage === "price") {
    return (
      <PriceRecommendation
        onBack={() => setCurrentPage("dashboard")}
        productData={generatedProduct}
      />
    );
  }

  // Artisan dashboard
  if (currentPage === "dashboard") {
    return (
      <Dashboard
        artisanData={artisanData}
        onUpload={() => setCurrentPage("upload")}
        onPriceRecommendation={() => setCurrentPage("price")}
      />
    );
  }

  // Customer marketplace
  if (currentPage === "customer") {
    return (
      <CustomerHome
        onProductClick={handleProductClick}
      />
    );
  }

  // Product details
  if (currentPage === "product-details") {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setCurrentPage("customer")}
        onAddToCart={handleAddToCart}
      />
    );
  }

  // Cart
  if (currentPage === "cart") {
    return (
      <Cart
        cartItems={cartItems}
        onBack={() => setCurrentPage("customer")}
        onRemove={handleRemoveFromCart}
        onQuantityChange={handleQuantityChange}
        onCheckout={() => setCurrentPage("checkout")}
      />
    );
  }

  // Checkout
  if (currentPage === "checkout") {
    return (
      <Checkout
        cartItems={cartItems}
        onBack={() => setCurrentPage("cart")}
      />
    );
  }

  // Language selection
  return (
    <div className="app">
      <div className="language-card">
        <div className="logo">
          <span>✦</span>
          <h1>Karigar AI</h1>
        </div>

        <div className="welcome-section">
          <h2>Welcome! 👋</h2>
          <p>Select your preferred language to continue</p>
        </div>

        <div className="language-grid">
          {languages.map((language) => (
            <button
              key={language.name}
              className={`language-btn ${
                selectedLanguage === language.name
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedLanguage(language.name)
              }
            >
              <span className="flag">
                {language.icon}
              </span>

              <div className="language-text">
                <strong>{language.native}</strong>
                <small>{language.name}</small>
              </div>
            </button>
          ))}
        </div>

        <button
          className="continue-btn"
          disabled={!selectedLanguage}
          onClick={handleLanguageContinue}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

export default App;