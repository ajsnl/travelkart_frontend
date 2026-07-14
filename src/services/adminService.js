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

export const fetchAdminOrders = (params) => {
  return api.get("admin/orders/", { params });
};

export const updateAdminOrderStatus = (trackingId, data) => {
  return api.patch(`admin/orders/${trackingId}/`, data);
};

export const fetchNotifications = () => {
  return api.get("admin/notifications/");
};

export const markNotificationsAsRead = () => {
  return api.post("admin/notifications/read_all/");
};

export const approveItemReturn = (itemId) => {
  return api.post(`admin/order-items/${itemId}/approve-return/`);
};

export const rejectItemReturn = (itemId) => {
  return api.post(`admin/order-items/${itemId}/reject-return/`);
};

export const fetchDashboardStats = (params) => {
  return api.get("admin/dashboard-stats/", { params });
};

export const fetchSalesReport = (params) => {
  return api.get("admin/sales-report/", { params });
};