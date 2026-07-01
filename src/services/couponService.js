import api from "../api/axios";

// Fetch all coupons for Admin (with search, page, status, type filters)
export const adminFetchCoupons = (params = {}) => {
  return api.get("admin/coupons/", { params });
};

// Create a new coupon (Admin)
export const adminCreateCoupon = (couponData) => {
  return api.post("admin/coupons/", couponData);
};

// Update an existing coupon (Admin)
export const adminUpdateCoupon = (id, couponData) => {
  return api.put(`admin/coupons/${id}/`, couponData);
};

// Delete a coupon (Admin)
export const adminDeleteCoupon = (id) => {
  return api.delete(`admin/coupons/${id}/`);
};

// Fetch coupons available for the current user's cart (User)
export const userFetchAvailableCoupons = () => {
  return api.get("promotions/coupons/available/");
};

// Validate a coupon code for user's cart (User)
export const userValidateCoupon = (code) => {
  return api.post("promotions/coupons/validate/", { code });
};
