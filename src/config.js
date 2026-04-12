// Use Vite env variable if available, else fallback to production URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";
