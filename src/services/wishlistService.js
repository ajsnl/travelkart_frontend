import api from "../api/axios";

// Fetch wishlist items (supports page pagination and sorting ordering)
export const fetchWishlistItems = (params) => {
  return api.get("wishlist/", { params });
};

// Toggle wishlist status for a product (adds if not present, removes if present)
export const toggleWishlistItem = (productId) => {
  return api.post("wishlist/toggle/", { product_id: productId });
};
