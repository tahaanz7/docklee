import { createRouter, createWebHistory } from 'vue-router';


const routes = [
    {
        path: '/apps',
        name: 'BrowseApps',
        component: () => import('@/views/BrowseApps.vue'),
    }
   
    
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // use createWebHashHistory() if you prefer hash mode
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router