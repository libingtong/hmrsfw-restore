<!--
  还原自 legacy-dist/portal/assets/industryCode.1783320636200.js（无 CSS，无 scopeId）
  它是组件（行业下拉选择器，defineComponent({ name:"nation" }) + 独立 render），不是模块，所以落为 .vue。
  原导出名 → 新名：`i`（组件 "nation"）→ default export；`__tla` 不再需要。
  页面里 `import{i as X,__tla}from"./industryCode…js"` 改为 `import IndustryCode from "@shared/industryCode.vue"`。
-->
<script setup lang="ts">
import { onMounted, reactive } from "vue";
// 原组件 components 里注册了 SmileOutlined / MehOutlined（入口包导出 G / H），render 未使用，原样保留导入
import { SmileOutlined, MehOutlined } from "@ant-design/icons-vue";
import { getCorpIndustryListByType } from "@/legacy"; // entry export `bb` (job service endpoint)

defineOptions({ name: "nation", components: { SmileOutlined, MehOutlined } });

const props = defineProps({
  paramdata: String,
  title: String,
  dictCode: String,
  outputdisabled: String,
  showSearch: String,
  ptitle: String,
});

// 原 emits 声明了三个事件，组件自身只触发 checkedisForm
const emit = defineEmits(["checkedisForm", "change", "update:value"]);

onMounted(() => {
  loadIndustryList();
});

const queryParam = reactive({
  dictCodelList: [] as { value: unknown; label: unknown }[],
});

// a-select labelInValue 模式的 onChange 回调：把 {value,label} 抛给父组件（原代码未判空）
const checkedisForm = (option: { value: unknown; label: unknown }) => {
  const payload = { value: option.value, label: option.label };
  emit("checkedisForm", payload);
};

// 行业字典 AAB022_C：只取非顶层节点（parentId != "0"）
async function loadIndustryList() {
  const res: any = await getCorpIndustryListByType({ dictTypeCode: "AAB022_C" });
  const list: { value: unknown; label: unknown }[] = [];
  res.result.map((item: { id: unknown; name: unknown; parentId: string }) => {
    if (item.parentId != "0") list.push({ value: item.id, label: item.name });
  });
  queryParam.dictCodelList = list;
}
</script>

<template>
  <!--
    原 render：value 绑定 props.paramdata，onUpdate:value 直接写回 props.paramdata（原代码就是对 prop 赋值），原样保留。
    getPopupContainer 原文是 `o => o.parentNode || _ctx.document.body`（模板里的 document 被编译成 _ctx.document），原样保留。
  -->
  <a-select
    size="large"
    :disabled="props.outputdisabled"
    :showSearch="props.showSearch"
    :labelInValue="true"
    v-model:value="props.paramdata"
    :placeholder="props.ptitle"
    :options="queryParam.dictCodelList"
    optionFilterProp="label"
    @change="checkedisForm"
    :getPopupContainer="(triggerNode) => triggerNode.parentNode || document.body"
  >
    <template #suffixIcon>
      <caret-down-outlined :style="{ 'font-size': '12px' }" class="ant-select-suffix" />
    </template>
  </a-select>
</template>
