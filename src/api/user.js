import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/tangying/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/tangying/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/tangying/user/logout',
    method: 'post'
  })
}
