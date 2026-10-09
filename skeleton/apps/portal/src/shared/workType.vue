<!--
  还原自 legacy-dist/portal/assets/workType.1783320636200.js（__name: workType，scopeId data-v-c9091e07）
  样式来自 workType.1783320636200.css（同 scopeId）。"选择职位工种"弹窗（三级工种字典 ACA111_C，支持中文/拼音搜索）。
  原导出名 → 新名：`w` → default export；`__tla` 不再需要。
  页面里 `import{w as X,__tla}from"./workType…js"` 改为 `import WorkType from "@shared/workType.vue"`。
  拼音匹配原来自 chunk main.1783320636200.js（导出 `t`），它是打包进来的 npm 包 pinyin-match@1.2.4 的 es/main.js
  （字典与 1.2.3–1.2.5 一致；含 lve/nve 处理、不含 1.2.5 的 ü 替换 → 1.2.4），这里直接从 npm 导入。
-->
<script setup lang="ts">
import { onMounted, reactive } from "vue";
// pinyin-match 自带 index.d.ts
import PinyinMatch from "pinyin-match";
import { getDictListByType, listToTree } from "@/legacy";

const props = defineProps({
  actHover: Boolean,
  visible: Boolean,
  checkText: { type: String, default: "" },
});
const emit = defineEmits(["changeCode", "cancelClick"]);

const state = reactive<any>({
  active: "",
  list: [],
  searchAll: [],
  searchList: [],
  searchCont: "",
  workName: "",
  checkWork: {},
});

onMounted(() => {
  loadWorkTypes();
});

function handleOk() {
  const payload = { visible: false, sec: state.checkWork };
  emit("changeCode", payload);
}

const handleCancel = () => {
  emit("cancelClick", { visible: false });
};

// 清空已选工种
function clearWork() {
  state.checkWork = {};
  state.workName = "";
}

// 关键字搜索（中文包含或拼音匹配）
function onKeywordInput() {
  if (state.searchCont !== "") {
    state.searchList = [];
    state.searchAll.forEach((item: any) => {
      if (item.label.indexOf(state.searchCont) != -1 || PinyinMatch.match(item.label, state.searchCont)) state.searchList.push(item);
    });
  }
}

function chooseWork(item: any) {
  state.checkWork = item;
  state.workName = item.label;
  state.searchList = [];
}

function loadWorkTypes() {
  getDictListByType({ dictTypeCode: "ACA111_C" }).then((res: any) => {
    const tree = listToTree(res.result);
    const toNode = (node: any): any => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      return {
        label: node.name,
        value: node.id,
        parentId: node.parentId,
        children: hasChildren ? node.children.map((child: any) => toNode(child)) : [],
      };
    };
    state.list = tree.map((node: any) => toNode(node));
    if (props.checkText) {
      // 回显：按名称找到已选的三级工种，并展开它所在的一级分类
      state.workName = props.checkText;
      state.list.forEach((first: any) => {
        first.children.forEach((second: any) => {
          second.children.forEach((third: any) => {
            if (third.label == props.checkText) {
              state.checkWork = third;
              state.active = first.value;
            }
          });
        });
      });
    } else {
      state.active = state.list[0].value;
    }
    // 三级工种平铺到 searchAll，并记下一级分类名用于搜索结果展示
    state.list.forEach((first: any) => {
      first.children.forEach((second: any) => {
        second.children.forEach((third: any) => {
          third.parentName = first.label;
          state.searchAll.push(third);
        });
      });
    });
  });
}
</script>

<template>
  <div>
    <!-- 原文如此：v-model:visible 直接写回 props.visible；loading / onSearch 未声明（编译为 _ctx.loading / _ctx.onSearch） -->
    <a-modal
      v-model:visible="props.visible"
      zIndex="1500"
      title="选择职位工种"
      width="985px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <template #footer>
        <a-button key="back" @click="handleCancel" size="large" class="hoverBlue">取消</a-button>
        <a-button key="submit" type="default" size="large" class="defaultBtn hoverBgBlue" :loading="loading" @click="handleOk"
          >确定</a-button
        >
      </template>
      <div class="xf-relative">
        <a-input-search
          v-model:value="state.workName"
          placeholder="已选择的职位工种"
          size="large"
          @search="onSearch"
          disabled
          style="position: absolute; top: -70px; right: 28%; z-index: 111; width: 45%"
        >
          <template #enterButton>
            <a-button @click="clearWork">
              <template #icon>
                <delete-outlined />
              </template>
            </a-button>
          </template>
        </a-input-search>
      </div>
      <div v-if="!props.actHover" class="show-jobType trans" id="jobSortSelect">
        <div class="xf-sort-downBox clearfix">
          <div class="lf xf-sort-nav">
            <div class="posInput22">
              <a-input placeholder="请输入关键字" v-model:value="state.searchCont" @input="onKeywordInput" clearable />
              <ul v-if="state.searchList.length > 0 && state.searchCont !== ''" class="posRWork">
                <li
                  v-for="(item, index) in state.searchList"
                  class="ellipsis pointer"
                  :title="item.parentName + item.label"
                  :key="'pos' + index"
                  @click="chooseWork(item)"
                >
                  {{ item.parentName }} >{{ item.label }}
                </li>
              </ul>
            </div>
            <ul class="xf-sortNav-menu">
              <li
                v-for="(first, index) in state.list"
                :class="state.active == first.value ? 'xf-sort-item  xf-sort-manger active' : 'xf-sort-item  xf-sort-manger'"
                :key="'type' + index"
                @click="state.active = first.value"
              >
                <a href="javascript:void(0)" class="xf-sort-navType clearfix">
                  <i class="el-icon-caret-right marRight10"></i>
                  <span class="hAll ellipsis">{{ first.label }}</span>
                </a>
                <div class="xf-sort-itemBox">
                  <div v-for="(second, secondIndex) in first.children" class="xf-sort-content" :key="'children' + secondIndex">
                    <h2 class="xf-two-sort pointer parent">{{ second.label }}</h2>
                    <div class="xf-sort-job clearfix">
                      <a
                        v-for="(third, thirdIndex) in second.children"
                        href="javascript:void(0)"
                        :key="'sec' + thirdIndex"
                        :class="third.label == state.workName ? 'activeColor' : ''"
                        @click="chooseWork(third)"
                        >{{ third.label }}</a
                      >
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        v-else
        class="show-jobType trans"
        id="jobSortSelect"
        style="border-left: 1px solid #e6e6e6; border-bottom: 1px solid #e6e6e6"
      >
        <div class="xf-sort-downBox clearfix">
          <div class="lf xf-sort-nav">
            <div class="posInput22 bg-f" style="top: 0; width: 720px; left: 215px">
              <a-input
                placeholder="请输入关键字"
                v-model:value="state.searchCont"
                @input="onKeywordInput"
                style="width: 300px; margin-left: 400px"
                clearable
              />
              <ul v-if="state.searchList.length > 0" class="posRWork" style="right: 20px; top: 46px; height: 380px">
                <li v-for="(item, index) in state.searchList" class="ellipsis pointer" :key="'pos' + index" @click="chooseWork(item)">
                  {{ item.parentName }} >{{ item.label }}
                </li>
              </ul>
            </div>
            <ul class="xf-sortNav-menu">
              <li
                v-for="(first, index) in state.list"
                :class="state.active === first.value ? 'xf-sort-item  xf-sort-manger active' : 'xf-sort-item  xf-sort-manger'"
                :key="'type' + index"
                @click="state.active = first.value"
              >
                <a href="javascript:void(0)" class="xf-sort-navType clearfix">
                  <i class="el-icon-caret-right marRight10"></i>
                  <span class="hAll ellipsis">{{ first.label }}</span>
                </a>
                <div
                  class="xf-sort-itemBox"
                  style="top: 2px; width: 730px; height: 457px; border-bottom: 1px solid #e6e6e6; padding-top: 30px"
                >
                  <div v-for="(second, secondIndex) in first.children" class="xf-sort-content" :key="'children' + secondIndex">
                    <h2 class="xf-two-sort pointer parent">{{ second.label }}</h2>
                    <div class="xf-sort-job clearfix">
                      <a
                        v-for="(third, thirdIndex) in second.children"
                        href="javascript:void(0)"
                        :key="'sec' + thirdIndex"
                        :class="third.label == state.workName ? 'activeColor' : ''"
                        @click="chooseWork(third)"
                        >{{ third.label }}</a
                      >
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.posInput22 {
  position: absolute;
  top: -15px;
  z-index: 100;
  width: 300px;
  height: 41px;
  right: 0;
}
.positionRetrieval {
  top: 1px;
  text-align: left;
  line-height: 36px;
  position: absolute;
  right: 0 !important;
}
.xf-searchBox {
  width: 800px;
  margin: 0 auto;
}
.xf-search {
  height: 50px;
  background: #fff;
  position: relative;
}
.xf-sort-downBox {
  height: 500px;
  background: #fff;
  box-shadow: 0 0 1px #eee;
}
.xf-sort-nav {
  width: 188px;
  padding: 15px;
}
.xf-sortNav-menu li.active > a i:before {
  color: var(--xf-default-color);
}
.xf-sort-navType {
  height: 40px;
  font-size: 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}
.xf-sort-item:hover .xf-sort-navType,
.xf-sort-item.active .xf-sort-navType {
  color: var(--xf-default-color);
}
.xf-sort-navType span {
  line-height: 40px;
  width: 170px;
}
.xf-sort-arrow {
  height: 40px;
  width: 7px;
  display: block;
}
li.active .xf-sort-itemBox {
  display: block;
}
.xf-sort-itemBox {
  position: absolute;
  left: 218px;
  top: 30px;
  width: 695px;
  height: 427px;
  overflow-y: auto;
  padding: 20px 10px 20px 25px;
  display: none;
  background: #fff;
  box-shadow: -5px 0 20px #efefef;
  background-size: 100% 100%;
  font-size: 12px;
}
.xf-two-sort {
  height: 30px;
  line-height: 30px;
  font-size: 15px;
  text-align: left;
  margin-bottom: 5px;
}
.xf-sort-job {
  margin-bottom: 5px;
}
.xf-sort-job a {
  float: left;
  color: #999;
  margin: 0 20px 15px 0;
}
.xf-sort-job a:hover {
  color: var(--xf-default-color);
}
.xf-search-Input {
  width: 660px;
}
.xf-search-Input input {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 15px;
  font-size: 14px;
}
.xf-search-Input input::-webkit-input-placeholder {
  color: #ccc;
}
.xf-search-btnBox {
  position: absolute;
  right: 0;
  width: 144px;
  top: 0;
  box-shadow: 0 0 5px 0 var(--xf-default-color);
}
.xf-search-btn {
  display: inline-block;
  color: #fff;
  height: 50px;
  line-height: 50px;
  text-align: center;
  font-size: 18px;
  letter-spacing: 5px;
  cursor: pointer;
}
.xf-search-btn i {
  padding: 3px 7px;
}
.xf-search-sort {
  width: 100%;
  background: #fff;
  box-shadow: 0 0 5px 0 var(--xf-default-color);
  display: none;
}
.xf-search-sort a {
  display: block;
  text-align: center;
  font-size: 18px;
  line-height: 46px;
}
.xf-search-sort a.active,
.xf-search-sort a:hover {
  color: var(--xf-default-color);
}
.xf-hot-sort {
  height: 30px;
  line-height: 30px;
  margin-bottom: 20px;
  color: #fff;
}
.xf-hot-word a {
  color: #fff;
  padding-right: 15px;
}
.xf-hot-word a:hover {
  color: #dedede;
}
.xf-sort-job a.active {
  color: var(--xf-default-color) !important;
}
.show-select-item {
  height: 48px;
  line-height: 48px;
  padding: 0 10px;
  width: 800px;
  border: 1px solid #dedede;
}
.show-select-itemInfo {
  margin-left: 30px;
}
.show-select-itemInfo span {
  display: inline-block;
  height: 30px;
  padding-left: 10px;
  line-height: 30px;
  border: 1px solid #eee;
  margin-right: 10px;
}
.closeActive {
  position: absolute;
  right: -779px;
  top: -16px;
  color: #fff;
  width: 30px;
  border-radius: 50%;
  z-index: 1000;
  height: 30px;
  text-align: center;
  line-height: 30px;
  background: rgba(0, 0, 0, 0.5);
}
.pad10 {
  padding: 0 10px;
}
.posRWork {
  position: absolute;
  top: 40px;
  padding: 10px 20px;
  width: 257px;
  z-index: 10000;
  background: #fff;
  border: 1px solid #e6e6e6;
  max-height: 460px;
  overflow-y: auto;
}
.posRWork li {
  border-bottom: 1px dotted #efefef;
  height: 30px;
  line-height: 30px;
}
a {
  color: #000;
}
:deep(*) {
  box-sizing: border-box;
  margin: 0;
  position: initial;
  font-weight: 400;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.activeColor {
  color: var(--xf-default-color) !important;
}
</style>
