import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
   }
  const hostname = window.location.hostname;
  if (hostname.includes("devtunnels.ms")) {
    const newHostname = hostname.replace("-5173", "-8000");
    return `https://${newHostname}`;
  }
  if (hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.includes("devtunnels.ms")) {
    return `http://${hostname}:8000`;
  }
  return "http://localhost:8000";
};

export const BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

// CSRF config
api.defaults.xsrfCookieName = "csrftoken";
api.defaults.xsrfHeaderName = "X-CSRFToken";

// Request interceptor to ensure CSRF cookie is present before state-changing requests
let csrfRequestPromise = null;

const fetchCsrfToken = () => {
  if (!csrfRequestPromise) {
    // Use the clean global axios instance to bypass custom interceptors and prevent deadlock/recursion
    csrfRequestPromise = axios.get(`${BASE_URL}/api/auth/csrf/`, { withCredentials: true })
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
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
      };

      let csrfToken = getCookie("csrftoken");

      if (!csrfToken) {
        await fetchCsrfToken();
        csrfToken = getCookie("csrftoken");
      }

      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    //  if no response
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

    //  prevent multiple refresh calls by queueing concurrent requests
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            resolve(api(originalRequest));
          },
          reject: (err) => {
            reject(err);
          }
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log(" Trying refresh...");

      await api.post("/auth/refresh/");

      isRefreshing = false;

      console.log(" Refresh success");
      processQueue(null);

      return api(originalRequest);

    } catch (err) {
      isRefreshing = false;
      processQueue(err);

      console.log(" Refresh failed → redirect login");

      // Prevent infinite redirect loops or if skipAuthRedirect config is set to true
      if (
        !originalRequest.skipAuthRedirect &&
        window.location.pathname !== "/" && 
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/";
      }

      return Promise.reject(err);
    }
  }
);
export default api;