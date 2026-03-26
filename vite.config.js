import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [
    vue(),
    cesium({
      // 关键：关闭自动加载默认底图，避免 JSON 解析错误
      autoBuild: false,
    })
  ],
  optimizeDeps: {
    include: ['cesium']
  }
})