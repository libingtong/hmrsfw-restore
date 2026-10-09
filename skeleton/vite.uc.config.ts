import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
const group = process.env.RESTORE_GROUP ?? "a"; // names the dist/ output dir; with RESTORE_GROUP set, @views falls back to the POC layout ../restore-<group>/
// @views: $RESTORE_ROOT (dir holding <app>/src/views) > ../restore-<group>/ when RESTORE_GROUP is set > ../restore/ (repo layout)
const restoreRoot = process.env.RESTORE_ROOT ? path.resolve(process.env.RESTORE_ROOT) : path.resolve(__dirname, process.env.RESTORE_GROUP ? `../restore-${group}` : "../restore");
export default defineConfig({
  plugins: [vue()],
  root: path.resolve(__dirname, "apps/uc"),
  base: "/",
  resolve: { alias: { qrcodejs2: "qrcodejs2-fix", "@": path.resolve(__dirname, "apps/uc/src"), "@views": path.resolve(restoreRoot, "uc/src/views"), "@shared": path.resolve(__dirname, "apps/uc/src/shared") } },
  cacheDir: path.resolve(__dirname, ".vite"), // keep vite's cache out of node_modules, which setup-workdir may symlink to a shared cache
  envDir: __dirname, // .env / .env.local 放在 skeleton/，两个应用共用（加解密密钥见 .env.example）
  build: { outDir: path.resolve(__dirname, `dist/uc-${group}`), emptyOutDir: true, sourcemap: false },
  server: { port: 5175 },
});
