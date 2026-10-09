import { createRouter, createWebHistory } from "vue-router";

// Sample routes only (restore-poc). @views resolves to restore-<group>/portal/src/views (see vite.portal.config.ts).
export const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    { path: "/personnelAssessment", component: () => import("@views/personnelAssessment/index.vue") },
    { path: "/GuidanceMentorDetail", component: () => import("@views/Guidance/GuidanceMentorDetail/index.vue") },
    { path: "/newsDetail", component: () => import("@views/News/newsDetail.vue") },
    { path: "/webFairList", component: () => import("@views/fair/webFair/list.vue") },
    { path: "/oddJob", component: () => import("@views/oddJob/index.vue") },
    { path: "/archivesSearch", component: () => import("@views/sjz/archivesSearch/index.vue") },
    // confirm-routes (20 页确认)
    { path: "/ProbationHome", component: () => import("@views/BeOnProbation/ProbationHome.vue") }, // c01
    { path: "/enterpriserecruitment", component: () => import("@views/sjz/enterpriserecruitment/enterpriserecruitment.vue") }, // c02
    { path: "/sceneFairDetail/:zphId", component: () => import("@views/fair/sceneFair/detail.vue") }, // c08
    { path: "/resumeAnalysisReport", component: () => import("@views/resumeAnalysisReport/resumeAnalysisReport.vue") }, // c09
    { path: "/outLink", component: () => import("@views/outLink/index.vue") }, // c10
    { path: "/PDFPreview", component: () => import("@views/PDFPreview/PDFPreview.vue") }, // c11
    { path: "/outFairList", component: () => import("@views/fair/outFair/list.vue") }, // c17
    { path: "/talents/outFairDetail/:zphId", component: () => import("@views/talents/fair/outFair/detail.vue") }, // c20
    { path: "/:pathMatch(.*)*", component: { template: "<div class='poc-404'>route not in the POC</div>" } },
  ],
});
