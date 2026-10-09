<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/dictCode.1751615607545.js（无 css）
// 注意：原 chunk 是一个 Vue 组件（defineComponent({name:"nation",...}) + render 函数），不是纯模块；
//       因此本体放在 .vue，`dictCode.ts` 只做 default 再导出，两种路径都可引用。
// 原导出名 → 新名：`d`（页面里 `import{d as X}from"./dictCode.1751615607545.js"`）→ 本文件 default export
//   页面侧写法：import DictCodeSelect from "@shared/dictCode.vue"
//   <DictCodeSelect dictCode="deliver_type" ptitle="请选择" :showSearch="false" :outputdisabled="..." :paramdata="..." @checkedisForm="fn" />
// 入口包导入：`k` → getDictItemsByCode（@/legacy）；`_` → _export_sfc（SFC 不需要）
// 组件 name:"nation"（原样保留，两个字典组件同名）；props/emits 名保持原样。
// 模板说明：原模板直接 v-model 到 props.paramdata（写 prop），原样保留；`document` 未在 setup 返回，按原编译结果走 _ctx.document。
import { defineComponent, onMounted, reactive } from "vue";
import { getDictItemsByCode } from "@/legacy";

type DictOption = { value: unknown; label: string };

export default defineComponent({
  name: "nation",
  props: {
    paramdata: String,
    title: String,
    dictCode: String,
    outputdisabled: String,
    showSearch: { type: Boolean, default: false },
    ptitle: String,
  },
  emits: ["checkedisForm", "change", "update:value"],
  // 原代码 setup(e,{emit:r,refs:n})，refs 未使用
  setup(props, { emit }) {
    onMounted(() => {
      loadDictItems();
    });
    const queryParam = reactive({ dictCodelList: [] as DictOption[] });

    // a-select 的 change（labelInValue 模式，参数为 {value,label}）→ 向上抛 checkedisForm
    const checkedisForm = (item: DictOption | null | undefined) => {
      let payload = { value: item ? item.value : null, label: item ? item.label : null };
      emit("checkedisForm", payload);
    };

    async function loadDictItems() {
      const res = await getDictItemsByCode({ dictCode: props.dictCode });
      let list: DictOption[] = [];
      (res.result as { value: unknown; text: string }[]).map((item) => {
        list.push({ value: item.value, label: item.text });
      });
      queryParam.dictCodelList = list;
    }

    return { props, queryParam, checkedisForm };
  },
});
</script>

<template>
  <a-select
    :disabled="props.outputdisabled"
    :showSearch="props.showSearch"
    :labelInValue="true"
    allowClear
    v-model:value="props.paramdata"
    :placeholder="props.ptitle"
    :options="queryParam.dictCodelList"
    optionFilterProp="label"
    @change="checkedisForm"
    :getPopupContainer="(triggerNode) => triggerNode.parentNode || document.body"
  />
</template>
