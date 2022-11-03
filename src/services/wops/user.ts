// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取当前的用户 */
export async function getUserData(id: number, options?: { [key: string]: any }) {
  return request<API.UserResult>(`/api/user/${id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取所有用户 */
export async function getAllUserData(
  params: {
    offset?: number;
    limit?: number;
  },
  options: { [key: string]: any }
  ) {
  return request<API.UserListResult>(`/api/user/`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建用户 */
export async function createUser(options: { data: { [key: string]: any }}) {
  return request<API.UserResult>('/api/user/', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 更新用户 */
export async function updateUser(options: { id: number, data: { [key: string]: any }}) {
  return request<API.UserResult>(`/api/user/${options.id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 批量删除用户 */
export async function multipleDeleteUser(options: { data: { ids: number[] } }) {
  return request<API.UserResult>(`/api/user/multiple_delete/`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 登出接口 */
export async function logout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/user/logout/', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口  */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/user/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
