<script setup lang="ts">
// Stub of the entry-chunk `video` component (exported as `V`): a plain <video> with the same props.
withDefaults(defineProps<{ videoSrc?: string; videoPoster?: string; width?: number; height?: number; autoplay?: boolean; controls?: boolean; loop?: boolean; muted?: boolean; preload?: string; showPlay?: boolean; playWidth?: number; zoom?: string }>(), { videoSrc: "", videoPoster: "", width: 800, height: 450, autoplay: false, controls: true, loop: false, muted: false, preload: "auto", showPlay: false, playWidth: 96, zoom: "none" });
</script>

<template>
  <video class="poc-video" :src="videoSrc" :poster="videoPoster" :width="width" :height="height" :autoplay="autoplay" :controls="controls" :loop="loop" :muted="muted" :preload="preload"></video>
</template>
