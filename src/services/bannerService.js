import api from "../api/axios";

// Fetch all banners for Admin (with search, status, position filters)
export const adminFetchBanners = (params = {}) => {
  return api.get("admin/banners/", { params });
};

// Create a new banner (Admin) - using FormData for image upload
export const adminCreateBanner = (bannerFormData) => {
  return api.post("admin/banners/", bannerFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Update an existing banner (Admin) - using FormData for image upload support
export const adminUpdateBanner = (id, bannerFormData) => {
  return api.patch(`admin/banners/${id}/`, bannerFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete a banner (Admin)
export const adminDeleteBanner = (id) => {
  return api.delete(`admin/banners/${id}/`);
};

// Fetch active banners for users (with optional position filter)
export const userFetchActiveBanners = (params = {}) => {
  return api.get("promotions/banners/active/", { params });
};
