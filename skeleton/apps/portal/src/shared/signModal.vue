<script setup lang="ts">
// 还原自 legacy-dist/portal/assets/signModal.1783320636200.js（__name: signModal，scopeId data-v-484c8df1）
// 样式来自 signModal.1783320636200.css（同 scopeId）。招聘会"确认报名"弹窗。
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAppConfig, userStorage, SettingCodes, getSettingValueByCodes, openUserCenter, message } from "@/legacy";
import { checkIzShowApplySameNetworkFair, queryFairRegions, updateCompIntroduc } from "@/api/api-17";

const props = defineProps({
  visible: String,
  zphInfo: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["cancelClick", "okclick"]);

const appConfig = getAppConfig();
useRouter(); // 原代码调用了 useRouter() 但未使用返回值

const globalModal = ref<HTMLElement>();

// 原变量 e
let state = reactive<{
  netFairJob: Record<string, any>;
  corp: any;
  userInfo: any;
  zoneList: { value: string; label: string }[];
  isShowZone: boolean;
  zone: string | null;
  content: string;
  izJoin: boolean;
  showJoin: boolean;
  isShowPublic: boolean;
}>({
  netFairJob: {},
  corp: userStorage.getCorp(),
  userInfo: userStorage.getUser(),
  zoneList: [],
  isShowZone: false,
  zone: null,
  content: "",
  izJoin: false,
  showJoin: false,
  isShowPublic: false,
});

onMounted(() => {
  if (props.zphInfo && props.zphInfo.jobFairType == "30") {
    initFairSettings();
    checkIzShowApplySameNetworkFair({ jobFairId: props.zphInfo.jobFairId || props.zphInfo.id }).then((res: any) => {
      if (res.success && res.result == "1") state.showJoin = true;
    });
  }
});

// 原函数 te：读业务配置（是否展示招聘专区 / 对外公开电话）并拉取招聘专区列表
function initFairSettings() {
  // TODO:restore 骨架 SettingCodes 里缺 IZ_HAS_OUTFAIR_PUBLICPHONE（原值 "iz_has_outFair_publicPhone"），需在 @/legacy 里补上
  let codes = [SettingCodes.IZ_HIGH_FAIR_ZONE, (SettingCodes as any).IZ_HAS_OUTFAIR_PUBLICPHONE];
  getSettingValueByCodes({ code: codes.join(",") }).then((res: any) => {
    if (res.success) {
      let result = res.result;
      if (result) {
        let izHighFairZone = result[codes[0]];
        if (izHighFairZone && izHighFairZone == "1") {
          state.isShowZone = true;
          state.content = state.corp.introduction ? state.corp.introduction : "";
        } else {
          state.isShowZone = false;
        }
        let izHasPublicPhone = result[codes[1]];
        if (izHasPublicPhone && izHasPublicPhone == "1") {
          state.isShowPublic = true;
          state.corp.jobPhonePublic = state.corp.contactsTelephone ? state.corp.contactsTelephone : "";
        } else {
          state.isShowPublic = false;
        }
      }
    }
  });
  const fairId = props.zphInfo.jobFairId ? props.zphInfo.jobFairId : props.zphInfo.id;
  queryFairRegions({ id: fairId }).then((res: any) => {
    if (res.success && res.result && res.result.length !== 0) {
      const zoneList: { value: string; label: string }[] = [];
      res.result.map((region: any) => {
        zoneList.push({ value: region.id, label: region.name });
      });
      state.zoneList = zoneList;
    }
  });
}

// 原代码 a-modal 的 v-model:visible 直接把值写回 props.visible（Vue 会给 readonly 警告），原样保留
function updateVisible(val: any) {
  (props as any).visible = val;
}

// 原函数 J
function handleCancel() {
  emit("cancelClick", { visible: false });
}

// 原函数 le
function handleZoneChange(value: string) {
  state.zone = value;
}

// 原函数 se："单位信息有变动？点击修改！"
function goCorpAttestation() {
  // appCode 012 租户走 zcyz 前缀的单位认证页
  if (appConfig.appCode == "012") {
    openUserCenter("zcyzCorpAttestation?identitytype=1");
  } else {
    openUserCenter("CorpAttestation?identitytype=1");
  }
}

// 原函数 ie："提交报名"
function handleSubmit() {
  var mobileReg = /^1[3456789]\d{9}$/,
    phoneReg = /^(1[3-9]\d{9}|(\d{3,4}-?)?\d{7,8})$/;
  if (!state.corp.contacts || state.corp.contacts == "") message.error("请输入预订联系人");
  else if (!state.corp.contactsTelephone || state.corp.contactsTelephone == "") message.error("请输入预订联系方式");
  else if (!mobileReg.test(state.corp.contactsTelephone)) message.error("请输入正确的预订联系方式");
  else if ((state.isShowPublic && !state.corp.jobPhonePublic) || state.corp.jobPhonePublic == "") message.error("请输入招聘电话");
  else if (state.isShowPublic && !phoneReg.test(state.corp.jobPhonePublic)) message.error("请输入正确的招聘电话");
  else if (state.zoneList && state.zoneList.length !== 0 && !state.zone) message.error("请选择招聘专区");
  else if (state.isShowZone && state.content && state.content.length < 100 && props.zphInfo.advertiseType == "20")
    message.error("请输入不少于100字的单位简介");
  else if (state.isShowZone && state.content && state.content.length > 300 && props.zphInfo.advertiseType == "20")
    message.error("请输入不超过300字的单位简介");
  else {
    let fairId = props.zphInfo.id || props.zphInfo.jobFairId,
      classify = "40";
    if (props.zphInfo.jobFairType == "20") classify = "20";
    else if (props.zphInfo.jobFairType == "40") {
      if (props.zphInfo.jobFairTypeZcyz == "10") classify = "60";
      else if (props.zphInfo.jobFairTypeZcyz == "20") classify = "70";
      else if (props.zphInfo.jobFairTypeZcyz == "30") classify = "80";
    }
    emit("cancelClick", { visible: false });
    if (state.isShowZone && props.zphInfo.advertiseType == "20") {
      updateCompIntroduc({ introduction: state.content, id: state.corp.id }).then((res: any) => {
        if (!res.success) message.error(res.message);
      });
    }
    if (state.zoneList.length !== 0) {
      openUserCenter(
        `webFairWork/${fairId}?classify=${classify}&identitytype=1&name=${state.corp.contacts}&phone=${state.corp.contactsTelephone}&zone=${state.zone}` +
          (state.izJoin ? "&izJoinWeb=1" : "") +
          (state.isShowPublic ? `&jobPhonePublic=${state.corp.jobPhonePublic}` : ""),
      );
    } else {
      goFairWork(fairId, classify);
    }
  }
}

// 原函数 ce：跳用户中心的报名页
function goFairWork(fairId: string, classify: string) {
  // appCode 012 租户走 zcyz 前缀的报名页
  if (appConfig.appCode == "012") {
    openUserCenter("zcyzwebFairWork/" + fairId + "?classify=" + classify + "&identitytype=1&name=" + state.corp.contacts + "&phone=" + state.corp.contactsTelephone);
  } else {
    openUserCenter(
      `webFairWork/${fairId}?classify=${classify}&identitytype=1&name=${state.corp.contacts}&phone=${state.corp.contactsTelephone}` +
        (state.izJoin ? "&izJoinWeb=1" : "") +
        (state.isShowPublic ? `&jobPhonePublic=${state.corp.jobPhonePublic}` : ""),
    );
  }
}
</script>

<template>
  <div ref="globalModal">
    <!--
      原代码：visible 用 v-model 直接写回 props.visible（Vue 会给 readonly 警告，行为照旧）；
      同时传了 getContainer（函数）和 get-container（false），后者在 props 归一化时覆盖前者，两者都原样保留。
    -->
    <a-modal
      :visible="props.visible"
      @update:visible="updateVisible"
      :closable="true"
      title="确认报名"
      @cancel="handleCancel"
      :getContainer="() => globalModal"
      maskClosable="false"
      :width="state.isShowZone ? 700 : 600"
      :footer="null"
      :get-container="false"
    >
      <div class="online-stepBox clearfix">
        <div>
          <div class="line30 u-8 font-16" style="margin: 20px">
            <div class="font-30 bold u-3 lineH40">{{ props.zphInfo.jobFairName }}</div>
            <div class="marT20 flex">
              <div class="w25">时间：</div>
              {{ props.zphInfo.beginTime || props.zphInfo.beginTimeStr }}至{{ props.zphInfo.endTime || props.zphInfo.endTimeStr }}
            </div>
            <div class="marT10 flex flex-wrap">
              <div class="w25">主办单位：</div>
              <div class="w75">{{ props.zphInfo.hostCompany }}</div>
            </div>
            <div class="marT10 flex flex-wrap">
              <div class="w25">报名单位：</div>
              <div class="w75">{{ state.corp.name }}</div>
            </div>
            <div class="marT10 flex">
              <div class="w25"><i class="u-red font-16 marR5">*</i>预订联系人：</div>
              <a-input style="height: 35px" v-model:value="state.corp.contacts" placeholder="请输入预订联系人" class="w75 font-16" />
            </div>
            <div class="marT10 flex">
              <div class="w25"><i class="u-red font-16 marR5">*</i>预订联系方式：</div>
              <a-input style="height: 35px" v-model:value="state.corp.contactsTelephone" placeholder="请输入预订联系方式" class="w75 font-16" />
            </div>
            <div v-if="state.isShowPublic" class="marT10 flex">
              <div class="w25"><i class="u-red font-16 marR5">*</i>招聘电话(对外公开)：</div>
              <a-input style="height: 35px" v-model:value="state.corp.jobPhonePublic" placeholder="请输入招聘电话" class="w75 font-16" />
            </div>
            <div v-if="state.showJoin" class="marT10 flex u-blue izJoinCheck">
              <a-checkbox v-model:checked="state.izJoin" class="marR10 marLeft20 u-blue" />同时报名同期线上招聘会
            </div>
            <div v-if="state.zoneList.length !== 0" class="marT10 flex">
              <div class="w25"><i class="u-red font-16 marR5">*</i>选择招聘专区：</div>
              <a-select
                v-model:value="state.zone"
                placeholder="请选择招聘专区"
                :options="state.zoneList"
                @change="handleZoneChange"
                class="w75 font-16"
                show-search
              />
            </div>
            <div v-if="state.isShowZone && props.zphInfo.advertiseType == '20'" class="marT10 flex relative">
              <span class="u-red font-12 absolute" style="top: 30px; left: -20px">(100-300字以内，请确认内容)</span>
              <div class="w25"><i class="u-red font-16 marR5">*</i>单位简介： </div>
              <a-textarea
                placeholder="请输入单位简介内容，不超过300字"
                :rows="5"
                v-model:value="state.content"
                show-count
                :maxlength="300"
                class="w75 font-16"
              />
            </div>
            <div class="font-14 marT20" style="color: red; font-size: 14px">
              温馨提示：请核对您的报名信息，发布招聘职位后即可完成报名，审核结果将会以短信的形式发送至您的预定手机号中，请留意查收，再次感谢您的参与！
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-pack-between">
        <div @click="goCorpAttestation" class="u-blue lf marLeft20 pointer">单位信息有变动？点击修改！</div>
        <div>
          <a-button type="info" @click="handleCancel" style="margin-right: 10px" class="hoverBlue">暂不报名</a-button>
          <a-button type="default" class="defaultBtn hoverBgBlue" @click="handleSubmit" style="margin-right: 20px">提交报名</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
/* signModal.1783320636200.css（data-v-484c8df1） */
:deep(.izJoinCheck .ant-checkbox-inner){border:1px solid #09f}
</style>
