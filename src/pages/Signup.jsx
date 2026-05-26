import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { signupUser } from "../services/authService";

import "./Signup.css";
import signupBg from "../assets/images/signuppage.png";

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirm_password: "",
    phone: "",
    dob: "",
    first_name: "",
    last_name: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-fallback backup for fields that aren't on the Figma layout screen
      if (name === "first_name") updated.username = value.toLowerCase() + Math.floor(Math.random() * 100);
      if (name === "email" && !prev.username) updated.username = value.split("@")[0];
      
      return updated;
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await signupUser(formData);
      console.log(res.data);
      alert("Signup successful 🎉");
      navigate("/");
    } catch (err) {
      console.error(err.response?.data);
      alert("Signup failed ❌");
    }
  };

  return (
    <div className="signup-viewport">
      
      {/* LEFT SIDE PANEL - VECTOR VISUAL ARTS WITH GRAPHIC TITLE */}
      <div className="signup-left-banner" style={{ backgroundImage: `url(${signupBg})` }}>
        <div className="signup-banner-overlay" />
        
        <div className="signup-banner-content">
          <div className="signup-left-quote">
            “Travel Light. Travel Right.”
          </div>

          <div className="signup-left-middle-stack">
            <h1 className="signup-left-heading">
              Curated journeys for the modern traveler.
            </h1>
            <div className="signup-left-divider" />
          </div>

          <div className="signup-left-logo">
            {/* Embedded inline vector to replicate the Figma Anchor boat ship shape */}
            <svg className="signup-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10.16c0-1.85-1.32-3.36-3-3.36H5c-1.68 0-3 1.51-3 3.36v3.2c0 2.21 1.79 4.08 4 4.08h12c2.21 0 4-1.87 4-4.08v-3.2z" />
              <path d="M12 2v14M12 2l4 4M12 2L8 6" />
            </svg>
            <span>TravelKart</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL - SYSTEM DISPATCH REGISTER FIELDS */}
      <div className="signup-right-container">
        <div className="signup-form-wrapper">
          
          <div className="font-inter">
            <h2 className="signup-heading font-plus-jakarta">Create your account</h2>
          </div>

          <form onSubmit={handleSubmit} className="signup-form font-inter">
            
            {/* Compound Row Structure: Full Name Split Map Fields */}
            <div className="signup-field-wrapper">
              <label className="signup-input-label">Full Name</label>
              <div className="signup-fullname-row">
                <div className="signup-input-container" style={{ flex: 1 }}>
                  <input
                    name="first_name"
                    required
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="signup-input-field"
                  />
                </div>
                <div className="signup-input-container" style={{ flex: 1 }}>
                  <input
                    name="last_name"
                    required
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="signup-input-field"
                  />
                </div>
              </div>
            </div>

            {/* Field Capture Block: Date of Birth */}
            <div className="signup-field-wrapper">
              <label className="signup-input-label">Date of Birth</label>
              <div className="signup-input-container">
                <input
                  name="dob"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="signup-input-field"
                />
              </div>
            </div>

            {/* Field Capture Block: Email Address */}
            <div className="signup-field-wrapper">
              <label className="signup-input-label">Email Address</label>
              <div className="signup-input-container">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="email@voyage.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="signup-input-field"
                />
              </div>
            </div>

            {/* Field Capture Block: Password Entry */}
            <div className="signup-field-wrapper">
              <label className="signup-input-label">Password</label>
              <div className="signup-input-container">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="signup-input-field"
                  style={{ paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="signup-password-toggle">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Field Capture Block: Confirm Passkeys Entry */}
            <div className="signup-field-wrapper">
              <label className="signup-input-label">Confirm Password</label>
              <div className="signup-input-container">
                <input
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="signup-input-field"
                  style={{ paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="signup-password-toggle">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="signup-submit-btn">
              Create Account
            </button>
          </form>

          {/* Boundaries Ribbon */}
          <div className="signup-divider-row font-inter">
            <div className="signup-divider-line" />
            <span className="signup-divider-text">Or continue with</span>
            <div className="signup-divider-line" />
          </div>

          {/* Google Actions Anchor */}
          <button type="button" className="signup-google-btn font-inter">
            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.357 2.673 1.386 6.577l3.88 3.188z" />
              <path fill="#4285F4" d="M23.455 12.273c0-.818-.073-1.609-.209-2.373H12v4.509h6.418a5.505 5.505 0 01-2.391 3.609l3.718 2.882c2.173-2.009 3.427-4.964 3.427-8.627z" />
              <path fill="#FBBC05" d="M5.266 14.235A7.024 7.024 0 014.91 12c0-.791.136-1.555.356-2.265L1.386 6.545A11.948 11.948 0 000 12c0 1.955.464 3.81 1.295 5.464l3.971-3.229z" />
              <path fill="#34A853" d="M12 24c3.245 0 5.973-1.082 7.964-2.918l-3.718-2.882c-1.027.691-2.345 1.1-4.246 1.1-3.264 0-6.036-2.21-7.027-5.182L1.09 17.336C3.064 21.318 7.209 24 12 24z" />
            </svg>
            <span>Google</span>
          </button>

          {/* Reverse Sign Route Context Anchor */}
          <p className="signup-footer-redirect font-inter">
            Already have an account? <Link to="/" className="signup-redirect-link">Sign In</Link>
          </p>

          {/* Disclaimers row block */}
          <div className="signup-footnote-row font-inter">
            <Link to="/privacy" className="signup-footnote-link">Privacy Policy</Link>
            <Link to="/help" className="signup-footnote-link">Help Center</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Signup;