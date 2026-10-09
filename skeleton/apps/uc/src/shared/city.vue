<script setup lang="ts">
// 还原自 legacy-dist/usercenter/assets/index.1751615607545.js 里的 `Emt`（__name:"city"，scopeId data-v-f31b818a），
// 原入口全局注册：app.component("city", Amt)。样式摘自 index.1751615607545.css 中的 [data-v-f31b818a] 规则。
// 页面侧写法：<city :actName="..." :actProId="..." select="all" @changeCityCode="..." />（全局组件，无需 import）
// 依赖全局指令 v-click-outside（skeleton/apps/uc/src/directives.ts）。
import { ref, reactive, watch, onMounted, nextTick } from "vue";
import { request } from "@/utils/request";
import { getDictItemsByCode } from "@/legacy";

const props = defineProps({
  actName: { type: String, default: "" },
  actProId: { type: [String, Number], default: "" },
  select: { type: String, default: "all" },
  showFast: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: "请选择工作地址" },
  streetShow: { type: Boolean, default: true },
  villageShow: { type: Boolean, default: true },
  izShowFirst: { type: Boolean, default: true },
});
const emit = defineEmits(["changeCityCode"]);

// 入口包内的区域接口（骨架 api/legacy 里没有，原样在本地定义；原用入口请求实例 Ee.request）
/** 入口 `_l`：按父级取下级区域，type 10 省 / 20 市 / 30 区县 / 40 街道 / 50 村 */
const getAreaInfo = (params: unknown) => request({ url: "/xf-job/communal/licenseFree/xfSysAreainfo/getInfo", method: "get", params });
/** 入口 `ept`：取区域及其下级树（快速选择） */
const queryAreaChildrenTreeListById = (params: unknown) => request({ url: "/xf-job/job/licenseFree/queryAreaChildrenTreeListById", method: "post", params });
/** 入口 `tpt`：按区域 id 反查省/市/区/街道/村 */
const getInfoByAreaId = (params: unknown) => request({ url: "/xf-job/communal/licenseFree/xfSysAreainfo/getInfoByAreaId", method: "get", params });

const proContent = ref<HTMLElement | null>(null);
const state = reactive<any>({
  contRight: true,
  cityShow: false,
  ssq: "",
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

// 初始化：省份列表 + 快速选择（业务字典里 label 含 provinceName 的区域及其下级）
function init() {
  getAreaInfo({ parentId: 0, type: 10 }).then((res: any) => {
    if (res.success) state.provList = res.result;
  });
  getDictItemsByCode({ dictCode: (window as any).businessDict }).then((res: any) => {
    res.result.map((item: any) => {
      if (item.label.indexOf("provinceName") > -1)
        queryAreaChildrenTreeListById({ areaId: item.value, depth: "1" }).then((r: any) => {
          if (r.result) {
            if (props.izShowFirst) state.fastList.push({ name: r.result[0].name, id: r.result[0].id });
            if (r.result[0].children)
              r.result[0].children.map((child: any) => {
                state.fastList.push({ name: child.name, id: child.id });
              });
          }
        });
    });
  });
}

// 点省份名：加载城市
function loadCity(name: string, id: any) {
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
function loadCounty(name: string, id: any) {
  getAreaInfo({ parentId: id, type: 30 }).then((res: any) => {
    if (res.success) {
      state.countyList = res.result;
      state.activeType = "county";
      state.actArr.push({ value: id, label: name });
    }
  });
}

// 勾选省份
function chooseProvince(item: any) {
  state.actArr = [];
  state.actArr.push({ value: item.id, label: item.name });
  state.cityShow = false;
  state.ssq = state.actArr[0].ssq = item.name;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
}

// 勾选城市
function chooseCity(item: any) {
  state.actArr.splice(1);
  state.actArr.push({ value: item.id, label: item.name });
  state.cityShow = false;
  state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + item.name;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
}

// 勾选区县
function chooseCounty(item: any) {
  if (state.actArr.length == 3) state.actArr[2] = { value: item.id, label: item.name };
  else state.actArr.push({ value: item.id, label: item.name });
  state.cityShow = false;
  state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + item.name;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
}

// 勾选街道
function chooseStreet(item: any) {
  if (state.actArr.length == 4) state.actArr[3] = { value: item.id, label: item.name };
  else state.actArr.push({ value: item.id, label: item.name });
  state.cityShow = false;
  state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + state.actArr[2].label + "/" + item.name;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
  state.streetList = [];
}

// 点区县名：需要街道/村时加载街道，否则直接选定区县
function loadStreet(item: any) {
  if (state.actArr.length == 3) state.actArr[2] = { value: item.id, label: item.name };
  else state.actArr.push({ value: item.id, label: item.name });
  if (props.streetShow == true || props.villageShow == true)
    getAreaInfo({ parentId: item.id, type: 40 }).then((res: any) => {
      if (res.success) {
        if (res.result.length !== 0) {
          state.streetList = res.result;
          state.activeType = "street";
        } else {
          state.cityShow = false;
          state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + item.name;
          emit("changeCityCode", state.actArr);
          state.activeType = "province";
          state.cityList = [];
          state.countyList = [];
        }
      }
    });
  else {
    state.cityShow = false;
    state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + item.name;
    emit("changeCityCode", state.actArr);
    state.activeType = "province";
    state.cityList = [];
    state.countyList = [];
  }
}

// 点街道名：需要村时加载村，否则直接选定街道
function loadVillage(item: any) {
  if (state.actArr.length == 4) state.actArr[3] = { value: item.id, label: item.name };
  else state.actArr.push({ value: item.id, label: item.name });
  if (props.villageShow == true)
    getAreaInfo({ parentId: item.id, type: 50 }).then((res: any) => {
      if (res.success) {
        if (res.result.length !== 0) {
          state.villageList = res.result;
          state.activeType = "village";
        } else {
          state.cityShow = false;
          state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + state.actArr[2].label + "/" + item.name;
          emit("changeCityCode", state.actArr);
          state.activeType = "province";
          state.streetList = [];
          state.cityList = [];
          state.countyList = [];
        }
      }
    });
  else {
    state.cityShow = false;
    state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + state.actArr[2].label + "/" + item.name;
    emit("changeCityCode", state.actArr);
    state.activeType = "province";
    state.streetList = [];
    state.cityList = [];
    state.countyList = [];
  }
}

// 选定村
function chooseVillage(item: any) {
  if (state.actArr.length == 5) state.actArr[4] = { value: item.id, label: item.name };
  else state.actArr.push({ value: item.id, label: item.name });
  state.cityShow = false;
  state.ssq = state.actArr[0].ssq = state.actArr[0].label + "/" + state.actArr[1].label + "/" + state.actArr[2].label + "/" + state.actArr[3].label + "/" + item.name;
  emit("changeCityCode", state.actArr);
  state.activeType = "province";
  state.cityList = [];
  state.countyList = [];
  state.streetList = [];
  state.villageList = [];
}

// 快速选择：按区域 id 反查完整路径
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
      state.cityShow = false;
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
  state.cityShow = false;
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
  if (props.actName) state.ssq = props.actName;
});

// 弹层靠左/靠右：输入框离视口左边不足 550px 时向右展开
function updatePosition() {
  const rect = proContent.value!.getBoundingClientRect();
  const left = rect.left;
  rect.right;
  if (left < 550) state.contRight = false;
  else state.contRight = true;
}

watch(
  props,
  (val) => {
    if (val) {
      state.ssq = val.actName;
      if (val.actProId) {
        state.activeType = "province";
        state.actArr = [];
        state.actArr.push({ value: val.actProId });
      } else state.actArr = [];
    }
  },
  { deep: true },
);

function closeCity() {
  state.cityShow = false;
}

function toggleCity() {
  if (state.cityShow) state.cityShow = false;
  else {
    state.cityShow = true;
    nextTick(() => {
      updatePosition();
    });
  }
}
</script>

<template>
  <div v-click-outside="closeCity">
    <a-input
      v-if="props.disabled"
      v-model:value="state.ssq"
      :disabled="props.disabled"
      readonly
      :placeholder="props.placeholder"
      oninput="value=value.replace(/[, ]/g,'')"
      onkeyup="value=value.replace(/[, ]/g,'')"
    />
    <a-input
      v-else
      v-model:value="state.ssq"
      :disabled="props.disabled"
      readonly
      :placeholder="props.placeholder"
      oninput="value=value.replace(/[, ]/g,'')"
      class="pointer"
      onkeyup="value=value.replace(/[, ]/g,'')"
      @click="toggleCity"
    />
    <div v-if="state.cityShow" ref="proContent" class="cityCont xf-relative">
      <div :class="['areaWrap tabbable dnn', state.contRight ? 'right0' : 'left0']" id="div_showpxjg">
        <div style="display: inline-block" class="areaHead">
          <em v-if="props.showFast && state.fastList.length !== 0">快速选择</em> <a
            href="javascript:void(0)"
            style="float: right; padding: 1px 15px; line-height: 30px"
            class="pointer defaultBtn radius5 marR10"
            @click="reset()"
          >重置</a>
          <ul v-if="props.showFast && state.fastList.length !== 0" id="hot_showpxjg" class="tab-pane province clearfix active active2">
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
          <!-- 省份 -->
          <ul :class="state.activeType === 'province' ? 'tab-pane province active' : 'tab-pane province'">
            <li
              v-for="(item, index) in state.provList"
              :key="'prov' + index"
              :class="props.select == 'last' && state.actArr.length !== 0 && state.actArr[0].value == item.id ? 'active' : ''"
            >
              <span @click="loadCity(item.name, item.id)">{{ item.name }}</span>
              <i v-if="props.select == 'all' && state.actArr.length !== 0 && state.actArr[0].value == item.id" class="zeroActive" @click="chooseProvince(item)">
                <CheckOutlined style="font-size: 10px" />
              </i>
              <i v-else-if="props.select == 'all'" class="zeroRadio" @click="chooseProvince(item)"></i>
            </li>
          </ul>
          <!-- 城市 -->
          <ul :class="state.activeType === 'city' ? 'tab-pane city active' : 'tab-pane city'">
            <li v-for="(item, index) in state.cityList" :key="'city' + index">
              <span @click="loadCounty(item.name, item.id)">{{ item.name }}</span>
              <i v-if="props.select == 'all' && state.actArr.length > 1 && state.actArr[1].value == item.id" class="zeroActive" @click="chooseCity(item)">
                <CheckOutlined style="font-size: 10px" />
              </i>
              <i v-else-if="props.select == 'all'" class="zeroRadio" @click="chooseCity(item)"></i>
            </li>
          </ul>
          <!-- 区/县 -->
          <ul :class="state.activeType === 'county' ? 'tab-pane county active' : 'tab-pane county'">
            <li v-for="(item, index) in state.countyList" :key="'count' + index">
              <span @click="loadStreet(item)">{{ item.name }}</span>
              <i v-if="props.select == 'all' && state.actArr.length == 3 && state.actArr[2].value == item.id" class="zeroActive" @click="chooseCounty(item)">
                <CheckOutlined style="font-size: 10px" />
              </i>
              <i v-else-if="props.select == 'all'" class="zeroRadio" @click="chooseCounty(item)"></i>
            </li>
          </ul>
          <!-- 街道/镇 -->
          <ul :class="state.activeType === 'street' ? 'tab-pane county active' : 'tab-pane county'">
            <li v-for="(item, index) in state.streetList" :key="'street' + index">
              <span @click="loadVillage(item)">{{ item.name }}</span>
              <i v-if="props.select == 'all' && state.actArr.length == 4 && state.actArr[3].value == item.id" class="zeroActive" @click="chooseStreet(item)">
                <CheckOutlined style="font-size: 10px" />
              </i>
              <i v-else-if="props.select == 'all'" class="zeroRadio" @click="chooseStreet(item)"></i>
            </li>
          </ul>
          <!-- 小区/村庄 -->
          <ul :class="state.activeType === 'village' ? 'tab-pane county active' : 'tab-pane county'">
            <li v-for="(item, index) in state.villageList" :key="'village' + index">
              <span @click="chooseVillage(item)">{{ item.name }}</span>
              <i v-if="props.select == 'all' && state.actArr.length == 5 && state.actArr[4].value == item.id" class="zeroActive" @click="chooseVillage(item)">
                <CheckOutlined style="font-size: 10px" />
              </i>
              <i v-else-if="props.select == 'all'" class="zeroRadio" @click="chooseVillage(item)"></i>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.areaHead{padding:10px;background:#fefefe;border:1px solid #ccc;margin-bottom:10px;width:588px}
.areaHead em{font-style:normal;font-size:15px;font-weight:700}
.cityR{position:relative}
.cityR .areaWrap{right:0!important}
.cityL .areaWrap,.L .areaWrap{left:0!important}
.R .areaWrap{right:0!important}
.areaWrap{width:600px;border:1px solid #ccc;padding:5px;height:auto;background:#F3F3F3;z-index:111;position:absolute}
.right0{right:0}
.left0{left:0}
.areaWrap .areaContent{border:1px solid #ccc!important;border-top:0;background:#fff;min-height:280px;padding-bottom:10px;padding-top:10px}
.hotselect{height:auto!important}
.hotselect li{border-radius:5px!important;background:#3296FA!important;margin-top:10px!important}
.hotselect li a{color:#fff!important}
.areaWrap ul,.areaWrap li{list-style:none;padding:0}
.province>li:hover,.city>li:hover,.county>li:hover,.province>li.active{background:var(--xf-default-color)!important}
.province>li:hover span,.city>li:hover span,.county>li:hover span{color:#fff!important}
.province>li.active span{color:#fff!important}
.province>li,.city>li,.county>li{display:inline-block;font-size:14px;color:#4b4b4b;cursor:pointer;overflow:hidden;background:#F5F5F5;border-radius:5px;margin:0 0 0 5px;padding:0 10px;text-align:center;height:30px;line-height:30px}
.province>li:hover i,.city>li:hover i,.county>li:hover i{border:1px solid #fff;color:#fff}
.nav-tabs>li{border:1px solid #ddd;display:inline-block;margin-bottom:-2px;z-index:11}
.nav-tabs>li.active{border-bottom:0}
.nav-tabs>li a{display:block;margin-right:0!important;background:#fff;padding:0 20px;color:#4b4b4b;height:45px;border:0!important}
.nav-tabs>li.active>a{padding:0 20px;height:47px;display:block;background:#fff;border-bottom:0}
.tab-content li.selected{background:var(--xf-default-color)!important}
.tab-content li.selected a{color:#fff}
.zeroRadio{width:12px;height:12px;border-radius:2px;border:1px solid #666;display:inline-block;vertical-align:middle;margin-left:3px;margin-top:-3px}
.zeroActive{width:12px;height:12px;border-radius:2px;border:1px solid var(--xf-default-color);display:inline-block;vertical-align:middle;margin-left:3px;color:var(--xf-default-color);line-height:12px;margin-top:-3px}
.province>li:hover .zeroActive,.city>li:hover .zeroActive{color:#fff}
.tab-pane{display:none}
.tab-pane.active{display:inline-block}
.cityCont{z-index:1;line-height:36px}
.tab-pane.active2{display:flex;flex-wrap:wrap}
.tab-pane.active2 li{margin-bottom:12px}
</style>
