<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar">
          <span class="avatar-icon">👤</span>
        </div>
        <h2>个人信息</h2>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else class="profile-form">
        <div class="form-item">
          <label>学号</label>
          <input v-model="form.username" type="text" disabled />
        </div>

        <div class="form-item">
          <label>姓名</label>
          <input v-model="form.name" type="text" placeholder="请输入姓名" />
        </div>

        <div class="form-item">
          <label>性别</label>
          <select v-model="form.gender" class="gender-select">
            <option value="">请选择性别</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>

        <div class="form-actions">
          <button class="save-btn" @click="handleSave" :disabled="saving">
            {{ saving ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserInfo, updateUserInfo } from '@/api'

const loading = ref(true)
const saving = ref(false)
const form = ref({
  id: '',
  username: '',
  name: '',
  gender: ''
})

const loadUserInfo = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (!userInfo || !userInfo.username) {
      return
    }

    const res = await getUserInfo(userInfo.username)
    if (res.code === 1) {
      form.value = {
        id: res.data.id,
        username: res.data.username,
        name: res.data.name,
        gender: res.data.gender
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!form.value.name) {
    alert('姓名不能为空')
    return
  }
  if (form.value.name.length < 2 || form.value.name.length > 50) {
    alert('姓名长度必须在2-50个字符之间')
    return
  }
  if (!form.value.gender) {
    alert('请选择性别')
    return
  }

  saving.value = true
  try {
    const res = await updateUserInfo({
      id: form.value.id,
      name: form.value.name,
      gender: form.value.gender
    })

    if (res.code === 1) {
      alert('修改成功')
      localStorage.setItem('userInfo', JSON.stringify(form.value))
      window.dispatchEvent(new StorageEvent('storage', { key: 'userInfo' }))
    } else {
      alert(res.msg || '修改失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请检查网络连接')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.profile-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  text-align: center;
  color: white;
}

.avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.avatar-icon {
  font-size: 40px;
}

.profile-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.loading {
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 16px;
}

.profile-form {
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

.form-item input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-item input:focus {
  outline: none;
  border-color: #3b82f6;
}

.gender-select {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.gender-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-actions {
  margin-top: 30px;
}

.save-btn {
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

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>