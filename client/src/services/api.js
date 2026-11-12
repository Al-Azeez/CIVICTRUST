import axios from "axios";

// Deployed backend URL on Vercel. Falls back to the local Vite proxy in development.
const API_URL = import.meta.env.VITE_API_URL || "/api";

if (!import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL is not set. API requests will go to the frontend domain.");
}

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the saved login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("civictrust_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
export default api;