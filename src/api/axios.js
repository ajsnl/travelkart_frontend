import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response &&
      err.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // 🔄 refresh token
        await api.post("/auth/refresh/"); // ✅ trailing slash

        // 🔁 retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.log("Session expired");

        // ❌ logout + redirect
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;