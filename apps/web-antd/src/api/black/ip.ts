import { requestClient } from '#/api/request';

/**
 *  查询列表
 * @param params any
 * @returns 
 */
export async function queryIpRule(params: any) {
  return requestClient.get('/black/ip/query', { params });
}

/**
 * 修改状态
 * @param id 
 * @returns 
 */
export async function modifyIpRuleStatus(id: number) {
  return requestClient.put(`/black/ip/modifyStatus/${id}`);
}
/**
 * 删除
 * @param id 
 * @returns 
 */
export async function removeIpRules(id: number) {
  return requestClient.delete(`/black/ip/remove/${id}`);
}
