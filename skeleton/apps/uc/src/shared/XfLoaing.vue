<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/XfLoaing.1751615607545.js（+ XfLoaing.1751615607545.css，无 scopeId，非 scoped 样式）
// 原导出名 → 新名：`_`（页面里 `import{_ as X}from"./XfLoaing.1751615607545.js"`）→ 本文件 default export。
//   页面侧写法：import XfLoaing from "@shared/XfLoaing.vue"; <XfLoaing :show="loading" text="处理中..." />
// 组件名原样保留（XfLoaing，原拼写）。

/** 原 chunk 里的图片地址常量（Vite 输出的静态资源路径，原样保留） */
const loadingGif = "/assets/loading2.1751615607545.gif";

defineProps({
  show: { type: Boolean, default: false },
  text: { type: String, default: "处理中..." },
  showText: { type: Boolean, default: true },
});
</script>

<template>
  <div v-show="show" class="p-fixed u-3">
    <img class="img-size" :src="loadingGif" alt="" />
    <p v-if="showText" class="u-y loading-text textCenter font-16">{{ text }}</p>
  </div>
</template>

<style>
/* 原样来自 legacy-dist/usercenter/assets/XfLoaing.1751615607545.css（非 scoped） */
.p-fixed{position:fixed;width:100%;height:100%;z-index:100;top:0;text-align:center;background:rgba(255,255,255,.5);color:#333;padding-top:16%;box-sizing:border-box}.img-size{transform:scale(.6)}.loading-text{margin-top:-100px;font-weight:400;text-align:center;margin-left:10px}.u-y{color:#1274fb}
</style>
