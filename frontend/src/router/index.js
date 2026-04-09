import { createRouter, createWebHistory } from 'vue-router'
import HomeView     from '../views/HomeView.vue'
import LoginView    from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',          component: HomeView },
    { path: '/login',     component: LoginView },
    {
      path: '/dashboard',
      component: DashboardView,
      beforeEnter: () => {
        if (!localStorage.getItem('ob_token')) return '/login'
      }
    }
  ],
  scrollBehavior (to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

export default router
