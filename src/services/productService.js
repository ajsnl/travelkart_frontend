import api from "../api/axios";

// ================= User / Public Endpoints =================

// Fetch products (supports search, page, category, is_featured)
export const fetchProducts = (params) => {
  return api.get("user/products/", { params });
};

// Fetch a single product by ID
export const fetchProductById = (id) => {
  return api.get(`user/products/${id}/`);
};

// Fetch sorted list of unique brands
export const fetchBrands = () => {
  return api.get("user/products/brands/");
};


// ================= Admin Endpoints =================

// Fetch products for admin (supports all filters including is_active)
export const adminFetchProducts = (params) => {
  return api.get("admin/products/", { params });
};

// Fetch a single product by ID for admin
export const adminFetchProductById = (id) => {
  return api.get(`admin/products/${id}/`);
};

// Fetch brands for admin
export const adminFetchBrands = () => {
  return api.get("admin/products/brands/");
};

// Create a new product
export const createProduct = (data) => {
  return api.post("admin/products/", data);
};

// Update an existing product (supports complete nested update)
export const updateProduct = (id, data) => {
  return api.put(`admin/products/${id}/`, data);
};

// Partially update an existing product (e.g. status toggles)
export const patchProduct = (id, data) => {
  return api.patch(`admin/products/${id}/`, data);
};

// Delete a product
export const deleteProduct = (id) => {
  return api.delete(`admin/products/${id}/`);
};

// Upload product or variant media file
export const uploadProductMedia = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("admin/products/upload-media/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
