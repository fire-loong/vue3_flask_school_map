<template>
  <div class="login-page">
    <!-- 左上角 LOGO -->
    <img src="../asset/logotext.png" class="logo" alt="LOGO" />

    <div class="login-box">
      <!-- 登录表单 -->
      <div v-if="!isRegister">
        <h2>成都信息工程大学数字校园系统</h2>

        <div class="input-item">
          <label>账号</label>
          <input type="text" placeholder="请输入账号" />
        </div>

        <div class="input-item">
          <label>密码</label>
          <input type="password" placeholder="请输入密码" />
        </div>

        <button class="login-btn" @click="gotoMap">登录</button>
        <div class="to-register" @click="isRegister = true">
          没有账号？立即注册
        </div>
      </div>

      <!-- 注册表单 -->
      <div v-else>
        <h2>用户注册</h2>
        <div class="input-item">
          <label>用户名</label>
          <input type="text" placeholder="请输入用户名" />
        </div>
        <div class="input-item">
          <label>密码</label>
          <input type="password" placeholder="请输入密码" />
        </div>
        <div class="input-item">
          <label>确认密码</label>
          <input type="password" placeholder="请确认密码" />
        </div>
        <button class="login-btn" @click="toLogin">注册</button>
        <div class="to-register" @click="isRegister = false">
          已有账号？返回登录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const isRegister = ref(false)

const gotoMap = () => {
  router.push('/text')
}
const toLogin = () => {
  isRegister.value = false
}
</script>

<style scoped>
/* 全局清除默认边距 + 禁止滚动条 */
:global(body) {
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.login-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden !important;
  
  background-image: url('../asset/bgc.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;

  display: flex;
  align-items: center;
  justify-content: center;
  
  /* 让LOGO定位生效 */
  position: relative;
}

/* ========== 左上角 LOGO ========== */
.logo {
  position: absolute;
  top: 20px;
  left: 30px;
  width: 400px;
  height: auto;
  z-index: 10;
  
  /* 关键：让白底和背景融合 */
  background: transparent;
  mix-blend-mode: multiply; /* 白色会被“滤掉”，只保留蓝色校徽 */
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.input-item {
  margin-bottom: 20px;
}

.input-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.input-item input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
}

.login-btn {
  width: 100%;
  height: 46px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.login-btn:hover {
  background: #338eef;
}

.to-register {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
}
.to-register:hover {
  text-decoration: underline;
}
</style>