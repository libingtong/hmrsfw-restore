<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/cropperjs.1751615607545.js（+ 同名 css，scopeId data-v-e652d67f）
// 原导出名 → 新名：`c`（页面里 `import{c as X}from"./cropperjs.1751615607545.js"`）→ 本文件 default export
//   页面侧写法：import Cropperjs from "@shared/cropperjs.vue"
//   <Cropperjs :isshow="true" minCropBoxWidth="200" minCropBoxHeight="200" :url="..." :imgSize="..."
//              @crop-upload-close="..." @crop-upload-success="..." />
// 组件 __name:"cropperjs"；子组件 cropperjsModal 在同目录。chunk 里内联的 Cropper.js 库由子组件改用 npm 包 cropperjs。
import { ref, reactive, watch, onMounted } from "vue";
import { Modal, message, Upload } from "ant-design-vue";
import { API_BASE, STATIC_BASE } from "@/utils/request";
import CropperjsModal from "./cropperjsModal.vue";

const props = defineProps({
  options: {
    type: Object,
    default: function () {
      return { autoCrop: true, autoCropWidth: "", autoCropHeight: "", fixedBox: false, previewsCircle: true, title: "修改头像" };
    },
  },
  imgSize: { type: Number, default: 2 },
  visible: Boolean,
  imgType: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  url: { type: String, default: "" },
  isshow: String,
  minCropBoxWidth: String,
  minCropBoxHeight: String,
});
const emit = defineEmits(["crop-upload-close", "crop-upload-success"]);

onMounted(() => {
  cropOptions.autoCropWidth = props.minCropBoxWidth;
  cropOptions.autoCropHeight = props.minCropBoxHeight;
});

// props 变化时按 url 回显已上传图片
watch(
  props,
  (val) => {
    if (val)
      if (props.url && props.url !== "") {
        const list: { url: string }[] = [];
        list.push({ url: API_BASE + STATIC_BASE + "/" + props.url });
        fileList.value = list;
      } else fileList.value = [];
  },
  { deep: true },
);

const modalState = reactive<{ CropperModaldata: any }>({ CropperModaldata: [] });
const cropOptions = reactive<any>({
  img: "",
  autoCrop: true,
  autoCropWidth: "",
  autoCropHeight: "",
  fixedBox: true,
  info: true,
  outputSize: 0.5,
  outputType: "jpeg",
  canScale: false,
  fixed: false,
  fixedNumber: [1, 1],
  full: true,
  canMoveBox: false,
  original: true,
  centerBox: true,
  infoTrue: true,
});

function getBase64(file: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
}

const fileList = ref<any[]>([]);
const previewVisible = ref(false);
const previewImage = ref("");
const previewTitle = ref("");
const handlePreviewCancel = () => {
  previewVisible.value = false;
  previewTitle.value = "";
};
const cropperVisible = ref(false);
let originFile: any = reactive({});

function handleChange(info: any) {
  console.log("base64来源", info);
  readAsBase64(info.file.originFileObj, (base64: any) => {
    const merged = Object.assign({}, cropOptions, { img: base64 });
    cropOptions.img = base64;
    originFile = info.file.originFileObj;
    modalState.CropperModaldata = cropOptions;
    cropperVisible.value = true;
    console.log("弹窗打开", merged, info, cropOptions, originFile);
  });
  handleRemove(info.file, "个人头像");
}

function handleRemove(file: any, name: string) {
  console.log("如有需要新增 删除逻辑", file, name);
  cropperVisible.value = false;
  fileList.value = [];
  emit("crop-upload-close", { photoArr: "", filename: "" });
}

function readAsBase64(file: Blob | null | undefined, callback: (result: any) => void) {
  console.log("base64", file);
  if (file != null) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(file);
  }
}

const handlePreview = async (file: any) => {
  if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj);
  console.log("图片回显", file);
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf("/") + 1);
};

// 子组件裁剪上传成功
const handleUpdateImageSrc = (data: any) => {
  cropperVisible.value = false;
  const list: { url: string }[] = [];
  list.push({ url: API_BASE + STATIC_BASE + "/" + data.photo });
  fileList.value = list;
  const payload = { photoArr: data.photo, filename: originFile.name };
  emit("crop-upload-success", payload);
};

function handleCropCancel() {
  cropperVisible.value = false;
  fileList.value = [];
  emit("crop-upload-close", { photoArr: "", filename: "" });
}

const beforeUpload = (file: any) => {
  const allowed = ["jpg", "jpeg", "png", "PNG", "JPEG", "JPG"];
  const ext = file.name.split(".")[1];
  let isImage = false;
  if (allowed.includes(ext)) isImage = true;
  else {
    cropperVisible.value = false;
    message.error("上传图片的格式不对，仅支持上传png、jpg、jpeg格式的图片!");
  }
  const isLtSize = file.size / 1024 / 1024 < props.imgSize;
  if (!isLtSize) {
    cropperVisible.value = false;
    message.error(`图片大小不能超过${props.imgSize}M`);
  }
  return (isImage && isLtSize) || Upload.LIST_IGNORE;
};
</script>

<template>
  <!-- 原代码 isshow 声明为 String，但调用方传布尔 true，这里保留原来的宽松比较 == true -->
  <div v-if="(props.isshow as any) == true" class="ant-upload-preview">
    <div style="width: 100%">
      <a-upload
        v-model:file-list="fileList"
        name="avatar"
        list-type="picture-card"
        :before-upload="beforeUpload"
        accept=".png, .jpeg, .jpg, .PNG, .JPEG, .JPG"
        :multiple="false"
        :customRequest="() => {}"
        @change="handleChange"
        @preview="handlePreview"
      >
        <div v-if="fileList.length < 1">
          <plus-outlined />
          <div class="ant-upload-text">上传图片</div>
        </div>
      </a-upload>
      <Modal :visible="previewVisible" :title="previewTitle" :footer="null" @cancel="handlePreviewCancel">
        <img alt="example" style="width: 100%" :src="previewImage" />
      </Modal>
    </div>
    <CropperjsModal
      v-if="cropperVisible"
      :visible="cropperVisible"
      :imageSrc="cropOptions.img"
      :CropperModaldata="modalState.CropperModaldata"
      @updateImageSrc="handleUpdateImageSrc"
      @cancel="handleCropCancel"
    />
  </div>
</template>

<style scoped>
.avatar-upload-wrapper{height:180px;width:100%}
.ant-upload-preview{background-color:#fff}
.ant-upload-preview .avatar-uploader>.ant-upload{width:128px;height:128px}
.ant-upload-preview .ant-upload-select-picture-card i{font-size:32px;color:#999}
.ant-upload-preview .upload_img{width:100%}
.ant-upload-preview .ant-upload-select-picture-card .ant-upload-text{margin-top:8px;color:#666}
</style>
