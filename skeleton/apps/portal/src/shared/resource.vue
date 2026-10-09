<script setup lang="ts">
// 还原自 legacy-dist/portal/assets/resource.17833206362004.js（__name: resource，scopeId data-v-7b192e04）
// 样式来自 resource.17833206362002.css（同 scopeId；同名的 resource.17833206362004.css 是另一个版本 data-v-55933612）。
// 首页"资源 / 专题"图片轮播（swiper，每屏 2 张，11 秒自动翻页）。
import { reactive, ref, computed, onBeforeMount, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Navigation, Scrollbar } from "swiper";
import { openArticle } from "@/legacy";
import { API_BASE, STATIC_BASE } from "@/utils/request";
import Empty from "@shared/empty.vue";

const props = defineProps({
  list: { type: Array as () => any[], default: [] },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  imgH: { type: Number, default: 275 },
  imgW: { type: Number, default: 590 },
});
defineEmits([]);

useRoute(); // 原代码调用了 useRoute()/useRouter() 但未使用返回值
useRouter();
onBeforeMount(() => {});
onMounted(() => {});
onBeforeUnmount(() => {
  if (state.timer) clearInterval(state.timer);
});
// 原代码创建了这个 computed 但没有接收返回值（未使用），原样保留
computed(() => {
  let remainder = props.total % 2,
    half = Math.floor(props.total / 2);
  return remainder == 0 ? half : half + 1;
});

// 原变量 t
const state = reactive<{
  specSwiper: any;
  pages: number;
  pageNo: number;
  pageSize: number;
  currentIndex: number;
  timer: ReturnType<typeof setInterval> | null;
}>({
  specSwiper: null,
  pages: 0,
  pageNo: 0,
  pageSize: 2,
  currentIndex: 0,
  timer: null,
});

// 原变量 k
const modules = [Autoplay, Navigation, Scrollbar];
// 原变量 P
const navigation = ref({ nextEl: ".specNext2", prevEl: ".specPrev2" });
// 原代码还创建了一个同内容的 ref 但未使用，原样保留
ref({ nextEl: ".specNext2", prevEl: ".specPrev2" });

// 原函数 E：swiper 初始化后每 11 秒翻页，到末尾回到第一张
const onSwiper = (swiper: any) => {
  state.specSwiper = swiper;
  if (state.timer) {
    clearInterval(state.timer);
  } else {
    state.timer = setInterval(() => {
      if (state.specSwiper.isEnd) state.specSwiper.slideTo(0);
      else state.specSwiper.slideNext();
    }, 1000 * 11);
  }
};

// 原函数 I
const onSlideChange = (swiper: any) => {
  console.log("----e", swiper);
};
</script>

<template>
  <div>
    <a-skeleton active :loading="props.loading" :paragraph="{ rows: 5 }">
      <div v-if="props.list.length !== 0" class="reception marT40" style="width: 1266px; margin-left: -33px">
        <div class="main">
          <Swiper
            :modules="modules"
            style="padding-bottom: 50px"
            :speed="500"
            @swiper="onSwiper"
            :navigation="navigation"
            @slideChange="onSlideChange"
            :slidesPerView="2"
            class="swiper1"
            :spaceBetween="10"
            :pagination="{ clickable: true }"
          >
            <SwiperSlide v-for="(item, index) in props.list" :key="index">
              <div class="relative">
                <a-image
                  :src="API_BASE + STATIC_BASE + '/' + item.coverPicPath"
                  :style="{ height: props.imgH + 'px', borderRadius: '5px', width: props.imgW + 'px' }"
                  fallback="/default/fc.jpg"
                  :preview="false"
                  @click="openArticle(item)"
                  class="pointer hoverShadow hoverBig"
                />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
        <div class="swiper-button-prev specPrev2"></div>
        <div class="swiper-button-next specNext2"></div>
      </div>
      <Empty v-else />
    </a-skeleton>
  </div>
</template>

<style scoped>
/* resource.17833206362002.css（data-v-7b192e04） */
.newpage{position:absolute;right:10px;bottom:10px;z-index:1000}
.dot{display:inline-block;width:12px;height:12px;border:2px solid #FFFFFF;border-radius:50%;margin:0 5px;cursor:pointer}
.activer{background:#FFFFFF}
.swiper-button-next1.swiper-button-disabled,.swiper-button-prev1.swiper-button-disabled{opacity:.7;display:none!important}
.swiper-button-disabled{display:none!important}
.specPrev,.specNext,.specPrev2,.specNext2{width:64px;height:64px;top:38%}
.specPrev,.specPrev2{background:url(/home/leftIcon.png) center center no-repeat;background-size:100% 100%;left:0}
.specNext,.specNext2{background:url(/home/rtIcon.png) center center no-repeat;background-size:100% 100%}
.specPrev:after,.specNext:after,.specNext2:after,.specPrev2:after,:deep(.swiper-pagination){opacity:0}
</style>
