<!--
  还原自 legacy-dist/portal/assets/city.1783320636200.js（__name: city，scopeId data-v-911d64a4）
  样式来自 city.1783320636200.css（同 scopeId）。省/市/区县/街道/村 五级地区选择面板。
  原导出名 → 新名：`c` → default export；`__tla` 不再需要。
  页面里 `import{c as X,__tla}from"./city…js"` 改为 `import City from "@shared/city.vue"`。
-->
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import {
  getAppConfig,
  getAreaInfo,
  getDictItemsByCode,
  // TODO:restore 入口导出 `W`（/xf-job/job/licenseFree/queryAreaChildrenTreeListById，post params）骨架 @/legacy 尚未提供
  queryAreaChildrenTreeListById,
  // TODO:restore 入口导出 `X`（/xf-job/communal/licenseFree/xfSysAreainfo/getInfoByAreaId，get params）骨架 @/legacy 尚未提供
  getInfoByAreaId,
} from "@/legacy";

const props = defineProps({
  actArr: { type: Array, default: [] },
  actProId: { type: [String, Number], default: "" },
  select: { type: String, default: "all" },
  showFast: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: "请选择工作地址" },
  streetShow: { type: Boolean, default: true },
  villageShow: { type: Boolean, default: true },
});
const emit = defineEmits(["changeCityCode"]);

const appConfig = getAppConfig();
const proContent = ref(null);

// ssq（省市区拼接文本）、cityShow 原代码在运行时才挂到 state 上
const state = reactive<any>({
  contRight: true,
  activeType: "province",
  actArr: [],
  defaultCity: "",
  fastList: [],
  provList: [],
  cityList: [],
  countyList: [],
  streetList: [],
  villageList: [],
});

// 初始化：省份列表 + "快速选择"（业务字典里 label 含 provinceName 的项 → 该省及其下级）
function init() {
  getAreaInfo({ parentId: 0, type: 10 }).then((res: any) => {
    if (res.success) state.provList = res.result;
  });
  getDictItemsByCode({ dictCode: appConfig.businessDict }).then((res: any) => {
    res.result.map((item: any) => {
      if (item.label.indexOf("provinceName") > -1) {
        queryAreaChildrenTreeListById({ areaId: item.value, depth: "1" }).then((treeRes: any) => {
          if (treeRes.result) {
            state.fastList.push({ name: treeRes.result[0].name, id: treeRes.result[0].id });
            if (treeRes.result[0].children) {
              treeRes.result[0].children.map((child: any) => {
                state.fastList.push({ name: child.name, id: child.id });
              });
            }
          }
        });
      }
    });
  });
}

// 点省份名：加载城市
function loadCity(name: string, id: unknown) {
  getAreaInfo({ parentId: id, type: 20 }).then((res: any) => {
    if (res.success) {
      state.cityList = res.result;
      state.activeType = "city";
      state.actArr = [];
      state.actArr.push({ value: id, label: name });
    }
  });
}

// 点城市名：加载区县
function loadCounty(name: string, id: unknown) {
  getAreaInfo({ parentId: id, type: 30 }).then((res: any) => {
    if (res.success) {
      state.countyList = res.result;
      state.activeType = "county";
      state.actArr.push({ value: id, label: name });
    }
  });
}

// 勾选省份
function selectProvince(item: any) {
  state.actArr = [];
  state.actArr.push({ value: item.id, label: item.name });
  state.ssq = state.actArr[0].ssq = state.actArr[0].label;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
}

// 勾选城市
function selectCity(item: any) {
  state.actArr.splice(1);
  state.actArr.push({ value: item.id, label: item.name });
  state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
}

// 点区县名：需要街道/村时加载街道，没有下级就直接选中
function loadStreet(item: any) {
  state.actArr.length == 3 ? (state.actArr[2] = { value: item.id, label: item.name }) : state.actArr.push({ value: item.id, label: item.name });
  if (props.streetShow == true || props.villageShow == true) {
    getAreaInfo({ parentId: item.id, type: 40 }).then((res: any) => {
      if (res.success) {
        if (res.result.length !== 0) {
          state.streetList = res.result;
          state.activeType = "street";
        } else {
          state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + item.name;
          emit("changeCityCode", state.actArr);
          state.activeType = "province";
        }
      }
    });
  } else {
    state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + item.name;
    emit("changeCityCode", state.actArr);
    state.activeType = "province";
  }
  state.cityList = [];
  state.countyList = [];
}

// 勾选区县
function selectCounty(item: any) {
  state.actArr.length == 3 ? (state.actArr[2] = { value: item.id, label: item.name }) : state.actArr.push({ value: item.id, label: item.name });
  state.cityShow = false;
  state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + item.name;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
}

// 勾选街道
function selectStreet(item: any) {
  state.actArr.length == 4 ? (state.actArr[3] = { value: item.id, label: item.name }) : state.actArr.push({ value: item.id, label: item.name });
  state.cityShow = false;
  state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + state.actArr[2].label + "/" + item.name;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
  state.streetList = [];
}

// 点街道名：需要村时加载村，没有下级就直接选中
function loadVillage(item: any) {
  state.actArr.length == 4 ? (state.actArr[3] = { value: item.id, label: item.name }) : state.actArr.push({ value: item.id, label: item.name });
  if (props.villageShow == true) {
    getAreaInfo({ parentId: item.id, type: 50 }).then((res: any) => {
      if (res.success) {
        if (res.result.length !== 0) {
          state.villageList = res.result;
          state.activeType = "village";
        } else {
          state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + state.actArr[2].label + "/" + item.name;
          emit("changeCityCode", state.actArr);
          state.activeType = "province";
          state.cityList = [];
          state.countyList = [];
          state.streetList = [];
        }
      }
    });
  } else {
    state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + state.actArr[2].label + "/" + item.name;
    emit("changeCityCode", state.actArr);
    state.activeType = "province";
    state.cityList = [];
    state.countyList = [];
    state.streetList = [];
  }
}

// 勾选村（点村名与勾选同一个处理）
function selectVillage(item: any) {
  state.actArr.length == 5 ? (state.actArr[4] = { value: item.id, label: item.name }) : state.actArr.push({ value: item.id, label: item.name });
  state.ssq = state.actArr[0].ssq =
    state.actArr[0].label + "/" + state.actArr[1].label + "/" + state.actArr[2].label + "/" + state.actArr[3].label + "/" + item.name;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
  state.streetList = [];
  state.villageList = [];
}

// 快速选择：按地区 id 反查完整的省/市/区/街道/村
function selectFast(item: any) {
  state.actArr = [];
  state.ssq = "";
  getInfoByAreaId({ areaId: item.id }).then((res: any) => {
    if (res.success) {
      const info = res.result;
      if (info.proviceName !== null && info.proviceName) {
        state.ssq = info.proviceName;
        state.actArr[0] = { value: info.proviceId, label: info.proviceName };
      }
      if (info.cityName !== null && info.cityName) {
        state.ssq = state.ssq + "/" + info.cityName;
        state.actArr[1] = { value: info.cityId, label: info.cityName };
      }
      if (info.areaName !== null && info.areaName) {
        state.ssq = state.ssq + "/" + info.areaName;
        state.actArr[2] = { value: info.areaId, label: info.areaName };
      }
      if (info.townsName !== null && info.townsName) {
        state.ssq = state.ssq + "/" + info.townsName;
        state.actArr[3] = { value: info.townsId, label: info.townsName };
      }
      if (info.villageName !== null && info.villageName) {
        state.ssq = state.ssq + "/" + info.villageName;
        state.actArr[4] = { value: info.villageId, label: info.villageName };
      }
      state.actArr[0].ssq = state.ssq;
      emit("changeCityCode", state.actArr);
      state.activeType = "province";
      state.cityList = [];
      state.countyList = [];
      state.streetList = [];
      state.villageList = [];
    }
  });
}

// 重置
function reset() {
  state.actArr = [];
  state.ssq = "";
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
  state.streetList = [];
  state.villageList = [];
  emit("changeCityCode", []);
}

onMounted(() => {
  init();
  // 原文如此：actName 不是声明的 prop，恒为 undefined
  if ((props as any).actName) state.ssq = (props as any).actName;
});

// 原文如此：直接 watch props.actArr 数组（deep），并读取数组上的 actName/actProId
watch(
  props.actArr,
  (val: any) => {
    if (val) {
      val.length == 1 ? (state.activeType = "province") : val.length == 2 ? (state.activeType = "city") : (state.activeType = "county");
      state.ssq = val.actName;
      if (val.actProId) {
        state.activeType = "province";
        state.actArr = [];
        state.actArr.push({ value: val.actProId });
      } else {
        state.actArr = [];
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="cityCont xf-relative" ref="proContent">
    <div class="areaWrap tabbable dnn" id="div_showpxjg">
      <div style="display: inline-block" class="areaHead">
        <em v-if="props.showFast && state.fastList.length !== 0">快速选择</em>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a
          href="javascript:void(0)"
          style="float: right; padding: 1px 15px; line-height: 30px"
          class="pointer defaultBtn radius5 marR10"
          @click="reset()"
          >重置</a
        >
        <ul
          v-if="props.showFast && state.fastList.length !== 0"
          id="hot_showpxjg"
          class="tab-pane province clearfix active active2"
        >
          <li v-for="(item, index) in state.fastList" :key="'fast' + index" @click="selectFast(item)">
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>
      <ul class="nav nav-tabs" id="myTabs_showpxjg" style="margin: 0">
        <li :class="state.activeType === 'province' ? 'active' : ''">
          <a href="javascript:;" @click="state.activeType = 'province'">省份</a>
        </li>
        <li :class="state.activeType === 'city' ? 'active' : ''">
          <a href="javascript:;" @click="state.activeType = 'city'">城市</a>
        </li>
        <li :class="state.activeType === 'county' ? 'active' : ''">
          <a href="javascript:;" @click="state.activeType = 'county'">区/县</a>
        </li>
        <li v-if="state.streetList.length !== 0" :class="state.activeType === 'street' ? 'active' : ''">
          <a href="javascript:;" @click="state.activeType = 'street'">街道/镇</a>
        </li>
        <li v-if="state.villageList.length !== 0" :class="state.activeType === 'village' ? 'active' : ''">
          <a href="javascript:;" @click="state.activeType = 'village'">小区/村庄</a>
        </li>
      </ul>
      <div class="tab-content areaContent clearfix">
        <ul :class="state.activeType === 'province' ? 'tab-pane province active' : 'tab-pane province'">
          <li
            v-for="(item, index) in state.provList"
            :key="'prov' + index"
            :class="props.select == 'last' && state.actArr.length !== 0 && state.actArr[0].value == item.id ? 'active' : ''"
          >
            <span @click="loadCity(item.name, item.id)">{{ item.name }}</span>
            <i
              v-if="props.select == 'all' && state.actArr.length !== 0 && state.actArr[0].value == item.id"
              class="zeroActive"
              @click="selectProvince(item)"
              ><CheckOutlined style="font-size: 10px"
            /></i>
            <i v-else-if="props.select == 'all'" @click="selectProvince(item)" class="zeroRadio"></i>
          </li>
        </ul>
        <ul :class="state.activeType === 'city' ? 'tab-pane city active' : 'tab-pane city'">
          <li v-for="(item, index) in state.cityList" :key="'city' + index">
            <span @click="loadCounty(item.name, item.id)">{{ item.name }}</span>
            <i
              v-if="props.select == 'all' && state.actArr.length > 1 && state.actArr[1].value === item.id"
              class="zeroActive"
              @click="selectCity(item)"
              ><CheckOutlined style="font-size: 10px"
            /></i>
            <i v-else-if="props.select == 'all'" @click="selectCity(item)" class="zeroRadio"></i>
          </li>
        </ul>
        <ul :class="state.activeType === 'county' ? 'tab-pane county active' : 'tab-pane county'">
          <li v-for="(item, index) in state.countyList" :key="'count' + index">
            <span @click="loadStreet(item)">{{ item.name }}</span>
            <i
              v-if="props.select == 'all' && state.actArr.length == 3 && state.actArr[2].value === item.id"
              class="zeroActive"
              @click="selectCounty(item)"
              ><CheckOutlined style="font-size: 10px"
            /></i>
            <i v-else-if="props.select == 'all'" @click="selectCounty(item)" class="zeroRadio"></i>
          </li>
        </ul>
        <ul :class="state.activeType === 'street' ? 'tab-pane county active' : 'tab-pane county'">
          <li v-for="(item, index) in state.streetList" :key="'street' + index">
            <span @click="loadVillage(item)">{{ item.name }}</span>
            <i
              v-if="props.select == 'all' && state.actArr.length == 4 && state.actArr[3].value == item.id"
              class="zeroActive"
              @click="selectStreet(item)"
              ><CheckOutlined style="font-size: 10px"
            /></i>
            <i v-else-if="props.select == 'all'" @click="selectStreet(item)" class="zeroRadio"></i>
          </li>
        </ul>
        <ul :class="state.activeType === 'village' ? 'tab-pane county active' : 'tab-pane county'">
          <li v-for="(item, index) in state.villageList" :key="'village' + index">
            <span @click="selectVillage(item)">{{ item.name }}</span>
            <i
              v-if="props.select == 'all' && state.actArr.length == 5 && state.actArr[4].value == item.id"
              class="zeroActive"
              @click="selectVillage(item)"
              ><CheckOutlined style="font-size: 10px"
            /></i>
            <i v-else-if="props.select == 'all'" @click="selectVillage(item)" class="zeroRadio"></i>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.areaHead {
  padding: 10px;
  background: #fefefe;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  width: 588px;
}
.areaHead em {
  font-style: normal;
  font-size: 15px;
  font-weight: 700;
}
.cityR {
  position: relative;
}
.cityR .areaWrap {
  right: 0 !important;
}
.cityL .areaWrap,
.L .areaWrap {
  left: 0 !important;
}
.R .areaWrap {
  right: 0 !important;
}
.areaWrap {
  width: 600px;
  border: 1px solid #ccc;
  padding: 5px;
  height: auto;
  background: #f3f3f3;
}
.areaWrap .areaContent {
  border: 1px solid #ccc !important;
  border-top: 0;
  background: #fff;
  min-height: 280px;
  padding-bottom: 10px;
  padding-top: 10px;
}
.hotselect {
  height: auto !important;
}
.hotselect li {
  border-radius: 5px !important;
  background: #3296fa !important;
  margin-top: 10px !important;
}
.hotselect li a {
  color: #fff !important;
}
.areaWrap ul,
.areaWrap li {
  list-style: none;
  padding: 0;
}
.province > li:hover,
.city > li:hover,
.county > li:hover {
  background: var(--xf-default-color) !important;
}
.province > li:hover span,
.city > li:hover span,
.county > li:hover span {
  color: #fff !important;
}
.province > li,
.city > li,
.county > li {
  display: inline-block;
  font-size: 14px;
  color: #4b4b4b;
  cursor: pointer;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 5px;
  margin: 0 0 0 5px;
  padding: 0 10px;
  text-align: center;
  height: 30px;
  line-height: 30px;
}
.province > li:hover i,
.city > li:hover i,
.county > li:hover i {
  border: 1px solid #fff;
  color: #fff;
}
.nav-tabs > li {
  border: 1px solid #ddd;
  display: inline-block;
  margin-bottom: -2px;
  z-index: 11;
}
.nav-tabs > li.active {
  border-bottom: 0;
}
.nav-tabs > li a {
  display: block;
  margin-right: 0 !important;
  background: #fff;
  padding: 0 20px;
  color: #4b4b4b;
  height: 45px;
  border: 0 !important;
}
.nav-tabs > li.active > a {
  padding: 0 20px;
  height: 47px;
  display: block;
  background: #fff;
  border-bottom: 0;
}
.tab-content li.selected {
  background: var(--xf-default-color) !important;
}
.tab-content li.selected a {
  color: #fff;
}
.zeroRadio {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid #666;
  display: inline-block;
  vertical-align: middle;
  margin-left: 3px;
  margin-top: -3px;
}
.zeroActive {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid var(--xf-default-color);
  display: inline-block;
  vertical-align: middle;
  margin-left: 3px;
  color: var(--xf-default-color);
  line-height: 12px;
  margin-top: -3px;
}
.province > li:hover .zeroActive,
.city > li:hover .zeroActive {
  color: #fff;
}
.tab-pane {
  display: none;
}
.tab-pane.active {
  display: inline-block;
}
.cityCont {
  z-index: 1;
  line-height: 36px;
}
.tab-pane.active2 {
  display: flex;
  flex-wrap: wrap;
}
.tab-pane.active2 li {
  margin-bottom: 12px;
}
</style>
