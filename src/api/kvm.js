import request from '@/utils/request'

const apiUrl = 'http://127.0.0.1:8000/api/v1/kvm/'

export function getAllVmData(action) {
  return request({
    url: apiUrl + `vm/?a=${action}`,
    method: 'get'
  })
}

export function getVmData(id) {
  return request({
    url: apiUrl + `vm/${id}/`,
    method: 'get'
  })
}

export function deleteVM(id, del_disk) {
  return request({
    url: apiUrl + `vm/?a=delete&id=${id}&del_disk=${del_disk}`,
    method: 'get'
  })
}

export function addNode(data) {
  return request({
    url: apiUrl + 'node/',
    method: 'post',
    data: data
  })
}

export function addVm(data) {
  return request({
    url: apiUrl + 'vm/',
    method: 'post',
    data: data
  })
}

export function actionVM(action, id) {
  return request({
    url: apiUrl + `vm/?a=${action}&id=${id}`,
    method: 'get'
  })
}

export function deleteNode(id) {
  return request({
    url: apiUrl + `node/${id}/`,
    method: 'delete'
  })
}

export function updateVM(id, data) {
  return request({
    url: `/vue-element-admin/role/${id}/`,
    method: 'put',
    data
  })
}

export function getVmInfo(id, node) {
  return request({
    url: apiUrl + `?a=get_vm_data&id=${id}&node=${node}`,
    method: 'get'
  })
}

export function getStorage(id) {
  return request({
    url: apiUrl + `storage/${id}/`,
    method: 'get'
  })
}

export function getStorageImages(id) {
  return request({
    url: apiUrl + `storage/${id}/?a=image`,
    method: 'get'
  })
}

export function getStorageFloppys(id) {
  return request({
    url: apiUrl + `storage/${id}/?a=floppy`,
    method: 'get'
  })
}
