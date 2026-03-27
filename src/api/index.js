import request from '../utils/request'

// 登录接口
export function login(data) {
  return request({
    url: '/api/login',
    method: 'post',
    data
  })
}

// 注册接口
export function register(data) {
  return request({
    url: '/api/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo(username) {
  return request({
    url: '/api/user/info',
    method: 'get',
    params: { username }
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/api/user/update',
    method: 'post',
    data
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/api/user/change-password',
    method: 'post',
    data
  })
}

// 查询学生列表
export function getStudentList() {
  return request({
    url: '/api/student/list',
    method: 'get'
  })
}

// 新增学生
export function addStudent(data) {
  return request({
    url: '/api/student/add',
    method: 'post',
    data
  })
}

// 获取建筑列表
export function getBuildings() {
  return request({
    url: '/api/buildings',
    method: 'get'
  })
}