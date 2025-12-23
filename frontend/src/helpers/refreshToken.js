import axios from "axios";
import { store } from "../store/store.js";
import { logout } from "../store/Slices/authSlice.js";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_USERS,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
}

function waitForTokenRefresh() {
  return new Promise(resolve => {
    subscribeTokenRefresh(resolve);
  });
}

// ✅ Helper: performs refresh using *plain axios*, not `api`
async function performTokenRefresh() {
  try {
    const refreshResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL_USERS}/refresh-token`, {
      withCredentials: true,
    });

    

    return refreshResponse;
  } catch (err) {
    store.dispatch(logout());
    throw err;
  }
}

// ✅ Unified interceptor
api.interceptors.response.use(
  async (response) => {
    const originalRequest = response.config;

    // Handle logical "unauthorized" inside 200 responses
    if (
      response.data?.success === false &&
      (response.data.reason === "Unauthorized request" ||
        response.data.reason === "Invalid AccessToken") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // wait if another refresh is in progress
      if (isRefreshing) {
        await waitForTokenRefresh();
        return api(originalRequest);
      }

      isRefreshing = true;
      try {
        await performTokenRefresh();
        isRefreshing = false;
        onRefreshed();
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        return Promise.reject(err);
      }
    }

    // Normal success
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle true 401 responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        await waitForTokenRefresh();
        return api(originalRequest);
      }

      isRefreshing = true;
      try {
        await performTokenRefresh();
        isRefreshing = false;
        onRefreshed();
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
