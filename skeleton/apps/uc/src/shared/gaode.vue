<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/gaode.1751615607545.js + gaode.1751615607545.css（scopeId data-v-56312994）
// 共享组件 `gaode`：高德地图选点弹窗（输入地址 → PlaceSearch 搜索 → 选结果打点；或直接点地图取经纬度；"保存"把 center/address 抛给父组件）。
// 同一 chunk 还有两个组件，按规则拆到同目录：
//   导出 `g` → 本文件 default export（import GaodeMapModal from "@shared/gaode.vue"）
//   导出 `M` → ./map.vue（__name "map"，百度地图选点弹窗，scopeId data-v-74092770）
//   导出 `i` → ./gaodeNation.vue（name "nation"，无 __name；多级字典 AAB022_C 下拉）
//   `@shared/gaode`（./gaode.ts）同时提供这三个导出。
// 地图 SDK：原 chunk 内联了 npm 包 @amap/amap-jsapi-loader 1.0.1（UMD，经入口的 `V`=globalThis / `D`=getDefaultExportFromCjs 解包），
//   这里换回 `import AMapLoader from "@amap/amap-jsapi-loader"`；加载参数（version 2.0、plugins 列表）照原样。
// key 来源：原代码取 props.gaodekey = [key, securityJsCode]（父页面从业务配置 gaode_map_key_secret 读取后 split(",") 传入），
//   代码里从未写死 key。这里保留该来源，并在父组件未传时回退到环境变量 VITE_AMAP_KEY / VITE_AMAP_SECURITY_JS_CODE。
// 入口包导入：`M` → Modal（ant-design-vue）；`m` → message（ant-design-vue）；`_` → _export_sfc（不需要）
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { Modal, message } from "ant-design-vue";
import AMapLoader from "@amap/amap-jsapi-loader";

declare const AMap: any;

const props = defineProps({
  collapsed: Boolean,
  mentorrecord: Array,
  visible: Boolean,
  title: String,
  izEndReply: String,
  longitudeGcj02: String,
  latitudeGcj02: String,
  belongAddress: String,
  gaodekey: Array,
});
const emit = defineEmits(["okclick", "cancelClick"]);

/** 高德 Web 端 key：props.gaodekey[0]，缺省回退到环境变量 */
const getAmapKey = (): string => (props.gaodekey && (props.gaodekey[0] as string)) || import.meta.env.VITE_AMAP_KEY;
/** 高德安全密钥 securityJsCode：props.gaodekey[1]，缺省回退到环境变量 */
const getAmapSecurityJsCode = (): string =>
  (props.gaodekey && (props.gaodekey[1] as string)) || import.meta.env.VITE_AMAP_SECURITY_JS_CODE;

const pswRef = ref(null);
/** AMap.Map 实例 */
let map: any;
/** 是否显示搜索结果下拉 */
const showSearchResult = ref(false);
/** PlaceSearch 返回的 poi 列表 */
const poiList = ref<any[]>([]);
/** 当前选中点 */
const center = ref<any>({ lng: 0, lat: 0, name: "" });
const queryParam = reactive({
  arraydata: [],
  detailList: [],
  brandFold: false,
  length: 0,
  name: "",
  workAddress: "",
});

onMounted(() => {
  (window as any)._AMapSecurityConfig = { securityJsCode: getAmapSecurityJsCode() };
  center.value.lng = props.longitudeGcj02;
  center.value.lat = props.latitudeGcj02;
  initAMap();
});

onUnmounted(() => {
  map && map?.destroy();
});

const initAMap = () => {
  nextTick(() => {
    AMapLoader.load({
      version: "2.0",
      key: getAmapKey(),
      plugins: [
        "AMap.Geolocation",
        "AMap.PlaceSearch",
        "AMap.LabelMarker",
        "AMap.InfoWindow",
        "AMap.Geocoder",
        "AMap.Autocomplete",
        "AMap.PlaceSearch",
        "AMap.CitySearch",
      ],
    })
      .then((_AMap) => {
        locate();
      })
      .catch((_err) => {});
  });
};

/** 浏览器定位；失败时退回到城市定位 */
const locate = () => {
  let geolocation = new AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 1000,
    needAddress: false,
    extensions: "all",
    zoomToAccuracy: true,
    convert: false,
  });
  geolocation &&
    geolocation.getCurrentPosition(function (status, result) {
      if (status == "complete") {
        onLocateComplete(result);
      } else {
        geolocation.getCityInfo(function (_status, cityResult) {
          createMap(cityResult.position);
        });
      }
    });
};

const onLocateComplete = (result) => {
  createMap(result.position);
};

const createMap = (position) => {
  map = new AMap.Map("container", { center: position, zoom: 15, resizeEnable: true });
  map.on("click", (event) => {
    const lng = event.lnglat.getLng();
    const lat = event.lnglat.getLat();
    center.value.lat = lat;
    center.value.lng = lng;
  });
  map.on("complete", function () {
    if (props.belongAddress) {
      queryParam.workAddress = props.belongAddress;
      console.log("queryParam.workAddress", queryParam.workAddress);
      searchPlace();
    }
    if (props.longitudeGcj02 != "" && props.longitudeGcj02 != null) {
      addMarker([center.value.lng, center.value.lat]);
      map.setCenter([center.value.lng, center.value.lat]);
    } else if (poiList.value.length != 0) {
      addMarker(position);
      map.setCenter(position);
    }
  });
};

/** 按输入地址搜索 poi */
const searchPlace = () => {
  new AMap.PlaceSearch().search(queryParam.workAddress, function (status, result) {
    if (status === "complete" && result.info === "OK") {
      showSearchResult.value = true;
      poiList.value = result.poiList.pois;
    } else {
      showSearchResult.value = false;
      poiList.value = [];
    }
  });
};

/** 选中一条搜索结果 */
const selectPoi = (data) => {
  console.log("data", data);
  center.value.lng = Number(data.location.lng);
  center.value.lat = Number(data.location.lat);
  center.value.name = data.name;
  queryParam.workAddress = data.name;
  queryParam.name = data.name;
  showSearchResult.value = false;
  map?.clearMap();
  addMarker([Number(data.location.lng), Number(data.location.lat)]);
  setTimeout(() => {
    map.setCenter(data.location);
    map.setZoom(15);
  }, 50);
};

const addMarker = (position) => {
  let marker = new AMap.Marker({
    map: map,
    icon: new AMap.Icon({
      size: new AMap.Size(40, 40),
      image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
      imageSize: new AMap.Size(20, 25),
    }),
    position: position,
  });
  map.add(marker);
};

const handleOk = () => {
  if (center.value.lng == "" || center.value.lng == null) {
    if (queryParam.workAddress && (center.value.lng == "" || center.value.lng == null)) {
      message.error("未查找到相关位置，请重新输入");
    } else {
      message.error("请输入地址来直接查找相关位置");
    }
  } else {
    let payload = { visible: false, center: center.value, address: queryParam.name };
    emit("okclick", payload);
  }
};

const handleCancel = () => {
  emit("cancelClick", { visible: false });
};
</script>

<template>
  <div ref="globalModal" class="gaodoeClass">
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
      <div class="map-box">
        <a-input
          ref="pswRef"
          style="width: 280px"
          v-model:value="queryParam.workAddress"
          placeholder="请输入地址来直接查找相关位置"
          id="tipinput"
          @keyup.enter.native="searchPlace"
        />
        <a-button type="primary" style="margin-left: 10px" @click="searchPlace">搜索</a-button>
      </div>
      <div v-if="showSearchResult" class="map_search_result">
        <ul>
          <li class="liClass" v-for="(item, index) in poiList" @click="selectPoi(item)" :key="index">{{ item.name }}</li>
        </ul>
      </div>
      <div>
        <div id="container"></div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
#container {
  width: 800px;
  height: 600px;
}
.gaodoeClass {
  position: relative;
}
.city {
  padding-bottom: 10px;
}
.map-box {
  height: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.map_search_result {
  position: absolute;
  z-index: 1000;
  background: #ffffff;
}
.liClass {
  padding: 5px 10px;
}
</style>
