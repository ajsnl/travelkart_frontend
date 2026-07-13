import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { signupUser, googleLogin, getCurrentUser } from "../../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../features/auth/authSlice";
import { toast } from "react-toastify";

import "./Signup.css";
import signupBg from "../../assets/images/signuppage.png";
import { GoogleLogin } from "@react-oauth/google";
import TravelKartLogoMain from "../../components/brand/TravelKartLogoMain";
import { useCustomDialog } from "../../components/CustomDialog";

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const { showConfirm } = useCustomDialog();

  const [searchParams] = useSearchParams();
  const refCodeParam = searchParams.get("ref") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!loading && isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirm_password: "",
    phone: "",
    dob: "",
    first_name: "",
    last_name: "",
    referral_code_used: refCodeParam || ""
  });

  useEffect(() => {
    if (refCodeParam) {
      setFormData(prev => ({ ...prev, referral_code_used: refCodeParam }));
    }
  }, [refCodeParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const val = name === "referral_code_used" ? value.toUpperCase() : value;
      const updated = { ...prev, [name]: val };
      
      // Auto-fallback backup for fields that aren't on the Figma layout screen
      if (name === "first_name") updated.username = value.toLowerCase() + Math.floor(Math.random() * 100);
      if (name === "email" && !prev.username) updated.username = value.split("@")[0];
      
      return updated;
    });
  };

  const getTodayStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDobMaxStr = () => {
    const today = new Date();
    const year = today.getFullYear() - 13;
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateForm = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (formData.first_name && !nameRegex.test(formData.first_name.trim())) {
      toast.error("First name must contain only letters and spaces");
      return false;
    }
    if (formData.last_name && !nameRegex.test(formData.last_name.trim())) {
      toast.error("Last name must contain only letters and spaces");
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (formData.dob) {
      const dobMaxStr = getDobMaxStr();
      if (formData.dob > dobMaxStr) {
        toast.error("You must be at least 13 years old to register");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const confirmed = await showConfirm("Are you sure you want to register?", "Register Account", "info");
    if (!confirmed) return;

    try {
      const res = await signupUser(formData);
      console.log(res.data);
      toast.success("Signup successful 🎉");
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      const data = err.response?.data;
      
      if (typeof data === "string") {
        toast.error(data);
      } else if (data && typeof data === "object") {
        if (data.error) {
          const errMsg = typeof data.error === "string" ? data.error : (Array.isArray(data.error) ? data.error[0] : JSON.stringify(data.error));
          toast.error(errMsg);
        } else if (data.non_field_errors) {
          const nonFieldErrs = Array.isArray(data.non_field_errors) ? data.non_field_errors : [data.non_field_errors];
          nonFieldErrs.forEach(err => toast.error(err));
        } else {
          // Format validation errors: "Field Name: Error message"
          const errorEntries = [];
          Object.entries(data).forEach(([key, value]) => {
            const cleanKey = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
            const msgs = Array.isArray(value) ? value : [value];
            msgs.forEach(msg => {
              errorEntries.push({ field: cleanKey, message: msg });
            });
          });

          if (errorEntries.length > 0) {
            toast.error(
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                <strong style={{ fontSize: "14px", marginBottom: "2px", display: "block" }}>Validation Errors:</strong>
                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", lineHeight: "1.4" }}>
                  {errorEntries.map((errItem, idx) => (
                    <li key={idx} style={{ marginBottom: "2px" }}>
                      <span style={{ fontWeight: "600" }}>{errItem.field}:</span> {errItem.message}
                    </li>
                  ))}
                </ul>
              </div>,
              { autoClose: 6000 }
            );
          } else {
            toast.error("Signup failed ❌");
          }
        }
      } else {
        toast.error("Signup failed ❌");
      }
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
            <TravelKartLogoMain className="signup-logo-icon" color="#FFFFFF" accentColor="#4E82EE" />
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
                  max={getDobMaxStr()}
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

            {/* Field Capture Block: Referral Code */}
            <div className="signup-field-wrapper">
              <label className="signup-input-label">Referral Code (Optional)</label>
              <div className="signup-input-container">
                <input
                  name="referral_code_used"
                  type="text"
                  placeholder="e.g. ABC123"
                  value={formData.referral_code_used}
                  onChange={handleChange}
                  className="signup-input-field"
                  style={{ textTransform: "uppercase" }}
                />
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
          <div className="signup-google-btn">
          <GoogleLogin
            theme="outline"
            size="large"
            text="continue_with"
            shape="pill"
            onSuccess={async (credentialResponse) => {
              try {
                const token = credentialResponse.credential;

                const res = await googleLogin(token);

                console.log("Google login success:", res.data);

                const user = await getCurrentUser();
                dispatch(setUser(user));
                if (user?.role === "admin") {
                  navigate("/admin");
                } else {
                  navigate("/");
                }

              } catch (err) {
                console.error("Google login error:", err);
                const backendError = err.response?.data?.error || 
                                     err.response?.data?.non_field_errors?.[0] || 
                                     (err.response?.data && typeof err.response.data === "object" ? Object.values(err.response.data).flat()[0] : null);
                toast.error(backendError || "Google login failed ❌");
              }
            }}
            onError={() => console.log("Login Failed")}
          />
        </div>

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
