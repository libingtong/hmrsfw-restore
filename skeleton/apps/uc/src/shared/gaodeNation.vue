<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/gaode.1751615607545.js 里的第一个组件（导出 `i`；defineComponent({name:"nation"}) + render 函数，无 __name）
// 多级字典下拉：取 getDictListByType({dictTypeCode:"AAB022_C"}) 中 parentId != "0" 的项，labelInValue 模式，change 时抛 checkedisForm {value,label}。
// 与 dictCode.vue 同名 "nation"（原样保留）；文件名取 gaodeNation 以免与其他 nation 组件混淆。
// 入口包导入：`S` → getDictListByType(params)（@/legacy，入口兼容层需补；POST /xf-job/communal/xfSysMultiDict/getDictListByType，参数走 params；
//             与已有的 getMultiDictListByType(data) 不是同一个函数）；`_` → _export_sfc（不需要）
// 原样保留：v-model 直接写 props.paramdata；`document` 未在 setup 返回，按原编译结果走 _ctx.document；setup 的 refs 参数未使用。
import { defineComponent, onMounted, reactive } from "vue";
import { getDictListByType } from "@/legacy";

type DictOption = { value: unknown; label: string };

export default defineComponent({
  name: "nation",
  props: {
    paramdata: String,
    title: String,
    dictCode: String,
    outputdisabled: String,
    showSearch: String,
    ptitle: String,
  },
  emits: ["checkedisForm", "change", "update:value"],
  setup(props, { emit }) {
    onMounted(() => {
      loadDictList();
    });
    const queryParam = reactive({ dictCodelList: [] as DictOption[] });

    const checkedisForm = (item: DictOption) => {
      let payload = { value: item.value, label: item.label };
      emit("checkedisForm", payload);
    };

    async function loadDictList() {
      const res: any = await getDictListByType({ dictTypeCode: "AAB022_C" });
      let list: DictOption[] = [];
      res.result.map((item) => {
        item.parentId != "0" && list.push({ value: item.id, label: item.name });
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
    v-model:value="props.paramdata"
    :placeholder="props.ptitle"
    :options="queryParam.dictCodelList"
    optionFilterProp="label"
    @change="checkedisForm"
    :getPopupContainer="(e) => e.parentNode || document.body"
  />
</template>
