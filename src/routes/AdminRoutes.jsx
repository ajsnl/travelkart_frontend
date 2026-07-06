import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/AdminRoute";
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCategory from "../pages/admin/AdminCategory";
import AdminProduct from "../pages/admin/AdminProduct";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminCoupons from "../pages/admin/AdminCoupons";
import AdminBanners from "../pages/admin/AdminBanners";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategory />} />
        <Route path="products" element={<AdminProduct />} />
        <Route path ="orders" element={<AdminOrders/>} />
        <Route path="coupons" element={<AdminCoupons/>} />
        <Route path="banners" element={<AdminBanners/>} />
      </Route>
    </Routes>
  );
}
