import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { BRAND_NAME } from "../../config/brand";
import {
  HeroPoster,
  JewelleryArt,
  MetalArt,
  PaintingArt,
  PotteryArt,
  TextileArt,
  WoodworkArt,
} from "./CraftArt";
import "./LandingPage.css";

/*
 * Three.js is only fetched when the landing page is shown.
 * If the chunk fails to load, fall back to the static artwork
 * instead of crashing the whole app.
 */
function SceneUnavailable({ onFail }) {
  useEffect(() => {
    onFail?.();
  }, [onFail]);

  return null;
}

const HeroScene = lazy(() =>
  import("./HeroScene").catch(() => ({ default: SceneUnavailable }))
);

const CURRENT_YEAR = new Date().getFullYear();

const NAV_LINKS = [
  { id: "top", label: "Home" },
  { id: "crafts", label: "Explore Crafts" },
  { id: "how", label: "How It Works" },
  { id: "artisans", label: "For Artisans" },
  { id: "about", label: "About" },
];

const HERO_TAGS = [
  { label: "Hand-thrown terracotta", className: "tag-vase" },
  { label: "Handwoven textiles", className: "tag-textile" },
  { label: "Carved wood", className: "tag-wood" },
  { label: "Cast brass", className: "tag-brass" },
];

const CATEGORIES = [
  {
    name: "Pottery",
    tone: "terracotta",
    Art: PotteryArt,
    text: "Hand-thrown terracotta, glazed ceramics and clay vessels shaped on the wheel.",
  },
  {
    name: "Textiles",
    tone: "sage",
    Art: TextileArt,
    text: "Handwoven, block-printed and embroidered cloth carrying regional patterns.",
  },
  {
    name: "Woodwork",
    tone: "cream",
    Art: WoodworkArt,
    text: "Carved boxes, panels, toys and décor shaped by hand from seasoned timber.",
  },
  {
    name: "Metal Craft",
    tone: "forest",
    Art: MetalArt,
    text: "Brass, copper and bronze vessels and ornaments, cast and beaten by hand.",
  },
  {
    name: "Paintings",
    tone: "cream",
    Art: PaintingArt,
    text: "Folk and tribal paintings on cloth, paper and walls, rich with local stories.",
  },
  {
    name: "Jewellery",
    tone: "terracotta",
    Art: JewelleryArt,
    text: "Traditional ornaments in metal, beads and stone, made in age-old techniques.",
  },
];

const STEPS = [
  {
    title: "Discover authentic handmade crafts",
    text: "Browse pottery, textiles, woodwork and more, each piece made by hand and presented with its story.",
  },
  {
    title: "Connect with skilled artisans",
    text: "See who made it, where they work and what inspired the piece before you decide.",
  },
  {
    title: "Support traditional craftsmanship",
    text: "Every purchase helps artisans keep their craft, and the skills behind it, alive for the next generation.",
  },
];

const ARTISAN_FEATURES = [
  {
    title: "Photo to catalogue",
    text: "Upload a photo of your work and get a ready-to-review product listing.",
  },
  {
    title: "Speak in your language",
    text: "Describe your craft by voice in the language you are most comfortable with.",
  },
  {
    title: "Price guidance",
    text: "Receive a suggested price to help you list your work with confidence.",
  },
  {
    title: "Reach customers",
    text: "Put your work in front of people who value handmade craftsmanship.",
  },
];

const ABOUT_VALUES = [
  {
    title: "Authenticity first",
    text: "Handmade work, presented honestly and with its maker.",
  },
  {
    title: "Artisan-centred",
    text: "Tools designed around how artisans actually work, not the other way round.",
  },
  {
    title: "Story in every piece",
    text: "Craft carries history. We keep the story attached to the object.",
  },
];

function canRenderWebGL() {
  try {
    if (navigator.connection?.saveData) {
      return false;
    }

    const probe = document.createElement("canvas");
    const context =
      probe.getContext("webgl2") || probe.getContext("webgl");

    return Boolean(context);
  } catch {
    return false;
  }
}

function prefersReducedMotion() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}

function scrollToSection(id) {
  const behavior = prefersReducedMotion() ? "auto" : "smooth";

  if (id === "top") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior, block: "start" });
  element.focus({ preventScroll: true });
}

function LandingPage({
  language = "English",
  onLogin,
  onRegister,
  onChangeLanguage,
}) {
  const rootRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sceneState, setSceneState] = useState(() =>
    canRenderWebGL() ? "loading" : "failed"
  );

  const handleSceneReady = useCallback(() => {
    setSceneState((current) =>
      current === "failed" ? current : "ready"
    );
  }, []);

  const handleSceneFail = useCallback(() => {
    setSceneState("failed");
  }, []);

  /* Close the mobile menu with Escape. */
  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  /* Reveal sections as they scroll into view. */
  useEffect(() => {
    const root = rootRef.current;

    if (
      !root ||
      prefersReducedMotion() ||
      !("IntersectionObserver" in window)
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    root.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });

    root.classList.add("reveal-ready");

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  const handleNavClick = (event, id) => {
    event.preventDefault();
    setMenuOpen(false);
    scrollToSection(id);
  };

  const closeMenuThen = (action) => () => {
    setMenuOpen(false);
    action?.();
  };

  const stageClass = `hero-stage${
    sceneState === "ready" ? " is-ready" : ""
  }`;

  return (
    <div className="landing" ref={rootRef} id="top" tabIndex={-1}>
      <a className="skip-link" href="#crafts" onClick={(e) => handleNavClick(e, "crafts")}>
        Skip to crafts
      </a>

      {/* ---------------------------------------------------------- */}
      {/* Navigation                                                  */}
      {/* ---------------------------------------------------------- */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <a
            className="landing-brand"
            href="#top"
            onClick={(e) => handleNavClick(e, "top")}
            aria-label={`${BRAND_NAME} — home`}
          >
            <span className="landing-brand-mark" aria-hidden="true">
              ✦
            </span>
            <span className="landing-brand-name">{BRAND_NAME}</span>
          </a>

          <button
            type="button"
            className="landing-nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="toggle-bar" aria-hidden="true" />
            <span className="toggle-bar" aria-hidden="true" />
            <span className="toggle-bar" aria-hidden="true" />
          </button>

          <div
            id="landing-menu"
            className={`landing-nav-panel${menuOpen ? " is-open" : ""}`}
          >
            <nav aria-label="Primary">
              <ul className="landing-nav-links">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => handleNavClick(e, link.id)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="landing-nav-actions">
              <button
                type="button"
                className="nav-language"
                onClick={closeMenuThen(onChangeLanguage)}
                aria-label={`Change language. Current language: ${language || "English"}`}
              >
                <span aria-hidden="true">🌐</span> {language || "English"}
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeMenuThen(onLogin)}
              >
                Login
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={closeMenuThen(onRegister)}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* -------------------------------------------------------- */}
        {/* Hero                                                      */}
        {/* -------------------------------------------------------- */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">India&rsquo;s living traditions</p>

              <h1 id="hero-title">
                Where Every Craft <em>Tells a Story.</em>
              </h1>

              <p className="hero-lead">
                Discover India&rsquo;s living traditions through the hands,
                stories and creations of its artisans.
              </p>

              <div className="hero-actions">
                <a
                  className="btn btn-primary btn-large"
                  href="#crafts"
                  onClick={(e) => handleNavClick(e, "crafts")}
                >
                  Explore Crafts
                </a>

                <button
                  type="button"
                  className="btn btn-outline-light btn-large"
                  onClick={onRegister}
                >
                  Join as an Artisan
                </button>
              </div>

              <ul className="hero-facts" aria-label="Craft families">
                <li>Pottery</li>
                <li>Textiles</li>
                <li>Woodwork</li>
                <li>Metal craft</li>
              </ul>
            </div>

            <div className={stageClass}>
              <div className="hero-halo" aria-hidden="true" />

              <HeroPoster />

              {sceneState !== "failed" && (
                <Suspense fallback={null}>
                  <HeroScene
                    onReady={handleSceneReady}
                    onFail={handleSceneFail}
                  />
                </Suspense>
              )}

              <ul className="hero-tags" aria-label="Featured crafts in the scene">
                {HERO_TAGS.map((tag) => (
                  <li key={tag.label} className={tag.className}>
                    {tag.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Craft categories                                          */}
        {/* -------------------------------------------------------- */}
        <section
          id="crafts"
          className="section section-crafts"
          aria-labelledby="crafts-title"
          tabIndex={-1}
        >
          <div className="section-inner">
            <header className="section-head reveal">
              <p className="eyebrow eyebrow-dark">Explore crafts</p>
              <h2 id="crafts-title">Six families of Indian craft</h2>
              <p>
                From the potter&rsquo;s wheel to the weaver&rsquo;s loom,
                every tradition on ARTISAN AI is shaped by hand.
              </p>
            </header>

            <ul className="category-grid">
              {CATEGORIES.map(({ name, tone, Art, text }) => (
                <li key={name} className={`category-card tone-${tone} reveal`}>
                  <div className="category-visual">
                    <Art />
                  </div>
                  <h3>{name}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>

            <div className="section-cta reveal">
              <p>Create an account to browse the marketplace.</p>
              <div className="section-cta-actions">
                <button type="button" className="btn btn-primary" onClick={onRegister}>
                  Get Started
                </button>
                <button type="button" className="btn btn-outline-dark" onClick={onLogin}>
                  I already have an account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* How it works                                              */}
        {/* -------------------------------------------------------- */}
        <section
          id="how"
          className="section section-how"
          aria-labelledby="how-title"
          tabIndex={-1}
        >
          <div className="section-inner">
            <header className="section-head reveal">
              <p className="eyebrow eyebrow-dark">How it works</p>
              <h2 id="how-title">Simple, from first look to last stitch</h2>
            </header>

            <ol className="steps">
              {STEPS.map((step, index) => (
                <li key={step.title} className="step reveal">
                  <span className="step-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* For artisans                                              */}
        {/* -------------------------------------------------------- */}
        <section
          id="artisans"
          className="section section-artisans"
          aria-labelledby="artisans-title"
          tabIndex={-1}
        >
          <div className="section-inner artisan-layout">
            <div className="artisan-copy reveal">
              <p className="eyebrow">For artisans</p>
              <h2 id="artisans-title">Your craft deserves a wider audience</h2>
              <p>
                Showcase your work, tell its story and reach customers
                without needing technical skills. ARTISAN AI helps you turn
                a photo into a professional listing.
              </p>

              <div className="artisan-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-large"
                  onClick={onRegister}
                >
                  Join as an Artisan
                </button>
                <button
                  type="button"
                  className="btn btn-outline-light btn-large"
                  onClick={onLogin}
                >
                  Artisan Login
                </button>
              </div>
            </div>

            <ul className="artisan-features">
              {ARTISAN_FEATURES.map((feature) => (
                <li key={feature.title} className="reveal">
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* About                                                     */}
        {/* -------------------------------------------------------- */}
        <section
          id="about"
          className="section section-about"
          aria-labelledby="about-title"
          tabIndex={-1}
        >
          <div className="section-inner about-layout">
            <header className="section-head section-head-left reveal">
              <p className="eyebrow eyebrow-dark">About</p>
              <h2 id="about-title">Built to keep craft traditions alive</h2>
              <p>
                ARTISAN AI is a digital marketplace for Indian handicrafts.
                It pairs the patience of traditional makers with modern
                tools, so artisans can be discovered and customers can
                appreciate the story behind what they buy.
              </p>
            </header>

            <ul className="about-values">
              {ABOUT_VALUES.map((value) => (
                <li key={value.title} className="reveal">
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------- */}
      {/* Footer                                                      */}
      {/* ---------------------------------------------------------- */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="landing-brand-name">{BRAND_NAME}</span>
            <p>Where every craft tells a story.</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="footer-heading">Explore</h2>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => handleNavClick(e, link.id)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="footer-heading">Account</h2>
            <ul>
              <li>
                <button type="button" className="footer-link" onClick={onLogin}>
                  Login
                </button>
              </li>
              <li>
                <button type="button" className="footer-link" onClick={onRegister}>
                  Get Started
                </button>
              </li>
              <li>
                <button type="button" className="footer-link" onClick={onChangeLanguage}>
                  Change language
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">Contact</h2>
            <p className="footer-placeholder">
              Contact details will be added here.
            </p>
          </div>
        </div>

        <p className="footer-legal">
          &copy; {CURRENT_YEAR} {BRAND_NAME}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
