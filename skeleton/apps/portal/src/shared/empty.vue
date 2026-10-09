<!--
  还原自 legacy-dist/portal/assets/empty.1783320636200.js（+ 同名 .css，scopeId data-v-810a04d0）
  原导出名 → 新名：`e`（组件 "ecs-nodata"）→ default export；页面里 `import{e as X}from"./empty…js"` 改为 `import Empty from "@shared/empty.vue"`
  原组件是 defineComponent({ name:"ecs-nodata", props, setup(){ return { getImageUrl, props, imgURL } } }) + 独立 render。
-->
<script setup lang="ts">
import { computed, onBeforeMount, onMounted } from "vue";
import { useStore } from "@/legacy";
import { API_BASE, STATIC_BASE } from "@/utils/request";

defineOptions({ name: "ecs-nodata" });

const props = defineProps({
  icon: String,
  // 原文如此：写的是 `require`（非 `required`），对 Vue 无效，原样保留
  text: { require: true },
  textColor: { type: String, default: "333" },
  imgW: { default: "175px" },
  imgH: { default: "95px" },
  imageUrl: String,
  description: String,
});

const store = useStore();

// 原逻辑：store.getters.noDataImg 有值时拼接 `${API_BASE}${STATIC_BASE}/${noDataImg}`，否则空串（走模板里的默认图分支）
const imgURL = computed(() => (store.getters.noDataImg ? `${API_BASE}${STATIC_BASE}/${store.getters.noDataImg}` : ""));

// 原组件注册了两个空钩子，原样保留
onBeforeMount(() => {});
onMounted(() => {});

// 原 setup 暴露给模板但模板未使用；原实现直接返回空串
function getImageUrl(_url?: unknown) {
  return "";
}
defineExpose({ getImageUrl });
</script>

<template>
  <div class="zwsj">
    <a-empty
      v-if="imgURL"
      :image="imgURL"
      :description="props.description"
      :style="{ color: '#' + props.textColor }"
    />
    <a-empty
      v-else
      image="/resource/nodata.png"
      :description="props.description"
      :style="{ color: '#' + props.textColor }"
    />
  </div>
</template>

<style scoped>
.zwsj {
  padding: 70px 0;
  text-align: center;
}
.zwsj img {
  width: 250px;
  height: 200px;
}
</style>
