<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/index.175161560754529.js（__name "index"，scopeId data-v-db987c98；
// 样式规则实际在 index.175161560754514.css 里，按 scopeId 摘取）。
// 原导出名 → 新名：`p` → 本文件 default export。
//   页面侧写法：import CancelReasonModal from "@shared/CancelReasonModal.vue";
// 入口包导入：`M` → Modal（ant-design-vue，作为组件使用：unref(Modal)）；`_` → _export_sfc（忽略）。
import { onMounted, reactive, ref } from "vue";
import { Modal } from "ant-design-vue";

const props = defineProps({
  placeholder: String,
  headline: String,
  name: String,
  visible: Boolean,
  title: String,
  okText: String,
  outTop: String,
  value: String,
  cancelText: String,
});
const emit = defineEmits(["okclick", "cancelClick"]);

// 原 chunk 里创建后未使用的 ref / reactive，原样保留
ref(false);
const option = ref("");
reactive({ option: "" });

const onOk = () => {
  console.log(option);
  const payload = { visible: false, option: option.value };
  option.value = "";
  emit("okclick", payload);
};

const onCancel = () => {
  const payload = { visible: false };
  option.value = "";
  emit("cancelClick", payload);
};

onMounted(() => {});
</script>

<template>
  <div ref="globalModal">
    <Modal
      v-model:visible="props.visible"
      :closable="false"
      :ok-text="props.okText"
      :cancel-text="props.cancelText"
      @ok="onOk"
      @cancel="onCancel"
      :getContainer="() => $refs.globalModal"
      maskClosable="false"
      :zIndex="1100"
    >
      <div class="centre">
        <div class="modelHeight">
          <div class="modelFlex">
            <h1>{{ props.headline }}</h1>
          </div>
          <div v-if="props.outTop" class="modelFlex">
            <h1 style="color: rgb(172, 172, 172)">{{ props.outTop }}</h1>
          </div>
          <div v-if="props.title" class="modelFlex">
            <h1>{{ props.title }}</h1>
          </div>
          <div>
            <a-textarea v-model:value="option" :placeholder="props.placeholder" :rows="3" />
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.modelFlex {
  display: flex;
  justify-content: center;
}
.modelFlex h1 {
  font-size: 16px;
  font-weight: 400;
  color: #101010;
}
.modelFlex p {
  font-size: 15px;
}
.modelHeight {
  width: 100%;
}
.modelFlex img {
  width: 70px;
  height: 70px;
}
.centre {
  width: 96%;
  margin: 0 2%;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
}
:deep(.ant-modal-footer) {
  text-align: center;
  display: flex;
  justify-content: center;
}
:deep(.ant-modal-footer .ant-btn) {
  margin: 0 35px;
}
.modalcenter {
  margin: 0 100px;
}
</style>
