import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/global.css'
// 引入中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn, // 全局设置中文
})
app.mount('#app')
