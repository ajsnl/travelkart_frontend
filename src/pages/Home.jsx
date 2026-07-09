import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  Compass, 
  ArrowRight,
  Headphones,
  BatteryCharging,
  Layers,
  Briefcase
} from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import "./Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchProducts } from "../services/productService";
import { userFetchActiveBanners } from "../services/bannerService";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [travellingWith, setTravellingWith] = useState("Family");
  const [duration, setDuration] = useState("2+ Weeks");

  // Dynamic recommendations for AI Concierge mockup preview
  const recommendations = {
    "Solo": {
      "2 Days": {
        query: "backpack",
        iconLeft: <Briefcase size={22} />,
        iconRight: <BatteryCharging size={22} />
      },
      "1 Week": {
        query: "duffle",
        iconLeft: <Briefcase size={22} />,
        iconRight: <Headphones size={22} />
      },
      "2+ Weeks": {
        query: "luggage",
        iconLeft: <Layers size={22} />,
        iconRight: <Headphones size={22} />
      }
    },
    "Family": {
      "2 Days": {
        query: "bag",
        iconLeft: <Briefcase size={22} />,
        iconRight: <BatteryCharging size={22} />
      },
      "1 Week": {
        query: "set",
        iconLeft: <Layers size={22} />,
        iconRight: <Briefcase size={22} />
      },
      "2+ Weeks": {
        query: "luggage",
        iconLeft: <Layers size={22} />,
        iconRight: <Layers size={22} />
      }
    }
  };

  const selectedRec = recommendations[travellingWith]?.[duration] || recommendations["Family"]["2+ Weeks"];

  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingArrivals, setLoadingArrivals] = useState(true);
  const [heroBanners, setHeroBanners] = useState([]);
  const [bottomBanners, setBottomBanners] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [currentBottomIndex, setCurrentBottomIndex] = useState(0);

  useEffect(() => {
    const getNewArrivals = async () => {
      try {
        const res = await fetchProducts({ page_size: 4 });
        setNewArrivals(res.data.results || []);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
      } finally {
        setLoadingArrivals(false);
      }
    };
    
    const loadBanners = async () => {
      try {
        const heroRes = await userFetchActiveBanners({ position: "hero" });
        setHeroBanners(heroRes.data || []);
        
        const bottomRes = await userFetchActiveBanners({ position: "bottom" });
        setBottomBanners(bottomRes.data || []);
      } catch (err) {
        console.error("Error fetching banners for homepage:", err);
      }
    };

    getNewArrivals();
    loadBanners();
  }, []);

  // Auto-slide for Hero carousel
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners]);

  // Auto-slide for Bottom promo carousel
  useEffect(() => {
    if (bottomBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBottomIndex((prev) => (prev + 1) % bottomBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [bottomBanners]);

  return (
    <div className="home-viewport">
      
      {/* HEADER GLOBAL UTILITY NAVBAR */}
      <Navbar/>

      {/* HERO SECTION SHOWCASE */}
      <section className="home-hero-section">
        <div className="hero-left-details">
          <span className="hero-tagline-pill font-inter">Elevate Your Exploration</span>
          <h1 className="hero-main-title font-plus-jakarta">Your Journey, Curated.</h1>
          <p className="hero-subtitle-description">
            Experience the art of effortless modern travel with TravelKart. 
            Engineered durability built directly into premium travel gear, hardshell luggage, and packing organization essentials.
          </p>
          <div className="hero-button-group font-inter">
            <button className="btn-primary-action" onClick={() => window.location.href = "/shop"}>Shop New Gear</button>
            {/* <button 
              className="btn-secondary-action" 
              onClick={() => {
                const element = document.getElementById("ai-packing-assistant");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              AI Gear Builder
            </button> */}
          </div>
        </div>

        <div className="hero-right-showcase-frame">
          {heroBanners.length > 0 ? (
            <div className="hero-carousel-container">
              {heroBanners.map((banner, index) => (
                <div 
                  key={banner.id}
                  className={`carousel-slide ${index === currentHeroIndex ? "active" : ""}`}
                >
                  <div 
                    className="hero-image-display-box" 
                    style={{ backgroundImage: `url(${banner.image})`, cursor: banner.redirect_url ? "pointer" : "default" }}
                    onClick={() => banner.redirect_url && (window.location.href = banner.redirect_url)}
                  >
                    <div className="hero-carousel-overlay font-inter">
                      <h3 className="hero-carousel-title font-plus-jakarta">{banner.title}</h3>
                      {banner.subtitle && <p className="hero-carousel-subtitle">{banner.subtitle}</p>}
                      {banner.redirect_url && (
                        <span className="hero-carousel-cta">Shop Offer →</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {heroBanners.length > 1 && (
                <div className="carousel-dots">
                  {heroBanners.map((_, index) => (
                    <span 
                      key={index} 
                      className={`carousel-dot ${index === currentHeroIndex ? "active" : ""}`}
                      onClick={() => setCurrentHeroIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div 
              className="hero-image-display-box" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581553674786-636feb0b53c6?w=800&auto=format&fit=crop&q=80')" }}
            />
          )}
        </div>
      </section>

      {/* MARKETING SLIDER SEASONAL CAMPAIGN CARD */}
      <section className="home-marketing-banner-container">
        {bottomBanners.length > 0 ? (
          <div className="marketing-carousel-container" style={{ position: "relative", width: "100%", height: "320px" }}>
            {bottomBanners.map((banner, index) => (
              <div 
                key={banner.id}
                className={`carousel-slide ${index === currentBottomIndex ? "active" : ""}`}
              >
                <div 
                  className="marketing-banner-card"
                  style={{ 
                    backgroundImage: `url(${banner.image})`,
                    cursor: banner.redirect_url ? "pointer" : "default"
                  }}
                  onClick={() => banner.redirect_url && (window.location.href = banner.redirect_url)}
                >
                  <div className="marketing-card-content font-inter">
                    <span className="marketing-tag-pill">Exclusive Offer</span>
                    <h2 className="marketing-card-title font-plus-jakarta">{banner.title}</h2>
                    {banner.subtitle && <p className="marketing-card-subtext">{banner.subtitle}</p>}
                    {banner.redirect_url && (
                      <button 
                        className="btn-marketing-cta" 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = banner.redirect_url;
                        }}
                      >
                        Discover Offer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {bottomBanners.length > 1 && (
              <div className="carousel-dots" style={{ bottom: "16px" }}>
                {bottomBanners.map((_, index) => (
                  <span 
                    key={index} 
                    className={`carousel-dot ${index === currentBottomIndex ? "active" : ""}`}
                    style={{ backgroundColor: index === currentBottomIndex ? "#3B82F6" : "rgba(255, 255, 255, 0.4)" }}
                    onClick={() => setCurrentBottomIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div 
            className="marketing-banner-card"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?w=1200&auto=format&fit=crop&q=80')" }}
          >
            <div className="marketing-card-content font-inter">
              <span className="marketing-tag-pill">Limited Access Offers</span>
              <h2 className="marketing-card-title font-plus-jakarta">Winter Wanderlust: Up to 30% Off Elite Gear</h2>
              <p className="marketing-card-subtext">Equip your upcoming seasonal adventure with signature heavy-duty travel gear and essentials.</p>
              <button className="btn-marketing-cta" onClick={() => window.location.href = "/shop?promo=winter"}>Discover Warehouse</button>
            </div>
          </div>
        )}
      </section>

      {/* CURATED MOSAIC GRID SECTORS */}
      <section className="home-section-container">
        <div className="section-headline-row">
          <h3 className="section-main-title font-plus-jakarta">Curated Categories</h3>
          <Link to="/shop" className="section-view-all-link">View All Categories →</Link>
        </div>

        <div className="categories-mosaic-grid font-inter">
          <Link 
            to="/shop?cat=bags" 
            className="mosaic-node-card large"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80')" }}
          >
            <div className="mosaic-card-content">
              <h4 className="mosaic-card-title">Bags</h4>
              <span className="mosaic-card-item-count">Exploration backpacks & cases</span>
            </div>
          </Link>

          <Link 
            to="/shop?cat=luggage" 
            className="mosaic-node-card"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&auto=format&fit=crop&q=80')" }}
          >
            <div className="mosaic-card-content">
              <h4 className="mosaic-card-title">Luggage</h4>
              <span className="mosaic-card-item-count">Premium hardshell systems</span>
            </div>
          </Link>

          <Link 
            to="/shop?cat=accessories" 
            className="mosaic-node-card"
            s        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80')" }}
          >
            <div className="mosaic-card-content">
              <h4 className="mosaic-card-title">Accessories</h4>
              <span className="mosaic-card-item-count">RFID pouches & packing essentials</span>
            </div>
          </Link>
        </div>
      </section>

      {/* INTELLIGENT AI PACKING PLATFORM MODULE */}
      {/* <section id="ai-packing-assistant" className="home-section-container">
        <div className="ai-concierge-platform-card">
          <div className="ai-platform-left-controls font-inter">
            <h3 className="ai-platform-title font-plus-jakarta">AI Concierge:<br />Define Your Path.</h3>
            
            <div className="ai-interactive-selectors-stack">
              <div className="ai-field-wrapper">
                <span className="ai-selector-label">Who are you travelling with?</span>
                <div className="ai-selector-btn-row">
                  <button className={`btn-ai-choice ${travellingWith === "Solo" ? "active" : ""}`} onClick={() => setTravellingWith("Solo")}>Solo</button>
                  <button className={`btn-ai-choice ${travellingWith === "Family" ? "active" : ""}`} onClick={() => setTravellingWith("Family")}>Family</button>
                </div>
              </div>

              <div className="ai-field-wrapper">
                <span className="ai-selector-label">Duration of escape?</span>
                <div className="ai-selector-btn-row">
                  <button className={`btn-ai-choice ${duration === "2 Days" ? "active" : ""}`} onClick={() => setDuration("2 Days")}>2 Days</button>
                  <button className={`btn-ai-choice ${duration === "1 Week" ? "active" : ""}`} onClick={() => setDuration("1 Week")}>1 Week</button>
                  <button className={`btn-ai-choice ${duration === "2+ Weeks" ? "active" : ""}`} onClick={() => setDuration("2+ Weeks")}>2+ Weeks</button>
                </div>
              </div>
            </div>

            <button className="btn-ai-trigger-generate font-inter" onClick={() => window.location.href = `/shop?search=${selectedRec.query}`}>
              <span>Generate My Kit</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="ai-platform-right-mockup">
            <div className="mockup-header-node">
              <div className="mockup-avatar-circle" />
              <div className="mockup-line-skeleton-header" />
            </div>
            <div className="mockup-line-skeleton first-line" />
            <div className="mockup-line-skeleton second-line" />
            <div className="mockup-line-skeleton third-line" />
            <div className="mockup-box-grid">
              <div className="mockup-data-item-box">
                {selectedRec.iconLeft}
              </div>
              <div className="mockup-data-item-box">
                {selectedRec.iconRight}
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* MERCHANDISE SHOWCASE NEW ARRIVALS GRID */}
      <section className="home-section-container">
        <div className="section-centered-header-group">
          <h3 className="section-centered-title font-plus-jakarta">New Arrivals</h3>
          <p className="section-centered-subheading font-inter">Tailored technical storage options developed specifically for modern cross-border logistics mapping.</p>
        </div>

        <div className="products-showcase-grid font-inter">
          {loadingArrivals ? (
            [1, 2, 3, 4].map((n) => (
              <div key={n} className="unified-product-card skeleton-card" style={{ height: '100%', boxSizing: 'border-box' }}>
                <div className="product-card-image-wrapper">
                  <div style={{ position: 'absolute', inset: '8%', backgroundColor: '#e2e8f0', borderRadius: '8px' }} />
                </div>
                <div className="product-card-info-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <div className="skeleton-line" style={{ width: "30%", height: "12px", backgroundColor: "#e2e8f0", borderRadius: "4px" }} />
                  <div className="skeleton-line" style={{ width: "80%", height: "16px", backgroundColor: "#e2e8f0", borderRadius: "4px" }} />
                  <div className="skeleton-line" style={{ width: "50%", height: "14px", backgroundColor: "#e2e8f0", borderRadius: "4px" }} />
                </div>
              </div>
            ))
          ) : newArrivals.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8" style={{ gridColumn: '1 / -1', padding: '40px 0', color: '#757682' }}>
              No new arrivals available.
            </div>
          ) : (
            newArrivals.map((prod) => (
              <ProductCard product={prod} key={prod.id} />
            ))
          )}
        </div>

        <div className="explore-more-container">
          <Link to="/categories?sort=newest" className="btn-explore-more font-inter">
            Explore More New Arrivals →
          </Link>
        </div>
      </section>

      {/* CLOSING ENGAGEMENT ROW CTA BANNER */}
      <section className="home-section-container">
        <div 
          className="engagement-closing-banner-card"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1200&auto=format&fit=crop&q=80')" }}
        >
          <div className="engagement-card-content font-inter">
            <span className="engagement-tag-pill">TravelKart Gold Membership</span>
            <h2 className="engagement-card-title font-plus-jakarta">Go Gold.<br />Travel Without Limits.</h2>
            <p className="engagement-card-description">Upgrade to Gold Membership today to unlock elite benefits: absolutely free delivery charges on all orders, guaranteed 2-day delivery, and early access to premium travel collections.</p>
            <button className="btn-engagement-action" onClick={() => window.location.href = "/signup"}>Upgrade to Gold</button>
          </div>
        </div>
      </section>

      {/* CORPORATE FOOTER PANEL */}
      <Footer />

    </div>
  );
}

export default Home;
