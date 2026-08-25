import { requestClient } from '#/api/request';

/**
 *  获取支付二维码
 * @param params any
 * @returns 
 */
export async function getStats() {
  return requestClient.get('/stats/getStats');
}

