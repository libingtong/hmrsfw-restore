<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/beonmodal.1751615607545.js（+ beonmodal.1751615607545.css，scopeId data-v-1e6b66f8）
// 原导出名 → 新名：`b`（页面里 `import{b as X}from"./beonmodal.1751615607545.js"`）→ 本文件 default export。
//   页面侧写法：import Beonmodal from "@shared/beonmodal.vue";
//   <Beonmodal :visible="v" title="见习岗位详情" :positionrecord="record" @okclick="fn" @cancelClick="fn" />
// 入口包导入：`M` → Modal（ant-design-vue，这里作为组件直接用：unref(Modal)）；`x`(本地 T) → joinAreaNames（@/legacy）；
//   `p`(本地 x) → dayjs；`a9`(本地 q) → 入口包接口 xfJobCompanyPosition/detailById（对照表里还没有，
//   按"接口一律用 @/utils/request"在这里定义并具名导出 getPositionDetailById；入口兼容层补上 `a9` 后可改为从 @/legacy 导入）。
import { request } from "@/utils/request";

/** 入口包 `a9`：岗位详情 */
export const getPositionDetailById = (params: unknown) =>
  request({ url: "/xf-job/job/xfJobCompanyPosition/detailById", method: "get", params });
</script>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { Modal } from "ant-design-vue";
import dayjs from "dayjs";
import { joinAreaNames } from "@/legacy";

type PositionDetail = Record<string, any> & { ssq: string };

const props = defineProps({
  collapsed: Boolean,
  positionrecord: Array,
  visible: Boolean,
  title: String,
  izEndReply: String,
});
const emit = defineEmits(["okclick", "cancelClick"]);

const state = reactive({
  arraydata: [] as unknown[],
  detailList: [] as unknown[],
  brandFold: false,
  length: 0,
  user: { ssq: "" } as PositionDetail,
});

onMounted(() => {
  loadDetail();
});

async function loadDetail() {
  // 原代码：props.positionrecord 声明为 Array，但按对象取 .id，原样保留
  await getPositionDetailById({ id: (props.positionrecord as unknown as { id: string }).id, callIden: 2, classify: 10 }).then((res) => {
    const result = res.result as PositionDetail;
    state.user = result;
    state.user.ssq = joinAreaNames(result, "workProviceName") + result.workAddress;
  });
}

const handleOk = () => {
  emit("okclick", { visible: false });
};
const handleCancel = () => {
  emit("cancelClick", { visible: false });
};
</script>

<template>
  <!-- 原模板：ok-text / cancel-text 绑定 props.okText / props.cancelText，label-col / wrapper-col 绑定 _ctx.labelCol / _ctx.wrapperCol，均未声明（值为 undefined），原样保留 -->
  <div ref="globalModal">
    <Modal
      v-model:visible="props.visible"
      :closable="true"
      :title="props.title"
      :ok-text="(props as any).okText"
      width="800px"
      :maskClosable="false"
      :cancel-text="(props as any).cancelText"
      @ok="handleOk"
      @cancel="handleCancel"
      :getContainer="() => $refs.globalModal"
      :footer="null"
    >
      <a-form ref="formRef" :model="state.user" name="basic" autocomplete="off" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row class="setClass jianxi">
          <a-col :span="8">
            <a-form-item name="name" label="见习岗位名称" :rules="[{ required: true, message: '请输入见习岗位名称', trigger: 'blur' }]">
              <div>{{ state.user.name }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="educationalRequirementText" label="学历要求" :rules="[{ required: true, message: '请选择学历要求', trigger: 'blur' }]">
              <div>{{ state.user.educationalRequirementText }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="beginTime" label="见习时间起" :rules="[{ required: true, message: '请选择日期', trigger: 'blur' }]">
              <div>{{ dayjs(state.user.beginTime).format("YYYY-MM-DD") }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="endTime" label="见习时间止" :rules="[{ required: true, message: '请选择日期', trigger: 'blur' }]">
              <div>{{ dayjs(state.user.endTime).format("YYYY-MM-DD") }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="advertiseCount" label="招聘人数" :rules="[{ required: true, message: '请输入招聘人数', trigger: 'blur' }]">
              <div>{{ state.user.advertiseCount }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="livingCost" label="生活费标准" :rules="[{ required: true, message: '请输入生活费标准', trigger: 'blur' }]">
              <div>{{ state.user.livingCost }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="internshipTypeText" label="见习期限" :rules="[{ required: true, message: '请选择见习期限', trigger: 'change' }]">
              <div>{{ state.user.internshipTypeText }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <!-- 原模板：“专业要求”显示的是 internshipTypeText，原样保留 -->
            <a-form-item name="majorRequirementText" label="专业要求" :rules="[{ required: true, message: '请选择专业要求', trigger: 'blur' }]">
              <div>{{ state.user.internshipTypeText }}</div>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item name="ssq" label="工作地址" :rules="[{ required: true, message: '请选择工作地址', trigger: 'blur' }]">
              <div>{{ state.user.ssq }}</div>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item name="positionDescribe" label="见习要求" :rules="[{ required: true, message: '请输入见习要求', trigger: 'blur' }]">
              <div>{{ state.user.positionDescribe }}</div>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item>
              <div class="flex" style="justify-content: flex-end">
                <a-button class="primary" type="primary" size="large" @click="handleCancel">关闭</a-button>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </Modal>
  </div>
</template>

<style scoped>
/* 原样来自 legacy-dist/usercenter/assets/beonmodal.1751615607545.css（data-v-1e6b66f8） */
:deep(.ant-modal-footer){text-align:center;display:flex;justify-content:center}
:deep(.ant-modal-footer .ant-btn){margin:0 35px}
.user-avator{margin-right:20px}
.metorwen{margin-bottom:30px}
.wen{background-color:#7f83f7;font-size:14px;width:32px;height:32px;line-height:32px;color:#fff;text-align:center;float:left}
.da{background-color:#81b337;font-size:14px;width:32px;height:32px;line-height:32px;color:#fff;text-align:center;float:left}
.why{background-color:#f5f7fa;padding:15px;font-size:14px;width:94%}
.fold{display:block;height:58px;line-height:20px;text-align:center}
.maringleft{margin-right:10px}
:deep(.jianxi .ant-col-8 .ant-form-item-label){flex:33%!important;max-width:42%!important;text-align:left}
:deep(.jianxi .ant-col-24 .ant-form-item-label){flex:20%!important;max-width:14%!important;text-align:left}
</style>
