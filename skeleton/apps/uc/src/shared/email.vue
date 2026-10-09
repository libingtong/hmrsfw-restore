<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/email.1751615607545.js（无 css）
// 注意：原 chunk 是 Vue 组件（defineComponent({name:"Phone",...}) + render 函数，a-input 邮箱输入框），不是校验模块；
//       本体放在 .vue，`email.ts` 只做 default 再导出，`@shared/email` 与 `@shared/email.vue` 都可引用。
// 原导出名 → 新名：`e` → default export
//   页面侧写法：<EmailInput :email="..." name="邮箱" :outputdisabled="..." @checkedEmail="fn" />（回调参数 {email}）
// 入口包导入：`_` → _export_sfc（SFC 不需要）
// 组件 name 原样保留为 "Phone"（原代码如此）。
import { defineComponent, reactive } from "vue";

export default defineComponent({
  name: "Phone",
  props: {
    email: String,
    name: String,
    outputdisabled: String,
  },
  emits: ["checkedEmail"],
  setup(props, { emit }) {
    const queryParam = reactive({ phone: "" });

    function onInput(event) {
      emitEmail(event.target.value);
    }

    const checkedEmail = (event) => {
      console.log("邮箱", event);
      emitEmail(event.target.value);
    };

    function emitEmail(value) {
      emit("checkedEmail", { email: value });
    }

    return { queryParam, props, checkedEmail, onInput };
  },
});
</script>

<template>
  <a-input
    maxlength="30"
    ref="ainput"
    @blur="checkedEmail"
    @input="onInput"
    :value="props.email"
    :disabled="props.outputdisabled"
    :placeholder="'请输入' + props.name"
    oninput="value=value.replace(/[, ]/g,'')"
    onkeyup="value=value.replace(/[, ]/g,'')"
  />
</template>
