import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import Layout from '../components/Layout.vue'  // 菜单布局
import TextShow from '../components/TextShow.vue'
import CesiumCUIT from '../components/CesiumCUIT.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录页
    {
      name: 'Login',
      path: '/',
      component: LoginPage
    },

    // 菜单布局（嵌套路由）
    {
      path: '/',
      component: Layout,
      children: [
        { path: '/text', component: TextShow },
        { path: '/map', component: CesiumCUIT }
      ]
    }
  ]
})

export default router