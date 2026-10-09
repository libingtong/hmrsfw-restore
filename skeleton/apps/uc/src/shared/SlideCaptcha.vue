<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/SlideCaptcha.vue_vue_type_style_index_0_lang.1751615607545.js（+ SlideCaptcha.1751615607545.css，无 scopeId，非 scoped 样式）
// 原 chunk 157KB 的构成：
//   ① 0.15KB~87.9KB：jQuery v3.7.0 完整 UMD 包（ESM 环境下走 `typeof lt=="undefined"` 分支，挂到 window.jQuery / window.$）→ 换成 npm 包 jquery@3.7.0；
//   ② 87.9KB~159.6KB：tianai-captcha 前端 SDK（tac.js，webpack 构建，模块 913/783/618，读全局 jQuery，导出 window.TAC / window.CaptchaConfig）
//      → 不在 npm 上，未复制（见下方 TODO）；
//   ③ 最后约 1.1KB：本组件。
// 原导出名 → 新名：`_`（页面里 `import{_ as X}from"./SlideCaptcha.vue_vue_type_style_index_0_lang.1751615607545.js"`）→ 本文件 default export。
//   页面侧写法：import SlideCaptcha from "@shared/SlideCaptcha.vue"; <SlideCaptcha ref="captchaRef" type="0" @timerCount="fn" />，
//   然后 captchaRef.value.getCatha({ phone, smsmode })。
// 原 chunk 没有其他 ES 导出；唯一的"副作用导出"是全局 window.jQuery / window.$ 与 window.TAC / window.CaptchaConfig，下面保留 jQuery 的全局挂载。
// 入口包导入：`B` → API_BASE（@/utils/request）；`m` → message（ant-design-vue）。
import { reactive, watch, onMounted } from "vue";
import { message } from "ant-design-vue";
import jQuery from "jquery";
import { API_BASE } from "@/utils/request";

// 原 jQuery UMD 在 ESM chunk 里执行时会设置 window.jQuery = window.$；tac.js 依赖全局 jQuery，这里保持同样的副作用。
const globalWin = window as unknown as Record<string, unknown>;
globalWin.jQuery = globalWin.$ = jQuery;

// TODO:restore tianai-captcha 前端 SDK（tac.js，提供 window.TAC）不在 npm 上，按规则没有复制库代码。
//   需要骨架以静态脚本方式提供（必须在上面的 jQuery 挂到 window 之后加载），SDK 自带样式已放在 ./SlideCaptcha.tac.css。
type TacInstance = { destroyWindow(): void; reloadCaptcha(): void };
type TacResult = { code?: number | string; success?: boolean; msg?: string };
type TacConfig = {
  requestCaptchaDataUrl: string;
  validCaptchaUrl: string;
  bindEl: string;
  validSuccess: (res: TacResult, captcha: unknown, tac: TacInstance) => void;
  validFail: (res: TacResult, captcha: unknown, tac: TacInstance) => void;
};
type TacConstructor = new (config: TacConfig) => { init(): void };

const props = defineProps({
  type: { type: String, default: "0" },
  phone: { type: String, default: "" },
  smsmode: { type: String, default: "1" },
});
const emit = defineEmits(["timerCount"]);

const state = reactive({ show: false, show2: false });

watch(
  () => props,
  () => {
    console.log("----------props.phone", props.phone);
    props.phone;
  },
  { deep: true },
);

onMounted(() => {});

/** 打开滑块验证码；验证通过后由后端发送短信（slidesSms） */
const getCatha = (params: { phone: string; smsmode: string }) => {
  state.show = true;
  state.show2 = true;
  let phone = params.phone;
  let smsmode = params.smsmode;
  console.log("-----");
  console.log("-------show2", state.show2);
  const config: TacConfig = {
    requestCaptchaDataUrl: API_BASE + "/xf-common/common/licenseFree/invoice/genCaptcha?type=SLIDER",
    validCaptchaUrl: API_BASE + "/school/user/slidesSms?mobile=" + phone + "&smsmode=" + smsmode,
    bindEl: "#captcha-div",
    validSuccess: (res, _captcha, tac) => {
      state.show = false;
      state.show2 = false;
      tac.destroyWindow();
      if (res.code == 200 && res.success && (res.msg as string).length > 0) message.error(res.msg as string);
      if (props.type == "0") emit("timerCount");
    },
    validFail: (res, _captcha, tac) => {
      console.log("失败", res);
      if (res.code == "403") {
        message.error(res.msg as string);
        state.show = false;
        state.show2 = false;
        emit("timerCount");
        tac.destroyWindow();
      } else {
        tac.reloadCaptcha();
      }
    },
  };
  new (globalWin.TAC as TacConstructor)(config).init();
};

defineExpose({ getCatha });
</script>

<template>
  <div class="fixed">
    <div class="setAb">
      <div id="captcha-div"></div>
    </div>
  </div>
</template>

<style>
/* 原样来自 legacy-dist/usercenter/assets/SlideCaptcha.1751615607545.css（非 scoped）：前段是 tac.js SDK 自带样式（拆到 ./SlideCaptcha.tac.css），以下是组件自己的覆盖规则 */
@import "./SlideCaptcha.tac.css";
.slider-bottom .logo{display:none}#tianai-captcha-parent{margin:auto;left:0;right:0;bottom:0;top:0;position:fixed!important;z-index:10000}#tianai-captcha-parent:before{content:"";position:fixed!important;width:100vw;height:100vh;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:10000}#tianai-captcha,#tianai-captcha .content .tianai-captcha-tips,#tianai-captcha-parent #tianai-captcha-bg-img,#tianai-captcha.tianai-captcha-slider .slider-tip{z-index:10001!important}#tianai-captcha-parent .slider-bottom{position:relative;z-index:10001!important}#tianai-captcha .content #tianai-captcha-loading{z-index:10001!important}#tianai-captcha .content #tianai-captcha-loading img{z-index:10001!important;position:relative}#tianai-captcha-parent #tianai-captcha-box .loading,#tianai-captcha.tianai-captcha-slider{z-index:10001!important}
</style>
