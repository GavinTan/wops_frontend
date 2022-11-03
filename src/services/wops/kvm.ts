// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取虚拟机列表 */
export async function getAllInstance(
  params: {
    a?: string;
    offset?: number;
    limit?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.InstanceList>('/api/kvm/instance/', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取虚拟机 */
export async function getInstance(
  id: number,
  options?: { [key: string]: any },
) {
  return request<API.InstanceResult>(`/api/kvm/instance/${id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新虚拟机 */
export async function updateInstance(id: number, options?: { [key: string]: any }) {
  return request<API.InstanceResult>(`/api/kvm/instance/${id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建虚拟机 */
export async function createInstance(options?: { [key: string]: any }) {
  return request<API.InstanceResult>('/api/kvm/instance/', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除虚拟机 */
export async function deleteInstance(id: number, options: { [key: string]: any }) {
  return request<Record<string, any>>(`/api/kvm/instance/${id}/`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 批量删除虚拟机 */
export async function multipleDeleteInstance(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/kvm/instance/_bulk/', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 虚拟机操作 */
export async function actionInstance(options?: { [key: string]: any }) {
  return request<API.InstanceResult>('/api/kvm/instance/_action/', {
    method: 'POST',
    ...(options || {}),
  });
}


/** 获取服务器列表 */
export async function getAllServer(
  params?: {
    // query
    /** 当前的页码 */
    offset?: number;
    /** 页面的容量 */
    limit?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.ServerList>('/api/kvm/server/', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新服务器 */
export async function updateServer(id: number, options?: { [key: string]: any }) {
  return request<API.ServerResult>(`/api/kvm/server/${id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建服务器 */
export async function createServer(options?: { [key: string]: any }) {
  return request<API.ServerResult>('/api/kvm/server/', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除服务器 */
export async function deleteServer(id: number, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/api/kvm/server/${id}/`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 批量删除服务器 */
export async function multipleDeleteServer(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/kvm/server/_bulk/', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取存储列表 */
export async function getAllStorage(
  params?: {
    // query
    /** 当前的页码 */
    offset?: number;
    /** 页面的容量 */
    limit?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/kvm/storage/', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getStorage(id: number, options?: { [key: string]: any },) {
  return request<API.StorageResult>(`/api/kvm/storage/${id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}


/** 添加存储池 */
export async function createStorage(options?: { [key: string]: any }) {
  return request<API.StorageResult>('/api/kvm/storage/', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function getMedia(
  params?: {
    serverId: number;
    type?: string;
    pool?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.MediaResult>('/api/kvm/storage/media/', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getDisk(
  params?: {
    offset?: number;
    limit?: number;
    serverId?: number;
    pool?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.DiskResult>('/api/kvm/storage/disk/', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
