<template>
  <div class="layout-container">
    <!-- 左侧菜单 -->
    <div class="sidebar">
      <div class="sidebar-header">成信大数字校园系统</div>

      <div 
        class="menu-item"
        :class="{ active: route.path === '/text' }"
        @click="goTo('/text')"
      >
        校园建筑信息
      </div>

      <div 
        class="menu-item"
        :class="{ active: route.path === '/map' }"
        @click="goTo('/map')"
      >
        校园立体地图
      </div>

      <div 
        class="menu-item"
        :class="{ active: route.path === '/building-stats' }"
        @click="goTo('/building-stats')"
      >
        建筑数据分析
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
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* ========== 左侧美化菜单 ========== */
.sidebar {
  width: 240px;
  background: #1f2937;
  color: #e5e7eb;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 菜单顶部标题 */
.sidebar-header {
  height: 65px;
  line-height: 65px;
  padding-left: 25px;
  font-size: 17px;
  font-weight: bold;
  background: #111827;
  color: #ffffff;
  border-bottom: 1px solid #374151;
}

/* 菜单项 —— 修复宽度跳动 */
.menu-item {
  height: 55px;
  line-height: 55px;
  padding-left: 25px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

/*  hover 效果 */
.menu-item:hover {
  background: #374151;
  color: #ffffff;
  border-left-color: #60a5fa;
}

/* 选中高亮 */
.menu-item.active {
  background: #3b82f6;
  color: #ffffff;
  border-left-color: #ffffff;
}

/* ========== 右侧内容区 ========== */
.content {
  flex: 1;
  background: #f9fafb;
  overflow: auto;
  box-sizing: border-box;
}
</style>