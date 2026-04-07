import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';
import { Platform } from 'react-native';

// 👉 Live Render Deployment URL
const RENDER_URL = 'https://multi-level-authentication2.onrender.com';

// 👉 Use Render URL for production
export const BASE_URL = `${RENDER_URL}/api`;

// 👉 Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // safety timeout for heavy face scans (2 min)
});

// 👉 Request interceptor (attach token)
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 👉 Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error?.toJSON?.() || error);

    if (error.response) {
      // Server responded
      if (error.response.status === 401) {
        store.dispatch(logout());
      }
    } else if (error.request) {
      // Request made but no response
      console.log("Network Error: Server not reachable");
    } else {
      console.log("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;