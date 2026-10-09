<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/dictCodeTreeOne.1751615607545.js（+ dictCodeTreeOne.1751615607545.css，无 scopeId，非 scoped 样式）
// 原 chunk 是 defineComponent({name:"nation",...}) + 独立 render 函数（非 <script setup>）。
// 原导出名 → 新名：`d`（页面里 `import{d as X}from"./dictCodeTreeOne.1751615607545.js"`）→ 本文件 default export。
//   页面侧写法：import DictCodeTreeOne from "@shared/dictCodeTreeOne.vue";
//   <DictCodeTreeOne dictCode="xxx" title="..." :paramdata="values" :maxTagCount="5" @checkedisForm="fn" />（多选下拉 + 全选）
// 入口包导入：`k` → getDictItemsByCode（@/legacy）；`an` → uniqueByValue（按 value 去重，@/legacy；对照表里还没有，需入口兼容层提供）；
//   `_` → _export_sfc（SFC 不需要）。
// 组件 name:"nation"（原样保留）；模板直接 v-model 到 props.paramdata（写 prop），原样保留。
import { defineComponent, onMounted, reactive, type PropType } from "vue";
import { getDictItemsByCode, uniqueByValue } from "@/legacy";

type Option = { label: string; value: unknown };

export default defineComponent({
  name: "nation",
  props: {
    paramdata: Array as PropType<unknown[]>,
    title: String,
    dictCode: String,
    outputdisabled: String,
    all: String,
    maxTagCount: { type: Number, default: 5 },
  },
  components: {
    // 下拉菜单自定义渲染：把 dropdownRender 的 menuNode 原样渲染出来
    VNodes: (_props: unknown, { attrs }: { attrs: Record<string, unknown> }) => attrs.vnodes,
  },
  emits: ["checkedisForm", "change", "update:value"],
  // 原代码 setup(e,{emit:t,refs:g})，refs 未使用
  setup(props, { emit }) {
    onMounted(() => {
      loadDictItems();
    });
    // 原代码初始只有 dictCodelList，选项实际存放在后加的 selectdata 上，原样保留
    const queryParam = reactive({ dictCodelList: [] as Option[] }) as { dictCodelList: Option[]; selectdata?: Option[] };

    /** a-select 的 change：把选中值映射回 {label,value} 向上抛 */
    const checkedisForm = (values: unknown[]) => {
      console.log("1", values);
      let checked: Option[] = [];
      queryParam.selectdata!.map((item) => {
        values.map((v) => {
          if (v == item.value) checked.push({ label: item.label, value: item.value });
        });
      });
      uniqueByValue(checked); // 原代码调用后未使用返回值，原样保留
      console.log("1", checked);
      emit("checkedisForm", checked);
    };

    /** 下拉底部“全选”复选框 */
    const onCheckAllChange = (e: { target: { checked: boolean } }) => {
      console.log("selectData=", e.target.checked, queryParam.selectdata);
      const checked = e.target.checked ? queryParam.selectdata!.map((item) => item) : [];
      emit("checkedisForm", checked);
    };

    function loadDictItems() {
      getDictItemsByCode({ dictCode: props.dictCode }).then((res) => {
        let list: Option[] = [];
        if (res.result != null) (res.result as { value: unknown; text: string }[]).map((item) => { list.push({ value: item.value, label: item.text }); });
        queryParam.selectdata = list;
      });
    }

    return { props, queryParam, checkedisForm, onCheckAllChange };
  },
});
</script>

<template>
  <a-select
    v-model:value="props.paramdata"
    mode="multiple"
    style="width: 100%"
    :placeholder="'请选择或搜索' + props.title"
    :options="queryParam.selectdata"
    @change="checkedisForm"
    optionFilterProp="label"
    :max-tag-count="props.maxTagCount"
  >
    <template #dropdownRender="{ menuNode }">
      <v-nodes :vnodes="menuNode" />
      <a-divider style="margin: 4px 0" />
      <div style="padding: 4px 8px; cursor: pointer" class="allBtn" @mousedown="$event.preventDefault()">
        <a-checkbox @change="onCheckAllChange">全选</a-checkbox>
      </div>
    </template>
  </a-select>
</template>

<style>
/* 原样来自 legacy-dist/usercenter/assets/dictCodeTreeOne.1751615607545.css（非 scoped） */
.allBtn .ant-checkbox-wrapper{width:100%}
</style>
