import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Check, X as XIcon, AlertCircle } from "lucide-react";
import { signupUser, googleLogin, getCurrentUser, sendSignupOTP, verifySignupOTP } from "../../services/authService";
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
  const [submitting, setSubmitting] = useState(false);

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

  const [touched, setTouched] = useState({});
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (refCodeParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({ ...prev, referral_code_used: refCodeParam }));
    }
  }, [refCodeParam]);

  if (!loading && isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmailVerified(false);
      setOtpSent(false);
      setEmailOtp("");
      setCountdown(0);
    }
    setFormData((prev) => {
      const val = name === "referral_code_used" ? value.toUpperCase() : value;
      const updated = { ...prev, [name]: val };
      
      // Auto-fallback backup for fields that aren't on the Figma layout screen
      if (name === "first_name") updated.username = value.toLowerCase() + Math.floor(Math.random() * 100);
      if (name === "email" && !prev.username) updated.username = value.split("@")[0];
      
      return updated;
    });
  };

  const getErrorMessage = (err, defaultMsg) => {
    if (err.response?.data) {
      const data = err.response.data;
      if (typeof data === "string") return data;
      if (typeof data === "object") {
        if (data.error) {
          return Array.isArray(data.error) ? data.error[0] : data.error;
        }
        if (data.email) {
          return Array.isArray(data.email) ? data.email[0] : data.email;
        }
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          return Array.isArray(val) ? val[0] : val;
        }
      }
    }
    return defaultMsg;
  };

  const handleSendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      setTouched(prev => ({ ...prev, email: true }));
      toast.error("Please enter a valid email address first");
      return;
    }

    setOtpSending(true);
    try {
      await sendSignupOTP(formData.email.trim());
      toast.success("Verification OTP sent to your email!");
      setOtpSent(true);
      setCountdown(60);
    } catch (err) {
      console.error("Error sending OTP:", err);
      toast.error(getErrorMessage(err, "Failed to send OTP. Please try again."));
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    setOtpVerifying(true);
    try {
      await verifySignupOTP(formData.email.trim(), emailOtp);
      toast.success("Email verified successfully! 🎉");
      setEmailVerified(true);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      toast.error(getErrorMessage(err, "Invalid or expired OTP"));
    } finally {
      setOtpVerifying(false);
    }
  };

  const getDobMaxStr = () => {
    const today = new Date();
    const year = today.getFullYear() - 13;
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Password Live Security Criteria
  const pwd = formData.password || "";
  const passwordCriteria = {
    hasLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  };
  const isPasswordSecure = Object.values(passwordCriteria).every(Boolean);

  // Live Field Validation Errors
  const getFieldErrors = () => {
    const errs = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    // First Name
    if (!formData.first_name || !formData.first_name.trim()) {
      errs.first_name = "First name is required";
    } else if (!nameRegex.test(formData.first_name.trim())) {
      errs.first_name = "Only letters and spaces allowed";
    }

    // Last Name
    if (!formData.last_name || !formData.last_name.trim()) {
      errs.last_name = "Last name is required";
    } else if (!nameRegex.test(formData.last_name.trim())) {
      errs.last_name = "Only letters and spaces allowed";
    }

    // Date of Birth
    if (!formData.dob) {
      errs.dob = "Date of birth is required";
    } else if (formData.dob > getDobMaxStr()) {
      errs.dob = "You must be at least 13 years old to register";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = "Enter a valid email (e.g. name@domain.com)";
    } else if (!emailVerified) {
      errs.email = "Please verify your email with OTP";
    }

    // Password
    if (!pwd) {
      errs.password = "Password is required";
    } else if (!isPasswordSecure) {
      errs.password = "Password must meet all security requirements";
    }

    // Confirm Password
    if (!formData.confirm_password) {
      errs.confirm_password = "Confirm password is required";
    } else if (formData.confirm_password !== formData.password) {
      errs.confirm_password = "Passwords do not match";
    }

    return errs;
  };

  const fieldErrors = getFieldErrors();
  const hasErrors = Object.keys(fieldErrors).length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to trigger inline warnings
    setTouched({
      first_name: true,
      last_name: true,
      dob: true,
      email: true,
      password: true,
      confirm_password: true
    });

    if (hasErrors) {
      if (!emailVerified) {
        toast.error("Please verify your email address via OTP before continuing.");
      } else if (!isPasswordSecure) {
        toast.error("Please ensure your password satisfies all security criteria.");
      } else {
        toast.error("Please correct the errors indicated under each field.");
      }
      return;
    }

    const confirmed = await showConfirm("Are you sure you want to register this account?", "Register Account", "info");
    if (!confirmed) return;

    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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

          <form onSubmit={handleSubmit} className="signup-form font-inter" noValidate>
            
            {/* Compound Row Structure: Full Name Split Map Fields */}
            <div className="signup-field-wrapper">
              <label className="signup-input-label">Full Name</label>
              <div className="signup-fullname-row">
                <div className="signup-fullname-col">
                  <div className="signup-input-container">
                    <input
                      name="first_name"
                      required
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                      onBlur={() => handleBlur("first_name")}
                      className={`signup-input-field ${touched.first_name && fieldErrors.first_name ? "has-error" : ""}`}
                    />
                  </div>
                  {touched.first_name && fieldErrors.first_name && (
                    <span className="signup-field-warning">
                      <AlertCircle size={13} /> {fieldErrors.first_name}
                    </span>
                  )}
                </div>

                <div className="signup-fullname-col">
                  <div className="signup-input-container">
                    <input
                      name="last_name"
                      required
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      onBlur={() => handleBlur("last_name")}
                      className={`signup-input-field ${touched.last_name && fieldErrors.last_name ? "has-error" : ""}`}
                    />
                  </div>
                  {touched.last_name && fieldErrors.last_name && (
                    <span className="signup-field-warning">
                      <AlertCircle size={13} /> {fieldErrors.last_name}
                    </span>
                  )}
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
                  onBlur={() => handleBlur("dob")}
                  max={getDobMaxStr()}
                  className={`signup-input-field ${touched.dob && fieldErrors.dob ? "has-error" : ""}`}
                />
              </div>
              {touched.dob && fieldErrors.dob && (
                <span className="signup-field-warning">
                  <AlertCircle size={13} /> {fieldErrors.dob}
                </span>
              )}
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
                  onBlur={() => handleBlur("email")}
                  className={`signup-input-field ${touched.email && fieldErrors.email ? "has-error" : ""}`}
                  style={{ paddingRight: emailVerified ? "120px" : "120px" }}
                />
                
                <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", zIndex: 10 }}>
                  {emailVerified ? (
                    <span style={{ color: "#10B981", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
                      ✓ Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpSending || !formData.email || countdown > 0}
                      className="signup-otp-btn"
                    >
                      {otpSending && <Loader2 className="animate-spin" size={12} />}
                      {otpSent ? (countdown > 0 ? `${countdown}s` : "Resend") : "Send OTP"}
                    </button>
                  )}
                </div>
              </div>

              {touched.email && fieldErrors.email && (
                <span className="signup-field-warning">
                  <AlertCircle size={13} /> {fieldErrors.email}
                </span>
              )}

              {otpSent && !emailVerified && (
                <div className="signup-otp-verify-row">
                  <div className="signup-input-container" style={{ flex: 1, height: "45px" }}>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={emailOtp}
                      maxLength={6}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                      className="signup-input-field"
                      style={{ height: "100%", fontSize: "14px" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={otpVerifying || emailOtp.length !== 6}
                    className="signup-otp-verify-btn"
                  >
                    {otpVerifying ? <Loader2 className="animate-spin" size={16} /> : "Verify"}
                  </button>
                </div>
              )}
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
                  onBlur={() => handleBlur("password")}
                  className={`signup-input-field ${touched.password && fieldErrors.password ? "has-error" : ""}`}
                  style={{ paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="signup-password-toggle">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {touched.password && fieldErrors.password && (
                <span className="signup-field-warning">
                  <AlertCircle size={13} /> {fieldErrors.password}
                </span>
              )}

              {/* Real-time Password Security Criteria Checklist */}
              {(touched.password || formData.password.length > 0) && (
                <div className="signup-password-criteria">
                  <div className={`criteria-item ${passwordCriteria.hasLength ? "valid" : "invalid"}`}>
                    {passwordCriteria.hasLength ? <Check size={13} /> : <XIcon size={13} />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`criteria-item ${passwordCriteria.hasUpper ? "valid" : "invalid"}`}>
                    {passwordCriteria.hasUpper ? <Check size={13} /> : <XIcon size={13} />}
                    <span>1 uppercase letter (A-Z)</span>
                  </div>
                  <div className={`criteria-item ${passwordCriteria.hasLower ? "valid" : "invalid"}`}>
                    {passwordCriteria.hasLower ? <Check size={13} /> : <XIcon size={13} />}
                    <span>1 lowercase letter (a-z)</span>
                  </div>
                  <div className={`criteria-item ${passwordCriteria.hasNumber ? "valid" : "invalid"}`}>
                    {passwordCriteria.hasNumber ? <Check size={13} /> : <XIcon size={13} />}
                    <span>1 number (0-9)</span>
                  </div>
                  <div className={`criteria-item ${passwordCriteria.hasSpecial ? "valid" : "invalid"}`} style={{ gridColumn: "span 2" }}>
                    {passwordCriteria.hasSpecial ? <Check size={13} /> : <XIcon size={13} />}
                    <span>1 special character (!@#$%^&*...)</span>
                  </div>
                </div>
              )}
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
                  onBlur={() => handleBlur("confirm_password")}
                  className={`signup-input-field ${touched.confirm_password && fieldErrors.confirm_password ? "has-error" : ""}`}
                  style={{ paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="signup-password-toggle">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {touched.confirm_password && fieldErrors.confirm_password && (
                <span className="signup-field-warning">
                  <AlertCircle size={13} /> {fieldErrors.confirm_password}
                </span>
              )}

              {touched.confirm_password && !fieldErrors.confirm_password && formData.confirm_password.length > 0 && (
                <span className="signup-field-success">
                  <Check size={13} /> Passwords match
                </span>
              )}
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

            <button 
              type="submit" 
              className="signup-submit-btn" 
              disabled={loading || submitting} 
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {(loading || submitting) && <Loader2 className="animate-spin" size={18} />}
              <span>{submitting ? "Creating Account..." : loading ? "Loading..." : "Create Account"}</span>
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
              width="360"
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
