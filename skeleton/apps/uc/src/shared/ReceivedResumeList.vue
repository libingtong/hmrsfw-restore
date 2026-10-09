<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/index.175161560754528.js（__name "index"，scopeId data-v-c0996234；
// 样式规则实际在 index.175161560754513.css 里，按 scopeId 摘取）。
// 原导出名 → 新名：`f` → 本文件 default export。
//   页面侧写法：import ReceivedResumeList from "@shared/ReceivedResumeList.vue";
//   <ReceivedResumeList :showFairName="false" :fairId="id" :classify="classify" fairType="..." />
// 入口包导入：`w` → http、`d` → decryptStorage、`k` → getDictItemsByCode、`aN` → downloadFile（@/legacy）；
//   `B` → API_BASE、`h` → STATIC_BASE（@/utils/request）；`M` → Modal、`m` → message（ant-design-vue）；
//   `a7`（入口本地名 Jmt）→ 入口包接口 xfJobCompany/isPublishingPosition，`@/legacy` 里还没有，按 beonmodal.vue 的做法在这里定义。
// 接口模块：index.api.175161560754511.js 的 `q` → queryCompanyPersonInfoRegister（@/api/api-175161560754511）。
// 共享 chunk：dictCode `d` → @shared/dictCode.vue；setStatusinterview `s` → @shared/setStatusinterview.vue；
//   InterviewInvitation.17516156075452 `I` → @shared/InterviewInvitation.vue。
import { http } from "@/legacy";
import { request } from "@/utils/request";

// 以下三个接口在原 chunk 内部定义（用入口的 `w.request`），原样保留在本文件
/** 加入人才库 */
export const addTalent = (data: unknown) => http.request({ url: "/xf-job/job/xfJobCompanyTalents/addTalent", method: "post", data });
/** 下载简历 PDF */
export const downPdf = (params: unknown) =>
  http.request({
    url: "/xf-job/job/xfJobCompanyCurriculumDownload/downPdf",
    method: "get",
    responseType: "blob",
    headers: { "Content-Type": "application/json; application/octet-stream" },
    params,
  });
/** 按单位和招聘会类型查询投递简历 */
export const queryPageListByCompanyIdAndJobFairType = (params: unknown) =>
  http.request({ url: "/xf-job/job/xfJobCurriculumVitaeDeliver/queryPageListByCompanyIdAndJobFairType", method: "get", params });

// TODO:restore 入口包 `a7` 补进 @/legacy 后改为从 @/legacy 导入
/** 入口包 `a7`：单位是否有发布中的职位 */
export const isPublishingPosition = (params: unknown) =>
  request({ url: "/xf-job/job/xfJobCompany/isPublishingPosition", method: "get", params });
</script>

<script setup lang="ts">
import { h, inject, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Modal, message } from "ant-design-vue";
import { API_BASE, STATIC_BASE } from "@/utils/request";
import { decryptStorage, downloadFile, getDictItemsByCode } from "@/legacy";
import { queryCompanyPersonInfoRegister } from "@/api/api-175161560754511";
import DictCode from "@shared/dictCode.vue";
import SetStatusinterview from "@shared/setStatusinterview.vue";
import InterviewInvitation from "@shared/InterviewInvitation.vue";

const props = defineProps({
  fairType: { type: String, default: "" },
  showFairName: { type: Boolean, default: true },
  fairId: { type: String, default: "" },
  classify: { type: String, default: "" },
});
defineEmits(["cancelClick", "okclick"]);

const corpInfo = decryptStorage(localStorage.getItem("corpInfo"), "corpInfo") as Record<string, any>;
inject("reload");
const router = useRouter();
const route = useRoute();

const state = reactive<Record<string, any>>({
  tabstitle: "",
  activeKey: "",
  setStatusvisible: false,
  Interviewvisible: false,
  setInfo: {},
  title: "",
  user: {
    pageNo: 1,
    pageSize: 10,
    status: "",
    statusText: undefined,
    lookupStatus: "",
    lookupStatusText: undefined,
    realName: "",
    companyId: corpInfo.id,
    jobFairType: "40",
    jobFairTypeZcyz: props.classify,
    jobFairId: props.fairId,
  },
  newest: [],
  pageSize: 1,
  pagination: { total: "", pageSize: 5, current: 1, showTotal: (total: number) => `共${total}条` },
  loading: true,
  competiAnalShow: false,
  fileFormVisible: false,
  fileFormList: [],
});

/** 默认列（activeKey 不是 "0"/"10" 时使用：登记信息） */
const registerColumns = [
  { title: "姓名", dataIndex: "applicationName", key: "applicationName", slots: { customRender: "applicationName" } },
  { title: "联系方式", dataIndex: "phone", key: "phone" },
  { title: "应聘职位", dataIndex: "positionName", key: "positionName" },
  { title: "学历", dataIndex: "educationText", key: "educationText" },
  { title: "登记时间", dataIndex: "createTime", key: "createTime" },
  ...(props.showFairName ? [{ title: "招聘会名称", dataIndex: "jobFairName", key: "jobFairName", width: 200 }] : []),
];
/** activeKey == "10" 时使用 */
const scanColumns = [
  { title: "姓名", dataIndex: "applicationName", key: "applicationName", slots: { customRender: "applicationName" } },
  { title: "性别", dataIndex: "sexText", key: "sexText" },
  { title: "应聘职位", dataIndex: "positionName", key: "positionName" },
  { title: "职位类型", dataIndex: "positionTypeText", key: "positionTypeText" },
  { title: "年龄", dataIndex: "age", key: "age" },
  { title: "学历", dataIndex: "educationText", key: "educationText" },
  { title: "投递时间", dataIndex: "createTime", key: "createTime", width: 120 },
  { title: "查看状态", dataIndex: "lookupStatusText", key: "lookupStatusText" },
  { title: "数据来源", dataIndex: "registerSourceText", key: "registerSourceText" },
  ...(props.showFairName ? [{ title: "招聘会名称", dataIndex: "jobFairName", key: "jobFairName", width: 200 }] : []),
  { title: "操作", key: "operation", fixed: "right", width: 150 },
];
/** activeKey == "0"（网上投递）时使用 */
const deliverColumns = [
  { title: "姓名", dataIndex: "realName", key: "realName", fixed: true, slots: { customRender: "realName" } },
  { title: "性别", dataIndex: "sexText", key: "sexText" },
  { title: "应聘职位", dataIndex: "positionName", key: "positionName" },
  { title: "职位类型", dataIndex: "positionTypeText", key: "positionTypeText" },
  { title: "年龄", dataIndex: "age", key: "age" },
  { title: "学历", dataIndex: "educationText", key: "educationText" },
  { title: "投递时间", dataIndex: "createTime", key: "createTime", width: 120 },
  { title: "查看状态", dataIndex: "lookupStatusText", key: "lookupStatusText" },
  { title: "数据来源", dataIndex: "registerSourceText", key: "registerSourceText" },
  { title: "邀请状态", dataIndex: "statusText", key: "statusText" },
  ...(props.showFairName ? [{ title: "招聘会名称", dataIndex: "jobFairName", key: "jobFairName", width: 200 }] : []),
  { title: "操作", key: "operation", fixed: "right", width: 350 },
];

function previewResume(record: any) {
  const { href } = router.resolve({
    path: "/previewresume",
    query: {
      id: record.curriculumVitaeId,
      curriculumVitaeDeliverId: record.id,
      curriculumVitaeId: record.curriculumVitaeId,
      firm: "firm",
      positionId: record.positionId,
      xfSysUserId: record.xfSysUserId,
      type: 1,
      classify: state.activeKey,
    },
  });
  window.open(href);
}

function onLookupStatusChange(option: any) {
  state.user.lookupStatusText = option.label;
  state.user.lookupStatus = option.value;
}

function onStatusChange(option: any) {
  state.user.statusText = option.label;
  state.user.status = option.value;
}

function onSearch() {
  state.tabstitle.map((tab: any) => {
    if (tab.value == state.activeKey) {
      // 原 chunk 这里有一个结果被丢弃的判断（activeKey 是否为 40/20/30），两种情况都直接查询
      getList();
    }
  });
}

function onReset() {
  state.tabstitle.map((tab: any) => {
    if (tab.value == state.activeKey) {
      const pagination = { ...state.pagination };
      pagination.pageNo = "1";
      pagination.current = "1";
      state.pagination = pagination;
      state.user.pageNo = "1";
      if (state.activeKey == "40" || state.activeKey == "20" || state.activeKey == "30") {
        state.user.jobFairName = undefined;
        state.user.statusText = undefined;
        state.user.status = "";
        state.user.lookupStatusText = undefined;
        state.user.lookupStatus = "";
        state.user.realName = "";
        getList();
      } else {
        state.user.statusText = undefined;
        state.user.status = "";
        state.user.lookupStatusText = undefined;
        state.user.lookupStatus = "";
        state.user.realName = "";
        getList();
      }
    }
  });
}

async function onTabChange(key: any) {
  state.activeKey = key;
  state.tabstitle.map((tab: any) => {
    if (tab.value == state.activeKey) {
      const pagination = { ...state.pagination };
      pagination.pageNo = "1";
      pagination.current = "1";
      state.pagination = pagination;
      state.user.pageNo = "1";
      if (state.activeKey == "0") {
        state.user.jobFairName = "";
        state.user.statusText = undefined;
        state.user.status = "";
        state.user.lookupStatusText = undefined;
        state.user.lookupStatus = "";
        state.user.realName = "";
      }
      getList();
    }
  });
}

onMounted(async () => {
  if (route.name == "CenterFairResume") state.user.jobFairTypeZcyz = "10";
  else if (route.name == "AreaOutFairResume") state.user.jobFairTypeZcyz = "20";
  else if (route.name == "CityOutFairResume") state.user.jobFairTypeZcyz = "30";
  else if (route.name == "corpFairs") {
    // 原 chunk 此分支为空
  }
  await getTabs();
});

function getTabs() {
  getDictItemsByCode({ dictCode: "job_fair_vitae_type" }).then((res: any) => {
    const tabs: any[] = [];
    res.result.map((item: any) => {
      tabs.push({ value: item.value, label: item.text });
    });
    state.tabstitle = tabs;
    selectFirstTab();
  });
}

function onTableChange(pag: any, _filters: any, _sorter: any) {
  const pagination = { ...state.pagination };
  pagination.pageNo = pag.current;
  pagination.current = pag.current;
  state.pagination = pagination;
  state.user.pageNo = pag.current;
  getList();
}

function selectFirstTab() {
  state.activeKey = state.tabstitle[0].value;
  getList();
}

function getList() {
  if (state.activeKey == "0") {
    state.newest = [];
    queryPageListByCompanyIdAndJobFairType(state.user).then((res: any) => {
      if (res.success) {
        state.newest = res.result.records;
        const pagination = { ...state.pagination };
        pagination.total = (res.result && res.result.records && res.result.total) || 0;
        state.pagination = pagination;
        state.loading = false;
      }
    });
  } else {
    const params: Record<string, any> = {
      companyId: state.user.companyId,
      jobFairId: state.user.jobFairId,
      jobFairTypeZcyz: state.user.jobFairTypeZcyz,
      pageNo: state.user.pageNo,
      pageSize: state.user.pageSize,
    };
    if (state.activeKey == "10") params.type = "4";
    else if (state.activeKey == "20") params.type = "3";
    state.newest = [];
    queryCompanyPersonInfoRegister(params).then((res: any) => {
      if (res.success) {
        state.newest = res.result.records;
        const pagination = { ...state.pagination };
        pagination.total = (res.result && res.result.records && res.result.total) || 0;
        state.pagination = pagination;
        state.loading = false;
      }
    });
  }
}

function onInvite(record: any) {
  isPublishingPosition({ companyId: corpInfo.id, classify: record.classify }).then((res: any) => {
    if (res.success) {
      if (res.result == true) {
        state.setInfo = record;
        state.Interviewvisible = true;
        state.title = "温馨提示：只有审核通过且处于发布中的职位才能发起面试邀请";
      } else {
        Modal.confirm({
          title: "提示",
          content: () => h("div", {}, [h("p", "当前账户未添加职位，请先添加职位")]),
          okText: "去添加",
          cancelText: "取消",
          onOk: () => {
            router.push("/PositionAdmin");
          },
        });
      }
    }
  });
}

function onVideoInterview(record: any) {
  // TODO:restore 原 chunk 读取 state.rtnUrl.videoUrl，但 state 里从未赋值 rtnUrl（iframUrl/iframShow 也没有在模板中使用），原样保留
  state.iframUrl = state.rtnUrl.videoUrl + "?companyId=" + record.companyId + "&positionId=" + record.positionId + "&invitationId=" + record.invitationId;
  state.title = "已预定面试小屋";
  state.iframShow = true;
}

function onInterviewOk(payload: any) {
  state.Interviewvisible = false;
  if (state.setInfo.dataSourceType == "90") {
    // TODO:restore 同上，state.rtnUrl 未定义
    state.iframUrl =
      state.rtnUrl.moveUrl +
      "?companyId=" + corpInfo.id +
      "&companyName=" + corpInfo.name +
      "&jobUserId=" + state.setInfo.curriculumVitaeId +
      "&jobUserName=" + state.setInfo.realName +
      "&positionName=" + state.setInfo.positionName +
      "&positionId=" + state.setInfo.positionId +
      "&invitationId=" + payload.invitId +
      "&deviceNumber=" + state.setInfo.deviceNumber;
    state.title = "选择面试小屋";
    state.iframShow = true;
    console.log(state.iframUrl);
  } else {
    getList();
  }
}

function onInterviewCancel() {
  state.Interviewvisible = false;
  getList();
}

function onSetStatus(record: any) {
  state.setStatus = record;
  state.setStatusvisible = true;
  state.title = "说明：设置的状态仅供单位查看";
}

function onSetStatusOk() {
  getList();
  state.setStatusvisible = false;
}

function onSetStatusCancel() {
  state.setStatusvisible = false;
}

function onAddTalent(ids: any, type: string) {
  Modal.confirm({
    title: "提示",
    content: () => h("div", {}, [h("p", "确认加入人才库吗")]),
    okText: "确定",
    cancelText: "关闭",
    onOk: () => {
      addTalent({ companyId: corpInfo.id, ids, type }).then((res: any) => {
        if (res.success) {
          message.success(res.message);
          getList();
        }
      });
    },
  });
}

function downloadResume(record: any) {
  console.log(record);
  try {
    downPdf({ id: record.curriculumVitaeId, companyId: record.companyId }).then((res: any) => {
      const blob = new Blob([res], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      const prefix = record.realName ? record.realName + "-" : "";
      link.download = prefix + record.positionName + ".pdf";
      link.click();
      link.remove();
    });
  } catch (err) {
    message.error("下载简历异常");
    console.error("下载简历异常=", err);
  }
}

function viewFiles(record: any) {
  if (record?.fileList.length < 1) {
    message.warning("暂无简历");
    return;
  }
  state.fileFormVisible = true;
  state.fileFormList = record.fileList;
}

const downloadScanFile = async (file: any) => {
  if (!file.filePath) return;
  const fileName = file.fileName;
  const url = API_BASE + STATIC_BASE + "/" + file.filePath;
  downloadFile(url, fileName);
};
</script>

<template>
  <div ref="globalModal">
    <div>
      <a-tabs v-model:activeKey="state.activeKey" @change="onTabChange" type="card">
        <a-tab-pane v-for="(tab, tabIndex) in state.tabstitle" :tab="tab.label" :key="tab.value">
          <a-row v-if="state.activeKey == '0'" class="setClass">
            <a-col :span="8">
              <a-form-item name="lookupStatusText" label="简历状态">
                <DictCode
                  dictCode="lookup_status"
                  ptitle="请选择"
                  :showSearch="false"
                  :outputdisabled="state.outputdisabled"
                  @checkedisForm="onLookupStatusChange"
                  :paramdata="state.user.lookupStatusText"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="statusText" label="邀请状态">
                <DictCode
                  dictCode="deliver_status"
                  ptitle="请选择"
                  :showSearch="false"
                  :outputdisabled="state.outputdisabled"
                  @checkedisForm="onStatusChange"
                  :paramdata="state.user.statusText"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="realName" label="姓名">
                <a-input
                  v-model:value="state.user.realName"
                  placeholder="请输入姓名搜索"
                  oninput="value=value.replace(/[, ]/g,'')"
                  onkeyup="value=value.replace(/[, ]/g,'')"
                />
              </a-form-item>
            </a-col>
            <a-col v-if="props.showFairName" :span="8">
              <a-form-item name="jobFairName" label="招聘会名称">
                <a-input
                  v-model:value="state.user.jobFairName"
                  placeholder="请输入招聘会名称搜索"
                  oninput="value=value.replace(/[, ]/g,'')"
                  onkeyup="value=value.replace(/[, ]/g,'')"
                />
              </a-form-item>
            </a-col>
            <a-col :lg="6">
              <a-button class="marginleft" type="primary" preIcon="ant-design:search-outlined" @click="onSearch">查询</a-button>
              <a-button preIcon="ant-design:reload-outlined" @click="onReset" style="margin-left: 8px">重置</a-button>
            </a-col>
          </a-row>
          <div class="table newTable">
            <!-- 原 render 读取 rowSelection，但 setup 里没有定义，结果恒为 undefined，原样保留 -->
            <a-table
              bordered
              :loading="state.loading"
              :pagination="state.pagination"
              :row-selection="rowSelection"
              @change="onTableChange"
              :data-source="state.newest"
              :scroll="{ x: 'max-content' }"
              :columns="state.activeKey == '0' ? deliverColumns : state.activeKey == '10' ? scanColumns : registerColumns"
              :row-key="(row: any) => row.id"
            >
              <template #bodyCell="{ column, text, record }">
                <span v-if="record.izDeleteVitae && column.key === 'operation'" style="color: #999"> 当前用户简历无法查看 <a-tooltip placement="topLeft">
                    <template #title>
                      <p>用户将简历设置为不对外开放或删除等</p>
                    </template>
                    <question-circle-outlined style="font-size: 16px; color: #333" />
                  </a-tooltip>
                </span>
                <template v-else-if="column.key === 'operation'">
                  <template v-if="state.activeKey == '0'">
                    <a v-if="['2', null].includes(record.izSendInterview)" @click="onInvite(record)">邀请面试</a>
                    <span v-else>
                      <span style="color: #757575">已邀请</span>
                      <a-divider v-if="Number(record.dataSourceType) == 90" type="vertical" style="height: 10px; background-color: #e6e6e6" />
                      <a v-if="Number(record.dataSourceType) == 90" @click="onVideoInterview(record)">视频面试</a>
                    </span>
                    <a-divider type="vertical" style="height: 10px; background-color: #e6e6e6" />
                    <a @click="onSetStatus(record)">设置状态</a>
                    <a-divider type="vertical" style="height: 10px; background-color: #e6e6e6" />
                    <a v-if="record.isAddTalents == '2'" @click="onAddTalent(record.id, '1')">加入人才库</a>
                    <span v-else style="color: #757575">已加入人才库</span>
                    <a-divider type="vertical" style="height: 10px; background-color: #e6e6e6" />
                  </template>
                  <a v-if="state.activeKey == '0'" @click="downloadResume(record)">下载简历</a>
                  <a v-else @click="viewFiles(record)">查看简历</a>
                </template>
              </template>
              <template #realName="{ record }">
                <a-button v-if="record.izDeleteVitae" type="link" :disabled="1">{{ record.realName }}</a-button>
                <a-button v-else type="link" @click="previewResume(record)">{{ record.realName }}</a-button>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
      <SetStatusinterview
        v-if="state.setStatusvisible"
        izEndReply="0"
        :visible="state.setStatusvisible"
        :title="state.title"
        :setStatus="state.setStatus"
        @okclick="onSetStatusOk"
        @cancelClick="onSetStatusCancel"
      />
      <InterviewInvitation
        v-if="state.Interviewvisible"
        izEndReply="0"
        type="1"
        :izReceived="true"
        :classify="(props.classify || state.user.jobFairTypeZcyz) * 1 + 50"
        :visible="state.Interviewvisible"
        :title="state.title"
        :setInfo="state.setInfo"
        @okclick="onInterviewOk"
        @cancelClick="onInterviewCancel"
      />
      <a-modal v-model:visible="state.fileFormVisible" title="扫码简历" centered :footer="null">
        <p v-for="(file, fileIndex) in state.fileFormList" :key="'f' + fileIndex" style="color: var(--ant-primary-color); margin-bottom: 10px">
          <span>{{ fileIndex + 1 }}、</span>
          <span style="cursor: pointer" @click="downloadScanFile(file)">{{ file.fileName }}</span>
        </p>
      </a-modal>
    </div>
  </div>
</template>

<style scoped>
:deep(.ant-col-10 .ant-form-item-label),
:deep(.ant-col-12 .ant-form-item-label) {
  flex: 20% !important;
  max-width: 20% !important;
}
:deep(.ant-col-8 .ant-form-item-label) {
  flex: 33% !important;
  max-width: 33% !important;
}
:deep(.ant-col-24 .ant-form-item-label) {
  flex: 20% !important;
  max-width: 11% !important;
}
:deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
  border-radius: 5px;
}
:deep(.ant-btn),
:deep(.ant-input) {
  border-radius: 5px;
}
.setClass .ant-col .ant-form-item {
  display: flex;
  flex-flow: unset;
}
:deep(.hide.ant-table-cell) {
  display: none;
}
.table {
  margin-top: 30px;
}
.marginleft {
  margin-left: 30px;
}
:deep(.tableHiddle) {
  display: none;
}
:deep(.tableShow) {
  display: revert;
}
</style>
