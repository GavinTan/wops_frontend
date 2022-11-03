// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取资产树列表 */
export async function getAssetTree(
  params?: {
    a?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.TreeNodeResult>('/api/assets/asset/tree/', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建资产树节点 */
export async function createAssetTreeNode(options?: { [key: string]: any }) {
  return request<API.TreeNodeResult>('/api/assets/asset/tree/', {
    method: 'POST',
    ...(options || {})
  });
}

/** 删除资产树节点 */
export async function deleteAssetTreeNode(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/assets/asset/tree/', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取资产 */
export async function getAllAsset(
  params?: {
    offset?: number;
    limit?: number;
    treeKey?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.AssetList>(`/api/assets/asset/`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 添加资产 */
export async function addAsset(options?: { [key: string]: any }) {
  return request<API.AssetResult>('/api/assets/asset/', {
    method: 'POST',
    ...(options || {})
  });
}

/** 更新资产 */
export async function updateAsset(id: number, options?: { [key: string]: any }) {
  return request<API.AssetResult>(`/api/assets/asset/${id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}


/** 删除资产 */
export async function deleteAsset(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/assets/asset/multiple_delete/', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取代理 */
export async function getAllProxy(
  params?: {
    offset?: number;
    limit?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.ProxyResult>(`/api/assets/proxy/`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 添加代理 */
export async function createProxy(options?: { [key: string]: any }) {
  return request<API.ProxyResult>('/api/assets/proxy/', {
    method: 'POST',
    ...(options || {})
  });
}

/** 更新代理 */
export async function updateProxy(id: number, options?: { [key: string]: any }) {
  return request<API.ProxyResult>(`/api/assets/proxy/${id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}


/** 删除代理 */
export async function deleteProxy(options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/api/assets/proxy/`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取代理平台 */
export async function getAllProxyPlatform(
  params?: {
    offset?: number;
    limit?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.ProxyPlatformResult>(`/api/assets/platform/`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 添加代理平台 */
export async function createProxyPlatform(options?: { [key: string]: any }) {
  return request<API.ProxyPlatformResult>('/api/assets/platform/', {
    method: 'POST',
    ...(options || {})
  });
}

/** 更新代理平台 */
export async function updateProxyPlatform(id: number, options?: { [key: string]: any }) {
  return request<API.ProxyPlatformResult>(`/api/assets/platform/${id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}


/** 删除代理平台 */
export async function deleteProxyPlatform(options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/api/assets/platform/multiple_delete/`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
