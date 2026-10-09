import { defineConfig } from "vite";
export default defineConfig({
  define: { "process.env.NODE_ENV": '"production"', __VUE_OPTIONS_API__: "true", __VUE_PROD_DEVTOOLS__: "false" },
  build: { lib: { entry: "src/main.js", formats: ["es"], fileName: "vuefp" }, minify: "esbuild", target: "es2015", rollupOptions: { external: [] } },
});
