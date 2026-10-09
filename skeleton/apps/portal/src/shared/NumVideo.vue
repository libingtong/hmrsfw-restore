<template>
  <div v-if="props.show" class="absolte as">
    <video
      ref="videoPlayer"
      showPlay="true"
      :height="600 + currentIndex"
      width="300"
      controls=""
      autoplay="autoplay"
      muted="false"
      preload="metadata"
      controlslist="nodownload"
      :src="currentVideo"
      @ended="handleEnded"
    ></video>
    <div
      style="position: absolute; top: 36px; right: 3px; background: rgb(51 51 51 / 50%); padding: 0 3px"
      class="pointer u-f"
      @click="closeVideo"
    > 关闭 <CloseOutlined class="u-f" style="font-size: 16px" /></div>
  </div>
</template>

<script setup lang="ts">
// 还原自 legacy-dist/portal/assets/NumVideo.1783320636200.js（default 导出，__name: NumVideo，scopeId data-v-3f3c6a40）
import { nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import type { PropType } from "vue";
import { API_BASE, STATIC_BASE } from "@/utils/request";

interface VideoItem {
  videoUrl: string;
  [key: string]: unknown;
}

const props = defineProps({
  show: { type: Boolean, default: false },
  // 原代码数组默认值未用工厂函数，按原样保留
  videoList: { type: Array as PropType<VideoItem[]>, default: [] },
});
const emit = defineEmits(["closeVideo"]);

console.log("props", props);

const videoPlayer = ref<HTMLVideoElement | null>(null);
const currentIndex = ref(0);
const currentVideo = ref("");
console.log("currentVideo", currentVideo);
// 原代码中创建但未使用的状态，原样保留
ref(true);
const isPlaying = ref(false);
reactive({ show: false });

// 当前视频播放结束：切到下一个，到末尾回到第一个
const handleEnded = (value: Event) => {
  console.log("value", value);
  currentIndex.value += 1;
  if (currentIndex.value >= props.videoList.length) currentIndex.value = 0;
  if (videoPlayer.value != null) {
    currentVideo.value = API_BASE + STATIC_BASE + "/" + props.videoList[currentIndex.value].videoUrl;
    console.log("videoPlayer.value", videoPlayer.value);
    console.log("currentVideo.value", currentVideo.value);
    nextTick(() => {
      videoPlayer.value!.play();
    });
  }
};

onMounted(() => {
  console.log("props.videoList", props.videoList);
  currentVideo.value =
    API_BASE + STATIC_BASE + "/" + (props.videoList.length > 0 ? props.videoList[currentIndex.value].videoUrl : "");
});

const onPause = () => {
  isPlaying.value = false;
};
const onPlaying = () => {
  isPlaying.value = true;
};

const closeVideo = () => {
  currentIndex.value = 0;
  emit("closeVideo");
};

onUnmounted(() => {
  currentIndex.value = 0;
  // 原代码只移除、从未添加这两个监听，原样保留
  videoPlayer.value?.removeEventListener("pause", onPause);
  videoPlayer.value?.removeEventListener("playing", onPlaying);
});
</script>

<style scoped>
.as {
  position: fixed;
  top: 20%;
  right: 0px;
  z-index: 10;
}
</style>
