<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/cropperjs.1751615607545.js 中的子组件 `Wi`（__name:"cropperjsModal"）。
// 原组件没有 __scopeId（未包 _export_sfc），也没有自己的样式；作为 cropperjs.vue 的子组件使用。
// chunk 里内联的 Cropper.js v1.6.0 换成 npm 包 cropperjs（骨架 package.json 里是 1.5.13）。
import { ref, onMounted, onBeforeUnmount } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { request, API_BASE, STATIC_BASE } from "@/utils/request";

const props = defineProps({
  imgType: { type: String, default: "" },
  visible: Boolean,
  CropperModaldata: Array,
  src: String,
  imageSrc: { type: String, required: true },
  aspectRatio: { type: Number, default: 1 },
  viewMode: { type: Number, default: 1 },
  autoCropArea: { type: Number, default: 1 },
});
// 原代码只声明了 updateImageSrc，但还会 emit("cancel")（未声明，父组件的 onCancel 同时作为透传属性落到根 a-modal 上）。
const emit = defineEmits(["updateImageSrc"]);

// chunk 内定义的上传接口（`Ge`，枚举 ge.upload = "/jeecg-system/sys/common/upload"），原用入口导出 `w`（请求实例）.request
const uploadFile = (data: FormData) => request({ url: "/jeecg-system/sys/common/upload", method: "post", data });

// 入口导出 `am`（Vgt）：date -> "YYYY-M-D"（不补零）；骨架 @/legacy 里没有，先在本地实现
const formatDateDash = (t: Date) => `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`;

// CropperModaldata 声明为 Array，实际传入的是父组件的 reactive 对象（autoCropWidth/autoCropHeight 为字符串）
const cropData = () => props.CropperModaldata as any;

const imageRef = ref<HTMLImageElement | null>(null);
let cropper: any = null;

onMounted(() => {
  console.log("宽和搞", props.CropperModaldata);
  cropper = new Cropper(imageRef.value as HTMLImageElement, {
    viewMode: props.viewMode as any,
    autoCropArea: props.autoCropArea,
    preview: ".img-preview",
    minCropBoxWidth: cropData().autoCropWidth,
    minCropBoxHeight: cropData().autoCropHeight,
    autoCrop: true,
    aspectRatio: cropData().autoCropWidth / cropData().autoCropHeight,
    data: { width: cropData().autoCropWidth, height: cropData().autoCropHeight },
    crop: (_e: any) => {},
    cropstart: (_e: any) => {},
    cropmove: (_e: any) => {},
    cropend: (_e: any) => {},
  } as any);
});

// 确认：裁剪成 300x300，上传后把地址回传给父组件
const handleConfirm = () => {
  const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
  canvas.toDataURL();
  canvas.toBlob((blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, new Date().getTime() + ".jpg");
    formData.append("biz", "temp/" + formatDateDash(new Date()));
    uploadFile(formData).then((res: any) => {
      console.log("上传", res);
      if (res.success) {
        const photoArr: { url: string }[] = [];
        photoArr.push({ url: API_BASE + STATIC_BASE + "/" + res.message });
        const payload = { visible: false, photoArr, photo: res.message };
        emit("updateImageSrc", payload);
      }
    });
  });
};

onBeforeUnmount(() => {
  cropper.destroy();
});

function handleReset() {
  cropper.reset();
}

function handleCancel() {
  (emit as any)("cancel", { visible: false, photoArr: [] });
}

// 原模板 "onUpdate:visible": v => props.visible = v（写回只读 props，运行时只会告警，不生效）
const onUpdateVisible = (v: boolean) => {
  (props as any).visible = v;
};
</script>

<template>
  <a-modal :visible="props.visible" title="裁剪图片" :width="800" @update:visible="onUpdateVisible" @cancel="handleCancel">
    <template #footer>
      <span class="dialog-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="" @click="handleReset">重置</a-button>
        <a-button type="primary" @click="handleConfirm"> 确认 </a-button>
      </span>
    </template>
    <a-row>
      <a-col :xs="24" :md="12" style="height: 350px">
        <img ref="imageRef" :src="imageSrc" alt="image" />
      </a-col>
      <a-col :xs="24" :md="12">
        <div class="marL30">
          <p>预览图片</p>
          <div
            class="img-preview"
            :style="[{ width: cropData().autoCropWidth + 'px', height: cropData().autoCropHeight + 'px' }, { overflow: 'hidden' }]"
          ></div>
        </div>
      </a-col>
    </a-row>
  </a-modal>
</template>
