<template>
  <div class="login-page">
    <div class="login-box">
      <h2>成信大数字校园系统</h2>

      <div v-if="isLogin" class="login-form">
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
        <div class="switch-text">
          还没有账号？<span @click="toggleForm" class="link">立即注册</span>
        </div>
      </div>

      <div v-else class="register-form">
        <div class="input-item">
          <label>学号</label>
          <input v-model="regUsername" type="text" placeholder="请输入学号" />
        </div>

        <div class="input-item">
          <label>姓名</label>
          <input v-model="regName" type="text" placeholder="请输入姓名" />
        </div>

        <div class="input-item">
          <label>性别</label>
          <select v-model="regGender" class="gender-select">
            <option value="">请选择性别</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>

        <div class="input-item">
          <label>密码</label>
          <input v-model="regPassword" type="password" placeholder="请输入密码（至少6位）" />
        </div>

        <div class="input-item">
          <label>确认密码</label>
          <input v-model="regConfirmPassword" type="password" placeholder="请再次输入密码" />
        </div>

        <button class="register-btn" @click="registerHandle">注册</button>
        <div class="msg" v-if="msgText">{{ msgText }}</div>
        <div class="switch-text">
          已有账号？<span @click="toggleForm" class="link">立即登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '@/api'

const router = useRouter()

const isLogin = ref(true)
const username = ref('')
const password = ref('')
const regUsername = ref('')
const regName = ref('')
const regGender = ref('')
const regPassword = ref('')
const regConfirmPassword = ref('')
const msgText = ref('')

const toggleForm = () => {
  isLogin.value = !isLogin.value
  msgText.value = ''
  username.value = ''
  password.value = ''
  regUsername.value = ''
  regName.value = ''
  regGender.value = ''
  regPassword.value = ''
  regConfirmPassword.value = ''
}

const validateRegister = () => {
  if (!regUsername.value) {
    msgText.value = '学号不能为空'
    return false
  }
  if (regUsername.value.length < 5 || regUsername.value.length > 20) {
    msgText.value = '学号长度必须在5-20个字符之间'
    return false
  }
  if (!regName.value) {
    msgText.value = '姓名不能为空'
    return false
  }
  if (regName.value.length < 2 || regName.value.length > 50) {
    msgText.value = '姓名长度必须在2-50个字符之间'
    return false
  }
  if (!regGender.value) {
    msgText.value = '请选择性别'
    return false
  }
  if (!regPassword.value) {
    msgText.value = '密码不能为空'
    return false
  }
  if (regPassword.value.length < 6) {
    msgText.value = '密码长度不能少于6个字符'
    return false
  }
  if (regPassword.value !== regConfirmPassword.value) {
    msgText.value = '两次输入的密码不一致'
    return false
  }
  return true
}

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

const registerHandle = async () => {
  if (!validateRegister()) {
    return
  }

  try {
    console.log('发送注册请求:', {
      username: regUsername.value,
      name: regName.value,
      gender: regGender.value,
      password: regPassword.value
    })
    const res = await register({
      username: regUsername.value,
      name: regName.value,
      gender: regGender.value,
      password: regPassword.value
    })

    console.log('注册响应:', res)

    if (res.code === 1) {
      alert('注册成功，请登录')
      toggleForm()
    } else {
      msgText.value = res.msg
    }
  } catch (error) {
    console.error('注册错误:', error)
    msgText.value = '注册失败，请检查后端服务是否启动'
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
.gender-select {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  background: white;
}
.login-btn, .register-btn {
  width: 100%;
  height: 46px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}
.login-btn:hover, .register-btn:hover {
  background: #2563eb;
}
.msg {
  margin-top: 15px;
  text-align: center;
  color: #ef4444;
  font-size: 14px;
}
.switch-text {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}
.switch-text .link {
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
}
.switch-text .link:hover {
  color: #2563eb;
}
</style>