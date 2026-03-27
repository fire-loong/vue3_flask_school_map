import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import Layout from '../components/Layout.vue'
import TextShow from '../components/TextShow.vue'
import CesiumCUIT from '../components/CesiumCUIT.vue'
import BuildingStats from '../components/BuildingStats.vue'
import ProfilePage from '../components/ProfilePage.vue'
import ChangePassword from '../components/ChangePassword.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/layout',
      component: Layout,
      children: [
        { path: '/text', component: TextShow },
        { path: '/map', component: CesiumCUIT },
        { path: '/building-stats', component: BuildingStats },
        { path: '/profile', component: ProfilePage },
        { path: '/change-password', component: ChangePassword }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isLogin = sessionStorage.getItem('isLogin') === 'true'

  if (to.path === '/') {
    if (isLogin) {
      next('/text')
    } else {
      next()
    }
  } else {
    if (isLogin) {
      next()
    } else {
      next('/')
    }
  }
})

export default router