<!--
  还原自 legacy-dist/portal/assets/qrcode.vue_vue_type_script_setup_true_name_demoView_lang.1783320636200.js（无 CSS，无 scopeId）
  chunk 内联了 davidshimjs/qrcodejs（npm 包 qrcodejs2@0.0.2：QR8bitByte UTF-8 处理、"Scan me!" 图片、useSVG 选项、"Too long data" 报错一致），
  这里改为从 npm 导入，不复制库代码。
  原导出名 → 新名：`_`（组件 "demoView"）→ default export；`__tla`（等待入口包的顶层 await）不再需要。
  页面里 `import{_ as X,__tla}from"./qrcode.vue_vue_type…js"` 改为 `import QrCode from "@shared/qrcode.vue"`。
-->
<script setup lang="ts">
import { nextTick, onMounted } from "vue";
// qrcodejs2 是 UMD/CommonJS 包，无类型声明
// @ts-ignore
import QRCode from "qrcodejs2";

defineOptions({ name: "demoView" });

const props = defineProps({
  text: { type: String, default: "" },
  width: { type: Number, default: 100 },
  height: { type: Number, default: 100 },
  index: { type: Number, default: 1 },
  showTitle: { type: Boolean, default: true },
  level: { type: String, default: "H" },
});

onMounted(() => {
  createQrCode();
  nextTick(() => {
    const box = document.getElementById("qrCodeBox" + props.index);
    // qrcodejs 会把 text 写到容器的 title 上；showTitle=false 时清掉
    if (box) props.showTitle || box.setAttribute("title", "");
  });
});

const createQrCode = () => {
  document.getElementById("qrCodeBox" + props.index)!.innerHTML = "";
  new QRCode(document.getElementById("qrCodeBox" + props.index), {
    text: props.text,
    width: props.width,
    height: props.height,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: props.level == "L" ? QRCode.CorrectLevel.L : QRCode.CorrectLevel.H,
  });
};
</script>

<template>
  <div :id="'qrCodeBox' + props.index"></div>
</template>
