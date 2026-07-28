import React, { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate, useNavigationType } from "react-router-dom"; 

// Redux
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "./features/auth/authSlice";

// Service
import { getCurrentUser } from "./services/authService";

// Routes
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";

// Toast Notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const dispatch = useDispatch();
  const location = useLocation(); 
  const navigationType = useNavigationType(); 
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const isGuestOnlyRoute = (path) => {
      const routes = ["/login", "/signup", "/forgot-password", "/verify-otp", "/reset-password"];
      return routes.includes(path);
    };

    const isHybridRoute = (path) => {
      if (path === "/" || path === "/categories" || path === "/shop") return true;
      if (path.startsWith("/product/")) return true;
      return false;
    };

    const checkAuth = async () => {
      try {
        if (isGuestOnlyRoute(location.pathname)) {
          // If they land on guest routes
          if (isAuthenticated) {
            // REDIRECT them back to their dashboard if they are already logged in
            const target = user?.role === "admin" ? "/admin" : "/";
            navigate(target, { replace: true });
          } else {
            // Check if they have an active backend session (e.g. after a hard page refresh on landing page)
            try {
              const userData = await getCurrentUser(true);
              if (userData) {
                dispatch(setUser(userData));
                const target = userData.role === "admin" ? "/admin" : "/";
                navigate(target, { replace: true });
              }
            } catch (err) {
              // Not logged in, let them access guest page
              dispatch(logout());
            }
          }
        } else if (isHybridRoute(location.pathname)) {
          // If they land on public/hybrid routes, fetch profile silently
          if (!isAuthenticated) {
            try {
              const userData = await getCurrentUser(true);
              if (userData) {
                dispatch(setUser(userData));
              }
            } catch (err) {
              // Not logged in, keep as guest
              dispatch(logout())
            }
          }
        } else {
          // ONLY CHECK AND FORCE AUTH FOR PRIVATE ROUTES
          if (!isAuthenticated) {
            try {
              const userData = await getCurrentUser();
              dispatch(setUser(userData));
            } catch (err) {
              dispatch(logout());
            }
          }
        }
      } catch (err) {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [location.pathname, dispatch, isAuthenticated, navigationType, user, navigate]);

  useEffect(() => {
    // Dynamic page title mapping based on route path
    const getPageTitle = (path) => {
      // 1. Admin Routes
      if (path.startsWith("/admin")) {
        if (path === "/admin" || path === "/admin/") return "Admin Dashboard | TravelKart";
        if (path.includes("/products")) return "Manage Products | Admin | TravelKart";
        if (path.includes("/categories")) return "Manage Categories | Admin | TravelKart";
        if (path.includes("/orders")) return "Manage Orders | Admin | TravelKart";
        if (path.includes("/users")) return "Manage Users | Admin | TravelKart";
        if (path.includes("/coupons")) return "Manage Coupons | Admin | TravelKart";
        if (path.includes("/banners")) return "Manage Banners | Admin | TravelKart";
        if (path.includes("/sales-report")) return "Sales Report | Admin | TravelKart";
        return "Admin Portal | TravelKart";
      }
      // 2. Auth Routes
      if (path === "/login") return "Login | TravelKart";
      if (path === "/signup") return "Create Account | TravelKart";
      if (path === "/forgot-password") return "Forgot Password | TravelKart";
      if (path === "/verify-otp") return "Verify OTP | TravelKart";
      if (path === "/reset-password") return "Reset Password | TravelKart";
      // 3. User Routes
      if (path === "/") return "Home - Premium Travel & Adventure Gear | TravelKart";
      if (path === "/cart") return "Shopping Cart | TravelKart";
      if (path === "/checkout") return "Checkout | TravelKart";
      if (path === "/profile") return "My Profile | TravelKart";
      if (path === "/orders") return "My Orders | TravelKart";
      if (path === "/wishlist") return "My Wishlist | TravelKart";
      if (path === "/wallet") return "Wallet & Transactions | TravelKart";
      if (path === "/categories") return "Browse Categories | TravelKart";
      if (path === "/shop") return "Shop Products | TravelKart";
      
      // Dynamic detail views
      if (path.startsWith("/product/")) return "Product Details | TravelKart";
      if (path.startsWith("/order-tracking/")) return "Track Order | TravelKart";
      return "TravelKart";
    };
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  
  return (
    <>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
