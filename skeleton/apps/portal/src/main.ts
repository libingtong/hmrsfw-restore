import { createApp } from "vue";
import Antd from "ant-design-vue";
import * as AntIcons from "@ant-design/icons-vue";
import App from "./App.vue";
import { registerDirectives } from "./directives";
import CusPagination from "./legacy/CusPagination.vue";
import { router } from "./router";
import { store } from "./store";
import "./legacy.css"; // the original entry stylesheet (antd + global app styles), copied from legacy-dist
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "swiper/css/scrollbar";
import "swiper/css/grid";

// tenant config exactly like /config.js does on the original site
fetch("/config.js").then((r) => r.text()).catch(() => "").finally(() => {
  if (!sessionStorage.getItem("appConfig")) {
    sessionStorage.setItem("appConfig", JSON.stringify({ appCode: "018", appName: "哈密公共就业服务网", routerFile: "router-xjhm.json", "--xf-default-color": "#1274FB", "--xf-default-add-color": "#0C68E6", "--xf-default-reduce1-color": "#d3e7ff", "--xf-default-reduce2-color": "#e7f1ff", businessDict: "job_pc_common_xjhm", newsDict: "job_currency_news", showCityList: false, sld: "" }));
  }
  const app = createApp(App);
  for (const [name, comp] of Object.entries(AntIcons)) if (/^[A-Z]\w+(Outlined|Filled|TwoTone)$/.test(name)) app.component(name, comp as any); // the original registers the icon set globally (<right-outlined> etc.)
  registerDirectives(app);
  app.component("cus-pagination", CusPagination); // global component of the original entry
  app.use(Antd).use(router).use(store);
  app.mount("#app");
});
