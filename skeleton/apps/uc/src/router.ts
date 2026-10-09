import { createRouter, createWebHistory } from "vue-router";

// Sample routes only (restore-poc). @views resolves to restore-<group>/uc/src/views (see vite.uc.config.ts).
export const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    { path: "/resumetemplate", name: "Resumetemplate", meta: { title: "简历模板" }, component: () => import("@views/resumetemplate.vue") },
    { path: "/maskunit", name: "Maskunit", meta: { title: "单位屏蔽" }, component: () => import("@views/maskunit.vue") },
    { path: "/doneList", name: "DoneList", meta: { title: "办理进度" }, component: () => import("@views/doneList.vue") },
    { path: "/Createaresume", name: "Createaresume", meta: { title: "创建简历" }, component: () => import("@views/Createaresume.vue") },
    // confirm-routes (20 页确认)
    { path: "/formDone/:type", component: () => import("@views/formDone.vue") }, // c03
    { path: "/CorpAttestationapprove", component: () => import("@views/CorpAttestationapprove.vue") }, // c04
    { path: "/corpFairs/:key?", component: () => import("@views/corpFairs.vue") }, // c05
    { path: "/signUp", component: () => import("@views/signUp.vue") }, // c06
    { path: "/JobFairsHome/:key?", component: () => import("@views/JobFairsHome.vue") }, // c07
    { path: "/trainCertificate", component: () => import("@views/trainCertificate.vue") }, // c12
    { path: "/zgAccount", component: () => import("@views/zgAccount.vue") }, // c13
    { path: "/unRegister", component: () => import("@views/unRegister.vue") }, // c14
    { path: "/accountBind", component: () => import("@views/accountBind.vue") }, // c15
    { path: "/industrySkillTree", component: () => import("@views/industrySkillTree.vue") }, // c16
    { path: "/StorageChgPassword", component: () => import("@views/StorageChgPassword.vue") }, // c18
    { path: "/webFairWork/:zphId", component: () => import("@views/webFairWork.vue") }, // c19
    { path: "/:pathMatch(.*)*", component: { template: "<div class='poc-404'>route not in the POC</div>" } },
  ],
});
