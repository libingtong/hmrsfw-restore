<script setup lang="ts">
// Stub of the entry-chunk `SlideCaptcha` component (exported as `aE`). Exposes getCatha() like the original.
withDefaults(defineProps<{ type?: string; phone?: string; smsmode?: string; fromType?: string }>(), { type: "0", phone: "", smsmode: "1", fromType: "1" });
const emit = defineEmits(["timerCount"]);
defineExpose({ getCatha: () => { emit("timerCount"); } });
</script>

<template>
  <span class="poc-slide-captcha"></span>
</template>
