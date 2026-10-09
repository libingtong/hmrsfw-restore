<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/dictCheckBoxAll.1751615607545.js（无 css；chunk 里的 `/* empty css */` 是空样式占位）
// 确认：这是一个 Vue 组件（defineComponent({name:"nation",...}) + 独立 render 函数，非 <script setup>），不是纯模块。
// 原导出名 → 新名：`d`（页面里 `import{d as X}from"./dictCheckBoxAll.1751615607545.js"`）→ 本文件 default export。
//   页面侧写法：import DictCheckBoxAll from "@shared/dictCheckBoxAll.vue";
//   <DictCheckBoxAll :list="[{label,value}]" :paramdata="checkedValues" @checkedisForm="fn" />（checkedisForm 抛出内部 state）
// 入口包导入：`an` → uniqueByValue（按 value 去重，@/legacy；对照表里还没有，需入口兼容层提供）；`_` → _export_sfc（SFC 不需要）。
// 组件 name:"nation"（原样保留，与其他字典组件同名）；模板直接 v-model 到 props.paramdata（写 prop），原样保留。
import { defineComponent, onMounted, reactive, watch, type PropType } from "vue";
import { uniqueByValue } from "@/legacy";

type Option = { label: string; value: unknown };

export default defineComponent({
  name: "nation",
  props: {
    paramdata: { type: Array as PropType<unknown[]>, default: [] },
    list: Array as PropType<Option[]>,
  },
  components: {
    // 原样保留：把 attrs.vnodes 原样渲染的函数式组件（本组件模板里没有用到）
    VNodes: (_props: unknown, { attrs }: { attrs: Record<string, unknown> }) => attrs.vnodes,
  },
  emits: ["checkedisForm", "change", "update:value"],
  // 原代码 setup(e,{emit:n,refs:d})，refs 未使用
  setup(props, { emit }) {
    onMounted(() => {});
    const state = reactive({ indeterminate: true, checkAll: false, checkedList: [] as unknown[] });

    watch(
      () => state.checkedList,
      (val) => {
        state.indeterminate = !!val.length && val.length < props.list!.length;
        state.checkAll = val.length === props.list!.length;
      },
    );
    watch(
      () => props.paramdata,
      (val) => {
        if (val.length !== 0 && val.length == props.list!.length) Object.assign(state, { checkedList: props.list, checkAll: true });
        else Object.assign(state, { checkedList: val, checkAll: false });
      },
      { deep: true },
    );
    watch(
      () => props.list,
      (val) => {
        if (props.paramdata) {
          if (props.paramdata.length !== 0 && props.paramdata.length == val!.length) Object.assign(state, { checkedList: val, checkAll: true });
          else if (props.paramdata.length !== 0 && val!.length !== 0) Object.assign(state, { checkedList: props.paramdata, indeterminate: true, checkAll: false });
          else Object.assign(state, { checkedList: [], indeterminate: false, checkAll: false });
        } else {
          Object.assign(state, { checkedList: [], indeterminate: false, checkAll: false });
        }
      },
      { deep: true },
    );

    /** a-checkbox-group 的 change：把选中值映射回 {label,value}，向上抛出 state */
    const checkedisForm = (values: unknown[]) => {
      let checked: Option[] = [];
      props.list!.map((item) => {
        values.map((v) => {
          if (v == item.value) checked.push({ label: item.label, value: item.value });
        });
      });
      uniqueByValue(checked); // 原代码调用后未使用返回值，原样保留
      if (checked.length !== 0 && checked.length == props.list!.length) Object.assign(state, { checkedList: props.list, indeterminate: false, checkAll: true });
      else Object.assign(state, { checkedList: checked, indeterminate: false, checkAll: false });
      emit("checkedisForm", state);
    };

    /** “全选”复选框 */
    const onCheckAllChange = (e: { target: { checked: boolean } }) => {
      Object.assign(state, { checkedList: e.target.checked ? props.list : [], indeterminate: false });
      emit("checkedisForm", state);
    };

    return { props, state, checkedisForm, onCheckAllChange };
  },
});
</script>

<template>
  <a-checkbox @change="onCheckAllChange" :indeterminate="state.indeterminate" v-model:checked="state.checkAll"> 全选</a-checkbox>
  <a-checkbox-group v-model:value="props.paramdata" :options="props.list" @change="checkedisForm" />
</template>
