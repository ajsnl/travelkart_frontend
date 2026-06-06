import React, { useEffect } from "react";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Home from "./pages/Home";

import { Routes, Route, useLocation, useNavigate, useNavigationType } from "react-router-dom"; 

// Redux
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "./features/auth/authSlice";

//  Service
import { getCurrentUser, logoutUser } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ProfilePage from "./pages/ProfilePage";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCategory from "./pages/AdminCategory";
import AdminLayout from "./components/AdminLayout";
import AdminProduct from "./pages/AdminProduct";

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
    const publicRoutes = [
      "/",
      "/login",
      "/signup",
      "/forgot-password",
      "/verify-otp",
      "/reset-password"
    ];

    const checkAuth = async () => {
      try {
        //  ONLY CHECK AUTH FOR PRIVATE ROUTES
        if (!publicRoutes.includes(location.pathname)) {
          const userData = await getCurrentUser();
          dispatch(setUser(userData));
        } else if (publicRoutes.includes(location.pathname)) {
          // If they land on guest routes
          if (isAuthenticated) {
            // REDIRECT them back to their dashboard if they are already logged in
            const target = user?.role === "admin" ? "/admin" : "/dashboard";
            navigate(target, { replace: true });
          } else {
            // Check if they have an active backend session (e.g. after a hard page refresh on landing page)
            try {
              const userData = await getCurrentUser(true);
              if (userData) {
                dispatch(setUser(userData));
                const target = userData.role === "admin" ? "/admin" : "/dashboard";
                navigate(target, { replace: true });
              }
            } catch (err) {
              // Not logged in, let them access guest page
            }
          }
        }
      } catch (err) {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [location.pathname, dispatch, isAuthenticated, navigationType, user, navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/verify-otp" element={<VerifyOTP/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage/>
            </ProtectedRoute>
          }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategory />} />
            <Route path="products" element={<AdminProduct />} />
          </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;