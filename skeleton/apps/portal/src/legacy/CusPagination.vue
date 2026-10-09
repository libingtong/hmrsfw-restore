<script setup lang="ts">
// Global `cus-pagination` component of the original entry chunk (scopeId data-v-5a315f15): a-pagination with
// "上一页/下一页" item renderers and a quick jumper. Behaviour ported 1:1 from the compiled definition.
import { ref, computed, watch, nextTick, useAttrs } from "vue";
const props = withDefaults(defineProps<{ current?: number; total?: number; pageSize?: number; disabled?: boolean; showLessItems?: boolean; simple?: boolean; size?: string; showQuickJumper?: boolean }>(), { current: 1, total: 20, pageSize: 10, disabled: false, showLessItems: false, simple: false, size: "middle", showQuickJumper: true });
const emit = defineEmits(["update:current", "update:pageSize", "change"]);
const attrs = useAttrs();
const current = ref(Number(props.current));
const pageSize = ref(Number(props.pageSize));
const jumpTo = ref<string | number>("");
const pageCount = computed(() => { const t = props.total, p = props.pageSize; return t % p == 0 ? t / p : Math.floor(t / p) + 1; });
const onChange = (v: number) => { emit("update:current", Number(v)); emit("change", Number(v)); };
const onPressEnter = () => { nextTick(() => { jump(); }); };
const jump = () => { nextTick(() => { if (jumpTo.value) { const v = Number(jumpTo.value); current.value = Number(v); emit("update:current", Number(v)); emit("change", Number(v)); } }); };
watch(() => props.current, (v) => { current.value = Number(v); }, { immediate: true });
watch(() => props.pageSize, (v) => { pageSize.value = Number(v); }, { immediate: true });
function resetPageNo() { current.value = 1; }
defineExpose({ resetPageNo });
</script>

<template>
  <div class="cus-pagination-box">
    <a-pagination class="inline-flex vertical-top cus-pagination" v-bind="attrs" v-model:current="current" :size="size" :simple="simple" v-model:pageSize="pageSize" :showLessItems="showLessItems" :disabled="disabled" :total="total" @change="onChange">
      <template #itemRender="{ type, originalElement }">
        <a v-if="type === 'prev'" class="pages">上一页</a>
        <a v-else-if="type === 'next'" class="pages">下一页</a>
        <component :is="originalElement" v-else />
      </template>
    </a-pagination>
    <span v-if="props.showQuickJumper" class="pagination-to">到</span>
    <a-input-number class="pagination-input vertical-top" size="small" :disabled="disabled" :min="1" :max="pageCount" v-model:value="jumpTo" @pressEnter="onPressEnter" />
    <a-button type="primary" class="jump-btn" :disabled="disabled || !jumpTo" size="small" @click="jump">确定</a-button>
  </div>
</template>

<style scoped>
.cus-pagination-box{display:flex;justify-content:center;align-items:center}
.cus-pagination{display:inline-flex;justify-content:center;align-items:center}
.pagination-input{width:62px;margin-right:10px;margin-left:10px;text-align:center}
.pagination-to{line-height:42px;margin-left:10px}
:deep(.ant-input-number-handler-wrap), :deep(.ant-pagination-options){display:none!important}
.pagination-input :deep(.ant-input-number-input){text-align:center!important;height:40px!important}
.pages{width:100%;height:42px;padding:12px 6px;color:#333;text-align:center;background-color:#fff;border:1px solid #d9d9d9;border-radius:2px;outline:none}
.jump-btn{height:42px!important;padding:0 14px!important}
.jump-btn :deep(span){height:40px!important;line-height:40px!important}
</style>
