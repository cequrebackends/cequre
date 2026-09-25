import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { fileRoutes } from "filesystem-routing/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    solid({
      start: {
        devtools: false,
      },
      ssr: true,
      serverFunctions: true,
    }),
    fileRoutes({ types: true }),
  ],
  server: {
    port: 5173,
  },
});
