import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  Crown, 
  Settings, 
  LogOut, 
  AlertCircle,
  Lock
} from "lucide-react";
import { 
  getProfile, 
  updateProfile, 
  sendEmailOTP, 
  verifyEmailOTP,
  logoutUser,
  changePassword
} from "../services/authService";

import UserInfoCard from "../components/profile/UserInfoCard";
import AddressList from "../components/profile/AddressList";
import WalletCard from "../components/profile/WalletCard";
import MembershipCard from "../components/profile/MembershipCard";
import ProfileEditForm from "../components/profile/ProfileEditForm";
import OTPVerificationModal from "../components/profile/OTPVerificationModal";
import ChangePasswordModal from "../components/profile/ChangePasswordModal";

import "../components/profile/Profile.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      setUser(res.data);
    } catch (err) {
      console.error("Error loading user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleUpdateProfile = async (formData) => {
    await updateProfile(formData);
    await fetchUser();
    setShowEditModal(false);
  };

  const handleStartVerification = async () => {
    try {
      await sendEmailOTP();
      setShowVerifyModal(true);
    } catch (err) {
      console.error("Error initiating email verification:", err);
      alert(err.response?.data?.error || "Failed to send verification OTP.");
    }
  };

  const handleVerifyOTP = async (otp) => {
    await verifyEmailOTP(otp);
    alert("Email verified successfully! 🎉");
    await fetchUser();
    setShowVerifyModal(false);
  };

  const handleChangePassword = async (passwordData) => {
    await changePassword(passwordData);
    alert("Password changed successfully. Please log in again. 🔐");
    await logoutUser(navigate);
  };

  const handleLogout = async () => {
    await logoutUser(navigate);
  };

  if (loading && !user) {
    return (
      <div className="profile-loading-screen font-inter">
        <p>Loading your profile details...</p>
      </div>
    );
  }

  const getDisplayName = () => {
    if (!user) return "User";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username;
  };

  const getJoinedDate = () => {
    if (!user || !user.joined_date) return "Joined recently";
    const date = new Date(user.joined_date);
    return `Joined ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
  };

  return (
    <div className="profile-dashboard-layout font-inter">
      
      {/* SIDEBAR NAVIGATION MODULE */}
      <aside className="layout-sidebar">
        <div className="sidebar-brand-title font-plus-jakarta">Profile Page</div>
        
        {user && (
          <div className="sidebar-profile-capsule">
            <img 
              src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="Mini Profile Display" 
              className="sidebar-avatar-img"
            />
            <div className="sidebar-meta-stack">
              <span className="sidebar-profile-name">{getDisplayName()}</span>
              {user.is_gold_member && <span className="sidebar-profile-tier uppercase">Gold Member</span>}
            </div>
          </div>
        )}

        <nav className="sidebar-navigation-links">
          <button className={`nav-link-btn ${activeTab === "Dashboard" ? "active" : ""}`} onClick={() => setActiveTab("Dashboard")}>
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </button>
          <button className={`nav-link-btn ${activeTab === "Orders" ? "active" : ""}`} onClick={() => setActiveTab("Orders")}>
            <ShoppingBag size={18} /> <span>Orders</span>
          </button>
          <button className={`nav-link-btn ${activeTab === "Wishlist" ? "active" : ""}`} onClick={() => setActiveTab("Wishlist")}>
            <Heart size={18} /> <span>Wishlist</span>
          </button>
          <button className={`nav-link-btn ${activeTab === "Membership" ? "active" : ""}`} onClick={() => setActiveTab("Membership")}>
            <Crown size={18} /> <span>Membership</span>
          </button>
          <button className={`nav-link-btn ${activeTab === "Settings" ? "active" : ""}`} onClick={() => {
            setActiveTab("Settings");
            setShowChangePasswordModal(true);
          }}>
            <Settings size={18} /> <span>Profile Settings</span>
          </button>
        </nav>
      </aside>

      {/* CORE CONTENT APPLICATION CANVAS */}
      <main className="layout-workspace">
        {user && (
          <div className="workspace-inner-bounds">
            
            {/* HERO ACCOUNT SECTION DISPLAY HEADER */}
            <header className="workspace-hero-banner">
              <div className="hero-identity-block">
                <div className="hero-avatar-wrapper">
                  <img 
                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="User Display Identity" 
                    className="hero-main-avatar"
                  />
                </div>
                <div className="hero-text-details">
                  <h1 className="hero-profile-fullname font-plus-jakarta">{getDisplayName()}</h1>
                  <div className="hero-badge-meta-row">
                    {user.is_gold_member && <span className="gold-membership-tag uppercase">✪ Gold Member</span>}
                    <span className="hero-account-creation-date">{getJoinedDate()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button className="hero-edit-profile-btn font-inter" onClick={() => setShowEditModal(true)}>
                  Edit Profile
                </button>
                <button 
                  className="hero-edit-profile-btn font-inter" 
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  <Lock size={14} />
                  <span>Change Password</span>
                </button>
              </div>
            </header>

            {/* CONDITIONAL SYSTEM FLAG: EMAIL NOTIFICATION BAR */}
            {!(user.is_verified || user.is_social) && (
              <div className="email-alert-strip-container">
                <div className="alert-strip-message">
                  <AlertCircle size={18} className="alert-strip-icon-accent" />
                  <span>Please verify your email to start purchasing and booking new adventures.</span>
                </div>
                <button className="alert-strip-action-btn font-inter" onClick={handleStartVerification}>
                  Verify Now
                </button>
              </div>
            )}

            {/* SPLIT HORIZONTAL WORKSPACE CONTENT CORES */}
            <div className="workspace-split-columns-grid">
              
              {/* PRIMARY FEED FLOW AREA */}
              <div className="workspace-left-flow-column">
                <UserInfoCard user={user} onEdit={() => setShowEditModal(true)} />
                <AddressList />
              </div>

              {/* FLOATING UTILITY PANELS RIGHT COLUMN */}
              <div className="workspace-right-action-column">
                <MembershipCard user={user} />
                <WalletCard />
                
                <button className="workspace-logout-trigger-btn font-inter" onClick={handleLogout}>
                  <span>Logout</span>
                  <LogOut size={16} />
                </button>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* OVERLAY MODAL MOUNT CONTROLS */}
      {showEditModal && user && (
        <ProfileEditForm user={user} onSubmit={handleUpdateProfile} onClose={() => setShowEditModal(false)} />
      )}

      {showVerifyModal && user && (
        <OTPVerificationModal email={user.email} onSubmit={handleVerifyOTP} onClose={() => setShowVerifyModal(false)} />
      )}

      {showChangePasswordModal && (
        <ChangePasswordModal onSubmit={handleChangePassword} onClose={() => setShowChangePasswordModal(false)} />
      )}

    </div>
  );
};

export default ProfilePage;