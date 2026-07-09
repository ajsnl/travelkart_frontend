import api from "../api/axios";

// User review APIs
export const fetchReviews = (productId) => {
  return api.get("reviews/user/", { params: { product: productId } });
};

export const checkReviewEligibility = (productId) => {
  return api.get("reviews/user/check/", { params: { product: productId } });
};

export const submitReview = (data) => {
  return api.post("reviews/user/", data);
};

export const updateReview = (reviewId, data) => {
  return api.patch(`reviews/user/${reviewId}/`, data);
};

export const deleteReview = (reviewId) => {
  return api.delete(`reviews/user/${reviewId}/`);
};

// Admin moderation APIs
export const adminFetchReviews = (productId) => {
  return api.get("reviews/admin/", { params: { product: productId } });
};

export const adminToggleReviewStatus = (reviewId, isActive) => {
  return api.patch(`reviews/admin/${reviewId}/`, { is_active: isActive });
};

export const adminDeleteReview = (reviewId) => {
  return api.delete(`reviews/admin/${reviewId}/`);
};
