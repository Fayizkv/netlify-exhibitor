import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// [https://vite.dev/config/](https://vite.dev/config/)
export default defineConfig(({ mode }) => {
  // Load env vars for the current mode from .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Production: App is hosted at /exhibitor subpath (e.g., testing.eventhex.ai/exhibitor)
    // Development: Keep root for local dev server
    base: '/exhibitor/',
    plugins: [react()],
    server: {
      port: env.PORT ? Number(env.PORT) : 3000,
      host: "0.0.0.0",
      cors: true,
      hmr: {
        host: undefined,
        port: env.PORT ? Number(env.PORT) : 3000,
      },
      watch: {
        usePolling: true,
      },
      allowedHosts: ["*"],
    },
    preview: {
      port: env.PORT ? Number(env.PORT) : 3000,
      host: "0.0.0.0",
      allowedHosts: [
        "event-hex-saad-vite-mzmxq.ondigitalocean.app", 
        "ugaryzt67c.ap-south-1.awsapprunner.com", 
        "worldbiohacksummit.eventhex.ai",
        "6925829fbb1a5babcf559a53.eventhex.ai", 
        "master.d171yad5a2f5g3.amplifyapp.com",
        "netlify-exhibitor.netlify.app"
      ],
    },
    optimizeDeps: {
      exclude: ["js-big-decimal"],
    },
    build: {
      outDir: "build",
      // In production, files will be in build/ but referenced with /exhibitor/ prefix
      // Deploy the entire build/ folder to /exhibitor/ subdirectory on server
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            // Add other large dependencies here
          },
        },
      },
    },
  };
});
