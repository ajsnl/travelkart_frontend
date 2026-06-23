import api from "../api/axios";
// Place a new order
export const placeOrder = (addressId, paymentMethod = "COD") => {
  return api.post("orders/", { address_id: addressId, payment_method: paymentMethod });
};
// Fetch order history for the logged-in user
export const fetchUserOrders = () => {
  return api.get("orders/");
};
// Fetch order details by tracking ID
export const fetchOrderDetail = (trackingId) => {
  return api.get(`orders/${trackingId}/`);
};
// Simulate advancing/updating order status

export const simulateOrderAdvance = (trackingId, status, reason = null, comments = null) => {
  return api.post(`orders/${trackingId}/simulate/`, { status, reason, comments });
};

// Cancel an individual order item or quantity
export const cancelOrderItem = (itemId, quantity, reason = null, comments = null) => {
  return api.post(`orders/items/${itemId}/cancel/`, { quantity, reason, comments });
};

// Return an individual order item or quantity
export const returnOrderItem = (itemId, quantity, reason = null, comments = null) => {
  return api.post(`orders/items/${itemId}/return/`, { quantity, reason, comments });
};
