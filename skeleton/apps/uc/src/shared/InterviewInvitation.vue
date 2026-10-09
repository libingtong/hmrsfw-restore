<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/InterviewInvitation.17516156075452.js（__name "InterviewInvitation"，scopeId data-v-85ce95bb；
// 样式规则实际在 InterviewInvitation.1751615607545.css 里，按 scopeId 摘取）。
// 注意：InterviewInvitation.1751615607545.js 是另一个组件（企业端面试邀请列表页，scopeId data-v-1b4bbe22），这里不还原。
// 原导出名 → 新名：`I` → 本文件 default export。
//   页面侧写法：import InterviewInvitation from "@shared/InterviewInvitation.vue";
// 入口包导入：`d` → decryptStorage、`k` → getDictItemsByCode（@/legacy）；`p` → dayjs；`M` → Modal（ant-design-vue）；
//   `as`/`at`/`au`/`av`（入口本地名 E7t/z7t/T7t/x7t）是入口包里的面试邀请接口，`@/legacy` 里还没有，按 beonmodal.vue 的做法在这里定义。
// 共享 chunk：message.1751615607545.js 的 `s` → successCountdown（@shared/message）。
import { request } from "@/utils/request";

// TODO:restore 入口包 `as`/`at`/`au`/`av` 补进 @/legacy 后改为从 @/legacy 导入
/** 入口包 `as`：面试邀请短信模板 */
export const getInterviewTemplate = (params: unknown) =>
  request({ url: "/xf-job/job/xfJobInterviewInvitation/interviewTemplate", method: "get", params });
/** 入口包 `at`：可发起面试的职位 */
export const getInterviewPosition = (params: unknown) =>
  request({ url: "/xf-job/job/xfJobInterviewInvitation/getInterviewPosition", method: "post", params });
/** 入口包 `au`：招聘会场景下发起面试邀请 */
export const interviewInvitationByFair = (data: unknown) =>
  request({ url: "/xf-job/job/xfJobInterviewInvitation/interviewInvitationByFair", method: "post", data });
/** 入口包 `av`：发起面试邀请 */
export const interviewInvitation = (data: unknown) =>
  request({ url: "/xf-job/job/xfJobInterviewInvitation/interviewInvitation", method: "post", data });
</script>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { Modal } from "ant-design-vue";
import dayjs from "dayjs";
import { decryptStorage, getDictItemsByCode } from "@/legacy";
import { successCountdown } from "@shared/message";

const props = defineProps({
  collapsed: Boolean,
  positionrecord: Array,
  setInfo: Object,
  visible: Boolean,
  title: String,
  id: String,
  izEndReply: String,
  type: String,
  izReceived: { type: Boolean, default: false },
  classify: { type: [String, Number], default: 0 },
});
const emit = defineEmits(["okclick", "cancelClick"]);

const formRef = ref();
// 原 chunk 读取后未使用，原样保留
decryptStorage(localStorage.getItem("userCenterInfo"), "userCenterInfo");
decryptStorage(localStorage.getItem("xfSysUserId"), "xfSysUserId");
const corpInfo = decryptStorage(localStorage.getItem("corpInfo"), "corpInfo") as Record<string, any>;

const setInfo = props.setInfo as Record<string, any>;

const state = reactive<Record<string, any>>({
  typeList: [],
  dictCodelList: [],
  click: true,
  formats2: "YYYY-MM-DD HH:mm",
  formats: "YYYY-MM-DD HH:mm:ss",
  brandFold: false,
  length: 0,
  content: "",
  contentCopy: "",
  user: {
    type: props.type,
    curriculumVitaeDeliverId: setInfo.id,
    curriculumVitaeId: setInfo.curriculumVitaeId,
    positionId: undefined,
    jobType: null,
    remark: "",
    interviewTime: "",
    registerSource: "0",
    registerSourceText: "网站",
  },
  zhiweilaebl: "",
  zhiweishijian: "",
  from: "",
});

onMounted(() => {
  state.from = setInfo.dataSourceType;
  init();
});

function init() {
  getInterviewTemplate({ companyId: corpInfo.id }).then((res: any) => {
    if (res.success) {
      state.content = res.result;
      state.contentCopy = res.result;
      localStorage.setItem("content", res.result);
    }
  });
  if (props.izReceived) {
    state.user.positionType = "0";
    getPositionList();
  } else {
    getDictItemsByCode({ dictCode: "position_classify_interview" }).then((res: any) => {
      state.typeList = res.result ? res.result : [];
      if (state.typeList.length > 0) state.user.positionType = state.typeList[0].value;
      getPositionList();
    });
  }
}

function getPositionList() {
  let classify: any = "";
  if (props.izReceived) {
    classify = props.classify ? props.classify : "0";
  } else {
    classify = state.user.positionType ? state.user.positionType : "0";
  }
  getInterviewPosition({ classify, companyId: corpInfo.id }).then((res: any) => {
    if (res.success) {
      const list: any[] = [];
      res.result.map((item: any) => {
        list.push({ value: item.id, label: item.name });
      });
      state.dictCodelList = list;
    }
  });
}

function onTypeChange(option: any) {
  state.user.positionType = option.value ? option.value : "";
  state.user.positionTypeText = option.label ? option.label : "";
  getPositionList();
  if (state.user.positionId) {
    state.content = state.content.replace(state.zhiweilaebl, "{#职位名称#}");
    state.user.positionId = null;
    state.zhiweilaebl = "";
  }
}

function onPositionChange(option: any) {
  state.user.positionId = option.value;
  if (state.zhiweilaebl == "") {
    state.content = state.content.replace("{#职位名称#}", option.label);
    state.zhiweilaebl = option.label;
    state.contentCopy = state.content;
  } else {
    state.content = state.content.replace(state.zhiweilaebl, option.label);
    state.zhiweilaebl = option.label;
    state.contentCopy = state.content;
  }
  console.log("替换", state.content);
}

const onTimeChange = (value: any) => {
  if (value) {
    // 原 chunk 就是把 ref(dayjs(...)) 写进 reactive 对象（读取时会被自动解包），原样保留
    state.user.interviewTime = ref(dayjs(value, state.formats));
    if (state.zhiweishijian == "") {
      state.content = state.content.replace("{#面试时间#}", dayjs(state.user.interviewTime).format(state.formats));
      state.zhiweishijian = dayjs(state.user.interviewTime).format(state.formats);
    } else {
      state.content = state.content.replace(state.zhiweishijian, dayjs(state.user.interviewTime).format(state.formats));
      state.zhiweishijian = dayjs(state.user.interviewTime).format(state.formats);
    }
  } else {
    state.content = state.contentCopy;
    state.zhiweishijian = "";
  }
};

const onOk = async () => {
  try {
    await formRef.value.validateFields();
    state.user.interviewTime = state.user.interviewTime ? dayjs(state.user.interviewTime).format("YYYY-MM-DD HH:mm:ss") : null;
    if (state.click) {
      state.click = false;
      if (setInfo.fairsId) {
        state.user.fairsId = setInfo.fairsId;
        interviewInvitationByFair(state.user).then((res: any) => {
          state.click = true;
          if (res.success) {
            successCountdown("请您按时安排面试，希望您能招聘到合适的人才，敬候佳音！");
            const payload = { visible: false, invitId: res.result.invitationId };
            emit("okclick", payload);
          }
        });
      } else {
        interviewInvitation(state.user).then((res: any) => {
          state.click = true;
          if (res.success) {
            successCountdown("请您按时安排面试，希望您能招聘到合适的人才，敬候佳音！");
            const payload = { visible: false, invitId: res.result.invitationId };
            emit("okclick", payload);
          }
        });
      }
    }
  } catch (err) {
    state.click = true;
    console.log("Failed:", err);
  }
};

const onCancel = () => {
  emit("cancelClick", { visible: false });
};
</script>

<template>
  <div ref="globalModal">
    <!-- 原 render 读取 okText / cancelText（未声明为 prop）和 labelCol / wrapperCol（setup 未定义），结果恒为 undefined，原样保留 -->
    <Modal
      v-model:visible="props.visible"
      :title="props.title"
      :ok-text="(props as any).okText"
      :maskClosable="false"
      :cancel-text="(props as any).cancelText"
      @ok="onOk"
      @cancel="onCancel"
      :getContainer="() => $refs.globalModal"
      width="700px"
    >
      <a-form
        ref="formRef"
        layout="vertical"
        :model="state.user"
        name="basic"
        autocomplete="off"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-row v-if="!props.izReceived" class="setClass">
          <a-col :span="11">
            <a-form-item name="positionType" label="职位类型" :rules="[{ required: true, message: '请选择职位类型', trigger: 'blur' }]">
              <a-select
                :labelInValue="true"
                v-model:value="state.user.positionType"
                placeholder="请选择职位类型"
                :options="state.typeList"
                optionFilterProp="label"
                @change="onTypeChange"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="setClass">
          <a-col :span="11">
            <a-form-item name="positionId" label="面试职位" :rules="[{ required: true, message: '请选择面试职位', trigger: 'blur' }]">
              <a-select
                :labelInValue="true"
                v-model:value="state.user.positionId"
                placeholder="请选择面试职位"
                :options="state.dictCodelList"
                optionFilterProp="label"
                @change="onPositionChange"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="Number(state.from) == 90" :span="11" class="maringleft">
            <a-form-item name="interviewTime" label="面试时间">
              <a-date-picker
                style="width: 100%"
                v-model:value="state.user.interviewTime1"
                :format="state.formats2"
                :valueFormat="state.formats"
                :show-time="{ defaultValue: dayjs('00:00', 'HH:mm') }"
                placeholder="请选择面试时间"
                @change="onTimeChange"
                disabled
              />
            </a-form-item>
          </a-col>
          <a-col v-else :span="11" class="maringleft">
            <a-form-item name="interviewTime" label="面试时间" :rules="[{ required: true, message: '请选择面试时间', trigger: 'blur' }]">
              <a-date-picker
                style="width: 100%"
                v-model:value="state.user.interviewTime1"
                :format="state.formats2"
                :valueFormat="state.formats"
                :show-time="{ defaultValue: dayjs('00:00', 'HH:mm') }"
                placeholder="请选择面试时间"
                @change="onTimeChange"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="state.content" :span="24" class="tipBox">{{ state.content }}</a-col>
          <a-col :span="24" class="tipBox2"> 说明：<br /> 1.每个岗位对每个求职者只能发起一次面试邀请，邀请内容会以短信的形式发送至用户手机。<br /> 2.若上述内容中的联系人手机号/地址错误，请修改本岗位的联系方式后再邀请。<br /> 3.面试邀请发送成功，求职者接受邀请后，才可查看求职者联系方式。 </a-col>
          <a-col :span="24">
            <a-form-item name="remark" label="备注">
              <a-textarea :rows="4" v-model:value="state.user.remark" placeholder="请输入面试要求/注意事项，50字以内" :maxlength="50" show-count />
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
  margin-left: 50px;
}
.maringRight {
  margin-right: 10px;
  margin-bottom: 10px;
}
.tipBox {
  padding: 20px;
  border: 1px dashed #e1e1e1;
  color: #888;
}
.tipBox2 {
  padding: 20px;
  border: 1px dashed #e1e1e1;
  margin: 20px 0;
  color: #888;
}
</style>
