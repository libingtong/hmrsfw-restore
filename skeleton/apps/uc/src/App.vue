<script setup lang="ts">
// POC shell: only the page component is rendered, in a 1652px column like the original layout content area (.overscoll > div). The original wraps the app in a-config-provider with the zh_CN locale.
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { provide } from "vue";
import { getDictItemsByCode } from "@/legacy";

// the original layout provides reload() to pages (re-render the routed page); a no-op is enough for the POC
provide("reload", () => {});

// Restored from the original root component's setup (entry chunk index.1751615607545.js):
// 1) rem base: html font-size = 100 * (clientWidth / 1920), capped at 100px, on resize/orientation change;
// 2) multi-tenant bootstrap: load /config.json, pick the entry for currentAppCode and expose it as
//    window.businessDict / window.appModel (shared components such as the area picker read them), then cache the
//    tenant's value from the "job_manager_common" dictionary in localStorage under its appCode.
interface TenantConfig { appCode: string; appName?: string; businessDict: string }
interface ConfigFile { currentAppCode: string; data: TenantConfig[] }
type DictItem = { text: string; value: string };
const tenantWindow = window as unknown as { businessDict?: string; appModel?: TenantConfig };

const html = document.documentElement;
const resizeEvent = "orientationchange" in window ? "orientationchange" : "resize";
const setRemBase = () => {
  const width = html.clientWidth;
  if (!width) return;
  const size = 100 * (width / 1920);
  html.style.fontSize = (size < 100 ? size : 100) + "px";
};
window.addEventListener(resizeEvent, setRemBase, false);
document.addEventListener("DOMContentLoaded", setRemBase, false);

// The original builds the URL as `location.href.split("/")[0] + "/config.json"` ("http:/config.json"), which the
// browser resolves against the current origin; "/config.json" is the same request. (The "zzgj" build variant read
// /xfusercenter/config.json instead; that branch is dead in this build.)
const xhr = new XMLHttpRequest();
xhr.open("get", "/config.json");
xhr.send(null);
xhr.onload = () => {
  if (xhr.status !== 200) return;
  const config = JSON.parse(xhr.responseText) as ConfigFile;
  const current = config.data.filter((item) => item.appCode == config.currentAppCode)[0];
  tenantWindow.businessDict = current.businessDict;
  tenantWindow.appModel = current;
  const appCode = tenantWindow.appModel ? tenantWindow.appModel.appCode : "";
  getDictItemsByCode({ dictCode: "job_manager_common" }).then((res) => {
    const r = res as { success?: boolean; result?: DictItem[] };
    if (r.success) r.result?.forEach((item) => { if (item.text == appCode) localStorage.setItem(item.text, item.value); });
  });
};
</script>

<template>
  <a-config-provider :locale="zhCN">
    <main class="poc-main" id="poc-main" style="width: 1652px">
      <router-view />
    </main>
  </a-config-provider>
</template>
