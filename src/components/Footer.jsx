import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="home-corporate-footer font-inter">
      <div className="footer-top-links-grid">
        <div className="footer-brand-column">
          <span className="footer-brand-logo-text font-plus-jakarta">TravelKart</span>
          <p className="footer-brand-tagline">
            Engineered luxury utility travel items built for smooth global exploration routing matrices.
          </p>
          <div className="footer-socials-row">
            <a href="#" className="footer-social-icon-anchor" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a href="#" className="footer-social-icon-anchor" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="#" className="footer-social-icon-anchor" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links-column">
          <span className="footer-column-heading">Shop</span>
          <Link to="/categories?cat=bags" className="footer-anchor-link">All Backpacks</Link>
          <Link to="/categories?cat=luggage" className="footer-anchor-link">Hardshell Luggage</Link>
          <Link to="/categories?cat=accessories" className="footer-anchor-link">Accessories Kit</Link>
        </div>

        <div className="footer-links-column">
          <span className="footer-column-heading">Support</span>
          <Link to="/help" className="footer-anchor-link">Help Center</Link>
          <Link to="/orders" className="footer-anchor-link">Track Orders</Link>
          <Link to="/returns" className="footer-anchor-link">Returns Policy</Link>
        </div>

        <div className="footer-links-column">
          <span className="footer-column-heading">Company</span>
          <Link to="/about" className="footer-anchor-link">Our Narrative</Link>
          <Link to="/privacy" className="footer-anchor-link">Privacy Parameters</Link>
          <Link to="/terms" className="footer-anchor-link">Terms of Service</Link>
        </div>
      </div>

      <div className="footer-bottom-copyright-strip">
        <span>© 2026 TravelKart. All Rights Reserved. Created to elevate global paths.</span>
      </div>
    </footer>
  );
}
