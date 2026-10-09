import { defineConfig } from "vite";
// The original apps bundled the patched fork qrcodejs2-fix@0.0.1 ("this && this._android" guard, safe in strict ESM); "qrcodejs2" is aliased to it.
import vue from "@vitejs/plugin-vue";
import path from "node:path";
const group = process.env.RESTORE_GROUP ?? "a"; // names the dist/ output dir; with RESTORE_GROUP set, @views falls back to the POC layout ../restore-<group>/
// @views: $RESTORE_ROOT (dir holding <app>/src/views) > ../restore-<group>/ when RESTORE_GROUP is set > ../restore/ (repo layout)
const restoreRoot = process.env.RESTORE_ROOT ? path.resolve(process.env.RESTORE_ROOT) : path.resolve(__dirname, process.env.RESTORE_GROUP ? `../restore-${group}` : "../restore");
export default defineConfig({
  plugins: [vue()],
  root: path.resolve(__dirname, "apps/portal"),
  base: "/",
  resolve: { alias: { qrcodejs2: "qrcodejs2-fix", "@ant-design/icons-svg": path.resolve(__dirname, "node_modules/icons-svg-portal") /* portal was built with icons-svg 4.2.x (older CloseOutlined path); the user center with 4.3+ */, "@": path.resolve(__dirname, "apps/portal/src"), "@views": path.resolve(restoreRoot, "portal/src/views"), "@shared": path.resolve(__dirname, "apps/portal/src/shared") } },
  cacheDir: path.resolve(__dirname, ".vite"), // keep vite's cache out of node_modules, which setup-workdir may symlink to a shared cache
  envDir: __dirname, // .env / .env.local 放在 skeleton/，两个应用共用（加解密密钥见 .env.example）
  build: { outDir: path.resolve(__dirname, `dist/portal-${group}`), emptyOutDir: true, sourcemap: false },
  server: { port: 5174 },
});
