<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/confPass.1751615607545.js（+ confPass.1751615607545.css，scopeId data-v-6de9d024）
// 原导出名 → 新名：
//   `c` → 本文件 default export（"生成参会证"弹窗组件）
//   `m` → queryMySubscribeFair（具名导出）
//   `o` → fairSubscribe（具名导出）
//   页面侧写法：import ConfPass, { queryMySubscribeFair, fairSubscribe } from "@shared/confPass.vue";
//   <ConfPass :visible="v" :zphInfo="info" type="user|company" @okclick="fn" @cancelClick="fn" />
// 第三方库：`./html2canvas.esm.1751615607545.js` → npm 包 html2canvas@1.4.1（chunk 头部版权注释写明 1.4.1）。
// 入口包导入：`w`(本地 h，request 实例) → request（@/utils/request）；`d`(本地 x) → decryptStorage（@/legacy）；
//   `m`(本地 w) → message（ant-design-vue）；`B`(本地 Z) → API_BASE、`h`(本地 G) → STATIC_BASE（@/utils/request）。
import { request } from "@/utils/request";

/** 原导出 `m`：我订阅的招聘会 */
export const queryMySubscribeFair = (data: unknown) =>
  request({ url: "/xf-job/job/xfJobFairApplyInfoPerson/queryMySubscribeFair", method: "post", data });
/** 原导出 `o`：订阅招聘会 */
export const fairSubscribe = (data: unknown) =>
  request({ url: "/xf-job/job/xfJobFairApplyInfoPerson/fairSubscribe", method: "post", data });
/** 参会证模板列表（chunk 内部） */
// 原调用还带了第二、三个参数 {isTransformResponse:false}、{contentType:"FORM_URLENCODED"}（原 request 实例的选项）；
// @/utils/request 只接收 axios 配置，且本身就不做 transform，这两个选项不再传。
const getVitaeTemplateList = (params: unknown) => request({ url: "/xf-job/job/xfJobVitaeTemplate/list", method: "get", params });
/** 生成参会证 HTML（chunk 内部） */
const generateChzHtml = (data: unknown) => request({ url: "/xf-job/job/xfJobFair/generateChzHtml", method: "post", data });
</script>

<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
import html2canvas from "html2canvas";
import { API_BASE, STATIC_BASE } from "@/utils/request";
import { decryptStorage } from "@/legacy";

type Template = { id: string; name: string; coverPath: string };
type StoredEntity = { id?: string; name?: string; realName?: string };

const props = defineProps({
  visible: Boolean,
  zphInfo: Object,
  type: String,
});
const emit = defineEmits(["okclick", "cancelClick"]);

useRoute(); // 原代码调用了 useRoute() 但没有使用返回值

let userById = decryptStorage<StoredEntity>(localStorage.getItem("userbyid"), "userbyid");
decryptStorage(localStorage.getItem("xfSysUserId"), "xfSysUserId"); // 原代码解密后未使用
let corpInfo = decryptStorage<StoredEntity>(localStorage.getItem("corpInfo"), "corpInfo");

const state = reactive({
  value: "a",
  temList: [] as Template[],
  activeTemId: "",
  imgContent: "",
  checkImg: false,
});

onMounted(() => {
  loadTemplates();
});

function loadTemplates() {
  getVitaeTemplateList({ pageNo: 1, pageSize: 10, type: 40 }).then((res) => {
    if (res.success) {
      state.temList = (res.result as { records: Template[] }).records;
      state.activeTemId = state.temList[0].id;
    }
  });
}

const poster = ref<HTMLElement>();
const loading = ref(false);

/** 立即生成：后端生成参会证 HTML → 离屏渲染 → html2canvas 截图下载 */
const handleOk = async () => {
  if (loading.value) return;
  try {
    let params = {};
    const zphInfo = props.zphInfo as { jobFairId: string; jobFairName: string };
    if (props.type == "company")
      params = {
        companyId: corpInfo == null ? undefined : corpInfo.id,
        companyName: corpInfo == null ? undefined : corpInfo.name,
        dataSourceType: "80",
        jobFairId: zphInfo.jobFairId,
        templateId: state.activeTemId,
      };
    if (props.type == "user")
      params = {
        dataSourceType: "80",
        jobFairId: zphInfo.jobFairId,
        realName: userById == null ? undefined : userById.realName,
        templateId: state.activeTemId,
        xfSysUserId: userById == null ? undefined : userById.id,
      };
    generateChzHtml(params).then((res) => {
      if (res.success) {
        state.imgContent = res.result as string;
        state.checkImg = true;
        loading.value = true;
        setTimeout(() => {
          html2canvas(poster.value as HTMLElement, { backgroundColor: "#fff", useCORS: true, width: 750, height: 1138 }).then((canvas) => {
            const dataUrl = canvas.toDataURL("image/png");
            let link = document.createElement("a");
            link.href = dataUrl;
            link.download = zphInfo.jobFairName + "参会证";
            link.click();
            link.remove();
            message.success("下载成功！");
            loading.value = false;
            state.checkImg = false;
            emit("okclick", { visible: false });
          });
        }, 400);
      } else {
        message.error(res.message as string);
      }
    });
  } catch (err) {
    console.log("Failed:", err);
  }
};

const handleCancel = () => {
  emit("cancelClick", { visible: false });
};
</script>

<template>
  <div ref="globalModal">
    <a-modal
      v-model:visible="props.visible"
      title="生成参会证"
      ok-text="立即生成"
      :maskClosable="false"
      cancel-text="暂不生成"
      @ok="handleOk"
      @cancel="handleCancel"
      centered
      :getContainer="() => $refs.globalModal"
      width="700px"
    >
      <a-spin :spinning="loading">
        <a-row justify="start" style="padding: 0" :gutter="[20, 20]">
          <div v-if="state.temList?.length == 0" v-loading="state.temList?.length == 0"></div>
          <a-col v-for="(item, index) in state.temList" :span="8" :key="index">
            <div class="temBox">
              <a-image width="100%" height="100%" :placeholder="true" :src="API_BASE + STATIC_BASE + '/' + item.coverPath" />
              <a-radio @click="state.activeTemId = item.id" style="padding-top: 16px" :checked="state.activeTemId === item.id">{{ item.name }}</a-radio>
            </div>
          </a-col>
        </a-row>
      </a-spin>
    </a-modal>
    <div v-if="state.checkImg" ref="poster" class="posterImg" style="position: absolute; left: -100%">
      <div v-html="state.imgContent"></div>
    </div>
  </div>
</template>

<style scoped>
/* 原样来自 legacy-dist/usercenter/assets/confPass.1751615607545.css（data-v-6de9d024） */
:deep(.ant-modal-footer){text-align:center;display:flex;justify-content:center}
.temBox{display:flex;flex-direction:column;align-items:center}
</style>
