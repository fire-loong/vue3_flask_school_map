import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'
import path from 'path'  // 加这个

export default defineConfig({
  plugins: [
    vue(),
    cesium({
      autoBuild: false,
    })
  ],
  optimizeDeps: {
    include: ['cesium']
  },
  // 👇 只加了这一段，让 @ 指向 src
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})