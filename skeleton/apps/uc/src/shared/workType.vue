<script setup lang="ts">
// 由 legacy-dist/usercenter/assets/workType.1751615607545.js（data-v-13870526）还原的共享组件 `workType`：
// "选择职位工种" 弹窗（字典 ACA222_C 的三级树 + 关键字/拼音搜索）。
import { reactive, onMounted } from "vue";
import { Modal } from "ant-design-vue"; // 原入口包导出 `M`
// 原 chunk：import { t as L } from "./main.1751615607545.js"（pinyin-match 的 `{ match(text, keyword) }` 对象）
// @shared/main.ts 文件头约定：default export `PinyinMatch`（同时具名导出 `PinyinMatch` / `match`）。
import PinyinMatch from "@shared/main";
import { getMultiDictListByType, listToTree } from "@/legacy"; // 原入口包导出 `ax` / `ay`

/** 原 chunk 里内联的 png（Vite 把小图片打成 data URI），用于"删除"按钮图标 */
const deleteIcon = "data:image/png;base64,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";

interface WorkTypeNode {
  label: string;
  value: string;
  parentId?: string;
  remark?: string;
  children: WorkTypeNode[];
  /** 三级节点在收集到 searchAll 时补上的一级名称 */
  parentName?: string;
}

const props = defineProps({
  visible: Boolean,
  checkText: { type: String, default: "" },
  checkCode: { type: String, default: "" },
});
const emit = defineEmits(["changeCode", "cancelClick"]);

const queryParam = reactive({
  active: "",
  list: [] as WorkTypeNode[],
  searchAll: [] as WorkTypeNode[],
  searchList: [] as WorkTypeNode[],
  searchCont: "",
  workName: "",
  checkWork: {} as WorkTypeNode | Record<string, never>,
});

onMounted(() => {
  loadWorkTypes();
});

/** 弹窗"确定"：把选中的三级工种回传 */
function handleOk() {
  console.log(queryParam.checkWork, "queryParam.checkWork");
  let payload = { visible: false, sec: queryParam.checkWork };
  emit("changeCode", payload);
}

const handleCancel = () => {
  emit("cancelClick", { visible: false });
};

/** 搜索框右侧"删除"按钮：清空已选工种 */
function clearWork() {
  queryParam.checkWork = {};
  queryParam.workName = "";
}

/** 关键字输入：按文字包含或拼音匹配过滤三级工种 */
function handleSearchInput() {
  if (queryParam.searchCont !== "") {
    queryParam.searchList = [];
    queryParam.searchAll.forEach((item) => {
      if (item.label.indexOf(queryParam.searchCont) != -1 || PinyinMatch.match(item.label, queryParam.searchCont)) {
        queryParam.searchList.push(item);
      }
    });
  }
}

/** 选中一个三级工种（搜索结果或右侧列表） */
function selectWork(item: WorkTypeNode) {
  queryParam.checkWork = item;
  queryParam.workName = item.label;
  queryParam.searchList = [];
}

function loadWorkTypes() {
  getMultiDictListByType({ dictTypeCode: "ACA222_C" }).then((res: any) => {
    const tree = listToTree(res.result);
    const toNode = (node: any): WorkTypeNode => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      return {
        label: node.name,
        value: node.id,
        parentId: node.parentId,
        remark: node.remark,
        children: hasChildren ? node.children.map((child: any) => toNode(child)) : [],
      };
    };
    queryParam.list = tree.map((node: any) => toNode(node));
    queryParam.list.forEach((first) => {
      first.children.forEach((second) => {
        second.children.forEach((third) => {
          third.parentName = first.label;
          queryParam.searchAll.push(third);
        });
      });
    });
    if (props.checkText) {
      queryParam.workName = props.checkText;
      queryParam.list.forEach((first) => {
        first.children.forEach((second) => {
          second.children.forEach((third) => {
            if (third.label == props.checkText) {
              queryParam.checkWork = third;
              queryParam.active = first.value;
            }
          });
        });
      });
    } else {
      queryParam.active = queryParam.list[0].value;
    }
  });
}
</script>

<template>
  <div>
    <!-- 原代码直接对 props.visible 做 v-model（原样保留） -->
    <Modal v-model:visible="props.visible" title="选择职位工种" width="985px" @ok="handleOk" @cancel="handleCancel">
      <div class="xf-relative">
        <a-input-search
          v-model:value="queryParam.workName"
          placeholder="已选择的职位工种"
          size="large"
          :style="{ position: 'absolute', top: '-70px', right: '28%', 'z-index': '111', width: '45%' }"
          :disabled="true"
        >
          <template #enterButton>
            <a-button :style="{ width: '100px' }" @click="clearWork">
              <template #icon>
                <div>
                  <img style="width: 20px" :src="deleteIcon" />
                  <label style="font-size: 16px" for="">删除</label>
                </div>
              </template>
            </a-button>
          </template>
        </a-input-search>
      </div>
      <div class="show-jobType trans xf-relative" id="jobSortSelect">
        <div class="xf-sort-downBox clearfix">
          <div class="lf xf-sort-nav">
            <div class="posInput22">
              <a-input placeholder="请输入关键字" v-model:value="queryParam.searchCont" @input="handleSearchInput" clearable />
              <ul v-if="queryParam.searchList.length > 0 && queryParam.searchCont !== ''" class="posRWork">
                <li
                  v-for="(item, index) in queryParam.searchList"
                  class="ellipsis pointer"
                  :key="'pos' + index"
                  :title="item.parentName + item.label"
                  @click="selectWork(item)"
                >{{ item.parentName }} >{{ item.label }}</li>
              </ul>
            </div>
            <ul class="xf-sortNav-menu">
              <li
                v-for="(item, index) in queryParam.list"
                :class="queryParam.active === item.value ? 'xf-sort-item  xf-sort-manger active' : 'xf-sort-item  xf-sort-manger'"
                :key="'type' + index"
                @click="queryParam.active = item.value"
              >
                <a href="javascript:void(0)" class="xf-sort-navType clearfix">
                  <i class="el-icon-caret-right marRight10"></i>
                  <span class="hAll ellipsis">{{ item.label }}</span>
                </a>
                <div class="xf-sort-itemBox">
                  <div v-for="(child, childIndex) in item.children" class="xf-sort-content" :key="'children' + childIndex">
                    <h2 class="xf-two-sort pointer parent">{{ child.label }}</h2>
                    <div class="xf-sort-job clearfix">
                      <a
                        href="javascript:void(0)"
                        v-for="(sec, secIndex) in child.children"
                        :key="'sec' + secIndex"
                        @click="selectWork(sec)"
                        :class="sec.label == queryParam.workName ? 'activeColor' : ''"
                      >{{ sec.label }}</a>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* 原样来自 legacy-dist/usercenter/assets/workType.1751615607545.css（data-v-13870526） */
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
  color: #0facf3;
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
  color: #0facf3;
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
  color: #0facf3;
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
  box-shadow: 0 0 5px #0facf3;
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
  box-shadow: 0 0 5px #0facf3;
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
  color: #0facf3;
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
  color: #0facf3 !important;
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
.xf-relative {
  position: relative;
}
a {
  color: #000;
}
/* 原 css：[data-v-13870526] * { ... } */
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
  color: #0facf3 !important;
}
</style>
