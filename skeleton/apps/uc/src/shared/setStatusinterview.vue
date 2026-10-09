<script lang="ts">
// 还原自 legacy-dist/usercenter/assets/setStatusinterview.1751615607545.js（+ .css，scopeId data-v-99a2d30a）
// 原导出名 → 新名：`s` → 本文件 default export。
//   页面侧写法：import SetStatusinterview from "@shared/setStatusinterview.vue";
// 入口包导入：`d` → decryptStorage、`k` → getDictItemsByCode（@/legacy）；`m` → message、`M` → Modal（ant-design-vue）；
//   `ar`（入口本地名 C7t）→ 入口包接口 xfJobCurriculumVitaeDeliver/setStatus，`@/legacy` 里还没有，按 beonmodal.vue 的做法在这里定义。
// 接口模块：index.api.175161560754510.js 的 `s`（原压缩名 m）→ 直播简历设置状态；out/api 里没有该模块的 map，
//   骨架 @/api/ 下也没有 api-175161560754510.ts，同样在这里定义。
import { request } from "@/utils/request";

// TODO:restore 入口包 `ar` 补进 @/legacy 后改为从 @/legacy 导入
/** 入口包 `ar`：设置投递简历的邀请状态 */
export const setDeliverStatus = (params: unknown) =>
  request({ url: "/xf-job/job/xfJobCurriculumVitaeDeliver/setStatus", method: "get", params });

// TODO:restore 骨架补上 @/api/api-175161560754510.ts 后改为从那里导入（原 url 没有 /xf-job 前缀，原样保留）
/** index.api.175161560754510.js 的 `s`：直播招聘会投递简历设置状态 */
export const setLiveDeliverStatus = (data: unknown) =>
  request({ url: "/job/licenseFree/xfJobLiveCurriculumVitaeDeliver/setStatus", method: "post", data });
</script>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { Modal, message } from "ant-design-vue";
import { decryptStorage, getDictItemsByCode } from "@/legacy";

const props = defineProps({
  collapsed: Boolean,
  positionrecord: Array,
  setStatus: Object,
  visible: Boolean,
  title: String,
  id: String,
  izEndReply: String,
  apiType: { type: String, default: "" },
});
const emit = defineEmits(["okclick", "cancelClick"]);

const checkedValue = ref();
// 原 chunk 读取后未使用，原样保留
decryptStorage(localStorage.getItem("xfSysUserId"), "xfSysUserId");
decryptStorage(localStorage.getItem("corpInfo"), "corpInfo");

const state = reactive<Record<string, any>>({
  arraydata: [],
  detailList: [],
  brandFold: false,
  length: 0,
  user: { id: (props.setStatus as Record<string, any>).id, status: "", statusText: "" },
});

onMounted(() => {
  getStatusList();
});

async function getStatusList() {
  getDictItemsByCode({ dictCode: "deliver_status" }).then((res: any) => {
    console.log("邀请状态", res.result);
    const list: any[] = [];
    res.result.map((item: any) => {
      item.value != "0" && item.value != "10" && list.push(item);
    });
    console.log("邀请状态", list);
    state.detailList = list;
  });
}

const onStatusChange = (event: any) => {
  const labels: string[] = [];
  state.detailList.map((item: any) => {
    event.target.value == item.value && labels.push(item.label);
  });
  state.user.statusText = labels.join(",");
  state.user.status = event.target.value;
};

const onOk = () => {
  if (!state.user.status) {
    message.error("请先选择邀请状态！");
    return;
  }
  props.apiType == "live" ? submitLive() : submitDefault();
};

const submitDefault = () => {
  setDeliverStatus(state.user).then((res: any) => {
    if (res.success) {
      message.success("设置成功");
      emit("okclick", { visible: false });
    }
  });
};

const submitLive = () => {
  setLiveDeliverStatus(state.user).then((res: any) => {
    if (res.success) {
      message.success("设置成功");
      emit("okclick", { visible: false });
    }
  });
};

const onCancel = () => {
  emit("cancelClick", { visible: false });
};
</script>

<template>
  <div ref="globalModal">
    <!-- 原 render 读取 okText / cancelText，但组件没有声明这两个 prop，结果恒为 undefined，原样保留 -->
    <Modal
      v-model:visible="props.visible"
      :title="props.title"
      :ok-text="(props as any).okText"
      :maskClosable="false"
      :cancel-text="(props as any).cancelText"
      @ok="onOk"
      @cancel="onCancel"
      :getContainer="() => $refs.globalModal"
    >
      <a-row>
        <a-col :span="24">
          <a-radio-group
            v-model:value="checkedValue"
            button-style="solid"
            @change="onStatusChange($event)"
            class="flex"
            style="justify-content: flex-start; flex-wrap: wrap"
          >
            <a-radio-button v-for="(item, index) in state.detailList" :value="item.value" class="maringRight">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>
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
  margin-left: 20px;
}
.maringRight {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
