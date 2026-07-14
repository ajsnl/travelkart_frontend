import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../../api/axios";
import { toast } from "react-toastify";
import { useCustomDialog } from "../../components/CustomDialog";

import "./ResetPassword.css";
import forgotBg from "../../assets/images/forgotpasswordpage.png";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showConfirm } = useCustomDialog();
  const email = localStorage.getItem("resetEmail");
  const otpVerified = localStorage.getItem("otpVerified");

  useEffect(() => {
    if (!email || otpVerified !== "true") {
      toast.error("Access denied. Please verify OTP first.");
      navigate("/forgot-password");
    }
  }, [email, otpVerified, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email || otpVerified !== "true") {
      toast.error("Session expired or invalid. Please restart password reset.");
      navigate("/forgot-password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const confirmed = await showConfirm("Are you sure you want to reset your password?", "Reset Password", "info");
    if (!confirmed) return;

    try {
      setLoading(true);

      await axios.post(
        `${BASE_URL}/api/auth/reset-password/`,
        {
          email,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Password reset successful 🎉");
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("otpVerified");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-viewport">
      
      {/* LEFT SIDE PANEL - MOUNTAIN REFLECTION ARTWORK */}
      <div className="reset-left-banner" style={{ backgroundImage: `url(${forgotBg})` }}>
        <div className="reset-banner-overlay" />
        
        <div className="reset-banner-content">
          <div className="reset-left-quote">
            “Travel Light. Travel Right.”
          </div>

          <div className="reset-left-middle-stack">
            <h1 className="reset-left-heading">
              Curated journeys for the modern traveler.
            </h1>
            <div className="reset-left-divider" />
          </div>

          <div className="reset-left-logo">
            TravelKart
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL - FORCED INPUT DATA CONTAINERS */}
      <div className="reset-right-container">
        <div className="reset-form-wrapper">
          
          <div className="font-inter">
            <h2 className="reset-heading font-plus-jakarta">Reset Your Password</h2>
            <p className="reset-subheading">
              Enter your new password below to secure your account.
            </p>
          </div>

          <form onSubmit={handleReset} className="reset-form font-inter">
            
            {/* Field Capture Block: New Password Entry */}
            <div className="reset-field-wrapper">
              <label className="reset-input-label">New Password</label>
              <div className="reset-input-container">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="reset-input-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)} 
                  className="reset-password-toggle"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Field Capture Block: Confirm Passkeys Entry */}
            <div className="reset-field-wrapper">
              <label className="reset-input-label">Confirm New Password</label>
              <div className="reset-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="reset-input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="reset-password-toggle"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Verification Button Triggers */}
            <div style={{ marginTop: '8px' }}>
              <button type="submit" className="reset-submit-btn" disabled={loading}>
                <span>{loading ? "Resetting..." : "Reset Password"}</span>
                {!loading && <span style={{ fontSize: '18px', lineHeight: 1 }}>→</span>}
              </button>

              <Link to="/login" className="reset-back-link">
                <span style={{ fontSize: '16px', lineHeight: 1 }}>←</span>
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Global Structural Disclaimers Footer */}
        <div className="reset-footer-meta">
          <span>© 2024 VOYAGE TRAVEL. ALL RIGHTS RESERVED.</span>
          <div className="reset-footer-links">
            <Link to="/privacy" className="reset-meta-link">Privacy Policy</Link>
            <Link to="/terms" className="reset-meta-link">Terms of Service</Link>
            <Link to="/help" className="reset-meta-link">Support</Link>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ResetPassword;
