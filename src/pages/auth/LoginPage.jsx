import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { loginUser, getCurrentUser, googleLogin } from "../../services/authService";
import { setUser } from "../../features/auth/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";

import "./Login.css";
import loginBg from "../../assets/images/loginpage.png";
import TravelKartLogoMain from "../../components/brand/TravelKartLogoMain";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log("Logging in...");
      await loginUser({ email, password });
      console.log("Login success");

      const user = await getCurrentUser();
      console.log("User:", user);

      dispatch(setUser(user));
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.log("ERROR:", err);
      const backendError = err.response?.data?.error || 
                           err.response?.data?.non_field_errors?.[0] || 
                           (err.response?.data && typeof err.response.data === "object" ? Object.values(err.response.data).flat()[0] : null);
      toast.error(backendError || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
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
              Curated gear for the modern traveler.
            </h1>
            <p className="login-left-description">
              Experience the art of effortless exploration with TravelKart. 
              Your premier store for hardshell luggage, packing cubes, and essential travel gear.
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
            <TravelKartLogoMain className="signup-logo-icon" color="#FFFFFF" accentColor="#4E82EE" />
            <span>TravelKart</span>
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
              <button type="button" className="login-tab-btn-inactive" onClick={()=>navigate('/signup')}>Sign up</button>
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

               <button type="submit" className="login-submit-btn" disabled={loading || submitting} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {(loading || submitting) && <Loader2 className="animate-spin" size={18} />}
                <span>{submitting ? "Signing In..." : loading ? "Loading..." : "Sign In"}</span>
                {!loading && !submitting && <span style={{ fontSize: '20px', lineHeight: 1 }}>→</span>}
              </button>
            </form>

            <div className="login-divider-row font-inter">
              <div className="login-divider-line" />
              <span className="login-divider-text">Or continue with</span>
              <div className="login-divider-line" />
            </div>

            <div className="login-google-btn-wrapper">
              <GoogleLogin
                theme="outline"
                size="large"
                text="signin_with"
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
                      const from = location.state?.from || "/";
                      navigate(from, { replace: true });
                    }
                  } catch (err) {
                    console.error(err);
                    const backendError = err.response?.data?.error || 
                                         err.response?.data?.non_field_errors?.[0] || 
                                         (err.response?.data && typeof err.response.data === "object" ? Object.values(err.response.data).flat()[0] : null);
                    toast.error(backendError || "Google login failed ❌");
                  }
                }}
                onError={() => console.log("Login Failed")}
              />
            </div>

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
