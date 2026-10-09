<!--
  还原自 legacy-dist/portal/assets/resumemodal.1783320636200.js（__name: resumemodal，scopeId data-v-30d15804）
  样式来自 resumemodal.1783320636200.css（同 scopeId）。投递简历时"选择简历"弹窗。
  原导出名 → 新名：`r` → default export；`__tla` 不再需要。
  页面里 `import{r as X,__tla}from"./resumemodal…js"` 改为 `import ResumeModal from "@shared/resumemodal.vue"`。
-->
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { userStorage, openUserCenter } from "@/legacy";
import {
  listNoPageForDeliver, // 导出名 o：本站简历列表
  listNoPageForDeliver2 as listAllianceResumes, // 导出名 p：联盟简历列表
  add2 as deliverResume, // 导出名 r：本站投递
  add3 as deliverAllianceResume, // 导出名 s：联盟投递
} from "@/api/api-17833206362002";

const props = defineProps({
  collapsed: Boolean,
  positionrecord: Array,
  setInfo: Object,
  visible: Boolean,
  title: String,
  id: String,
  izEndReply: String,
  zphId: { type: String, default: "" },
  careerTalkId: { type: String, default: "" },
  liveId: { type: String, default: "" },
  sourceId: { type: String, default: "" },
  bussinessType: { type: String, default: "" },
  bussinessTypeText: { type: String, default: "" },
  izAlliance: { type: Boolean, default: false },
});
const emit = defineEmits(["okclick", "cancelClick"]);

const route = useRoute();
const formRef = ref();
const user = userStorage.getUser();
// 原代码调用了下面两个读取但未使用返回值
userStorage.getXfSysUser();
userStorage.getCorp();

const state = reactive<any>({
  arraydata: [],
  dictCodelList: [],
  brandFold: false,
  length: 0,
  user: {
    xfSysUserId: user.id,
    positionId: props.setInfo.id,
    curriculumVitaeId: null,
    sysUserId: user.sysUserId,
    dataSourceType: 0,
    dataSourceTypeText: "网站",
    fairsId: route.query?.fairsId || props.setInfo.jobFairId || null,
    careerTalkId: route.query?.careerTalkId || undefined,
  },
});

onMounted(() => {
  loadResumes();
  if (props.zphId) state.user.fairsId = props.zphId;
  if (props.careerTalkId) state.user.careerTalkId = props.careerTalkId;
});

function loadResumes() {
  props.izAlliance ? loadAllianceResumes() : loadSiteResumes();
}

// 默认选中与职位类别一致的简历，否则选第一份（原逻辑在 map 里逐条覆盖，原样保留）
function loadSiteResumes() {
  listNoPageForDeliver(state.user).then((res: any) => {
    if (res.success) {
      const list: { value: unknown; label: unknown }[] = [];
      res.result.map((item: any) => {
        list.push({ value: item.id, label: item.name });
        item.positionTypeId == props.setInfo.positionTypeId
          ? (state.user.curriculumVitaeId = item.id)
          : (state.user.curriculumVitaeId = list[0].value);
      });
      state.dictCodelList = list;
    }
  });
}

function loadAllianceResumes() {
  listAllianceResumes(state.user).then((res: any) => {
    if (res.success) {
      const list: { value: unknown; label: unknown }[] = [];
      res.result.map((item: any) => {
        list.push({ value: item.id, label: item.name });
        item.positionTypeId == props.setInfo.positionTypeId
          ? (state.user.curriculumVitaeId = item.id)
          : (state.user.curriculumVitaeId = list[0].value);
      });
      state.dictCodelList = list;
    }
  });
}

function onResumeChange(option: { value: unknown }) {
  state.user.curriculumVitaeId = option.value;
}

// "修改简历"：跳用户中心（有选中简历则编辑该简历，否则进我的简历）
function editResume() {
  state.user.curriculumVitaeId
    ? openUserCenter("Createaresume?iscopy=false&edit=true&id=" + state.user.curriculumVitaeId + "&identitytype=2")
    : openUserCenter("myresume?identitytype=2");
}

const handleOk = async () => {
  props.izAlliance ? await submitAlliance() : await submitSite();
};

const submitSite = async () => {
  try {
    await formRef.value.validateFields();
    const params = { ...state.user };
    if (!params.fairsId) delete params.fairsId;
    if (props.liveId && props.liveId !== "") {
      params.sourceId = props.liveId;
      params.bussinessType = "70";
      params.bussinessTypeText = "直播带岗";
    }
    if (props.sourceId) {
      params.sourceId = props.sourceId;
      params.bussinessType = props.bussinessType;
      params.bussinessTypeText = props.bussinessTypeText;
    }
    deliverResume(params).then((res: any) => {
      if (res.success) {
        message.success(res.message);
        emit("okclick", { visible: false });
      }
    });
  } catch (err) {
    console.log("Failed:", err);
  }
};

const submitAlliance = async () => {
  try {
    await formRef.value.validateFields();
    const params = { ...state.user };
    params.careerTalkId = undefined;
    deliverAllianceResume(params).then((res: any) => {
      if (res.success) {
        message.success(res.message);
        emit("okclick", { visible: false });
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
    <!--
      原文如此：v-model:visible 直接写回 props.visible；okText / cancelText / labelCol / wrapperCol 均未声明（编译为 undefined），原样保留。
    -->
    <a-modal
      v-model:visible="props.visible"
      :title="props.title"
      :ok-text="props.okText"
      :maskClosable="false"
      :cancel-text="props.cancelText"
      @ok="handleOk"
      @cancel="handleCancel"
      :getContainer="() => $refs.globalModal"
      width="700px"
    >
      <a-form
        ref="formRef"
        :model="state.user"
        name="basic"
        autocomplete="off"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-row class="setClass">
          <a-col :span="20">
            <a-form-item
              name="curriculumVitaeId"
              label="选择简历"
              :rules="[{ required: true, message: '请选择简历', trigger: 'blur' }]"
            >
              <a-select
                :labelInValue="true"
                v-model:value="state.user.curriculumVitaeId"
                placeholder="请选择简历"
                :options="state.dictCodelList"
                optionFilterProp="label"
                @change="onResumeChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="4" class="textRight">
            <a-button type="link" @click="editResume">修改简历</a-button>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
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
