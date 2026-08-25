import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/auth/info');
}

/**
 * 获取用户消费记录
 * @param params 
 * @returns 
 */
export async function getHistory(params: any) {
  return requestClient.get('/auth/history',{ params });
}

/**
 * 获取用户token
 * @returns 
 */
export async function getToken() {
  return requestClient.get('/auth/getToken');
}
/**
 * 获取邀请码
 * @param params 
 * @returns 
 */
export async function getInviteCode(params: any) {
  return requestClient.put('/auth/inviteCode',{
    inviteRate:params
  });
}


export async function updateUser(params: any) {
  return requestClient.put('/auth/update',params);
}
