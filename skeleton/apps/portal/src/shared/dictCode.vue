<!--
  还原自 legacy-dist/portal/assets/dictCode.1783320636200.js（无 CSS，无 scopeId）
  原导出名 → 新名：`d`（组件 "nation"，字典下拉选择器）→ default export；
  页面里 `import{d as X}from"./dictCode…js"` 改为 `import DictCode from "@shared/dictCode.vue"`。
  原组件是 defineComponent({ name:"nation", props, emits, setup(){ return { props, queryParam, checkedisForm } } }) + 独立 render，
  它是组件而非工具模块，所以落为 .vue 而不是任务表里写的 dictCode.ts。
-->
<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { getDictListByType, getDictItemsByCode, listToTree } from "@/legacy";

defineOptions({ name: "nation" });

const props = defineProps({
  downShow: { type: Boolean, default: true },
  paramdata: String,
  title: String,
  dictCode: String,
  outputdisabled: [String, Boolean],
  showSearch: [String, Boolean],
  ptitle: String,
  type: String,
});

// 原 emits 声明了三个事件，但组件自身只触发 checkedisForm；change/update:value 由 a-select 透传时使用
const emit = defineEmits(["checkedisForm", "change", "update:value"]);

const queryParam = reactive({
  dictCodelList: [] as { value: unknown; label: unknown }[],
});

onMounted(() => {
  loadDictList();
});

// a-select labelInValue 模式的 onChange 回调：把 {value,label} 原样抛给父组件
const checkedisForm = (option?: { value?: unknown; label?: unknown } | null) => {
  const payload = {
    value: option ? option.value : null,
    label: option ? option.label : null,
  };
  emit("checkedisForm", payload);
};

async function loadDictList() {
  if (props.type == "build") {
    // type=build：按字典类型取行业列表（AAB022_C），转树后只取顶层节点的 id/name
    const res = await getDictListByType({ dictTypeCode: "AAB022_C" });
    console.log(res, "===");
    const tree = listToTree((res as { result: any }).result);
    const list: { value: unknown; label: unknown }[] = [];
    tree.map((node: { id: unknown; name: unknown }) => {
      list.push({ value: node.id, label: node.name });
    });
    queryParam.dictCodelList = list;
  } else {
    // 其他：按 dictCode 取字典项（value/text）
    const res = await getDictItemsByCode({ dictCode: props.dictCode });
    const list: { value: unknown; label: unknown }[] = [];
    (res as { result: { value: unknown; text: unknown }[] }).result.map((item) => {
      list.push({ value: item.value, label: item.text });
    });
    queryParam.dictCodelList = list;
  }
}
</script>

<template>
  <!--
    原 render：value 绑定 props.paramdata，并把 onUpdate:value 直接写回 props.paramdata（原代码就是对 prop 赋值），原样保留。
    getPopupContainer 原文是 `o => o.parentNode || _ctx.document.body`（模板里的 document 被编译成 _ctx.document），原样保留。
  -->
  <a-select
    size="large"
    :disabled="props.outputdisabled"
    :showSearch="props.showSearch"
    :labelInValue="true"
    allowClear=""
    v-model:value="props.paramdata"
    :placeholder="props.ptitle"
    :options="queryParam.dictCodelList"
    optionFilterProp="label"
    @change="checkedisForm"
    :getPopupContainer="(triggerNode) => triggerNode.parentNode || document.body"
  >
    <template #suffixIcon>
      <caret-down-outlined class="ant-select-suffix" />
    </template>
  </a-select>
</template>
