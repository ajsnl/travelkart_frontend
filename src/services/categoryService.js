import api from "../api/axios";

// Fetch categories (supports search, page, and other query parameters)
export const fetchCategories = (params) => {
  return api.get("products/categories/", { params });
};

// Create a new category
export const createCategory = (data) => {
  return api.post("products/categories/", data);
};

// Update an existing category (supports complete update or patch)
export const updateCategory = (id, data) => {
  return api.patch(`products/categories/${id}/`, data);
};

// Delete a category (which is soft-deleted on the backend)
export const deleteCategory = (id) => {
  return api.delete(`products/categories/${id}/`);
};
