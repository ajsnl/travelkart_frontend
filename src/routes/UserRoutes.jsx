import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/LoginPage";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/Dashboard";
import ProfilePage from "../pages/ProfilePage";
import Categories from "../pages/Categories";
import ProductDetail from "../pages/ProductDetail";
import ProtectedRoute from "../components/ProtectedRoute";

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/categories" element={<Categories />} />
      <Route path="/shop" element={<Categories />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  );
}
