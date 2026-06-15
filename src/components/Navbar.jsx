import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, ShoppingCart, CircleUser } from "lucide-react";
import "./Navbar.css";
import TravelKartLogoMain from "./brand/TravelKartLogoMain";
import { getCart } from "../features/cart/cartSlice";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [dispatch, isAuthenticated]);

  // Sync searchVal with URL search query param if on categories page
  useEffect(() => {
    if (location.pathname === "/categories") {
      const searchParam = new URLSearchParams(location.search).get("search") || "";
      setSearchVal(searchParam);
    } else {
      setSearchVal("");
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const trimmed = searchVal.trim();
      if (trimmed) {
        navigate(`/categories?search=${encodeURIComponent(trimmed)}`);
      } else {
        navigate(`/categories`);
      }
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const cartCount = cart?.total_items || 0;

  return (
    <nav className="navbar">
      {/* Brand logo */}
      <Link to="/" className="navbar-logo">
        <TravelKartLogoMain className="navbar-logo-icon" color="#0f2d70" accentColor="#FF8F4F" />
        <span>TravelKart</span>
      </Link>

      {/* Middle Links */}
      <ul className="navbar-links">
        <li>
          <Link to="/" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/categories" className={`navbar-link ${isActive("/categories") ? "active" : ""}`}>
            Shop
          </Link>
        </li>
        <li>
          <Link 
            to={isAuthenticated ? "/wishlist" : "/login"} 
            state={isAuthenticated ? undefined : { from: "/wishlist" }}
            className={`navbar-link ${isActive("/wishlist") ? "active" : ""}`}
          >
            Wishlist
          </Link>
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
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={handleSearchSubmit}
        />
        <Search 
          size={18} 
          className="navbar-search-icon" 
          onClick={handleSearchSubmit}
          style={{ cursor: "pointer" }}
        />
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        <Link 
          to={isAuthenticated ? "/cart" : "/login"} 
          state={isAuthenticated ? undefined : { from: "/cart" }}
          className="navbar-action-btn navbar-cart-btn-wrapper" 
          aria-label="Cart"
        >
          <ShoppingCart size={22} />
          {isAuthenticated && cartCount > 0 && (
            <span className="navbar-cart-badge">{cartCount}</span>
          )}
        </Link>
        {isAuthenticated ? (
          <Link to="/profile" className="navbar-action-btn profile-avatar-btn" aria-label="Profile">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="Profile" className="navbar-profile-avatar" />
            ) : (
              <CircleUser size={24} />
            )}
          </Link>
        ) : (
          <Link to="/login" className="navbar-login-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
