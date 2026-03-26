<template>
  <div class="layout-container">
    <!-- 左侧菜单 -->
    <div class="sidebar">
      <div class="menu-item"
           :class="{ active: route.path === '/text' }"
           @click="goTo('/text')">
        文本展示
      </div>
      <div class="menu-item"
           :class="{ active: route.path === '/map' }"
           @click="goTo('/map')">
        三维地图
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const goTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.layout-container {
  width: 100vw;
  height: 100vh;
  display: flex;
}

/* 左侧菜单 */
.sidebar {
  width: 220px;
  background: #2f4050;
  color: white;
  padding-top: 20px;
}

.menu-item {
  height: 50px;
  line-height: 50px;
  padding-left: 25px;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
}

.menu-item:hover {
  background: #3d5063;
}

.menu-item.active {
  background: #409eff;
  color: white;
}

/* 右侧内容 */
.content {
  flex: 1;
  background: #f3f3f4;
  overflow: hidden;
}
</style>