<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/phone.1751615607545.js（无 css）
// 注意：原 chunk 是 Vue 组件（defineComponent({name:"phone",...}) + render 函数，a-input 手机号输入框），不是校验模块；
//       本体放在 .vue，`phone.ts` 只做 default 再导出，`@shared/phone` 与 `@shared/phone.vue` 都可引用。
// 原导出名 → 新名：`p` → default export
//   页面侧写法：<PhoneInput :phone="..." name="手机号" :outputdisabled="..." @checkPhone="fn" />（回调参数 {phone}）
// 入口包导入：`_` → _export_sfc（SFC 不需要）
import { defineComponent, reactive } from "vue";

export default defineComponent({
  name: "phone",
  props: {
    phone: String,
    name: String,
    outputdisabled: String,
  },
  emits: ["checkPhone"],
  setup(props, { emit }) {
    const queryParam = reactive({ phone: "" });

    function onInput(event) {
      console.log("监听", event.target.value);
      emitPhone(event.target.value);
    }

    const checkPhone = (event) => {
      emitPhone(event.target.value);
    };

    function emitPhone(value) {
      emit("checkPhone", { phone: value });
    }

    return { queryParam, props, checkPhone, onInput };
  },
});
</script>

<template>
  <a-input
    @blur="checkPhone"
    @input="onInput"
    :value="props.phone"
    :disabled="props.outputdisabled"
    :placeholder="'请输入' + props.name"
    oninput="value=value.replace(/[, ]/g,'')"
    onkeyup="value=value.replace(/[, ]/g,'')"
  />
</template>
