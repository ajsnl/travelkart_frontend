import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, ShoppingCart, CircleUser, Menu, X, Home, Compass, Heart, Package, Wallet, User } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
    // Close mobile menu on route changes
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const trimmed = searchVal.trim();
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
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
    <>
      <nav className="navbar">
        <div className="navbar-left">
          {/* Mobile hamburger button */}
          <button 
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Brand logo */}
          <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
            <TravelKartLogoMain className="navbar-logo-icon" color="#0f2d70" accentColor="#FF8F4F" />
            <span>TravelKart</span>
          </Link>
        </div>

        {/* Middle Desktop Links */}
        <ul className="navbar-links">
          <li>
            <Link to="/" className={`navbar-link ${isActive("/") ? "active" : ""}`}>
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
            <Link 
              to={isAuthenticated ? "/orders" : "/login"} 
              state={isAuthenticated ? undefined : { from: "/orders" }}
              className={`navbar-link ${isActive("/orders") ? "active" : ""}`}
            >
              Orders
            </Link>
          </li>
        </ul>

        {/* Desktop Search Input */}
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
          {/* Mobile Search Toggle */}
          <button 
            className="navbar-action-btn mobile-search-btn"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Search"
          >
            <Search size={20} />
          </button>

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

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="navbar-mobile-search-bar">
          <div className="mobile-search-inner">
            <input
              type="text"
              placeholder="Search gear, backpacks, tents..."
              className="mobile-search-input"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={handleSearchSubmit}
              autoFocus
            />
            <button className="mobile-search-submit-btn" onClick={handleSearchSubmit}>
              <Search size={18} />
            </button>
            <button className="mobile-search-close-btn" onClick={() => setMobileSearchOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      <div 
        className={`navbar-drawer-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Content */}
      <aside className={`navbar-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <TravelKartLogoMain className="navbar-logo-icon" color="#0f2d70" accentColor="#FF8F4F" />
            <span>TravelKart</span>
          </div>
          <button 
            className="drawer-close-btn" 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* User Card if Authenticated */}
        {isAuthenticated ? (
          <Link to="/profile" className="drawer-user-card" onClick={() => setMobileMenuOpen(false)}>
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="Profile" className="drawer-user-avatar" />
            ) : (
              <div className="drawer-user-avatar-placeholder">
                <User size={20} />
              </div>
            )}
            <div className="drawer-user-info">
              <span className="drawer-user-name">{user?.first_name ? `${user.first_name} ${user.last_name || ""}` : (user?.username || "My Account")}</span>
              <span className="drawer-user-email">{user?.email || "View Profile"}</span>
            </div>
          </Link>
        ) : (
          <div className="drawer-auth-actions">
            <Link to="/login" className="drawer-btn-login" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Link>
            <Link to="/signup" className="drawer-btn-signup" onClick={() => setMobileMenuOpen(false)}>
              Create Account
            </Link>
          </div>
        )}

        {/* Drawer Links */}
        <ul className="drawer-nav-list">
          <li>
            <Link 
              to="/" 
              className={`drawer-nav-item ${isActive("/") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/categories" 
              className={`drawer-nav-item ${isActive("/categories") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Compass size={20} />
              <span>Shop All Products</span>
            </Link>
          </li>
          <li>
            <Link 
              to={isAuthenticated ? "/wishlist" : "/login"} 
              state={isAuthenticated ? undefined : { from: "/wishlist" }}
              className={`drawer-nav-item ${isActive("/wishlist") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart size={20} />
              <span>My Wishlist</span>
            </Link>
          </li>
          <li>
            <Link 
              to={isAuthenticated ? "/orders" : "/login"} 
              state={isAuthenticated ? undefined : { from: "/orders" }}
              className={`drawer-nav-item ${isActive("/orders") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package size={20} />
              <span>My Orders</span>
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link 
                  to="/wallet-history" 
                  className={`drawer-nav-item ${isActive("/wallet-history") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Wallet size={20} />
                  <span>Wallet & History</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className={`drawer-nav-item ${isActive("/profile") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  <span>Profile Settings</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="drawer-footer">
          <p className="drawer-copyright">© {new Date().getFullYear()} TravelKart Inc.</p>
        </div>
      </aside>
    </>
  );
}
