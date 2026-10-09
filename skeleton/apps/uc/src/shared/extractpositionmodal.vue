<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/extractpositionmodal.1751615607545.js
//       + extractpositionmodal.1751615607545.css（scopeId data-v-f343505a）
// 共享组件 `extractpositionmodal`：从历史职位中"提取"职位的弹窗（按职位名称/职位类型查询，表格分页，点"提取"把该行抛给父组件）。
// 原导出名 → 新名：`e` → default export（import ExtractPositionModal from "@shared/extractpositionmodal.vue"）
// 入口包导入：`d` → decryptStorage（@/legacy）；`aw` → historyUsePositionList（@/legacy，入口兼容层需补；
//             POST /job/xfJobCompanyPosition/historyUsePositionList，原 url 就没有 /xf-job 前缀）；
//             `M` → Modal（ant-design-vue）；`_` → _export_sfc（不需要）
// 共享 chunk：dictCode.1751615607545.js 的 `d` → @shared/dictCode.vue
// 原样保留：props.okText / props.cancelText / rowSelection / Page / index 未声明（运行时 undefined）；
//           a-table 默认插槽里那个带 slot / slot-scope 属性的 span 是 Vue 2 写法残留，Vue 3 只当普通属性输出。
import { reactive, onMounted } from "vue";
import { Modal } from "ant-design-vue";
import { decryptStorage, historyUsePositionList } from "@/legacy";
import DictCodeSelect from "@shared/dictCode.vue";

const props = defineProps({
  collapsed: Boolean,
  positionrecord: Array,
  visible: Boolean,
  title: String,
  izEndReply: String,
  isHign: { type: Boolean, default: false },
});
const emit = defineEmits(["okclick", "cancelClick"]);

let corpInfo: any = decryptStorage(localStorage.getItem("corpInfo"), "corpInfo");

const state = reactive<any>({
  arraydata: [],
  detailList: [],
  brandFold: false,
  length: 0,
  positionStatusText: "",
  user: {
    izFromTalents: props.isHign ? "1" : undefined,
    companyId: corpInfo.id,
    pageNo: 1,
    pageSize: 10,
    classify: undefined,
    name: "",
    dataSource: "0",
  },
  newest: [],
  pageSize: 1,
  pagination: { total: "", pageSize: 10, current: 1, showTotal: (total) => `共${total}条` },
  loading: true,
});

const columns = [
  { title: "序号", dataIndex: "id", customRender: (opt, _col) => opt.index + 1 },
  { title: "操作", key: "operation", fixed: "right" },
  { title: "职位名称", dataIndex: "name", key: "name", width: 200, slots: { customRender: "name" } },
  { title: "招聘人数", dataIndex: "advertiseCount", key: "advertiseCount" },
  { title: "发布日期", dataIndex: "createTime", key: "createTime" },
  { title: "职位状态", dataIndex: "positionStatusText", key: "positionStatusText" },
  { title: "职位类型", dataIndex: "classifyText", key: "classifyText" },
  { title: "审核状态", dataIndex: "checkStatusText", key: "checkStatusText" },
];

/** 职位类型下拉（dictCode 组件 checkedisForm 回调，参数 {value,label}） */
const checkedClassify = (item) => {
  state.classifyText = item.label;
  state.user.classify = item.value;
};

const handleSearch = () => {
  state.user.pageNo = 1;
  state.pagination.current = 1;
  loadList();
};

const handleReset = () => {
  state.classifyText = undefined;
  state.user.classify = "";
  state.user.name = "";
  state.user.pageNo = 1;
  state.pagination.current = 1;
  loadList();
};

function handleTableChange(pagination, _filters, _sorter) {
  const pager = { ...state.pagination };
  pager.pageNo = pagination.current;
  pager.current = pagination.current;
  state.pagination = pager;
  state.user.pageNo = pagination.current;
  loadList();
}

onMounted(() => {
  state.loading = false;
  loadList();
});

async function loadList() {
  // 原代码没有 await 这个 Promise（原样保留）
  historyUsePositionList(state.user).then((res: any) => {
    if (res.success) {
      state.newest = res.result.records;
      const pager = { ...state.pagination };
      pager.total = (res.result && res.result.records && res.result.total) || 0;
      state.pagination = pager;
    }
  });
}

/** 点"提取"：把该行职位抛给父组件 */
const extractPosition = (record) => {
  emit("okclick", { visible: false, corpInfo: record });
};

const handleCancel = () => {
  emit("cancelClick", { visible: false });
};
</script>

<template>
  <div ref="globalModal">
    <Modal
      v-model:visible="props.visible"
      :closable="true"
      :title="props.title"
      :ok-text="props.okText"
      width="1240px"
      :maskClosable="false"
      :cancel-text="props.cancelText"
      @cancel="handleCancel"
      :getContainer="() => $refs.globalModal"
      :footer="null"
    >
      <a-row class="form">
        <a-col :span="8">
          <a-form-item name="name" label="职位名称">
            <a-input
              v-model:value="state.user.name"
              placeholder="请输入职位名称"
              oninput="value=value.replace(/[, ]/g,'')"
              onkeyup="value=value.replace(/[, ]/g,'')"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item name="classifyText" label="职位类型">
            <DictCodeSelect
              dictCode="history_use_position_classify"
              ptitle="请选择职位类型"
              placeholder="请选择职位类型"
              :showSearch="false"
              :outputdisabled="state.outputdisabled"
              @checkedisForm="checkedClassify"
              :paramdata="state.classifyText"
            />
          </a-form-item>
        </a-col>
        <a-col :lg="6">
          <a-button class="marL10" type="primary" preIcon="ant-design:search-outlined" @click="handleSearch">查询</a-button>
          <a-button preIcon="ant-design:reload-outlined" @click="handleReset" style="margin-left: 8px">重置</a-button>
        </a-col>
      </a-row>
      <div class="table">
        <a-table
          bordered
          :loading="state.loading"
          :pagination="state.pagination"
          :row-selection="rowSelection"
          @change="handleTableChange"
          :data-source="state.newest"
          :columns="columns"
        >
          <template #bodyCell="{ column, text, record }">
            <a v-if="column.key === 'operation'" @click="extractPosition(record)">提取</a>
          </template>
          <template #name="{ record }">
            <div class="ellipsis" style="width: 200px" :title="record.title">{{ record.name }}</div>
          </template>
          <template #content="{ record }">
            <sketch-outlined v-if="record.izClassic == 1" style="color: #fcca00" />
            <eye-outlined v-if="record.izPublic == 10" style="color: #fcca00; margin: 0 3px" />
            {{ record.content }}
          </template>
          <span slot="num" slot-scope="text, record, index">{{ (Page.current - 1) * Page.pageSize + parseInt(index) + 1 }}</span>
        </a-table>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
:deep(.ant-modal-footer) {
  text-align: center;
  display: flex;
  justify-content: center;
}
:deep(.ant-modal-footer .ant-btn) {
  margin: 0 35px;
}
.user-avator {
  margin-right: 20px;
}
.metorwen {
  margin-bottom: 30px;
}
.wen {
  background-color: #7f83f7;
  font-size: 14px;
  width: 32px;
  height: 32px;
  line-height: 32px;
  color: #fff;
  text-align: center;
  float: left;
}
.da {
  background-color: #81b337;
  font-size: 14px;
  width: 32px;
  height: 32px;
  line-height: 32px;
  color: #fff;
  text-align: center;
  float: left;
}
.why {
  background-color: #f5f7fa;
  padding: 15px;
  font-size: 14px;
  width: 94%;
}
.fold {
  display: block;
  height: 58px;
  line-height: 20px;
  text-align: center;
}
.maringleft {
  margin-right: 10px;
}
</style>
