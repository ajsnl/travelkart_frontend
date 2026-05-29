import React, { useEffect } from "react";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";

import { Routes, Route, useLocation } from "react-router-dom"; // ✅ useLocation

// Redux
import { useDispatch } from "react-redux";
import { setUser, logout } from "./features/auth/authSlice";

//  Service
import { getCurrentUser } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const dispatch = useDispatch();
  const location = useLocation(); // ✅GET CURRENT ROUTE

  useEffect(() => {
    const publicRoutes = [
  "/",
  "/signup",
  "/forgot-password",
  "/verify-otp",
  "/reset-password"
];

    const checkAuth = async () => {
      try {
        //  ONLY CHECK AUTH FOR PRIVATE ROUTES
        if (!publicRoutes.includes(location.pathname)) {
          const user = await getCurrentUser();
          dispatch(setUser(user));
        }
      } catch (err) {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [location.pathname, dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
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
    </Routes>
  );
}

export default App;