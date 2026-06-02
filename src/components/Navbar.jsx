import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, CircleUser } from "lucide-react";
import "./Navbar.css";
import TravelKartLogoMain from "./brand/TravelKartLogoMain";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      {/* Brand logo */}
      <Link to="/dashboard" className="navbar-logo">
        <TravelKartLogoMain className="navbar-logo-icon" color="#0f2d70" accentColor="#FF8F4F" />
        <span>TravelKart</span>
      </Link>

      {/* Middle Links */}
      <ul className="navbar-links">
        <li>
          <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
            Home
          </Link>
        </li>
        <li>
          <span className="navbar-link">Shop</span>
        </li>
        <li>
          <span className="navbar-link">Wishlist</span>
        </li>
        <li>
          <span className="navbar-link">Orders</span>
        </li>
      </ul>

      {/* Search Input */}
      <div className="navbar-search-container">
        <input
          type="text"
          placeholder="Search gear..."
          className="navbar-search-input"
        />
        <Search size={18} className="navbar-search-icon" />
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        <button type="button" className="navbar-action-btn" aria-label="Cart">
          <ShoppingCart size={22} />
        </button>
        <Link to="/profile" className="navbar-action-btn" aria-label="Profile">
          <CircleUser size={24} />
        </Link>
      </div>
    </nav>
  );
}
