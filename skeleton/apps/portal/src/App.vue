<script setup lang="ts">
// POC shell: only the page component is rendered. The original wraps the app in a-config-provider with the zh_CN locale.
import zhCN from "ant-design-vue/es/locale/zh_CN";
</script>

<template>
  <a-config-provider :locale="zhCN">
    <main class="poc-main" id="poc-main">
      <router-view />
    </main>
  </a-config-provider>
</template>
