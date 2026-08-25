import { requestClient } from '#/api/request';

/**
 *  获取支付二维码
 * @param params any
 * @returns 
 */
export async function payQrCode(params: any) {
  return requestClient.get('/pay/qrCode', { params });
}

export async function payState(params: any) {
  return requestClient.get('/pay/payState', { params });
}

/**
 * 获取支付记录
 * @param params any
 * @returns 
 */
export async function payHistory(params: any) {
  return requestClient.get('/pay/payHistory', { params });
}
