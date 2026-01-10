import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { existsSync, copyFileSync } from "node:fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Check if .env exists, if not, copy from .env.example
  const envPath = path.resolve(process.cwd(), '.env');
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  
  if (!existsSync(envPath) && existsSync(envExamplePath)) {
   
    copyFileSync(envExamplePath, envPath);
   
  }

  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Explicitly define env variables (optional)
    define: {
      // Only if you need to expose non-VITE_ prefixed vars
      // 'process.env': JSON.stringify(env)
    },
  };
});