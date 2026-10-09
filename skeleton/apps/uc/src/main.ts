import { createApp } from "vue";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
import * as AntIcons from "@ant-design/icons-vue";
import App from "./App.vue";
import City from "./shared/city.vue";
import BaiduMap from "vue-baidu-map-3x"; // the original entry inlines this library and registers it globally
import { registerDirectives } from "./directives";
import { router } from "./router";
import { store } from "./legacy/store";
import "./legacy.css"; // the original user-center entry stylesheet, copied from legacy-dist

const app = createApp(App);
for (const [name, comp] of Object.entries(AntIcons)) if (/^[A-Z]\w+(Outlined|Filled|TwoTone)$/.test(name)) app.component(name, comp as any); // the original registers the icon set globally
registerDirectives(app);
app.use(createPinia()).use(store).use(Antd).use(router); // 原入口同时装了 pinia 和 vuex store（入口导出 `b` = useStore 依赖它）
app.component("city", City);
app.use(BaiduMap, { ak: import.meta.env.VITE_BMAP_AK ?? "" }); // map key from the environment, never in source // the original entry registers the area picker globally (app.component("city", Amt))
app.mount("#app");
