import axios from 'axios'

const service = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000
})

service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('请求错误:', error)
    if (error.response) {
      console.error('响应数据:', error.response.data)
      console.error('响应状态:', error.response.status)
    }
    alert('网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

export default service