import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import "./ForgotPassword.css";
import forgotBg from "../../assets/images/forgotpasswordpage.png";
import { toast } from "react-toastify";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("resetEmail");
    localStorage.removeItem("otpVerified");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to request a password reset link?")) return;
    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/auth/forgot-password/", {
        email,
      });

      // store target context criteria parameters
      localStorage.setItem("resetEmail", email);

      toast.success("OTP sent to your email");
      navigate("/verify-otp");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-viewport">
      
      {/* LEFT SIDE PANEL - ARTWORK BANNER OVERLAY MATRIX */}
      <div className="forgot-left-banner" style={{ backgroundImage: `url(${forgotBg})` }}>
        <div className="forgot-banner-overlay" />
        
        <div className="forgot-banner-content">
          <div className="forgot-left-quote">
            “Travel Light. Travel Right.”
          </div>

          <div className="forgot-left-middle-stack">
            <h1 className="forgot-left-heading">
              Curated journeys for the modern traveler.
            </h1>
            <div className="forgot-left-divider" />
          </div>

          <div className="forgot-left-logo">
            TravelKart
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL - FORCED PURE FIGMA INTERFACE */}
      <div className="forgot-right-container">
        <div className="forgot-form-wrapper">
          
          <div className="font-inter">
            <h2 className="forgot-heading font-plus-jakarta">Forgot Password?</h2>
            <p className="forgot-subheading">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-form font-inter">
            
            {/* Input Element: Underlined Field Matrix mapping */}
            <div className="forgot-field-wrapper">
              <label className="forgot-input-label">Email Address</label>
              <input
                type="email"
                placeholder="email@voyage.com"
                className="forgot-input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Event Submission Processing buttons element */}
            <div style={{ marginTop: '8px' }}>
              <button type="submit" className="forgot-submit-btn" disabled={loading}>
                <span>{loading ? "Sending Link..." : "Send Reset Link"}</span>
                {!loading && <span style={{ fontSize: '18px', lineHeight: 1 }}>→</span>}
              </button>

              <Link to="/" className="forgot-back-link">
                <span style={{ fontSize: '16px', lineHeight: 1 }}>←</span>
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        </div>

        {/* System Footer Absolute Elements matching baseline */}
        <div className="forgot-footer-meta">
          <span>© 2026 TravelKart</span>
          <a href="/support" className="forgot-support-link">Support</a>
        </div>
      </div>

    </div>
  );
}

export default ForgotPassword;
