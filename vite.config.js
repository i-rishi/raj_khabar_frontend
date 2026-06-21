import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    allowedHosts: [
      "raj-khabar-frontend-production.up.railway.app",
      "raj-khabar-frontend-staging-ikg8-production.up.railway.app",
      "www.rajkhabar.com",
      "staging.rajkhabar.com"
    ]
  }
});
