import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { loginUser, getCurrentUser } from "../services/authService";
import { setUser } from "../features/auth/authSlice";

import "./Login.css";
import loginBg from "../assets/images/loginpage.png";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("Logging in...");
      await loginUser({ email, password });
      console.log("Login success");

      const user = await getCurrentUser();
      console.log("User:", user);

      dispatch(setUser(user));
      navigate("/dashboard");
    } catch (err) {
      console.log("ERROR:", err);
      alert("Login failed");
    }
  };

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-viewport">
      
      {/* LEFT SIDE PANEL - DYNAMIC TEXT OVERLAYS + MIX BLENDED BACKGROUND TINT */}
      <div className="login-left-banner" style={{ backgroundImage: `url(${loginBg})` }}>
        {/* Dynamic Blue Mix-Blend Overlay Layer */}
        <div className="login-banner-overlay" />

        {/* Content Wrapper Layer positioned above overlay */}
        <div className="login-banner-content">
          <div className="login-left-quote">
            “Travel Light. Travel Right.”
          </div>

          <div className="login-left-middle-stack">
            <h1 className="login-left-heading">
              Curated journeys for the modern traveler.
            </h1>
            <p className="login-left-description">
              Experience the art of effortless exploration with TravelKart. 
              Your digital concierge for unique destinations and seamless planning.
            </p>

            {/* Social Avatars Dynamic Generation */}
            <div className="login-avatar-row">
              <div className="login-avatar-group">
                <div className="login-avatar-item avatar-1" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60')" }} />
                <div className="login-avatar-item avatar-2" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60')" }} />
                <div className="login-avatar-item avatar-3" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60')" }} />
              </div>
              <span className="login-avatar-text">
                Chosen by hundreds of travelers
              </span>
            </div>
          </div>

          <div className="login-left-logo">
            TravelKart
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL - REFACTOR ARCHITECTURE INTERFACE MATCHING FIGMA */}
      <div className="login-right-container">
        <div className="login-form-wrapper">
          
          <div className="login-header-group">
            <div className="font-inter">
              <h2 className="login-heading font-plus-jakarta">Welcome back</h2>
              <p className="login-subheading">Please enter your details to access your dashboard.</p>
            </div>

            <div className="login-tab-bar font-inter">
              <button type="button" className="login-tab-btn-active">Login</button>
              <button type="button" className="login-tab-btn-inactive">Sign up</button>
            </div>

            <form onSubmit={handleLogin} className="login-form font-inter">
              <div className="login-field-wrapper">
                <label className="login-input-label">Email Address</label>
                <div className="login-input-container">
                  <div className="login-input-icon-left"><Mail size={20} /></div>
                  <input
                    type="email"
                    required
                    placeholder="alex@voyage.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input-field"
                  />
                </div>
              </div>

              <div className="login-field-wrapper">
                <div className="login-label-row">
                  <label className="login-input-label">Password</label>
                  <Link to="/forgot-password" className="login-forgot-link">Forgot password?</Link>
                </div>
                <div className="login-input-container">
                  <div className="login-input-icon-left"><Lock size={20} /></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input-field"
                    style={{ paddingRight: '48px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="login-password-toggle">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-submit-btn">
                <span>Sign In</span>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>→</span>
              </button>
            </form>

            <div className="login-divider-row font-inter">
              <div className="login-divider-line" />
              <span className="login-divider-text">Or continue with</span>
              <div className="login-divider-line" />
            </div>

            <button type="button" className="login-google-btn font-inter">
              <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.357 2.673 1.386 6.577l3.88 3.188z" />
                <path fill="#4285F4" d="M23.455 12.273c0-.818-.073-1.609-.209-2.373H12v4.509h6.418a5.505 5.505 0 01-2.391 3.609l3.718 2.882c2.173-2.009 3.427-4.964 3.427-8.627z" />
                <path fill="#FBBC05" d="M5.266 14.235A7.024 7.024 0 014.91 12c0-.791.136-1.555.356-2.265L1.386 6.545A11.948 11.948 0 000 12c0 1.955.464 3.81 1.295 5.464l3.971-3.229z" />
                <path fill="#34A853" d="M12 24c3.245 0 5.973-1.082 7.964-2.918l-3.718-2.882c-1.027.691-2.345 1.1-4.246 1.1-3.264 0-6.036-2.21-7.027-5.182L1.09 17.336C3.064 21.318 7.209 24 12 24z" />
              </svg>
              <span>Google</span>
            </button>

            <p className="login-footer-redirect font-inter">
              Don't have an account? <Link to="/signup" className="login-redirect-link">Create a new account</Link>
            </p>
          </div>

          <div className="login-footnote-row font-inter">
            <Link to="/privacy" className="login-footnote-link">Privacy Policy</Link>
            <Link to="/help" className="login-footnote-link">Help Center</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;