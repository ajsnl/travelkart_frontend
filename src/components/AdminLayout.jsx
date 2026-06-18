import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Bell, Search, Users, FolderTree, Box } from "lucide-react";
import { logoutUser } from "../services/authService";
import TravelKartLogoMain from "./brand/TravelKartLogoMain";
import "./AdminLayout.css";
import { useCustomDialog } from "./CustomDialog";

const AdminLayout = () => {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { showConfirm } = useCustomDialog();

  const handleLogout = async () => {
    const confirmed = await showConfirm("Are you sure you want to log out?", "Logout", "warning");
    if (confirmed) {
      logoutUser(navigate);
    }
  };

  const getPlaceholder = () => {
    if (location.pathname.includes("categories")) {
      return "Search categories by name...";
    }
    if (location.pathname.includes("products")) {
      return "Search products by name, brand, or SKU...";
    }
    return "Search elite members or logistics IDs...";
  };

  return (
    <div className="admin-viewport font-inter select-none antialiased">
      {/* ELITE GLOBAL TOP NAVIGATION BAR CONTAINER */}
      <header className="admin-global-navbar">
        <div className="navbar-left-brand-wrapper">
          <div className="brand-logo-frame">
            <TravelKartLogoMain className="w-8 h-8" color="#3B82F6" accentColor="#FF8F4F" />
          </div>
          <div className="global-search-container">
            <Search className="search-icon-inside" size={16} />
            <input 
              type="text"
              placeholder={getPlaceholder()}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="navbar-search-input"
            />
          </div>
        </div>

        <div className="navbar-right-utilities">
          <button className="navbar-notification-trigger" aria-label="Notifications system">
            <Bell size={18} />
          </button>
          <button 
            onClick={handleLogout}
            className="navbar-logout-btn"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* CORE BODY WRAPPER FOR SIDEBAR + MAIN CONTENT */}
      <div className="admin-body-wrapper">
        <aside className="admin-sidebar">
          <nav className="admin-sidebar-nav">
            <Link 
              to="/admin" 
              className={`sidebar-nav-item ${location.pathname === "/admin" ? "active" : ""}`}
            >
              <Users size={18} />
              <span>Users</span>
            </Link>
            <Link 
              to="/admin/categories" 
              className={`sidebar-nav-item ${location.pathname.includes("categories") ? "active" : ""}`}
            >
              <FolderTree size={18} />
              <span>Categories</span>
            </Link>
            <Link 
              to="/admin/products" 
              className={`sidebar-nav-item ${location.pathname.includes("products") ? "active" : ""}`}
            >
              <Box size={18} />
              <span>Products</span>
            </Link>
          </nav>
        </aside>

        <main className="admin-workspace-content">
          <Outlet context={{ search, setSearch }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
