import axios from "axios";



const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // 
});

// CSRF config
api.defaults.xsrfCookieName = "csrftoken";
api.defaults.xsrfHeaderName = "X-CSRFToken";

// Request interceptor to ensure CSRF cookie is present before state-changing requests
let csrfRequestPromise = null;

const fetchCsrfToken = () => {
  if (!csrfRequestPromise) {
    // Use the clean global axios instance to bypass custom interceptors and prevent deadlock/recursion
    csrfRequestPromise = axios.get("http://localhost:8000/api/auth/csrf/", { withCredentials: true })
      .catch((err) => {
        console.error("Error fetching CSRF token", err);
      })
      .finally(() => {
        csrfRequestPromise = null;
      });
  }
  return csrfRequestPromise;
};

api.interceptors.request.use(
  async (config) => {
    const method = config.method ? config.method.toLowerCase() : "";
    const stateChangingMethods = ["post", "put", "delete", "patch"];

    if (stateChangingMethods.includes(method)) {
      // Check if csrf cookie is present
      const hasCsrfToken = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("csrftoken="));

      if (!hasCsrfToken) {
        await fetchCsrfToken();
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❌ if no response
    if (!error.response) return Promise.reject(error);

    const url = originalRequest.url;

    //  SKIP THESE APIs
    if (
      url.includes("auth/login") ||
      url.includes("auth/refresh") ||
      url.includes("auth/signup")
    ) {
      return Promise.reject(error);
    }

    // only handle 401
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    //  already retried
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    //  prevent multiple refresh calls
    if (isRefreshing) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log(" Trying refresh...");

      await api.post("/auth/refresh/");

      isRefreshing = false;

      console.log(" Refresh success");

      return api(originalRequest);

    } catch (err) {
      isRefreshing = false;

      console.log(" Refresh failed → redirect login");

      // Prevent infinite redirect loops if the user is already on the login page ("/" or "/login")
      if (window.location.pathname !== "/" && window.location.pathname !== "/login") {
        window.location.href = "/";
      }

      return Promise.reject(err);
    }
  }
);
export default api;