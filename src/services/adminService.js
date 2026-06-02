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