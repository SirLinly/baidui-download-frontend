import { requestClient } from '#/api/request';

/**
 *  查询订单列表
 * @param params any
 * @returns 
 */
export async function queryCardRenewal(params: any) {
  return requestClient.get('/cardRenewal/queryCardRenewal', { params });
}
/**
 * 新增卡密
 * @param params 
 * @returns 
 */
export async function addCardRenewal(params: any) {
  return requestClient.post('/cardRenewal/addCardRenewal', params);
}
/**
 * 删除卡密
 * @param id 
 * @returns 
 */
export async function delCardRenewal(id: number) {
  return requestClient.delete(`/cardRenewal/deleteCardRenewal/${id}`);
}
/**
 * 批量删除卡密
 * @param ids 
 * @returns 
 */
export async function delBatchRenewals(ids: any) {
  return requestClient.post(`/cardRenewal/delBatchRenewals`,ids);
}

/**
 * 更新卡密
 * @param params 
 * @returns 
 */
export async function updateCardRenewal(params: any) {
  return requestClient.put('/cardRenewal/updateCardRenewal', params);
}

/**
 * 使用续费卡密
 * @param params 
 * @returns 
 */
export async function useCardRenewal(params: any) {
  // 创建 FormData 对象
  const formData = new FormData();
  
  // 将 params 的键值对添加到 FormData
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      formData.append(key, params[key]);
    }
  }

  return requestClient.post('/cardRenewal/useCardRenewal', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
