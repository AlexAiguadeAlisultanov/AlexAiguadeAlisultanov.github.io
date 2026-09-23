import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

// La API de acceso solo acepta peticiones desde el dominio publicado, asi que en
// desarrollo el navegador las bloquearia. Vite las reenvia desde el servidor, donde no
// hay CORS, y pone el Origin que la API espera. Sigue haciendo falta la contrasena de
// verdad: esto no salta ningun control, solo evita el bloqueo del navegador.
const ACCESO = "https://portfolio-acceso.onrender.com";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwind()],
  server: {
    port: 5199,
    strictPort: true,
    proxy: {
      "/acceso-dev": {
        target: ACCESO,
        changeOrigin: true,
        headers: { Origin: "https://alexaiguadealisultanov.github.io" },
        rewrite: (ruta) => ruta.replace(/^\/acceso-dev/, "")
      }
    }
  },
  build: {
    target: "es2020",
    cssCodeSplit: false,
    reportCompressedSize: true,
    // El trozo de la escena 3D pasa de medio mega sin comprimir y es a proposito: se pide
    // aparte, despues de pintar la pagina, y solo desde un equipo que pueda con ella.
    chunkSizeWarningLimit: 700
  }
});
