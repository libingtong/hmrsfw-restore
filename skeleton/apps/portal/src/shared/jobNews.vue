<!--
  还原自 legacy-dist/portal/assets/jobNews.1783320636200.js（+ 同名 .css，scopeId data-v-1bbf6d04）
  原导出名 → 新名：`default`（<script setup> 组件 __name:"jobNews"，新闻列表卡片）→ default export；
  页面里 `import X from "./jobNews.1783320636200.js"` 改为 `import JobNews from "@shared/jobNews.vue"`。
  注意：legacy-dist 里还有同名的 jobNews.17833206362002.js（另一份同名组件，scopeId 不同），不在本文件范围内。
-->
<script setup lang="ts">
import { onMounted, type PropType } from "vue";
import dayjs from "dayjs";
import { openArticle } from "@/legacy";
import Empty from "@shared/empty.vue";

// 原 props 只声明了 { list: { type: Array, default: [] } }；这里补的类型只用于模板取值，不改运行时行为
interface NewsItem {
  publishTime?: string;
  title?: string;
  times?: number;
  [key: string]: unknown;
}

const props = defineProps({
  list: { type: Array as PropType<NewsItem[]>, default: [] },
});

// 原组件注册了一个空的 async onMounted，原样保留
onMounted(async () => {});
</script>

<template>
  <div v-if="props.list.length !== 0" class="flex flex-wrap">
    <div
      v-for="(item, index) in props.list"
      :key="index"
      class="newsItem pointer relative"
      @click="openArticle(item)"
    >
      <div class="newsDate radius10">
        <!-- <i> 与日期文本之间原本没有空白节点，保持同一行以免 condense 产生前导空格 -->
        <div class="font-28 relative"><i class="line"></i>{{ dayjs(item?.publishTime).format("DD") }}</div>
        <div>{{ dayjs(item?.publishTime).format("YYYY-MM") }}</div>
      </div>
      <div class="padL20 w80">
        <div class="font-18 ellipsis u-58 marT10" :title="item.title">{{ item.title }}</div>
        <div class="font-16 u-9">{{ item.times || 0 }}次浏览</div>
      </div>
    </div>
  </div>
  <Empty v-else />
</template>

<style scoped>
.newsItem {
  width: 49%;
  display: flex;
  flex-wrap: wrap;
  margin-right: 2%;
  align-items: center;
  margin-bottom: 20px;
}
.newsItem:hover .u-58 {
  color: var(--xf-default-color);
}
.newsDate {
  width: 74px;
  height: 78px;
  background: linear-gradient(90deg, #1274fb, #5ba0ff);
  color: #fff;
  text-align: center;
}
.newsItem:nth-child(2n + 2) {
  margin-right: 0;
}
.line {
  display: block;
  opacity: 0.6;
  width: 70%;
  height: 1px;
  background-color: #fff;
  position: absolute;
  bottom: 0;
  left: 15%;
}
</style>
