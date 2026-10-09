<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/dictCodeByType.1751615607545.js（无 css）
// 注意：原 chunk 是一个 Vue 组件（defineComponent({name:"nation",...}) + render 函数），不是纯模块；
//       因此本体放在 .vue，`dictCodeByType.ts` 只做 default 再导出，两种路径都可引用。
// 原导出名 → 新名：`d`（页面里 `import{d as X}from"./dictCodeByType.1751615607545.js"`）→ 本文件 default export
//   页面侧写法：import DictTreeSelect from "@shared/dictCodeByType.vue"
//   <DictTreeSelect title="意向行业" dictCode="ACA111_C" :paramdata="..." @checkedisForm="fn" />
// 入口包导入：`ax` → getMultiDictListByType（@/legacy）；`ay` → listToTree（@/legacy）；`_` → _export_sfc（SFC 不需要）
// 组件 name:"nation"（原样保留，与 dictCode.vue 同名）；props/emits 名保持原样。
// 模板说明：原模板直接 v-model 到 props.paramdata（写 prop），原样保留；`searchValue` 与 `document` 均未在 setup 返回，
//   按原编译结果走 _ctx.searchValue / _ctx.document（与原 render 一致）。
import { defineComponent, onMounted, reactive, ref } from "vue";
import { getMultiDictListByType, listToTree } from "@/legacy";

type DictNode = { id: string; name: string; parentId?: string; children?: DictNode[] };
type TreeOption = { label: string; value: string; parentId?: string; children: TreeOption[] };

export default defineComponent({
  name: "nation",
  props: {
    paramdata: String,
    title: String,
    outputdisabled: String,
    parentName: String,
    dictCode: String,
  },
  emits: ["checkedisForm", "change", "update:value"],
  // 原代码 setup(e,{emit:s,refs:d})，refs 未使用
  setup(props, { emit }) {
    onMounted(() => {
      loadTree();
    });
    // 原代码 treeData 初始值是 ref()（放在 reactive 里会被解包，初始为 undefined），原样保留
    const queryParam = reactive({ dictCodelList: [] as unknown[], treeData: ref<TreeOption[]>() });

    // a-tree-select 的 change(value, label, extra) → 向上抛 checkedisForm
    function changeTree(value: unknown, label: unknown, extra: unknown) {
      console.log("树形结构上级", value, label, extra);
      emit("checkedisForm", { value, label, extra });
    }

    async function loadTree() {
      // 注意：getMultiDictListByType 内部按 dictTypeCode 交换了 ACA111_C / AAB022_C 的请求参数（原包行为，见 @/legacy）
      if (props.dictCode == "ACA111_C") {
        const res = await getMultiDictListByType({ dictTypeCode: props.dictCode });
        const tree = listToTree(res.result as DictNode[]);
        const toOption = (node: DictNode): TreeOption => {
          const hasChildren = Array.isArray(node.children) && node.children.length > 0;
          return { label: node.name, value: node.id, parentId: node.parentId, children: hasChildren ? node.children!.map((child) => toOption(child)) : [] };
        };
        let options: TreeOption[] = [];
        options = tree.map((node) => toOption(node));
        queryParam.treeData = options;
      } else if (props.dictCode == "AAB022_C") {
        const res = await getMultiDictListByType({ dictTypeCode: props.dictCode });
        const tree = listToTree(res.result as DictNode[]);
        const toOption = (node: DictNode): TreeOption => {
          const hasChildren = Array.isArray(node.children) && node.children.length > 0;
          return { label: node.name, value: node.id, parentId: node.parentId, children: hasChildren ? node.children!.map((child) => toOption(child)) : [] };
        };
        let options: TreeOption[] = [];
        if (tree) {
          options = tree.map((node) => toOption(node));
          queryParam.treeData = options;
        }
      }
    }

    return { props, queryParam, changeTree };
  },
});
</script>

<template>
  <a-tree-select
    v-model:value="props.paramdata"
    v-model:searchValue="searchValue"
    show-search
    style="width: 100%"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
    :placeholder="'请搜索或选择' + props.title"
    allow-clear
    tree-node-filter-prop="label"
    :tree-data="queryParam.treeData"
    @change="changeTree"
    :defaultValue="props.parentName"
    :getPopupContainer="(triggerNode) => triggerNode.parentNode || document.body"
  />
</template>
