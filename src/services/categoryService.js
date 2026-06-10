import api from "../api/axios";

// ================= User / Public Endpoints =================

// Fetch categories (supports search, page, and other query parameters)
export const fetchCategories = (params) => {
  return api.get("user/categories/", { params });
};


// ================= Admin Endpoints =================

// Fetch categories for admin
export const adminFetchCategories = (params) => {
  return api.get("admin/categories/", { params });
};

// Create a new category
export const createCategory = (data) => {
  return api.post("admin/categories/", data);
};

// Update an existing category (supports complete update or patch)
export const updateCategory = (id, data) => {
  return api.patch(`admin/categories/${id}/`, data);
};

// Delete a category (which is soft-deleted on the backend)
export const deleteCategory = (id) => {
  return api.delete(`admin/categories/${id}/`);
};
