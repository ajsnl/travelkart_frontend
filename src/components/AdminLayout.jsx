import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Bell, Search, Users, FolderTree, Box, ShoppingBag, Ticket, Image } from "lucide-react";
import { logoutUser } from "../services/authService";
import TravelKartLogoMain from "./brand/TravelKartLogoMain";
import "./AdminLayout.css";
import { useCustomDialog } from "./CustomDialog";
import { fetchNotifications, markNotificationsAsRead } from "../services/adminService";

const AdminLayout = () => {
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showConfirm } = useCustomDialog();

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const confirmed = await showConfirm("Are you sure you want to log out?", "Logout", "warning");
    if (confirmed) {
      logoutUser(navigate);
    }
  };

  const handleNotificationClick = (notif) => {
    setShowNotifications(false);
    if (notif.tracking_id) {
      setSearch(notif.tracking_id);
      navigate("/admin/orders");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsAsRead();
      setNotifications([]);
      setShowNotifications(false);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const getPlaceholder = () => {
    if (location.pathname.includes("categories")) {
      return "Search categories by name...";
    }
    if (location.pathname.includes("products")) {
      return "Search products by name, brand, or SKU...";
    }
    if (location.pathname.includes("orders")) {
      return "Search orders by tracking ID, email, name, or city...";
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

        <div className="navbar-right-utilities" style={{ position: "relative" }}>
          <button 
            className="navbar-notification-trigger" 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications system"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="notification-count-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-popup-dropdown">
              <div className="notifications-dropdown-header">
                <h4>Notifications</h4>
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications-placeholder">
                    No new return requests.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className="notification-item"
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <span className="notification-item-message">{notif.message}</span>
                      <span className="notification-item-time">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="notifications-dropdown-footer">
                  <button onClick={handleMarkAllRead} className="btn-mark-all-read">
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}

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
            <Link 
              to="/admin/orders" 
              className={`sidebar-nav-item ${location.pathname.includes("orders") ? "active" : ""}`}
            >
              <ShoppingBag size={18} />
              <span>Orders</span>
            </Link>
              <Link 
              to="/admin/coupons" 
              className={`sidebar-nav-item ${location.pathname.includes("coupons") ? "active" : ""}`}
            >
              <Ticket size={18} />
              <span>Coupons</span>
            </Link>
            <Link 
              to="/admin/banners" 
              className={`sidebar-nav-item ${location.pathname.includes("banners") ? "active" : ""}`}
            >
              <Image size={18} />
              <span>Banners</span>
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
