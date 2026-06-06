import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/AdminRoute";
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminCategory from "../pages/AdminCategory";
import AdminProduct from "../pages/AdminProduct";

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
      </Route>
    </Routes>
  );
}
