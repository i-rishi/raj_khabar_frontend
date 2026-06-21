import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    allowedHosts: [
      ".up.railway.app",
      "www.rajkhabar.com",
      "staging.rajkhabar.com"
    ]
  }
});
