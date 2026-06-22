import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  AlertCircle,
  Lock,
  ArrowLeft,
  ShoppingBag,
  Loader2
} from "lucide-react";
import { 
  getProfile, 
  updateProfile, 
  sendEmailOTP, 
  verifyEmailOTP,
  logoutUser,
  changePassword
} from "../services/authService";
import { fetchUserOrders } from "../services/orderService";

import UserInfoCard from "../components/profile/UserInfoCard";
import AddressList from "../components/profile/AddressList";
import WalletCard from "../components/profile/WalletCard";
import MembershipCard from "../components/profile/MembershipCard";
import ProfileEditForm from "../components/profile/ProfileEditForm";
import OTPVerificationModal from "../components/profile/OTPVerificationModal";
import ChangePasswordModal from "../components/profile/ChangePasswordModal";
import Footer from "../components/Footer";

import "../components/profile/Profile.css";
import { toast } from "react-toastify";
import { useCustomDialog } from "../components/CustomDialog";

const OrderHistoryList = ({ navigate }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await fetchUserOrders();
        setOrders(res.data);
      } catch (err) {
        console.error("Error loading order list:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    getOrders();
  }, []);
  if (loadingOrders) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
        <Loader2 className="animate-spin" style={{ color: "#00236F" }} size={32} />
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <p style={{ color: "#64748B", margin: 0, padding: "20px 0" }}>You haven't placed any orders yet.</p>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
      {orders.map((ord) => (
        <div key={ord.id} style={{ 
          border: "1px solid #E2E8F0", 
          borderRadius: "10px", 
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <div style={{ fontWeight: "700", color: "#00236F" }}>{ord.tracking_id}</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Placed on: {new Date(ord.created_at).toLocaleDateString()} • Status: <span style={{ textTransform: "capitalize", fontWeight: "600" }}>{ord.status.replace(/_/g, ' ')}</span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", marginTop: "8px" }}>
              ₹{parseFloat(ord.total_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <button 
            onClick={() => navigate(`/order-tracking/${ord.tracking_id}`)}
            className="hero-edit-profile-btn font-inter"
            style={{ padding: "6px 12px", fontSize: "13px", width: "auto" }}
          >
            Track Order
          </button>
        </div>
      ))}
    </div>
  );
};


const ProfilePage = () => {
  const { showAlert, showConfirm } = useCustomDialog();
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
      await showAlert(err.response?.data?.error || "Failed to send verification OTP.", "Verification Error", "error");
    }
  };

  const handleVerifyOTP = async (otp) => {
    await verifyEmailOTP(otp);
    toast.success("Email verified successfully! ");
    await fetchUser();
    setShowVerifyModal(false);
  };

  const handleChangePassword = async (passwordData) => {
    await changePassword(passwordData);
    toast.success("Password changed successfully. Please log in again. 🔐");
    await logoutUser(navigate);
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm("Are you sure you want to log out?", "Logout", "warning");
    if (confirmed) {
      await logoutUser(navigate);
    }
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

  const getProfilePictureUrl = () => {
    if (!user || !user.profile_picture) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    let url = user.profile_picture;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `http://localhost:8000${url.startsWith("/") ? "" : "/"}${url}`;
    }
    const ts = user.updated_at ? new Date(user.updated_at).getTime() : new Date().getTime();
    return `${url}?t=${ts}`;
  };

  return (
    <div className="profile-dashboard-layout font-inter">
      
      {/* SIDEBAR NAVIGATION MODULE */}
      <aside className="layout-sidebar">
        <div className="sidebar-brand-title font-plus-jakarta">Profile Page</div>
        
        {user && (
          <div className="sidebar-profile-capsule">
            <img 
              src={getProfilePictureUrl()} 
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
            <LayoutDashboard size={18} /> <span>Profile Overview</span>
          </button>
                    <button className={`nav-link-btn ${activeTab === "Orders" ? "active" : ""}`} onClick={() => setActiveTab("Orders")}>
            <ShoppingBag size={18} /> <span>My Orders</span>
          </button>
          <button className="nav-link-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={18} /> <span>Back to Home </span>
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
                    src={getProfilePictureUrl()} 
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
                  <span>Please verify your email to start purchasing premium travel gear.</span>
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
                  {activeTab === "Orders" ? (
                  <div className="profile-card">
                    <h2 className="profile-section-title">My Orders</h2>
                    <OrderHistoryList navigate={navigate} />
                  </div>
                ) : (
                  <>
                    <UserInfoCard 
                      user={user} 
                      onEdit={() => setShowEditModal(true)}
                      refreshUser={fetchUser}
                    />
                    <AddressList />
                  </>
                )}
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
        <Footer />
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