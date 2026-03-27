<template>
  <div class="layout-container">
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

      <div 
        class="menu-item"
        :class="{ active: route.path === '/profile' }"
        @click="goTo('/profile')"
      >
        个人信息
      </div>

      <div 
        class="menu-item"
        :class="{ active: route.path === '/change-password' }"
        @click="goTo('/change-password')"
      >
        修改密码
      </div>

      <div class="user-section">
        <div class="user-info">
          <span class="user-icon">👤</span>
          <span class="user-name">{{ userName }}</span>
        </div>
        <button class="test-btn" @click="testBackend">测试后端连接</button>
        <button class="logout-btn" @click="logout">退出登录</button>
      </div>
    </div>

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
const router = useRouter()
const route = useRoute()

const userInfo = ref({})

const userName = computed(() => {
  const stored = localStorage.getItem('userInfo')
  if (stored) {
    const parsed = JSON.parse(stored)
    return parsed.name || '用户'
  }
  return '用户'
})

let storageListener = null

const syncUserInfo = () => {
  const stored = localStorage.getItem('userInfo')
  if (stored) {
    try {
      userInfo.value = JSON.parse(stored)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
}

onMounted(() => {
  syncUserInfo()
  
  storageListener = (e) => {
    if (e.key === 'userInfo') {
      syncUserInfo()
    }
  }
  window.addEventListener('storage', storageListener)
})

onUnmounted(() => {
  if (storageListener) {
    window.removeEventListener('storage', storageListener)
  }
})

const goTo = (path) => {
  router.push(path)
}

const testBackend = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/test')
    console.log('后端测试响应:', response.data)
    if (response.data.code === 1) {
      alert('后端连接成功！数据库连接正常！')
    } else {
      alert('后端连接成功，但数据库连接失败: ' + response.data.msg)
    }
  } catch (error) {
    console.error('后端测试错误:', error)
    alert('后端连接失败！请确保后端服务已启动在 http://localhost:5000')
  }
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('userInfo')
    localStorage.removeItem('isLogin')
    router.push('/')
  }
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

.sidebar {
  width: 240px;
  background: #1f2937;
  color: #e5e7eb;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

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

.menu-item:hover {
  background: #374151;
  color: #ffffff;
}

.menu-item.active {
  background: #3b82f6;
  color: #ffffff;
}

.user-section {
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid #374151;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: #374151;
  border-radius: 6px;
}

.user-icon {
  font-size: 20px;
}

.user-name {
  font-size: 14px;
  color: #ffffff;
}

.test-btn {
  width: 100%;
  padding: 10px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  margin-bottom: 10px;
}

.test-btn:hover {
  background: #059669;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #dc2626;
}

.content {
  flex: 1;
  overflow: auto;
}
</style>