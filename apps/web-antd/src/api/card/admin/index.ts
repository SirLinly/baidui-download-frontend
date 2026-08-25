import { requestClient } from '#/api/request';

/**
 *  查询订单列表
 * @param params any
 * @returns 
 */
export async function queryCard(params: any) {
  return requestClient.get('/card/queryCards', { params });
}
/**
 * 新增卡密
 * @param params 
 * @returns 
 */
export async function addCardKey(params: any) {
  return requestClient.post('/card/addCard/',params);
}
/**
 * 删除卡密
 * @param id 
 * @returns 
 */
export async function delCardKey(id: number) {
  return requestClient.delete(`/card/delCard/${id}`);
}
/**
 * 批量删除卡密
 * @param ids 
 * @returns 
 */
export async function delBatchCardKeys(ids: any) {
  return requestClient.post(`/card/delBatchCards`,ids);
}
/**
 * 更新卡密
 * @param params 
 * @returns 
 */
export async function updateCardKey(params: any) {
  return requestClient.put('/card/updateCard', params);
}

/**
 * 禁用卡密
 * @param params 
 * @returns 
 */
export async function isDisableCard(id: number) {
  return requestClient.put(`/card/isDisableCard/${id}`);
}

/**
 * 解绑用户
 * @param params 
 * @returns 
 */
export async function unbindUser(id: number) {
  return requestClient.put(`/card/unbindUser/${id}`);
}

/**
 * 加入黑名单
 * @param params 
 * @returns 
 */
export async function addBlack(id: number) {
  return requestClient.put(`/card/addBlack/${id}`);
}
