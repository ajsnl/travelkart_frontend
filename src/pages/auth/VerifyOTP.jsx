import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../api/axios";

import "./VerifyOTP.css";
// Shares the exact same background image composition as your forgot password file
import forgotBg from "../../assets/images/forgotpasswordpage.png";
import { toast } from "react-toastify";
import { useCustomDialog } from "../../components/CustomDialog";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { showConfirm } = useCustomDialog();

  // Retrieve contextual session target parameters safely
  const email = localStorage.getItem("resetEmail");

  useEffect(() => {
    if (!email) {
      toast.error("Please request a password reset link first.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const confirmed = await showConfirm("Are you sure you want to submit the OTP for verification?", "Submit OTP", "info");
    if (!confirmed) return;

    try {
      await axios.post(`${BASE_URL}/api/auth/verify-forgot-otp/`, {
        email: email || "",
        otp,
      });

      toast.success("OTP verified ");
      localStorage.setItem("otpVerified", "true");
      navigate("/reset-password");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP ❌");
    }
  };

  return (
    <div className="verify-viewport">
      
      {/* LEFT SIDE PANEL - MATCHES FORGOT PASSWORD GRAPHIC SCREEN */}
      <div className="verify-left-banner" style={{ backgroundImage: `url(${forgotBg})` }}>
        <div className="verify-banner-overlay" />
        
        <div className="verify-banner-content">
          <div className="verify-left-quote">
            “Travel Light. Travel Right.”
          </div>

          <div className="verify-left-middle-stack">
            <h1 className="verify-left-heading">
              Curated journeys for the modern traveler.
            </h1>
            <div className="verify-left-divider" />
          </div>

          <div className="verify-left-logo">
            TravelKart
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL - VERIFICATION CARD INTERFACE */}
      <div className="verify-right-container">
        <div className="verify-form-wrapper">
          
          <div className="font-inter">
            <h2 className="verify-heading font-plus-jakarta">Verify OTP</h2>
            <p className="verify-subheading">
              Please enter the security verification code sent to <span className="verify-email-highlight">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleVerify} className="verify-form font-inter">
            
            {/* Input Capture Block: Token Code String */}
            <div className="verify-field-wrapper">
              <label className="verify-input-label">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="verify-input-field"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            {/* Verification Button Triggers */}
            <div style={{ marginTop: '8px' }}>
              <button type="submit" className="verify-submit-btn">
                <span>Verify OTP</span>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>→</span>
              </button>

              <Link to="/forgot-password" className="verify-back-link">
                <span style={{ fontSize: '16px', lineHeight: 1 }}>←</span>
                <span>Change Email Address</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Global Structural Disclaimers Footer */}
        <div className="verify-footer-meta">
          <span>© 2026 Voyage Travel</span>
          <a href="/support" className="verify-support-link">Support</a>
        </div>
      </div>

    </div>
  );
}

export default VerifyOTP;
