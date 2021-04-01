import request from '@/utils/request'

const apiUrl = 'http://127.0.0.1:8000/api/v1/kvm/'

export function getData(query) {
  return request({
    url: apiUrl + 'es',
    method: 'get',
    params: query
  })
}

export function getDetail(serach) {
  return request({
    url: apiUrl + `?q=${serach}`,
    method: 'get'
  })
}

export function addData(size, query) {
  return request({
    url: apiUrl + 'es/',
    method: 'post',
    data: { 'action': 'add', 'size': size },
    params: query
  })
}

export function searchData(q, query) {
  return request({
    url: apiUrl + 'es/',
    method: 'post',
    data: { 'action': 'search', 'q': q },
    params: query
  })
}

export function deleteData(id) {
  return request({
    url: apiUrl + `es/${id}/`,
    method: 'delete'
  })
}
