import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  Compass, 
  ArrowRight
} from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import "./Home.css";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiTripType, setAiTripType] = useState("Vibe");
  const [aiDuration, setAiDuration] = useState("Weekend");

  // Local simulated metadata mapping new product entities cleanly
  const arrivalsData = [
    {
      id: "prod-1",
      name: "The Vanguard Carry-On",
      brand: "Nomad",
      category_name: "Luggage",
      avg_rating: 4.8,
      total_ratings_count: 34,
      short_description: "Impeccable aircraft-grade shell mobility design architecture.",
      variants: [
        { is_active: true, price: 14499, original_price: 14499, offer_price: null }
      ],
      images: [
        { is_primary: true, image_url: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=500&auto=format&fit=crop&q=60" }
      ],
      offer_type: "none",
      offer_value: 0,
      is_best_seller: false
    },
    {
      id: "prod-2",
      name: "Heritage Weekender",
      brand: "Heritage",
      category_name: "Bags",
      avg_rating: 4.9,
      total_ratings_count: 56,
      short_description: "Full-grain vegetable-tanned classic leather travel bag.",
      variants: [
        { is_active: true, price: 12000, original_price: 12000, offer_price: 8999 }
      ],
      images: [
        { is_primary: true, image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60" }
      ],
      offer_type: "flat",
      offer_value: 3001,
      is_best_seller: true
    },
    {
      id: "prod-3",
      name: "Daily Commuter Pack",
      brand: "Apex",
      category_name: "Bags",
      avg_rating: 4.5,
      total_ratings_count: 12,
      short_description: "Waterproof minimalist configuration with a direct 16-inch laptop chamber.",
      variants: [
        { is_active: true, price: 6999, original_price: 6999, offer_price: 5249 }
      ],
      images: [
        { is_primary: true, image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60" }
      ],
      offer_type: "percentage",
      offer_value: 25,
      is_best_seller: false
    },
    {
      id: "prod-4",
      name: "Voyage Passport Kit",
      brand: "Secure",
      category_name: "Accessories",
      avg_rating: 4.2,
      total_ratings_count: 8,
      short_description: "RFID protected tracking document wallet accent safe.",
      variants: [
        { is_active: true, price: 2199, original_price: 2199, offer_price: null }
      ],
      images: [
        { is_primary: true, image_url: "https://images.unsplash.com/photo-1627163430580-0a724cc6aa51?w=500&auto=format&fit=crop&q=60" }
      ],
      offer_type: "none",
      offer_value: 0,
      is_best_seller: false
    }
  ];

  return (
    <div className="home-viewport">
      
      {/* HEADER GLOBAL UTILITY NAVBAR */}
      <nav className="home-navbar">
        <Link to="/" className="nav-brand font-plus-jakarta">TravelKart</Link>
        
        <div className="nav-links">
          <Link to="/shop" className="nav-item">Bags</Link>
          <Link to="/shop?cat=luggage" className="nav-item">Luggage</Link>
          <Link to="/concierge" className="nav-item">AI Guide</Link>
          <Link to="/about" className="nav-item">Orders</Link>
        </div>

        <div className="nav-right-actions">
          <div className="nav-search-bar">
            <Search className="nav-search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Search merchandise..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
          </div>
          <button className="nav-icon-btn" aria-label="Wishlist Panel"><Heart size={20} /></button>
          <button className="nav-icon-btn" aria-label="Cart View"><ShoppingBag size={20} /></button>
          <Link to="/login" className="nav-icon-btn" aria-label="User Profile Page"><User size={20} /></Link>
        </div>
      </nav>

      {/* HERO SECTION SHOWCASE */}
      <section className="home-hero-section">
        <div className="hero-left-details">
          <span className="hero-tagline-pill font-inter">Elevate Your Exploration</span>
          <h1 className="hero-main-title font-plus-jakarta">Your Journey, Curated.</h1>
          <p className="hero-subtitle-description">
            Experience the art of effortless modern exploration with TravelKart. 
            Engineered durability engineered directly into premium digital concierge logistics travel goods.
          </p>
          <div className="hero-button-group font-inter">
            <button className="btn-primary-action" onClick={() => window.location.href = "/shop"}>Shop New Gear</button>
            <button className="btn-secondary-action" onClick={() => window.location.href = "/concierge"}>Access AI Guide</button>
          </div>
        </div>

        <div className="hero-right-showcase-frame">
          <div 
            className="hero-image-display-box" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581553674786-636feb0b53c6?w=800&auto=format&fit=crop&q=80')" }}
          />
        </div>
      </section>

      {/* MARKETING SLIDER SEASONAL CAMPAIGN CARD */}
      <section className="home-marketing-banner-container">
        <div 
          className="marketing-banner-card"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?w=1200&auto=format&fit=crop&q=80')" }}
        >
          <div className="marketing-card-content font-inter">
            <span className="marketing-tag-pill">Limited Access Offers</span>
            <h2 className="marketing-card-title font-plus-jakarta">Winter Wanderlust: Up to 30% Off Elite Gear</h2>
            <p className="marketing-card-subtext">Equip your upcoming seasonal flight with signature heavy duty travel architecture.</p>
            <button className="btn-marketing-cta" onClick={() => window.location.href = "/shop?promo=winter"}>Discover Warehouse</button>
          </div>
        </div>
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
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1627122185207-e874b61408cc?w=600&auto=format&fit=crop&q=80')" }}
          >
            <div className="mosaic-card-content">
              <h4 className="mosaic-card-title">Accessories</h4>
              <span className="mosaic-card-item-count">RFID pouches & packing essentials</span>
            </div>
          </Link>
        </div>
      </section>

      {/* INTELLIGENT AI CONCIERGE PLATFORM MODULE */}
      <section className="home-section-container">
        <div className="ai-concierge-platform-card">
          <div className="ai-platform-left-controls font-inter">
            <h3 className="ai-platform-title font-plus-jakarta">AI Concierge:<br />Define Your Path.</h3>
            <p className="ai-platform-subtext">Select your target criteria vectors and watch our intelligent travel router craft custom itineraries perfectly matched to your lifestyle equipment setup.</p>
            
            <div className="ai-interactive-selectors-stack">
              <div className="ai-field-wrapper">
                <span className="ai-selector-label">Destination Accent</span>
                <div className="ai-selector-btn-row">
                  <button className={`btn-ai-choice ${aiTripType === "Vibe" ? "active" : ""}`} onClick={() => setAiTripType("Vibe")}>Alpine</button>
                  <button className={`btn-ai-choice ${aiTripType === "Coastal" ? "active" : ""}`} onClick={() => setAiTripType("Coastal")}>Coastal</button>
                </div>
              </div>

              <div className="ai-field-wrapper">
                <span className="ai-selector-label">Duration Scope</span>
                <div className="ai-selector-btn-row">
                  <button className={`btn-ai-choice ${aiDuration === "Weekend" ? "active" : ""}`} onClick={() => setAiDuration("Weekend")}>Weekend</button>
                  <button className={`btn-ai-choice ${aiDuration === "Extended" ? "active" : ""}`} onClick={() => setAiDuration("Extended")}>Extended</button>
                </div>
              </div>
            </div>

            <button className="btn-ai-trigger-generate font-inter" onClick={() => window.location.href = `/concierge?type=${aiTripType}&span=${aiDuration}`}>
              <span>Generate My Route</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="ai-platform-right-mockup">
            <div className="mockup-header-node">
              <div className="mockup-avatar-circle" />
              <div className="mockup-line-skeleton" style={{ width: '120px' }} />
            </div>
            <div className="mockup-line-skeleton" style={{ width: '100%' }} />
            <div className="mockup-line-skeleton" style={{ width: '80%' }} />
            <div className="mockup-box-grid">
              <div className="mockup-data-item-box"><Compass size={24} /></div>
              <div className="mockup-data-item-box" style={{ fontSize: '12px', fontWeight: 600 }}>Route Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* MERCHANDISE SHOWCASE NEW ARRIVALS GRID */}
      <section className="home-section-container">
        <div className="section-centered-header-group">
          <h3 className="section-centered-title font-plus-jakarta">New Arrivals</h3>
          <p className="section-centered-subheading font-inter">Tailored technical storage options developed specifically for modern cross-border logistics mapping.</p>
        </div>

        <div className="products-showcase-grid font-inter">
          {arrivalsData.map((prod) => (
            <ProductCard product={prod} key={prod.id} />
          ))}
        </div>
      </section>

      {/* CLOSING ENGAGEMENT ROW CTA BANNER */}
      <section className="home-section-container">
        <div 
          className="engagement-closing-banner-card"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1200&auto=format&fit=crop&q=80')" }}
        >
          <div className="engagement-card-content font-inter">
            <span className="engagement-tag-pill">TravelKart Privilege</span>
            <h2 className="engagement-card-title font-plus-jakarta">Travel Lighter.<br />Go Further.</h2>
            <p className="engagement-card-description">Unlock priority flight support options, special tier discounts, and instant access to our interactive tracking interface.</p>
            <button className="btn-engagement-action" onClick={() => window.location.href = "/register"}>Join Now</button>
          </div>
        </div>
      </section>

      {/* CORPORATE FOOTER PANEL */}
      <footer className="home-corporate-footer">
        <div className="footer-top-links-grid font-inter">
          <div className="footer-brand-column">
            <span className="footer-brand-logo-text font-plus-jakarta">TravelKart</span>
            <p className="footer-brand-tagline">Engineered luxury utility travel items built for smooth global exploration routing matrices.</p>
            <div className="footer-socials-row">
              <a href="#" className="footer-social-icon-anchor" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="footer-social-icon-anchor" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="footer-social-icon-anchor" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-column">
            <span className="footer-column-heading">Shop</span>
            <a href="/shop?cat=bags" className="footer-anchor-link">All Backpacks</a>
            <a href="/shop?cat=luggage" className="footer-anchor-link">Hardshell Luggage</a>
            <a href="/shop?cat=acc" className="footer-anchor-link">Accessories Kit</a>
          </div>

          <div className="footer-links-column">
            <span className="footer-column-heading">Support</span>
            <a href="/help" className="footer-anchor-link">Help Center</a>
            <a href="/shipping" className="footer-anchor-link">Track Orders</a>
            <a href="/returns" className="footer-anchor-link">Returns Policy</a>
          </div>

          <div className="footer-links-column">
            <span className="footer-column-heading">Company</span>
            <a href="/about" className="footer-anchor-link">Our Narrative</a>
            <a href="/privacy" className="footer-anchor-link">Privacy Parameters</a>
            <a href="/terms" className="footer-anchor-link">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom-copyright-strip font-inter">
          <span>© 2026 TravelKart. All Rights Reserved. Created to elevate global paths.</span>
        </div>
      </footer>

    </div>
  );
}

export default Home;
