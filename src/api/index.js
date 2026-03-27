import request from '../utils/request'

// 登录接口
export function login(data) {
  return request({
    url: '/api/login',
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