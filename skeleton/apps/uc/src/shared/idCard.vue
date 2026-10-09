<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/idCard.1751615607545.js（无 css）
// 注意：原 chunk 是 Vue 组件（defineComponent({name:"idCard",...}) + render 函数，a-input 证件号输入框），不是纯校验模块；
//       本体放在 .vue，`idCard.ts` 只做 default 再导出，`@shared/idCard` 与 `@shared/idCard.vue` 都可引用。
// 原导出名 → 新名：`i` → default export
//   页面侧写法：<IdCardInput :idCard="..." title="身份证号" :outputdisabled="..." @chekeIdCard="fn" />
//   回调参数 {idCard, birth, age, sex}
// 入口包导入：`o` → parseIdCard(idCard) 返回 {age, sex, birth}（@/legacy，入口兼容层需补）；`_` → _export_sfc（SFC 不需要）
// 原样保留：emits 声明是 ["change","update:value"]，实际抛出的是未声明的 "chekeIdCard"（拼写照旧）。
import { defineComponent, reactive, ref } from "vue";
import { parseIdCard } from "@/legacy";

export default defineComponent({
  name: "idCard",
  props: {
    idCard: String,
    outputdisabled: String,
    competitionsId: String,
    title: String,
  },
  emits: ["change", "update:value"],
  setup(props, { emit }) {
    // 原代码调用了一次 ref() 但没有使用返回值（原样保留）
    ref();
    const queryParam = reactive({ idCard: "" });

    const chekeIdCard = (event) => {
      const info = parseIdCard(event.target.value);
      let payload = { idCard: event.target.value, birth: info.birth, age: info.age, sex: info.sex };
      emit("chekeIdCard" as "change", payload);
    };

    function onInput(event) {
      emitIdCard(event.target.value);
    }

    function emitIdCard(value) {
      const info = parseIdCard(value);
      let payload = { idCard: value, birth: info.birth, age: info.age, sex: info.sex };
      emit("chekeIdCard" as "change", payload);
    }

    return { queryParam, props, chekeIdCard, onInput };
  },
});
</script>

<template>
  <a-input
    maxlength="18"
    ref="idCardref"
    @blur="chekeIdCard"
    @input="onInput"
    :value="props.idCard"
    :disabled="props.outputdisabled"
    :placeholder="'请输入' + props.title"
    oninput="value=value.replace(/[, ]/g,'')"
    onkeyup="value=value.replace(/[, ]/g,'')"
  />
</template>
