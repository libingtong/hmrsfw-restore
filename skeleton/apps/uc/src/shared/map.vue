<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/gaode.1751615607545.js 里的第二个组件（__name "map"，导出 `M`）
//       + map.1751615607545.css（scopeId data-v-74092770；CSS 按 scopeId 匹配，不在 gaode.css 里）
// 百度地图选点弹窗：点地图逆地理取地址；bm-auto-complete 选中建议项后正地理取经纬度；"保存"把 center/address 抛给父组件。
// 依赖：<baidu-map>/<bm-scale>/<bm-marker>/<bm-control>/<bm-auto-complete> 由入口全局注册（原入口包内联了 vue-baidu-map-3x，
//       含 ak 配置），全局 BMap 由该插件加载。骨架入口目前没有注册，需入口兼容层补。
// 入口包导入：`M` → Modal（ant-design-vue）；`_` → _export_sfc（不需要）
// 原样保留：handleOk 抛出的 center 是 ref 本身（不是 .value）；两个 a-input 用了同一个 ref "pswRef"。
import { ref, reactive, onMounted, nextTick } from "vue";
import { Modal } from "ant-design-vue";

declare const BMap: any;

const props = defineProps({
  collapsed: Boolean,
  mentorrecord: Array,
  visible: Boolean,
  title: String,
  izEndReply: String,
  longitude: String,
  latitude: String,
  belongAddress: String,
});
const emit = defineEmits(["okclick", "cancelClick"]);

const pswRef = ref();
const queryParam = reactive({
  arraydata: [],
  detailList: [],
  brandFold: false,
  length: 0,
  name: "",
  workAddress: "",
});

onMounted(() => {
  console.log("回显", props.belongAddress, props.longitude, props.latitude);
  pswRef.value.focus();
  queryParam.workAddress = props.belongAddress;
  nextTick(() => {
    initCenter(props.longitude, props.latitude);
    setTimeout(() => {
      var geocoder = new BMap.Geocoder();
      geocoder.getPoint(props.belongAddress, function (point) {
        if (point) {
          center.value.lng = point.lng;
          center.value.lat = point.lat;
          console.log(point, "point点击");
        }
      });
    }, 500);
  });
});

let ready = ref(false);
let showMap = ref(false);
const center = ref<any>({ lng: 0, lat: 0 });

function initCenter(lng, lat) {
  nextTick(() => {
    center.value.lng = lng;
    center.value.lat = lat;
  });
  setTimeout(() => {
    showMap.value = true;
  }, 100);
  ready.value = true;
}

/** 点地图：逆地理取地址 */
function handleMapClick(event) {
  console.log(event);
  var { point } = event;
  var geocoder = new BMap.Geocoder();
  geocoder.getLocation(point, function (result) {
    var comp = result.addressComponents;
    let address = comp.province + comp.city + comp.district + comp.street + comp.streetNumber;
    console.log(address, "==");
    queryParam.name = address;
    queryParam.workAddress = address;
  });
  setCenter(point);
}

function setCenter(point, _unused?) {
  center.value.lng = point.lng;
  center.value.lat = point.lat;
}

const handleOk = () => {
  let payload = { visible: false, center: center, address: queryParam.name };
  emit("okclick", payload);
};
const handleCancel = () => {
  emit("cancelClick", { visible: false });
};

/** bm-auto-complete 选中建议项：正地理取经纬度 */
function handleConfirm({ item }) {
  console.log("搜索", item);
  let address = `${item.value.city}${item.value.district}${item.value.business}`;
  queryParam.workAddress = address;
  queryParam.name = address;
  var geocoder = new BMap.Geocoder();
  geocoder.getPoint(address, function (point) {
    if (point) {
      center.value.lng = point.lng;
      center.value.lat = point.lat;
      console.log(point, "point");
    }
  });
}
</script>

<template>
  <div ref="globalModal">
    <Modal
      v-model:visible="props.visible"
      :closable="true"
      :title="props.title"
      ok-text="保存"
      width="850px"
      :maskClosable="false"
      cancel-text="关闭"
      @ok="handleOk"
      @cancel="handleCancel"
      :getContainer="() => $refs.globalModal"
    >
      <div>
        <a-input
          ref="pswRef"
          v-model:value="queryParam.workAddress"
          placeholder="请输入地址来直接查找相关位置"
          style="width: 500px; margin: 10px; line-height: 44px; height: 44px; position: absolute"
        />
        <baidu-map
          v-if="showMap"
          class="map"
          @click="handleMapClick"
          :scroll-wheel-zoom="true"
          :center="{ lng: center.lng, lat: center.lat }"
          :zoom="15"
          style="height: 500px"
        >
          <bm-scale anchor="BMAP_ANCHOR_TOP_RIGHT" />
          <bm-marker :position="center" :dragging="true" />
          <bm-control>
            <bm-auto-complete v-model="queryParam.workAddress" :sugStyle="{ zIndex: 999999 }" @confirm="handleConfirm">
              <a-input
                ref="pswRef"
                v-model:value="queryParam.workAddress"
                placeholder="请输入地址来直接查找相关位置"
                style="width: 500px; margin: 10px; line-height: 44px; height: 44px"
              />
            </bm-auto-complete>
          </bm-control>
        </baidu-map>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.map {
  width: 800px;
  height: 600px;
}
.city {
  padding-bottom: 10px;
}
</style>
