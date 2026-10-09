// 入口安装的 vuex store（原局部名 jht，`app.use(store)`）；入口导出 `b` 即 vuex 的 useStore。
import { createStore } from "vuex";

type Label = { name: string; path: string; title: unknown };
export const store = createStore({
  state: { labelDataList: [] as Label[], routemenu: [] as unknown[], menu: [] as unknown[], radiotype: "", headeradio: [] as unknown[], websiteInfo: {} as Record<string, unknown> },
  mutations: {
    setWebsiteInfo(t, e) { t.websiteInfo = e; },
    setMenu(t, e) { t.menu = e; },
    setRadio(t, e) { t.radiotype = e; },
    setHeaderadio(t, e) { t.headeradio = e; },
    setLabelDataList(t, e) { t.labelDataList.find((r) => r.name == e.name) || t.labelDataList.push({ name: e.name, path: e.path, title: e.meta.title }); },
    setDeleteLabelDataList(t, e) { console.log(e); t.labelDataList.splice(e, 1); },
  },
  actions: {},
  getters: { getMenu: (t) => t.menu, getRoutemenu: (t) => t.routemenu },
});
