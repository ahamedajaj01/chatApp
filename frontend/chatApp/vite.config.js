import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // Import the PWA plugin

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),

    ...(mode === "pwa"
      ? [
          VitePWA({
            registerType: "autoUpdate",
            manifest: {
              name: "Chat Application",
              short_name: "ChatApp",
              start_url: "/",
              display: "standalone",
              background_color: "#ffffff",
              theme_color: "#0d6efd",
              icons: [
                {
                  src: "/icon-192.png",
                  sizes: "192x192",
                  type: "image/png",
                  purpose: "any",
                },
                {
                  src: "/icon-512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "any",
                },
              ],
            },
          }),
        ]
      : []),
  ],
}));
