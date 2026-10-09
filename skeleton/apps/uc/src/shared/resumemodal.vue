<script setup lang="ts">
// 由 legacy-dist/usercenter/assets/resumemodal.1751615607545.js（data-v-3db338bf）还原的共享组件 `resumemodal`：
// "选择简历创建方式" 弹窗（新建空白简历 / 复制已有简历）。
import { reactive, ref, onMounted } from "vue";
import { Modal, message } from "ant-design-vue"; // 原入口包导出 `M` / `m`
import { decryptStorage } from "@/legacy"; // 原入口包导出 `d`
import { listNoPage, saveCopy } from "@/api/api-56"; // 原 index.api.17516156075456.js 导出 `f` / `h`

interface ResumeItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

const props = defineProps({
  collapsed: Boolean,
  mentorrecord: Array,
  visible: Boolean,
  title: String,
  izEndReply: String,
});
const emit = defineEmits(["okclick", "cancelClick"]);

/** 简历单选项的行内样式 */
const radioStyle = reactive({ display: "flex", height: "30px", lineHeight: "30px" });
/** 创建方式："1" 新建空白简历，"2" 复制已有简历 */
const createType = ref("1");
/** 复制模式下选中的简历 id */
const selectedResumeId = ref();
// 原代码在这里读了一次 userCenterInfo 但没有使用返回值（原样保留；解密失败时会清掉该 key）
decryptStorage(localStorage.getItem("userCenterInfo"), "userCenterInfo");
let xfSysUserId = decryptStorage(localStorage.getItem("xfSysUserId"), "xfSysUserId");
// 原 reactive 里没有 listNoPage 键，接口返回后才挂上去；这里只补类型不改初始值
const state = reactive<{
  arraydata: unknown[];
  detailList: unknown[];
  brandFold: boolean;
  isshow: boolean;
  length: number;
  user: { content: string };
  rules: { content: { required: boolean; message: string; trigger: string }[] };
  listNoPage?: ResumeItem[];
}>({
  arraydata: [],
  detailList: [],
  brandFold: false,
  isshow: true,
  length: 0,
  user: { content: "" },
  rules: { content: [{ required: true, message: "请输入回复内容", trigger: "blur" }] },
});

onMounted(() => {
  loadResumeList();
});

/** 拉取当前用户的简历列表（不分页） */
async function loadResumeList() {
  await listNoPage({ xfSysUserId: xfSysUserId.id, queryType: 1 }).then((res: any) => {
    if (res.success) {
      state.listNoPage = res.result;
    }
  });
}

const handleOk = () => {
  emit("okclick", { visible: false });
};
const handleCancel = () => {
  emit("cancelClick", { visible: false });
};

/** 切换创建方式 */
function onCreateTypeChange(e: any) {
  console.log("选择:", e);
  if (e.target.value == "2") {
    state.isshow = false;
  } else {
    state.isshow = true;
  }
}

/** 选择要复制的简历 */
function onResumeChange(e: any) {
  console.log("简历选择:", e);
  selectedResumeId.value = e.target.value;
}

/** "确定"：复制模式下先调 saveCopy 并记下新简历 id，再通知父组件 */
const handleConfirm = (e: any) => {
  console.log("Success:", e);
  if (state.isshow == false) {
    if (selectedResumeId.value) {
      saveCopy({ id: selectedResumeId.value.toString(), xfSysUserId: xfSysUserId.id }).then((res: any) => {
        if (res.success) {
          localStorage.setItem("CreatearesumeId", res.result.id);
          emit("okclick", { visible: false, iscopy: true });
        }
      });
    } else {
      message.warning("请选择一份简历！");
    }
  } else {
    emit("okclick", { visible: false, iscopy: false });
  }
};
</script>

<template>
  <div ref="globalModal">
    <!-- 原代码直接对 props.visible 做 v-model；okText / cancelText 没有声明为 props（始终 undefined），原样保留 -->
    <Modal
      v-model:visible="props.visible"
      :closable="false"
      :title="props.title"
      :ok-text="props.okText"
      width="500px"
      :maskClosable="false"
      :cancel-text="props.cancelText"
      @ok="handleOk"
      @cancel="handleCancel"
      :getContainer="() => $refs.globalModal"
      :footer="null"
    >
      <div class="metorMain fontsize14">
        <div class="fontsize16">选择简历创建方式</div>
        <a-radio-group v-model:value="createType" name="radioGroup" @change="onCreateTypeChange">
          <a-radio value="1">新建空白简历</a-radio>
          <a-radio value="2">复制已有简历信息</a-radio>
        </a-radio-group>
        <div v-if="state.isshow" class="coloradb3">
          <p>操作说明</p>
          <p>1、新建空白简历需重新填写简历信息；</p>
          <p>2、选择复制已有简历信息，您可以在原有简历信息基础上进行修改，快速创建新简历。</p>
        </div>
        <div v-else class="">
          <p class="red font12 marT5 marB5" style="color: red; font-size: 12px">* 注：复制简历后需您补全求职意向等重要信息</p>
          <p class="coloradb3">请选择一份简历</p>
          <a-radio-group v-model:value="selectedResumeId" name="radioGroup" @change="onResumeChange">
            <!-- 原代码的 v-for 没有 :key（unkeyed fragment），原样保留 -->
            <a-radio v-for="(item, index) in state.listNoPage" :style="radioStyle" :value="item.id">{{ item.name }}</a-radio>
          </a-radio-group>
        </div>
        <div class="flex flexalignitems flex_center">
          <a-button :style="{ 'margin-right': '30px' }" @click="handleCancel">关闭</a-button>
          <a-button type="primary" @click="handleConfirm">确定</a-button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* 原样来自 legacy-dist/usercenter/assets/resumemodal.1751615607545.css（data-v-3db338bf） */
:deep(.ant-modal-footer) {
  text-align: center;
  display: flex;
  justify-content: center;
}
:deep(.ant-modal-footer .ant-btn) {
  margin: 0 35px;
}
</style>
