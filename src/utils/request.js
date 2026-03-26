import axios from 'axios'

const service = axios.create({
  baseURL: 'http://localhost:5000', // 就是你刚启动的后端地址
  timeout: 5000
})

export default service