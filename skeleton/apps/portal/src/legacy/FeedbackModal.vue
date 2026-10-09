<script setup lang="ts">
// 入口包全局组件 `featback`（导出名 `a6`，局部名 Mk/vie，scopeId data-v-150e31b0）：意见反馈弹窗。
// 类型字典走带缓存的 getDictItemsByCode 同款请求（原 Lt，直接用 cachedRequest 以免与 @/legacy 循环引用），提交走 /xf-job/job/xfJobFeedbackRecord/add（原 BN），成功后 message.success。
import { onMounted, reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { request, cachedRequest } from "@/utils/request";
import { userStorage } from "@/legacy/storage";

defineOptions({ name: "featback" });

const props = defineProps({
  visible: [String, Boolean],
  title: String,
  okText: String,
  cancelText: String,
  contentTitle: String,
  closable: null, // 原定义是 `closable: ref()`，Vue 把它当作不限类型的 prop
  comltitle: String,
  type: String,
  complaintObjectId: String,
  businessType: { type: String, default: "0" },
  alertType: { type: String, default: "0" },
});
const emit = defineEmits(["okclick", "cancelClick"]);

type Option = { value: string; label: string };
const addFeedback = (data: unknown) => request({ url: "/xf-job/job/xfJobFeedbackRecord/add", method: "post", data });

const user = userStorage.getUser();
const globalModal = ref<HTMLElement>();
const state = reactive<{
  outputdisabledphone: boolean; outputdisabled?: boolean; value?: string; selectdata: Option[];
  rules: Record<string, unknown>; user: Record<string, any>;
}>({
  outputdisabledphone: true,
  selectdata: [],
  rules: { phone: [{ required: true, message: "请输入手机号", trigger: "blur" }, { pattern: /^1[3456789]\d{9}$/, message: "手机号码格式有误" }] },
  user: { xfSysUserId: user?.id, businessType: props.businessType, commentTypeText: "意见反馈" },
});

onMounted(() => { loadTypes(); });

function selectType(item: Option) {
  state.value = item.value;
  state.user.typeText = item.label;
  state.user.type = item.value;
}
function loadTypes() {
  cachedRequest("/jeecg-system/sys/dict/getDictItemsByCode", { dictCode: "feedback_object_type" }, "get").then((res: any) => {
    const list: Option[] = [];
    if (res.result != null) res.result.map((h: any) => { list.push({ value: h.value, label: h.text }); });
    state.selectdata = list;
    state.value = list[0].value;
    state.user.typeText = list[0].label;
    state.user.type = list[0].value;
  });
}
const onOk = () => { emit("okclick", { visible: false }); };
const onCancel = () => { reset(); emit("cancelClick", { visible: false }); };
function reset() {
  state.user.typeText = state.selectdata[0].label;
  state.user.type = state.selectdata[0].value;
  state.value = state.selectdata[0].value;
  state.user.title = "";
  state.user.content = "";
}
const onFinish = () => {
  state.user.commentType = props.alertType;
  // eslint-disable-next-line eqeqeq
  if ((props.alertType as unknown) == 10) {
    state.user.commentTypeText = "评论";
    state.user.businessType = undefined;
    state.user.type = undefined;
    state.user.typeText = undefined;
  }
  if (state.user.businessType == "30") {
    state.user.businessTypeText = "共享用工";
    state.user.type = "20";
    state.user.typeText = "其他";
  }
  addFeedback(state.user).then((res) => {
    if (res.success) { message.success(res.message as string); reset(); emit("cancelClick", { visible: false }); }
  });
};
const onFinishFailed = (err: unknown) => { console.log("Failed:", err, state.user); };
const typeHints = [
  "提交您对某业务模块在功能或操作上的改进建议",
  "提交您在操作各项功能时发现的无法使用或影响正常使用的问题",
  "提交您想要在本网站上实现的业务功能或其他想法",
];
</script>

<template>
  <div ref="globalModal">
    <a-modal
      :visible="props.visible"
      :closable="closable"
      :title="props.title"
      :ok-text="props.okText"
      width="901px"
      :cancel-text="props.cancelText"
      :get-container="() => globalModal"
      :footer="null"
      @ok="onOk"
      @cancel="onCancel"
    >
      <a-form ref="formRef" :model="state.user" name="basic" autocomplete="off" @finish-failed="onFinishFailed" @finish="onFinish">
        <a-row :gutter="20" style="margin-right: 55px">
          <a-col v-if="alertType == '0' && props.businessType !== '30'" :span="20">
            <a-form-item name="typeText" label="类型" :rules="[{ required: true, message: '请选择类型', trigger: 'blur' }]">
              <div class="flex">
                <div v-for="(item, idx) in state.selectdata" class="radioli1">
                  <a class="radioli1">
                    <div :class="['radioli', state.value == item.value ? 'checkedtrue' : 'checkedfalse']" @click="selectType(item)">
                      <p :class="['u-8', state.value == item.value ? 'checkedtruecolor' : 'checkedfalsecolor']" style="text-align: center">{{ item.label }}</p>
                      <p v-if="idx < 3" :class="['u-9', state.value == item.value ? 'checkedtruecolor' : 'checkedfalsecolor']">{{ typeHints[idx] }}</p>
                      <div v-show="state.value == item.value" class="radioclass">
                        <check-outlined style="color: #ffffff; position: absolute; top: 4px; right: 2px; font-size: 10px" />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item name="title" label="标题" :rules="[{ required: true, message: '请输入标题', trigger: 'blur' }]">
              <a-input
                v-model:value="state.user.title"
                v-trim
                :disabled="state.outputdisabled"
                placeholder="请输入标题"
                :maxlength="20"
                oninput="value=value.replace(/[, ]/g,'')"
                onkeyup="value=value.replace(/[, ]/g,'')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item name="content" label="内容" :rules="[{ required: true, message: '请输入内容', trigger: 'blur' }]">
              <a-textarea v-model:value="state.user.content" v-trim placeholder="请输入内容" :rows="6" show-count :maxlength="500" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item>
              <div class="flex" style="justify-content: center">
                <a-button style="margin-right: 30px" class="primary hoverBlue" size="large" @click="onCancel">取消</a-button>
                <a-button class="defaultBtn hoverBgBlue" type="default" size="large" html-type="submit">提交</a-button>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
/* 摘自 legacy-dist/portal/assets/index.178332063620015.css 中 [data-v-150e31b0] 的规则 */
.modelFlex{display:flex;justify-content:center}
.modelFlex h1{font-size:20px}
.modelFlex img{width:70px;height:70px}
.centre{height:150px;display:flex;justify-content:center;align-items:center}
:deep(.ant-modal-footer){text-align:center;display:flex;justify-content:center}
:deep(.ant-modal-footer .ant-btn){margin:0 35px}
.colorred{color:red}
:deep(.setClass .ant-col-24 .ant-form-item-label){width:16%}
:deep(.setClass .ant-col-20 .ant-form-item-label){width:22%}
.flex label,.flex p{font-weight:800}
.sameclass{width:48px;height:22px;line-height:22px;border-radius:29px;font-size:12px;text-align:center}
.listli{width:33%;border:1px solid #efefef;height:211px;margin-bottom:20px}
.margintop{margin-top:30px}
.paddingtop10{padding:30px 0;width:80%}
.widgaoxin{color:#81b337;border:1px solid;margin:0 10px}
.lineht{margin:25px 0}
.widjipin{color:#bd3124;border:1px solid}
.wida{width:70%;text-overflow:-o-ellipsis-lastline;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}
.widflex{line-height:33px}
.widflex label{width:80px}
.lsitleft{width:70%}
.widp{width:60%;height:26px;text-overflow:-o-ellipsis-lastline;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
.widlabel{text-overflow:-o-ellipsis-lastline;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
.weituo{width:76px;height:28px;line-height:28px;border-radius:34px;background-color:#efefef;color:#9a9a9a;font-size:12px;text-align:center}
.samebtn{display:block;width:80px;height:35px;line-height:35px;text-align:center;border-radius:5px;color:#fff;font-size:14px}
.samecoloradb3{display:block;width:80px;height:35px;line-height:35px;text-align:center;border-radius:5px;color:#fff;font-size:14px;background-color:#cecece}
.samebtncolorb3{display:block;width:80px;height:35px;line-height:35px;text-align:center;border-radius:5px;color:#fff;font-size:14px;background-color:#81b337}
.btnred{background-color:#bd3124}
.btnblue{background-color:#7f83f7;margin-left:20px}
.beizhu{width:87%;text-overflow:-o-ellipsis-lastline;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;line-clamp:3;-webkit-box-orient:vertical}
.listright{width:30%}
.margtopbtn{margin-top:64px}
.labeltag{height:33px;line-height:33px;border-radius:43px;background-color:#efefef;color:#9a9a9a;font-size:14px;text-align:center;margin-right:10px;padding:3px 12px}
.radioli{width:234px;line-height:20px;background-color:#fff;display:block;padding:10px;position:relative}
.radioli1{margin-right:17px}
.checkedfalse{border:1px solid #cecece}
.checkedtrue{border:1px solid #81B337}
.checkedtruecolor{color:#81b337!important}
.radioclass{width:23px;height:23px;background:linear-gradient(45deg,#ffffff,#ffffff 50%,yellowgreen 50%,yellowgreen 100%);position:absolute;right:0;top:0}
</style>
