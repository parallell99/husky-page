import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

// Log API base URL in development for debugging
if (import.meta.env.DEV) {
  console.log("API Base URL:", API_BASE_URL);
}

export { API_BASE_URL };

export const postsUrl = () => `${API_BASE_URL}/posts`;
export const postByIdUrl = (id) => `${API_BASE_URL}/posts/${id}`;
export const healthUrl = () => `${API_BASE_URL}/health`;

/** Axios instance with baseURL and optional Bearer token from localStorage */
export function createApiClient() {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  });
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
}

export const apiClient = createApiClient();
