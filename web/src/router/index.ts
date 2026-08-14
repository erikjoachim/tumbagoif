import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw, RouteLocationNormalized } from "vue-router";

// TEMPORARY preview logic — lets colleagues bypass the under-construction page via the
// /preview path. Remove together with the guard below when the site launches.
export const previewPath = "/preview";

const isPreviewPath = (path: string) => path === previewPath || path.startsWith(`${previewPath}/`);

const underConstruction = import.meta.env.VITE_UNDER_CONSTRUCTION === "true";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/Home.vue"),
  },
  {
    path: "/integritetspolicy",
    name: "Integritetspolicy",
    component: () => import("../pages/PrivacyPolicy.vue"),
  },
  {
    path: "/cookies",
    name: "Cookies",
    component: () => import("../pages/CookiesPolicy.vue"),
  },
  {
    path: "/under-konstruktion",
    name: "UnderConstruction",
    component: () => import("../pages/UnderConstruction.vue"),
  },
  // TEMPORARY preview routes — mirror the real pages under /preview. Remove with the
  // preview logic when the site launches.
  {
    path: previewPath,
    name: "PreviewHome",
    component: () => import("../pages/Home.vue"),
  },
  {
    path: `${previewPath}/integritetspolicy`,
    name: "PreviewIntegritetspolicy",
    component: () => import("../pages/PrivacyPolicy.vue"),
  },
  {
    path: `${previewPath}/cookies`,
    name: "PreviewCookies",
    component: () => import("../pages/CookiesPolicy.vue"),
  },
];

if (underConstruction) {
  routes.push({
    path: "/:pathMatch(.*)*",
    name: "CatchAll",
    component: () => import("../pages/UnderConstruction.vue"),
  });
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    savedPosition: { left: number; top: number } | null,
  ) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    } else {
      return { top: 0 };
    }
  },
});

// TEMPORARY preview logic — redirects all traffic to the under-construction page except
// /preview (and the UC page itself). Remove when the site launches.
if (underConstruction) {
  router.beforeEach((to) => {
    if (isPreviewPath(to.path) || to.path === "/under-konstruktion") {
      return true;
    }
    return { path: "/under-konstruktion" };
  });
}

export default router;
