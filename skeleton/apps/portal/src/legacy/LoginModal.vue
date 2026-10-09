<script setup lang="ts">
// Stub of the entry-chunk `loginmodal` component (exported as `m`). Renders nothing unless visible.
defineProps<{ visible?: boolean; title?: string; collapsed?: boolean; positionrecord?: unknown[]; setInfo?: object; id?: string; izEndReply?: string }>();
defineEmits(["register", "passwordhint", "toPortal", "okclick", "cancelClick"]);
</script>

<template>
  <a-modal :visible="visible" :title="title || '登录'" :footer="null" @cancel="$emit('cancelClick')">
    <div class="poc-login-stub">登录弹窗（POC 桩）</div>
  </a-modal>
</template>
