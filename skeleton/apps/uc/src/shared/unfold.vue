<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/unfold.1751615607545.js（+ 同名 css，scopeId data-v-334f6655）
// 原导出名 → 新名：`u`（页面里 `import{u as X}from"./unfold.1751615607545.js"`）→ 本文件 default export
//   页面侧写法：import Unfold from "@shared/unfold.vue"  →  <Unfold :data="text" :max-len="80" tip="全文" />
// 组件 __name:"unfold"；props/emits 名保持原样（无 emits）。
import { reactive, computed } from "vue";

const props = defineProps({
  tip: { type: String, default: "全文" },
  data: { type: String, default: "" },
  maxLen: { type: Number, default: 80 },
});

const state = reactive({ showBtn: true });
// 折叠时显示的前 maxLen 个字符 + "..."
const shortText = computed(() => (props.data != null ? props.data.substring(0, props.maxLen) + "..." : ""));
</script>

<template>
  <span>
    <span v-if="data.length < maxLen">
      <span class="tj">{{ data }}</span>
    </span>
    <span v-else>
      <span class="tj">
        {{ state.showBtn ? shortText : data }}
        <span class="btnWord" @click="state.showBtn = !state.showBtn">{{ state.showBtn ? tip : "收起" }}</span>
      </span>
    </span>
  </span>
</template>

<style scoped>
.tj {
  text-align: justify;
  line-height: 1.8em;
  display: inline-block;
}
.btnWord {
  color: #6495ed;
  cursor: pointer;
  word-break: keep-all;
}
</style>
