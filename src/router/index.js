import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import Layout from '../components/Layout.vue'
import TextShow from '../components/TextShow.vue'
import CesiumCUIT from '../components/CesiumCUIT.vue'
import BuildingStats from '../components/BuildingStats.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/',
      component: Layout,
      children: [
        { path: '/text', component: TextShow },
        { path: '/map', component: CesiumCUIT },
        { path: '/building-stats', component: BuildingStats }
      ]
    }
  ]
})

export default router