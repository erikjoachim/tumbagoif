import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'


let routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue')
  },
  {
    path: '/integritetspolicy',
    name: 'Integritetspolicy',
    component: () => import('../pages/PrivacyPolicy.vue')
  },
  {
    path: '/cookies',
    name: 'Cookies',
    component: () => import('../pages/CookiesPolicy.vue')
  },
  {
    path: '/under-konstruktion',
    name: 'UnderConstruction',
    component: () => import('../pages/UnderConstruction.vue')
  }
];

if (import.meta.env.VITE_UNDER_CONSTRUCTION === 'true') {
  routes = [
    {
      path: '/:pathMatch(.*)*',
      name: 'UnderConstruction',
      component: () => import('../pages/UnderConstruction.vue')
    }
  ];
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to: RouteLocationNormalized, _from: RouteLocationNormalized, savedPosition: { left: number; top: number } | null) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

export default router
