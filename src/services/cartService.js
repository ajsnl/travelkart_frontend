import api from "../api/axios";

// Fetch user's cart
export const fetchCart = () => {
  return api.get("cart/");
};

// Add item to cart
export const addToCart = (variantId, quantity) => {
  return api.post("cart/", { variant_id: variantId, quantity });
};

// Update item quantity in cart
export const updateCartItem = (variantId, quantity) => {
  return api.post("cart/update-item/", { variant_id: variantId, quantity });
};

// Remove item from cart
export const removeCartItem = (variantId) => {
  return api.post("cart/remove-item/", { variant_id: variantId });
};

// Clear all items from cart
export const clearCart = () => {
  return api.post("cart/clear/");
};
