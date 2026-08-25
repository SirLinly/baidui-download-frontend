import { requestClient } from '#/api/request';

/**
 * 查询卡密信息
 * @param params 
 * @returns 
 */
export async function queryUserKey(params: any) {
  return requestClient.get('/convert/queryCardInfo', { params });
}
