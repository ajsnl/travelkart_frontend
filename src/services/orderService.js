import api from "../api/axios";
// Place a new order
export const placeOrder = (addressId, paymentMethod = "COD") => {
  return api.post("orders/", { address_id: addressId, payment_method: paymentMethod });
};

export const fetchUserOrders = () => {
  return api.get("orders/");
};

export const fetchOrderDetail = (trackingId) => {
  return api.get(`orders/${trackingId}/`);
};

export const simulateOrderAdvance = (trackingId, status, reason = null, comments = null) => {
  return api.post(`orders/${trackingId}/simulate/`, { status, reason, comments });
};

export const cancelOrderItem = (itemId, quantity, reason = null, comments = null) => {
  return api.post(`orders/items/${itemId}/cancel/`, { quantity, reason, comments });
};

export const returnOrderItem = (itemId, quantity, reason = null, comments = null) => {
  return api.post(`orders/items/${itemId}/return/`, { quantity, reason, comments });
};
