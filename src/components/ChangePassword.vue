<template>
  <div class="change-password-page">
    <div class="password-card">
      <div class="password-header">
        <div class="lock-icon">
          <span class="icon">🔒</span>
        </div>
        <h2>修改密码</h2>
      </div>

      <div class="password-form">
        <div class="form-item">
          <label>原密码</label>
          <input v-model="form.oldPassword" type="password" placeholder="请输入原密码" />
        </div>

        <div class="form-item">
          <label>新密码</label>
          <input v-model="form.newPassword" type="password" placeholder="请输入新密码（至少6位）" />
        </div>

        <div class="form-item">
          <label>确认新密码</label>
          <input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </div>

        <div class="form-actions">
          <button class="submit-btn" @click="handleChangePassword" :disabled="saving">
            {{ saving ? '修改中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword } from '@/api'

const router = useRouter()
const saving = ref(false)
const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleChangePassword = async () => {
  if (!form.value.oldPassword) {
    alert('请输入原密码')
    return
  }
  if (!form.value.newPassword) {
    alert('请输入新密码')
    return
  }
  if (form.value.newPassword.length < 6) {
    alert('新密码长度不能少于6个字符')
    return
  }
  if (!form.value.confirmPassword) {
    alert('请确认新密码')
    return
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('两次输入的新密码不一致')
    return
  }

  saving.value = true
  try {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    if (!userInfo || !userInfo.id) {
      alert('用户信息不存在，请重新登录')
      router.push('/')
      return
    }

    const res = await changePassword({
      id: userInfo.id,
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword
    })

    if (res.code === 1) {
      alert('密码修改成功，请重新登录')
      sessionStorage.removeItem('userInfo')
      sessionStorage.removeItem('isLogin')
      router.push('/')
    } else {
      alert(res.msg || '密码修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    alert('修改密码失败，请检查网络连接')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.change-password-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.password-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.password-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  text-align: center;
  color: white;
}

.lock-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.icon {
  font-size: 40px;
}

.password-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.password-form {
  padding: 30px;
}

.form-item {
  margin-bottom: 25px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-item input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-item input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-actions {
  margin-top: 30px;
}

.submit-btn {
  width: 100%;
  height: 46px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>