<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/ZgIframe.1751615607545.js（+ ZgIframe.1751615607545.css，scopeId data-v-82eca9fd）
// 原导出名 → 新名：`Z`（页面里 `import{Z as X}from"./ZgIframe.1751615607545.js"`）→ 本文件 default export。
//   页面侧写法：import ZgIframe from "@shared/ZgIframe.vue"; <ZgIframe labels="..." />
// 入口包导入：`G` → getDictValueByCodeAndItems（入口包里的接口函数，对照表里还没有）。
//   按"接口一律用 @/utils/request"在这里定义并具名导出；入口兼容层补上 `G` 后可改为从 @/legacy 导入。
import { request } from "@/utils/request";

/** 入口包 `G`：按字典码 + 标签取字典项（licenseFree，无需登录） */
export const getDictValueByCodeAndItems = (params: unknown) =>
  request({ url: "/xf-job/job/licenseFree/getDictValueByCodeAndItems", method: "post", params });
</script>

<script setup lang="ts">
import { ref, watch, reactive, onBeforeMount, onMounted } from "vue";

type DictItem = { label: string; value: string; description?: string };

const props = defineProps({
  url: { type: String, default: "" },
  labels: { type: String, default: "" },
});
defineEmits([]);

const iframe = ref(null);

watch(
  () => props.labels,
  () => {
    console.log("----props.labels", props.labels);
    loadUrl();
  },
  { deep: true },
);

const state = reactive({ url: "" });

onBeforeMount(() => {
  if (props.labels) loadUrl();
});
onMounted(() => {});

/** 按 labels 从字典 user_center_zzgj_path 取 iframe 地址；applyDifficulty 用 description 字段 */
const loadUrl = () => {
  getDictValueByCodeAndItems({ dictCode: "user_center_zzgj_path", labels: props.labels }).then((res) => {
    if (res.success)
      (res.result as DictItem[]).map((item) => {
        if (item.label == props.labels) {
          if (item.value == "applyDifficulty") state.url = item.description as string;
          else state.url = item.value;
        }
      });
  });
};
</script>

<template>
  <div class="h100">
    <iframe width="100%" style="height: 100%" ref="iframe" frameborder="0" :src="state.url" id="myFrame"></iframe>
  </div>
</template>

<style scoped>
/* 原样来自 legacy-dist/usercenter/assets/ZgIframe.1751615607545.css（data-v-82eca9fd） */
.h100{height:100%}
</style>
