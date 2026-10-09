<script setup lang="ts">
// 还原自 legacy-dist/portal/assets/homeNews.17833206362002.js（__name: homeNews，scopeId data-v-51b3470e）
// 样式来自 homeNews.1783320636200.css（同 scopeId）。
import { reactive, watch, onBeforeMount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAppConfig, useStore, getArticleList, getArticleListByTypeIds, openArticle, dayjs } from "@/legacy";
import { API_BASE, STATIC_BASE } from "@/utils/request";
import Empty from "@shared/empty.vue";

const props = defineProps({
  type: { type: String, default: "news_information_ids" },
  areaId: { type: String, default: "" },
  dict: { type: String, default: "" },
  showImg: { type: Boolean, default: true },
  classType: { type: String, default: "1" },
  pageSize: { type: Number, default: 6 },
  title: { type: String, default: "" },
});

const appConfig = getAppConfig();
const store = useStore();
useRouter(); // 原代码调用了 useRouter() 但未使用返回值

let dictList = store.getters.dictList;

watch(
  () => store.getters.dictList,
  () => {
    console.log("---jinaliel2,", dictList);
    if (store.getters.dictList == null || store.getters.dictList == null) {
      dictList = null;
      loadDict();
    } else {
      pickDictType();
    }
  },
  { deep: true },
);

onBeforeMount(() => {
  dictList = null;
  if (dictList == null || dictList == null) {
    console.log("---jinaliel21,", dictList);
    loadDict();
  }
});

// 原变量 t（console.log 里叫 queryParam）。NewsupdatesListImg / newActiveId / newActiveName 在原代码里是后来动态挂上去的键
const queryParam = reactive<{
  news: any[];
  NewsupdatesList: { typeId: string; data: any[] }[];
  newsActiveId: string;
  newsActiveName: string;
  NewsupdatesListImg?: any[];
  newActiveId?: string;
  newActiveName?: string;
}>({
  news: [],
  NewsupdatesList: [],
  newsActiveId: "",
  newsActiveName: "",
});

// 原变量 L
const loading = reactive({
  newsLoad: true,
  newsLoadList: true,
});

// 原函数 q：切换新闻分类（点击 / 鼠标移入标题）
function switchNews(typeId: string, index: number) {
  if (typeId == queryParam.newsActiveId) return false;
  queryParam.newsActiveId = typeId;
  queryParam.newsActiveName = queryParam.news[index].name;
  if (queryParam.NewsupdatesList.find((item) => item.typeId == typeId)) {
    loading.newsLoadList = false;
    return false;
  }
  let params = {
    pageNo: 1,
    pageSize: props.pageSize,
    terminalType: "10",
    areaId: props.areaId,
    provincialLevel: props.areaId ? 0 : 1,
    typeId,
  };
  getArticleList(params).then((res: any) => {
    loading.newsLoadList = false;
    if (res.success) {
      queryParam.NewsupdatesList = [];
      queryParam.NewsupdatesList.push({ typeId, data: res.result.records });
      let imgList: any[] = [];
      res.result.records.forEach((record: any) => {
        if (record.coverPicPath) imgList.push(record);
      });
      loading.newsLoad = false;
      if (index == 0) {
        queryParam.NewsupdatesListImg = imgList;
        console.log(queryParam.NewsupdatesListImg, "queryParam.NewsupdatesListImg");
      }
    }
  });
}

// 原函数 T
function openWindow(url: string) {
  window.open(url, "_blank");
}

onMounted(async () => {});

// 原函数 W：字典未就绪时触发 store 拉取
const loadDict = () => {
  dictList = store.getters.dictList;
  let dictCode = appConfig.businessDict;
  if (props.dict) dictCode = props.dict;
  if (dictList) {
    pickDictType();
  } else {
    store.dispatch("getDictCode", { dictCode });
  }
};

// 原函数 X：在字典里找 label === props.type 的项
const pickDictType = () => {
  dictList = store.getters.dictList;
  loading.newsLoad = false;
  loading.newsLoadList = false;
  for (let i = 0; i < dictList.length; i++) {
    const dictItem = store.state.dictCode[i];
    if (dictItem.label === props.type) {
      queryNews(dictItem);
      break;
    }
  }
};

// 原函数 We：按 typeIds 查新闻分类列表
const queryNews = (dictItem: { value: string }) => {
  let params = {
    areaId: props.areaId,
    provincialLevel: props.areaId ? 0 : 1,
    terminalType: "10",
    typeIds: dictItem.value,
  };
  getArticleListByTypeIds(params).then((res: any) => {
    if (res.success) {
      queryParam.news = res.result;
      if (queryParam.news.length > 0) {
        // 原代码写的是 newActiveId / newActiveName（与 newsActiveId 不是同一个键），原样保留
        queryParam.newActiveId = queryParam.news[0].id;
        queryParam.newActiveName = queryParam.news[0].name;
        switchNews(queryParam.news[0].id, 0);
      }
    }
  });
};
</script>

<template>
  <!-- classType 1 -->
  <div v-if="props.classType == '1'" :class="['flex', props.showImg ? 'main' : 'wAll']">
    <div v-if="props.showImg" class="newsLeft">
      <!-- 原代码此处读的是 props.newsLoad（并不存在的 prop，恒为 undefined），不是 loading.newsLoad，原样保留 -->
      <a-skeleton-image v-if="props.newsLoad" style="height: 300px; width: 532px" />
      <a-carousel
        v-else-if="queryParam.NewsupdatesListImg?.length > 0"
        class="relatie sjz-home-newsSwiper dotsiullunbo"
        autoplay
        arrows
        dots-class="slick-dots slick-thumb"
      >
        <template #customPaging="e">
          <div class="dotsilunbo pointer">{{ e.i + 1 }}</div>
        </template>
        <div
          v-for="(item, index) in queryParam.NewsupdatesListImg"
          class="relatie sjz-home-newsSwiper radius10 pointer"
          :key="'img' + index"
          @click="openArticle(item)"
        >
          <a-image
            class="radius10"
            style="height: 300px; width: 532px"
            :src="API_BASE + STATIC_BASE + '/' + item.coverPicPath"
            fallback="/default/default.jpg"
            :preview="false"
          />
          <div class="palTel u-f ellipsis">
            <a-tooltip>{{ item.title }}</a-tooltip>
          </div>
        </div>
      </a-carousel>
      <a-image v-else class="radius10" style="height: 300px; width: 532px" src="/default/default.jpg" :preview="false" />
    </div>
    <div :class="['bg-f radius5 pad20', props.showImg ? 'w644' : 'wAll']" style="padding-top: 15px">
      <div class="flex flex-pack-between">
        <div class="flex newsTitle">
          <p
            v-for="(item, index) in queryParam.news"
            :class="['marR20 pointer font-20 u-58', queryParam.newsActiveId == item.id ? 'newActive' : '']"
            :key="'newsTitle' + index"
            @click="openWindow('/newsList?id=' + queryParam.newsActiveId + '&typeName=' + item.name)"
            @mouseenter="switchNews(item.id, index)"
          >
            {{ props.title }}{{ item.name }} <i></i>
          </p>
        </div>
        <div
          class="u-8 font-16 hoverBlue pointer"
          @click="openWindow('/newsList?id=' + queryParam.newsActiveId + '&typeName=' + queryParam.newsActiveName)"
        >
          查看更多
        </div>
      </div>
      <a-skeleton active :loading="loading.newsLoadList" :paragraph="{ rows: 6 }">
        <div class="u-3 font-16 marT15">
          <div
            v-for="item in queryParam.NewsupdatesList"
            :key="item.typeId"
            v-show="queryParam.newsActiveId == item.typeId"
          >
            <template v-if="item.data.length">
              <div
                v-for="(article, idx) in item.data"
                class="padT10 flex pointer"
                @click="openArticle(article)"
                :key="idx"
              >
                <div class="w90 ellipsis u-6a hoverBlue">
                  <span class="circle"></span>
                  <span
                    v-if="article.izTop == '1'"
                    class="u-f radius5 textCenter marR10 font-14"
                    style="background-color: #f00; display: inline-block; width: 44px; height: 26px; line-height: 26px"
                  >置顶</span>{{ article.title }}
                </div>
                <div class="u-9 w10 ellipsis textRight">{{ dayjs(article.publishTime).format("MM-DD") }}</div>
              </div>
            </template>
            <Empty v-else />
          </div>
        </div>
      </a-skeleton>
    </div>
  </div>

  <!-- classType 2 -->
  <div v-else-if="props.classType == '2'">
    <div class="flex flex-pack-between marB10">
      <div class="flex newsTitle">
        <p
          v-for="(item, index) in queryParam.news"
          :class="['marR20 pointer font-20 u-58', queryParam.newsActiveId == item.id ? 'newActive' : '']"
          :key="'newsTitle' + index"
          @click="openWindow('/newsList?id=' + queryParam.newsActiveId + '&typeName=' + item.name)"
          @mouseenter="switchNews(item.id, index)"
        >{{ props.title }}{{ item.name }}</p>
      </div>
      <div
        class="u-8 font-16 hoverBlue pointer"
        @click="openWindow('/newsList?id=' + queryParam.newsActiveId + '&typeName=' + queryParam.newsActiveName)"
      >
        查看更多
      </div>
    </div>
    <div class="flex flex-pack-between">
      <div v-if="props.showImg" class="newsLeft">
        <!-- 同 classType 1：原代码读的是 props.newsLoad -->
        <a-skeleton-image v-if="props.newsLoad" style="height: 300px; width: 532px" />
        <div v-else-if="queryParam.NewsupdatesListImg?.length > 0" class="relatie">
          <a-carousel class="relatie home-newsSwiper dotsiullunbo" arrows autoplay dots-class="slick-dots slick-thumb">
            <template #customPaging="e">
              <div class="dotsilunbo pointer">{{ e.i + 1 }}</div>
            </template>
            <div
              v-for="(item, index) in queryParam.NewsupdatesListImg"
              class="relatie home-newsSwiper radius10 pointer"
              :key="'img' + index"
              @click="openArticle(item)"
            >
              <a-image
                class="radius10"
                style="height: 300px; width: 532px"
                :src="API_BASE + STATIC_BASE + '/' + item.coverPicPath"
                fallback="/default/default.jpg"
                :preview="false"
              />
              <div class="palTel u-f ellipsis">
                <a-tooltip>
                  <template #title>{{ item.title }}</template>
                </a-tooltip>
              </div>
              <div class="newsTitle">{{ item.title }}</div>
            </div>
          </a-carousel>
          <div class="newsTitleBg"></div>
        </div>
        <Empty v-else />
      </div>
      <div class="bg-f radius5 w644">
        <a-skeleton active :loading="loading.newsLoadList" :paragraph="{ rows: 6 }">
          <div class="u-3 font-16">
            <div
              v-for="item in queryParam.NewsupdatesList"
              :key="item.typeId"
              v-show="queryParam.newsActiveId == item.typeId"
            >
              <template v-if="item.data.length">
                <div
                  v-for="(article, idx) in item.data"
                  class="padT10 flex pointer"
                  @click="openArticle(article)"
                  :key="idx"
                >
                  <div class="w90 ellipsis u-6a hoverBlue" style="height: 26px; line-height: 26px">
                    <span class="circle"></span>
                    <span
                      v-if="article.izTop == '1'"
                      class="u-f radius5 textCenter marR10 font-14"
                      style="background-color: #f00; display: inline-block; width: 44px; height: 25px; line-height: 25px"
                    >置顶</span>{{ article.title }}
                  </div>
                  <div class="u-9 w10 ellipsis textRight">{{ dayjs(article.publishTime).format("MM-DD") }}</div>
                </div>
              </template>
              <Empty v-else />
            </div>
          </div>
        </a-skeleton>
      </div>
    </div>
  </div>

  <!-- classType 3 -->
  <div v-else-if="props.classType == '3'">
    <div class="flex flex-pack-between marB10">
      <div class="flex newsTitle">
        <p
          v-for="(item, index) in queryParam.news"
          :class="['marR20 pointer font-20 u-58', queryParam.newsActiveId == item.id ? 'newActive' : '']"
          :key="'newsTitle' + index"
          @click="openWindow('/newsList?id=' + queryParam.newsActiveId + '&typeName=' + item.name)"
          @mouseenter="switchNews(item.id, index)"
        >{{ props.title }}{{ item.name }}</p>
      </div>
      <div
        class="u-8 font-16 hoverBlue pointer"
        @click="openWindow('/newsList?id=' + queryParam.newsActiveId + '&typeName=' + queryParam.newsActiveName)"
      >
        查看更多
      </div>
    </div>
    <div class="flex flex-pack-between">
      <div class="newsLeft" style="width: 532px">
        <a-skeleton-image v-if="loading.newsLoad" style="height: 300px; width: 532px" />
        <div v-else-if="queryParam.NewsupdatesListImg?.length > 0" class="relatie">
          <a-carousel class="relatie home-newsSwiper dotsiullunbo" autoplay arrows dots-class="slick-dots slick-thumb">
            <template #customPaging="e">
              <div class="dotsilunbo pointer">{{ e.i + 1 }}</div>
            </template>
            <div
              v-for="(item, index) in queryParam.NewsupdatesListImg"
              class="relatie home-newsSwiper radius10 pointer"
              :key="'img' + index"
              @click="openArticle(item)"
            >
              <a-image
                class="radius10"
                style="height: 300px; width: 532px"
                :src="API_BASE + STATIC_BASE + '/' + item.coverPicPath"
                fallback="/default/default.jpg"
                :preview="false"
              />
              <div class="palTel u-f ellipsis">
                <a-tooltip>
                  <template #title>{{ item.title }}</template>
                </a-tooltip>
              </div>
              <div class="newsTitle">{{ item.title }}</div>
            </div>
          </a-carousel>
          <div class="newsTitleBg"></div>
        </div>
        <Empty v-else />
      </div>
      <div class="bg-f radius5" style="width: 400px">
        <a-skeleton v-if="loading.newsLoadList" :paragraph="{ rows: 6 }" />
        <div v-else-if="queryParam.NewsupdatesList?.length > 0" class="u-3 font-16">
          <div
            v-for="item in queryParam.NewsupdatesList"
            :key="item.typeId"
            v-show="queryParam.newsActiveId == item.typeId"
          >
            <div
              v-for="(article, idx) in item.data"
              class="padT10 flex pointer"
              @click="openArticle(article)"
              :key="idx"
            >
              <div class="w80 ellipsis u-6a hoverBlue">
                <span class="circle"></span>
                <span
                  v-if="article.izTop == '1'"
                  class="u-f radius5 textCenter marR10 font-14"
                  style="background-color: #f00; display: inline-block; width: 44px; height: 26px; line-height: 26px"
                >置顶</span>{{ article.title }}
              </div>
              <div class="u-9 w20 textRight">{{ dayjs(article.publishTime).format("MM-DD") }}</div>
            </div>
          </div>
        </div>
        <Empty v-else />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* homeNews.1783320636200.css（data-v-51b3470e） */
.newsLeft{width:532px;height:300px;margin-right:20px}
.newsTitle p{position:relative}
.newActive{color:#333;font-weight:700}
.newsTitle p i{position:absolute;bottom:-8px;content:"";background-color:#e40517;width:70%;margin-left:15%;height:5px;left:0;display:none}
.newsTitle p:hover i,.newsTitle .newActive i{display:block}
.sjz-home-newsSwiper{width:532px;height:300px;position:relative}
.sjz-home-newsSwiper .palTel{text-align:left;position:absolute;width:532px;line-height:30px;padding:10px 160px 10px 10px;bottom:0;font-size:16px;background-color:#00000080;border-radius:0 0 10px 10px}
.home-newsSwiper{width:532px;height:370px;position:relative}
.home-newsSwiper .palTel{text-align:left;position:absolute;width:532px;height:40px;padding:10px 120px 10px 10px;bottom:70px;font-size:16px;background-color:#0003;border-radius:0 0 10px 10px}
.home-newsSwiper .newsTitle{text-align:left;position:absolute;width:532px;line-height:30px;padding:10px;bottom:0;font-size:16px}
.newsTitleBg{height:50px;width:532px;border-radius:10px;background-color:#0000001a;bottom:50px}
:deep(.ant-carousel .slick-dots){position:absolute;justify-content:end;right:0;left:0;bottom:0;right:10px!important;left:inherit!important;width:auto!important;cursor:pointer;margin-left:0!important;margin-right:0!important}
:deep(.home-newsSwiper.ant-carousel .slick-dots){bottom:65px!important}
:deep(.ant-carousel .slick-dots li){width:20px;height:20px;border-radius:50%;text-indent:0;font-size:16px;color:#fff;text-align:center;line-height:20px}
:deep(.ant-carousel .slick-dots li a),:deep(.ant-carousel .slick-dots li a .dotsilunbo){width:100%;height:100%}
:deep(.ant-carousel .slick-dots li.slick-active){width:20px;height:20px;background:#ffffff;border-radius:50%;color:#0f0f0f;text-align:center;line-height:20px}
.circle{width:5px;height:5px;background-color:#333;border-radius:100%;display:inline-block;margin-right:13px;position:relative;top:-3.5px}
.w644{width:644px}
</style>
