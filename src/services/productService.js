import api from "../api/axios";

// Fetch products (supports search, page, category, is_active, is_featured)
export const fetchProducts = (params) => {
  return api.get("products/products/", { params });
};

// Fetch a single product by ID
export const fetchProductById = (id) => {
  return api.get(`products/products/${id}/`);
};

// Create a new product
export const createProduct = (data) => {
  return api.post("products/products/", data);
};

// Update an existing product (supports complete nested update)
export const updateProduct = (id, data) => {
  return api.put(`products/products/${id}/`, data);
};

// Partially update an existing product (e.g. status toggles)
export const patchProduct = (id, data) => {
  return api.patch(`products/products/${id}/`, data);
};

// Delete a product
export const deleteProduct = (id) => {
  return api.delete(`products/products/${id}/`);
};

// Upload product or variant media file
export const uploadProductMedia = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("products/upload-media/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Fetch sorted list of unique brands
export const fetchBrands = () => {
  return api.get("products/products/brands/");
};
