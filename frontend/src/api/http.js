import axios from "axios";
import { AUTH_STORAGE_KEY } from "../utils/storage";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const http = axios.create({
  baseURL: `${apiUrl}/api`
});

http.interceptors.request.use((config) => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return config;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  } catch {
    // Ignore local parsing errors.
  }

  return config;
});

export default http;
