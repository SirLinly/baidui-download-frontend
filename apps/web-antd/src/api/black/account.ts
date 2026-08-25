import { requestClient } from '#/api/request';


/**
 *  查询订单列表
 * @param params any
 * @returns 
 */
export async function queryPersonalRule(params: any) {
  return requestClient.get('/black/personal/query', { params });
}

/**
 * 修改状态
 * @param id 
 * @returns 
 */
export async function modifyPersonalRuleStatus(id: number) {
  return requestClient.put(`/black/personal/modifyStatus/${id}`);
}

/**
 * 删除
 * @param id 
 * @returns 
 */
export async function removePersonalRules(id: number) {
  return requestClient.delete(`/black/personal/remove/${id}`);
}
