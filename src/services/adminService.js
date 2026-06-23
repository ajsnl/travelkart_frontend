import api from "../api/axios";

//Get users (search + pagination + filters)
export const fetchUsers = (params) => {
  return api.get("admin/users/", { params });
};

export const toggleUserStatus = (userId) => {
  return api.patch(`admin/users/${userId}/block/`, {
    confirm: true,
  });
};

// Get orders (search + pagination + filters)
export const fetchAdminOrders = (params) => {
  return api.get("admin/orders/", { params });
};

// Update order status, payment status, or delivery estimate
export const updateAdminOrderStatus = (trackingId, data) => {
  return api.patch(`admin/orders/${trackingId}/`, data);
};