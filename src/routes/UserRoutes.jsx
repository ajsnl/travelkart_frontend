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
import Wishlist from "../pages/Wishlist";
import Cart from "../pages/Cart";
import ProtectedRoute from "../components/ProtectedRoute";
import Checkout from "../pages/Checkout";
import OrderTracking from "../pages/OrderTracking";
import MyOrders from "../pages/MyOrders";
import PaymentError from "../pages/PaymentError";
import PlaceholderPage from "../pages/PlaceholderPage";




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
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route 
       path="/checkout"
       element={
        <ProtectedRoute>
          <Checkout/>
        </ProtectedRoute>
       }
      />
      <Route 
       path="/payment-error"
       element={
        <ProtectedRoute>
          <PaymentError/>
        </ProtectedRoute>
       }
      />
      
      <Route
        path="/order-tracking/:trackingId"
        element={
          <ProtectedRoute>
            <OrderTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />


      <Route path="/categories" element={<Categories />} />
      <Route path="/shop" element={<Categories />} />
      <Route path="/product/:id" element={<ProductDetail />} />
       {/* Footer corporate links mapping */}
      <Route path="/help" element={<PlaceholderPage />} />
      <Route path="/returns" element={<PlaceholderPage />} />
      <Route path="/about" element={<PlaceholderPage />} />
      <Route path="/privacy" element={<PlaceholderPage />} />
      <Route path="/terms" element={<PlaceholderPage />} />
    </Routes>
  );
}
