<!--
  还原自 legacy-dist/portal/assets/Gigmarketgetjobpost.1783320636200.js（__name: Gigmarketgetjobpost，scopeId data-v-f188f3bf）
  样式来自 Gigmarketgetjobpost.1783320636200.css（同 scopeId）。零工市场"区域"横向滑动页签。
  原导出名 → 新名：`G` → default export；`__tla` 不再需要。
  页面里 `import{G as X,__tla}from"./Gigmarketgetjobpost…js"` 改为 `import Gigmarketgetjobpost from "@shared/Gigmarketgetjobpost.vue"`。
-->
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Navigation, Pagination, Scrollbar } from "swiper";
import { getAppConfig, getDictValueByCodeAndItems, BusinessDictLabels, getAreaInfo, listToTree } from "@/legacy";

const props = defineProps({
  tip: { type: String, default: "" },
  data: { type: String, default: "" },
  maxLen: { type: Number, default: 80 },
});
const emit = defineEmits(["okclick", "update:value"]);

const appConfig = getAppConfig();
const navigation = ref({ nextEl: ".swiper-button-next1", prevEl: ".swiper-button-prev1" });
const modules = [Autoplay, Pagination, Navigation, Scrollbar];

// 区域配置："上级区域id|类型|首个页签名"，默认值原样保留；可被业务字典 guidance_area 覆盖
const areaSetting = reactive({ type: "125|20|省本级" });

onMounted(() => {
  getDictValueByCodeAndItems({ dictCode: appConfig.businessDict, labels: BusinessDictLabels.GUIDANCE_AREA }).then((res: any) => {
    if (res.success) {
      res.result.forEach((item: { label: string; value: string }) => {
        if (item.label == BusinessDictLabels.GUIDANCE_AREA) areaSetting.type = item.value;
      });
    }
    loadTabList();
  });
});

// 原代码里的两个空函数：左右箭头的点击处理（左箭头模板里以 prevClick(item, index) 调用，被压缩器内联成了空表达式）
function prevClick(..._args: unknown[]) {}
function nextClick() {}

const state = reactive({
  tabList: [] as { id: number; num: unknown; name: string }[],
  tabChose: 0,
  tabIndex: 0,
  controlledSwiper: null,
  activeSwiper: 0,
  active: 0,
});

function chooseTab(item: { num: unknown; name: string }, index: number) {
  state.active = index;
  const payload = { value: item.num, label: item.name };
  emit("okclick", payload);
}

function loadTabList() {
  const parts = areaSetting.type.split("|");
  // 原入口导出 `l`（与 `e` getAreaInfo 是同一个接口 xfSysAreainfo/getInfo）
  getAreaInfo({ parentId: parts[0], type: parts[1] }).then((res: any) => {
    const tree = listToTree(res.result);
    const list: { id: number; num: unknown; name: string }[] = [];
    tree.map((node: any, i: number) => {
      list.push({ id: i + 1, num: node.id, name: node.name });
    });
    if (parts[2]) list.unshift({ id: 0, num: 0, name: parts[2] });
    state.tabList = list;
  });
}
</script>

<template>
  <div>
    <div class="searchBox navBox">
      <swiper
        :modules="modules"
        :space-between="30"
        slides-per-view="auto"
        :pagination="{ clickable: true }"
        class="swiperBox"
        :navigation="navigation"
      >
        <swiper-slide
          v-for="(item, index) in state.tabList"
          :class="['pointer', state.active == index ? 'active' : '']"
          :key="index"
          @click="chooseTab(item, index)"
          >{{ item.name }}</swiper-slide
        >
      </swiper>
      <!-- 原文如此：item / index 不在作用域内（编译为 _ctx.item / _ctx.index） -->
      <caret-left-outlined :style="{ fontSize: '20px' }" class="swiper-button-prev1" @click.stop="prevClick(item, index)" />
      <caret-right-outlined :style="{ fontSize: '20px' }" class="swiper-button-next1" @click.stop="nextClick" />
    </div>
  </div>
</template>

<style scoped>
.swiperBox .swiper-slide {
  width: initial;
}
.swiper-button-prev1 {
  position: absolute;
  right: 20px;
  top: 4px;
  left: auto;
}
.swiper-button-next1 {
  position: absolute;
  right: 0;
  top: 4px;
}
.swiper-button-prev1:after {
  content: "";
}
.swiper-button-next1:after {
  content: "";
}
.flexcenter {
  display: flex;
  justify-content: center;
  align-items: center;
}
.navBox {
  width: 100%;
  padding-right: 50px;
  color: #000;
  overflow: hidden;
}
.navBox .tabBox {
  padding: 9px 0;
  border-radius: 4px;
  color: #333;
  font-size: 16px;
  margin: 0 10px;
  float: left;
}
.navBox .tabBox:hover {
  cursor: pointer;
}
.navBox .tabChose {
  color: #1274fb;
}
.navBox .good_city {
  width: 99999px;
  transition: all 0.5s;
}
.navBox .active {
  color: #1274fb;
}
.navBox .contrlBox {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 80px;
}
:deep(.navBox .swiper-horizontal > .swiper-pagination-bullets) {
  display: none;
}
:deep(.navBox .swiper-pagination-bullets.swiper-pagination-horizontal) {
  display: none;
}
:deep(.swiper-button-disabled) {
  color: #00000040 !important;
}
</style>
