import { useState } from "react";
import { loginUser } from "../../services/api";
import Header from "../../components/Header";
import "./Auth.css";

const translations = {
  English: {
    badge: "AI-powered digital commerce",
    heading: "Bring your craft",
    headingAccent: "to the digital world.",
    description:
      "Turn your handmade products into professional digital catalogues with the power of AI.",
    feature1: "Photo to Catalogue",
    feature1Sub: "Create listings from product photos",
    feature2: "Voice Powered",
    feature2Sub: "Describe your craft naturally",
    feature3: "Multilingual",
    feature3Sub: "Sell in your preferred language",

    title: "Welcome Back",
    subtitle: "Login to continue to Karigar AI",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter your phone number",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    login: "Login",
    loggingIn: "Logging in...",
    noAccount: "Don't have an account?",
    register: "Register",
    required: "Please enter your phone number and password.",
    failed: "Login failed. Please try again.",
  },

  Hindi: {
    badge: "AI आधारित डिजिटल कॉमर्स",
    heading: "अपने हुनर को",
    headingAccent: "डिजिटल दुनिया तक पहुँचाएं।",
    description:
      "AI की मदद से अपने हस्तनिर्मित उत्पादों को प्रोफेशनल डिजिटल कैटलॉग में बदलें।",
    feature1: "फोटो से कैटलॉग",
    feature1Sub: "उत्पाद की फोटो से लिस्टिंग बनाएं",
    feature2: "वॉइस से काम",
    feature2Sub: "अपने हुनर के बारे में बोलकर बताएं",
    feature3: "बहुभाषी",
    feature3Sub: "अपनी पसंदीदा भाषा में बेचें",

    title: "वापसी पर स्वागत है",
    subtitle: "Karigar AI जारी रखने के लिए लॉगिन करें",
    phoneLabel: "फ़ोन नंबर",
    phonePlaceholder: "अपना फ़ोन नंबर दर्ज करें",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    login: "लॉगिन",
    loggingIn: "लॉगिन हो रहा है...",
    noAccount: "क्या आपका अकाउंट नहीं है?",
    register: "रजिस्टर करें",
    required: "कृपया अपना फ़ोन नंबर और पासवर्ड दर्ज करें।",
    failed: "लॉगिन विफल हुआ। कृपया दोबारा प्रयास करें।",
  },

  Bengali: {
    badge: "AI চালিত ডিজিটাল কমার্স",
    heading: "আপনার কারুশিল্পকে",
    headingAccent: "ডিজিটাল জগতে নিয়ে আসুন।",
    description:
      "AI-এর সাহায্যে আপনার হাতে তৈরি পণ্যকে পেশাদার ডিজিটাল ক্যাটালগে পরিণত করুন।",
    feature1: "ছবি থেকে ক্যাটালগ",
    feature1Sub: "পণ্যের ছবি থেকে তালিকা তৈরি করুন",
    feature2: "ভয়েস চালিত",
    feature2Sub: "আপনার কারুশিল্প সম্পর্কে বলুন",
    feature3: "বহুভাষিক",
    feature3Sub: "আপনার পছন্দের ভাষায় বিক্রি করুন",

    title: "আবার স্বাগতম",
    subtitle: "Karigar AI চালিয়ে যেতে লগইন করুন",
    phoneLabel: "ফোন নম্বর",
    phonePlaceholder: "আপনার ফোন নম্বর লিখুন",
    passwordLabel: "পাসওয়ার্ড",
    passwordPlaceholder: "আপনার পাসওয়ার্ড লিখুন",
    login: "লগইন",
    loggingIn: "লগইন হচ্ছে...",
    noAccount: "আপনার কি অ্যাকাউন্ট নেই?",
    register: "রেজিস্টার করুন",
    required: "অনুগ্রহ করে আপনার ফোন নম্বর এবং পাসওয়ার্ড লিখুন।",
    failed: "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
  },

  Tamil: {
    badge: "AI மூலம் இயக்கப்படும் டிஜிட்டல் வர்த்தகம்",
    heading: "உங்கள் கைவினையை",
    headingAccent: "டிஜிட்டல் உலகிற்கு கொண்டு வாருங்கள்.",
    description:
      "AI உதவியுடன் உங்கள் கைவினைப் பொருட்களை தொழில்முறை டிஜிட்டல் பட்டியலாக மாற்றுங்கள்.",
    feature1: "புகைப்படத்திலிருந்து பட்டியல்",
    feature1Sub: "பொருளின் புகைப்படத்திலிருந்து பட்டியல் உருவாக்கவும்",
    feature2: "குரல் மூலம்",
    feature2Sub: "உங்கள் கைவினையைப் பற்றி பேசுங்கள்",
    feature3: "பல மொழிகள்",
    feature3Sub: "உங்களுக்கு விருப்பமான மொழியில் விற்கவும்",

    title: "மீண்டும் வரவேற்கிறோம்",
    subtitle: "Karigar AI-ஐ தொடர உள்நுழையவும்",
    phoneLabel: "தொலைபேசி எண்",
    phonePlaceholder: "உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்",
    passwordLabel: "கடவுச்சொல்",
    passwordPlaceholder: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
    login: "உள்நுழையவும்",
    loggingIn: "உள்நுழைகிறது...",
    noAccount: "கணக்கு இல்லையா?",
    register: "பதிவு செய்யவும்",
    required:
      "தயவுசெய்து உங்கள் தொலைபேசி எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.",
    failed: "உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
  },

  Telugu: {
    badge: "AI ఆధారిత డిజిటల్ కామర్స్",
    heading: "మీ కళను",
    headingAccent: "డిజిటల్ ప్రపంచానికి తీసుకురండి.",
    description:
      "AI సహాయంతో మీ చేతితో తయారు చేసిన ఉత్పత్తులను ప్రొఫెషనల్ డిజిటల్ క్యాటలాగ్‌లుగా మార్చండి.",
    feature1: "ఫోటో నుండి క్యాటలాగ్",
    feature1Sub: "ఉత్పత్తి ఫోటో నుండి జాబితాను సృష్టించండి",
    feature2: "వాయిస్ ఆధారితం",
    feature2Sub: "మీ కళ గురించి సహజంగా మాట్లాడండి",
    feature3: "బహుభాషా",
    feature3Sub: "మీకు ఇష్టమైన భాషలో అమ్మండి",

    title: "తిరిగి స్వాగతం",
    subtitle: "Karigar AI కొనసాగించడానికి లాగిన్ చేయండి",
    phoneLabel: "ఫోన్ నంబర్",
    phonePlaceholder: "మీ ఫోన్ నంబర్‌ను నమోదు చేయండి",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "మీ పాస్‌వర్డ్‌ను నమోదు చేయండి",
    login: "లాగిన్",
    loggingIn: "లాగిన్ అవుతోంది...",
    noAccount: "మీకు ఖాతా లేదా?",
    register: "నమోదు చేసుకోండి",
    required:
      "దయచేసి మీ ఫోన్ నంబర్ మరియు పాస్‌వర్డ్‌ను నమోదు చేయండి.",
    failed: "లాగిన్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
  },

  Marathi: {
    badge: "AI आधारित डिजिटल कॉमर्स",
    heading: "तुमची कला",
    headingAccent: "डिजिटल जगात घेऊन या.",
    description:
      "AI च्या मदतीने तुमच्या हस्तनिर्मित वस्तूंना व्यावसायिक डिजिटल कॅटलॉगमध्ये बदला.",
    feature1: "फोटो ते कॅटलॉग",
    feature1Sub: "उत्पादनाच्या फोटोमधून लिस्टिंग तयार करा",
    feature2: "व्हॉइस आधारित",
    feature2Sub: "तुमच्या कलेबद्दल बोलून सांगा",
    feature3: "बहुभाषिक",
    feature3Sub: "तुमच्या पसंतीच्या भाषेत विक्री करा",

    title: "पुन्हा स्वागत आहे",
    subtitle: "Karigar AI सुरू ठेवण्यासाठी लॉगिन करा",
    phoneLabel: "फोन नंबर",
    phonePlaceholder: "तुमचा फोन नंबर टाका",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "तुमचा पासवर्ड टाका",
    login: "लॉगिन",
    loggingIn: "लॉगिन होत आहे...",
    noAccount: "तुमचे अकाउंट नाही का?",
    register: "रजिस्टर करा",
    required: "कृपया तुमचा फोन नंबर आणि पासवर्ड टाका.",
    failed: "लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.",
  },
};

function Login({
  language = "English",
  onLoginSuccess,
  onShowRegister,
}) {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const text =
    translations[language] || translations.English;

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

    if (!formData.phone || !formData.password) {
      setError(text.required);
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(formData);

      onLoginSuccess(response);
    } catch (err) {
      setError(err.message || text.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Header language={language} />

      <main className="auth-main">
        {/* Left Side */}
        <section className="auth-info">
          <div className="auth-info-badge">
            ✦ {text.badge}
          </div>

          <h2>
            {text.heading}{" "}
            <span>{text.headingAccent}</span>
          </h2>

          <p className="auth-info-description">
            {text.description}
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-icon">
                📸
              </span>

              <div>
                <strong>{text.feature1}</strong>
                <small>{text.feature1Sub}</small>
              </div>
            </div>

            <div className="auth-feature">
              <span className="auth-feature-icon">
                🎙️
              </span>

              <div>
                <strong>{text.feature2}</strong>
                <small>{text.feature2Sub}</small>
              </div>
            </div>

            <div className="auth-feature">
              <span className="auth-feature-icon">
                🌍
              </span>

              <div>
                <strong>{text.feature3}</strong>
                <small>{text.feature3Sub}</small>
              </div>
            </div>
          </div>
        </section>

        {/* Login Card */}
        <section className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">✦</div>

            <h1>{text.title}</h1>

            <p>{text.subtitle}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="login-phone">
                {text.phoneLabel}
              </label>

              <input
                id="login-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={text.phonePlaceholder}
                disabled={loading}
                autoComplete="tel"
                inputMode="numeric"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">
                {text.passwordLabel}
              </label>

              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={text.passwordPlaceholder}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? text.loggingIn : text.login}
            </button>
          </form>

          <div className="auth-switch">
            <span>{text.noAccount}</span>

            <button
              type="button"
              className="auth-link"
              onClick={onShowRegister}
              disabled={loading}
            >
              {text.register}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;