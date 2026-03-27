<template>
  <div class="login-page">
    <div class="login-box">
      <h2>成信大数字校园系统</h2>

      <div class="input-item">
        <label>学号</label>
        <input v-model="username" type="text" placeholder="请输入学号" />
      </div>

      <div class="input-item">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="默认密码：123456" />
      </div>

      <button class="login-btn" @click="loginHandle">登录</button>
      <div class="msg" v-if="msgText">{{ msgText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api'
const router = useRouter()
const username = ref('')
const password = ref('')
const msgText = ref('')

const loginHandle = async () => {
  if (!username.value || !password.value) {
    msgText.value = '学号和密码不能为空'
    return
  }

  try {
    console.log('发送登录请求:', { username: username.value, password: password.value })
    const res = await login({
      username: username.value,
      password: password.value
    })

    console.log('登录响应:', res)

    if (res.code === 1) {
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      localStorage.setItem('isLogin', 'true')
      alert('欢迎你，' + res.data.name)
      
      router.push('/text')
    } else {
      msgText.value = res.msg
    }
  } catch (error) {
    console.error('登录错误:', error)
    msgText.value = '登录失败，请检查后端服务是否启动'
  }
}
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}
.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
}
.input-item {
  margin-bottom: 20px;
}
.input-item label {
  display: block;
  margin-bottom: 8px;
}
.input-item input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
}
.login-btn {
  width: 100%;
  height: 46px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}
.login-btn:hover {
  background: #2563eb;
}
.msg {
  margin-top: 15px;
  text-align: center;
  color: #ef4444;
  font-size: 14px;
}
</style>