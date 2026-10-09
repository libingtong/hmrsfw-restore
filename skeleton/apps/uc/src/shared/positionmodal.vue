<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/positionmodal.1751615607545.js + positionmodal.1751615607545.css（scopeId data-v-0ff88674）
// 共享组件 `positionmodal`：职位详情只读弹窗（按 id 拉职位详情，逐项展示，底部"关闭"）。
// 原导出名 → 新名：`p` → default export（import PositionModal from "@shared/positionmodal.vue"）
// 入口包导入：`a9` → detailById（@/legacy，入口兼容层需补；GET /xf-job/job/xfJobCompanyPosition/detailById）
//             `x` → joinAreaNames（@/legacy）；`p` → dayjs；`M` → Modal（ant-design-vue）；`_` → _export_sfc（不需要）
// 原样保留：模板里的 props.okText / props.cancelText / labelCol / wrapperCol 都未声明（运行时为 undefined）；
//           最后一行"联系地址/详细地址"判断的是 state.classify（不是 state.user.classify）；v-model 直接写 props.visible。
import { reactive, onMounted } from "vue";
import { Modal } from "ant-design-vue";
import dayjs from "dayjs";
import { detailById, joinAreaNames } from "@/legacy";

const props = defineProps({
  collapsed: Boolean,
  positionrecord: Array,
  visible: Boolean,
  title: String,
  classify: String,
  izEndReply: String,
});
const emit = defineEmits(["okclick", "cancelClick"]);

const state = reactive<any>({
  arraydata: [],
  detailList: [],
  brandFold: false,
  length: 0,
  user: { ssq: "" },
});

onMounted(() => {
  loadDetail();
});

async function loadDetail() {
  // 原代码：positionrecord 声明为 Array，实际按对象取 .id（原样保留）
  await detailById({ id: (props.positionrecord as any).id, callIden: 2, classify: props.classify }).then((res: any) => {
    state.user = res.result;
    state.user.ssq = joinAreaNames(res.result, "workProviceName");
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
  <div ref="globalModal">
    <Modal
      v-model:visible="props.visible"
      :closable="true"
      :title="props.title"
      :ok-text="props.okText"
      width="1200px"
      :maskClosable="false"
      :cancel-text="props.cancelText"
      @ok="handleOk"
      @cancel="handleCancel"
      :getContainer="() => $refs.globalModal"
      :footer="null"
    >
      <a-form ref="formRef" :model="state.user" name="basic" autocomplete="off" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row class="setClass">
          <a-col :span="8" v-if="state.user.classify == 90">
            <a-form-item name="izAbroad" label="去往国家"
              :rules="[{ required: true, message: '请输入去往国家', trigger: 'change' }]">
              <div>{{ state.user.toCountryName }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="positionTypeText" label="职位类别"
              :rules="[{ required: true, message: '请选择职位类别', trigger: 'change' }]">
              <div>{{ state.user.positionTypeText || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="name" label="职位名称"
              :rules="[{ required: true, message: '请输入职位名称', trigger: 'blur' }]">
              <div>{{ state.user.name || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="advertiseTypeText" label="招聘类型"
              :rules="[{ required: true, message: '请选择招聘类型', trigger: 'blur' }]">
              <div>{{ state.user.advertiseTypeText || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="advertiseCount" label="招聘人数"
              :rules="[{ required: true, message: '请输入招聘人数', trigger: 'blur' }]">
              <div>{{ state.user.advertiseCount || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="contacts" label="联系人"
              :rules="[{ required: true, message: '请输入联系人', trigger: 'blur' }]">
              <div>{{ state.user.contacts || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="contactsPhone" label="联系人手机"
              :rules="[{ required: true, message: '请输入联系人手机', trigger: 'blur' }]">
              <div>{{ state.user.contactsPhone || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="state.user.classify != 90">
            <a-form-item name="beginTime" label="开始日期"
              :rules="[{ required: true, message: '请选择开始日期', trigger: 'blur' }]">
              <div v-if="state.user.classify == '0'">{{ dayjs(state.user.beginTime).format("YYYY-MM-DD") }}</div>
              <div v-else>{{ dayjs(state.user.beginTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="state.user.classify != 90">
            <a-form-item name="endTime" label="终止日期"
              :rules="[{ required: true, message: '请选择终止日期', trigger: 'blur' }]">
              <div v-if="state.user.classify == '0'">{{ dayjs(state.user.endTime).format("YYYY-MM-DD") }}</div>
              <div v-else>{{ dayjs(state.user.endTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="state.user.classify != 90">
            <a-form-item name="ssq" label="工作地址"
              :rules="[{ required: true, message: '请选择工作地址', trigger: 'blur' }]">
              <div>{{ state.user.ssq || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="state.user.classify != 90">
            <a-form-item name="beginTime" label="招聘开始日期"
              :rules="[{ required: true, message: '请选择开始日期', trigger: 'blur' }]">
              <div v-if="state.user.classify == '0'">{{ dayjs(state.user.beginTime).format("YYYY-MM-DD") }}</div>
              <div v-else>{{ dayjs(state.user.beginTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8" v-if="state.user.classify != 90">
            <a-form-item name="endTime" label="招聘结束日期"
              :rules="[{ required: true, message: '招聘结束日期', trigger: 'blur' }]">
              <div v-if="state.user.classify == '0'">{{ dayjs(state.user.endTime).format("YYYY-MM-DD") }}</div>
              <div v-else>{{ dayjs(state.user.endTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="workNatureText" label="工作性质">
              <div>{{ state.user.workNatureText || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="startSalary" label="最低月薪资"
              :rules="[{ required: true, message: '请输入最低月薪资', trigger: 'blur' }]">
              <div v-if="state.user.startSalary">{{ state.user.startSalary }}元</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="endSalary" label="最高薪资"
              :rules="[{ required: true, message: '请输入最高薪资', trigger: 'blur' }]">
              <div v-if="state.user.endSalary">{{ state.user.endSalary }}元</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="educationalRequirementText" label="学历要求"
              :rules="[{ required: true, message: '请选择学历要求', trigger: 'blur' }]">
              <div>{{ state.user.educationalRequirementText || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="majorRequirementText" label="专业要求"
              :rules="[{ required: true, message: '请选择专业要求', trigger: 'blur' }]">
              <div>{{ state.user.majorRequirementText || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="workYearsText" label="工作年限"
              :rules="[{ required: true, message: '请选择工作年限', trigger: 'blur' }]">
              <div>{{ state.user.workYearsText || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="sexText" label="性别">
              <div>{{ state.user.sexText || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="minimumAge" label="最低年龄">
              <div>{{ state.user.minimumAge || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="maximumAge" label="最高年龄">
              <div>{{ state.user.maximumAge || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="24" class="lxBox">
            <a-form-item name="rideRoute" label="乘车路线">
              <div>{{ state.user.rideRoute || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="24" class="lxBox">
            <a-form-item name="rideRoute" :label="state.classify != 90 ? '联系地址' : '详细地址'">
              <div>{{ state.user.workAddress || '--' }}</div>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item name="companyBenefitsText" label="福利待遇"
              :rules="[{ required: true, message: '请选择福利待遇', trigger: 'blur' }]">
              <div>{{ state.user.companyBenefitsText || '--' }}</div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item name="positionDescribe" label="职位描述"
              :rules="[{ required: true, message: '请输入职位描述', trigger: 'blur' }]">
              <div>{{ state.user.positionDescribe || '--' }}</div>
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
:deep(.lxBox .ant-form-item-label > label) {
  width: 125px;
  justify-content: end;
}
</style>
