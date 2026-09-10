import { useState } from "react";
import { registerUser } from "../../services/api";
import "./Auth.css";

const translations = {
  English: {
    title: "Create Account",
    subtitle: "Register to continue to Karigar AI",

    nameLabel: "Full Name",
    namePlaceholder: "Enter your full name",

    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter your phone number",

    passwordLabel: "Password",
    passwordPlaceholder: "Create your password",

    roleLabel: "Account Type",
    artisan: "Artisan",
    customer: "Customer",
    admin: "Admin",

    languageLabel: "Preferred Language",

    register: "Register",
    creating: "Creating account...",

    haveAccount: "Already have an account?",
    login: "Login",

    required: "Please fill in all required fields.",
    failed: "Registration failed. Please try again.",
  },

  Hindi: {
    title: "अकाउंट बनाएं",
    subtitle: "Karigar AI जारी रखने के लिए रजिस्टर करें",

    nameLabel: "पूरा नाम",
    namePlaceholder: "अपना पूरा नाम दर्ज करें",

    phoneLabel: "फ़ोन नंबर",
    phonePlaceholder: "अपना फ़ोन नंबर दर्ज करें",

    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड बनाएं",

    roleLabel: "अकाउंट का प्रकार",
    artisan: "कारीगर",
    customer: "ग्राहक",
    admin: "एडमिन",

    languageLabel: "पसंदीदा भाषा",

    register: "रजिस्टर करें",
    creating: "अकाउंट बनाया जा रहा है...",

    haveAccount: "क्या आपका पहले से अकाउंट है?",
    login: "लॉगिन",

    required: "कृपया सभी आवश्यक जानकारी भरें।",
    failed: "रजिस्ट्रेशन विफल हुआ। कृपया दोबारा प्रयास करें।",
  },

  Bengali: {
    title: "অ্যাকাউন্ট তৈরি করুন",
    subtitle: "Karigar AI চালিয়ে যেতে রেজিস্টার করুন",

    nameLabel: "পুরো নাম",
    namePlaceholder: "আপনার পুরো নাম লিখুন",

    phoneLabel: "ফোন নম্বর",
    phonePlaceholder: "আপনার ফোন নম্বর লিখুন",

    passwordLabel: "পাসওয়ার্ড",
    passwordPlaceholder: "আপনার পাসওয়ার্ড তৈরি করুন",

    roleLabel: "অ্যাকাউন্টের ধরন",
    artisan: "কারিগর",
    customer: "গ্রাহক",
    admin: "অ্যাডমিন",

    languageLabel: "পছন্দের ভাষা",

    register: "রেজিস্টার করুন",
    creating: "অ্যাকাউন্ট তৈরি হচ্ছে...",

    haveAccount: "আপনার কি ইতিমধ্যে অ্যাকাউন্ট আছে?",
    login: "লগইন",

    required: "অনুগ্রহ করে সমস্ত প্রয়োজনীয় তথ্য পূরণ করুন।",
    failed: "রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
  },

  Tamil: {
    title: "கணக்கை உருவாக்கவும்",
    subtitle: "Karigar AI-ஐ தொடர பதிவு செய்யவும்",

    nameLabel: "முழு பெயர்",
    namePlaceholder: "உங்கள் முழு பெயரை உள்ளிடவும்",

    phoneLabel: "தொலைபேசி எண்",
    phonePlaceholder: "உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்",

    passwordLabel: "கடவுச்சொல்",
    passwordPlaceholder: "உங்கள் கடவுச்சொல்லை உருவாக்கவும்",

    roleLabel: "கணக்கு வகை",
    artisan: "கைவினைஞர்",
    customer: "வாடிக்கையாளர்",
    admin: "நிர்வாகி",

    languageLabel: "விருப்பமான மொழி",

    register: "பதிவு செய்யவும்",
    creating: "கணக்கு உருவாக்கப்படுகிறது...",

    haveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    login: "உள்நுழையவும்",

    required: "தேவையான அனைத்து தகவல்களையும் நிரப்பவும்.",
    failed: "பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
  },

  Telugu: {
    title: "ఖాతాను సృష్టించండి",
    subtitle: "Karigar AI కొనసాగించడానికి నమోదు చేసుకోండి",

    nameLabel: "పూర్తి పేరు",
    namePlaceholder: "మీ పూర్తి పేరును నమోదు చేయండి",

    phoneLabel: "ఫోన్ నంబర్",
    phonePlaceholder: "మీ ఫోన్ నంబర్‌ను నమోదు చేయండి",

    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "మీ పాస్‌వర్డ్‌ను సృష్టించండి",

    roleLabel: "ఖాతా రకం",
    artisan: "కళాకారుడు",
    customer: "కస్టమర్",
    admin: "అడ్మిన్",

    languageLabel: "ఇష్టమైన భాష",

    register: "నమోదు చేసుకోండి",
    creating: "ఖాతా సృష్టించబడుతోంది...",

    haveAccount: "ఇప్పటికే ఖాతా ఉందా?",
    login: "లాగిన్",

    required: "దయచేసి అవసరమైన అన్ని వివరాలను పూరించండి.",
    failed: "నమోదు విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
  },

  Marathi: {
    title: "खाते तयार करा",
    subtitle: "Karigar AI सुरू ठेवण्यासाठी रजिस्टर करा",

    nameLabel: "पूर्ण नाव",
    namePlaceholder: "तुमचे पूर्ण नाव टाका",

    phoneLabel: "फोन नंबर",
    phonePlaceholder: "तुमचा फोन नंबर टाका",

    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "तुमचा पासवर्ड तयार करा",

    roleLabel: "खात्याचा प्रकार",
    artisan: "कारागीर",
    customer: "ग्राहक",
    admin: "अॅडमिन",

    languageLabel: "पसंतीची भाषा",

    register: "रजिस्टर करा",
    creating: "खाते तयार होत आहे...",

    haveAccount: "आधीपासून खाते आहे का?",
    login: "लॉगिन",

    required: "कृपया सर्व आवश्यक माहिती भरा.",
    failed: "नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.",
  },
};

function Register({
  language = "English",
  onRegisterSuccess,
  onShowLogin,
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    role: "ARTISAN",
    language: language || "English",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const text = translations[language] || translations.English;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !formData.name ||
      !formData.phone ||
      !formData.password
    ) {
      setError(text.required);
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser(formData);

      onRegisterSuccess(response);
    } catch (err) {
      setError(err.message || text.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✦</div>

          <h1>{text.title}</h1>

          <p>{text.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="register-name">
              {text.nameLabel}
            </label>

            <input
              id="register-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={text.namePlaceholder}
              autoComplete="name"
              disabled={loading}
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="register-phone">
              {text.phoneLabel}
            </label>

            <input
              id="register-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={text.phonePlaceholder}
              autoComplete="tel"
              inputMode="numeric"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="register-password">
              {text.passwordLabel}
            </label>

            <input
              id="register-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={text.passwordPlaceholder}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {/* Account Type */}
          <div className="form-group">
            <label htmlFor="register-role">
              {text.roleLabel}
            </label>

            <select
              id="register-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="ARTISAN">
                {text.artisan}
              </option>

              <option value="CUSTOMER">
                {text.customer}
              </option>

              <option value="ADMIN">
                {text.admin}
              </option>
            </select>
          </div>

          {/* Preferred Language */}
          <div className="form-group">
            <label htmlFor="register-language">
              {text.languageLabel}
            </label>

            <select
              id="register-language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी</option>
              <option value="Bengali">বাংলা</option>
              <option value="Tamil">தமிழ்</option>
              <option value="Telugu">తెలుగు</option>
              <option value="Marathi">मराठी</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {/* Register Button */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? text.creating : text.register}
          </button>
        </form>

        {/* Login */}
        <div className="auth-switch">
          <span>{text.haveAccount}</span>

          <button
            type="button"
            className="auth-link"
            onClick={onShowLogin}
            disabled={loading}
          >
            {text.login}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;