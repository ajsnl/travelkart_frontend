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

export const simulateOrderAdvance = (trackingId, status) => {
  return api.post(`orders/${trackingId}/simulate/`, { status });
};

// Cancel an individual order item or quantity
export const cancelOrderItem = (itemId, quantity) => {
  return api.post(`orders/items/${itemId}/cancel/`, { quantity });
};

// Return an individual order item or quantity
export const returnOrderItem = (itemId, quantity) => {
  return api.post(`orders/items/${itemId}/return/`, { quantity });
};
